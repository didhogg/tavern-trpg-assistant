// P6 B1：人物页用的读 / 改 / 掷 / 删人命令。只接 dnd5e / Foundry 官方入口，不写规则。
// 能改哪些字段由文档自己的数据结构判断（schema.getField），不写字段名单；
// 只挡住几处结构性的路径：文档编号、内嵌集合（物品 / 效果有自己的改法）、作者编号（引用靠它）。
/* eslint-disable @typescript-eslint/no-explicit-any -- 官方文档对象没有类型声明。 */

import { itemState, type ActorGetter, type Operate } from './commands-items'
import { fromAuthor, fromEntry } from '../shown'
import { itemText } from './sheet-texts'
import { itemForStateKey } from '../../../core/saves/state'
import { sheetView } from './sheet-view'
import { nameText, registryCaptured, statusKey, tableNames } from './registry-keys'

const g = globalThis as any
const NO_DIALOG = { configure: false }
const NO_MESSAGE = { create: false }

/**
 * 改动一条：set = 设成 value；remove = 删掉这个键（基准里没有的字段回到"没有"）。
 * 效果的三种改法共用一个定位：带 itemId = 那件物品里的效果（专长、装备自带的），不带 = 人物直属效果。
 */
export type SheetEdit =
  | { kind: 'set'; path: string; value?: unknown; remove?: boolean }
  | { kind: 'item'; itemId: string; path: string; value?: unknown; remove?: boolean }
  | { kind: 'itemDelete'; itemId: string }
  | { kind: 'effect'; effectId: string; itemId?: string; path: string; value?: unknown; remove?: boolean }
  | { kind: 'effectCreate'; itemId?: string; data: Record<string, unknown> }
  | { kind: 'effectDelete'; effectId: string; itemId?: string }
  | { kind: 'status'; statusId: string; active?: boolean; levels?: number }

const LOCKED = [/^_id$/, /^_stats(\.|$)/, /^type$/, /^items(\.|$)/, /^effects(\.|$)/, /^flags\.plutonium(\.|$)/, /^system\.advancement(\.|$)/]

/** 路径是不是这个文档能存的字段：system.* 问模型字段，flags.* 是模块附加数据，其余问文档字段。 */
function writable(doc: any, path: string): boolean {
  if (!path || LOCKED.some((re) => re.test(path))) return false
  if (path.startsWith('flags.')) return path.split('.').length >= 3
  if (path.startsWith('system.')) return !!doc.system?.schema?.getField?.(path.slice(7))
  return !!doc.schema?.getField?.(path)
}

/** 一条 set / remove 换成官方 update 的写法；remove 用 Foundry 的 `-=键` 删除。 */
function patchOf(doc: any, path: string, value: unknown, remove?: boolean): Record<string, unknown> {
  if (!writable(doc, path)) throw Error(`不能改这个字段：${path}`)
  if (!remove) return { [path]: value }
  const cut = path.lastIndexOf('.')
  return { [`${path.slice(0, cut)}.-=${path.slice(cut + 1)}`]: null }
}

/** 效果挂在谁身上：人物，或人物身上的某件物品（按编号找，不按名字）。 */
const effectHost = (a: any, itemId?: string): any => itemId ? a.items.get(itemId, { strict: true }) : a

/** 数据结构里的 JSON 化（去掉文档对象、HTML 锚点这类界面专用的东西）。 */
const plain = (v: any): any => JSON.parse(JSON.stringify(v ?? null, (k, val) => (k === 'document' || k === 'anchor' || k === 'fields' || k === 'field' || k === 'parent') ? undefined : val))

