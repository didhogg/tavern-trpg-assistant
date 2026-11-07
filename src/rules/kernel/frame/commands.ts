// 结算命令：只按顺序调用 dnd5e / Plutonium / Foundry 的官方入口（蓝图 §3.2～§3.6）。
// 同一份代码既在插件结算小窗里跑，也注入演示站官方原件页面跑，两边结果直接逐项比较（tests/e2e/kernel/scenarios.mjs）。
// 不弹窗、不发聊天消息；骰点只从传入的“已掷点数”取；写入经数据库后端记成变更计划，不保存。
/* eslint-disable @typescript-eslint/no-explicit-any -- 官方全局对象没有类型声明。 */

const g = globalThis as any

import { unsupportedFor, type UnsupportedItem } from './writings'
import { createItemCommands } from './commands-items'
import { createCombatCommands } from './commands-combat'

/**
 * 五种结果状态（上位设计 §3.5）：
 * complete 完整结果+来源；pending 等玩家选择/输入；unsupported 已算部分+未支持项；
 * missing 缺东西暂停（缺骰点、缺条目）并说明缺什么；error 执行出错（不冒充未支持）。
 */
export type KernelStatus = 'complete' | 'pending' | 'unsupported' | 'missing' | 'error'

export interface DiceRequest { faces: number; index: number }
export interface Change { action: string; type: string; pack: string | null; parentUuid: string | null; data: any }

class NeedsDice extends Error {
  constructor(readonly request: DiceRequest) { super('KERNEL_NEEDS_DICE') }
}
class NeedsInput extends Error {
  constructor(readonly where: string) { super('KERNEL_NEEDS_INPUT') }
}

/** 已掷点数：每项是 1..面数 的整数，按掷骰顺序消耗。换算成官方随机数入口的值（Die#mapRandomFace 的逆运算）。 */
function withDice<T>(points: number[], run: () => Promise<T>): Promise<{ value?: T; used: number; needs?: DiceRequest; input?: string }> {
  const Dice = g.CONFIG.Dice
  const original = Dice.randomUniform
  const DieProto = g.foundry.dice.terms.Die.prototype
  const ownRoll = Object.hasOwn(DieProto, 'roll')
  const baseRoll = DieProto.roll
  let used = 0
  let faces = 0
  // 记下正在掷的骰面，用于报告“还要掷的骰”和校验点数。
  DieProto.roll = function(this: any, ...args: any[]) { faces = this.faces; return baseRoll.apply(this, args) }
  Dice.randomUniform = () => {
    if (used >= points.length) throw new NeedsDice({ faces, index: used })
    const point = points[used++]
    if (!Number.isInteger(point) || point < 1 || (faces && point > faces)) throw Error(`Invalid die result ${point} for d${faces}`)
    // mapRandomFace(u) = ceil((1 - u) * faces) → 取区间中点，避免浮点边界。
    return 1 - (point - 0.5) / (faces || 1)
  }
  const restore = (): void => { Dice.randomUniform = original; if (ownRoll) DieProto.roll = baseRoll; else delete DieProto.roll }
  return run().then(value => { restore(); return { value, used } }, (error: unknown) => {
    restore()
    if (error instanceof NeedsDice) return { used, needs: error.request }
    if (error instanceof NeedsInput) return { used, input: error.where }
    throw error
  })
}

/** 记录本次操作发给数据库的全部写入（变更计划）。 */
async function capture<T>(run: () => Promise<T>): Promise<{ value: T; changes: Change[] }> {
  const socket = g.game.socket
  const emit = socket.emit
  const changes: Change[] = []
  socket.emit = function(event: string, ...args: any[]) {
    if (event === 'modifyDocument' || event === 'modifyDocumentBatch') {
      const requests = JSON.parse(JSON.stringify(event === 'modifyDocument' ? [args[0]] : args[0]))
      for (const request of requests) {
        const op = request.operation
        const data = request.action === 'create' ? op.data : request.action === 'update' ? op.updates : op.ids
        for (const d of data ?? []) changes.push({ action: request.action, type: request.type, pack: op.pack ?? null, parentUuid: op.parentUuid ?? null, data: d })
      }
    }
    return emit.call(this, event, ...args)
  }
  try { return { value: await run(), changes: changes.filter(c => c.action !== 'get' && c.type !== 'ChatMessage') } }
  finally { socket.emit = emit }
}

