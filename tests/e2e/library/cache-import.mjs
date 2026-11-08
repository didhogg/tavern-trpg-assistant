// P3 性能改进 S3：Plutonium 换算结果缓存的正式验证。
// 同一真实条目第二次、以及新开小窗后，命中缓存；命中结果与第一次现场换算逐项相同。
// 数据版本记号 / 条目内容变了，钥匙就变（不会误命中）。
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
page.setDefaultTimeout(900000)
const errors = []
page.on('pageerror', (e) => errors.push(e.stack ?? String(e)))
page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`) })

try {
  await page.goto(url)
  const result = await page.evaluate(async () => {
    const h = await import('/work/e2e-lib/harness.js')
    const norm = (v) => JSON.parse(JSON.stringify(v, (k, val) => {
      if (k === '_id' || k === '_stats' || k === 'ownership') return undefined
      return typeof val === 'string' && /^kernel\d+$/.test(val) ? 'kernel' : val
    }))
    const same = (a, b) => JSON.stringify(norm(a)) === JSON.stringify(norm(b))
    const library = h.defaultCampaignLibrary('dnd5e2014', 'cn')
    const { plan, monster } = await h.pickChainEntries(library)
    const input = await h.kernelInput({ pluginRoot: new URL('/', location.href), rule: 'dnd5e2014', world: { id: 's3-cache', title: 's3-cache' } })
    const version = await h.dataVersion()
    const cache = new h.KernelCache(h.libraryDb)
    await h.libraryDb.derived.where('key').startsWith('kc:').delete()
    const mk = async (versionFn = h.dataVersion) => {
      const raw = (await h.startKernelSession(input)).session
      return { raw, session: h.wrapKernelSession(raw, cache, input.cacheKey, versionFn) }
    }
    const k1 = await mk()
    const measure = async (fn) => { const t = performance.now(); const v = await fn(); return { ms: Math.round(performance.now() - t), v } }
    const weapon1 = await measure(() => k1.session.call('importForBuild', plan.weapon.ref.prop, plan.weapon.entry))
    const weapon2 = await measure(() => k1.session.call('importForBuild', plan.weapon.ref.prop, plan.weapon.entry))
    const spell1 = await measure(() => k1.session.call('importForBuild', plan.spell.ref.prop, plan.spell.entry))
    const spell2 = await measure(() => k1.session.call('importForBuild', plan.spell.ref.prop, plan.spell.entry))
    const monster1 = await measure(() => k1.session.call('importMonsterActor', monster.entry))
    const monster2 = await measure(() => k1.session.call('importMonsterActor', monster.entry))
    const m1 = await h.actorData(k1.raw, monster1.v.result.id)
    const m2 = await h.actorData(k1.raw, monster2.v.result.id)
    k1.raw.close()

    // 新开小窗：仍然命中。
    const k2 = await mk()
    const weapon3 = await measure(() => k2.session.call('importForBuild', plan.weapon.ref.prop, plan.weapon.entry))
    const monster3 = await measure(() => k2.session.call('importMonsterActor', monster.entry))
    const m3 = await h.actorData(k2.raw, monster3.v.result.id)
    k2.raw.close()

    const originalKey = await h.kernelImportKey({ base: input.cacheKey, dataVersion: version, kind: 'build', prop: plan.weapon.ref.prop, entry: plan.weapon.entry })
    const changedVersion = await h.kernelImportKey({ base: input.cacheKey, dataVersion: { ...version, official: 'changed' }, kind: 'build', prop: plan.weapon.ref.prop, entry: plan.weapon.entry })
    const changedEntry = await h.kernelImportKey({ base: input.cacheKey, dataVersion: version, kind: 'build', prop: plan.weapon.ref.prop, entry: { ...plan.weapon.entry, name: 'changed' } })
    const keysBeforeChanged = (await h.libraryDb.derived.where('key').startsWith('kc:').toArray()).length
    const changed = await mk(async () => ({ ...version, official: 'changed' }))
    const changedWeapon = await measure(() => changed.session.call('importForBuild', plan.weapon.ref.prop, plan.weapon.entry))
    changed.raw.close()
    const keys = await h.libraryDb.derived.where('key').startsWith('kc:').toArray()
    return {
      changedVersion: { ms: changedWeapon.ms, status: changedWeapon.v.status, cacheRowsAdded: keys.length - keysBeforeChanged },
      ms: { weapon1: weapon1.ms, weapon2: weapon2.ms, weapon3: weapon3.ms, spell1: spell1.ms, spell2: spell2.ms, monster1: monster1.ms, monster2: monster2.ms, monster3: monster3.ms },
      same: { weapon: same(weapon1.v.result, weapon2.v.result) && same(weapon1.v.result, weapon3.v.result), spell: same(spell1.v.result, spell2.v.result), monster: same(m1, m2) && same(m1, m3) },
      cacheRows: keys.length,
      keyChanged: { version: originalKey !== changedVersion, entry: originalKey !== changedEntry },
      status: { weapon: [weapon1.v.status, weapon2.v.status, weapon3.v.status], monster: [monster1.v.status, monster2.v.status, monster3.v.status] },
    }
  })
  const known = (e) => e.includes('gendata-nav-adventure-book-index.json') || e.includes('requires usable window dimensions') || e.includes('Failed to load resource: the server responded with a status of 404')
  const payload = { engine: process.env.ENGINE ?? 'chrome', port: PORT, ...result, errors, unexplained: errors.filter((e) => !known(e)) }
  await writeFile(`${work}/cache-import-${payload.engine}.json`, JSON.stringify(payload, null, 2))
  const ok = Object.values(result.same).every(Boolean) && Object.values(result.keyChanged).every(Boolean) && result.status.weapon.every((s) => s === 'complete') && result.status.monster.every((s) => s === 'complete') && !payload.unexplained.length
  console.log(JSON.stringify({ ok, ...result, unexplained: payload.unexplained.length }, null, 1))
  process.exitCode = ok ? 0 : 1
} finally {
  await ctx.close()
  server.close()
}