/** 数据类上写成取值函数的值（dnd5e HitDice 的 value / max 等）：沿原型链收集；Foundry 数据模型基类自己的（schema、parent…）不收。 */
function computedGetters(v: object): Array<[string, () => unknown]> {
  const stop = new Set<object>([Object.prototype, g.foundry.abstract.DataModel.prototype])
  const out: Array<[string, () => unknown]> = []
  for (let p = Object.getPrototypeOf(v); p && !stop.has(p); p = Object.getPrototypeOf(p)) {
    for (const [k, d] of Object.entries(Object.getOwnPropertyDescriptors(p))) if (d.get && !out.some(([n]) => n === k)) out.push([k, d.get])
  }
  return out
}

/**
 * 引擎算好的数值（不是 toObject：toObject 只交存起来的原始值，AC、调整值、被动察觉这类算出来的值会丢）。
 * 照对象自己的属性逐层抄成普通数据；跳过文档对象、父链接、下划线开头的内部字段与函数。
 */
function live(v: any, depth = 0, seen: WeakSet<object> = new WeakSet()): any {
  if (typeof v === 'function') return undefined
  if (v === null || typeof v !== 'object') return v
  if (depth > 12 || seen.has(v) || v instanceof g.foundry.abstract.Document) return undefined
  seen.add(v)
  if (v instanceof Set) return [...v].map((x) => live(x, depth + 1, seen))
  // Foundry 的 Collection 是 Map，但逐个取只给值；按键值对取
  if (v instanceof Map) return Object.fromEntries([...Map.prototype.entries.call(v)].map(([k, x]) => [k, live(x, depth + 1, seen)]))
  if (Array.isArray(v)) return v.map((x) => live(x, depth + 1, seen))
  const out: Record<string, unknown> = {}
  for (const k of Object.keys(v)) {
    if (k === 'parent' || k.startsWith('_')) continue
    const x = live(v[k], depth + 1, seen)
    if (x !== undefined) out[k] = x
  }
  // 驾驶员 2026-11-23（详情页对账 B2）：生命骰剩余 / 上限这类现算的值以前读不到
  for (const [k, get] of computedGetters(v)) {
    if (k in out || k === 'parent' || k.startsWith('_')) continue
    let raw: unknown
    try { raw = get.call(v) } catch (error) { raw = undefined; void error } // 取值函数要的上下文不在（例如没挂到人物上）：这一项不交，其余照常
    const x = live(raw, depth + 1, seen)
    if (x !== undefined) out[k] = x
  }
  return out
}

/** 引擎配置窗算好的上下文（不打开窗口）：生命按职业的合计、效果加成；AC 的公式与计算。 */
async function configContext(Cls: any, a: any, keys: string[]): Promise<Record<string, unknown> | null> {
  if (!Cls) return null
  const app = new Cls({ document: a })
  const base = await app._prepareContext({ parts: [] })
  const ctx = await app._preparePartContext(Object.keys(Cls.PARTS ?? {})[0] ?? 'config', base, {})
  return Object.fromEntries(keys.filter((k) => k in ctx).map((k) => [k, plain(ctx[k])]))
}

/** 掷骰登记表：一种检定一行，都是官方 roll* 入口；加一种 = 加一行。 */
const CHECKS: Record<string, (a: any, key?: string) => Promise<any[] | null>> = {
  ability: (a, key) => a.rollAbilityCheck({ ability: key }, NO_DIALOG, NO_MESSAGE),
  tool: (a, key) => a.rollToolCheck({ tool: key }, NO_DIALOG, NO_MESSAGE),
  death: (a) => a.rollDeathSave({}, NO_DIALOG, NO_MESSAGE),
  hitDie: (a, key) => a.rollHitDie(key ? { denomination: key } : {}, NO_DIALOG, NO_MESSAGE),
  // 战斗外先攻：官方 rollInitiative 会建战斗，这里只取官方先攻骰再掷。
  initiative: async (a) => {
    const roll = a.getInitiativeRoll()
    if (!roll) return null
    await roll.evaluate({ allowInteractive: false })
    return [roll]
  },
}

