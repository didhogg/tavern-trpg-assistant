// P6 自动项目「取下 / 装回」：在人物准备的汇合处（建好完整基准之后、叠游戏状态之前）按人物的取下安排处理。
// 三条路径都经过这里：重建（rebuildCharacter）、读档命中缓存与撤销 / 取消退回（createActorsFromBase）。
//
//   完整基准（原始来源 + 原始选择，原样保留，缓存也存这一份）
//        │ 取下安排
//        ▼
//   受影响的成长按原作者 reverse 全部退回（倒序）→ 按原顺序恢复：整条取下的跳过；取下子项的从原数据里去掉那几项；
//   能重判固定授予的（集合并入、可重复应用）再让作者重新判断一次 —— 同名熟练有两个来源时，取下一份另一份仍在
//        │
//        ▼
//   取下后的人物视图（存档差别相对它算）→ 再叠游戏状态
//
// 不替作者算「减几点、删哪项」：只决定哪些原始数据交回作者的 restore / apply。
// 子项的身份用作者数据自己的键（熟练：chosen 里的 skills:prc；属性提升：属性键），不按名字。
// 成长类型登记表：加一种 = 加一行；没登记的类型不能取下，会给出原因，不猜。
/* eslint-disable @typescript-eslint/no-explicit-any -- 官方文档对象没有类型声明。 */

/** 一条取下记录：作者来源（Plutonium 标记 prop|source|hash）+ 可选的成长编号 / 等级 / 子项。只写来源 = 整件取下。 */
export interface OffRow { ref: string; advancement?: string; level?: number; part?: string }

interface PartRule {
  /**
   * 这条成长能给哪些子项（作者键）：作者配置里的固定授予 + 记下的选择。不能只看记下的结果——
   * 同名熟练有两个来源时，作者建卡会去重，第二个来源的记录里可能没有这一项。
   */
  parts: (adv: any) => string[]
  /** 去掉这些子项后的数据（给作者 restore / apply）。 */
  without: (value: any, drop: Set<string>) => any
  /** 作者 apply 是集合并入、可重复应用：恢复后再让作者重判固定授予（被去重的另一来源会回来）。 */
  refresh: boolean
}

const keysOf = (v: any): string[] => [...(v?.chosen ?? [])].map(String)
const plainOf = (v: any): any => JSON.parse(JSON.stringify(v ?? null, (_k, x) => (x instanceof Set ? [...x] : x)))
export const OFF_TYPES: Record<string, PartRule> = {
  Trait: {
    parts: (adv) => [...new Set([...keysOf(plainOf(adv.value)), ...(plainOf(adv.configuration)?.grants ?? []).map(String)])],
    without: (v, drop) => ({ ...v, chosen: keysOf(v).filter((k) => !drop.has(k)) }),
    refresh: true,
  },
  AbilityScoreImprovement: {
    // 选专长那种（type = feat）会授予物品，取下要连物品一起处理，暂不登记：只认属性分配
    parts: (adv) => {
      const value = plainOf(adv.value), fixed = plainOf(adv.configuration)?.fixed ?? {}
      return [...new Set([...(value?.type === 'asi' ? Object.keys(value.assignments ?? {}) : []), ...Object.keys(fixed).filter((k) => fixed[k])])]
    },
    without: (v, drop) => ({ ...v, assignments: Object.fromEntries(Object.entries(v?.assignments ?? {}).filter(([k]) => !drop.has(k))) }),
    refresh: false,
  },
}

/** 取下记录里的「整件」：控制隐藏的效果用固定编号，读档、撤销重算时是同一个，不会多出一份。 */
export const OFF_CONTROLLER_ID = 'trpgOffHidden000'

export const flagsKey = (item: any): string | null => {
  const f = item?.flags?.plutonium
  return f?.propDroppable && f.source && f.hash ? `${f.propDroppable}|${f.source}|${f.hash}` : null
}
const typeOf = (adv: any): string => adv.constructor?.typeName ?? adv.type

export interface AdvRow { item: any; key: string; adv: any; type: string; level: number }

/** 人物身上有作者来源的每条成长（每一级一行）；和记下成长选择（captureChoices）同一个认法。 */
export function advancementRows(actor: any): AdvRow[] {
  const level = actor.system.details?.level ?? 1
  const rows: AdvRow[] = []
  for (const item of actor.items) {
    const key = flagsKey(item)
    if (!key) continue
    for (const adv of Object.values(item.advancement?.byId ?? {}) as any[]) {
      for (const lv of (adv.levels ?? [])) if (lv <= level || lv === 0) rows.push({ item, key, adv, type: typeOf(adv), level: lv })
    }
  }
  return rows
}

