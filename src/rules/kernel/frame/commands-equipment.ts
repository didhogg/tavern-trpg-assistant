// 起始装备（建卡装备步骤）：读职业 / 背景的起始装备数据，列出每组选项和每个「类别」的候选物品；
// 按玩家的选择展开成要加进人物的物品（带数量）和钱。逻辑照 Plutonium（EquipmentCompPredefined、EquipmentCurrencyManager）：
//   item / 字符串 → 这件物品；equipmentType → 玩家在候选里选；special → 一件「杂项」假物品（名字 = 文字，类型 OTH，稀有度 unknown）；
//   containsValue / value（铜币）→ 加到人物的钱；不要装备时 = 起始金币（goldAlternative 的骰式或玩家填的数）。
// 物品加载、类型拆解、「普通物品」判断、骰式、币值换算都调作者 / Plutonium 在小窗里的函数；类别 → 物品筛选见 equipment-rules.ts。
/* eslint-disable @typescript-eslint/no-explicit-any -- 作者条目和 Plutonium 文档没有类型声明。 */
import type { Operate } from './commands-items'
import { importEntry } from './importer'
import { EQUIPMENT_EXPANDERS, EQUIPMENT_PREDICATES } from '../equipment-rules'

const g = globalThis as any

export interface EquipCandidate { uid: string; name: string; source: string; hash: string }
export interface EquipEntryView {
  /** 作者数据里的原样条目。 */
  raw: unknown
  kind: 'item' | 'category' | 'special' | 'value'
  quantity: number
  uid?: string; name?: string; source?: string; hash?: string; found?: boolean
  displayName?: string
  /** 铜币：袋子里的钱（containsValue）或单独的 value 条目。 */
  cp?: number
  text?: string
  types?: string[]
  candidates?: EquipCandidate[]
}
export interface EquipSection {
  refKey: string; prop: string; name: string; source: string
  groups: Array<{ index: number; choices: Array<{ key: string; entries: EquipEntryView[] }> }>
  /** 起始金币的骰式（作者 goldAlternative）；没有 = 这个条目不给金币选项。 */
  goldExpression: string | null
}
/** 玩家在一个条目（职业 / 背景）上的选择。choice：组序号 → 选了哪一项（只有一项的组自动取）；pick：类别槽 → 选的物品 uid；gold：要钱不要装备（金币数）。 */
export interface StartingSelection { choice?: Record<string, string>; pick?: Record<string, string>; gold?: number | null }
export interface StartingRow { prop: string; refKey: string; entry: any }

const abv = (item: any): string | null => item.type ? g.DataUtil.itemType.unpackUid(item.type).abbreviation : null
const test = (name: string, item: any): boolean => {
  const p = EQUIPMENT_PREDICATES[name]
  if (!p) throw Error(`没登记的装备判断：${name}`)
  return 'abv' in p ? p.abv.some((k) => abv(item) === g.Parser[`ITM_TYP_ABV__${k}`]) : item[p.field[0]] === p.field[1]
}
/** Plutonium UtilEntityItem.isStartingEquipmentItem：普通物品、不是通用变体、有价格、不是基础物品的派生。 */
const isStartingItem = (item: any): boolean => g.Renderer.item.isMundane(item) && !item.genericVariant && item.value != null && item.baseItem == null
const uidOf = (item: any): string => g.DataUtil.proxy.getUid('item', item)
const hashOfUid = (uid: string): string => { const [name, source] = uid.split('|'); return g.UrlUtil.URL_TO_HASH_BUILDER[g.UrlUtil.PG_ITEMS]({ name, source }) }
const candidate = (item: any): EquipCandidate => ({ uid: uidOf(item), name: item.name, source: item.source, hash: g.UrlUtil.URL_TO_HASH_BUILDER[g.UrlUtil.PG_ITEMS](item) })
const titleCase = (text: string): string => g.Renderer.stripTags(text).toTitleCase()

let cache: any[] | null = null
const allItems = async (): Promise<any[]> => (cache ??= await g.DataLoader.pCacheAndGetAllSite('item'))

