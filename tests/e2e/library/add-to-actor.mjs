// T4：给已有人物加条目（兼职 + 升级、专长、消耗品叠加），走 dnd5e 官方拖放顺序；
// 存档仍存引用/选择/状态差别；缓存命中与清空缓存两种读档都与存档前一致。
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
    const normalize = (v) => {
      const out = strip(v)
      for (const bucket of ['items', 'effects']) {
        if (!Array.isArray(out[bucket])) continue
        out[bucket] = out[bucket].map((row) => {
          const item = { ...row }
          delete item.sort
          delete item._id
          if (item.system?.sourceItem) delete item.system.sourceItem
          if (item.flags?.dnd5e && Object.keys(item.flags.dnd5e).length === 0) delete item.flags.dnd5e
          return item
        }).sort((a, b) => `${a.name}|${a.type}`.localeCompare(`${b.name}|${b.type}`))
      }
      return out
    }
    const same = (a, b) => JSON.stringify(normalize(a)) === JSON.stringify(normalize(b))
    const diff = (a, b, path = '', out = []) => {
      if (out.length > 20 || JSON.stringify(a) === JSON.stringify(b)) return out
      if (a && b && typeof a === 'object' && typeof b === 'object' && Array.isArray(a) === Array.isArray(b)) for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) diff(a[k], b[k], path ? `${path}.${k}` : k, out)
      else out.push({ path, a, b })
      return out
    }
    const library = h.defaultCampaignLibrary('dnd5e2014', 'cn')
    const { plan } = await h.pickChainEntries(library, 'barbarian')
    const { plan: second } = await h.pickChainEntries(library, 'cleric')
    const feat = async () => { const p = await h.service.parsed('cn-official', 'feat'); for (let i = 0; i < p.items.length; i++) { const d = await h.scoped.detail(library, { set: 'cn-official', prop: 'feat', hash: p.hashes[i] }); if (d && !('hidden' in d) && d.english?.status === 'found') return { set: 'cn-official', prop: 'feat', hash: p.hashes[i] } } }
    const potion = async () => { const p = await h.service.parsed('cn-official', 'item'); for (let i = 0; i < p.items.length; i++) { const item = p.items[i]; if (!String(item.type ?? '').startsWith('P')) continue; const d = await h.scoped.detail(library, { set: 'cn-official', prop: 'item', hash: p.hashes[i] }); if (d && !('hidden' in d) && d.english?.status === 'found') return { set: 'cn-official', prop: 'item', hash: p.hashes[i] } } }
    await h.userDb.workspaces.clear(); await h.userDb.saves.clear()
    const owner = { ownerKey: 'char:add.png', ownerLabel: 'T4 加条目' }
    await h.campaign.startNewCampaign({ ...owner, ruleId: 'dnd5e2014', name: 'T4 加条目' })
    const version = await h.dataVersion()
    await h.kernelSave.bind(owner.ownerKey, { rule: 'dnd5e2014', kernelVersion: 1, library, dataVersion: version, overrides: [], actors: [], revision: 0, undo: [] })
    const mk = () => new h.KernelRuntime({ pluginRoot: new URL('/', location.href), files: h.files, scoped: h.scoped, container: () => document.body,
      cache: { db: h.libraryDb, dataVersion: h.dataVersion }, campaignOf: async () => ({ rule: 'dnd5e2014', library, title: owner.ownerLabel }) })
    const rt = mk()
    const built = await rt.buildCharacter(owner.ownerKey, { name: 'T4 角色', items: ['race', 'background', 'class'].map((k) => plan[k].ref), equipment: ['weapon', 'spell'].map((k) => plan[k].ref) })
    if (built.status !== 'complete' || !built.id) throw new Error(`build: ${built.error ?? built.status}`)
    const id = built.id
    const f = await feat(); const p = await potion()
    const add1 = await rt.addToActor(owner.ownerKey, id, [f, p, p])
    const add2 = await rt.addToActor(owner.ownerKey, id, [second.class.ref])
    if (add1.status !== 'complete' || add2.status !== 'complete') throw new Error(`add: ${add1.error ?? add1.status} / ${add2.error ?? add2.status}`)
    const classAdded = add2.result?.added?.[0]
    if (!classAdded?._id) throw new Error('第二职业没有建出来')
    const up = await (await rt.session(owner.ownerKey)).session.call('levelUpApply', id, classAdded._id, 1)
    const session = (await rt.session(owner.ownerKey)).session
    const current = await h.actorData(session, id)
    const compacts = await rt.compact(owner.ownerKey, [id])
    const bound = await h.kernelSave.read(owner.ownerKey)
    await h.kernelSave.bind(owner.ownerKey, { ...bound, actors: compacts, revision: 1 })
    await rt.close(owner.ownerKey)
    const hot = mk()
    const hotResult = (await hot.rebuildMany(owner.ownerKey, compacts))[0]
    const hotDiff = hotResult.status === 'complete' ? diff(normalize(current), normalize(hotResult.data)) : [{ path: 'status', a: 'complete', b: hotResult.status }]
    await hot.close(owner.ownerKey)
    await h.libraryDb.derived.where('key').startsWith('kc:').delete()
    const cold = mk()
    const coldResult = (await cold.rebuildMany(owner.ownerKey, compacts))[0]
    const coldDiff = coldResult.status === 'complete' ? diff(normalize(current), normalize(coldResult.data)) : [{ path: 'status', a: 'complete', b: coldResult.status }]
    const classes = current.items.filter((i) => i.type === 'class').map((i) => ({ name: i.name, levels: i.system.levels }))
    const potionItem = current.items.find((i) => i.name === p?.hash || i.name?.toLowerCase().includes('potion'))
    return {
      build: { status: built.status, seed: built.seed }, add: { first: add1.status, second: add2.status, stacked: add1.result?.stacked, added: add1.result?.added?.length },
      levelUp: { status: up.status, level: up.result?.level, classes }, classAdded: { name: classAdded.name, levels: classAdded.system?.levels },
      hot: { status: hotResult.status, diffs: hotDiff.length, sample: hotDiff.slice(0, 4) }, cold: { status: coldResult.status, error: coldResult.error, detail: coldResult.detail, diffs: coldDiff.length, sample: coldDiff.slice(0, 4) },
      choices: Object.keys(compacts[0].choices), choiceIds: Object.entries(compacts[0].choices).map(([k,rows])=>[k,rows.map(r=>[r.id,r.type,r.level])]), refs: compacts[0].refs.map(r=>[r.label,r.itemId]), stateItemKeys: Object.keys(compacts[0].state.items ?? {}), items: current.items.length, potion: potionItem ? { name: potionItem.name, qty: potionItem.system?.quantity } : null,
    }
  })
  const known = (e) => e.includes('gendata-nav-adventure-book-index.json') || e.includes('requires usable window dimensions') || e.includes('Failed to load resource: the server responded with a status of 404') || e.includes('api/plutonium')
  const payload = { engine: process.env.ENGINE ?? 'chrome', port: PORT, ...r, errors, unexplained: errors.filter((e) => !known(e)) }
  await writeFile(`${work}/add-to-actor-${payload.engine}.json`, JSON.stringify(payload, null, 2))
  const ok = r.add.first === 'complete' && r.add.second === 'complete' && r.levelUp.status === 'complete' && r.hot.status === 'complete' && r.hot.diffs === 0 && r.cold.status === 'complete' && r.cold.diffs === 0 && !payload.unexplained.length
  console.log(JSON.stringify({ ok, ...r, unexplained: payload.unexplained.length }, null, 1))
  process.exitCode = ok ? 0 : 1
} finally { await ctx.close(); server.close() }
