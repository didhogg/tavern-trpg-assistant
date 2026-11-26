// 用真实作者加载器复现：允许房规复制表格，同时保护现有库和真正的依赖报错。
import assert from 'node:assert/strict'
import { join } from 'node:path'
import { engines, freshProfile, work } from './chain-common.mjs'
import { P } from './p55-ui-common.mjs'
import { startStatic } from './static.mjs'

const engine = process.env.ENGINE ?? 'chrome'
const [, browser, options] = engines.find(([name]) => name === engine)
const profile = freshProfile(join(work, `profile-b2-8a-${engine}`), join(work, `profile-brew-table-copy-${process.pid}`))
const { server, url } = await startStatic({ port: 47318 })
const marker = 'BrewTableCopyQA'
const pack = (source, data) => ({ _meta: { sources: [{ json: source, full: source, abbreviation: source }], ...data._meta }, table: data.table })
const base = { name: 'Base Table QA', source: marker, colLabels: ['d6', 'Result'], rows: [['1', 'A lantern']] }
const copied = { name: 'Copied Table QA', source: marker, _copy: { name: base.name, source: marker } }
const tables = pack(marker, { _meta: { internalCopies: ['table'] }, table: [base, copied] })
const second = 'BrewTableCopyOtherQA'
const secondUrl = new URL(`${second}.json`, url).href
const absent = 'BrewTableCopyAbsentQA'
const badCopy = pack('BrewTableCopyBadQA', {
  _meta: { internalCopies: ['table'] }, table: [{ ...copied, source: 'BrewTableCopyBadQA', _copy: { name: 'Absent Table QA', source: marker } }],
})
const missingDep = pack('BrewTableCopyDepQA', {
  _meta: { dependencies: { table: [absent] } }, table: [{ ...copied, source: 'BrewTableCopyDepQA', _copy: { name: 'Absent Table QA', source: absent } }],
})

let ctx
try {
  ctx = await browser.launchPersistentContext(profile, options)
  await ctx.route((u) => !u.href.startsWith(url), (route) => route.abort())
  await ctx.route(secondUrl, (route) => route.fulfill({ json: pack(second, { table: [{ ...base, source: second }] }) }))
  const page = await ctx.newPage()
  page.setDefaultTimeout(30000)
  await page.goto(url)
  await page.waitForFunction(`!!(${P})._s.get('app')?.booted`)
  const call = (fn, arg) => page.evaluate(fn, [P, arg])
  for (const lang of ['en', 'cn']) {
    const set = `${lang}-brew`
    const result = await call(async ([pin, { set, tables, copied, second, secondUrl, missingDep, badCopy }]) => {
      const backend = eval(pin)._s.get('app').svc().backend
      const lib = backend.library
      const imp = (body) => lib.service.brewImport(set, [{ name: `${body._meta.sources[0].json}.json`, text: JSON.stringify(body) }])
      const rows = () => lib.service.query(set, 'table')
      const bySource = async (source) => (await lib.brewPacks.list(set)).find((p) => p.sources.includes(source))
      const viewId = async () => (await lib.currentView()).id
      const attempt = async (fn) => {
        try { await fn(); return { ok: true } }
        catch (error) { return { ok: false, name: error.name, message: error.message, missing: error.missing } }
      }
      const imported = await attempt(() => imp(tables))
      if (!imported.ok) return { imported }
      const installed = await attempt(() => lib.service.brewAddUrl(set, secondUrl))
      if (!installed.ok) return { imported, installed }
      const other = await bySource(second)
      if (!other) return { imported, installed, otherFound: false }
      const deleted = await attempt(async () => {
        const impact = await backend.removalImpact({ kind: 'brew', setId: set, docIdLocals: [other.docIdLocal] })
        await backend.removalExecute(impact)
      })
      const before = await viewId()
      const malformed = await attempt(() => imp(badCopy))
      const missing = await attempt(() => imp(missingDep))
      const copy = (await rows()).find((row) => row.item.name === copied.name && row.source === copied.source)
      return { imported, installed, otherFound: true, deleted, otherGone: !(await bySource(second)), malformed, missing, rows: copy?.item.rows, unchanged: before === await viewId() }
    }, { set, tables, copied, second, secondUrl, missingDep, badCopy })
    assert.equal(result.imported.ok, true, JSON.stringify(result))
    assert.deepEqual(result.installed, { ok: true }, JSON.stringify(result))
    assert.equal(result.otherFound, true)
    assert.deepEqual(result.deleted, { ok: true }, JSON.stringify(result))
    assert.equal(result.otherGone, true)
    assert.deepEqual(result.rows, base.rows)
    assert.equal(result.malformed.ok, false)
    assert.match(result.malformed.message, /自制包合并失败.*Could not find .*Absent Table QA/)
    assert.equal(result.malformed.missing, undefined)
    assert.equal(result.missing.name, 'BrewDependencyError', JSON.stringify(result.missing))
    assert.equal(result.missing.missing[0].source, absent)
    assert.equal(result.unchanged, true)
    console.log(`PASS ${engine} ${lang}: table copy, download, uninstall, and rollback`)
  }
} finally {
  await ctx?.close()
  server.close()
}
