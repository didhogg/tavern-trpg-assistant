// 和书共用来源的冒险（MOT、FRAiF）：书架行、包页「书」类别里各用自己的名字，另一种语言的名字也不互相顶掉。
// 用法：SKIP_BUILD=1 node tests/e2e/library/p55-book-adv-names.mjs（ENGINE=webkit 换 WebKit）
import { check, failures, settle } from '../helpers.mjs'
import { openLibrary, P } from './p55-ui-common.mjs'

const { ctx, page, server, shots, realErrors } = await openLibrary('book-adv-names', { width: 1100, height: 800 })
page.setDefaultTimeout(60000)
try {
  // 作者书目里来源同时是书和冒险的（不写死是哪几本）
  await page.waitForFunction((P) => !!eval(P)._s.get('library').shelf?.groups?.length, P)
  const shared = await page.evaluate(async (P) => {
    const pin = eval(P)
    const rows = pin._s.get('library').shelf.groups.flatMap((g) => [...g.books, ...g.adventures])
    const books = rows.filter((r) => r.kind === 'book' && r.downloaded && r.id)
    return rows.filter((r) => r.kind === 'adventure' && books.some((b) => b.set === r.set && b.source === r.source))
      .map((a) => ({ adv: { id: a.id, name: a.name, alt: a.altName ?? null }, book: (({ id, name, altName }) => ({ id, name, alt: altName ?? null }))(books.find((b) => b.set === a.set && b.source === a.source)), set: a.set, source: a.source }))
  }, P)
  check('书目里有和书共用来源的冒险', shared.length > 0, JSON.stringify(shared))
  for (const s of shared) {
    check(`书架：${s.source} 的书和冒险不同名`, s.adv.name !== s.book.name, `${s.book.name} / ${s.adv.name}`)
    check(`书架：${s.source} 另一种语言的名字不同`, !s.adv.alt || !s.book.alt || s.adv.alt !== s.book.alt, `${s.book.alt} / ${s.adv.alt}`)
  }
  const first = shared[0]
  if (first) {
    // 先在书架里搜书名，免得长列表滚动没停稳点偏
    await page.getByPlaceholder('搜索书目 / 包名').fill(first.book.name)
    await settle(page, 600)
    await page.screenshot({ path: `${shots}/shelf.png`, animations: 'disabled' })
    await page.locator('.trpg-shelf__row .lib-name').filter({ hasText: first.book.name }).first().click()
    const pack = page.getByTestId('pack-page')
    await pack.waitFor()
    await pack.locator('.trpg-pill').filter({ hasText: /^书/ }).click()
    await pack.getByTestId('book-row').nth(1).waitFor()
    const names = await pack.getByTestId('book-row').locator('.lib-name').allInnerTexts()
    await page.screenshot({ path: `${shots}/pack-books.png`, animations: 'disabled' })
    check('包页「书」类别里书和冒险各用自己的名字', names.includes(first.book.name) && names.includes(first.adv.name) && new Set(names).size === names.length, names.join(' | '))
  }
  check('页面没有未处理的错误（断网预期的除外）', realErrors().length === 0, realErrors().slice(0, 2).join(' | '))
} finally {
  await ctx.close()
  server.close()
}
console.log(failures.length ? `FAIL ${failures.length}` : 'ALL PASS')
process.exit(failures.length ? 1 : 0)
