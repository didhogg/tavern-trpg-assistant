// P6 B1 人物页统一入口（rules/kernel/people.ts）真实小窗验证（Chrome；ENGINE=webkit 换 WebKit）：
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
const { server, url } = await startStatic({ port: 47337 })
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

    const s0 = (await people.sheet(owner, id)).result
    out.sheet = { hp: s0.system.attributes.hp, hpClasses: s0.breakdown.hp?.classes?.map((c) => c.total), acFormula: s0.breakdown.ac?.formulaLabel, items: s0.items.length, changed: s0.changed.length, baseKnown: s0.baseKnown }

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

    const cp = await people.copy(owner, id, 'P6 英雄（副本）')
    const tpl = await people.fromTemplate(owner, monster.ref, 2, { category: 'enemy' })
    const roster = (await saves.read(owner)).actors
    out.add = { copy: cp.result.status, copyId: cp.result.id, distinct: cp.result.id !== id, template: tpl.made.status, count: roster.length, cats: roster.map((a) => a.adjustments.category ?? null) }

    await people.adjust(owner, [cp.result.id], { trashed: true })
    await people.purge(owner, [cp.result.id])
    const afterPurge = (await saves.read(owner)).actors.length
    const frameHasCopy = !!(await src(cp.result.id))
    await people.undo(owner)
    out.purge = { afterPurge, frameHasCopyAfterPurge: frameHasCopy, afterUndo: (await saves.read(owner)).actors.length, frameBack: !!(await src(cp.result.id)) }

    const hist = await people.history(owner)
    out.history = { rows: hist.length, sample: hist.slice(0, 3).map((r) => r.actors.map((a) => `${a.name}:${a.kind}:${a.fields.length}`)) }

    // 关小窗、按存档重建全员：编号不撞、HP 与存档一致
    const kernel = await saves.read(owner)
    const before = Object.fromEntries(await Promise.all(kernel.actors.map(async (a) => [a.id, (await src(a.id))?.system.attributes.hp.value])))
    await rt.close(owner)
    const rt2 = mk()
    const rebuilt = await rt2.rebuildMany(owner, kernel.actors)
    out.reload = { statuses: rebuilt.map((x) => x.status), ids: rebuilt.map((x) => x.id), sameHp: rebuilt.every((x) => x.data?.system?.attributes?.hp?.value === before[x.id]) }
    await rt2.close(owner)
    return out
  })
  const known = (e) => e.includes('gendata-nav-adventure-book-index.json') || e.includes('requires usable window dimensions') || e.includes('status of 404') || e.includes('api/plutonium')
    || e.includes('KERNEL_NEEDS_INPUT') || /homebrew|unearthed-arcana/.test(e)
  const unexplained = errors.filter((e) => !known(e))
  const checks = {
    build: r.build.status === 'complete' && r.build.inSave === 1,
    sheet: r.sheet.baseKnown && r.sheet.changed === 0 && (r.sheet.hpClasses?.length ?? 0) > 0,
    edit: r.edit.status === 'complete' && r.edit.changed.some((c) => c.path === 'system.abilities.str.value' && c.kind === 'setting'),
    locked: r.locked.status === 'error',
    revert: r.revert.status === 'complete' && r.revert.changed.length === 0,
    undoFixed: r.undo.fixed,
    rolls: r.rolls.ability[0] === 'complete' && r.rolls.initiative[0] === 'complete' && r.rolls.hitDie[0] === 'complete' && r.rolls.death[0] === 'complete',
    cancel: r.cancel.frameAfterCancel === r.cancel.beforeRest,
    level: r.level.lvUp === r.level.lvDown + 1,
    add: r.add.copy === 'complete' && r.add.distinct && r.add.template === 'complete' && r.add.count === 4,
    purge: r.purge.afterPurge === 3 && !r.purge.frameHasCopyAfterPurge && r.purge.afterUndo === 4 && r.purge.frameBack,
    history: r.history.rows > 5,
    reload: r.reload.statuses.every((s) => s === 'complete') && new Set(r.reload.ids).size === r.reload.ids.length && r.reload.sameHp,
  }
  const ok = Object.values(checks).every(Boolean) && unexplained.length === 0
  await writeFile(`${work}/p6-people-${engine}.json`, JSON.stringify({ engine, ok, checks, ...r, errors, unexplained }, null, 2))
  console.log(JSON.stringify({ ok, checks, ...r, unexplained: unexplained.slice(0, 5) }, null, 1))
  process.exitCode = ok ? 0 : 1
} finally { clearTimeout(killer); await ctx.close(); server.close() }
