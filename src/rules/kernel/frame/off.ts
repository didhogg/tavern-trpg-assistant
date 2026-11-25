// P6 自动项目「取下 / 装回」：在人物准备的汇合处（建好完整基准之后、叠游戏状态之前）按人物的取下安排处理。
// 三条路径都经过这里：重建（rebuildCharacter）、读档命中缓存与撤销 / 取消退回（createActorsFromBase）。
//
// 一条原则，一个入口：取下 = 在作者（dnd5e）计算时读的来源数据里不给那一项，数值仍由作者程序算；装回 = 给回完整原数据。
//   成长          作者 reverse 退回 → 作者 restore 按记录恢复；单项 = 作者声明的记录模型（metadata.dataModels.value）
//                 集合字段里的一项：退回交回的就是这份记录时，用去掉这一项的记录恢复；不是（例如授予物品交回物品）时，
//                 交作者 reverse 的单项选项（key / uuid）
//   条目自身数据  种族的速度、感官、类型等由作者从条目读（prepareRace）：单项 = 条目模型里的字段路径，视图里不给
//   效果          作者的「停用」
//   整件          这件条目的成长都不给 + 作者指向它的字段（按作者声明的「指向物品」字段找）不指它 + 效果停用 + 作者隐藏
//   重叠来源      作者建卡会去重（精灵、水手都给察觉，水手的记录里没有察觉）：作者自动判断只用来补记录里缺的项，已记的项不改
/* eslint-disable @typescript-eslint/no-explicit-any -- 官方文档对象没有类型声明。 */

const g = globalThis as any

/**
 * 一条取下记录：作者来源（Plutonium 标记 prop|source|hash）
 *   + 成长编号 / 等级（可选 part = 记录里的一项），或 part = 条目自身数据的字段路径（system.…），或效果编号。
 * 只写来源 = 整件取下。
 */
export interface OffRow { ref: string; advancement?: string; level?: number; part?: string; effect?: string; label?: string }

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

// —— 作者声明的模型里的「一项项」：集合字段（数组 / 集合的元素，映射的键与字符串值）——
const F = (): any => g.foundry.data.fields
const isList = (field: any): boolean => field instanceof F().ArrayField
const isMap = (field: any): boolean => field instanceof F().TypedObjectField
/** 记录里按作者模型列出的项：[字段名, 项]。没声明模型返回 null。 */
function entries(model: any, data: any): Array<[string, string]> | null {
  const fields = model?.schema?.fields
  if (!fields || !data || typeof data !== 'object') return null
  const out: Array<[string, string]> = []
  for (const [name, field] of Object.entries(fields) as Array<[string, any]>) {
    const v = data[name]
    if (isList(field) && Array.isArray(v)) { for (const x of v) if (typeof x === 'string') out.push([name, x]) }
    else if (isMap(field) && v && typeof v === 'object') for (const [k, x] of Object.entries(v)) { out.push([name, k]); if (typeof x === 'string') out.push([name, x]) }
  }
  return out
}
/** 去掉这些项后的记录（同一个模型认法）。 */
function without(model: any, data: any, drop: Set<string>): any {
  const out = { ...data }
  for (const [name, field] of Object.entries(model.schema.fields) as Array<[string, any]>) {
    const v = data?.[name]
    if (isList(field) && Array.isArray(v)) out[name] = v.filter((x: unknown) => !(typeof x === 'string' && drop.has(x)))
    else if (isMap(field) && v && typeof v === 'object') out[name] = Object.fromEntries(Object.entries(v).filter(([k, x]) => !drop.has(k) && !(typeof x === 'string' && drop.has(x))))
  }
  return out
}
const models = (adv: any): { value: any; configuration: any } => ({ value: adv.constructor?.metadata?.dataModels?.value, configuration: adv.constructor?.metadata?.dataModels?.configuration })
/** 退回交回的数据就是作者声明的记录（键都在记录模型里）：单项用去掉它的记录恢复。 */
const isRecord = (adv: any, data: any): boolean => { const m = models(adv).value; return !!m?.schema?.fields && !!data && typeof data === 'object' && Object.keys(data).every((k) => k in m.schema.fields) }
/** 这条成长能取下的单项：作者记录 + 作者配置里出现的项（去重后记录里可能没有，配置里有）；授予物品的作者存放处（storagePath）。 */
function partsOf(adv: any, level: number): string[] {
  const m = models(adv)
  const own = [...(entries(m.value, plain(adv.value)) ?? []), ...(entries(m.configuration, plain(adv.configuration)) ?? [])].map(([, x]) => x)
  const path = typeof adv.storagePath === 'function' ? adv.storagePath(level) : null
  const added = path ? plain(g.foundry.utils.getProperty(adv, path)) : null
  const stored = added && typeof added === 'object' ? Object.values(added).filter((v): v is string => typeof v === 'string') : []
  return [...new Set([...own, ...stored])]
}
/**
 * 这一级这条成长现在给了人物什么（逐级细节用；取下的单项写法和上面同一个认法）：
 *   items = 作者存放授予物品的地方（storagePath）：人物物品编号 → 存放的条目编号（取下单项交的是后者：官方 reverse 按 uuid 认）；
 *   keys = 作者记录模型里列表字段的项（特质、熟练这类键）；amounts = 记录里「键 → 数」的映射（属性提升的分配：力量 +2）。
 */