/** 某个类别码的候选物品（按名字排序）。 */
export async function candidatesFor(type: string): Promise<EquipCandidate[]> {
  const rule = EQUIPMENT_EXPANDERS[type]
  if (!rule) return []
  return (await allItems()).filter(isStartingItem).filter((i) => rule.every((n) => test(n, i)))
    .sort((a, b) => String(a.name).localeCompare(String(b.name))).map(candidate)
}

/** 条目里的起始装备分组：职业 = startingEquipment.defaultData；背景 = startingEquipment 本身（分组数组）。 */
const groupsOf = (entry: any): any[] => { const se = entry?.startingEquipment; return Array.isArray(se) ? se : Array.isArray(se?.defaultData) ? se.defaultData : [] }

/** 作者 goldAlternative → 可掷的骰式（照 Plutonium _getRollableExpressionGold）；写成纯数字的原样交回。 */
export function goldExpressionOf(entry: any): string | null {
  const alt = entry?.startingEquipment?.goldAlternative
  if (!alt) return null
  const m = /{@dice ([^|]+)/.exec(alt)
  if (m) return m[1].replace(/×/g, '*')
  return !Number.isNaN(Number(`${alt}`.trim())) ? `${alt}`.trim() : null
}

async function viewOf(equi: any): Promise<EquipEntryView | null> {
  const loaded = async (uid: string) => { const [name, source] = uid.split('|'); const i = await g.DataLoader.pCacheAndGetHash(g.UrlUtil.PG_ITEMS, hashOfUid(uid)); return { uid, name: i?.name ?? name, source: i?.source ?? source, hash: hashOfUid(uid), found: !!i } }
  if (typeof equi === 'string') return { raw: equi, kind: 'item', quantity: 1, ...(await loaded(equi)) }
  if (equi.item) return { raw: equi, kind: 'item', quantity: equi.quantity || 1, ...(await loaded(equi.item)), ...(equi.displayName ? { displayName: titleCase(equi.displayName) } : {}), ...(equi.containsValue ? { cp: equi.containsValue } : {}) }
  const types: string[] = equi.equipmentTypes ?? (equi.equipmentType ? [equi.equipmentType] : [])
  if (types.length) {
    const seen = new Set<string>()
    const candidates = (await Promise.all(types.map(candidatesFor))).flat().filter((c) => !seen.has(c.uid) && !!seen.add(c.uid))
    return candidates.length ? { raw: equi, kind: 'category', quantity: equi.quantity || 1, types, candidates } : null
  }
  if (equi.special) return { raw: equi, kind: 'special', quantity: equi.quantity || 1, text: titleCase(equi.special), ...(equi.containsValue ? { cp: equi.containsValue } : {}) }
  if (equi.value) return { raw: equi, kind: 'value', quantity: 1, cp: equi.value }
  return null
}

/** 一个条目的起始装备选项；原组序号保留（展开时按同一序号取，不会错位）。 */
export async function sectionOf(row: StartingRow): Promise<EquipSection> {
  const groups: EquipSection['groups'] = []
  const data = groupsOf(row.entry)
  for (let index = 0; index < data.length; index++) {
    const choices = []
    for (const [key, list] of Object.entries<any[]>(data[index])) {
      const entries = (await Promise.all(list.map(viewOf))).filter((e): e is EquipEntryView => !!e)
      if (entries.length) choices.push({ key, entries })
    }
    if (choices.length) groups.push({ index, choices })
  }
  return { refKey: row.refKey, prop: row.prop, name: row.entry.name, source: row.entry.source, groups, goldExpression: goldExpressionOf(row.entry) }
}

export interface Granted { uid?: string; special?: string; page?: number; source?: string; quantity: number; displayName?: string }

/** 按选择展开：要钱 → 只给钱；否则逐组取选中的一项，类别槽取玩家选的物品，同一件合并数量，铜币合计。没选的组不给（留空）。 */
export function expand(row: StartingRow, sel: StartingSelection | undefined): { granted: Granted[]; cp: number } {
  const out: Granted[] = []
  let cp = 0
  if (sel?.gold != null) return { granted: out, cp: Math.round(sel.gold * 100) }
  const add = (uid: string | undefined, special: string | undefined, quantity: number, displayName?: string) => {
    const same = out.find((o) => o.uid === uid && o.special === special && o.displayName === displayName)
    if (same) same.quantity += quantity; else out.push({ ...(uid ? { uid } : {}), ...(special ? { special, source: row.entry.source, page: row.entry.page } : {}), quantity, ...(displayName ? { displayName } : {}) })
  }
  groupsOf(row.entry).forEach((group, gi) => {
    const keys = Object.keys(group)
    const key = sel?.choice?.[String(gi)] ?? (keys.length === 1 ? keys[0] : undefined)
    if (key === undefined || !Array.isArray(group[key])) return
    group[key].forEach((equi: any, ei: number) => {
      if (typeof equi === 'string') return add(equi, undefined, 1)
      if (equi.item) { if (equi.containsValue) cp += equi.containsValue; return add(equi.item, undefined, equi.quantity || 1, equi.displayName ? titleCase(equi.displayName) : undefined) }
      if (equi.equipmentType || equi.equipmentTypes) {
        for (let i = 0; i < (equi.quantity || 1); i++) { const uid = sel?.pick?.[`${gi}.${key}.${ei}.${i}`]; if (uid) add(uid, undefined, 1) }
        return
      }
      if (equi.special) { if (equi.containsValue) cp += equi.containsValue; return add(undefined, titleCase(equi.special), equi.quantity || 1) }
      if (equi.value) cp += equi.value
    })
  })
  return { granted: out, cp }
}

/** 铜币 → 各币种（官方币种表 + 作者的换算函数，照 Plutonium EquipmentCurrencyManager）。 */
export function coinsOf(cp: number): Record<string, number> {
  const currencies = g.CONFIG.DND5E.currencies
  const per = currencies.cp?.conversion ?? 100
  const table = Object.entries<any>(currencies).filter(([, m]) => m.conversion != null && m.conversion > 0)
    .map(([coin, m]) => ({ coin, mult: m.conversion / per })).sort((a, b) => b.mult - a.mult)
  const coins = g.CurrencyUtil.doSimplifyCoins({ cp }, { currencyConversionTable: table })
  return Object.fromEntries(Object.keys(currencies).map((k) => [k, coins[k] || 0]))
}

/** 选择 → 要加进人物的物品数据（带数量、改名）、杂项假物品和钱；找不到的物品跳过并记在 skipped。 */
export async function resolveStarting(rows: StartingRow[], selection: Record<string, StartingSelection>): Promise<{ equipment: any[]; specials: any[]; currency: Record<string, number> | null; skipped: string[] }> {
  const equipment: any[] = []
  const specials: any[] = []
  const skipped: string[] = []
  let cp = 0
  for (const row of rows) {
    const { granted, cp: rowCp } = expand(row, selection[row.refKey])
    cp += rowCp
    for (const it of granted) {
      let entry: any
      if (it.special) entry = { name: it.special, source: it.source, page: it.page, type: g.Parser.ITM_TYP__OTHER, rarity: 'unknown' }
      else { entry = await g.DataLoader.pCacheAndGetHash(g.UrlUtil.PG_ITEMS, hashOfUid(it.uid!)); if (!entry) { skipped.push(it.uid!); continue } }
      const data = await importEntry('item', entry)
      data.system = { ...data.system, quantity: it.quantity }
      if (it.displayName) data.name = it.displayName
      // 「特殊」物品（香、法衣…）库里没有这一条：去掉作者编号，当作人物自己的物品，存档里记成「加的物品」
      if (it.special) { delete data.flags?.plutonium; specials.push(data) } else equipment.push({ data })
    }
  }
  return { equipment, specials, currency: cp > 0 ? coinsOf(cp) : null, skipped }
}

export function createEquipmentCommands(operate: Operate) {
  return {
    /** 职业 / 背景的起始装备选项（每组选项、类别候选、金币骰式）；只读，不改世界。 */
    startingEquipment: (rows: StartingRow[]) => operate([], async () => ({ sections: await Promise.all(rows.map(sectionOf)) })),
  }
}
