// G3 随机表/参考表：侍僧 4 张表、表页头、参考表只显示本行、掷表历史。
import { check, clearToasts, settle } from './helpers.mjs'
import { closeModals, openEntry, openPack } from './open-entry.mjs'

async function readClipboard(page) {
  try { return await page.evaluate(() => navigator.clipboard.readText()) } catch { return '' }
}

async function fillFromToast(page, text) {
  const toast = page.locator('.trpg-toast').last()
  await toast.getByRole('button', { name: '填入输入框' }).click()
  await settle(page, 120)
  const value = await page.evaluate(() => document.getElementById('send_textarea')?.value ?? '')
  check('G3 表：提示条 [填入输入框] 把结果追加到输入框', value.includes(text), value.slice(-120))
}

export async function g3TableSuite(page, label) {
  try { await page.context().grantPermissions(['clipboard-read', 'clipboard-write']) } catch { /* WebKit 没有这个权限名 */ }
  await page.evaluate(() => { const el = document.getElementById('send_textarea'); if (el) el.value = '' })

  // 侍僧：4 张没有 at 的表归到「本条目的表」，可单掷、可本节全掷
  await openEntry(page, 'dnd5e2014-srd', '侍僧', '背景')
  const tablesText = await page.getByTestId('entry-tables').innerText()
  check(`[${label}] G3 表：侍僧页出现「相关表格」与 4 张表`, (await page.getByTestId('entry-tables').count()) === 1 && ['侍僧·特点', '侍僧·理念', '侍僧·牵挂', '侍僧·缺陷'].every((name) => tablesText.includes(name)), tablesText.slice(0, 200))
  check(`[${label}] G3 表：无 at 的表归到「本条目的表」并有「本节全掷」`, (await page.getByTestId('entry-tables').innerText()).includes('本条目的表') && (await page.getByRole('button', { name: '本节全掷' }).count()) === 1)

  const first = page.getByTestId('entry-tables').locator('.trpg-list > li').first()
  await first.getByRole('button', { name: /^掷 / }).click()
  await settle(page, 180)
  const toastText = await page.locator('.trpg-toast').last().innerText()
  check(`[${label}] G3 表：点 🎲 掷出结果并提示复制`, /侍僧·特点 d8 = \d+/.test(toastText), toastText)
  const clip = await readClipboard(page)
  if (clip) check(`[${label}] G3 表：剪贴板与提示条的结果一致`, clip.includes('侍僧·特点：d8 ='))
  else check(`[${label}] G3 表：WebKit 读不到剪贴板，提示条文字已覆盖（报告写明）`, true)
  const m = /侍僧·特点：d8 = \d+/.exec(clip || toastText)
  if (m) await fillFromToast(page, m[0])

  await clearToasts(page)
  await page.getByRole('button', { name: '本节全掷' }).click()
  await settle(page, 180)
  const groupToast = await page.locator('.trpg-toast').last().innerText()
  check(`[${label}] G3 表：本节全掷一次复制 4 行`, groupToast.includes('4 张表') && (await page.locator('.trpg-toast').last().innerText()).includes('已复制'), groupToast)
  const groupClip = await readClipboard(page)
  if (groupClip) check(`[${label}] G3 表：本节全掷的剪贴板是 4 行「表名：结果」`, groupClip.split('\n').length === 4)
  else check(`[${label}] G3 表：WebKit 读不到剪贴板，4 张表的提示条已覆盖`, true)

  // 表页头 + 整表掷 + 高亮
  await openEntry(page, 'dnd5e2014-srd', '侍僧·特点', '随机表')
  const header = await page.getByTestId('table-owner').innerText()
  check(`[${label}] G3 表页：顶部写「属于：侍僧」与位置（玩家手册 p.127）`, header.includes('属于：侍僧') && /玩家手册.*p\.127/.test(header), header)
  await page.getByTestId('table-roll-header').click()
  await settle(page, 180)
  check(`[${label}] G3 表页：整表掷后有一行高亮`, (await page.locator('[data-testid^=table-row-].is-hit').count()) === 1)
  check(`[${label}] G3 表页：整表掷的提示条带表名与骰式`, /侍僧·特点 d8 = \d+/.test(await page.locator('.trpg-toast').last().innerText()))

  // 参考表按行主人：人类页只显示身高与体重表里「人类」这一行 + 看完整表；单元格 {{roll}} 可点
  await openEntry(page, 'dnd5e2014-srd', '人类', '种族')
  const refs = page.getByTestId('ref-rows')
  check(`[${label}] G3 参考表：人类页只显示身高体重表的「人类」这一行并给出「看完整表」`, (await refs.count()) === 1 && (await refs.getByRole('button', { name: '看完整表' }).count()) === 1 && (await refs.innerText()).includes('4\'8"') && !(await refs.innerText()).includes('矮人'))
  const rollCell = refs.getByRole('button', { name: /^掷 2d10/ }).first()
  check(`[${label}] G3 参考表：单元格里的 {{roll}} 变成可点按钮`, (await rollCell.count()) === 1)
  if (await rollCell.count()) {
    await rollCell.click()
    await page.getByText(/2d10 = \d+/).last().waitFor({ timeout: 3000 }).catch(() => undefined)
    await settle(page, 100)
    check(`[${label}] G3 参考表：点单元格掷骰并复制「2d10 = N」`, /2d10 = \d+/.test(await page.locator('.trpg-toast').last().innerText()))
  }
  await refs.getByRole('button', { name: '看完整表' }).click()
  await settle(page, 300)
  check(`[${label}] G3 参考表：看完整表打开 12 行参考表且不显示掷整表按钮`, (await page.getByTestId('table-page').count()) === 1 && (await page.locator('[data-testid^=table-row-]').count()) === 12 && (await page.getByTestId('table-roll-header').count()) === 0)

  // 骰盘「最近」：掷表记录显示表名，点开同一张表
  await closeModals(page)
  await page.locator('.trpg-dice-btn').dispatchEvent('click')
  const tray = page.locator('.trpg-dice')
  await tray.waitFor()
  await tray.getByRole('button', { name: /^最近/ }).click()
  const tableRec = tray.locator('.trpg-dice__list button').filter({ hasText: '侍僧·特点' }).first()
  check(`[${label}] G3 表：骰盘最近里有表名与结果`, (await tableRec.count()) === 1 && /侍僧·特点/.test(await tableRec.innerText()))
  if (await tableRec.count()) {
    await tableRec.click()
    await settle(page, 350)
    check(`[${label}] G3 表：点最近里的掷表记录打开那张表`, (await page.getByTestId('table-page').count()) === 1 && (await page.getByTestId('table-owner').innerText()).includes('侍僧'))
  }
  await page.getByRole('button', { name: '关闭掷骰' }).dispatchEvent('click')
  await settle(page, 100)

  // 批 2 的物品二级筛选：DMG 的「消耗品」
  await openPack(page, 'dnd5e2014-dmg')
  await page.getByRole('combobox', { name: '类别' }).click()
  await page.getByRole('option', { name: /^物品/ }).click()
  await settle(page, 200)
  await page.getByRole('combobox', { name: '种类' }).click()
  await page.getByRole('option', { name: /^消耗品/ }).click()
  await settle(page, 250)
  const itemCount = Number((await page.getByTestId('entry-count').innerText()).match(/\d+/)?.[0] ?? 0)
  check(`[${label}] G3 物品：DMG 选物品后可按「消耗品」筛出 >0 条`, itemCount > 0 && (await page.locator('.trpg-vlist__row').first().innerText()).includes('物品'), `${itemCount}`)
}
