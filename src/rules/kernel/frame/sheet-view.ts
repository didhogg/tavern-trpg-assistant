// 人物页的显示数据（驾驶员 2026-11-23 批准方案 A）：直接用 dnd5e 官方角色表 / NPC 表自己的“显示数据准备”
// （_prepareContext + 每个部分的 _preparePartContext，不打开窗口；部分 = 官方 PARTS，有什么取什么）。
// 小窗界面语言是中文，官方给的编号名字、分组、说明已是本战役语言；这里只做两件事：
//   1. 抄成能传出小窗的普通数据——只按“类型”去掉不能传的：文档对象（物品换成编号 + 名字）、字段定义、配置表本身、程序窗口、函数；
//   2. 剩下的文字标出处，交主线唯一显示出口（kernel/display.ts）：
//      ① 值本身是登记过的语言键（官方留给模板渲染时才翻的）→ 按键；
//      ② 物品 / 特性名 → 按作者编号定位（sheet-texts.ts）；
//      ③ 值和人物数据里某个普通文字字段相同（从人物数据来的：阵营、补充说明……），且不是引擎登记表里的编号
//         → 英文原文对应的语言键（作者拼的英文短语）或条目原文同位置的中文。
//   其余原样（图标、样式名、编号、数字）。
/* eslint-disable @typescript-eslint/no-explicit-any -- 官方文档 / 程序窗口对象没有类型声明。 */
import { asData, fromEntry, joined, named, type FrameText } from '../shown'
import { baseItemIds } from './author-classes'
import { nameText, registryCodes } from './registry-keys'
import { itemText } from './sheet-texts'

const g = globalThis as any

/** 普通文字字段：恰好是 Foundry 的 StringField（不是 HTML、公式、编号、路径这些专门子类）。 */
const plainTextField = (field: any): boolean => !!field && field.constructor === g.foundry.data.fields.StringField

/** 文档数据里普通文字字段的值（沿文档自己的数据结构走）。 */
function dataTexts(data: any, field: any, out: Set<string>): Set<string> {
  if (data === null || data === undefined || !field) return out
  if (typeof data === 'string') { if (plainTextField(field) && data.trim()) out.add(data); return out }
  if (typeof data !== 'object') return out
  const element = field.element ?? (field.model instanceof g.foundry.data.fields.DataField ? field.model : null)
  const fields = field.fields as Record<string, any> | undefined
  for (const [k, v] of Object.entries(data)) {
    const sub = fields ? fields[k] : element
    if (sub) dataTexts(v, sub, out)
  }
  return out
}

/** 抄成普通数据：只按类型去掉不能传、不该传的东西；物品文档换成 编号 + 名字（出处见 itemText）。 */
function copy(v: any, entries: unknown[], skip: Set<object>, seen: Set<object> = new Set(), depth = 0): any {
  if (typeof v === 'function') return undefined
  if (v === null || typeof v !== 'object') return v
  // seen = 这一路往下的祖先（共用的对象照抄，只挡住真正的循环）
  if (depth > 10 || seen.has(v)) return undefined
  if (v === g.CONFIG || v === g.CONFIG?.DND5E || v === g.game || skip.has(v)) return undefined
  const F = g.foundry
  if (v instanceof F.abstract.Document) {
    if (v.documentName !== 'Item') return { documentName: v.documentName, id: v.id ?? null }
    // 物品带上官方给它的显示文字（伤害公式与类型、恢复方式、充能、动作类型……），同样过显示出口（驾驶员 11-23 批 G2）
    const labels = v.labels ? copy(v.labels, entries, skip, seen, depth + 1) : undefined
    return { documentName: 'Item', id: v.id, ...itemText(v, entries), ...(labels ? { labels } : {}) }
  }
  if (v instanceof F.data.fields.DataField || v instanceof F.applications.api.ApplicationV2) return undefined
  seen.add(v)
  try {
    if (v instanceof Set) return [...v].map((x) => copy(x, entries, skip, seen, depth + 1))
    if (v instanceof Map) return Object.fromEntries([...Map.prototype.entries.call(v)].map(([k, x]) => [k, copy(x, entries, skip, seen, depth + 1)]))
    if (Array.isArray(v)) return v.map((x) => copy(x, entries, skip, seen, depth + 1))
    const out: Record<string, unknown> = {}
    for (const k of Object.keys(v)) {
      if (k.startsWith('_')) continue
      const x = copy(v[k], entries, skip, seen, depth + 1)
      if (x !== undefined) out[k] = x
    }
    return out
  } finally {
    seen.delete(v)
  }
}

