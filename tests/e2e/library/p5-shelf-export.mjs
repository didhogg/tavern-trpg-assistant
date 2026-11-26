// 在现有资料副本离线测试书架导出，实际点击菜单并读回下载文件。
import assert from 'node:assert/strict'
import { mkdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { engines, freshProfile, work } from './chain-common.mjs'
import { P } from './p55-ui-common.mjs'
import { startStatic } from './static.mjs'

const engine = process.env.ENGINE ?? 'chrome'
const [, browser, options] = engines.find(([name]) => name === engine)
const profile = freshProfile(join(work, `profile-b2-8a-${engine}`), join(work, `profile-shelf-export-${engine}-${process.pid}`))
const shots = join(work, 'p5-shelf-export', engine)
await mkdir(shots, { recursive: true })
const { server, url } = await startStatic({ port: 47318 })
let ctx
try {
  ctx = await browser.launchPersistentContext(profile, { ...options, acceptDownloads: true, viewport: { width: engine === 'webkit' ? 390 : 1280, height: 850 } })
  await ctx.route((u) => !u.href.startsWith(url), (r) => r.abort())
  const page = await ctx.newPage()
  page.setDefaultTimeout(30000)
  await page.goto(url)
  await page.waitForFunction(`!!(${P})._s.get('app')?.booted`)
  await page.locator('.trpg-ball').click()
  await page.getByTestId('nav-library').click()
  await page.getByTestId('shelf-tab').waitFor()
  await page.waitForFunction(`!!(${P})._s.get('library')?.shelf?.groups?.length`)
  const book = await page.evaluate((pin) => eval(pin)._s.get('library').shelf.groups.flatMap((g) => g.books).find((r) => r.set === 'cn-official' && r.source === 'PHB'), P)
  assert.ok(book, '测试库已装 PHB')
  const revision = () => page.evaluate(async (pin) => (await eval(pin)._s.get('app').svc().backend.library.currentView()).id, P)
  const before = await revision()
  const download = async (label, filename, shot) => {
    const action = page.getByRole('menuitem', { name: label, exact: true })
    await action.waitFor()
    await page.screenshot({ path: join(shots, shot), animations: 'disabled' })
    const received = page.waitForEvent('download', { timeout: 60000 })
    await action.click()
    const file = await received
    assert.equal(file.suggestedFilename(), filename)
    return JSON.parse(await readFile(await file.path(), 'utf8'))
  }
  const shelfNames = page.getByTestId('shelf-tab').locator('button.lib-name')
  const bookIndex = await shelfNames.evaluateAll((buttons, name) => buttons.findIndex((b) => b.firstChild?.textContent.trim() === name), book.name)
  assert.ok(bookIndex >= 0, '书架里看得到 PHB')
  await shelfNames.nth(bookIndex).click()
  await page.locator('.trpg-modal__head .trpg-more').click()
  const pack = await download('导出这个数据包', `${book.name}.json`, '01-pack-menu.png')
  assert.equal(pack._meta.sources[0].json, book.source)
  assert.ok(pack.spell.some((e) => e.name === '火球术'))
  assert.ok(pack.bookData?.some((e) => e.id === book.id && e.data.length > 0), '导出包含本地已安装的正文')
  assert.ok(pack.spell.every((e) => e.source === book.source), '整包只含打开的书中的法术')

  const packPage = page.getByTestId('pack-page')
  await packPage.locator('input[type=search]').fill('火球术')
  await packPage.getByText('火球术', { exact: true }).click()
  const entryMenu = page.getByRole('button', { name: '这一条 的更多操作' })
  await entryMenu.click()
  const entry = await download('导出这个条目', '火球术.json', '02-entry-menu.png')
  assert.deepEqual(Object.keys(entry).sort(), ['_meta', 'spell'])
  assert.deepEqual(entry.spell, [pack.spell.find((e) => e.name === '火球术')])
  await page.getByTestId('entry-lang').getByRole('button', { name: 'En', exact: true }).click()
  await page.locator('.trpg-modal__head').getByText('Fireball', { exact: true }).waitFor()
  await entryMenu.click()
  const english = await download('导出这个条目', 'Fireball.json', '03-entry-english-menu.png')
  assert.equal(english.spell[0].name, 'Fireball')
  assert.equal(english.spell[0].source, book.source)
  assert.equal(await revision(), before)
  const copies = await page.evaluate(async ([pin, book, entry]) => {
    const stores = eval(pin)._s
    const lib = stores.get('app').svc().backend.library
    const campaign = JSON.parse(JSON.stringify(stores.get('library').campaignLib))
    const spell = entry.spell[0]
    const stock = (await lib.service.query(book.set, 'spell', { source: book.source })).find((row) => row.item.name === spell.name)
    const ref = { set: book.set, prop: 'spell', hash: stock.hash }
    const marks = ['ExportQA1', 'ExportQA2']
    await lib.service.brewImport('cn-brew', marks.map((mark, i) => ({
      name: `${mark}.json`,
      text: JSON.stringify({
        _meta: { ...entry._meta, sources: [...entry._meta.sources, { json: mark, full: mark, abbreviation: mark }] },
        spell: [{ ...spell, level: i + 4 }],
      }),
    })))
    const packs = await lib.brewPacks.list('cn-brew')
    const current = (await lib.currentView()).id
    const exported = []
    for (const mark of marks) {
      const doc = packs.find((pack) => pack.sources.includes(mark)).docIdLocal
      const whole = await lib.custom.exportSelection({ kind: 'pack', set: 'cn-brew', source: book.source, docIdLocal: doc })
      const single = await lib.custom.exportSelection({ kind: 'entry', campaign, ref, selection: { docIdLocal: doc } })
      exported.push({ whole: whole.body.spell[0].level, single: single.body.spell[0].level, source: single.body._meta.sources.at(-1).json })
    }
    return { exported, unchanged: current === (await lib.currentView()).id }
  }, [P, book, entry])
  assert.deepEqual(copies, { exported: [
    { whole: 4, single: 4, source: 'ExportQA1' },
    { whole: 5, single: 5, source: 'ExportQA2' },
  ], unchanged: true })
  console.log(`PASS ${engine} 书架整包与单条导出，文件名、正文、来源、只读检查通过`)
} finally {
  await ctx?.close()
  server.close()
}