/** 界面渲染即“需玩家输入”（蓝图 §3.4 兜底）：任何应用窗口要显示就停在那里。 */
function guardRender<T>(run: () => Promise<T>): Promise<T> {
  const App = g.foundry.applications.api.ApplicationV2.prototype
  const render = App.render
  App.render = function(this: any) { throw new NeedsInput(this.constructor.name) }
  return run().finally(() => { App.render = render })
}

function rollSummary(roll: any): any {
  if (!roll) return null
  return { formula: roll.formula, total: roll.total, isCritical: roll.isCritical ?? null, isFumble: roll.isFumble ?? null,
    dice: roll.dice.map((d: any) => ({ faces: d.faces, results: d.results.map((r: any) => ({ result: r.result, active: r.active })) })) }
}

const actor = (id: string): any => g.game.actors.get(id, { strict: true })

/** 变更计划里改到的 system 路径 → dnd5e 的效果归属（每个数的来源）。 */
function sourcesFor(changes: Change[]): Record<string, any[]> {
  const out: Record<string, any[]> = {}
  for (const c of changes) {
    if (c.action !== 'update' || c.type !== 'Actor' || c.parentUuid) continue
    const a = g.game.actors.get(c.data._id)
    if (!a?._prepareActiveEffectAttributions) continue
    for (const path of Object.keys(g.foundry.utils.flattenObject(c.data)).filter(k => k.startsWith('system.'))) {
      const list = a._prepareActiveEffectAttributions(path) ?? []
      if (list.length) out[`${a.id}:${path}`] = list.map((x: any) => ({ label: x.label, mode: x.mode, value: x.value }))
    }
  }
  return out
}

/** 一次结算操作：统一结果格式（状态、数值、来源、变更计划、缺什么、等什么、未支持、错误）。 */
async function operate(points: number[], run: () => Promise<any>, actors: string[] = []): Promise<any> {
  let outcome: any; let changes: Change[] = []
  try { ({ value: outcome, changes } = await capture(() => withDice(points, () => guardRender(run)))) }
  // 失败原因交错误说明本身（上位设计 §3.5）；堆栈另放，只供排查（各浏览器格式不同，也含代码地址）
  catch (error) { return { status: 'error', error: error instanceof Error ? error.message : String(error), stack: error instanceof Error ? error.stack ?? null : null, changes } }
  const unsupported: UnsupportedItem[] = actors.flatMap(id => unsupportedFor(actor(id)))
  const status: KernelStatus = outcome.needs ? 'missing' : outcome.input ? 'pending' : unsupported.length ? 'unsupported' : 'complete'
  return { status, result: outcome.value ?? null, sources: sourcesFor(changes), changes, diceUsed: outcome.used,
    missing: outcome.needs ? { dice: outcome.needs } : null, pending: outcome.input ? { input: outcome.input } : null, unsupported }
}

/** b 段物品命令：只接线官方入口，结果格式复用上面的 operate。 */
const ITEM_COMMANDS = createItemCommands(operate, actor)
/** c 段战斗命令：只接线官方入口，结果格式复用上面的 operate。 */
const COMBAT_COMMANDS = createCombatCommands(operate, actor)

// ⓪ 探路取用的作者类（tests/e2e/library/p3-2-effects.mjs 的 EXPORTS），另加探路里经作用域取到的 SourceUtil、MiscUtil。
const AUTHOR_CLASSES = ['Config', 'ConfigConsts', 'VetoolsLinks', 'Vetools', 'SideDataInterfaces', 'Dnd5eUtil', 'UtilDamageTypes', 'ImplementationRegistryImportList',
  'DataConverterClassSubclassFeature', 'DataConverterFeat', 'DataConverterOptionalfeature', 'DataConverterRaceFeature', 'DataConverterSpell', 'DataConverterItem',
  'DataConverterRace', 'DataConverterBackground', 'DataConverterCreature', 'DataConverterCreatureFeature', 'DataConverterClass', 'SourceUtil', 'MiscUtil']
