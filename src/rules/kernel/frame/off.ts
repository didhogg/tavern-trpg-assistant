// P6 自动项目「取下 / 装回」：在人物准备的汇合处（建好完整基准之后、叠游戏状态之前）按人物的取下安排处理。
// 三条路径都经过这里：重建（rebuildCharacter）、读档命中缓存与撤销 / 取消退回（createActorsFromBase）。
//
// 一律用作者（dnd5e）自己的取下 / 装回程序，不分类型另写规则：
//   成长  取下 = 作者 reverse（一条成长的某一级）；装回 = 作者 restore（用作者 reverse 交回的原数据）
//   单项  作者 reverse 的单项选项（熟练类按键 key、授予 / 选择物品按 uuid；作者没给单项程序的类型只能整条取下）
//   效果  作者的「停用」
//   重叠  同一类成长有好几个来源时（精灵、水手都给察觉），作者建卡时会去重；所以恢复后让作者重新判断
//         固定授予（automaticApplicationValue → apply），被去重的另一来源回来；单项取下时还有别的生效来源给同一项就不取
// 授予 / 选择物品也一样：作者 reverse 交回物品原数据，restore 按原编号放回。
/* eslint-disable @typescript-eslint/no-explicit-any -- 官方文档对象没有类型声明。 */

const g = globalThis as any

/**
 * 一条取下记录：作者来源（Plutonium 标记 prop|source|hash）+ 可选的成长编号 / 等级 / 单项键，或这件条目上的效果编号。
 * 只写来源 = 整件取下（这件条目的成长、效果都取下，条目本身由作者的「隐藏」挡住使用）。
 */
export interface OffRow { ref: string; advancement?: string; level?: number; part?: string; effect?: string }

/** 整件取下时挡住条目使用的作者「隐藏」：控制效果用固定编号，读档、撤销重算时是同一个，不会多出一份。 */
export const OFF_CONTROLLER_ID = 'trpgOffHidden000'

export const flagsKey = (item: any): string | null => {
  const f = item?.flags?.plutonium
  return f?.propDroppable && f.source && f.hash ? `${f.propDroppable}|${f.source}|${f.hash}` : null
}
const typeOf = (adv: any): string => adv.constructor?.typeName ?? adv.type
const plain = (data: any): any => JSON.parse(JSON.stringify(data ?? null, (_k, v) => (v instanceof Set ? [...v] : v)))

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

const matches = (row: AdvRow, off: OffRow): boolean => off.ref === row.key && off.advancement === row.adv.id && (off.level === undefined || off.level === row.level)
/**
 * 作者记录的单项（作者 reverse 的单项选项认的那个身份）：
 *   熟练类 = 记下的键 + 配置里的固定授予（去重后记录里可能没有，配置里有）；
 *   授予 / 选择物品 = 作者存放授予记录的地方（advancement.storagePath）里的物品来源编号。
 * 作者没有这两种记录的成长 = 没有单项程序，只能整条取下（null）。
 */
const keysOf = (adv: any, level: number): string[] | null => {
  const value = plain(adv.value), config = plain(adv.configuration)
  if (Array.isArray(value?.chosen)) return [...new Set([...value.chosen, ...(Array.isArray(config?.grants) ? config.grants : [])].map(String))]
  const path = typeof adv.storagePath === 'function' ? adv.storagePath(level) : null
  const added = path ? plain(g.foundry.utils.getProperty(adv, path)) : null
  return added && typeof added === 'object' ? Object.values(added).filter((v): v is string => typeof v === 'string') : null
}
/** 交给作者 reverse 的单项选项：熟练类认 key，授予 / 选择物品认 uuid（各认各的，另一个不看）。 */
const partOption = (part: string): Record<string, string> => ({ key: part, uuid: part })

/** 原始选择（取下前作者 reverse 交回的）：按作者来源 → 行；保存时用它保护原始选择，不让「当前没应用」覆盖「原来选过」。 */
export type OffChoices = Record<string, Array<{ id: string; type: string; level: number; data: any }>>

export interface OffResult { applied: boolean; choices: OffChoices; problems: Array<{ off: OffRow; reason: string }> }

