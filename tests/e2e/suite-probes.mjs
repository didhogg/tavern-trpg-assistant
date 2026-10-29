// 设置 › 诊断：M0–M2 探针、下拉控件与样式隔离（原冒烟测试内容）。
import { check, clickCenter, bodyPointerEvents, openDiagnostics, settle } from './helpers.mjs'

const modelText = (page) => page.getByTestId('select-model').innerText()
const listCount = (page) => page.getByRole('listbox').count()

async function selectTests(page, label) {
  const first = page.getByRole('combobox', { name: '测试下拉（8 项）' })
  const second = page.getByRole('combobox', { name: '测试下拉（3 项）' })
  await first.scrollIntoViewIfNeeded()

  for (const wait of [0, 150, 800]) {
    await clickCenter(page, first)
    await page.waitForTimeout(wait)
    await clickCenter(page, page.getByRole('option', { name: '3 环', exact: true }))
    await settle(page)
    check(`[${label}] 下拉打开后等 ${wait}ms 点选项，值变为「3 环」`, (await modelText(page)).includes('3 环 /'), await modelText(page))
    check(`[${label}] 选中后列表关闭且页面恢复可点击`, (await listCount(page)) === 0 && (await bodyPointerEvents(page)) === '')
    await clickCenter(page, first)
    await clickCenter(page, page.getByRole('option', { name: '戏法', exact: true }))
    await settle(page)
  }

  await clickCenter(page, first)
  await settle(page)
  await clickCenter(page, second)
  await settle(page)
  check(`[${label}] 打开第一个后点第二个：最多只有一个列表`, (await listCount(page)) <= 1, `列表数 ${await listCount(page)}`)
  if ((await listCount(page)) > 0) await page.keyboard.press('Escape')
  await settle(page)
  check(`[${label}] 上述操作后页面恢复可点击`, (await bodyPointerEvents(page)) === '')
  await clickCenter(page, second)
  await clickCenter(page, page.getByRole('option', { name: '金', exact: true }))
  await settle(page)
  check(`[${label}] 第二个下拉也能选中「金」`, (await modelText(page)).endsWith('/ 金'), await modelText(page))

  await first.focus()
  await page.keyboard.press('Enter')
  await settle(page)
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  await settle(page)
  check(`[${label}] 键盘可打开并选择`, (await listCount(page)) === 0 && /下拉当前值：(?!未选)/.test(await modelText(page)), await modelText(page))
  await page.keyboard.press('Enter')
  await settle(page)
  await page.keyboard.press('Escape')
  await settle(page)
  check(`[${label}] Esc 关闭后焦点回到触发按钮`, await first.evaluate((el) => el === el.getRootNode().activeElement))
}

export async function probeSuite(page, label, { width, height }) {
  await openDiagnostics(page)
  const diag = page.getByTestId('diagnostics')

  // M1 数据层自检：在真实浏览器内核（含 WebKit）里跑完存储、压缩、哈希、事务的主路径
  await page.getByRole('button', { name: '运行 M1 数据层自检' }).click()
  await page.getByText(/全部通过（\d+\/\d+ 步）|未通过：/).first().waitFor({ timeout: 60000 })
  const m1 = await diag.innerText()
  check(`[${label}] M1 数据层自检全部通过`, /全部通过（10\/10 步）/.test(m1), (m1.match(/未通过：[^\n]*/) ?? [''])[0])

  const m2Section = page.locator('section.probe').filter({ hasText: 'M2 数据自检' })
  await page.getByRole('button', { name: '运行 M2 数据自检' }).click()
  await m2Section.locator('.probe__summary').filter({ hasText: /全部通过|未通过/ }).waitFor({ timeout: 120000 })
  const m2 = await m2Section.innerText()
  check(`[${label}] M2 数据自检全部通过（含本地数据仓库下载）`, /全部通过（6\/6 步/.test(m2), (m2.match(/未通过：[^\n]*/) ?? [''])[0])

  await page.getByRole('button', { name: '写入测试注释到输入框' }).click()
  await page.getByRole('button', { name: '注入探针' }).click()
  await page.evaluate(() => window.__mockSend())
  const body = await diag.innerText()
  check(`[${label}] 注释探针判定通过`, /注释原样进入了请求/.test(body))
  check(`[${label}] 注入探针判定通过`, /注入文本进入了请求/.test(body))
  check(`[${label}] 判定后探针注入已自动清除`, (await page.evaluate(() => window.__mockInjected())).every((v) => v === ''), JSON.stringify(await page.evaluate(() => window.__mockInjected())))
  await page.getByRole('button', { name: '运行输入框测试' }).click()
  check(`[${label}] 输入框读写通过`, /写入、读回、恢复都正常/.test(await diag.innerText()))
  check(`[${label}] IndexedDB 探针运行`, /IndexedDB 第 \d+ 次启动读写正常/.test(await diag.innerText()))

  const box = await page.locator('.trpg-check input').first().boundingBox()
  check(`[${label}] 样式隔离（勾选框 18×18）`, box && Math.round(box.width) === 18 && Math.round(box.height) === 18, JSON.stringify(box))

  // 下拉不被裁切：宽屏先把窗口拖到视口底部，再打开下拉
  if (width > 480) {
    const head = page.locator('.trpg-side__brand')
    const hb = await head.boundingBox()
    await page.mouse.move(hb.x + 40, hb.y + 10)
    await page.mouse.down()
    await page.mouse.move(hb.x + 40, height - 40, { steps: 8 })
    await page.mouse.up()
    const win = await page.locator('.trpg-window').boundingBox()
    check(`[${label}] 窗口拖动后仍在屏幕内`, win.y >= 0 && win.y + win.height <= height + 1 && win.x >= 0, JSON.stringify(win))
  }
  const trigger = page.getByRole('combobox', { name: '测试下拉（8 项）' })
  await trigger.scrollIntoViewIfNeeded()
  await trigger.click()
  await page.waitForSelector('.trpg-select-content')
  const list = await page.locator('.trpg-select-content').boundingBox()
  check(`[${label}] 下拉列表完整落在屏幕内`, list.x >= 0 && list.y >= 0 && list.x + list.width <= width + 1 && list.y + list.height <= height + 1, JSON.stringify(list))
  await page.keyboard.press('Escape')
  await selectTests(page, label)
}