/** 人物身上物品的原名（结算小窗里是英文）→ 物品名的出处；长的在前，免得短名先匹配到长名里。 */
type Names = Array<{ re: RegExp; text: FrameText }>
function itemNames(a: any, entries: unknown[]): Names {
  const seen = new Set<string>()
  return [...a.items].map((i: any) => String(i.name ?? '')).filter((n) => n.length >= 3 && /[A-Za-z]/.test(n) && !seen.has(n) && seen.add(n))
    .sort((x, y) => y.length - x.length)
    .map((n) => ({ re: new RegExp(`(?<![A-Za-z])${n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![A-Za-z])`), text: itemText([...a.items].find((i: any) => i.name === n), entries).name }))
}
/**
 * 这个人身上用到的 dnd5e 基础物品键（武器 / 护甲训练里的具体武器、工具熟练）在显示数据里是 dnd5e 物品库的英文名（Handaxe）：
 * 按作者换算查回作者编号（author-classes.ts baseItemIds），和物品名同一张“英文名 → 出处”表，显示出口按编号取本战役语言。
 * 没有这类键就不取作者表（不白读作者程序）。
 */
async function baseItemNames(a: any): Promise<Names> {
  const C = g.CONFIG.DND5E
  const T = g.dnd5e.documents.Trait
  const keys = new Set<string>([
    ...[...(a.system.traits?.weaponProf?.value ?? [])].filter((k: string) => C.weaponIds?.[k]),
    ...[...(a.system.traits?.armorProf?.value ?? [])].filter((k: string) => C.armorIds?.[k] || C.shieldIds?.[k]),
    ...Object.keys(a.system.tools ?? {}).filter((k) => C.tools?.[k]),
  ])
  if (!keys.size) return []
  const ids = await baseItemIds()
  const out: Names = []
  for (const key of keys) {
    const label = String(T.getBaseItem(C.weaponIds?.[key] ?? C.armorIds?.[key] ?? C.shieldIds?.[key] ?? C.tools?.[key]?.id ?? key, { indexOnly: true })?.name ?? '')
    const id = ids.get(key)
    if (label && /[A-Za-z]/.test(label) && id) out.push({ re: new RegExp(`(?<![A-Za-z])${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![A-Za-z])`), text: named(label, id, true) })
  }
  return out
}

/** ④ 官方拼好的句子里嵌着物品原名（“Cleric 施法”“Cleric • V、S”）：名字那段按物品出处取本战役语言，其余原样。 */
function embedded(v: string, names: Names): FrameText | null {
  if (!/[A-Za-z]/.test(v)) return null
  for (const { re, text } of names) {
    const m = re.exec(v)
    if (!m) continue
    const before = v.slice(0, m.index)
    const after = v.slice(m.index + m[0].length)
    const rest = (s: string): FrameText[] => (s ? [embedded(s, names) ?? asData(s)] : [])
    return joined([...rest(before), text, ...rest(after)], '')
  }
  return null
}

/** 给抄好的数据里剩下的文字标出处（①③④）；已经是出处的（②物品名）不动。 */
function mark(v: any, texts: Set<string>, codes: Set<string>, names: Names): any {
  if (typeof v === 'string') {
    // ① 语言键：带点的键，或 Foundry 自己的单词键（"None" 这类，官方已拼进显示数据但没翻）
    if (((v.includes('.') && !/\s/.test(v)) || /^[A-Z][A-Za-z]{2,}$/.test(v)) && g.game.i18n.has(v)) return { $t: 'system', key: v, text: g.game.i18n.localize(v) } satisfies FrameText
    // 只有数字、符号的（页码、年份）不是给人读的文字
    if (texts.has(v) && !codes.has(v) && /\p{L}/u.test(v)) return nameText(v, null) ?? fromEntry(v)
    return embedded(v, names) ?? v
  }
  if (!v || typeof v !== 'object') return v
  if (typeof v.$t === 'string') return v
  if (Array.isArray(v)) return v.map((x) => mark(x, texts, codes, names))
  return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, k === 'author' ? x : mark(x, texts, codes, names)]))
}