let authorClasses: Promise<any> | undefined
/** 照探路：执行一份 Plutonium 原包源码取出作者类，再按探路的初始化顺序准备（p3-2-effects-browser.mjs）。 */
function authorConverters(): Promise<any> {
  return authorClasses ??= (async () => {
    const src = await (await fetch(new URL('modules/plutonium/js/Bundle.js', document.baseURI))).text()
    const AsyncFn = Object.getPrototypeOf(async () => undefined).constructor
    const C = await new AsyncFn(`${src}\n;return { ${AUTHOR_CLASSES.join(', ')} };`)()
    C.Config._CONFIG_TEMP = { dataSources: { baseSiteUrl: new URL('.', document.baseURI).href }, misc: { rulesVersion: 'classic' } }
    C.ConfigConsts.prePreInit({ implRegistryImportList: C.ImplementationRegistryImportList.get() })
    C.Config._CONFIG = C.Config.api_getDefaults()
    C.Config._CONFIG_PLAYER = C.Config._getDefaultPlayerConfig()
    C.Vetools.prePreInit_preConfig()
    C.VetoolsLinks.prePreInit_postConfig()
    C.Vetools.prePreInit_postConfig()
    C.UtilDamageTypes.init()
    C.Dnd5eUtil.init()
    C.Vetools.init()
    C.SideDataInterfaces.init()
    return C
  })()
}

const NO_DIALOG = { configure: false }
const CONVERT_TIMEOUT_MS = 15_000
const NO_MESSAGE = { create: false }

