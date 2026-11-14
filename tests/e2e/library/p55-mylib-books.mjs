// 走【我的库】导入 → 包页 → 阅读器。可传实际作者包作回归样本。
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { basename } from 'node:path'
import { openLibrary } from './p55-ui-common.mjs'

const source = 'P55BOOK'
const sample = {
  _meta: { sources: [{ json: source, full: '阅读回归包', abbreviation: 'BOOK', authors: [], version: '1' }] },
}
for (const [prop, title] of [['book', '港口手册'], ['adventure', '码头冒险']]) {
  const id = `${source}-${prop}`
  sample[prop] = [{ id, source, name: title, contents: [{ name: '第一章', headers: [] }] }]
  sample[`${prop}Data`] = [{ id, source, data: [{ type: 'section', name: '第一章', entries: [`${title}正文。`] }] }]
}
const file = process.argv[2]
const input = file ? await readFile(file) : Buffer.from(JSON.stringify(sample))
const data = JSON.parse(input)
const { ctx, page, server, shots, tab, closeAll, realErrors } = await openLibrary('mylib-books', { width: 900, height: 760 })
page.setDefaultTimeout(35_000)
try {
  await tab('我的库')
  await page.getByTestId('mylib-file').setInputFiles({ name: file ? basename(file) : 'P55BOOK.zh.json', mimeType: 'application/json', buffer: input })
  await page.getByTestId('import-confirm').click()
  await page.getByTestId('mylib-open').filter({ hasText: data._meta.sources.at(-1).full }).click()

  const pack = page.getByTestId('pack-page')
  const books = pack.locator('.trpg-pill').filter({ hasText: /^书\s*2$/ })
  const rows = pack.getByTestId('book-row')
  for (const [prop, badge] of [['book', '书'], ['adventure', '冒险']]) {
    const name = data[prop][0].name
    await books.click()
    const row = rows.filter({ has: page.locator('.lib-name').getByText(name, { exact: true }) })
    assert.equal(await row.locator('.trpg-badge').innerText(), badge)
    assert.equal(await rows.count(), 2)
    assert.equal(await pack.locator('.lib-count').innerText(), '共 2 条')
    if (prop === 'book') await page.screenshot({ path: `${shots}/books.png`, animations: 'disabled' })
    await row.click()
    const body = page.getByTestId('reader-body')
    await body.waitFor()
    if (!file) await body.getByText(`${name}正文。`).waitFor()
    assert.ok((await body.innerText()).trim())
    if (prop === 'adventure') await page.screenshot({ path: `${shots}/adventure.png`, animations: 'disabled' })
    await closeAll()
    await page.getByTestId('mylib-open').filter({ hasText: data._meta.sources.at(-1).full }).click()
  }
  await rows.first().waitFor()
  assert.equal(await rows.count(), 2)
  assert.deepEqual(realErrors(), [])
  console.log('PASS 我的库显示书和冒险，两者均打开正文')
} finally {
  await ctx.close()
  server.close()
}
