// P6-R 旧存档（只有引用、没有完整数据 doc）读进来后第一次写入、撤销、重开（驾驶员真机「费伦大陆」就是这种）：
// 建一人 + 模板怪物 → 把存档里的 doc 去掉、按旧存法重开小窗读档 → 改力量 +1（第一次写 = 换存法）→ 小窗和存档都是新值
// → 撤销：小窗回到原值（11-24 真机：撤销后小窗还是新值，因为第一次写把重建基准缓存顶成了改后的整份）→ 再改 → 关窗重开读档仍是新值。
import { startStatic } from './static.mjs'
import { buildAll, E2E_PORT, engines, freshFromBase } from './chain-common.mjs'
if (!process.env.SKIP_BUILD) await buildAll()
const [, type, options] = engines[process.env.ENGINE === 'webkit' ? 1 : 0]
const { server, url } = await startStatic({ port: E2E_PORT })
const killer = setTimeout(() => { console.error('超时 8 分钟'); process.exit(2) }, 8 * 60_000)
const ctx = await type.launchPersistentContext(freshFromBase(process.env.ENGINE === 'webkit' ? 'webkit' : 'chrome', 'p6-r-migrate'), { ...options })
const page = await ctx.newPage(); page.setDefaultTimeout(7 * 60_000)
const errors = []
page.on('pageerror', (e) => errors.push(e.stack ?? String(e)))
try {
  await page.goto(url)
  const r = await page.evaluate(async () => {
    const h = await import('/work/e2e-lib/harness.js')
    for (const id of ['cn-official', 'en-official']) { const a = await h.offlineAudit(id); if (a.set?.status !== 'installed' || a.ok !== a.planFiles) await h.install(id) }
    const library = h.defaultCampaignLibrary('dnd5e2014', 'cn')
    const { plan, monster } = await h.pickChainEntries(library, 'barbarian')
    await h.userDb.workspaces.clear(); await h.userDb.saves.clear()
    const owner = 'char:p6rmigrate.png'
    await h.campaign.startNewCampaign({ ownerKey: owner, ownerLabel: '迁移', ruleId: 'dnd5e2014', name: '迁移' })
    await h.kernelSave.bind(owner, { rule: 'dnd5e2014', kernelVersion: 1, library, dataVersion: await h.dataVersion(), overrides: [], actors: [], revision: 0, undo: [] })
    const mk = () => new h.KernelRuntime({ revisions: h.revisions, pluginRoot: new URL('/', location.href), files: h.files, scoped: h.scoped, service: h.service, container: () => document.body,
      cache: { db: h.libraryDb, dataVersion: h.dataVersion }, campaignOf: async () => ({ rule: 'dnd5e2014', library, title: '迁移' }) })
    const open = () => { const rt = mk(); const saves = new h.kernelSave.constructor({ ...h.kernelSave.deps, compactActors: (k, ids) => rt.compact(k, ids), mapRef: (k) => rt.mapRef(k) }); return { rt, saves, people: new h.KernelPeople({ runtime: rt, saves }) } }
    let w = open()
    const b = await w.people.build(owner, { name: '旧存法英雄', items: ['race', 'background', 'class'].map((k) => plan[k].ref) }, { category: 'party' })
    const m = await w.people.fromTemplate(owner, monster.ref, 1, { category: 'enemy' })
    const ids = [b.built.id, ...m.made.actors.map((a) => a.id)]
    // 变成旧存法：去掉 doc（引用 / 选择 / 差别都在），清掉撤销，重开小窗读档
    const k0 = await w.saves.read(owner)
    await h.kernelSave.bind(owner, { ...k0, actors: k0.actors.map(({ doc: _d, ...a }) => a), undo: [], revision: k0.revision })
    await w.rt.close(owner)
    w = open()
    const loaded = await w.people.load(owner)
    const str = async (id) => (await h.actorData((await w.rt.session(owner)).session, id))?.system.abilities.str.value
    const out = { loaded: loaded.map((x) => x.status), cases: [] }
    for (const id of ids) {
      const s0 = await str(id)
      const e = await w.people.edit(owner, id, [{ kind: 'set', path: 'system.abilities.str.value', value: s0 + 1 }])
      const afterEdit = await str(id)
      const saved1 = (await w.saves.read(owner)).actors.find((a) => a.id === id)
      await w.people.undo(owner)
      const afterUndo = await str(id)
      const saved2 = (await w.saves.read(owner)).actors.find((a) => a.id === id)
      await w.people.edit(owner, id, [{ kind: 'set', path: 'system.abilities.str.value', value: s0 + 2 }])
      out.cases.push({ id, s0, edit: e.outcome.status, afterEdit, savedDoc: saved1?.doc?.system?.abilities?.str?.value ?? null, afterUndo, savedAfterUndoHasDoc: !!saved2?.doc })
    }
    await w.rt.close(owner)
    w = open()
    await w.people.load(owner)
    out.reopened = await Promise.all(ids.map((id) => str(id)))
    return out
  })
  const checks = {
    loaded: r.loaded.every((s) => s === 'complete'),
    edit: r.cases.every((c) => c.edit === 'complete' && c.afterEdit === c.s0 + 1 && c.savedDoc === c.s0 + 1),
    undo: r.cases.every((c) => c.afterUndo === c.s0 && !c.savedAfterUndoHasDoc),
    reopen: r.cases.every((c, i) => r.reopened[i] === c.s0 + 2),
    errors: errors.filter((e) => !/gendata-nav-adventure-book-index|Failed to load resource/.test(e)).length === 0,
  }
  const ok = Object.values(checks).every(Boolean)
  console.log(JSON.stringify({ ok, checks, ...r }, null, 1))
  process.exitCode = ok ? 0 : 1
} finally { clearTimeout(killer); await ctx.close(); server.close() }
