// P3 性能改进 S4：人物重建基准缓存 + 批量建。
// 5 个真实人物：存档时缓存基准；新小窗全部命中 → 一次 createDocuments；一个人没命中 → 只重算他；
// 清空缓存仍能按引用重建；带 HP 差别，叠状态后与存档前当前值一致。
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
page.setDefaultTimeout(1800000)
const errors = []
page.on('pageerror', (e) => errors.push(e.stack ?? String(e)))
page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`) })

try {
  await page.goto(url)
  const r = await page.evaluate(async () => {
    const h = await import('/work/e2e-lib/harness.js')
    const strip = (v) => JSON.parse(JSON.stringify(v, (k, val) => (k === '_stats' || k === 'ownership') ? undefined : (typeof val === 'string' && /^kernel\d+$/.test(val) ? 'kernel' : val)))
    const same = (a, b) => a !== undefined && b !== undefined && JSON.stringify(strip(a)) === JSON.stringify(strip(b))
    await h.userDb.workspaces.clear(); await h.userDb.saves.clear()
    const owner = { ownerKey: 'char:s4-cache.png', ownerLabel: 'S4 缓存' }
    await h.campaign.startNewCampaign({ ...owner, ruleId: 'dnd5e2014', name: 'S4 缓存' })
    const library = h.defaultCampaignLibrary('dnd5e2014', 'cn')
    const version = await h.dataVersion()
    await h.kernelSave.bind(owner.ownerKey, { rule: 'dnd5e2014', kernelVersion: 1, library, dataVersion: version, overrides: [], actors: [], revision: 0, undo: [] })
    const { plan } = await h.pickChainEntries(library)
    const runtimeOf = () => new h.KernelRuntime({
      pluginRoot: new URL('/', location.href),
      files: h.files,
      scoped: h.scoped,
      container: () => document.body,
      cache: { db: h.libraryDb, dataVersion: h.dataVersion },
      campaignOf: async (ownerKey) => {
        const bound = await h.kernelSave.read(ownerKey)
        const ws = await h.campaign.getWorkspace(ownerKey)
        return { rule: bound.rule, library: ws.data.library ?? bound.library, title: ws.ownerLabel }
      },
    })
    const rt1 = runtimeOf()
    const tSession = performance.now()
    const session = (await rt1.session(owner.ownerKey)).session
    const bootMs = Math.round(performance.now() - tSession)
    const names = ['S4 甲', 'S4 乙', 'S4 丙', 'S4 丁', 'S4 戊']
    const ids = []
    for (const name of names) {
      const built = await rt1.buildCharacter(owner.ownerKey, {
        name,
        items: ['race', 'background', 'class'].map((key) => plan[key].ref),
        equipment: ['weapon', 'spell'].map((key) => plan[key].ref),
      })
      if (built.status !== 'complete' || !built.id) throw new Error(`build ${name}: ${built.error ?? built.status}`)
      ids.push(built.id)
    }
    // 第一个人扣 3 点血：存档基准是扣血前，状态差别要叠回去。
    await session.call('damage', ids[0], [{ value: 3, type: 'slashing' }], [], {})
    const currents = {}
    for (const id of ids) currents[id] = await h.actorData(session, id)
    const tCompact = performance.now()
    const compacts = await rt1.compact(owner.ownerKey, ids)
    const compactMs = Math.round(performance.now() - tCompact)
    const bound = await h.kernelSave.read(owner.ownerKey)
    await h.kernelSave.bind(owner.ownerKey, { ...bound, actors: compacts, revision: 1 })
    await rt1.close(owner.ownerKey)

    const rt2 = runtimeOf()
    const tAll = performance.now()
    const all = await rt2.rebuildMany(owner.ownerKey, compacts)
    const allMs = Math.round(performance.now() - tAll)
    const allSame = all.every((x, i) => x.status === 'complete' && x.id && same(x.data, currents[ids[i]]))
    const allIds = all.map((x) => x.id)

    // 删掉一个人的基准：只重算他。
    const input = await h.kernelInput({ pluginRoot: new URL('/', location.href), rule: 'dnd5e2014', world: { id: 's4', title: 's4' } })
    const oneKey = await h.kernelBaseKey({ base: input.cacheKey, dataVersion: version, actor: compacts[0] })
    await h.libraryDb.derived.delete(`kc:${oneKey}`)
    const rt3 = runtimeOf()
    const tOne = performance.now()
    const mixed = await rt3.rebuildMany(owner.ownerKey, compacts)
    const mixedMs = Math.round(performance.now() - tOne)
    const mixedSame = mixed.every((x, i) => x.status === 'complete' && x.id && same(x.data, currents[ids[i]]))

    // 50 人规模：把同一份基准复制 50 份（不同人物编号）走同一条批量入口，照实报时间。
    const base50 = all[0]?.base
    const cache50 = new h.KernelCache(h.libraryDb)
    const fifty = []
    for (let i = 0; i < 50; i++) {
      const id = `kernel50${String(i).padStart(8, '0')}`
      const base = { ...structuredClone(base50), _id: id, name: `S4 50 ${i}` }
      const actor = { ...compacts[0], id, name: `S4 50 ${i}` }
      const key = await h.kernelBaseKey({ base: input.cacheKey, dataVersion: version, actor })
      await cache50.put(key, base)
      fifty.push(actor)
    }
    const rt50 = runtimeOf()
    const t50 = performance.now()
    const batch50 = await rt50.rebuildMany(owner.ownerKey, fifty)
    const batch50Ms = Math.round(performance.now() - t50)
    const batch50Ok = batch50.every((x) => x.status === 'complete' && x.id)
    await rt50.close(owner.ownerKey)

    // 缓存全清：仍能读档。
    await h.libraryDb.derived.where('key').startsWith('kc:').delete()
    const rt4 = runtimeOf()
    const tCold = performance.now()
    const cold = await rt4.rebuildMany(owner.ownerKey, compacts)
    const coldMs = Math.round(performance.now() - tCold)
    const coldSame = cold.every((x, i) => x.status === 'complete' && x.id && same(x.data, currents[ids[i]]))
    const cacheRows = (await h.libraryDb.derived.where('key').startsWith('kc:').toArray()).length
    return { bootMs, compactMs, allMs, mixedMs, coldMs, batch50Ms, batch50Ok, count: compacts.length, allSame, mixedSame, coldSame, allIds, currentIds: Object.keys(currents), rebuiltIds: all.map((x) => x.id), allData: all.map((x) => ({ id: x.id, hasData: !!x.data, error: x.error ?? null })), status: { all: all.map((x) => x.status), mixed: mixed.map((x) => x.status), cold: cold.map((x) => x.status) }, cacheRows }
  })
  const known = (e) => e.includes('gendata-nav-adventure-book-index.json') || e.includes('requires usable window dimensions') || e.includes('Failed to load resource: the server responded with a status of 404')
  const payload = { engine: process.env.ENGINE ?? 'chrome', port: PORT, ...r, errors, unexplained: errors.filter((e) => !known(e)) }
  await writeFile(`${work}/rebuild-cache-${payload.engine}.json`, JSON.stringify(payload, null, 2))
  const ok = r.allSame && r.mixedSame && r.coldSame && r.batch50Ok && r.status.all.every((s) => s === 'complete') && r.status.mixed.every((s) => s === 'complete') && r.status.cold.every((s) => s === 'complete') && !payload.unexplained.length
  console.log(JSON.stringify({ ok, bootMs: r.bootMs, compactMs: r.compactMs, allMs: r.allMs, mixedMs: r.mixedMs, coldMs: r.coldMs, batch50Ms: r.batch50Ms, allSame: r.allSame, mixedSame: r.mixedSame, coldSame: r.coldSame, batch50Ok: r.batch50Ok, count: r.count, cacheRows: r.cacheRows, unexplained: payload.unexplained.length }, null, 1))
  process.exitCode = ok ? 0 : 1
} finally { await ctx.close(); server.close() }