export function createSheetCommands(operate: Operate, actor: ActorGetter, rollSummary: (roll: any) => any) {
  return {
    /** 人物页读数：官方准备后的数值 + 物品 / 效果 + 生命与 AC 的官方分解；界面只显示，不算。 */
    /** entries = 这个人引用的英文条目（主线给，顺序与显示出口的条目一致），用来给怪物动作等定位。 */
    sheet: (actorId: string, entries: unknown[] = []) => operate([], async () => {
      const a = actor(actorId)
      const apps = g.dnd5e?.applications?.actor ?? {}
      return {
        id: a.id, name: a.name, img: a.img, type: a.type,
        flags: plain(a.flags ?? {}),
        system: live(a.system),
        statuses: [...(a.statuses ?? [])],
        items: [...a.items].map((i: any) => ({ ...itemState(i), img: i.img, sort: i.sort, flags: plain(i.flags ?? {}), system: live(i.system), labels: plain(i.labels ?? {}) })),
        effects: [...a.allApplicableEffects()].map((e: any) => ({
          id: e.id, name: e.name, img: e.img, disabled: e.disabled, suppressed: e.isSuppressed ?? false,
          origin: e.origin ?? null, from: e.parent?.documentName === 'Item' ? { itemId: e.parent.id, name: e.parent.name } : null,
          statuses: [...(e.statuses ?? [])], duration: plain(e.duration), changes: plain(e.system?.changes ?? e.changes ?? []),
        })),
        // 界面显示的文字：标好来路，主线交唯一显示出口（kernel/display.ts）换成本战役语言；数值与编号照上面原样
        shown: {
          items: [...a.items].map((i: any) => ({ id: i.id, ...itemText(i, entries) })),
          // 效果名：状态这类登记过的名字按名字键取；其余（物品自带的效果）按条目原文位置
          effects: [...a.allApplicableEffects()].map((e: any) => ({ id: e.id, name: nameText(String(e.name ?? ''), null) ?? fromEntry(e.name) })),
        },
        // 官方角色表 / NPC 表自己的显示数据（sheet-view.ts），界面显示读这一份
        view: await sheetView(a, entries),
        breakdown: {
          hp: await configContext(apps.HitPointsConfig, a, ['classes', 'ability', 'effects', 'levels']),
          ac: await configContext(apps.ArmorClassConfig, a, ['calculations', 'formulaLabel']),
        },
      }
    }),

    /** 人物列表：全员（或指定的人）引擎算好的数值 + 物品类别 / 名字 / 等级 + 状态效果；摘哪些字段在宿主 people.roster。 */
    roster: (ids?: string[]) => operate([], async () => [...g.game.actors].filter((a: any) => !ids || ids.includes(a.id)).map((a: any) => ({
      id: a.id, name: a.name, img: a.img, type: a.type, system: live(a.system),
      items: [...a.items].filter((i: any) => ['class', 'race', 'background'].includes(i.type)).map((i: any) => ({ id: i.id, type: i.type, name: i.name, levels: i.system?.levels ?? null })),
      conditions: [...a.effects].filter((e: any) => e.active && e.statuses?.size).map((e: any) => e.name),
    }))),

    /** 统一改人物：一组改动按顺序走官方 update / 建删内嵌文档 / 状态开关。 */
    edit: (actorId: string, edits: SheetEdit[]) => operate([], async () => {
      const a = actor(actorId)
      for (const e of edits) {
        if (e.kind === 'set') await a.update(patchOf(a, e.path, e.value, e.remove))
        else if (e.kind === 'item') { const item = a.items.get(e.itemId, { strict: true }); await item.update(patchOf(item, e.path, e.value, e.remove)) }
        else if (e.kind === 'itemDelete') await a.deleteEmbeddedDocuments('Item', [e.itemId])
        else if (e.kind === 'effect') { const fx = effectHost(a, e.itemId).effects.get(e.effectId, { strict: true }); await fx.update(patchOf(fx, e.path, e.value, e.remove)) }
        else if (e.kind === 'effectCreate') await effectHost(a, e.itemId).createEmbeddedDocuments('ActiveEffect', [e.data])
        else if (e.kind === 'effectDelete') await effectHost(a, e.itemId).deleteEmbeddedDocuments('ActiveEffect', [e.effectId])
        else if (e.kind === 'status') await a.toggleStatusEffect(e.statusId, e.levels !== undefined ? { levels: e.levels } : { active: e.active ?? true })
        else throw Error(`不认识的改动：${(e as any).kind}`)
      }
      return { edits: edits.length }
    }, [actorId]),

    /** 检定登记表里的掷骰（属性 / 工具 / 死亡豁免 / 生命骰 / 战斗外先攻）；点数由调用方给。 */
    check: (actorId: string, kind: string, key?: string, points: number[] = []) => operate(points, async () => {
      const run = CHECKS[kind]
      if (!run) throw Error(`没有这种检定：${kind}`)
      return (await run(actor(actorId), key))?.map(rollSummary) ?? null
    }, [actorId]),

    /**
     * 编号的显示名（本战役每个人共用）：引擎登记表整表交出（伤害类型、语言、体型、技能、物品属性……，不列表名），
     * 加上能开关的状态（名字 + 图标）。界面拿编号查这里，不自己写名字。
     */
    glossary: () => operate([], async () => {
      if (!registryCaptured()) throw Error('开机时没有记下登记表原值（registry-keys.ts）')
      const tables = Object.fromEntries(Object.entries(g.CONFIG.DND5E ?? {}).map(([name, t]) => [name, tableNames(name, t)]).filter(([, rows]) => Object.keys(rows as object).length))
      // 状态清单按运行时最终的列表（dnd5e 开机后才把自己的状态加进去）；名字找不到语言键的照样列出、记为没翻到，不悄悄丢掉
      const statuses = (g.CONFIG.statusEffects ?? []).flatMap((s: any) => typeof s?.name === 'string'
        ? [{ id: s.id, name: nameText(s.name, statusKey(s.id)) ?? fromAuthor(s.name, null), img: s.img ?? null }] : [])
      return { tables, statuses }
    }),

    /**
     * 改动记录的字段名：存档人物段里的路径（state.actor.… / state.items.<编号>.…）→ dnd5e 数据结构里这个字段自带的名字
     * （字段没写名字就用最近一个有名字的上级字段）；物品的再带上物品名。插件自己的字段（adjustments.…）不在这里。
     */
    fieldLabels: (rows: Array<{ actorId: string; path: string }>) => operate([], async () => rows.map(({ actorId, path }) => {
      const a = g.game.actors.get(actorId)
      // 存档里物品按状态键记（新存档 ref:类别|作者编号，旧存档物品编号），和读档同一个认法（core/saves/state.ts）
      const m = /^state\.(?:actor|items\.(.+?))\.((?:system|name|img|flags)(?:\..*)?)$/.exec(path)
      if (!a || !m) return null
      const doc = m[1] ? itemForStateKey([...a.items], m[1]) as any : a
      if (!doc) return null
      const parts = m[2].split('.')
      for (let n = parts.length; n > 0; n--) {
        const p = parts.slice(0, n).join('.')
        const label = (p.startsWith('system.') ? doc.system?.schema?.getField(p.slice(7)) : doc.schema?.getField(p))?.label
        if (typeof label !== 'string' || !label) continue
        const field = g.game.i18n.has(label) ? { $t: 'system', key: label, text: g.game.i18n.localize(label) } : nameText(label, null) ?? fromAuthor(label, null)
        return { field, ...(m[1] ? { item: itemText(doc, []).name } : {}) }
      }
      return null
    })),

    /** 从小窗里删掉人物（删人、撤销加人、按存档退回前用）。 */
    deleteActors: (ids: string[]) => operate([], async () => {
      const exist = ids.filter((id) => g.game.actors.get(id))
      if (exist.length) await g.CONFIG.Actor.documentClass.deleteDocuments(exist)
      return { deleted: exist }
    }),
  }
}
