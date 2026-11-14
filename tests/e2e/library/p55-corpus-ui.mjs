// 书 / 冒险走普通条目那一套界面（驾驶员 2026-11-14：不另开入口）：包里［新建条目］→ 选「书籍」→ 同一个「从哪开始」→ 同一个编辑器
// （正文是附属部分那一节）→［完成］→ 预览 → 保存 → 包的「书」类别 → 阅读器；行尾 ✎ 再改（同一个编辑器、同一个撤销）；行尾 ⋯ 删除 + 撤销；
// 普通条目行尾也有同一个 ⋯ 删除；窄屏。
// 用法：SKIP_BUILD=1 node tests/e2e/library/p55-corpus-ui.mjs（ENGINE=webkit 换 WebKit；截图 work/e2e-lib/p55-ui-shots/corpus-ui/）
import { check, failures, settle } from '../helpers.mjs'
import { openLibrary, P } from './p55-ui-common.mjs'

const { ctx, page, server, shots, tab, closeAll, svc, realErrors } = await openLibrary('corpus-ui', { width: 1100, height: 800 })
page.setDefaultTimeout(60000)
const shot = (name) => page.screenshot({ path: `${shots}/${name}.png`, animations: 'disabled' })
const top = () => page.locator('.trpg-modal__page:not(.is-under)')
const pack = page.getByTestId('pack-page')
const openPack = async () => {
  await closeAll()
  await tab('我的库')
  await page.locator('[data-testid="mylib-open"]', { hasText: '港口书包' }).first().click()
  await pack.waitFor()
}
const settled = () => svc(async (s) => { const c = s.backend.library.custom; for (let i = 0; i < 120; i++) { const p = await c.pending('cn'); if (!p.packs.length && !p.busy) return true; await new Promise((r) => setTimeout(r, 500)) } return false })
const bookRow = () => pack.getByTestId('book-row').filter({ hasText: '港口手册' })
const showBooks = async () => { await pack.locator('.trpg-pill').filter({ hasText: /^书/ }).click(); await bookRow().waitFor() }
const editor = () => top().getByTestId('editor')
const saveFromEditor = async () => {
  await editor().getByTestId('editor-done').click()
  await page.getByTestId('save-page').waitFor()
  await page.getByTestId('save-go').click()
}
try {
  await svc((s) => s.backend.library.custom.createPack('cn', { json: 'HARBORB', full: '港口书包', abbreviation: 'HB' }, { rule: 'dnd5e2014' }))
  const bookName = await page.evaluate(async (P) => (await eval(P)._s.get('app').svc().backend.library.custom.entryTypes('cn')).find((t) => t.prop === 'book')?.name, P)

  // 新建：同一个选类型 → 同一个「从哪开始」→ 同一个编辑器
  await openPack()
  await page.getByTestId('pack-new-entry').click()
  await page.getByTestId('new-type').waitFor()
  await page.locator('[data-testid="type-item"]').filter({ hasText: new RegExp(`^${bookName}$`) }).first().click()
  await page.getByTestId('new-start').waitFor()
  check('选「书籍」进的是普通条目的「从哪开始」', await page.getByTestId('new-start').isVisible())
  await page.getByTestId('start-next').click()
  await editor().waitFor()
  await settle(page, 800)
  const main = editor().getByTestId('editor-main')
  const labelOf = async (f) => (await main.locator(`[data-field="${f}"] .lib-lname`).first().innerText()).replace(/[*\s]/g, '')
  const names = { id: await labelOf('id'), group: await labelOf('group'), published: await labelOf('published') }
  check('基本信息的字段是中文名（编号 / 类型 / 出版时间）', names.id === '编号' && names.group === '类型' && names.published === '出版时间', JSON.stringify(names))
  check('编号自动建议成包的来源编号', (await main.locator('[data-field="id"] input').first().inputValue()) === 'HARBORB')
  check('表单里没有「目录」这一项（保存时自动算）', !(await main.locator('[data-field="contents"]').count()))
  const groupBtn = main.locator('[data-field="group"] button').first()
  const groupText = (await groupBtn.innerText()).trim()
  await groupBtn.click()
  await settle(page, 400)
  const options = await page.getByRole('option').allInnerTexts()
  await page.keyboard.press('Escape')
  await settle(page, 300)
  check('分组下拉显示作者的中文选项名（自制内容），展开也是中文', groupText === '自制内容' && options.some((o) => o.trim() === '核心') && !options.some((o) => /^[a-z-]+$/.test(o.trim())), `${groupText} / ${options.join('、')}`)
  await main.locator('[data-field="name"] input').first().fill('港口手册')

  // 正文 = 附属部分那一节，同一套正文块；一个「小标题段」就是一章
  const part = main.getByTestId('editor-attached')
  check('编辑器里有附属部分那一节（正文）', await part.isVisible() && /正文/.test(await part.innerText()))
  await part.getByTestId('block-add-heading').click()
  const ch1 = part.getByTestId('block-heading').first()
  await ch1.waitFor()
  await ch1.locator('input').first().fill('第一章：港口')
  await ch1.locator('textarea').first().fill('港口很热闹。')
  await settle(page, 300)
  await shot('new-wide')
  await saveFromEditor()
  await page.getByTestId('save-page').waitFor({ state: 'detached' })
  check('后台整理完', await settled())

  // 包的「书」类别 → 阅读器
  await openPack()
  await showBooks()
  await shot('pack-book')
  await bookRow().locator('.lib-list__open').click()
  const body = page.getByTestId('reader-body')
  await body.getByText('港口很热闹。').waitFor()
  check('阅读器里能看到正文', true)
  await shot('reader')

  // ✎ 再改：同一个编辑器（openEditMine），加第二章；同一个撤销
  await openPack()
  await showBooks()
  await bookRow().getByTestId('book-edit').click()
  await editor().waitFor()
  await settle(page, 800)
  const part2 = editor().getByTestId('editor-main').getByTestId('editor-attached')
  check('✎ 打开的是同一个编辑器，正文读回来了', (await part2.getByTestId('block-heading').first().locator('input').first().inputValue()) === '第一章：港口')
  await part2.getByTestId('block-add-heading').click()
  const ch2 = part2.getByTestId('block-heading').nth(1)
  await ch2.locator('input').first().fill('第二章：灯塔')
  await ch2.locator('textarea').first().fill('灯塔很高。')
  await saveFromEditor()
  await page.getByTestId('save-page').waitFor({ state: 'detached' })
  await settled()
  const back = await svc(async (s) => { const c = s.backend.library.custom; const p = (await c.packs('cn')).find((x) => x.own.json === 'HARBORB'); return { head: (await c.packEntry('cn', p.id, 'book', { hash: 'harborb' })).entity, part: await c.attachedPart('cn', 'book', p.id, { hash: 'harborb' }) } })
  check('改后：目录两章、正文两章', back.head.contents.map((c) => c.name).join('|') === '第一章：港口|第二章：灯塔' && back.part.entity.data.length === 2, JSON.stringify(back.head.contents))
  await openPack()
  await showBooks()
  await bookRow().getByTestId('book-edit').click()
  await editor().waitFor()
  await settle(page, 800)
  const undoBtn = editor().getByTestId('editor-undo')
  check('编辑器顶上的撤销对书也有（还剩几步）', await undoBtn.isEnabled())
  await undoBtn.click()
  await settle(page, 1500)
  check('撤销一步：正文回到一章', (await editor().getByTestId('editor-main').getByTestId('editor-attached').getByTestId('block-heading').count()) === 1)
  await shot('undo')

  // 没有章名：后端拦下，预览页说清楚
  await editor().getByTestId('editor-main').getByTestId('editor-attached').getByTestId('block-add-heading').click()
  await editor().getByTestId('editor-main').getByTestId('editor-attached').getByTestId('block-heading').nth(1).locator('input').first().fill('')
  await editor().getByTestId('editor-done').click()
  await page.getByTestId('save-page').waitFor()
  await page.getByTestId('save-go').click()
  const err = page.getByTestId('save-page').locator('.trpg-field__err')
  await err.waitFor()
  check('没有章名的章存不进去，预览页提示第几章', /第 2 章没有章名/.test(await err.innerText()), await err.innerText())
  await closeAll()

  // ⋯ 删除 + 撤销（和普通条目同一个菜单）
  await openPack()
  await showBooks()
  await bookRow().getByRole('button', { name: '港口手册 的更多操作' }).click()
  await page.getByRole('menuitem', { name: '删除' }).click()
  await page.locator('.trpg-confirm__actions .trpg-btn--danger').click()
  await page.locator('.trpg-toast', { hasText: '已删除「港口手册」' }).waitFor()
  const gone = await svc(async (s) => { const c = s.backend.library.custom; const p = (await c.packs('cn')).find((x) => x.own.json === 'HARBORB'); return !(await c.packEntry('cn', p.id, 'book', { hash: 'harborb' })) && !(await c.packEntry('cn', p.id, 'bookData', { id: 'HARBORB' })) })
  check('⋯ 删除：书和正文一起删掉', gone)
  await shot('deleted')
  await page.locator('.trpg-toast', { hasText: '已删除「港口手册」' }).getByRole('button', { name: '撤销' }).click()
  await settled()
  const restored = await svc(async (s) => { const c = s.backend.library.custom; const p = (await c.packs('cn')).find((x) => x.own.json === 'HARBORB'); return (await c.attachedPart('cn', 'book', p.id, { hash: 'harborb' }))?.entity.data.length })
  check('撤销删除：书和正文回来', restored === 1, String(restored))

  // 普通条目也是同一个 ⋯ 删除
  await svc(async (s) => { const c = s.backend.library.custom; const p = (await c.packs('cn')).find((x) => x.own.json === 'HARBORB'); await c.saveEntry('cn', 'spell', { name: '港口火花', level: 0, school: 'V', time: [{ number: 1, unit: 'action' }], range: { type: 'point', distance: { type: 'self' } }, components: { v: true }, duration: [{ type: 'instant' }], entries: ['火花。'] }, { pack: p.id }) })
  await settled()
  await openPack()
  const spellRow = pack.getByTestId('mine-row').filter({ hasText: '港口火花' })
  await spellRow.waitFor()
  await spellRow.getByRole('button', { name: '港口火花 的更多操作' }).click()
  await page.getByRole('menuitem', { name: '删除' }).click()
  await page.locator('.trpg-confirm__actions .trpg-btn--danger').click()
  await page.locator('.trpg-toast', { hasText: '已删除「港口火花」' }).waitFor()
  check('普通条目行尾同一个 ⋯ 删除', true)

  // 窄屏
  await openPack()
  await showBooks()
  await bookRow().getByTestId('book-edit').click()
  await editor().waitFor()
  await page.setViewportSize({ width: 420, height: 780 })
  await settle(page, 800)
  await shot('narrow')
  check('窄屏编辑器里正文那一节照样在', await editor().getByTestId('editor-attached').first().isVisible())
  check('页面没有未处理的错误（断网预期的除外）', realErrors().length === 0, realErrors().slice(0, 2).join(' | '))
} finally {
  await ctx.close()
  server.close()
}
console.log(failures.length ? `FAIL ${failures.length}` : 'ALL PASS')
process.exit(failures.length ? 1 : 0)
