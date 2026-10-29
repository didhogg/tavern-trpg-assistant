// P3：页头保存、存档抽屉、导出与导入、只读窗口、没有聊天。
import { writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { check, gotoPage, modalCount, settle } from './helpers.mjs'
import { callStore, makeDirty } from './store.mjs'

async function openDrawer(page, narrow) {
  if (narrow) {
    await page.getByRole('button', { name: '助手 的更多操作' }).click()
    await page.getByRole('menuitem', { name: '存档' }).click()
  } else await page.getByTestId('save-chip').click()
  await page.getByTestId('save-drawer').waitFor()
  await settle(page, 350)
}

const rowOf = (page, name) => page.getByTestId(`save-${name}`)
const menuOf = (page, name) => page.getByRole('button', { name: `${name} 的更多操作` })

export async function savesSuite(page, label, { width, url }) {
  const narrow = width <= 480
  await gotoPage(page, '首页')

  // 页头保存
  await makeDirty(page)
  const saveBtn = page.getByTestId('save-button')
  await saveBtn.waitFor()
  check(`[${label}] 有未保存改动：页头出现「● 保存存档」`, await saveBtn.isVisible())
  await saveBtn.click()
  await page.getByText('已保存存档', { exact: true }).waitFor()
  check(`[${label}] 点「● 保存存档」：提示「已保存存档」，按钮消失`, (await page.getByTestId('save-button').count()) === 0)
  await makeDirty(page)
  await page.locator('.trpg-content').click({ position: { x: 5, y: 5 } })
  await page.keyboard.press('ControlOrMeta+s')
  await settle(page, 400)
  check(`[${label}] ⌘/Ctrl+S 保存`, (await page.getByTestId('save-button').count()) === 0)

  await openDrawer(page, narrow)
  const drawer = await page.locator('.trpg-modal__card').boundingBox()
  check(`[${label}] 存档抽屉：${narrow ? '窄屏整页' : '右侧宽 440px'}，只有一个弹窗`, (await modalCount(page)) === 1 && (narrow ? Math.round(drawer.width) === width : Math.round(drawer.width) === 440), JSON.stringify(drawer))
  check(`[${label}] 当前存档标「当前」，没有读取按钮`, (await rowOf(page, '测试战役').locator('.trpg-badge', { hasText: '当前' }).count()) === 1 && (await rowOf(page, '测试战役').getByRole('button', { name: '读取' }).count()) === 0)

  // 分支存档（弹出卡）
  await page.getByRole('button', { name: '分支存档' }).click()
  const branchName = page.getByRole('textbox', { name: '新存档名' })
  check(`[${label}] 分支存档卡：默认名「测试战役 分支」`, (await branchName.inputValue()) === '测试战役 分支')
  await branchName.fill('分支一')
  await branchName.press('Enter')
  await page.getByText('已切换到「分支一」').waitFor()
  await settle(page, 300)
  check(`[${label}] 创建并切换：列表出现两个存档，当前是「分支一」`, (await page.locator('.trpg-save').count()) === 2 && (await rowOf(page, '分支一').locator('.trpg-badge', { hasText: '当前' }).count()) === 1)

  // 改名、备注
  await menuOf(page, '测试战役').click()
  await page.getByRole('menuitem', { name: '改名' }).click()
  const rename = page.getByRole('textbox', { name: '存档名' })
  await rename.fill('旧存档')
  await page.keyboard.press('Enter')
  await settle(page, 300)
  check(`[${label}] 改名：行内输入，回车保存`, (await rowOf(page, '旧存档').count()) === 1)
  await menuOf(page, '旧存档').click()
  await page.getByRole('menuitem', { name: '备注' }).click()
  await page.getByRole('textbox', { name: '备注' }).fill('第一章的存档')
  await page.getByRole('button', { name: '保存', exact: true }).click()
  await settle(page, 300)
  check(`[${label}] 备注：保存后显示在行下`, (await rowOf(page, '旧存档').innerText()).includes('第一章的存档'))

  // 删除 → 撤销 → 再删除 → 彻底删除（确认页在抽屉内）
  await menuOf(page, '旧存档').click()
  await page.getByRole('menuitem', { name: '删除' }).click()
  await page.getByText('已删除「旧存档」').waitFor()
  check(`[${label}] 删除：移入最近删除，提示条带「撤销」`, (await rowOf(page, '旧存档').count()) === 0 && (await page.getByRole('button', { name: '撤销', exact: true }).isVisible()))
  await page.getByRole('button', { name: '撤销', exact: true }).click()
  await settle(page, 400)
  check(`[${label}] 撤销：存档回到列表`, (await rowOf(page, '旧存档').count()) === 1)
  await menuOf(page, '旧存档').click()
  await page.getByRole('menuitem', { name: '删除' }).click()
  await settle(page, 400)
  await page.getByRole('button', { name: /最近删除 1/ }).click()
  await page.getByRole('button', { name: '彻底删除', exact: true }).first().click()
  await settle(page)
  check(`[${label}] 彻底删除：确认页在抽屉内换页，不叠加弹窗`, (await modalCount(page)) === 1 && (await page.getByText('将被永久删除，无法恢复。').isVisible()))
  await page.keyboard.press('Escape')
  await settle(page)
  check(`[${label}] Esc 取消确认回到抽屉`, (await page.getByTestId('save-drawer').isVisible()) && (await page.getByRole('button', { name: /最近删除 1/ }).count()) === 1)
  await page.getByRole('button', { name: '彻底删除', exact: true }).first().click()
  await page.getByRole('button', { name: '彻底删除', exact: true }).last().click()
  await settle(page, 400)
  check(`[${label}] 确认后彻底删除，「最近删除」折叠区消失`, (await page.getByRole('button', { name: /最近删除/ }).count()) === 0)

  // 再建一个存档用于读取：先分支，再改回
  await page.getByRole('button', { name: '分支存档' }).click()
  await page.getByRole('textbox', { name: '新存档名' }).fill('分支二')
  await page.getByRole('textbox', { name: '新存档名' }).press('Enter')
  await page.getByText('已切换到「分支二」').waitFor()
  await settle(page, 300)
  await page.locator('.trpg-modal__close').click()
  await makeDirty(page, '读取前的改动')
  await openDrawer(page, narrow)
  await rowOf(page, '分支一').getByRole('button', { name: '读取' }).click()
  await settle(page)
  check(`[${label}] 有未保存改动时读取：抽屉内换成三选一确认页`, (await modalCount(page)) === 1 && (await page.getByRole('button', { name: '保存存档后读取' }).isVisible()) && (await page.getByRole('button', { name: '不保存存档，直接读取' }).isVisible()))
  await page.getByRole('button', { name: '取消', exact: true }).click()
  await settle(page, 300)
  check(`[${label}] 取消：仍在抽屉，当前存档没变`, await rowOf(page, '分支二').locator('.trpg-badge', { hasText: '当前' }).isVisible())
  await rowOf(page, '分支一').getByRole('button', { name: '读取' }).click()
  await page.getByRole('button', { name: '保存存档后读取' }).click()
  await page.getByText('已读取「分支一」').waitFor()
  await settle(page, 400)
  check(`[${label}] 保存存档后读取：弹窗关闭，当前存档变为「分支一」`, (await modalCount(page)) === 0 && (await callStore(page, 'campaign', (s) => s.currentSave?.name)) === '分支一')
  await openDrawer(page, narrow)
  check(`[${label}] 读取前自动写入自动存档（折叠区「自动存档」出现）`, (await page.getByRole('button', { name: /自动存档 \d+/ }).count()) === 1)

  // 导出
  await menuOf(page, '分支一').click()
  await page.getByRole('menuitem', { name: '导出' }).click()
  await page.getByRole('button', { name: '导出', exact: true }).waitFor()
  await settle(page)
  check(`[${label}] 导出：抽屉先关闭，再打开导出窗口（只有一个弹窗）`, (await modalCount(page)) === 1 && (await page.getByTestId('save-drawer').count()) === 0)
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: '导出', exact: true }).click()])
  const exported = join(tmpdir(), `e2e-${label.replace(/\//g, '-')}.trpgsave`)
  await download.saveAs(exported)
  check(`[${label}] 导出文件名以 .trpgsave 结尾`, download.suggestedFilename().endsWith('.trpgsave'), download.suggestedFilename())
  await page.getByText(/已导出「/).waitFor()
  check(`[${label}] 导出后弹窗关闭并提示`, (await modalCount(page)) === 0)

  // 导入：存档文件 → 预览 → 导入
  await openDrawer(page, narrow)
  await page.locator('input[type=file]').setInputFiles(exported)
  await page.getByTestId('import-save').waitFor()
  await settle(page)
  check(`[${label}] 导入存档文件：抽屉关闭，打开导入窗口并识别出 1 个存档`, (await modalCount(page)) === 1 && (await page.getByText('已识别：存档文件 · 1 个存档').isVisible()))
  await page.getByRole('button', { name: '导入 1 个' }).click()
  await page.getByText('已导入 1 个存档').waitFor()
  await openDrawer(page, narrow)
  check(`[${label}] 导入后列表出现「分支一（导入）」`, (await rowOf(page, '分支一（导入）').count()) === 1)

  // 错误文件
  const junk = join(tmpdir(), `junk-${label.replace(/\//g, '-')}.trpgsave`)
  writeFileSync(junk, '这不是存档文件')
  await page.locator('input[type=file]').setInputFiles(junk)
  await page.getByRole('alert').waitFor()
  check(`[${label}] 错误文件：显示原因，提供「选择其他文件」与「关闭」`, (await page.getByRole('alert').innerText()).includes('无法识别') && (await page.getByRole('button', { name: '选择其他文件' }).isVisible()))
  await page.getByRole('button', { name: '关闭', exact: true }).first().click()
  await settle(page)

  // 拖放导入
  await openDrawer(page, narrow)
  const dt = await page.evaluateHandle(() => { const d = new DataTransfer(); d.items.add(new File(['拖进来的不是存档'], 'drop.trpgsave')); return d })
  await page.getByTestId('save-drawer').dispatchEvent('dragover', { dataTransfer: dt })
  check(`[${label}] 拖入文件：抽屉显示「松开以导入」`, (await page.getByTestId('save-drawer').getAttribute('data-dragging')) === 'true')
  await page.getByTestId('save-drawer').dispatchEvent('drop', { dataTransfer: dt })
  await page.getByRole('alert').waitFor()
  check(`[${label}] 松开后打开导入窗口并识别（这里是无法识别的文件，显示原因）`, (await page.getByTestId('import-filename').innerText()) === 'drop.trpgsave' && (await modalCount(page)) === 1)
  await page.getByRole('button', { name: '关闭', exact: true }).first().click()
  await settle(page)

  // 没有聊天
  await page.evaluate(() => { const c = window.SillyTavern.getContext(); c.characterId = undefined; return c.eventSource.emit('chat_id_changed') })
  await gotoPage(page, '首页')
  await page.getByTestId('no-chat').waitFor()
  check(`[${label}] 未打开聊天：首页提示先打开聊天，横幅不可点`, (await page.getByTestId('no-chat').innerText()).includes('请先在酒馆中打开一个聊天') && (await page.getByTestId('start-banner').count()) === 0)
  await page.evaluate(() => { const c = window.SillyTavern.getContext(); c.characterId = 0; return c.eventSource.emit('chat_id_changed') })
  await page.getByTestId('banner-title').waitFor()
  check(`[${label}] 回到聊天：战役数据自动载入`, (await page.getByTestId('banner-title').innerText()) === '分支一')
  const homeBox = await page.evaluate(() => {
    const root = document.getElementById('trpg-assistant-root').shadowRoot
    const banner = root.querySelector('.trpg-banner')
    const cell = root.querySelector('.trpg-cell')
    return { bannerH: banner.getBoundingClientRect().height, bannerPos: getComputedStyle(banner).position, cellBorder: getComputedStyle(cell).borderTopWidth, cellMinH: cell.getBoundingClientRect().height }
  })
  check(`[${label}] 首页样式在位：横幅高度受限（≤200px）、概览格有边框`, homeBox.bannerH > 100 && homeBox.bannerH <= 200 && homeBox.bannerPos === 'relative' && homeBox.cellBorder === '1px' && homeBox.cellMinH >= 88, JSON.stringify(homeBox))

  // 第二个窗口：只读
  const second = await page.context().newPage()
  await second.goto(url)
  await second.locator('.trpg-ball').click()
  await second.getByRole('button', { name: '只读' }).waitFor({ timeout: 30000 }).catch(() => undefined)
  const roBadge = await second.getByRole('button', { name: '只读' }).count()
  const roToast = await second.getByText('另一个窗口正在使用助手，这里只能查看').count()
  check(`[${label}] 第二个窗口进入只读：页头有「只读」徽章并提示一次`, roBadge === 1 && roToast >= 1, `徽章 ${roBadge}，提示 ${roToast}`)
  await second.close()
  await gotoPage(page, '首页')
}
