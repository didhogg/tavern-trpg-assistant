// P5.5 §16.7 待定项（驾驶员 2026-11-13 批准）：
//   第 1 条 我的库只导入了一种语言的包：写明没找到另一种语言版（不提示下载）；
//   第 5 条 再次编辑已有房规：默认直接改那一条（不再多出一条），可撤销；也能另存一条新的；
//   第 2 条 正文：文字段有骰子 / 加粗工具栏；小标题段能无损转的用 Markdown 改；下面一排加一段（小标题段 / 列表 / 表格，作者转换器生成）；
//   第 3 条 设置 → 库 → 全局编辑 / 覆盖 换成覆盖列表。
// 用法：SKIP_BUILD=1 node tests/e2e/library/p55-ui-7.mjs（截图 work/e2e-lib/p55-ui-shots/7/）
import { check, failures, settle } from '../helpers.mjs'
import { openLibrary, P } from './p55-ui-common.mjs'

const { ctx, page, server, shots, tab, closeAll, svc, realErrors } = await openLibrary('7')
const main = () => page.getByTestId('editor-main')
const openFireball = async () => {
  await page.getByTestId('shelf-search').fill('玩家手册')
  await settle(page, 600)
  await page.locator('.trpg-shelf__row .lib-name').first().click()
  await page.waitForSelector('[data-testid="pack-page"]')
  await page.locator('[data-testid="pack-page"] input[type="search"]').fill('火球术')
  await page.locator('.lib-list__row', { hasText: '火球术' }).first().click({ timeout: 120000 })
  await page.waitForSelector('.lib-dtools')
  await settle(page, 600)
}
const openHouseEditor = async () => {
  await openFireball()
  await page.getByTestId('entry-edit').click()
  await page.waitForSelector('[data-testid="editor"] [data-testid="origin-pane"]')
  await settle(page, 1500)
}
/** 火球术现在生效的是什么、环节几；这一条挂了几条房规。 */
const state = () => page.evaluate(async (P) => {
  const st = eval(P)._s
  const lib = st.get('app').svc().backend.library
  await lib.brewQueue.settled()
  const c = st.get('library').campaignLib
  // 按官方条目的编号认（第一次按名字找到后记下）：另存的新房规会叫「火球术（PHB）」
  window.__fireball ??= (await lib.scoped.query(c, 'spell', { source: 'PHB', mode: 'browse' })).find((r) => r.item.name === '火球术')?.ref.hash
  const ref = { set: 'cn-official', prop: 'spell', hash: window.__fireball }
  const d = await lib.scoped.detail(c, ref, { browse: true })
  const links = (await lib.scoped.manage.houseRules()).filter((l) => l.target.set === ref.set && l.target.hash === ref.hash)
  return { kind: d.version.altId.split(':')[0], level: d.item.level, name: d.item.name, houseRules: links.length }
}, P)
const saveHouse = async (level, mode) => {
  await openHouseEditor()
  await main().locator('[data-field="level"] input').fill(String(level))
  await settle(page, 800)
  await page.getByTestId('editor-done').click()
  await page.waitForSelector('[data-testid="save-page"]')
  await settle(page, 1500)
  if (mode) await page.locator('[data-testid="save-house-mode"] .trpg-seg button', { hasText: mode }).click()
  await settle(page, 300)
}

// ── 第 5 条：再次编辑已有的房规 ──
await saveHouse(4)
const firstHasMode = await page.getByTestId('save-house-mode').count()
await page.getByTestId('save-go').click()
await page.locator('.trpg-toast', { hasText: '已保存房规' }).waitFor()
await closeAll(); await settle(page, 600)
const s1 = await state()
check('第一次改：没有已有房规时不出现选择；存成房规（环节 4，一条）', firstHasMode === 0 && s1.kind === 'house' && s1.level === 4 && s1.houseRules === 1, JSON.stringify({ firstHasMode, s1 }))