export function appliedParts(adv: any, level: number): { items: Array<{ id: string; part: string }>; keys: string[]; amounts: Array<{ key: string; value: number }> } {
  const path = typeof adv.storagePath === 'function' ? adv.storagePath(level) : null
  const stored = path ? plain(g.foundry.utils.getProperty(adv, path)) : null
  const model = models(adv).value
  const keys = (entries(model, plain(adv.value)) ?? []).filter(([name]) => isList(model.schema.fields[name])).map(([, x]) => x)
  const items = stored && typeof stored === 'object' ? Object.entries(stored).filter((e): e is [string, string] => typeof e[1] === 'string').map(([id, part]) => ({ id, part })) : []
  const amounts: Array<{ key: string; value: number }> = []
  for (const [name, field] of Object.entries(model?.schema?.fields ?? {}) as Array<[string, any]>) {
    const v = plain(adv.value)?.[name]
    if (isMap(field) && v && typeof v === 'object') for (const [key, x] of Object.entries(v)) if (typeof x === 'number' && x) amounts.push({ key, value: x })
  }
  return { items, keys: [...new Set(keys)], amounts }
}

/** 作者声明的「指向人物身上物品」字段里，指着这件物品的路径（种族、背景…按声明找，不写死）。 */
function pointersTo(actor: any, itemId: string): string[] {
  const out: string[] = []
  const walk = (fields: any, path: string): void => {
    for (const [name, field] of Object.entries(fields ?? {}) as Array<[string, any]>) {
      const p = path ? `${path}.${name}` : name
      if (field instanceof F().DocumentIdField && field.model?.documentName === 'Item' && g.foundry.utils.getProperty(actor._source.system, p) === itemId) out.push(`system.${p}`)
      else if (field.fields) walk(field.fields, p)
    }
  }
  walk(actor.system.schema?.fields, '')
  return out
}

/** 原始选择（取下前作者 reverse 交回的）：按作者来源 → 行；保存时用它保护原始选择，不让「当前没应用」覆盖「原来选过」。 */
export type OffChoices = Record<string, Array<{ id: string; type: string; level: number; data: any }>>
export interface OffResult { applied: boolean; choices: OffChoices; problems: Array<{ off: OffRow; reason: string }> }

const matches = (row: AdvRow, off: OffRow): boolean => off.ref === row.key && off.advancement === row.adv.id && (off.level === undefined || off.level === row.level)
const isItemField = (o: OffRow): boolean => o.advancement === undefined && o.effect === undefined && o.part !== undefined
const isWhole = (o: OffRow): boolean => o.advancement === undefined && o.effect === undefined && o.part === undefined

/** 检查取下记录：指向的条目 / 成长 / 项 / 字段 / 效果都在作者数据里。 */
function check(actor: any, rows: AdvRow[], off: OffRow[]): OffResult['problems'] {
  const problems: OffResult['problems'] = []
  for (const o of off) {
    const item = [...actor.items].find((i: any) => flagsKey(i) === o.ref)
    if (!item) { problems.push({ off: o, reason: '人物身上没有这件作者条目' }); continue }
    if (o.effect !== undefined) { if (!item.effects.has(o.effect)) problems.push({ off: o, reason: '这件条目上没有这个效果' }); continue }
    if (isItemField(o)) { if (!o.part!.startsWith('system.') || !item.system.schema?.getField?.(o.part!.slice(7))) problems.push({ off: o, reason: '这件条目的数据里没有这一项' }); continue }
    if (o.advancement === undefined) continue
    const hit = rows.filter((r) => matches(r, o))
    if (!hit.length) { problems.push({ off: o, reason: '这件条目没有这一条成长' }); continue }
    if (o.part !== undefined && !hit.some((r) => partsOf(r.adv, r.level).includes(o.part!))) problems.push({ off: o, reason: '这条成长的记录里没有这一项' })
  }
  return problems
}

