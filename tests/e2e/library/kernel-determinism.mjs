// 换算与先后顺序无关（设计 §3.1 同输入同结果；P3-3b 编号要稳定）：
// 类别从已解析数据 + 作者登记表自动发现（不写类别清单），每类均匀抽样；两个新小窗正序 / 倒序各换一遍，
// 再和【库】里已存的换算结果比：三者逐条完全相同才过。
import { join } from 'node:path'
import { writeFile } from 'node:fs/promises'
import { startStatic } from './static.mjs'
import { buildAll, engines, work, knownError } from './chain-common.mjs'

await buildAll()
const ENGINE = process.env.ENGINE ?? 'chrome'
const PER_PROP = Number(process.env.PER_PROP ?? 12)
const [, type, options] = engines[ENGINE === 'webkit' ? 1 : 0]
const { server, url } = await startStatic({ port: 47337 })
const ctx = await type.launchPersistentContext(join(work, `profile-p3-1-${ENGINE}`), { ...options })
const page = await ctx.newPage()
page.setDefaultTimeout(20 * 60_000)
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 300)); else if (m.text().startsWith('[det]')) console.log(m.text()) })
try {
  await page.goto(url)
  const r = await page.evaluate(async (PER_PROP) => {
    const h = await import('/work/e2e-lib/harness.js')
    const library = h.defaultCampaignLibrary('dnd5e2014', 'cn')
    const input = await h.kernelInput({ pluginRoot: new URL('/', location.href), rule: 'dnd5e2014', world: { id: 'det', title: 'det' } })
    const open = async () => (await h.startKernelSession(input)).session
    const props = new Set()
    await h.libraryDb.derived.where('key').startsWith('parsed:cn-official:').each((rec) => { const p = rec.key.split(':')[2]; if (p && p !== 'corpus' && !p.startsWith('raw_')) props.add(p) })
    const probe = await open()
    const meta = await probe.call('importerMeta', [...props])
    probe.close?.()
    const usable = meta.filter((m) => m.folderType === 'Item' || m.folderType === 'Actor').map((m) => m.prop)
    const rows = []
    for (const prop of usable) {
      const all = (await h.scoped.query(library, prop)).filter((x) => typeof x.item?.name === 'string')
      const step = Math.max(1, Math.floor(all.length / PER_PROP))
      for (let i = 0, n = 0; i < all.length && n < PER_PROP; i += step, n++) {
        const k = await h.kernelEntryOf(h.scoped, library.codeSet, all[i].ref, all[i].item, all[i].version.altId)
        rows.push({ prop, name: all[i].item.name, entry: k.entry })
      }
    }
    console.log(`[det] 类别 ${usable.length}，抽样 ${rows.length} 条`)
    const conv = async (order) => {
      const s = await open()
      const out = new Array(rows.length)
      for (const i of order) { const res = await s.call('importForBuild', rows[i].prop, rows[i].entry); out[i] = res.status === 'complete' ? JSON.stringify(res.result) : `FAIL:${res.error}` }
      s.close?.()
      return out
    }
    const idx = rows.map((_, i) => i)
    const A = await conv(idx)
    console.log('[det] 正序换完')
    const B = await conv([...idx].reverse())
    console.log('[det] 倒序换完')
    const dv = await h.dataVersion()
    const cache = new h.KernelCache(h.libraryDb)
    let cached = 0
    const bad = []
    for (let i = 0; i < rows.length; i++) {
      const key = await h.kernelImportKey({ base: input.cacheKey, dataVersion: dv, kind: rows[i].prop === 'monster' ? 'monster' : 'build', prop: rows[i].prop, entry: rows[i].entry })
      const c = await cache.get(key)
      if (c !== null) cached++
      const C = c === null ? A[i] : JSON.stringify(c)
      if (A[i] !== B[i] || A[i] !== C || A[i].startsWith('FAIL:')) bad.push({ prop: rows[i].prop, name: rows[i].name, order: A[i] !== B[i], cache: A[i] !== C, fail: A[i].startsWith('FAIL:') ? A[i].slice(0, 160) : null })
    }
    return { props: usable, sampled: rows.length, comparedWithCache: cached, bad }
  }, PER_PROP)
  const unexplained = errors.filter((e) => !knownError(e))
  const payload = { engine: ENGINE, ...r, unexplained }
  await writeFile(`${work}/kernel-determinism-${ENGINE}.json`, JSON.stringify(payload, null, 1))
  const ok = r.sampled > 0 && r.bad.length === 0 && unexplained.length === 0
  console.log(JSON.stringify({ ok, props: r.props.length, sampled: r.sampled, comparedWithCache: r.comparedWithCache, bad: r.bad.slice(0, 10), unexplained: unexplained.slice(0, 5) }))
  process.exitCode = ok ? 0 : 1
} finally { await ctx.close(); server.close() }