export const KERNEL_COMMANDS = {
  ...ITEM_COMMANDS,
  ...COMBAT_COMMANDS,
  /**
   * 掷一个骰式：同一串点数得到同一结果。kind 选 dnd5e 的掷骰类（d20 = D20Roll，damage = DamageRoll，basic = BasicRoll），
   * options 原样交给它（优势、精灵精准、半身人幸运、最低值、暴击等）；不给 kind 用 Foundry 的 Roll。
   */
  roll: (formula: string, data: any = {}, points: number[] = [], build: { kind?: 'basic' | 'd20' | 'damage'; options?: any } = {}) => operate(points, async () => {
    const classes: Record<string, any> = { basic: g.CONFIG.Dice.BasicRoll, d20: g.CONFIG.Dice.D20Roll, damage: g.CONFIG.Dice.DamageRoll }
    const Roll = build.kind ? classes[build.kind] : g.Roll
    const roll = new Roll(formula, data, build.options ? structuredClone(build.options) : undefined)
    await roll.evaluate({ allowInteractive: false })
    return rollSummary(roll)
  }),
  damage: (actorId: string, damages: any, points: number[] = [], options: any = {}) => operate(points, async () => {
    const a = actor(actorId)
    await a.applyDamage(damages, options)
    return { hp: a.system.attributes.hp.toObject?.() ?? { ...a.system.attributes.hp } }
  }, [actorId]),
  rest: (actorId: string, type: 'short' | 'long', points: number[] = [], config: any = {}) => operate(points, async () => {
    const result = await actor(actorId)[type === 'short' ? 'shortRest' : 'longRest']({ dialog: false, chat: false, ...config })
    return result ? JSON.parse(JSON.stringify(result, (k, v) => k === 'clone' ? undefined : v)) : null
  }, [actorId]),
  save: (actorId: string, ability: string, points: number[] = []) => operate(points, async () =>
    (await actor(actorId).rollSavingThrow({ ability }, NO_DIALOG, NO_MESSAGE))?.map(rollSummary) ?? null, [actorId]),
  skill: (actorId: string, skill: string, points: number[] = []) => operate(points, async () =>
    (await actor(actorId).rollSkill({ skill }, NO_DIALOG, NO_MESSAGE))?.map(rollSummary) ?? null, [actorId]),
  attack: (actorId: string, itemId: string, points: number[] = []) => operate(points, async () => {
    const activity = actor(actorId).items.get(itemId, { strict: true }).system.activities.find((x: any) => x.type === 'attack')
    if (!activity) return null
    const attack = await activity.rollAttack({}, NO_DIALOG, NO_MESSAGE)
    const damage = await activity.rollDamage({}, NO_DIALOG, NO_MESSAGE)
    return { attack: attack?.map(rollSummary) ?? null, damage: damage?.map(rollSummary) ?? null }
  }, [actorId]),
  /** 升级待选项：dnd5e 成长管理器不弹窗算出的步骤（蓝图 §3.4）。 */
  levelUpSteps: (actorId: string, classId: string, delta = 1) => {
    const Manager = g.dnd5e.applications.advancement.AdvancementManager
    const manager = Manager.forLevelChange(actor(actorId), classId, delta)
    return { status: manager.steps.length ? 'pending' : 'complete', steps: manager.steps.map((s: any) => ({ type: s.type, level: s.level ?? null,
      advancement: s.advancement ? { type: s.advancement.constructor.typeName ?? s.advancement.type, id: s.advancement.id, title: s.advancement.title } : null })) }
  },
  /** 出处：dnd5e 自带的效果归属（任意数值路径）。 */
  attribution: (actorId: string, paths: string[]) => Object.fromEntries(paths.map(path =>
    [path, (actor(actorId)._prepareActiveEffectAttributions(path) ?? []).map((a: any) => ({ label: a.label, mode: a.mode, value: a.value }))])),
  /** 未支持检测（蓝图 §3.6，登记表见 writings.ts）：全部角色/怪物。 */
  unsupported: () => g.game.actors.contents.flatMap((a: any) => unsupportedFor(a)),
  /**
   * Plutonium 条目转换（蓝图 §3.1）：照 ⓪ 探路的调用方式（tests/e2e/library/p3-2-effects-browser.mjs）——
   * 取 Plutonium 原包源码里的作者转换器类，按探路同样的初始化与按类别分派调用；区别只在运行于真实 Foundry + dnd5e。
   * 一批条目逐条转换，每条一行：转出的 system / effects / type，或错误、或探路已定的边界说明（原文照搬）。
   */
  convert: async (kind: string, entries: any[], scope: Record<string, any[]> = {}) => {
    const C = await authorConverters()
    const converters: Record<string, any> = { classFeature: C.DataConverterClassSubclassFeature, subclassFeature: C.DataConverterClassSubclassFeature,
      feat: C.DataConverterFeat, optionalfeature: C.DataConverterOptionalfeature, spell: C.DataConverterSpell, item: C.DataConverterItem,
      race: C.DataConverterRace, raceFeature: C.DataConverterRaceFeature, monsterFeature: C.DataConverterCreatureFeature, background: C.DataConverterBackground }
    const timeout = <T>(promise: Promise<T>): Promise<T> => {
      let timer: ReturnType<typeof setTimeout> | undefined
      return Promise.race([promise, new Promise<never>((_, reject) => { timer = setTimeout(() => reject(Error(`PROBE_TIMEOUT ${CONVERT_TIMEOUT_MS}`)), CONVERT_TIMEOUT_MS) })]).finally(() => clearTimeout(timer))
    }
    const copy = (v: any): any => C.MiscUtil.copyFast(v)
    const rows = []
    for (const ent of entries) {
      const row: any = { kind, name: ent.name, source: ent.source }
      row.ownerCompatible = [ent.classSource, ent.subclassSource].filter(Boolean).every((source: string) => C.SourceUtil.isClassicSource(source))
      if (!row.ownerCompatible) { row.notAttempted = '所属职业/子职业来源不是作者判断的旧版；资料可见不代表兼容 2014 结算'; rows.push(row); continue }
      if (ent.__prop === 'monsterSpellcasting') { row.notAttempted = '必须走作者完整 NPC 施法导入流程；不能把原始施法对象当普通特性'; rows.push(row); continue }
      try {
        let doc: any
        if (kind === 'class') doc = await timeout(C.DataConverterClass.pGetDocumentJsonClass(copy(ent), { isClsDereferenced: true }))
        else if (kind === 'subclass') {
          const cls = (scope.class ?? []).find((c: any) => c.name === ent.className && c.source === ent.classSource)
          if (!cls) throw Error('Parent class outside input scope')
          doc = await timeout(C.DataConverterClass.pGetDocumentJsonSubclass(copy(cls), copy(ent), { isScDereferenced: true }))
        } else if (kind === 'monster') {
          row.hpProbe = C.DataConverterCreature.getDataHp(copy(ent))
          row.notAttempted = '完整怪物需 Actor 导入流程；本行只验证作者 HP 处理'
          rows.push(row); continue
        } else if (!converters[kind]) { row.notAttempted = 'No standalone document converter in this probe'; rows.push(row); continue }
        else doc = await timeout(converters[kind].pGetDocumentJson(copy(ent), {}))
        row.effects = doc?.effects ?? []; row.system = doc?.system ?? null; row.type = doc?.type
        JSON.parse(JSON.stringify(row))
      } catch (e: any) { row.error = String(e?.stack ?? e).split('\n').slice(0, 4).join(' | ') }
      rows.push(row)
    }
    return rows
  },
}

export type KernelCommandName = keyof typeof KERNEL_COMMANDS
