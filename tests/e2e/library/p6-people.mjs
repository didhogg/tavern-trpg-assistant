// P6 B1 人物页统一入口（rules/kernel/people.ts）真实小窗验证（Chrome；ENGINE=webkit 换 WebKit）：
// 建卡加人 → 读人物页（官方分解、和基准不同的字段）→ 手改加值 / 基础值 → 回到自动（差别消失）
// → 扣血写入 → 撤销（小窗跟着退回，再做别的事撤掉的伤害不回来）→ 检定登记表 → 长休预览后取消（小窗按存档退回）
// → 升级 / 降级 → 复制（新种子）→ 从模板加入怪物 → 回收站 / 彻底删除 / 撤销 → 改动记录 → 关小窗按存档重建全员。
import { writeFile } from 'node:fs/promises'
import { startStatic } from './static.mjs'
import { buildAll, E2E_PORT, engines, freshFromBase, work } from './chain-common.mjs'

const LIMIT = 8 * 60_000
const killer = setTimeout(() => { console.error('超时 8 分钟'); process.exit(2) }, LIMIT)
await buildAll()
const [, type, options] = engines[process.env.ENGINE === 'webkit' ? 1 : 0]
const engine = process.env.ENGINE ?? 'chrome'
const { server, url } = await startStatic({ port: E2E_PORT })
const ctx = await type.launchPersistentContext(freshFromBase(engine, 'p6-people'), { ...options, viewport: { width: 1280, height: 800 } })
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
    const { plan, monster } = await h.pickChainEntries(library, 'barbarian')
    await h.userDb.workspaces.clear(); await h.userDb.saves.clear()
    const owner = 'char:p6people.png'
    await h.campaign.startNewCampaign({ ownerKey: owner, ownerLabel: 'P6 人物', ruleId: 'dnd5e2014', name: 'P6 人物' })
    await h.kernelSave.bind(owner, { rule: 'dnd5e2014', kernelVersion: 1, library, dataVersion: await h.dataVersion(), overrides: [], actors: [], revision: 0, undo: [] })
    const mk = () => new h.KernelRuntime({ revisions: h.revisions, pluginRoot: new URL('/', location.href), files: h.files, scoped: h.scoped, service: h.service, container: () => document.body,
      cache: { db: h.libraryDb, dataVersion: h.dataVersion }, campaignOf: async () => ({ rule: 'dnd5e2014', library, title: 'P6 人物' }) })
    const rt = mk()
    // 和 backend.ts 同样的接线：写入时按战役让小窗拆人物
    const saves = new h.kernelSave.constructor({ ...h.kernelSave.deps, compactActors: (k, ids) => rt.compact(k, ids), mapRef: (k) => rt.mapRef(k) })
    const people = new h.KernelPeople({ runtime: rt, saves })
    const out = {}
    const session = (await rt.session(owner)).session
    const src = async (id) => h.actorData(session, id)
    const savedActor = async (id) => (await saves.read(owner)).actors.find((a) => a.id === id)
    const savedHp = async (id) => (await savedActor(id))?.state.actor?.system?.attributes?.hp?.value ?? null

    const b = await people.build(owner, { name: 'P6 英雄', items: ['race', 'background', 'class'].map((k) => plan[k].ref), equipment: ['weapon'].map((k) => plan[k].ref) }, { category: 'party' })
    const id = b.built.id
    out.build = { status: b.built.status, inSave: b.kernel?.actors.length, adjustments: b.kernel?.actors[0]?.adjustments }

    const sh0 = await people.sheet(owner, id)
    if (sh0.status !== 'complete') throw new Error(`读人物页失败：${sh0.error}\n${sh0.stack ?? ''}`)
    const s0 = sh0.result
    out.sheet = { detailsRace: (await rt.baseOf(owner, id))?.system?.details?.race ?? "(空)", raceSpeed: s0.items.find((i) => i.type === 'race')?.system?.movement?.walk ?? null, ac: s0.system.attributes.ac?.value ?? null, pp: s0.system.skills?.prc?.passive ?? null, strMod: s0.system.abilities?.str?.mod ?? null, hp: s0.system.attributes.hp, hpClasses: s0.breakdown.hp?.classes?.map((c) => c.total), acFormula: s0.breakdown.ac?.formulaLabel, items: s0.items.length, changed: s0.changed.length, baseKnown: s0.baseKnown }

    // 详情页对账 B1 / B2 / B5（2026-11-23）：显示文字过唯一出口、现算的值读得到、编号名字整表
    const gl = await people.glossary(owner)
    out.shown = { items: s0.shown.items.map((i) => [i.name, !!i.ref]), untranslated: s0.untranslated ?? [], hd: s0.system.attributes.hd,
      fire: gl.tables.damageTypes?.fire, common: gl.tables.languages?.common, tiny: gl.tables.actorSizes?.tiny, statuses: gl.statuses.length, poisoned: gl.statuses.find((x) => x.id === 'poisoned')?.name, tables: Object.keys(gl.tables).length, glUntranslated: gl.untranslated ?? [], codeTables: ['defaultAbilities', 'weaponProficienciesMap', 'weaponTypeMap'].filter((t) => gl.tables[t]), fullCaster: gl.tables.spellProgression?.full, sheetBytes: JSON.stringify(s0).length }
    // 官方角色表的显示数据（sheet-view.ts，2026-11-23）：有、原始编号没被换、不留 DND5E. 语言键原文
    const keysLeft = (v) => { const out = []; const walk = (x) => { if (typeof x === 'string') { if (/^DND5E\.[A-Za-z][\w.]*[A-Za-z0-9]$/.test(x)) out.push(x) } else if (x && typeof x === 'object') Object.values(x).forEach(walk) }; walk(v); return out }
    out.view = { sheet: s0.view?.sheet, parts: Object.keys(s0.view?.parts ?? {}), rawAbility: s0.system.skills.acr.ability, keysLeft: keysLeft(s0.view).slice(0, 5), bytes: JSON.stringify(s0.view ?? null).length }
    const strBase = s0.system.abilities.str.value
    const e1 = await people.edit(owner, id, [{ kind: 'set', path: 'system.abilities.str.value', value: strBase + 2 }, { kind: 'set', path: 'system.attributes.hp.bonuses.overall', value: '3' }])
    const s1 = (await people.sheet(owner, id)).result
    out.edit = { status: e1.outcome.status, str: s1.system.abilities.str.value, hpMax: s1.system.attributes.hp.max, changed: s1.changed, savedStr: (await savedActor(id)).state.actor?.system?.abilities?.str?.value ?? null }
    const locked = await people.edit(owner, id, [{ kind: 'set', path: 'flags.plutonium.hash', value: 'x' }])
    out.locked = { status: locked.outcome.status, error: locked.outcome.error }
    const rv = await people.revert(owner, id, s1.changed.filter((c) => c.kind === 'setting').map((c) => c.path))
    const s2 = (await people.sheet(owner, id)).result
    out.revert = { status: rv.outcome.status, str: s2.system.abilities.str.value, hpMax: s2.system.attributes.hp.max, changed: s2.changed, savedDiff: (await savedActor(id)).state.actor }

    const hp0 = s2.system.attributes.hp.value
    await people.act(owner, id, 'damage', id, [{ value: 3, type: 'slashing' }], [], {})
    const afterDamage = await savedHp(id)
    await people.undo(owner)
    const frameAfterUndo = (await src(id)).system.attributes.hp.value
    const weapon = (await src(id)).items.find((i) => i.type === 'weapon')
    await people.act(owner, id, 'equip', id, weapon._id, false)
    out.undo = { hp0, afterDamage, frameAfterUndo, savedAfterNext: await savedHp(id), fixed: frameAfterUndo === hp0 && (await savedHp(id)) !== hp0 - 3 }

    const ab = await people.check(owner, id, 'ability', 'str', [10])
    const tool = await people.check(owner, id, 'initiative', undefined, [12])
    const hd = await people.check(owner, id, 'hitDie', undefined, [5])
    const ds = await people.check(owner, id, 'death', undefined, [15])
    out.rolls = { ability: [ab.outcome.status, ab.outcome.result?.[0]?.total], initiative: [tool.outcome.status, tool.outcome.result?.[0]?.total], hitDie: [hd.outcome.status, hd.outcome.error ?? hd.outcome.missing], death: [ds.outcome.status, ds.outcome.error] }

    await people.act(owner, id, 'damage', id, [{ value: 4, type: 'slashing' }], [], {})
    const beforeRest = await savedHp(id)
    const tryRest = await people.attempt(owner, id, 'rest', id, 'long', [], {})
    const frameDuringPreview = (await src(id)).system.attributes.hp.value
    await people.cancel(owner, [id])
    out.cancel = { rest: tryRest.outcome.status, previewRows: tryRest.preview?.rows.length, beforeRest, frameDuringPreview, frameAfterCancel: (await src(id)).system.attributes.hp.value }

    const cls = (await src(id)).items.find((i) => i.type === 'class')
    const up = await people.attempt(owner, id, 'levelUpApply', id, cls._id, 1)
    if (up.changes.length) await people.confirm(owner, up.changes)
    const lvUp = (await src(id)).items.find((i) => i._id === cls._id).system.levels
    const down = await people.attempt(owner, id, 'levelUpApply', id, cls._id, -1)
    if (down.changes.length) await people.confirm(owner, down.changes)
    out.level = { up: up.outcome.status, lvUp, down: down.outcome.status, lvDown: (await src(id)).items.find((i) => i._id === cls._id).system.levels }

    const cp = await people.copy(owner, id) // 不给名字：后端按取名规则给
    const tpl = await people.fromTemplate(owner, monster.ref, 2, { category: 'enemy' })
    const roster = (await saves.read(owner)).actors
    out.add = { copy: cp.result.status, copyId: cp.result.id, distinct: cp.result.id !== id, template: tpl.made.status, count: roster.length, names: roster.map((a) => a.name), cats: roster.map((a) => a.adjustments.category ?? null) }

    await people.adjust(owner, [cp.result.id], { trashed: true })
    await people.purge(owner, [cp.result.id])
    const afterPurge = (await saves.read(owner)).actors.length
    const frameHasCopy = !!(await src(cp.result.id))
    await people.undo(owner)
    out.purge = { afterPurge, frameHasCopyAfterPurge: frameHasCopy, afterUndo: (await saves.read(owner)).actors.length, frameBack: !!(await src(cp.result.id)) }

    const hist = await people.history(owner)
    out.history = { rows: hist.length, sample: hist.slice(0, 3).map((r) => r.actors.map((a) => `${a.name}:${a.kind}:${a.fields.length}`)), labels: hist.flatMap((r) => r.actors.flatMap((a) => a.fields.filter((f) => /^state\.(actor|items\.[^]+?)\.system\./.test(f.path)).map((f) => [f.path, f.label ?? null]))).slice(0, 8) }

    // 真实入口：关小窗 → 新开（像重新进战役）→ load 按存档装人 → roster 读列表；编号不撞、HP 与关前一致、改动还能接着写
    const kernel = await saves.read(owner)
    const before = Object.fromEntries(await Promise.all(kernel.actors.map(async (a) => [a.id, (await src(a.id))?.system.attributes.hp.value])))
    await rt.close(owner)
    const rt2 = mk()
    const saves2 = new h.kernelSave.constructor({ ...h.kernelSave.deps, compactActors: (k, ids) => rt2.compact(k, ids), mapRef: (k) => rt2.mapRef(k) })
    const people2 = new h.KernelPeople({ runtime: rt2, saves: saves2 })
    const loaded = await people2.load(owner)
    const again = await people2.load(owner)
    const rows = await people2.roster(owner)
    const hero = rows.find((x) => x.id === id)
    const wrote = await people2.act(owner, id, 'damage', id, [{ value: 1, type: 'slashing' }], [], {})
    out.reload = { statuses: loaded.map((x) => x.status), secondLoad: again.map((x) => x.status), ids: rows.map((x) => x.id),
      sameHp: rows.every((x) => x.hp?.value === before[x.id]),
      hero: hero && { classes: hero.classes, race: hero.race, background: hero.background, level: hero.level, hp: hero.hp, ac: hero.ac, pp: hero.passivePerception, speed: hero.speed, cat: hero.adjustments.category, missing: hero.missing },
      monster: rows.filter((x) => x.adjustments.category === 'enemy').map((x) => ({ name: x.name, cr: x.cr, type: x.type, loaded: x.loaded })), allNames: rows.map((x) => x.name),
      writeAfterLoad: wrote.outcome.status === 'complete' && !!wrote.kernel }
    await rt2.close(owner)
    // 不用换算缓存重开：怪物走重新换算那条路，建回的编号也必须是存档里的（驾驶员 2026-11-23 真机：模板怪物装回后换了编号）
    const rt3 = new h.KernelRuntime({ revisions: h.revisions, pluginRoot: new URL('/', location.href), files: h.files, scoped: h.scoped, service: h.service, container: () => document.body,
      campaignOf: async () => ({ rule: 'dnd5e2014', library, title: 'P6 人物' }) })
    const saves3 = new h.kernelSave.constructor({ ...h.kernelSave.deps, compactActors: (k, ids) => rt3.compact(k, ids), mapRef: (k) => rt3.mapRef(k) })
    const people3 = new h.KernelPeople({ runtime: rt3, saves: saves3 })
    const cold = await people3.load(owner)
    const listed = await (await rt3.session(owner)).session.call('preparedActors')
    const inFrame = (listed.result ?? listed).map((a) => a.source._id)
    const savedIds = (await saves3.read(owner)).actors.map((a) => a.id)
    const monsterSheet = await people3.sheet(owner, rows.find((x) => x.adjustments.category === 'enemy').id)
    out.cold = { statuses: cold.map((x) => x.status), savedIds, inFrame, monsterSheet: monsterSheet.status,
      monsterNames: monsterSheet.result?.shown.items.map((i) => i.name), monsterUntranslated: monsterSheet.result?.untranslated ?? [] }
    // 作者改写过名字的怪物动作（去掉充能 / 每日次数 / 消耗动作后缀）：按作者编号定位后取中文（驾驶员 2026-11-23 定方案 A）
    const pool = await h.scoped.query(library, 'monster')
    const suffixed = pool.find((r) => r.source === 'MM' && r.item.legendary?.length && (r.item.action ?? []).some((a) => /\{@recharge/.test(a.name ?? '')))
    const added = await people3.fromTemplate(owner, suffixed.ref, 1, { category: 'enemy' })
    const sid = added.made.actors[0].id
    const ss = await people3.sheet(owner, sid)
    const flagsOf = new Map((await (async () => { const l = await (await rt3.session(owner)).session.call('preparedActors'); return (l.result ?? l) })()).find((a) => a.source._id === sid).source.items.map((i) => [i._id, i.flags?.plutonium?.page ?? null]))
    out.suffixed = { name: suffixed.item.name, rows: ss.result.shown.items.map((i) => [flagsOf.get(i.id), i.name]), untranslated: ss.result.untranslated ?? [],
      sheet: ss.result.view?.sheet, alignment: ss.result.view?.base?.system?.details?.alignment, rawAlignment: ss.result.system.details.alignment, keysLeft: keysLeft(ss.result.view).slice(0, 5) }
    await people3.edit(owner, sid, [{ kind: 'set', path: 'system.attributes.hd.spent', value: 1 }])
    out.suffixed.hdSpentKind = (await people3.sheet(owner, sid)).result.changed.find((c) => c.path === 'system.attributes.hd.spent')?.kind ?? null
    await rt3.close(owner)
    return out
  })
  const han = (t) => /[\u4e00-\u9fff]/.test(String(t ?? ''))
  const known = (e) => e.includes('gendata-nav-adventure-book-index.json') || e.includes('requires usable window dimensions') || e.includes('status of 404') || e.includes('api/plutonium')
    || e.includes('KERNEL_NEEDS_INPUT') || /homebrew|unearthed-arcana/.test(e)
  const unexplained = errors.filter((e) => !known(e))
  const checks = {
    build: r.build.status === 'complete' && r.build.inSave === 1,
    sheet: r.sheet.baseKnown && r.sheet.changed === 0 && (r.sheet.hpClasses?.length ?? 0) > 0 && r.sheet.ac !== null && r.sheet.pp !== null && r.sheet.strMod !== null,
    edit: r.edit.status === 'complete' && r.edit.changed.some((c) => c.path === 'system.abilities.str.value' && c.kind === 'setting'),
    locked: r.locked.status === 'error',
    revert: r.revert.status === 'complete' && r.revert.changed.length === 0,
    undoFixed: r.undo.fixed,
    rolls: r.rolls.ability[0] === 'complete' && r.rolls.initiative[0] === 'complete' && r.rolls.hitDie[0] === 'complete' && r.rolls.death[0] === 'complete',
    cancel: r.cancel.frameAfterCancel === r.cancel.beforeRest,
    level: r.level.lvUp === r.level.lvDown + 1,
    add: r.add.copy === 'complete' && r.add.distinct && r.add.template === 'complete' && r.add.count === 4,
    names: r.add.names.includes('P6 英雄 2') && r.add.names.filter((n) => / [12]$/.test(n) && n !== 'P6 英雄 2').length === 2 && JSON.stringify([...r.add.names].sort()) === JSON.stringify([...r.reload.allNames].sort()),
    purge: r.purge.afterPurge === 3 && !r.purge.frameHasCopyAfterPurge && r.purge.afterUndo === 4 && r.purge.frameBack,
    history: r.history.rows > 5,
    reload: r.reload.statuses.every((s) => s === 'complete') && r.reload.secondLoad.every((s) => s === 'complete') && new Set(r.reload.ids).size === r.reload.ids.length && r.reload.sameHp,
    roster: !!r.reload.hero && r.reload.hero.classes.length > 0 && !!r.reload.hero.race && r.reload.hero.ac !== null && r.reload.hero.pp !== null && r.reload.hero.speed > 0 && r.reload.hero.cat === 'party' && r.reload.monster.length === 2 && r.reload.monster.every((m) => m.loaded),
    writeAfterLoad: r.reload.writeAfterLoad,
    view: r.view.sheet === 'CharacterActorSheet' && r.view.parts.includes('header') && r.view.rawAbility === 'dex' && r.view.keysLeft.length === 0,
    monsterView: r.suffixed.sheet === 'NPCActorSheet' && han(r.suffixed.alignment) && !han(r.suffixed.rawAlignment) && r.suffixed.keysLeft.length === 0,
    historyLabels: r.history.labels.length > 0 && r.history.labels.every(([, label]) => han(label)),
    npcPlayState: r.suffixed.hdSpentKind === 'state',
    glossaryKinds: r.shown.codeTables.length === 0 && han(r.shown.fullCaster),
    shown: r.shown.items.length > 0 && r.shown.items.every(([name, ref]) => han(name) && ref) && han(r.shown.fire) && han(r.shown.common) && han(r.shown.tiny) && r.shown.statuses > 5 && han(r.shown.poisoned)
      && Number.isInteger(r.shown.hd?.value) && Number.isInteger(r.shown.hd?.max) && r.shown.hd.max > 0,
    suffixedNames: r.suffixed.rows.filter(([page]) => /^monster(Action|Trait|Legendary|LairActions)$/.test(page ?? '')).every(([, name]) => han(name)) && r.suffixed.rows.some(([page]) => page === 'monsterLegendary'),
    monsterNames: (r.cold.monsterNames ?? []).length > 0 && r.cold.monsterNames.filter(han).length >= r.cold.monsterNames.length / 2,
    coldIds: r.cold.statuses.every((x) => x === 'complete') && r.cold.savedIds.every((x) => r.cold.inFrame.includes(x)) && r.cold.monsterSheet === 'complete',
  }
  const ok = Object.values(checks).every(Boolean) && unexplained.length === 0
  await writeFile(`${work}/p6-people-${engine}.json`, JSON.stringify({ engine, ok, checks, ...r, errors, unexplained }, null, 2))
  console.log(JSON.stringify({ ok, checks, ...r, unexplained: unexplained.slice(0, 5) }, null, 1))
  process.exitCode = ok ? 0 : 1
} finally { clearTimeout(killer); await ctx.close(); server.close() }
