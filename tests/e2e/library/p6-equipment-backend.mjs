// P6 起始装备（people.startingEquipment + people.build 的 starting）真实小窗验证：牧师 + 侍僧的分组 / 类别候选 / 金币骰式；按选择建出物品（带数量）和钱；要钱不要装备；没选的组留空；重进战役还在。
// （Chrome；ENGINE=webkit 换 WebKit）以下是 p6-people 的原说明：
// 建卡加人 → 读人物页（官方分解、和基准不同的字段）→ 手改加值 / 基础值 → 回到自动（差别消失）
// → 扣血写入 → 撤销（小窗跟着退回，再做别的事撤掉的伤害不回来）→ 检定登记表 → 长休预览后取消（小窗按存档退回）
// → 升级 / 降级 → 复制（新种子）→ 从模板加入怪物 → 回收站 / 彻底删除 / 撤销 → 改动记录 → 关小窗按存档重建全员。
import { join } from 'node:path'
import { writeFile } from 'node:fs/promises'
import { startStatic } from './static.mjs'
import { buildAll, engines, work } from './chain-common.mjs'

const LIMIT = 8 * 60_000
const killer = setTimeout(() => { console.error('超时 8 分钟'); process.exit(2) }, LIMIT)
await buildAll()
const [, type, options] = engines[process.env.ENGINE === 'webkit' ? 1 : 0]
const engine = process.env.ENGINE ?? 'chrome'
const { server, url } = await startStatic({ port: 47355 })
const ctx = await type.launchPersistentContext(join(work, `profile-p3-1-${engine}`), { ...options, viewport: { width: 1280, height: 800 } })
const page = await ctx.newPage()
page.setDefaultTimeout(LIMIT)
const errors = []
page.on('pageerror', (e) => errors.push(e.stack ?? String(e)))
page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`) })
try {
  await page.goto(url)
  const r = await page.evaluate(async () => {
    const h = await import('/work/e2e-lib/harness.js')
    for (const id of ['cn-official', 'en-official']) {
      const audit = await h.offlineAudit(id)
      if (audit.set?.status !== 'installed' || audit.ok !== audit.planFiles) await h.install(id)
    }
    const library = h.defaultCampaignLibrary('dnd5e2014', 'cn')
    const { plan } = await h.pickChainEntries(library, 'cleric')
    await h.userDb.workspaces.clear(); await h.userDb.saves.clear()
    const owner = 'char:p6wizardbk.png'
    await h.campaign.startNewCampaign({ ownerKey: owner, ownerLabel: 'P6 人物', ruleId: 'dnd5e2014', name: 'P6 人物' })
    await h.kernelSave.bind(owner, { rule: 'dnd5e2014', kernelVersion: 1, library, dataVersion: await h.dataVersion(), overrides: [], actors: [], revision: 0, undo: [] })
    const mk = () => new h.KernelRuntime({ revisions: h.revisions, pluginRoot: new URL('/', location.href), files: h.files, scoped: h.scoped, service: h.service, container: () => document.body,
      cache: { db: h.libraryDb, dataVersion: h.dataVersion }, campaignOf: async () => ({ rule: 'dnd5e2014', library, title: 'P6 人物' }) })
    const rt = mk()
    // 和 backend.ts 同样的接线：写入时按战役让小窗拆人物
    const saves = new h.kernelSave.constructor({ ...h.kernelSave.deps, compactActors: (k, ids) => rt.compact(k, ids), mapRef: (k) => rt.mapRef(k) })
    const people = new h.KernelPeople({ runtime: rt, saves })
    const out = {}
    const refs = ['race', 'background', 'class'].map((k) => plan[k].ref)
    const opts = await people.startingEquipment(owner, { items: refs })
    out.status = opts.status; out.error = opts.error
    const sections = opts.sections ?? []
    const cls = sections.find((s) => s.prop === 'class'); const bg = sections.find((s) => s.prop === 'background')
    const flat = (s) => s.groups.flatMap((g) => g.choices.flatMap((c) => c.entries.map((e) => ({ g: g.index, c: c.key, ...e }))))
    out.shape = { sections: sections.map((s) => s.prop), clsGroups: cls?.groups.map((g) => g.choices.map((c) => c.key)), bgGroups: bg?.groups.map((g) => g.choices.map((c) => c.key)), gold: cls?.goldExpression, bgGold: bg?.goldExpression }
    const clsEntries = cls ? flat(cls) : []; const bgEntries = bg ? flat(bg) : []
    const simple = clsEntries.find((e) => e.kind === 'category' && e.types.includes('weaponSimple'))
    const holy = clsEntries.find((e) => e.kind === 'category' && e.types.includes('focusSpellcastingHoly'))
    out.cat = { simple: simple && { g: simple.g, c: simple.c, n: simple.candidates.length, first: simple.candidates.slice(0, 3).map((x) => [x.uid, x.label, !!x.ref]) }, holy: holy && { g: holy.g, c: holy.c, n: holy.candidates.length, names: holy.candidates.map((x) => x.uid) } }
    out.bg = bgEntries.map((e) => ({ g: e.g, c: e.c, kind: e.kind, text: e.text ?? e.uid, qty: e.quantity, cp: e.cp, dn: e.displayName, label: e.label, ref: e.ref ? 'ref' : null }))
    out.fixedLabel = clsEntries.filter((e) => e.kind === 'item').slice(0, 4).map((e) => [e.uid, e.label, !!e.ref])
    const names = async (rt0, i) => { const a = await h.actorData((await rt0.session(owner)).session, i); return { items: a.items.filter((x) => !['class', 'race', 'background', 'feat', 'subclass', 'spell'].includes(x.type)).map((x) => `${x.name}×${x.system?.quantity ?? 1}`).sort(), currency: a.system.currency } }
    // 选择：武器 a 锤矛、护甲 b 皮甲、第三组 b（任选简易武器：候选第一件）、第四组 a 祭司背包、第五组固定（盾牌 + 圣徽类别候选第一件）；背景选 a 祈祷书
    const choice = { 0: 'a', 1: 'b', 2: 'b', 3: 'a' }
    const pick = { [`${simple.g}.${simple.c}.${clsEntries.indexOf(simple) - clsEntries.filter((e) => e.g === simple.g && e.c === simple.c)[0] ? 0 : 0}.0`]: simple.candidates[0].uid }
    // 类别槽的键 = 组序号.选项键.条目序号.第几个：条目序号是它在这一项里的位置
    const posIn = (list, e) => list.filter((x) => x.g === e.g && x.c === e.c).indexOf(e)
    const picks = { [`${simple.g}.${simple.c}.${posIn(clsEntries, simple)}.0`]: simple.candidates[0].uid, [`${holy.g}.${holy.c}.${posIn(clsEntries, holy)}.0`]: holy.candidates[0].uid }
    const starting = { [cls.refKey]: { choice, pick: picks }, [bg.refKey]: { choice: { 1: 'a' } } }
    const b1 = await people.build(owner, { name: '带装备牧师', items: refs, blank: true, starting }, { category: 'party' })
    out.built = { status: b1.built.status, error: b1.built.error, skipped: b1.built.skipped, ...(b1.built.id ? await names(rt, b1.built.id) : {}) }
    // 要钱：职业要 140 金，不要职业装备；背景照给
    const b2 = await people.build(owner, { name: '要钱牧师', items: refs, blank: true, starting: { [cls.refKey]: { gold: 140 }, [bg.refKey]: { choice: { 1: 'b' } } } }, { category: 'party' })
    out.gold = { status: b2.built.status, ...(b2.built.id ? await names(rt, b2.built.id) : {}) }
    // 什么都没选：只有固定给的（单一选项的组）
    const b3 = await people.build(owner, { name: '没选牧师', items: refs, blank: true, starting: {} }, { category: 'party' })
    out.none = { status: b3.built.status, ...(b3.built.id ? await names(rt, b3.built.id) : {}) }
    const b4 = await people.build(owner, { name: '没传牧师', items: refs, blank: true }, { category: 'party' })
    out.noStarting = { status: b4.built.status, ...(b4.built.id ? await names(rt, b4.built.id) : {}) }
    // —— 战役范围：书 / 单条被停用，候选和固定物品跟着去掉；已停用的不能选 ——
    let ownerN = 0
    const peopleFor = async (lib) => {
      const ow = `char:p6eqv${++ownerN}.png`
      await h.campaign.startNewCampaign({ ownerKey: ow, ownerLabel: 'P6 范围', ruleId: 'dnd5e2014', name: 'P6 范围' })
      await h.kernelSave.bind(ow, { rule: 'dnd5e2014', kernelVersion: 1, library, dataVersion: await h.dataVersion(), overrides: [], actors: [], revision: 0, undo: [] })
      const rtv = new h.KernelRuntime({ revisions: h.revisions, pluginRoot: new URL('/', location.href), files: h.files, scoped: h.scoped, service: h.service, container: () => document.body,
        cache: { db: h.libraryDb, dataVersion: h.dataVersion }, campaignOf: async () => ({ rule: 'dnd5e2014', library: lib, title: 'P6 人物' }) })
      const savesv = new h.kernelSave.constructor({ ...h.kernelSave.deps, compactActors: (k, ids) => rtv.compact(k, ids), mapRef: (k) => rtv.mapRef(k) })
      return { rtv, ow, pv: new h.KernelPeople({ runtime: rtv, saves: savesv }) }
    }
    const simpleOf = (o) => o.sections.find((s) => s.prop === 'class').groups.flatMap((g) => g.choices.flatMap((c) => c.entries)).find((e) => e.kind === 'category' && e.types.includes('weaponSimple'))
    const clubUnit = h.entryUnit({ kind: 'item', set: 'cn-official', prop: 'item', hash: '%e7%9f%ad%e6%a3%92_phb' })
    const maceHash = cls.groups[0].choices.find((c) => c.key === 'a').entries[0].ref.hash
    const names2 = async (rt0, ow, i) => { const a = await h.actorData((await rt0.session(ow)).session, i); return { items: a.items.filter((x) => !['class', 'race', 'background', 'feat', 'subclass', 'spell'].includes(x.type)).map((x) => `${x.name}×${x.system?.quantity ?? 1}`).sort() } }
    out.scope = {}
    { const { rtv, pv, ow } = await peopleFor({ ...library, exclude: ['src:xphb', 'src:toa'] })
      const o = await pv.startingEquipment(ow, { items: refs }); const sim = simpleOf(o)
      out.scope.books = { status: o.status, n: sim.candidates.length, sources: [...new Set(sim.candidates.map((c) => c.source))], excluded: o.sections.find((s) => s.prop === 'class').excluded.length }
      await rtv.close(ow) }
    { const { rtv, pv, ow } = await peopleFor({ ...library, exclude: [clubUnit] })
      const o = await pv.startingEquipment(ow, { items: refs }); const sim = simpleOf(o)
      out.scope.club = { n: sim.candidates.length, hasClub: sim.candidates.some((c) => c.uid === 'club|phb'), excluded: o.sections.find((s) => s.prop === 'class').excluded }
      const bad = await pv.build(ow, { name: '选了停用物品', items: refs, blank: true, starting: { [cls.refKey]: { pick: { [`${simple.g}.${simple.c}.${posIn(clsEntries, simple)}.0`]: 'club|phb' } } } }, { category: 'party' })
      out.scope.clubPick = { status: bad.built.status, error: bad.built.error, kernel: bad.kernel }
      await rtv.close(ow) }
    { const { rtv, pv, ow } = await peopleFor({ ...library, exclude: [h.entryUnit({ kind: 'item', set: 'cn-official', prop: 'item', hash: maceHash })] })
      const o = await pv.startingEquipment(ow, { items: refs }); const c0 = o.sections.find((s) => s.prop === 'class').groups[0]
      out.scope.mace = { keys: c0.choices.map((c) => c.key), excluded: o.sections.find((s) => s.prop === 'class').excluded }
      const mk0 = await pv.build(ow, { name: '没锤矛', items: refs, blank: true, starting: { [cls.refKey]: { choice: { 0: 'a' } } } }, { category: 'party' })
      out.scope.maceBuilt = { status: mk0.built.status, ...(mk0.built.id ? await names2(rtv, ow, mk0.built.id) : {}) }
      await rtv.close(ow) }
    // —— 其他职业 / 背景：战士 + 士兵；带乐器 / 工匠工具 / 游戏套装的背景；数据里没认出的写法 ——
    const findRef = async (prop, pred) => (await h.scoped.query(library, prop, { source: 'PHB', expand: true })).find((x) => pred(x.item))?.ref
    const fighter = await findRef('class', (i) => i.name === '战士'); const soldier = await findRef('background', (i) => i.name === '士兵')
    const o2 = await people.startingEquipment(owner, { items: [plan.race.ref, soldier, fighter] })
    const f2 = o2.sections.find((x) => x.prop === 'class'); const e2 = (x) => x.groups.flatMap((g) => g.choices.flatMap((c) => c.entries))
    out.fighter = { status: o2.status, martial: e2(f2).filter((e) => e.kind === 'category').map((e) => [e.types.join('+'), e.quantity, e.candidates.length]), unsupported: o2.sections.flatMap((x) => x.unsupported) }
    const bgs = await h.scoped.query(library, 'background')
    const kindsWanted = ['toolArtisan', 'instrumentMusical', 'setGaming']
    out.kindsWanted = kindsWanted
    out.bgKinds = {}
    for (const kind of kindsWanted) {
      const row = bgs.find((r) => JSON.stringify(r.item?.startingEquipment ?? '').includes(kind))
      if (!row) { out.bgKinds[kind] = 'none'; continue }
      const o3 = await people.startingEquipment(owner, { items: [plan.race.ref, row.ref, plan.class.ref] })
      const sec = o3.sections.find((x) => x.prop === 'background')
      out.bgKinds[kind] = { status: o3.status, n: e2(sec).filter((e) => e.kind === 'category' && e.types.includes(kind)).map((e) => e.candidates.length), unsupported: sec.unsupported }
    }
    await rt.close(owner)
    const rt2 = mk()
    const saves2 = new h.kernelSave.constructor({ ...h.kernelSave.deps, compactActors: (k, ids) => rt2.compact(k, ids), mapRef: (k) => rt2.mapRef(k) })
    const people2 = new h.KernelPeople({ runtime: rt2, saves: saves2 })
    const loaded = await people2.load(owner)
    out.reload = { statuses: loaded.map((x) => x.status), built: await names(rt2, b1.built.id), gold: await names(rt2, b2.built.id) }
    await rt2.close(owner)
    return out
  })
  const known = (e) => e.includes('gendata-nav-adventure-book-index.json') || e.includes('requires usable window dimensions') || e.includes('status of 404') || e.includes('api/plutonium') || e.includes('KERNEL_NEEDS_INPUT') || /homebrew|unearthed-arcana/.test(e)
  const unexplained = errors.filter((e) => !known(e))
  const gpOf = (c) => (c?.pp ?? 0) * 10 + (c?.gp ?? 0) + (c?.ep ?? 0) / 2 + (c?.sp ?? 0) / 10 + (c?.cp ?? 0) / 100 // 币种之间的换算（铂 = 10 金）
  const sameItems = (a, b) => JSON.stringify(a.items) === JSON.stringify(b.items) && JSON.stringify(a.currency) === JSON.stringify(b.currency)
  const checks = {
    optionsOk: r.status === 'complete' && [...r.shape.sections].sort().join() === 'background,class',
    classShape: r.shape.clsGroups?.length === 5 && r.shape.clsGroups[2].join() === 'a,b' && r.shape.clsGroups[4].join() === '_',
    classGold: r.shape.gold === '5d4 * 10' && r.shape.bgGold === null,
    simpleCandidates: r.cat.simple?.n > 10 && r.cat.simple.first.every(([, label]) => !!label),
    holyCandidates: r.cat.holy?.n > 0 && r.cat.holy.names.every((u) => !u.startsWith('holy symbol')),
    bgShape: r.bg.some((e) => e.kind === 'special' && /Incense/i.test(e.text) && e.qty === 5) && r.bg.some((e) => e.kind === 'item' && e.cp === 1500) && r.bg.some((e) => e.kind === 'item' && e.dn),
    labelsAndRefs: r.fixedLabel.length > 0 && r.fixedLabel.every(([, label]) => !!label),
    builtItems: r.built.status === 'complete' && ['Mace×1', 'Leather Armor×1', "Priest's Pack×1", 'Sticks of Incense×5', 'Vestments×1', 'Club×1', 'Amulet×1', 'Shield×1', 'Prayer Book×1'].every((n) => r.built.items.includes(n)) && !r.built.items.some((n) => /^Warhammer|^Scale|^Chain/.test(n)),
    builtCurrency: gpOf(r.built.currency) === 15,
    noSkipped: (r.built.skipped ?? []).length === 0,
    goldBuild: r.gold.status === 'complete' && gpOf(r.gold.currency) === 155 && !r.gold.items.some((x) => /^Mace/.test(x)),
    noneOnlyFixed: r.none.status === 'complete' && !r.none.items.some((x) => /^Mace|^Warhammer|^Leather/.test(x)) && r.none.items.some((x) => /Shield/.test(x)),
    noStartingNothing: r.noStarting.items.length === 0 && gpOf(r.noStarting.currency) === 0,
    reloadKeeps: r.reload.statuses.every((s) => s === 'complete') && sameItems(r.reload.built, r.built) && sameItems(r.reload.gold, r.gold),
    scopeBooks: r.scope.books.status === 'complete' && r.scope.books.sources.join() === 'PHB' && r.scope.books.n === 14 && r.scope.books.excluded >= 15,
    scopeEntry: !r.scope.club.hasClub && r.scope.club.n === 28 && r.scope.club.excluded.includes('club|phb'),
    scopePickRejected: r.scope.clubPick.status === 'invalid' && /club/.test(r.scope.clubPick.error ?? '') && r.scope.clubPick.kernel === null,
    scopeFixedItem: !r.scope.mace.keys.includes('a') && r.scope.mace.excluded.includes('mace|phb') && r.scope.maceBuilt.status === 'complete' && !r.scope.maceBuilt.items.some((n) => /^Mace/.test(n)),
    fighterCategories: r.fighter.status === 'complete' && r.fighter.martial.length >= 2 && r.fighter.martial.every(([, , n]) => n > 10) && r.fighter.unsupported.length === 0,
    bgCategories: r.kindsWanted.every((k) => r.bgKinds[k] !== 'none' && r.bgKinds[k].status === 'complete' && r.bgKinds[k].n.length > 0 && r.bgKinds[k].n.every((n) => n > 3) && r.bgKinds[k].unsupported.length === 0),
    noUnexplainedErrors: unexplained.length === 0,
  }
  const ok = Object.values(checks).every(Boolean)
  await writeFile(`${work}/p6-equipment-backend-${engine}.json`, JSON.stringify({ engine, ok, checks, ...r, errors, unexplained }, null, 2))
  console.log(JSON.stringify({ ok, failed: Object.entries(checks).filter(([, v]) => !v).map(([k]) => k), unexplained: unexplained.slice(0, 5) }, null, 1))
  if (!ok) process.exitCode = 1
} catch (e) { console.error('测试流程中断', e?.stack ?? e); process.exitCode = 1 }
finally { clearTimeout(killer); await ctx.close(); server.close() }