/** 按取下安排处理人物（只改内存里的作者文档，数值全由作者程序算）；没有取下记录什么都不做。 */
export async function applyOff(actor: any, off: OffRow[] | undefined): Promise<OffResult> {
  if (!off?.length) return { applied: false, choices: {}, problems: [] }
  const rows = advancementRows(actor)
  const problems = check(actor, rows, off)
  if (problems.length) return { applied: false, choices: {}, problems }
  const whole = new Set(off.filter(isWhole).map((o) => o.ref))
  const offOf = (r: AdvRow): OffRow[] => (whole.has(r.key) ? [{ ref: r.key }] : off.filter((o) => matches(r, o)))
  const dropOf = (r: AdvRow): Set<string> => new Set(offOf(r).flatMap((o) => (o.part === undefined ? [] : [o.part])))
  const skipped = (r: AdvRow): boolean => offOf(r).some((o) => o.part === undefined)

  // 成长：碰到的成长类别，同一类的所有来源一起交作者退回再恢复（重叠只会发生在同一类之间）
  const touched = new Set(rows.filter((r) => offOf(r).length).map((r) => r.adv.constructor))
  const target = rows.filter((r) => touched.has(r.adv.constructor))
  const retained: Array<AdvRow & { data: any }> = []
  for (const row of [...target].reverse()) retained.unshift({ ...row, data: plain(await row.adv.reverse(row.level)) })
  const choices: OffChoices = {}
  for (const row of retained) {
    (choices[row.key] ??= []).push({ id: row.adv.id, type: row.type, level: row.level, data: row.data })
    if (skipped(row)) continue
    const drop = dropOf(row)
    const byRecord = drop.size > 0 && isRecord(row.adv, row.data)
    await row.adv.restore(row.level, byRecord ? without(models(row.adv).value, row.data, drop) : row.data)
    if (!byRecord) for (const part of drop) await row.adv.reverse(row.level, { key: part, uuid: part })
  }
  // 重叠来源：作者自动判断只补记录里缺的项（不改已记的项，不补这一条自己取下的项）
  for (const row of retained) {
    if (skipped(row)) continue
    const model = models(row.adv).value
    const auto = await row.adv.automaticApplicationValue(row.level, { initial: true })
    if (!model?.schema?.fields || !auto || typeof auto !== 'object') continue
    const have = new Set((entries(model, plain(row.adv.value)) ?? []).map(([, x]) => x))
    const drop = dropOf(row)
    const missing = (entries(model, plain(auto)) ?? []).filter(([, x]) => !have.has(x) && !drop.has(x))
    if (!missing.length) continue
    const add: Record<string, string[]> = {}
    for (const [name, x] of missing) (add[name] ??= []).push(x)
    await row.adv.apply(row.level, add)
  }

  // 条目自身数据（作者从条目读的速度、感官、类型…）：视图里这一项不给
  for (const o of off.filter(isItemField)) [...actor.items].find((i: any) => flagsKey(i) === o.ref)?.updateSource({ [o.part!]: null })
  // 效果：作者的「停用」
  for (const o of off) if (o.effect !== undefined) [...actor.items].find((i: any) => flagsKey(i) === o.ref)?.effects.get(o.effect)?.updateSource({ disabled: true })
  // 整件：作者指向它的字段不指它 + 效果停用 + 作者隐藏
  const hidden = [...actor.items].filter((i: any) => whole.has(flagsKey(i) ?? ''))
  for (const item of hidden) {
    for (const path of pointersTo(actor, item.id)) actor.updateSource({ [path]: null })
    for (const effect of item.effects) effect.updateSource({ disabled: true })
  }
  if (hidden.length) {
    await actor.createEmbeddedDocuments('ActiveEffect', [{
      _id: OFF_CONTROLLER_ID, name: 'TRPG 已取下', type: 'base', transfer: false, flags: { trpg: { offController: true } },
      system: { changes: hidden.map((i: any) => ({ key: 'items.hidden', type: 'add', value: i.id, priority: 0 })) },
    }], { keepId: true })
  }
  actor.reset()
  return { applied: true, choices, problems: [] }
}
