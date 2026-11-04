import type { Entry, StoredEntry } from '../../../schemas/pack'
import type { Person } from '../../../schemas/people'
import { useAppStore } from '../../../stores/app'
import { useLibraryStore } from '../../../stores/library'
import { backgroundDataSchema, classDataSchema, raceDataSchema, type BackgroundData, type ClassData, type RaceData } from '../../../rules/dnd5e2014/data/entries/character'
import { CONDITION_LABELS, type ConditionKey } from '../../../rules/dnd5e2014/data/enums'
import type { Effect } from '../../../rules/dnd5e2014/data/effects'
import type { DeriveContext } from '../../../rules/dnd5e2014/derive'
import { senseDefsFrom, setSenseDefs } from './senseDefs'

export interface CardEntry {
  packId: string
  entry: Entry
  badge: string
}

export interface CardOption {
  value: string
  label: string
  en?: string
  badge?: string
}

export interface CardData {
  entries: Map<string, CardEntry>
  classes: Map<string, ClassData>
  classLabels: Record<string, string>
  races: CardEntry[]
  subraces: CardEntry[]
  backgrounds: CardEntry[]
  conditions: Array<{ key: ConditionKey; name: string; ref?: string }>
  spells: CardEntry[]
  raceOf: (id?: string) => RaceData | undefined
  backgroundOf: (id?: string) => BackgroundData | undefined
  classOf: (id?: string) => ClassData | undefined
  nameOf: (id?: string) => string
  raceOptions: CardOption[]
  subraceOptions: (raceId?: string) => CardOption[]
  backgroundOptions: CardOption[]
  spellDuration: (entry?: Entry) => string
  /** 力竭 1–6 级的结构化效果（读条件条目；骰盘用）。 */
  exhaustionLevels: Array<{ level: number; effects: Effect[] }>
  effectSummary: (ref?: string) => string
  /** 力竭每一级的说明文字：读条件条目正文里引用的力竭表（`tableRef`）；没有安装就是空数组。 */
  exhaustionText: Array<{ level: number; text: string }>
  /** 按类型取已启用包里的条目（语言、规则、物品……不在上面预载的类型里的）；同一类型只查一次。 */
  entriesOfType: (type: string) => Promise<CardEntry[]>
}

/** 条目正文（块数组）里第一个 `tableRef` 的表编号。 */
export function tableRefOf(text: unknown): string | undefined {
  if (Array.isArray(text)) { for (const item of text) { const hit = tableRefOf(item); if (hit) return hit } return undefined }
  if (!text || typeof text !== 'object') return undefined
  const rec = text as Record<string, unknown>
  const ref = rec.tableRef
  if (ref && typeof ref === 'object' && typeof (ref as { id?: unknown }).id === 'string') return (ref as { id: string }).id
  for (const value of Object.values(rec)) { const hit = tableRefOf(value); if (hit) return hit }
  return undefined
}

/** 力竭表（两列：等级、效应）→ 逐级文字。读不出来的行跳过。 */
export function exhaustionRows(rows: unknown): Array<{ level: number; text: string }> {
  if (!Array.isArray(rows)) return []
  return rows.flatMap((row) => {
    const cells = (row as { cells?: unknown })?.cells
    if (!Array.isArray(cells) || cells.length < 2) return []
    const level = Number(String(cells[0]).trim())
    const text = String(cells[1]).trim()
    return Number.isInteger(level) && level >= 1 && text ? [{ level, text }] : []
  })
}

const TYPES = ['class', 'subclass', 'race', 'subrace', 'background', 'condition', 'spell', 'rule', 'language'] as const

export function entryView(row: StoredEntry, packs: Map<string, string>): CardEntry {
  const { packId, entryId, ruleId: _ruleId, type, name, nameEn, keywords, unique, summary, data, image, override: _override, i18n } = row
  return { packId, badge: packs.get(packId) ?? '', entry: { id: entryId, type, name, nameEn, keywords, unique, summary, data, image, i18n } }
}

function optionOf(row: CardEntry): CardOption {
  return { value: row.entry.id, label: row.entry.name, en: row.entry.nameEn, badge: row.badge }
}

function durationText(entry?: Entry): string {
  const raw = entry?.data.duration
  if (!Array.isArray(raw)) return ''
  const parts = raw.flatMap((item) => {
    if (!item || typeof item !== 'object') return []
    const value = item as { type?: unknown; amount?: unknown; unit?: unknown; concentration?: unknown }
    const unit = value.unit === 'minute' ? '分钟' : value.unit === 'hour' ? '小时' : value.unit === 'round' ? '轮' : ''
    let text = value.type === 'instant' ? '立即' : value.type === 'permanent' ? '永久' : value.type === 'special' ? '特殊' : `${String(value.amount ?? '')}${unit}`.trim()
    if (value.concentration) text += ' · 专注'
    return text ? [text] : []
  })
  return parts.join('、')
}

