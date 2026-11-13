// P5.5 界面第 4 批（u7-10 编辑器）：左栏中文表单 · 右栏 English / JSON / 预览；≠ 标两边不一样；从中文版填入空着的；
// [完成] 两边一起存（中文的英文名自动写）；✎ 再打开两边对上；草稿自动存、我的库顶上 [继续]；窄屏上下两栏。
// 用法：SKIP_BUILD=1 node tests/e2e/library/p55-ui-4.mjs（截图 work/e2e-lib/p55-ui-shots/4/）
import { check, failures, settle } from '../helpers.mjs'
import { openLibrary, P } from './p55-ui-common.mjs'

const { ctx, page, server, shots, tab, closeAll, realErrors } = await openLibrary('4')
await page.evaluate(async (P) => { const lib = eval(P)._s.get('app').svc().backend.library; await lib.custom.createPack('cn', { json: 'PIRATE', full: '海盗战役', abbreviation: 'PIR' }, { rule: 'dnd5e2014' }); await lib.bilingual.addLanguage('cn', 'pirate') }, P)
await tab('我的库')
const openPackUi = async () => { await page.locator('[data-testid="mylib-open"]', { hasText: '海盗战役' }).first().click(); await page.waitForSelector('[data-testid="pack-page"]') }
await openPackUi()
await page.getByTestId('pack-new-entry').click()
await page.getByTestId('type-common').filter({ hasText: /^法术$/ }).first().click()
await page.getByTestId('start-next').click()
await page.waitForSelector('[data-testid="editor"] [data-testid="entry-form"]')
await settle(page, 800)
await page.screenshot({ path: `${shots}/1-editor-blank.png` })
const L = page.getByTestId('editor-main')
const R = page.getByTestId('editor-side')
const field = (pane, name) => pane.locator(`[data-field="${name}"]`).first()
const pickSel = async (pane, name, text) => { await field(pane, name).locator('.trpg-select-trigger').first().click(); await page.locator('.trpg-select-item', { hasText: text }).first().click(); await settle(page, 200) }
const labels = await L.locator('.lib-tfield > label').allInnerTexts()
check('左栏中文表单：必填项在前、用作者中文名（环节、学派、施法时间…）；没有「英文名」', labels.some((t) => /环节/.test(t)) && labels.some((t) => /学派/.test(t)) && !labels.some((t) => /英文名/.test(t)), labels.slice(0, 8).join(' | '))

// 左栏填中文
await field(L, 'name').locator('input').fill('火焰鹦鹉')
await field(L, 'level').locator('input').fill('1')
await pickSel(L, 'school', '塑能')
// 右栏 English：填名字和不一样的环节
await field(R, 'name').locator('input').fill('Fire Parrot')
await field(R, 'level').locator('input').fill('2')
await page.waitForSelector('[data-testid="editor"] .lib-mark')
await settle(page, 700)
await page.screenshot({ path: `${shots}/2-editor-both-mismatch.png` })
const mark = await L.locator('[data-field="level"] .lib-mark').count()
check('右栏 English 能改；环节两边不一样标 ≠', mark === 1)

// 从中文版填入空着的：学派填到英文
await page.getByTestId('editor-fill').click()
await page.waitForSelector('[data-testid="fill-page"]')
await settle(page, 300)
await page.screenshot({ path: `${shots}/3-fill.png` })
const fillText = await page.getByTestId('fill-page').innerText()
await page.getByTestId('fill-go').click()
await page.waitForSelector('[data-testid="editor"]')
await settle(page, 500)
check('从中文版填入：先列出改哪几项（学派等），填完回到编辑器', /学派|school/i.test(fillText), fillText.replace(/\n/g, ' | ').slice(0, 200))

// JSON 标签：和左栏同步
await R.locator('.trpg-seg button', { hasText: 'JSON' }).click()
await settle(page, 500)
const jsonTop = await R.locator('.cm-content').innerText()
await page.screenshot({ path: `${shots}/4-json-tab.png` })
check('右栏 JSON：是左栏这一条，和表单同步', /火焰鹦鹉/.test(jsonTop), jsonTop.slice(0, 120))
// 预览标签：作者渲染
await R.locator('.trpg-seg button', { hasText: '预览' }).click()
await page.waitForSelector('[data-testid="editor-side"] [data-testid="embedded-author"]', { timeout: 60000 }).catch(() => null)
await settle(page, 600)
await page.screenshot({ path: `${shots}/5-preview-tab.png` })
check('右栏预览：作者渲染（只能看）', await R.locator('[data-testid="embedded-author"]').count() === 1)