/** 检查取下记录：指向的条目 / 成长 / 效果在不在、是不是物品类成长、单项作者有没有按键取下的程序。 */
function check(actor: any, rows: AdvRow[], off: OffRow[]): OffResult['problems'] {
  const problems: OffResult['problems'] = []
  for (const o of off) {
    const item = [...actor.items].find((i: any) => flagsKey(i) === o.ref)
    if (!item) { problems.push({ off: o, reason: '人物身上没有这件作者条目' }); continue }
    if (o.effect !== undefined) { if (!item.effects.has(o.effect)) problems.push({ off: o, reason: '这件条目上没有这个效果' }); continue }
    if (o.advancement === undefined) continue
    const hit = rows.filter((r) => matches(r, o))
    if (!hit.length) { problems.push({ off: o, reason: '这件条目没有这一条成长' }); continue }
    if (o.part !== undefined && !hit.some((r) => keysOf(r.adv, r.level)?.includes(o.part!))) {
      problems.push({ off: o, reason: hit.every((r) => keysOf(r.adv, r.level) === null) ? '作者这类成长没有按单项取下的程序，只能整条取下' : '这条成长没有这一项' })
    }
  }
  return problems
}

/** 按取下安排处理人物（只改内存里的作者文档，全用作者自己的程序）；没有取下记录什么都不做。 */
export async function applyOff(actor: any, off: OffRow[] | undefined): Promise<OffResult> {
  if (!off?.length) return { applied: false, choices: {}, problems: [] }
  const rows = advancementRows(actor)
  const problems = check(actor, rows, off)
  if (problems.length) return { applied: false, choices: {}, problems }
  const whole = new Set(off.filter((o) => o.advancement === undefined && o.effect === undefined).map((o) => o.ref))
  const offOf = (r: AdvRow): OffRow[] => (whole.has(r.key) ? [{ ref: r.key }] : off.filter((o) => matches(r, o)))
  // 碰到的成长类别：同一类的所有来源一起交作者退回、恢复、重判（重叠只会发生在同一类成长之间）
  const touched = new Set(rows.filter((r) => offOf(r).length).map((r) => r.adv.constructor))
  const target = rows.filter((r) => touched.has(r.adv.constructor))
  const retained: Array<AdvRow & { data: any }> = []
  for (const row of [...target].reverse()) retained.unshift({ ...row, data: plain(await row.adv.reverse(row.level)) })
  const choices: OffChoices = {}
  for (const row of retained) {
    (choices[row.key] ??= []).push({ id: row.adv.id, type: row.type, level: row.level, data: row.data })
    if (!offOf(row).some((o) => o.part === undefined)) await row.adv.restore(row.level, row.data)
  }
  // 作者重判：没整条取下的成长都交作者重新判断固定授予（被去重的另一来源回来）
  const active = retained.filter((row) => !offOf(row).some((o) => o.part === undefined))
  for (const row of active) {
    const auto = await row.adv.automaticApplicationValue(row.level, { initial: true })
    if (auto) await row.adv.apply(row.level, auto)
  }
  // 单项取下：还有别的生效来源给同一项就不取（读作者自己的记录判断谁给了这一项），否则交作者的单项取下程序
  const offParts = (row: AdvRow): Set<string> => new Set(offOf(row).flatMap((o) => (o.part === undefined ? [] : [o.part])))
  for (const row of active) for (const part of offParts(row)) {
    const elsewhere = active.some((other) => other !== row && !offParts(other).has(part) && (keysOf(other.adv, other.level) ?? []).includes(part))
    if (!elsewhere) await row.adv.reverse(row.level, partOption(part))
  }
  // 效果：作者的「停用」；整件取下 = 这件条目的效果全部停用 + 作者「隐藏」挡住条目使用
  for (const o of off) if (o.effect !== undefined) [...actor.items].find((i: any) => flagsKey(i) === o.ref)?.effects.get(o.effect)?.updateSource({ disabled: true })
  const hidden = [...actor.items].filter((i: any) => whole.has(flagsKey(i) ?? ''))
  for (const item of hidden) for (const effect of item.effects) effect.updateSource({ disabled: true })
  if (hidden.length) {
    await actor.createEmbeddedDocuments('ActiveEffect', [{
      _id: OFF_CONTROLLER_ID, name: 'TRPG 已取下', type: 'base', transfer: false, flags: { trpg: { offController: true } },
      system: { changes: hidden.map((i: any) => ({ key: 'items.hidden', type: 'add', value: i.id, priority: 0 })) },
    }], { keepId: true })
  }
  actor.reset()
  return { applied: true, choices, problems: [] }
}
