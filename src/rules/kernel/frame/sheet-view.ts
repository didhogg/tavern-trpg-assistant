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
import { fromEntry, type FrameText } from '../shown'
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

/** 给抄好的数据里剩下的文字标出处（①③）；已经是出处的（②物品名）不动。 */
function mark(v: any, texts: Set<string>, codes: Set<string>): any {
  if (typeof v === 'string') {
    if (v.includes('.') && !/\s/.test(v) && g.game.i18n.has(v)) return { $t: 'system', key: v, text: g.game.i18n.localize(v) } satisfies FrameText
    // 只有数字、符号的（页码、年份）不是给人读的文字
    if (texts.has(v) && !codes.has(v) && /\p{L}/u.test(v)) return nameText(v, null) ?? fromEntry(v)
    return v
  }
  if (!v || typeof v !== 'object') return v
  if (typeof v.$t === 'string') return v
  if (Array.isArray(v)) return v.map((x) => mark(x, texts, codes))
  return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, k === 'author' ? x : mark(x, texts, codes)]))
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
  return { sheet: app.constructor.name, base: mark(copy(base, entries, skip), texts, codes), parts: mark(copy(out, entries, skip), texts, codes) }
}

/** 官方 NPC 表“特性”部分的分组（每件物品的次数、命中、豁免 DC 在共用部分的 itemContext，两种表算法相同）。怪物直接用本表已算好的。 */
async function actionsOf(a: any, app: any, out: Record<string, any>): Promise<{ sections: unknown }> {
  const NPC = g.dnd5e.applications.actor.NPCActorSheet
  if (app instanceof NPC) return { sections: out.features?.sections ?? [] }
  const npc = new NPC({ document: a })
  const opt = (o: unknown): any => JSON.parse(JSON.stringify(o))
  const ctx = await npc._prepareContext(opt({ parts: ['features'] }))
  const part = await npc._preparePartContext('features', Object.assign({}, ctx), opt({}))
  return { sections: part.sections ?? [] }
}