// 草稿自动存
await page.waitForSelector('[data-testid="editor-draft"]:has-text("草稿已自动存")', { timeout: 15000 }).catch(() => null)
const draftLine = await page.getByTestId('editor-draft').innerText()
check('停手后草稿自动存', /草稿已自动存/.test(draftLine), draftLine)

// 完成：两边一起存
await page.getByTestId('editor-done').click()
await page.locator('.trpg-toast', { hasText: '已保存' }).waitFor()
await page.evaluate(async (P) => eval(P)._s.get('app').svc().backend.library.brewQueue.settled(), P)
const saved = await page.evaluate(async (P) => {
  const lib = eval(P)._s.get('app').svc().backend.library
  const zh = (await lib.custom.exportPack('cn', 'pirate')).body.spell ?? []
  const en = (await lib.custom.exportPack('en', 'pirate')).body.spell ?? []
  const drafts = (await lib.custom.drafts('cn')).length
  return { zh: zh.map((s) => [s.name, s.ENG_name, s.level, s.school]), en: en.map((s) => [s.name, s.level, s.school]), drafts }
}, P)
check('[完成] 两边一起存：中文的英文名自动写成 Fire Parrot；英文那条有学派（填入的）；草稿丢掉', saved.zh[0]?.[0] === '火焰鹦鹉' && saved.zh[0]?.[1] === 'Fire Parrot' && saved.en[0]?.[0] === 'Fire Parrot' && saved.en[0]?.[2] === 'V' && saved.drafts === 0, JSON.stringify(saved))

// ✎ 再打开：右栏对上英文那一条
await page.waitForSelector('[data-testid="mine-edit"]', { timeout: 60000 })
await page.getByTestId('mine-edit').first().click()
await page.waitForSelector('[data-testid="editor"] [data-testid="entry-form"]')
await settle(page, 1500)
const enName = await page.getByTestId('editor-side').locator('[data-field="name"] input').inputValue()
await page.screenshot({ path: `${shots}/6-reopen.png` })
check('✎ 再打开：右栏是对上的英文那一条', enName === 'Fire Parrot', enName)

// 窄屏：上下两栏
await page.setViewportSize({ width: 390, height: 800 })
await settle(page, 900)
await page.screenshot({ path: `${shots}/7-editor-narrow.png` })
const vsplit = await page.locator('[data-testid="editor"] .lib-vsplit').count()
check('窄屏：上半栏另一语言 / JSON / 预览，下半栏表单', vsplit === 1)
await page.getByTestId('editor-side').getByRole('button', { name: '收起' }).click()
await settle(page, 400)
await page.screenshot({ path: `${shots}/8-editor-narrow-collapsed.png` })

// 草稿：改一下不存 → 取消（放弃）→ 我的库顶上有草稿条
await field(page.getByTestId('editor-main'), 'name').locator('input').fill('火焰鹦鹉（改）')
await page.waitForSelector('[data-testid="editor-draft"]:has-text("草稿已自动存")', { timeout: 15000 }).catch(() => null)
await closeAll(); await settle(page, 400)
await page.setViewportSize({ width: 1280, height: 800 })
await tab('书架'); await tab('我的库')
await page.waitForSelector('[data-testid="mylib-drafts"]', { timeout: 15000 }).catch(() => null)
await page.screenshot({ path: `${shots}/9-mylib-draft.png` })
const bar = await page.getByTestId('mylib-drafts').innerText().catch(() => '')
check('没存的草稿：我的库顶上提醒 + [继续]', /草稿/.test(bar) && await page.getByTestId('draft-continue').count() === 1, bar)
await page.getByTestId('draft-continue').click()
await page.waitForSelector('[data-testid="editor"] [data-testid="entry-form"]')
await settle(page, 800)
const back = await page.getByTestId('editor-main').locator('[data-field="name"] input').inputValue()
check('[继续] 回到编辑器，内容是草稿里的', back === '火焰鹦鹉（改）', back)

check('页面没有未处理的错误（断网预期的除外）', realErrors().length === 0, realErrors().slice(0, 2).join(' | '))
await ctx.close()
server.close()
console.log(failures.length ? `FAIL ${failures.length}` : 'ALL PASS')
process.exit(failures.length ? 1 : 0)
