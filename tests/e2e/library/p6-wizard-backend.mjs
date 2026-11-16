// P6 建卡选项（people.buildOptions）真实小窗验证：每件条目要玩家选的事 + 候选（已排除人物身上已有的）+ 额外必选项（子职业 / 专长 / 可选特性）+ 带选择建卡并在重进战役后还原。
// （Chrome；ENGINE=webkit 换 WebKit）以下是 p6-people 的原说明：
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
const ctx = await type.launchPersistentContext(freshFromBase(engine, 'p6-wizard'), { ...options, viewport: { width: 1280, height: 800 } })
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
    const find = async (prop, pred) => { const rows = await h.scoped.query(library, prop, { source: 'PHB', expand: true }); return rows.find((x) => pred(x.item))?.ref }
    const fighter = await find('class', (i) => i.name === '战士')
    const variantHuman = await find('race', (i) => String(i.name).includes('人类') && String(i.name).includes('变体'))
    const refs = ['race', 'background', 'class'].map((k) => plan[k].ref)
    const slim = (o) => o.items.map((it) => ({ name: it.name, steps: it.steps.map((s) => ({ type: s.type, auto: s.automatic, unsupported: !!s.unsupported, slots: s.options?.slots?.map((x) => ({ count: x.count, n: x.options.length, values: x.options.map((v) => v.value) })) ?? null, kind: s.options?.kind ?? null, grants: s.options?.grants?.map((g) => g.value) ?? null, id: s.id, level: s.level })),
      extras: it.extras.map((x) => ({ kind: x.kind, count: x.count, title: x.title, n: x.candidates.length, names: x.candidates.slice(0, 3).map((c) => c.name) })), unsupported: it.unsupported }))
    const o1 = await people.buildOptions(owner, { items: refs })
    out.opts = { status: o1.status, error: o1.error, items: o1.items && slim(o1) }
    const one = async (ref) => { const o = ref ? await people.buildOptions(owner, { items: [ref] }) : null; return o && { status: o.status, error: o.error, detail: JSON.stringify(o.detail?.pending ?? null).slice(0, 300), items: o.items && slim(o) } }
    out.vh = await one(variantHuman)
    out.fighter = await one(fighter)
    { const bb = await rt.buildCharacter(owner, { name: '变体人类探针', items: [variantHuman] }); out.vhBuild = { status: bb.status, error: bb.error, pending: JSON.stringify(bb.detail?.pending ?? null).slice(0, 200), id: bb.id ?? null }; if (bb.id) await rt.session(owner).then(({ session: se }) => se.call('deleteActors', [bb.id])) }
    // 选择：职业技能选 历史 / 医药（候选里没有背景已给的 洞悉 / 宗教）
    const classSteps = o1.items[2].steps
    const skillStep = classSteps.find((s) => s.type === 'Trait' && s.options?.slots?.some((x) => x.count === 2))
    const picks = [[], [], [{ id: skillStep.id, level: skillStep.level, value: { chosen: ['skills:his', 'skills:med'] } }]]
    const o3 = await people.buildOptions(owner, { items: refs, picks })
    out.afterPick = { status: o3.status, classSlots: slim(o3)[2].steps.filter((s) => s.slots).map((s) => s.slots) }
    const b = await people.build(owner, { name: '带选择的牧师', items: refs, picks }, { category: 'party' })
    const id = b.built.id
    const profs = async (rt0, i) => { const s = (await h.actorData((await rt0.session(owner)).session, i)).system.skills; return Object.entries(s).filter(([, v]) => v.value >= 1).map(([k]) => k).sort() }
    out.built = { status: b.built.status, skills: await profs(rt, id) }
    // 留空：不给选择 + blank → 只有固定授予（侍僧的洞悉 / 宗教），职业技能位空着；选一个只多一个；重进战役仍是这样
    const blankB = await people.build(owner, { name: '留空牧师', items: refs, blank: true }, { category: 'party' })
    const halfB = await people.build(owner, { name: '半选牧师', items: refs, blank: true, picks: [[], [], [{ id: skillStep.id, level: skillStep.level, value: { chosen: ['skills:his'] } }]] }, { category: 'party' })
    const autoB = await people.build(owner, { name: '自动牧师', items: refs }, { category: 'party' })
    out.blankBuilt = { status: blankB.built.status, skills: await profs(rt, blankB.built.id), half: await profs(rt, halfB.built.id), auto: await profs(rt, autoB.built.id) }
    out.blankOpts = (await people.buildOptions(owner, { items: refs, blank: true })).status
    // 属性值：标准数组放进去，种族加成在上面；预览给「基础 + 加成 = 合计」；违规拒绝；重进战役值不变
    const arr = { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 }
    const prev = await people.buildOptions(owner, { items: refs, blank: true, abilities: { method: 'standardArray', base: arr } })
    const prevBad = await people.buildOptions(owner, { items: refs, blank: true, abilities: { method: 'manual', base: { str: 99, dex: 1.5 } } })
    const prevNone = await people.buildOptions(owner, { items: refs, blank: true })
    const abil = async (rt0, i) => Object.fromEntries(Object.entries((await h.actorData((await rt0.session(owner)).session, i)).system.abilities).map(([k, v]) => [k, v.value]))
    const bAbil = await people.build(owner, { name: '数组牧师', items: refs, blank: true, abilities: { method: 'standardArray', base: arr } }, { category: 'party' })
    const bBad = await people.build(owner, { name: '重复', items: refs, blank: true, abilities: { method: 'standardArray', base: { str: 15, dex: 15 } } }, { category: 'party' })
    out.abil = { rows: prev.abilities.rows, check: prev.abilities.check, cap: prev.abilities.cap, bad: prevBad.abilities.check.problems, noneRows: prevNone.abilities.rows.map((r) => [r.base, r.set]), built: bAbil.built.status, values: await abil(rt, bAbil.built.id), badStatus: bBad.built.status, badKernel: bBad.kernel }
    out.worldActors = (await saves.read(owner)).actors.length
    await rt.close(owner)
    const rt2 = mk()
    const saves2 = new h.kernelSave.constructor({ ...h.kernelSave.deps, compactActors: (k, ids) => rt2.compact(k, ids), mapRef: (k) => rt2.mapRef(k) })
    const people2 = new h.KernelPeople({ runtime: rt2, saves: saves2 })
    const loaded = await people2.load(owner)
    out.abilReload = await abil(rt2, bAbil.built.id)
    out.reload = { statuses: loaded.map((x) => x.status), skills: await profs(rt2, id), blank: await profs(rt2, blankB.built.id), half: await profs(rt2, halfB.built.id) }
    await rt2.close(owner)
    return out
  })
  const known = (e) => e.includes('gendata-nav-adventure-book-index.json') || e.includes('requires usable window dimensions') || e.includes('status of 404') || e.includes('api/plutonium')
    || e.includes('KERNEL_NEEDS_INPUT') || /homebrew|unearthed-arcana/.test(e)
  const unexplained = errors.filter((e) => !known(e))
  const items = r.opts.items ?? []
  const [race, bg, cls] = items
  const checks = {
    optsOk: r.opts.status === 'complete' && items.length === 3,
    raceSteps: !!race && ['AbilityScoreImprovement', 'Size', 'Trait'].every((t) => race.steps.some((s) => s.type === t)),
    bgLanguageSlot: !!bg && bg.steps.some((s) => s.slots?.some((x) => x.count === 1 && x.n > 5)),
    classSkillSlot: !!cls && cls.steps.some((s) => s.slots?.some((x) => x.count === 2 && x.values.includes('skills:his') && x.values.includes('skills:med'))),
    excludesBackgroundGrants: !!cls && cls.steps.filter((s) => s.slots).every((s) => s.slots.every((x) => !x.values.includes('skills:ins') && !x.values.includes('skills:rel'))),
    noUnsupportedSteps: items.every((it) => it.steps.every((s) => !s.unsupported)),
    clericSubclass: !!cls && cls.extras.some((x) => x.kind === 'subclass' && x.count === 1 && x.n > 0),
    fighterOptional: !!r.fighter?.items && r.fighter.items[0].extras.some((x) => x.kind === 'optionalfeature' && x.count === 1 && x.n > 0),
    variantHumanFeat: !!r.vh?.items && r.vh.items[0].extras.some((x) => x.kind === 'feat' && x.count === 1 && x.n > 10),
    variantHumanBuilds: r.vhBuild.status === 'complete', // 以前没给属性选择时官方管理器弹窗、建卡 pending（默认值违反每项上限）
    pickNarrowsOptions: r.afterPick.status === 'complete',
    builtWithPick: r.built.status === 'complete' && ['his', 'med'].every((k) => r.built.skills.includes(k)),
    blankLeavesEmpty: r.blankBuilt.status === 'complete' && r.blankBuilt.skills.join() === 'ins,rel' && r.blankOpts === 'complete',
    blankHalfPick: r.blankBuilt.half.join() === 'his,ins,rel',
    autoStillFills: r.blankBuilt.auto.length > r.blankBuilt.skills.length,
    blankReloadKeeps: r.reload.blank.join() === 'ins,rel' && r.reload.half.join() === 'his,ins,rel',
    previewActorsGone: r.worldActors === 5,
    abilityPreview: r.abil.rows.every((x) => x.total === x.base + x.bonus && x.set) && r.abil.rows.some((x) => x.bonus > 0) && r.abil.check.ok && r.abil.check.complete && r.abil.cap > 0,
    abilityNoBaseKeepsInitial: r.abil.noneRows.every(([b, set]) => !set && b === 10),
    abilityBadFlagged: r.abil.bad.some((x) => x.key === 'str' && x.code === 'out-of-range') && r.abil.bad.some((x) => x.key === 'dex' && x.code === 'not-integer'),
    abilityBuilt: r.abil.built === 'complete' && r.abil.rows.every((x) => r.abil.values[x.key] === x.total),
    abilityReloadKeeps: JSON.stringify(r.abilReload) === JSON.stringify(r.abil.values),
    abilityViolationRejected: r.abil.badStatus === 'invalid' && r.abil.badKernel === null,
    reloadKeepsPick: r.reload.statuses.every((s) => s === 'complete') && ['his', 'med'].every((k) => r.reload.skills.includes(k)) && JSON.stringify(r.reload.skills) === JSON.stringify(r.built.skills),
    noUnexplainedErrors: unexplained.length === 0,
  }
  const ok = Object.values(checks).every(Boolean)
  await writeFile(`${work}/p6-wizard-backend-${engine}.json`, JSON.stringify({ engine, ok, checks, ...r, errors, unexplained }, null, 2))
  console.log(JSON.stringify({ ok, failed: Object.entries(checks).filter(([, v]) => !v).map(([k]) => k), unexplained: unexplained.slice(0, 5) }, null, 1))
  if (!ok) process.exitCode = 1
} catch (e) { console.error('测试流程中断', e?.stack ?? e); process.exitCode = 1 }
finally { clearTimeout(killer); await ctx.close(); server.close() }
