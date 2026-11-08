// T2 小样验证：预换算按作者统一入口跑、压缩存【库】、第二次跳过；全量在 T6 按执行文档跑。
// 不写类别清单：类别由已解析数据 + 作者登记表动态发现。
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
    await h.libraryDb.derived.where('key').startsWith('kc:').delete()
    const pre = new h.KernelPrecompute({ pluginRoot: new URL('/', location.href), files: h.files, scoped: h.scoped, db: h.libraryDb, dataVersion: h.dataVersion })
    const a = await pre.run({ codeSet: 'cn', limit: 20 })
    const b = await pre.run({ codeSet: 'cn', limit: 20 })
    const rows = await h.libraryDb.derived.where('key').startsWith('kc:').toArray()
    return { a, b, rows: rows.length, z: rows.filter((x) => x.value?.z).length, samples: rows.slice(0, 3).map((x) => ({ key: x.key.slice(0, 20), raw: x.value?.raw, compressed: x.value?.z?.byteLength })) }
  })
  const known = (e) => e.includes('gendata-nav-adventure-book-index.json') || e.includes('requires usable window dimensions') || e.includes('Failed to load resource: the server responded with a status of 404') || e.includes('api/plutonium')
  const payload = { engine: process.env.ENGINE ?? 'chrome', port: PORT, ...r, errors, unexplained: errors.filter((e) => !known(e)) }
  await writeFile(`${work}/precompute-kernel-${payload.engine}.json`, JSON.stringify(payload, null, 2))
  const ok = r.a.total === 20 && r.a.done === 20 && r.a.failed.length === 0 && r.b.converted === 0 && r.b.cached === 20 && r.z === r.rows && !payload.unexplained.length
  console.log(JSON.stringify({ ok, first: { total: r.a.total, converted: r.a.converted, cached: r.a.cached, failed: r.a.failed.length, raw: r.a.rawBytes, compressed: r.a.compressedBytes, ms: r.a.ms }, second: { converted: r.b.converted, cached: r.b.cached, ms: r.b.ms }, rows: r.rows, z: r.z, unexplained: payload.unexplained.length }, null, 1))
  process.exitCode = ok ? 0 : 1
} finally { await ctx.close(); server.close() }
