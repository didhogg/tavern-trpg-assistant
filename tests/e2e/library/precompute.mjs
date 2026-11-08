// P3 性能改进 S1：预计算缓存正式验证。
// ① 8 类：缓存查询 / 详情与作者现场结果逐项比；② 搜索：存好的索引与作者现场建索引结果逐项比；
// ③ 刷新后第一次看资料 / 查询 / 搜索计时；④ 开关书：旧缓存被清掉、下一次查询重建；⑤ 还原开关。
import { join } from 'node:path'
import { writeFile } from 'node:fs/promises'
import { startStatic } from './static.mjs'
import { buildAll, engines, work } from './chain-common.mjs'

await buildAll()
const PORT = 47337
const [, type, options] = engines[process.env.ENGINE === 'webkit' ? 1 : 0]
const { server, url } = await startStatic({ port: PORT })
const ctx = await type.launchPersistentContext(join(work, `profile-p3-1-${process.env.ENGINE ?? 'chrome'}`), { ...options, viewport: { width: 1280, height: 800 } })
const errors = []
let page = await ctx.newPage()
page.setDefaultTimeout(900000)
page.on('pageerror', (e) => errors.push(e.stack ?? String(e)))
page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`) })
const startedAt = new Date().toISOString()
const props = ['race', 'background', 'class', 'spell', 'item', 'monster', 'feat', 'subclass']

try {
  await page.goto(url)
  const setup = await page.evaluate(async () => {
    const h = await import('/work/e2e-lib/harness.js')
    for (const id of ['cn-official', 'en-official']) {
      const audit = await h.offlineAudit(id)
      if (audit.set?.status !== 'installed' || audit.ok !== audit.planFiles) await h.install(id)
    }
    h.service.reset()
    for (const u of ['src:phb', 'src:mm', 'src:dmg']) await h.scoped.setAssignment(u, null)
    const t0 = performance.now()
    const reports = []
    for (const id of ['cn-official', 'en-official']) reports.push(await h.service.precompute(id, { fluff: true, excluded: true, search: true }))
    // 配对表先建一次，之后刷新看资料不用再开配对小窗。
    await h.service.englishPairs('cn-official')
    return { ms: Math.round(performance.now() - t0), reports, keys: (await h.libraryDb.derived.where('key').startsWith('pre:cn-official:').toArray()).length }
  })

  const compare = await page.evaluate(async (props) => {
    const h = await import('/work/e2e-lib/harness.js')
    const live = await h.openAuthorFrame('cn')
    const liveEn = await h.openAuthorFrame('en')
    const pairs = await h.service.englishPairs('cn-official')
    const out = []
    const diffs = []
    for (const prop of props) {
      const parsed = await h.service.parsed('cn-official', prop).catch(() => null)
      if (!parsed) { out.push({ prop, skipped: true }); continue }
      const cached = await h.service.query('cn-official', prop, { includeExcluded: true })
      const flags = await live.call('excludedFlags', prop, 'site')
      const liveExcluded = new Map()
      flags.hashes.forEach((hash, i) => { if (hash) liveExcluded.set(hash, flags.excluded ? flags.excluded[i] : false) })
      let excludedDiffs = 0
      for (const row of cached) {
        const liveValue = liveExcluded.get(row.hash) ?? false
        if (row.excluded !== liveValue) excludedDiffs++
      }
      let detailChecked = 0
      for (const row of cached.slice(0, 3)) {
        if (!row.hash) continue
        const d = await h.service.detail('cn-official', prop, row.hash, row.source)
        const a = await live.call('detail', prop, row.hash, row.source)
        const af = a ? await live.call('fluffOf', prop, a.item) : null
        detailChecked++
        if (JSON.stringify(d?.fluff ?? null) !== JSON.stringify(af?.fluff ?? null)) diffs.push({ prop, hash: row.hash, field: 'fluff' })
        if ((d?.fluffError ?? null) !== (af?.fluffError ?? null)) diffs.push({ prop, hash: row.hash, field: 'fluffError' })
        if ((d?.engSiteHash ?? null) !== (a?.engSiteHash ?? null)) diffs.push({ prop, hash: row.hash, field: 'engSiteHash' })
        if ((d?.excluded ?? false) !== (a?.excluded ?? false)) diffs.push({ prop, hash: row.hash, field: 'excluded' })
        if (JSON.stringify(d?.item) !== JSON.stringify(parsed.items[parsed.hashes.indexOf(row.hash)])) diffs.push({ prop, hash: row.hash, field: 'item' })
        if (d?.english?.status === 'found') {
          const enSource = pairs.pairs[prop]?.[row.hash]?.enSource ?? null
          const en = await liveEn.call('detail', prop, d.english.hash, enSource)
          if (JSON.stringify(d.english.item) !== JSON.stringify(en?.item)) diffs.push({ prop, hash: row.hash, field: 'english.item' })
          if (JSON.stringify(d.english.fluff ?? null) !== JSON.stringify(en?.fluff ?? null)) diffs.push({ prop, hash: row.hash, field: 'english.fluff' })
        }
      }
      out.push({ prop, count: parsed.items.length, visible: cached.filter((r) => !r.excluded).length, excludedDiffs, detailChecked })
    }
    const cachedSearch = await h.service.search('cn-official', '火球', { showLegacy: true })
    const liveSearch = await live.call('search', '火球', true)
    const pick = (rows) => rows.map((r) => [r.score, r.doc.id, r.doc.u, r.doc.c, r.doc.s])
    if (JSON.stringify(pick(cachedSearch)) !== JSON.stringify(pick(liveSearch))) diffs.push({ field: 'search', cached: pick(cachedSearch).slice(0, 5), live: pick(liveSearch).slice(0, 5) })
    live.close(); liveEn.close()
    return { out, diffs, search: { cached: cachedSearch.length, live: liveSearch.length } }
  }, props)

  // 刷新后第一次看资料 / 查询 / 搜索：同一 profile、同一端口，真的关掉页面重开。
  await page.close()
  page = await ctx.newPage()
  page.setDefaultTimeout(900000)
  page.on('pageerror', (e) => errors.push(e.stack ?? String(e)))
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`) })
  await page.goto(url)
  const cold = await page.evaluate(async () => {
    const h = await import('/work/e2e-lib/harness.js')
    const p = await h.service.parsed('cn-official', 'spell')
    const hash = p.hashes.find((x) => x)
    const t = (fn) => { const t0 = performance.now(); return fn().then((v) => ({ ms: Math.round(performance.now() - t0), v })) }
    const detail = await t(() => h.service.detail('cn-official', 'spell', hash))
    const query = await t(() => h.service.query('cn-official', 'spell'))
    const search = await t(() => h.service.search('cn-official', '火球', { showLegacy: true }))
    return { detailMs: detail.ms, detailOk: !!detail.v, queryMs: query.ms, queryCount: query.v.length, searchMs: search.ms, searchCount: search.v.length }
  })

  // 开关书：旧缓存被清掉；下一次查询重建；最后还原。
  const toggle = await page.evaluate(async () => {
    const h = await import('/work/e2e-lib/harness.js')
    const before = await h.libraryDb.derived.get('pre:cn-official:excluded:spell')
    await h.service.setBookExcluded('cn-official', 'PHB', true)
    const gone = { excluded: !(await h.libraryDb.derived.get('pre:cn-official:excluded:spell')), search: !(await h.libraryDb.derived.get('pre:cn-official:search')) }
    const rebuilt = await h.service.query('cn-official', 'spell', { source: 'phb' })
    const after = await h.libraryDb.derived.get('pre:cn-official:excluded:spell')
    const hidden = rebuilt.filter((r) => r.excluded).length
    await h.service.setBookExcluded('cn-official', 'PHB', false)
    const restored = await h.service.query('cn-official', 'spell', { source: 'phb' })
    return { before: !!before, gone, rebuilt: rebuilt.length, hidden, after: !!after, restored: restored.length }
  })

  // 加一条房规：自制缓存重算、官方搜索缓存作废；随后删掉房规，恢复原状。
  const house = await page.evaluate(async () => {
    const h = await import('/work/e2e-lib/harness.js')
    await h.service.search('cn-official', '火球', { showLegacy: true })
    const p = await h.service.parsed('cn-official', 'spell')
    const i = p.hashes.findIndex((hash, j) => hash && String(p.items[j]?.name ?? '').includes('火球'))
    const ref = { set: 'cn-official', prop: 'spell', hash: p.hashes[i] }
    const c = h.defaultCampaignLibrary('dnd5e2014', 'cn')
    const beforeSearch = await h.libraryDb.derived.get('pre:cn-official:search')
    const beforeBrew = await h.libraryDb.derived.get('pre:cn-brew:fluff:spell')
    const r = await h.custom.createHouseRule(c, ref, { mod: { entries: { mode: 'appendArr', items: 'S1 房规：只验证缓存' } } })
    const brew = await h.libraryDb.derived.get('pre:cn-brew:fluff:spell')
    const searchGone = !(await h.libraryDb.derived.get('pre:cn-official:search'))
    const d = await h.scoped.detail(r.campaign, ref)
    const detail = d && !('hidden' in d) ? { version: d.version, hasHouseText: JSON.stringify(d.item).includes('S1 房规') } : null
    const hits = await h.service.search('cn-official', '火球', { showLegacy: true })
    const searchBack = !!(await h.libraryDb.derived.get('pre:cn-official:search'))
    await h.custom.deleteHouseRule('cn', r.house, r.uniqueId)
    await h.service.precompute('cn-official', { fluff: false, excluded: false, search: true })
    return { beforeSearch: !!beforeSearch, beforeBrew: beforeBrew?.savedAt ?? null, brew: brew?.savedAt ?? null, searchGone, detail, hits: hits.length, searchBack }
  })

  const known = (e) => e.includes('gendata-nav-adventure-book-index.json') || e.includes('/vendor/foundry/api/plutonium') || e.includes('status of 404') || e.includes('requires usable window dimensions') || e.includes('KERNEL_NEEDS_INPUT') || e.includes('Failed to place measured template')
  const payload = {
    engine: process.env.ENGINE ?? 'chrome', startedAt, port: PORT, setup, props: compare.out, diffs: compare.diffs,
    search: compare.search, cold, toggle, house, errors, unexplained: errors.filter((e) => !known(e)),
  }
  await writeFile(`${work}/precompute-${payload.engine}.json`, JSON.stringify(payload, null, 2))
  console.log(JSON.stringify({ setupMs: setup.ms, keys: setup.keys, reports: setup.reports.map((r) => ({ source: r.source, ms: r.ms, fluff: r.fluff, excluded: r.excluded, searchBytes: r.searchBytes })), props: compare.out, search: compare.search, cold, toggle, house, diffs: compare.diffs.length, unexplained: payload.unexplained.length }, null, 1))
  process.exitCode = payload.unexplained.length || compare.diffs.length ? 1 : 0
} finally {
  await ctx.close()
  server.close()
}