/** 载入人物卡需要的已启用条目；只读，不改库。 */
export async function loadCardData(_person: Person, enabledPackIds: string[], ruleId: string): Promise<CardData> {
  const db = useAppStore().svc().db
  const packs = new Map((await db.packs.toArray()).map((pack) => [pack.id, pack.name]))
  const enabled = new Set(enabledPackIds)
  const rows = (await db.entries.where('[ruleId+type]').anyOf(TYPES.map((type) => [ruleId, type])).toArray()) as StoredEntry[]
  const allowed = rows.filter((row) => !enabled.size || enabled.has(row.packId))
  const all = allowed.map((row) => entryView(row, packs))
  const entries = new Map(all.map((row) => [row.entry.id, row]))
  const classes = new Map<string, ClassData>()
  const classLabels: Record<string, string> = {}
  for (const row of all) {
    if (row.entry.type === 'class' || row.entry.type === 'subclass') classLabels[row.entry.id] = row.entry.name
    if (row.entry.type !== 'class') continue
    const parsed = classDataSchema.safeParse(row.entry.data)
    if (parsed.success) classes.set(row.entry.id, parsed.data as ClassData)
  }
  setSenseDefs(senseDefsFrom(all.filter((row) => row.entry.type === 'rule').map((row) => row.entry)))
  const races = all.filter((row) => row.entry.type === 'race')
  const subraces = all.filter((row) => row.entry.type === 'subrace')
  const backgrounds = all.filter((row) => row.entry.type === 'background')
  const spells = all.filter((row) => row.entry.type === 'spell')
  const conditionEntries = all.filter((row) => row.entry.type === 'condition')
  const byName = new Map(conditionEntries.map((row) => [row.entry.name, row.entry.id]))
  const conditions = (Object.entries(CONDITION_LABELS) as Array<[string, string]>)
    .filter(([key]) => key !== 'exhaustion')
    .map(([key, name]) => ({ key: key as ConditionKey, name, ref: byName.get(name) }))
  const exhaustionEntry = conditionEntries.find((row) => row.entry.nameEn?.toLowerCase() === 'exhaustion')
  const tableId = tableRefOf(exhaustionEntry?.entry.data.text)
  const tableRow = exhaustionEntry && tableId ? await db.entries.get([exhaustionEntry.packId, tableId]) : undefined
  const exhaustionText = exhaustionRows((tableRow?.data as { rows?: unknown } | undefined)?.rows)
  const typeCache = new Map<string, Promise<CardEntry[]>>()
  const entriesOfType = (type: string): Promise<CardEntry[]> => {
    if (!typeCache.has(type)) typeCache.set(type, db.entries.where('[ruleId+type]').equals([ruleId, type]).toArray().then((list) => (list as StoredEntry[]).filter((row) => !enabled.size || enabled.has(row.packId)).map((row) => entryView(row, packs))))
    return typeCache.get(type)!
  }
  const cachedRaces = new Map<string, RaceData | undefined>()
  const cachedBackgrounds = new Map<string, BackgroundData | undefined>()
  const cacheRace = (id?: string): RaceData | undefined => {
    if (!id) return undefined
    if (cachedRaces.has(id)) return cachedRaces.get(id)
    const row = entries.get(id)
    const parsed = row ? raceDataSchema.safeParse(row.entry.data) : undefined
    const value = parsed?.success ? parsed.data as RaceData : undefined
    cachedRaces.set(id, value)
    return value
  }
  const raceOf = (id?: string): RaceData | undefined => cacheRace(id)
  const backgroundOf = (id?: string): BackgroundData | undefined => {
    if (!id) return undefined
    if (cachedBackgrounds.has(id)) return cachedBackgrounds.get(id)
    const row = entries.get(id)
    const parsed = row ? backgroundDataSchema.safeParse(row.entry.data) : undefined
    const value = parsed?.success ? parsed.data as BackgroundData : undefined
    cachedBackgrounds.set(id, value)
    return value
  }
  const classOf = (id?: string): ClassData | undefined => (id ? classes.get(id) : undefined)
  const nameOf = (id?: string): string => (id ? classLabels[id] ?? entries.get(id)?.entry.name ?? id : '')
  return {
    entries,
    classes,
    classLabels,
    races,
    subraces,
    backgrounds,
    conditions,
    spells,
    raceOf,
    backgroundOf,
    classOf,
    nameOf,
    raceOptions: races.map(optionOf),
    subraceOptions: (raceId?: string) => subraces.filter((row) => !raceId || row.entry.data.parentRace === raceId).map(optionOf),
    backgroundOptions: backgrounds.map(optionOf),
    spellDuration: durationText,
    exhaustionLevels: ((conditionEntries.find((r) => r.entry.id.startsWith('condition.exhaustion'))?.entry.data.levels ?? []) as Array<{ level: number; effects: Effect[] }>).filter((l) => l && typeof l.level === 'number' && Array.isArray(l.effects)),
    effectSummary: (ref?: string) => (ref ? entries.get(ref)?.entry.summary ?? '' : ''),
    exhaustionText,
    entriesOfType,
  }
}

