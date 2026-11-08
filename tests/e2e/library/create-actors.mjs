// T5：怪物 / NPC / 传奇怪物 / 载具 / 物件统一批量建；一次 createDocuments；10 只缓存后计时，50 只照实报。
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
    const library = h.defaultCampaignLibrary('dnd5e2014', 'cn')
    const monsterRows = []
    const p = await h.service.parsed('cn-official', 'monster')
    for (let i = 0; i < p.items.length && monsterRows.length < 60; i++) {
      if (!['MM', 'PHB', 'DMG'].includes(p.sources[i])) continue
      const d = await h.scoped.detail(library, { set: 'cn-official', prop: 'monster', hash: p.hashes[i] })
      if (!d || 'hidden' in d || d.english?.status !== 'found') continue
      monsterRows.push({ ref: { set: 'cn-official', prop: 'monster', hash: p.hashes[i] }, entry: d.english.item, item: p.items[i] })
    }
    const pick = async (prop, pred) => {
      const q = await h.service.parsed('cn-official', prop); if (!q) return null
      for (let i = 0; i < q.items.length; i++) {
        if (!pred(q.items[i])) continue
        const d = await h.scoped.detail(library, { set: 'cn-official', prop, hash: q.hashes[i] })
        if (d && !('hidden' in d) && d.english?.status === 'found') return { ref: { set: 'cn-official', prop, hash: q.hashes[i] }, entry: d.english.item }
      }
      return null
    }
    const vehicle = await pick('vehicle', () => true)
    const object = await pick('object', () => true)
    const normal = monsterRows.find((x) => !x.item.spellcasting && !x.item.legendary)
    const caster = monsterRows.find((x) => !!x.item.spellcasting)
    const legend = monsterRows.find((x) => !!x.item.legendary)
    await h.userDb.workspaces.clear(); await h.userDb.saves.clear()
    const owner = { ownerKey: 'char:t5.png', ownerLabel: 'T5 批量' }
    await h.campaign.startNewCampaign({ ...owner, ruleId: 'dnd5e2014', name: 'T5 批量' })
    const version = await h.dataVersion()
    await h.kernelSave.bind(owner.ownerKey, { rule: 'dnd5e2014', kernelVersion: 1, library, dataVersion: version, overrides: [], actors: [], revision: 0, undo: [] })
    const rt = new h.KernelRuntime({ pluginRoot: new URL('/', location.href), files: h.files, scoped: h.scoped, container: () => document.body,
      cache: { db: h.libraryDb, dataVersion: h.dataVersion }, campaignOf: async () => ({ rule: 'dnd5e2014', library, title: owner.ownerLabel }) })
    const sample = await rt.createActors(owner.ownerKey, [normal, caster, legend, vehicle, object].filter(Boolean).map((x) => x.ref))
    const ten = monsterRows.filter((x) => !x.item.spellcasting && !x.item.legendary).slice(0, 10).map((x) => x.ref)
    const t = performance.now()
    const tenResult = await rt.createActors(owner.ownerKey, ten)
    const tenMs = Math.round(performance.now() - t)
    const fifty = monsterRows.slice(0, 50).map((x) => x.ref)
    const t2 = performance.now()
    const fiftyResult = await rt.createActors(owner.ownerKey, fifty)
    const fiftyMs = Math.round(performance.now() - t2)
    const t3 = performance.now()
    const fiftyCached = await rt.createActors(owner.ownerKey, fifty)
    const fiftyCachedMs = Math.round(performance.now() - t3)
    await rt.close(owner.ownerKey)
    return {
      sample: { status: sample.status, count: sample.actors?.length ?? 0, types: sample.actors?.map((a) => a.type), error: sample.error, names: [normal?.entry?.name, caster?.entry?.name, legend?.entry?.name, vehicle?.entry?.name, object?.entry?.name] },
      ten: { status: tenResult.status, count: tenResult.actors?.length ?? 0, ms: tenMs, error: tenResult.error },
      fifty: { status: fiftyResult.status, count: fiftyResult.actors?.length ?? 0, ms: fiftyMs, error: fiftyResult.error },
      fiftyCached: { status: fiftyCached.status, count: fiftyCached.actors?.length ?? 0, ms: fiftyCachedMs, error: fiftyCached.error },
    }
  })
  const known = (e) => e.includes('gendata-nav-adventure-book-index.json') || e.includes('requires usable window dimensions') || e.includes('Failed to load resource: the server responded with a status of 404') || e.includes('api/plutonium') || e.includes('Could not check for existing files when saving imported images')
  const payload = { engine: process.env.ENGINE ?? 'chrome', port: PORT, ...r, errors, unexplained: errors.filter((e) => !known(e)) }
  await writeFile(`${work}/create-actors-${payload.engine}.json`, JSON.stringify(payload, null, 2))
  const ok = r.sample.status === 'complete' && r.sample.count >= 5 && r.ten.status === 'complete' && r.ten.count === 10 && r.fifty.status === 'complete' && r.fifty.count === 50 && r.fiftyCached.status === 'complete' && !payload.unexplained.length
  console.log(JSON.stringify({ ok, ...r, unexplained: payload.unexplained.length }, null, 1))
  process.exitCode = ok ? 0 : 1
} finally { await ctx.close(); server.close() }
