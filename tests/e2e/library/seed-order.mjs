// P3 性能改进 S2：同一个人物无论排在哪次导入前后，编号一致。
// ① 同一小窗里“先甲后乙”与另一个小窗里“先乙后甲”，各自的人物编号/进阶编号逐项相同；
// ② 建档前先做别的导入，再按存档重建，重建结果与存档基准 0 差别。
import { join } from 'node:path'
import { writeFile } from 'node:fs/promises'
import { startStatic } from './static.mjs'
import { buildAll, engines, kernelInputFor, work } from './chain-common.mjs'

await buildAll()
const input = await kernelInputFor('seed-order', 'seed-order')
const PORT = 47337
const [, type, options] = engines[process.env.ENGINE === 'webkit' ? 1 : 0]
const { server, url } = await startStatic({ port: PORT })
const ctx = await type.launchPersistentContext(join(work, `profile-p3-1-${process.env.ENGINE ?? 'chrome'}`), { ...options, viewport: { width: 1280, height: 800 } })
const page = await ctx.newPage()
page.setDefaultTimeout(900000)
const errors = []
page.on('pageerror', (e) => errors.push(e.stack ?? String(e)))
page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`) })

function diff(a, b, path = '', out = [], max = 40) {
  if (out.length >= max) return out
  if (a === b) return out
  if (typeof a !== typeof b || a === null || b === null || typeof a !== 'object') { out.push({ path, a, b }); return out }
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) { out.push({ path: `${path}.length`, a: a?.length, b: b?.length }); return out }
    a.forEach((v, i) => diff(v, b[i], `${path}[${i}]`, out, max))
    return out
  }
  for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) diff(a[key], b[key], path ? `${path}.${key}` : key, out, max)
  return out
}

try {
  await page.goto(url)
  const prepared = await page.evaluate(async (input) => {
    const h = await import('/work/e2e-lib/harness.js')
    for (const id of ['cn-official', 'en-official']) {
      const audit = await h.offlineAudit(id)
      if (audit.set?.status !== 'installed' || audit.ok !== audit.planFiles) await h.install(id)
    }
    h.service.reset()
    for (const u of ['src:phb', 'src:mm', 'src:dmg']) await h.scoped.setAssignment(u, null)
    const library = h.defaultCampaignLibrary('dnd5e2014', 'cn')
    const { plan } = await h.pickChainEntries(library)
    globalThis.__h = h; globalThis.__library = library
    return { plan, library, input }
  }, input)
  const plan = prepared.plan

  const runOrder = (order) => page.evaluate(async ([plan, order]) => {
    const h = globalThis.__h
    const k = (await h.startKernelSession(globalThis.__input)).session
    const call = (fn, ...args) => k.call(fn, ...args).then((r) => { if (r.status !== 'complete') throw new Error(`${fn}: ${r.error ?? r.status}`); return r.result })
    const out = {}
    try {
      for (const name of order) {
        await call('setSeed', name)
        const imported = {}
        for (const key of ['race', 'background', 'class', 'weapon', 'spell']) imported[key] = await call('importForBuild', plan[key].ref.prop, plan[key].entry, name)
        const built = await call('buildCharacter', name, [imported.race, imported.background, imported.class], [imported.weapon, imported.spell])
        const choices = await call('captureChoices', built.id)
        const data = await h.actorData(k, built.id)
        out[name] = { id: built.id, choices, data }
      }
    } finally { k.close() }
    return out
  }, [plan, order])

  // 小窗里需要同一个启动输入；把它挂在页面全局。
  await page.evaluate((input) => { globalThis.__input = input }, input)
  const ab = await runOrder(['S2 甲', 'S2 乙'])
  const ba = await runOrder(['S2 乙', 'S2 甲'])
  const orderDiffs = {}
  const normalize = (v) => JSON.parse(JSON.stringify(v, (_k, val) => typeof val === 'string' && /^kernel\d+$/.test(val) ? 'kernel' : val))
  for (const name of ['S2 甲', 'S2 乙']) orderDiffs[name] = diff(normalize(ab[name]), normalize(ba[name]))

  // 先做别的导入，再按存档重建：0 差别。
  const extra = await page.evaluate(async ([plan, library]) => {
    const h = globalThis.__h
    const k = (await h.startKernelSession(globalThis.__input)).session
    const call = (fn, ...args) => k.call(fn, ...args).then((r) => { if (r.status !== 'complete') throw new Error(`${fn}: ${r.error ?? r.status}`); return r.result })
    try {
      await call('setSeed', 'S2 甲')
      const imported = {}
      for (const key of ['race', 'background', 'class', 'weapon', 'spell']) imported[key] = await call('importForBuild', plan[key].ref.prop, plan[key].entry, 'S2 甲')
      const built = await call('buildCharacter', 'S2 甲', [imported.race, imported.background, imported.class], [imported.weapon, imported.spell])
      const base = await h.actorData(k, built.id)
      const choices = await call('captureChoices', built.id)
      const compact = await h.compactActor({ lib: h.scoped, library, actor: { id: built.id, name: 'S2 甲' }, current: base, base, choices })
      // 先做别的导入：消耗随机序列，再重建。
      await call('importForBuild', plan.spell.ref.prop, plan.spell.entry, 'S2 甲')
      await call('importForBuild', plan.spell.ref.prop, plan.spell.entry, 'S2 甲')
      const rebuilt = await h.rebuildActor({ lib: h.scoped, session: k, library, actor: compact })
      return { status: rebuilt.status, base, rebuilt: rebuilt.data ?? null, error: rebuilt.error ?? null, detail: rebuilt.detail ?? null }
    } finally { k.close() }
  }, [plan, prepared.library])
  const extraDiffs = extra.rebuilt ? diff(normalize(extra.base), normalize(extra.rebuilt)) : [{ path: 'rebuilt', a: 'present', b: extra.error ?? extra.status }]

  const known = (e) => e.includes('gendata-nav-adventure-book-index.json') || e.includes('requires usable window dimensions') || e.includes('Failed to load resource: the server responded with a status of 404')
  const payload = { engine: process.env.ENGINE ?? 'chrome', port: PORT, orderDiffs, extra: { status: extra.status, error: extra.error, detail: extra.detail, diffs: extraDiffs }, errors, unexplained: errors.filter((e) => !known(e)) }
  await writeFile(`${work}/seed-order-${payload.engine}.json`, JSON.stringify(payload, null, 2))
  console.log(JSON.stringify({ order: Object.fromEntries(Object.entries(orderDiffs).map(([k, v]) => [k, { diffs: v.length, sample: v.slice(0, 3) }])), extra: { status: extra.status, diffs: extraDiffs.length, sample: extraDiffs.slice(0, 3) }, unexplained: payload.unexplained.length }, null, 1))
  process.exitCode = Object.values(orderDiffs).some((v) => v.length) || extraDiffs.length || payload.unexplained.length ? 1 : 0
} finally {
  await ctx.close()
  server.close()
}