const storable = (data: any): any => JSON.parse(JSON.stringify(data ?? null, (_k, v) => (v instanceof Set ? [...v] : v)))
const matches = (row: AdvRow, off: OffRow): boolean => off.ref === row.key && (off.advancement === undefined || off.advancement === row.adv.id) && (off.level === undefined || off.level === row.level)

/** 原始选择（取下前作者 reverse 记下的）：按作者来源 → 行；保存时用它保护原始选择，不让「当前没应用」覆盖「原来选过」。 */
export type OffChoices = Record<string, Array<{ id: string; type: string; level: number; data: any }>>

export interface OffResult { applied: boolean; choices: OffChoices; problems: Array<{ off: OffRow; reason: string }> }

/** 检查取下记录：指向的条目 / 成长在不在、类型能不能取下、子项在不在。 */
function check(actor: any, rows: AdvRow[], off: OffRow[]): OffResult['problems'] {
  const problems: OffResult['problems'] = []
  for (const o of off) {
    if (![...actor.items].some((i: any) => flagsKey(i) === o.ref)) { problems.push({ off: o, reason: '人物身上没有这件作者条目' }); continue }
    if (o.advancement === undefined) continue
    const hit = rows.filter((r) => matches(r, o))
    if (!hit.length) { problems.push({ off: o, reason: '这件条目没有这一条成长' }); continue }
    const unknown = hit.find((r) => !OFF_TYPES[r.type])
    if (unknown) { problems.push({ off: o, reason: `「${unknown.type}」类成长还不能取下` }); continue }
    if (o.part !== undefined && !hit.some((r) => OFF_TYPES[r.type].parts(r.adv).includes(o.part!))) problems.push({ off: o, reason: '这条成长没有这个子项' })
  }
  return problems
}

/** 整件取下要隐藏的物品：条目本身 + 它的成长授予的物品（作者记录 value.added 里出现、且在人物身上的编号）。 */
function hiddenIds(actor: any, whole: Set<string>): string[] {
  const ids = new Set<string>()
  const walk = (v: any): void => { if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) { if (actor.items.has(k)) ids.add(k); walk(x) } }
  for (const item of actor.items) {
    if (!whole.has(flagsKey(item) ?? '')) continue
    ids.add(item.id)
    for (const adv of Object.values(item.advancement?.byId ?? {}) as any[]) walk(storable(adv.value)?.added)
  }
  return [...ids]
}

/** 按取下安排处理人物（只改内存里的作者文档，和作者 reverse / restore 同一种写法）；没有取下记录什么都不做。 */
export async function applyOff(actor: any, off: OffRow[] | undefined): Promise<OffResult> {
  if (!off?.length) return { applied: false, choices: {}, problems: [] }
  const rows = advancementRows(actor)
  const problems = check(actor, rows, off)
  if (problems.length) return { applied: false, choices: {}, problems }
  const whole = new Set(off.filter((o) => o.advancement === undefined).map((o) => o.ref))
  const offOf = (r: AdvRow): OffRow[] => off.filter((o) => (o.advancement === undefined ? o.ref === r.key : matches(r, o)))
  const touched = new Set(rows.filter((r) => OFF_TYPES[r.type] && offOf(r).length).map((r) => r.type))
  const target = rows.filter((r) => touched.has(r.type))
  const retained: Array<AdvRow & { data: any }> = []
  for (const row of [...target].reverse()) retained.unshift({ ...row, data: storable(await row.adv.reverse(row.level)) })
  const choices: OffChoices = {}
  for (const row of retained) {
    (choices[row.key] ??= []).push({ id: row.adv.id, type: row.type, level: row.level, data: row.data })
    const offs = offOf(row)
    if (offs.some((o) => o.part === undefined)) continue
    const rule = OFF_TYPES[row.type]
    const drop = new Set(offs.map((o) => o.part!))
    await row.adv.restore(row.level, drop.size ? rule.without(row.data, drop) : row.data)
    if (!rule.refresh) continue
    const auto = await row.adv.automaticApplicationValue(row.level, { initial: true })
    if (auto) await row.adv.apply(row.level, drop.size ? rule.without(auto, drop) : auto)
  }
  const hide = hiddenIds(actor, whole)
  // 隐藏只挡条目的使用 / 恢复；它自带的效果在同一轮准备里已经算进人物，所以用作者原生的「停用」一并关掉（视图里，装回从完整基准重来）
  for (const id of hide) for (const effect of actor.items.get(id)?.effects ?? []) effect.updateSource({ disabled: true })
  if (hide.length) {
    await actor.createEmbeddedDocuments('ActiveEffect', [{
      _id: OFF_CONTROLLER_ID, name: 'TRPG 已取下', type: 'base', transfer: false, flags: { trpg: { offController: true } },
      system: { changes: hide.map((id) => ({ key: 'items.hidden', type: 'add', value: id, priority: 0 })) },
    }], { keepId: true })
  }
  actor.reset()
  return { applied: true, choices, problems: [] }
}