/** 官方显示数据：base = 共用部分；parts[部分] = 这个部分多出来的；itemContext = 每件物品的显示数据。 */
export async function sheetView(a: any, entries: unknown[]): Promise<{ sheet: string; base: unknown; parts: Record<string, unknown> }> {
  const app = a.sheet
  const opt = (o: unknown): any => JSON.parse(JSON.stringify(o))
  const parts = Object.keys(app.constructor.PARTS ?? {})
  const base = await app._prepareContext(opt({ parts }))
  const out: Record<string, unknown> = {}
  for (const part of parts) {
    const ctx = await app._preparePartContext(part, Object.assign({}, base), opt({}))
    out[part] = Object.fromEntries(Object.entries(ctx).filter(([k]) => !(k in base)))
  }
  // 人物和每件物品的 system 按各自的数据结构走（类型数据字段本身不带子字段定义）
  const texts = dataTexts(a.toObject().system, a.system.schema, new Set())
  for (const item of a.items) dataTexts(item.toObject().system, item.system.schema, texts)
  const codes = registryCodes()
  // 官方数据里那份人物原始数据（_source）和读数交出的原始数据重复，按“是同一个对象”去掉
  const skip = new Set<object>([a._source].filter(Boolean))
  // 行动页：按动作类型分组用官方 NPC 表自己的“特性”部分；玩家角色也走它（驾驶员 11-23 批 G1）
  out.actions = await actionsOf(a, app, out)
  const names = [...itemNames(a, entries), ...await baseItemNames(a)]
  return { sheet: app.constructor.name, base: mark(copy(base, entries, skip), texts, codes, names), parts: mark(copy(out, entries, skip), texts, codes, names) }
}

/** 官方 NPC 表“特性”部分的分组（每件物品的次数、命中、豁免 DC 在共用部分的 itemContext，两种表算法相同）。怪物直接用本表已算好的。 */
async function actionsOf(a: any, app: any, out: Record<string, any>): Promise<{ sections: unknown }> {
  const NPC = g.dnd5e.applications.actor.NPCActorSheet
  let sections: any[]
  if (app instanceof NPC) sections = out.features?.sections ?? []
  else {
    const npc = new NPC({ document: a })
    const opt = (o: unknown): any => JSON.parse(JSON.stringify(o))
    const ctx = await npc._prepareContext(opt({ parts: ['features'] }))
    const part = await npc._preparePartContext('features', Object.assign({}, ctx), opt({}))
    sections = part.sections ?? []
  }
  return { sections: withActionOverrides(a, sections) }
}

/**
 * 「显示到行动页 / 从行动页拿掉」（照 Tidy5e actionFilterOverride）：物品上 flags.tavern-trpg.actionList = true 硬加进来
 * （按它第一个活动的动作类型放进对应组，官方组里没有这种动作就放进被动组），= false 拿掉；没标记照官方默认。
 */
function withActionOverrides(a: any, sections: any[]): any[] {
  const flag = (i: any): boolean | undefined => i.flags?.['tavern-trpg']?.actionList
  const kept = sections.map((sec) => ({ ...sec, items: (sec.items ?? []).filter((i: any) => flag(i) !== false) }))
  const listed = new Set(kept.flatMap((sec) => (sec.items ?? []).map((i: any) => i.id)))
  for (const item of a.items) {
    if (flag(item) !== true || listed.has(item.id)) continue
    const type = [...(item.system.activities ?? [])].map((x: any) => x.activation?.type).find(Boolean)
    const home = kept.find((sec) => sec.id === type) ?? kept.find((sec) => sec.id === 'passive') ?? kept[kept.length - 1]
    if (home) home.items = [...home.items, item]
  }
  return kept
}