export interface Candidate { key: string; label: string; en?: string; group: string; ref?: string; code?: string }
export interface ArchiveCandidates {
  languages: Candidate[]
  weapons: Candidate[]
  tools: Candidate[]
}
const LANGUAGE_GROUP: Record<string, string> = { standard: '标准语言', exotic: '特种语言', secret: '秘密语言' }
const TOOL_KIND: Record<string, string> = { artisanTool: '工匠工具', tool: '其他工具', gamingSet: '游戏套组', instrument: '乐器' }
const WEAPON_GROUP: Record<string, string> = { simple: '简易武器', martial: '军用武器' }

/** 档案「可添加」的候选：语言（按 type 分组，其他书籍按书折叠）、基础武器、基础工具（rarity 为 none 的才算基础物品）。只读，不改库。 */
export async function loadArchiveCandidates(ruleId: string, enabledPackIds: string[]): Promise<ArchiveCandidates> {
  const db = useAppStore().svc().db
  const packs = new Map((await db.packs.toArray()).map((pack) => [pack.id, pack.name]))
  const enabled = new Set(enabledPackIds)
  const rows = (await db.entries.where('[ruleId+type]').anyOf([[ruleId, 'language'], [ruleId, 'item']]).toArray()) as StoredEntry[]
  const allowed = rows.filter((row) => !enabled.size || enabled.has(row.packId))
  const languages: Candidate[] = []
  const weapons: Candidate[] = []
  const tools: Candidate[] = []
  for (const row of allowed) {
    const data = row.data as Record<string, unknown>
    if (row.type === 'language') {
      const type = typeof data.type === 'string' ? data.type : ''
      languages.push({ key: typeof data.code === 'string' ? data.code : row.entryId, label: row.name, en: row.nameEn, ref: row.entryId, group: LANGUAGE_GROUP[type] ?? `其他书籍 · ${packs.get(row.packId) ?? row.packId}` })
      continue
    }
    if (data.rarity !== 'none') continue
    const weapon = data.weapon as { category?: string } | undefined
    if (weapon?.category && WEAPON_GROUP[weapon.category]) weapons.push({ key: row.entryId, label: row.name, en: row.nameEn, ref: row.entryId, group: WEAPON_GROUP[weapon.category]! })
    const kind = typeof data.itemKind === 'string' ? data.itemKind : ''
    if (TOOL_KIND[kind] && !row.name.includes('系列')) tools.push({ key: row.entryId, label: row.name, en: row.nameEn, ref: row.entryId, group: TOOL_KIND[kind]! })
  }
  tools.push({ key: 'vehicles (land)', label: '陆地载具', group: '载具' }, { key: 'vehicles (water)', label: '水上载具', group: '载具' })
  const by = (a: Candidate, b: Candidate): number => a.group.localeCompare(b.group, 'zh') || a.label.localeCompare(b.label, 'zh')
  return { languages: languages.sort(by), weapons: weapons.sort(by), tools: tools.sort(by) }
}

export type EffectKind = 'condition' | 'disease' | 'spell' | 'other'
/** 添加效果弹窗的候选：状态、专注 / 突袭、疾病、计时型法术、特性 / 物品 / 环境（其他）。只读，不改库。 */
export async function loadEffectEntries(ruleId: string, enabledPackIds: string[]): Promise<CardEntry[]> {
  const db = useAppStore().svc().db
  const packs = new Map((await db.packs.toArray()).map((pack) => [pack.id, pack.name]))
  const enabled = new Set(enabledPackIds)
  const types = ['condition', 'status', 'disease', 'spell', 'feature', 'item', 'hazard']
  const rows = (await db.entries.where('[ruleId+type]').anyOf(types.map((type) => [ruleId, type])).toArray()) as StoredEntry[]
  return rows.filter((row) => !enabled.size || enabled.has(row.packId)).map((row) => entryView(row, packs))
}

/** 按条目编号查中文名（特性等没有预载的类型）；找不到的保持原编号，不丢。 */
export async function namesOf(ids: string[]): Promise<Record<string, string>> {
  const app = useAppStore()
  const library = useLibraryStore()
  const out: Record<string, string> = {}
  for (const id of ids) {
    const packId = await library.packOfEntry(id)
    const row = packId ? await app.svc().db.entries.get([packId, id]) : undefined
    if (row) out[id] = row.name
  }
  return out
}

/** 一个人物的派生上下文（人物卡与骰盘共用）。 */
export function deriveContextOf(person: Person, data: CardData): DeriveContext {
  return {
    race: data.raceOf(person.block.race), subrace: data.raceOf(person.block.subrace), background: data.backgroundOf(person.block.background),
    classes: (person.block.classes ?? []).map((row) => ({ id: row.class, entry: data.classOf(row.class), level: row.level })),
    equipmentEffects: person.effects.flatMap((e) => e.effects ?? []),
  }
}
