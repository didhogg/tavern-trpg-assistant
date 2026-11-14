// T3：不设任何种子，建人物 → 改名 / 两个重名 → 清空缓存后按存档种子重建，结果与存档前一致。
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
    const strip = (v) => JSON.parse(JSON.stringify(v, (k, val) => (k === '_stats' || k === 'ownership') ? undefined : (typeof val === 'string' && /^kernel\d+$/.test(val) ? 'kernel' : val)))
    const same = (a, b) => JSON.stringify(strip(a)) === JSON.stringify(strip(b))
    const diff = (a, b, path = '', out = []) => {
      if (out.length > 20 || JSON.stringify(a) === JSON.stringify(b)) return out
      if (a && b && typeof a === 'object' && typeof b === 'object' && Array.isArray(a) === Array.isArray(b)) {
        for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) diff(a[k], b[k], path ? `${path}.${k}` : k, out)
      } else out.push({ path, a, b })
      return out
    }
    const library = h.defaultCampaignLibrary('dnd5e2014', 'cn')
    const { plan } = await h.pickChainEntries(library)
    await h.userDb.workspaces.clear(); await h.userDb.saves.clear()
    const owner = { ownerKey: 'char:seed-save.png', ownerLabel: 'T3 种子' }
    await h.campaign.startNewCampaign({ ...owner, ruleId: 'dnd5e2014', name: 'T3 种子' })
    const version = await h.dataVersion()
    await h.kernelSave.bind(owner.ownerKey, { rule: 'dnd5e2014', kernelVersion: 1, library, dataVersion: version, overrides: [], actors: [], revision: 0, undo: [] })
    const mk = () => new h.KernelRuntime({ revisions: h.revisions,
      pluginRoot: new URL('/', location.href), files: h.files, scoped: h.scoped, container: () => document.body,
      cache: { db: h.libraryDb, dataVersion: h.dataVersion },
      campaignOf: async (ownerKey) => ({ rule: 'dnd5e2014', library, title: ownerKey }),
    })
    const rt = mk()
    const session = (await rt.session(owner.ownerKey)).session
    const ids = []
    for (const name of ['同名人物', '同名人物']) {
      const built = await rt.buildCharacter(owner.ownerKey, {
        name,
        items: ['race', 'background', 'class'].map((key) => plan[key].ref),
        equipment: ['weapon', 'spell'].map((key) => plan[key].ref),
      })
      if (built.status !== 'complete' || !built.id) throw new Error(`build: ${built.error ?? built.status}`)
      ids.push(built.id)
    }
    await session.call('renameActor', ids[1], '改过名的人物')
    const currents = {}
    for (const id of ids) currents[id] = await h.actorData(session, id)
    const compacts = await rt.compact(owner.ownerKey, ids)
    const seeds = compacts.map((x) => x.seed)
    const choiceKeys = compacts.map((x) => Object.keys(x.choices))
    const choiceIds = compacts.map((x) => Object.entries(x.choices).flatMap(([k, rows]) => rows.map((r) => [k, r.id, r.type, r.level])))
    await rt.close(owner.ownerKey)
    // 清空换算/人物基准缓存，只留下存档里的引用、选择、状态差别和人物种子。
    await h.libraryDb.derived.where('key').startsWith('kc:').delete()
    const rt2 = mk()
    const t = performance.now()
    const rebuilt = await rt2.rebuildMany(owner.ownerKey, compacts)
    const ms = Math.round(performance.now() - t)
    const rows = rebuilt.map((x, i) => ({ status: x.status, same: x.status === 'complete' && same(x.data, currents[ids[i]]), id: x.id, error: x.error, detail: x.detail ?? null, diffs: x.data ? diff(strip(currents[ids[i]]), strip(x.data)).slice(0, 10) : [] }))
    return { names: ['同名人物', '改过名的人物'], ids, seeds, choiceKeys, choiceIds, sameSeed: seeds[0] === seeds[1], rows, ms, cacheRows: (await h.libraryDb.derived.where('key').startsWith('kc:').toArray()).length }
  })
  const known = (e) => e.includes('gendata-nav-adventure-book-index.json') || e.includes('requires usable window dimensions') || e.includes('Failed to load resource: the server responded with a status of 404') || e.includes('api/plutonium')
  const payload = { engine: process.env.ENGINE ?? 'chrome', port: PORT, ...r, errors, unexplained: errors.filter((e) => !known(e)) }
  await writeFile(`${work}/seed-order-${payload.engine}.json`, JSON.stringify(payload, null, 2))
  const ok = r.rows.every((x) => x.status === 'complete' && x.same) && !r.sameSeed && !payload.unexplained.length
  console.log(JSON.stringify({ ok, names: r.names, seeds: r.seeds, sameSeed: r.sameSeed, rows: r.rows, ms: r.ms, cacheRows: r.cacheRows, unexplained: payload.unexplained.length }, null, 1))
  process.exitCode = ok ? 0 : 1
} finally { await ctx.close(); server.close() }
