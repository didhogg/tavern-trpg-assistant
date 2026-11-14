// 自制书 / 冒险界面：包里［新建条目］→ 选「书」→ 书的编辑页（基本信息 + 章节）→［完成］→ 包的「书」类别 → 阅读器；✎ 再改一次。
// 用法：SKIP_BUILD=1 node tests/e2e/library/p55-corpus-ui.mjs（ENGINE=webkit 换 WebKit；截图 work/e2e-lib/p55-ui-shots/corpus-ui/）
import { check, failures, settle } from '../helpers.mjs'
import { openLibrary, P } from './p55-ui-common.mjs'

const { ctx, page, server, shots, tab, closeAll, svc, realErrors } = await openLibrary('corpus-ui', { width: 1100, height: 800 })
page.setDefaultTimeout(60000)
const shot = (name) => page.screenshot({ path: `${shots}/${name}.png`, animations: 'disabled' })
const top = () => page.locator('.trpg-modal__page:not(.is-under)')
const openPack = async () => {
  await tab('我的库')
  await page.locator('[data-testid="mylib-open"]', { hasText: '港口书包' }).first().click()
  await page.getByTestId('pack-page').waitFor()
}
const settled = () => svc(async (s) => { const c = s.backend.library.custom; for (let i = 0; i < 120; i++) { const p = await c.pending('cn'); if (!p.packs.length && !p.busy) return true; await new Promise((r) => setTimeout(r, 500)) } return false })
try {
  await svc((s) => s.backend.library.custom.createPack('cn', { json: 'HARBORB', full: '港口书包', abbreviation: 'HB' }, { rule: 'dnd5e2014' }))
  const types = await page.evaluate(async (P) => (await eval(P)._s.get('app').svc().backend.library.custom.entryTypes('cn')).filter((t) => t.corpus).map((t) => ({ prop: t.prop, name: t.name, kind: t.kind, body: t.corpus })), P)
  check('类型清单里有书和冒险（只列目录那一类）', types.some((t) => t.prop === 'book' && t.body === 'bookData') && types.some((t) => t.prop === 'adventure' && t.body === 'adventureData') && types.every((t) => t.kind === 'main'), JSON.stringify(types))
  const book = types.find((t) => t.prop === 'book')

  // 新建
  await openPack()
  await page.getByTestId('pack-new-entry').click()
  await page.getByTestId('new-type').waitFor()
  await page.locator('[data-testid="type-item"]').filter({ hasText: new RegExp(`^${book.name}$`) }).first().click()
  const ed = top().getByTestId('corpus-editor')
  await ed.waitFor()
  await settle(page, 600)
  const idValue = await ed.locator('[data-field="id"] input').first().inputValue()
  check('编号自动建议成包的来源编号', idValue === 'HARBORB', idValue)
  check('表单里没有「目录」这一项（保存时自动算）', !(await ed.locator('[data-field="contents"]').count()))
  await ed.locator('[data-field="name"] input').first().fill('港口手册')
  await ed.getByTestId('chapter-add').click()
  await ed.getByTestId('chapter-name').first().fill('第一章：港口')
  const ch = ed.getByTestId('corpus-chapter').first()
  await ch.getByTestId('field-add').click()
  await ch.locator('textarea').first().fill('港口很热闹。')
  await shot('new-wide')
  await ed.getByTestId('corpus-done').click()
  await ed.waitFor({ state: 'detached' })
  check('存好后回到包页', await page.getByTestId('pack-page').isVisible())
  check('后台整理完', await settled())

  // 包的「书」类别 → 阅读器
  await closeAll(); await openPack()
  const pack = page.getByTestId('pack-page')
  await pack.locator('.trpg-pill').filter({ hasText: /^书/ }).click()
  const row = pack.getByTestId('book-row').filter({ hasText: '港口手册' })
  await row.waitFor()
  await shot('pack-book')
  await row.locator('.lib-list__open').click()
  const body = page.getByTestId('reader-body')
  await body.waitFor()
  await body.getByText('港口很热闹。').waitFor()
  check('阅读器里能看到正文', true)
  await shot('reader')

  // ✎ 再改：加第二章
  await closeAll(); await openPack()
  await pack.locator('.trpg-pill').filter({ hasText: /^书/ }).click()
  await pack.getByTestId('book-row').filter({ hasText: '港口手册' }).getByTestId('book-edit').click()
  await ed.waitFor()
  check('✎ 打开的是这一本（章名在）', (await ed.getByTestId('chapter-name').first().inputValue()) === '第一章：港口')
  await ed.getByTestId('chapter-add').click()
  await ed.getByTestId('chapter-name').nth(1).fill('第二章：灯塔')
  const ch2 = ed.getByTestId('corpus-chapter').nth(1)
  await ch2.getByTestId('field-add').click()
  await ch2.locator('textarea').first().fill('灯塔很高。')
  await ed.getByTestId('corpus-done').click()
  await ed.waitFor({ state: 'detached', timeout: 15000 }).catch(async (e) => { await shot('edit-stuck'); console.log('STUCK', await ed.locator('.lib-banner').allInnerTexts()); throw e })
  await settled()
  const back = await svc(async (s) => { const c = s.backend.library.custom; const p = (await c.packs('cn')).find((x) => x.own.json === 'HARBORB'); return c.corpusEntry('cn', p.id, 'book', 'HARBORB') })
  check('改后：目录两章、正文两章，没多出一本', back.head.contents.map((c) => c.name).join('|') === '第一章：港口|第二章：灯塔' && back.body.data.length === 2, JSON.stringify(back.head.contents))

  // 章没名字：后端拦下，页面上说清楚
  await closeAll(); await openPack()
  await pack.locator('.trpg-pill').filter({ hasText: /^书/ }).click()
  await pack.getByTestId('book-row').filter({ hasText: '港口手册' }).getByTestId('book-edit').click()
  await ed.waitFor()
  await ed.getByTestId('chapter-add').click()
  await ed.getByTestId('corpus-done').click()
  await ed.getByTestId('corpus-error').waitFor()
  check('没有章名的章存不进去，提示第几章', /第 3 章没有章名/.test(await ed.getByTestId('corpus-error').innerText()))

  // 窄屏：上下两个标签
  await page.setViewportSize({ width: 420, height: 780 })
  await settle(page, 600)
  await shot('narrow-info')
  const seg = ed.locator('.trpg-seg button', { hasText: '章节' })
  check('窄屏有「基本信息 / 章节」切换', await seg.isVisible())
  await seg.click()
  await settle(page, 300)
  await shot('narrow-chapters')
  check('窄屏切到章节能看到章', await ed.getByTestId('corpus-chapter').first().isVisible())
  check('页面没有未处理的错误（断网预期的除外）', realErrors().length === 0, realErrors().slice(0, 2).join(' | '))
} finally {
  await ctx.close()
  server.close()
}
console.log(failures.length ? `FAIL ${failures.length}` : 'ALL PASS')
process.exit(failures.length ? 1 : 0)