await saveHouse(5)
await page.screenshot({ path: `${shots}/1-house-replace.png` })
// C3：再改已有房规，只有真改了的那一项（页码、basicRules 这些作者合并不抄的字段不算「改过」）
const reTitle = await page.getByTestId('save-diff-title').innerText()
check('再改已有房规：预览只列真改了的（中文：和原件比改了 1 项，没有页码 / basicRules 的假「改过」）', /中文：和原件比改了 1 项/.test(reTitle), reTitle)
const modeText = await page.getByTestId('save-house-mode').innerText()
const pressed = await page.locator('[data-testid="save-house-mode"] .trpg-seg button[aria-pressed="true"]').innerText().catch(() => '')
const levelHidden = (await page.getByTestId('save-level').count()) === 0
check('再改一次：预览页写明「已经有你的房规，用在几处」，默认「直接改这条」，不用再选作用于', /已经有你的房规/.test(modeText) && /直接改这条/.test(pressed) && levelHidden && /跟着变/.test(modeText), JSON.stringify({ modeText, pressed, levelHidden }))
await page.getByTestId('save-go').click()
const toast = page.locator('.trpg-toast', { hasText: '已改好房规' })
await toast.waitFor()
await toast.getByRole('button', { name: '撤销' }).click().catch(() => null)
await closeAll(); await settle(page, 600)
const s2 = await state()
check('直接改 → 撤销：还是那一条房规（不多出一条），退回上一版（环节 4）', s2.kind === 'house' && s2.houseRules === 1 && s2.level === 4, JSON.stringify(s2))

await saveHouse(6)
const replacedNow = await page.getByTestId('save-go').click().then(() => page.locator('.trpg-toast', { hasText: '已改好房规' }).waitFor()).then(() => true)
// C2：详情页显示「更新中」，后台整理完自己换成新的（不用各处去等）
const pendingShown = await page.getByTestId('entry-pending').waitFor({ timeout: 10000 }).then(() => true, () => false)
await page.getByTestId('entry-pending').waitFor({ state: 'detached', timeout: 90000 }).catch(() => null)
await settle(page, 1500)
const detailNow = await page.locator('.lib-dbody').first().innerText().catch(() => '')
await page.screenshot({ path: `${shots}/0-detail-updated.png` })
// 这一页是从书里原件那一行点进来的，显示的是点中的版本（原件），房规标「生效中」
check('存完：详情页先标「更新中」，整理完自己去掉、重读（房规仍标生效中）', pendingShown && (await page.getByTestId('entry-pending').count()) === 0 && /生效中/.test(detailNow), detailNow.replace(/\n/g, ' | ').slice(0, 160))
await closeAll(); await settle(page, 600)
const s3 = await state()
check('直接改（不撤销）：仍是一条房规，环节 6', replacedNow && s3.kind === 'house' && s3.houseRules === 1 && s3.level === 6, JSON.stringify(s3))

// C2：存完马上（不等后台整理）再打开编辑器 → 拿到的是刚存的
await saveHouse(8)
await page.getByTestId('save-go').click()
await page.locator('.trpg-toast', { hasText: '已改好房规' }).waitFor()
await closeAll()
await openHouseEditor()
const freshLevel = await main().locator('[data-field="level"] input').inputValue()
const stillPending = await page.evaluate((P) => eval(P)._s.get('app').svc().backend.library.brewQueue.busy?.('cn') ?? null, P).catch(() => null)
check('存完马上再打开编辑器（后台还没整理完也行）：从刚存的环节 8 开始改', freshLevel === '8', JSON.stringify({ freshLevel, stillPending }))
await closeAll(); await settle(page, 600)
const s3b = await state()
check('还是一条房规（环节 8）', s3b.houseRules === 1 && s3b.level === 8, JSON.stringify(s3b))

await saveHouse(7, '另存一条新的')
const levelShown = (await page.getByTestId('save-level').count()) === 1
const hint = await page.getByTestId('save-house-hint').innerText()
await page.screenshot({ path: `${shots}/2-house-new.png` })
await page.getByTestId('save-go').click()
await page.locator('.trpg-toast', { hasText: '已保存房规' }).waitFor()
await closeAll(); await settle(page, 600)
const s4 = await state()
check('选「另存一条新的」：要选作用于、写明原来那条不动；存完有两条房规', levelShown && /原来那条不动/.test(hint) && s4.houseRules === 2, JSON.stringify({ levelShown, hint, s4 }))

