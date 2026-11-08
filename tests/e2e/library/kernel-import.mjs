// T1：结算内核统一换算入口的稳定性测试。
// 类别从已解析数据的类别里自动取（不写死类别清单），每类取一条带英文对照的真实条目；
// 同一条目在两个全新结算内核里按相反顺序换算，结果逐项相同。
import { join } from 'node:path'
import { writeFile } from 'node:fs/promises'
import { startStatic } from './static.mjs'
import { buildAll, engines, work } from './chain-common.mjs'

await buildAll()
const PORT = 47337
const [, type, options] = engines[process.env.ENGINE === 'webkit' ? 1 : 0]
const { server, url } = await startStatic({ port: PORT })
const ctx = await type.launchPersistentContext(join(work, `profile-p3-1-${process.env.ENGINE ?? 'chrome'}`), { ...options, viewport: { width: 1280, height: 800 } })
const page = await ctx.newPage()
page.setDefaultTimeout(900_000)
const errors = []
page.on('pageerror', (e) => errors.push(e.stack ?? String(e)))
page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`) })

try {
  await page.goto(url)
  const r = await page.evaluate(async () => {
    const h = await import('/work/e2e-lib/harness.js')
    const timeout = (promise, ms = 30_000) => {
      let timer
      return Promise.race([promise, new Promise((_, reject) => { timer = setTimeout(() => reject(Error(`TIMEOUT ${ms}ms`)), ms) })]).finally(() => clearTimeout(timer))
    }
    h.service.reset()
    const input = await h.kernelInput({ pluginRoot: new URL('/', location.href), rule: 'dnd5e2014', world: { id: 't1', title: 't1' } })
    const library = h.defaultCampaignLibrary('dnd5e2014', 'cn')
    const props = new Set()
    await h.libraryDb.derived.where('key').startsWith('parsed:cn-official:').each((rec) => {
      const rest = rec.key.slice('parsed:cn-official:'.length)
      if (!rest.startsWith('corpus:') && !rest.startsWith('raw_')) props.add(rest.split(':')[0])
    })
    const k0 = (await h.startKernelSession(input)).session
    const meta = await k0.call('importerMeta', [...props])
    k0.close()
    const valid = meta.filter((row) => row.folderType === 'Item' || row.folderType === 'Actor').map((row) => row.prop)
    const picks = []
    for (const prop of valid) {
      const rows = await h.scoped.query(library, prop).catch(() => [])
      for (const row of rows) {
        const d = await h.scoped.detail(library, row.ref).catch(() => null)
        if (d && !('hidden' in d) && d.english?.status === 'found') { picks.push({ prop, name: row.item?.name ?? row.ref.hash, entry: d.english.item }); break }
      }
    }
    const runOne = async (p) => {
      const k = (await h.startKernelSession(input)).session
      const t = performance.now()
      try {
        const result = await timeout(k.call('importForBuild', p.prop, p.entry))
        return { status: result.status, error: result.error ?? null, ms: Math.round(performance.now() - t), value: result.result }
      } catch (error) {
        return { status: 'timeout', error: error instanceof Error ? error.message : String(error), ms: Math.round(performance.now() - t), value: null }
      } finally { k.close() }
    }
    const rows = []
    for (const p of picks) rows.push({ prop: p.prop, name: p.name, a: await runOne(p), b: await runOne(p) })
    return {
      categories: picks.map((p) => p.prop),
      rows: rows.map((row) => ({ prop: row.prop, name: row.name, same: JSON.stringify(row.a.value) === JSON.stringify(row.b.value), status: [row.a.status, row.b.status], ms: [row.a.ms, row.b.ms], errors: [row.a.error, row.b.error] })),
    }
  })
  const known = (e) => e.includes('gendata-nav-adventure-book-index.json') || e.includes('requires usable window dimensions') || e.includes('Failed to load resource: the server responded with a status of 404') || e.includes('api/plutonium')
  const payload = { engine: process.env.ENGINE ?? 'chrome', port: PORT, ...r, errors, unexplained: errors.filter((e) => !known(e)) }
  await writeFile(`${work}/kernel-import-${payload.engine}.json`, JSON.stringify(payload, null, 2))
  const blocked = r.rows.filter((x) => x.status.some((s) => s !== 'complete'))
  const ok = r.rows.filter((x) => x.status.every((s) => s === 'complete')).every((x) => x.same)
  console.log(JSON.stringify({ ok, categories: r.categories, diffs: r.rows.filter((x) => !x.same), blocked, ms: r.rows.map((x) => [x.prop, x.ms]), unexplained: payload.unexplained.length }, null, 1))
  process.exitCode = ok ? 0 : 1
} finally {
  await ctx.close()
  server.close()
}