// ── 第 2 条：正文 ──
await openHouseEditor()
const startLevel = await main().locator('[data-field="level"] input').inputValue()
check('刚存完再打开编辑器：从现在生效的那条房规开始改（环节 7），不是整理前的旧样子', startLevel === '7', startLevel)
const ents = main().locator('[data-field="entries"]')
const textBoxes = ents.locator('.lib-block textarea.lib-para')
await ents.getByTestId('block-dice').first().click()
await settle(page, 300)
const withDice = await textBoxes.first().inputValue()
check('文字段的工具栏：点「骰子」插入作者的骰子标签', /\{@dice 1d6\}/.test(withDice), withDice.slice(-60))
const higher = main().locator('[data-field="entriesHigherLevel"] [data-testid="block-md"] textarea')
await higher.waitFor({ timeout: 30000 })
const md0 = await higher.inputValue()
check('小标题段（升环施法）能无损来回转：给 Markdown 框，标题写成 ####', /^#### /.test(md0), md0.slice(0, 80))
await higher.fill(`${md0}\n\n- 额外一条：火焰会点燃易燃物。`)
await main().locator('[data-field="level"] input').click()
await settle(page, 1500)
const before = await ents.getByTestId('block-md').count()
await ents.getByTestId('block-add-list').click()
await page.waitForFunction((n) => document.querySelector('#trpg-assistant-root').shadowRoot.querySelectorAll('[data-testid="editor-main"] [data-field="entries"] [data-testid="block-md"]').length > n, before, { timeout: 30000 })
await settle(page, 600)
const newMd = await ents.getByTestId('block-md').last().locator('textarea').inputValue()
check('「加一段 → 列表」：作者转换器生成一段列表，接着用 Markdown 改', /^- 第一项/.test(newMd), newMd)
await page.screenshot({ path: `${shots}/3-entries-blocks.png` })
await page.getByTestId('editor-done').click()
await page.waitForSelector('[data-testid="save-page"]')
await settle(page, 2000)
const diff = await page.locator('[data-testid="save-diff"]').first().innerText().catch(() => '')
// 要存的那一条（预览页拿到的），看 Markdown 转回来的结构
const after = await page.evaluate((P) => { const m = eval(P)._s.get('modal'); return JSON.parse(JSON.stringify(m.stack[m.stack.length - 1].props.ctx.main.after)) }, P)
const hl = after.entriesHigherLevel?.[0]
const lastBlock = after.entries?.[after.entries.length - 1]
check('Markdown 转回了作者正文：升环施法里多了一个列表（标题、中文版英文名保留）；正文末尾多了一段列表；预览页列出这两项改了', hl?.name === '升环施法' && hl?.ENG_name === 'At Higher Levels' && hl.entries.some((e) => e?.type === 'list' && /额外一条/.test(JSON.stringify(e))) && lastBlock?.type === 'list' && lastBlock.items?.[0] === '第一项' && /升环施法/.test(diff), JSON.stringify({ hl, lastBlock, diff }).slice(0, 500))
await page.screenshot({ path: `${shots}/4-entries-save.png` })
await closeAll(); await settle(page, 400)

// ── 第 1 条：只导入了一种语言的包 ──
await svc(async (s) => s.backend.library.custom.createPack('cn', { json: 'P55ONELANG', full: '只有中文的包', abbreviation: 'OL' }))
await page.getByTestId('shelf-search').fill('')
await tab('我的库')
await page.waitForSelector('[data-testid="mylib-row"]')
await settle(page, 800)
const row = page.locator('[data-testid="mylib-row"]', { hasText: '只有中文的包' })
const one = await row.getByTestId('mylib-onelang').innerText().catch(() => '')
const noDownload = (await page.locator('[data-testid="mylib-tab"]', { hasText: '下载' }).count()) === 0
await page.screenshot({ path: `${shots}/5-mylib-onelang.png` })
check('我的库：只导入了中文版的包写明「只导入了中文版，没找到这个包的 English 版」，不提示下载', /只导入了中文版，没找到这个包的 English 版/.test(one) && noDownload, one)

// ── 第 3 条：设置 → 库 → 全局编辑 / 覆盖 ──
await page.locator('.trpg-window nav').getByRole('button', { name: '设置' }).click()
await page.getByTestId('settings-library').click()
await page.locator('.lib-top .trpg-seg button', { hasText: '全局编辑' }).click()
await page.waitForSelector('[data-testid="lib-edits"] [data-testid="override-row"]', { timeout: 30000 })
await settle(page, 600)
await page.screenshot({ path: `${shots}/6-settings-overrides.png` })
const ovText = await page.getByTestId('lib-edits').innerText()
check('设置 → 全局编辑 / 覆盖：是新的覆盖列表（种类、作用于、看改了什么、复原），列出火球术的房规', /火球术/.test(ovText) && /房规/.test(ovText) && /看改了什么/.test(ovText) && /复原/.test(ovText), ovText.replace(/\n/g, ' | ').slice(0, 300))

check('页面没有未处理的错误（断网预期的除外）', realErrors().length === 0, realErrors().slice(0, 2).join(' | '))
await ctx.close()
server.close()
console.log(failures.length ? `FAIL ${failures.length}` : 'ALL PASS')
process.exit(failures.length ? 1 : 0)
