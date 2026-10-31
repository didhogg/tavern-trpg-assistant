import { expandVersions } from './versions'
import { join } from 'node:path'
import { BOOK_SOURCES } from '../config/books'
import { listFiles, readJson, REPO_ROOT } from '../lib/io'
import { loadFluff, type FluffRecord } from './fluff'

// R13：英文那一遍用环境变量 TRPG_DATA_DIR=data-bak 把数据目录换成英文原版
export const DATA_5ETOOLS = join(REPO_ROOT, 'reference', '5etools-cn-main（数据库）', process.env.TRPG_DATA_DIR ?? 'data')
export const DATA_FALLBACK = join(REPO_ROOT, 'reference', 'dnd-data-main（数据库）', 'data')

export type Raw = Record<string, unknown>

export interface BookInfo {
  source: string
  name: string
  translator?: string
}

export interface RawData {
  spells: Raw[]
  monsters: Raw[]
  items: Raw[]
  itemGroups: Raw[]
  baseItems: Raw[]
  /** 物品正文模板（{#itemEntry}）。 */
  itemEntryTemplates: Raw[]
  magicVariants: Raw[]
  classes: Raw[]
  subclasses: Raw[]
  classFeatures: Raw[]
  subclassFeatures: Raw[]
  races: Raw[]
  subraces: Raw[]
  backgrounds: Raw[]
  feats: Raw[]
  optionalFeatures: Raw[]
  conditions: Raw[]
  diseases: Raw[]
  statuses: Raw[]
  variantRules: Raw[]
  actions: Raw[]
  legendaryGroups: Raw[]
  tables: Raw[]
  loot: Raw[]
  books: BookInfo[]
  spellLookup: Record<string, Raw>
  fallbackNames: Set<string>
  foundryClasses: Raw[]
  foundrySubclasses: Raw[]
  foundryClassFeatures: Raw[]
  foundrySubclassFeatures: Raw[]
  foundryFeats: Raw[]
  foundryRaces: Raw[]
  foundryOptionalFeatures: Raw[]
  foundryItems: Raw[]
  foundryVariants: Raw[]
  foundryActions: Raw[]
  unsupportedMods: UnsupportedMod[]
  fluff?: FluffRecord[]
}

function isObj(value: unknown): value is Raw {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

export interface UnsupportedMod {
  name: string
  source: string
  mode: string
  key: string
}

function ownerOf(value: Raw): { name: string; source: string } {
  return { name: String(value.ENG_name ?? value.name ?? '未知'), source: String(value.source ?? '未知') }
}

function unsupported(entry: Raw, mode: string, key: string, sink?: UnsupportedMod[]): void {
  if (!sink) return
  const owner = ownerOf(entry)
  sink.push({ ...owner, mode, key })
}

function applyMod(value: unknown, mod: unknown, entry: Raw, key: string, sink?: UnsupportedMod[]): unknown {
  if (!isObj(mod)) return mod
  const mode = mod.mode
  if (mode === 'appendArr') {
    const base = Array.isArray(value) ? value : []
    const items = mod.items
    return [...base, ...(Array.isArray(items) ? items : [items])]
  }
  if (mode === 'prependArr') {
    const base = Array.isArray(value) ? value : []
    const items = mod.items
    return [...(Array.isArray(items) ? items : [items]), ...base]
  }
  if (mode === 'removeArr') {
    const base = Array.isArray(value) ? value : []
    const names = new Set((Array.isArray(mod.names) ? mod.names : [mod.names]).filter((x): x is string => typeof x === 'string'))
    return base.filter((item) => !(isObj(item) && typeof item.name === 'string' && names.has(item.name)))
  }
  if (mode === 'setProp') return mod.value
  if (mode === 'replaceArr' || mode === 'insertArr') {
    const base = Array.isArray(value) ? [...value] : []
    const items = mod.items
    const insert = Array.isArray(items) ? items : [items]
    let index = typeof mod.index === 'number' ? mod.index : -1
    const replace = mod.replace
    if (index < 0 && typeof replace === 'string') index = base.findIndex((item) => isObj(item) && item.name === replace)
    if (index < 0 && isObj(replace) && typeof replace.index === 'number') index = replace.index
    if (mode === 'insertArr') base.splice(Math.max(0, index), 0, ...insert)
    else if (index >= 0) base.splice(index, 1, ...insert)
    else base.push(...insert)
    return base
  }
  if (mode === 'replaceTxt' && typeof mod.replace === 'string' && typeof mod.with === 'string') return replaceText(value, mod.replace, mod.with)
  unsupported(entry, String(mode), key, sink)
  return value
}

function replaceText(value: unknown, from: string, to: string): unknown {
  if (typeof value === 'string') return value.split(from).join(to)
  if (Array.isArray(value)) return value.map((item) => replaceText(item, from, to))
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [key, item] of Object.entries(value)) out[key] = replaceText(item, from, to)
    return out
  }
  return value
}

function applyOperations(value: unknown, operations: unknown[], entry: Raw, key: string, sink?: UnsupportedMod[]): unknown {
  return operations.reduce((current, operation) => applyMod(current, operation, entry, key, sink), value)
}

/** 处理 5etools 的 _mod：支持操作数组、prependArr/setProp/removeArr；未知模式登记并保留原值。 */
export function applyMods(base: Raw, mod: Raw, sink?: UnsupportedMod[]): Raw {
  let out: Raw = { ...base }
  const star = mod['*']
  const starOps = Array.isArray(star) ? star : isObj(star) ? [star] : []
  for (const operation of starOps) {
    if (!isObj(operation) || typeof operation.mode !== 'string') continue
    if (operation.mode === 'replaceTxt' && typeof operation.replace === 'string' && typeof operation.with === 'string') {
      out = replaceText(out, operation.replace, operation.with) as Raw
    } else {
      unsupported(base, operation.mode, '*', sink)
    }
  }
  for (const [key, value] of Object.entries(mod)) {
    if (key === '*') continue
    if (key === 'images') continue
    const current = out[key]
    if (Array.isArray(value) && value.every((item) => isObj(item) && typeof item.mode === 'string')) {
      out[key] = applyOperations(current, value, base, key, sink)
    } else if (isObj(value) && typeof value.mode === 'string') {
      out[key] = applyMod(current, value, base, key, sink)
    } else if (isObj(value) && isObj(current)) {
      out[key] = applyMods(current as Raw, value, sink)
    } else {
      out[key] = value
    }
  }
  return out
}

/** 处理 5etools 的 _copy / _mod 继承；srd/basicRules 不继承基础记录。 */
export function resolveCopies(list: Raw[], sink?: UnsupportedMod[]): Raw[] {
  const byKey = new Map<string, Raw>()
  for (const item of list) byKey.set(`${String(item.source)}|${String(item.name)}`, item)
  return list.map((item) => {
    const copy = item._copy
    if (!isObj(copy)) return item
    const base = byKey.get(`${String(copy.source)}|${String(copy.name)}`)
    if (!base) return item
    const { _copy, _mod, ...own } = item
    const inherited = Object.fromEntries(Object.entries(base).filter(([key]) => key !== '_versions'))
    const merged = { ...inherited, ...own }
    delete merged.srd
    delete merged.basicRules
    if (own.srd !== undefined) merged.srd = own.srd
    if (own.basicRules !== undefined) merged.basicRules = own.basicRules
    const mod = isObj(_mod) ? _mod : isObj(copy._mod) ? copy._mod : undefined
    if (mod) return applyMods(merged, mod, sink)
    return merged
  })
}

async function loadArray(relPath: string, key: string, sink?: UnsupportedMod[]): Promise<Raw[]> {
  const raw = await readJson<Record<string, unknown>>(join(DATA_5ETOOLS, relPath))
  const value = raw[key]
  if (!Array.isArray(value)) throw new Error(`${relPath} 缺少数组 ${key}`)
  return resolveCopies(value.filter(isObj), sink)
}

function filterBooks(list: Raw[]): Raw[] {
  return list.filter((item) => BOOK_SOURCES.has(String(item.source)))
}

async function loadMonsters(sink?: UnsupportedMod[]): Promise<Raw[]> {
  const out: Raw[] = []
  for (const path of await listFiles(join(DATA_5ETOOLS, 'bestiary'), (n) => n.startsWith('bestiary-') && n.endsWith('.json'))) {
    const raw = await readJson<Record<string, unknown>>(path)
    if (Array.isArray(raw.monster)) out.push(...raw.monster.filter(isObj))
  }
  return filterBooks(expandVersions(resolveCopies(out, sink), sink))
}

async function loadSpells(sink?: UnsupportedMod[]): Promise<Raw[]> {
  const out: Raw[] = []
  for (const path of await listFiles(join(DATA_5ETOOLS, 'spells'), (n) => n.startsWith('spells-') && n.endsWith('.json'))) {
    const raw = await readJson<Record<string, unknown>>(path)
    if (Array.isArray(raw.spell)) out.push(...raw.spell.filter(isObj))
  }
  return filterBooks(resolveCopies(out, sink))
}

async function loadClasses(sink?: UnsupportedMod[]): Promise<Pick<RawData, 'classes' | 'subclasses' | 'classFeatures' | 'subclassFeatures'>> {
  const out = { classes: [] as Raw[], subclasses: [] as Raw[], classFeatures: [] as Raw[], subclassFeatures: [] as Raw[] }
  for (const path of await listFiles(join(DATA_5ETOOLS, 'class'), (n) => n.startsWith('class-') && n.endsWith('.json'))) {
    const raw = await readJson<Record<string, unknown>>(path)
    const map = { class: 'classes', subclass: 'subclasses', classFeature: 'classFeatures', subclassFeature: 'subclassFeatures' } as const
    for (const key of ['class', 'subclass', 'classFeature', 'subclassFeature'] as const) {
      if (Array.isArray(raw[key])) out[map[key]].push(...raw[key].filter(isObj))
    }
  }
  return {
    classes: filterBooks(resolveCopies(out.classes, sink)),
    subclasses: filterBooks(resolveCopies(out.subclasses, sink)),
    classFeatures: filterBooks(resolveCopies(out.classFeatures, sink)),
    subclassFeatures: filterBooks(resolveCopies(out.subclassFeatures, sink)),
  }
}

async function loadLoot(sink?: UnsupportedMod[]): Promise<Raw[]> {
  const raw = await readJson<Record<string, unknown>>(join(DATA_5ETOOLS, 'loot.json'))
  const out: Raw[] = []
  for (const key of ['individual', 'hoard', 'dragon', 'gems', 'artObjects', 'magicItems', 'dragonMundaneItems']) {
    const list = raw[key]
    if (!Array.isArray(list)) continue
    for (const item of resolveCopies(list.filter(isObj), sink)) if (BOOK_SOURCES.has(String(item.source))) out.push({ ...item, _lootCategory: key })
  }
  return out
}

async function loadFallbackNames(): Promise<Set<string>> {
  const names = new Set<string>()
  for (const file of ['species.json', 'classes.json', 'spells.json', 'items.json', 'monsters.json', 'backgrounds.json']) {
    const list = await readJson<Raw[]>(join(DATA_FALLBACK, file))
    for (const item of list) if (typeof item.name === 'string') names.add(item.name)
  }
  return names
}

const DAMAGE_CN: Record<string, string> = process.env.TRPG_DATA_LANG === 'en' ? {
  acid: 'acid', bludgeoning: 'bludgeoning', cold: 'cold', fire: 'fire', force: 'force', lightning: 'lightning', necrotic: 'necrotic',
  piercing: 'piercing', poison: 'poison', psychic: 'psychic', radiant: 'radiant', slashing: 'slashing', thunder: 'thunder',
} : {
  acid: '强酸', bludgeoning: '钝击', cold: '冷冻', fire: '火焰', force: '力场', lightning: '闪电', necrotic: '死灵',
  piercing: '穿刺', poison: '毒素', psychic: '心灵', radiant: '光耀', slashing: '挥砍', thunder: '雷鸣',
}

function fillTemplate(value: unknown, item: Raw): unknown {
  if (typeof value === 'string') {
    return value.replace(/\{\{item\.(\w+)\}\}/g, (_all, key: string) => {
      const field = item[key]
      if (Array.isArray(field)) return field.map((v) => DAMAGE_CN[String(v)] ?? String(v)).join(process.env.TRPG_DATA_LANG === 'en' ? ', ' : '、')
      if (typeof field === 'string' || typeof field === 'number') return String(field)
      throw new Error(`物品「${String(item.name)}」缺少模板变量 item.${key}`)
    })
  }
  if (Array.isArray(value)) return value.map((v) => fillTemplate(v, item))
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, fillTemplate(v, item)]))
  return value
}

/** 把物品正文里的 {#itemEntry 名称|来源} 换成 items-base.json 里的模板正文，并填入物品自己的字段。 */
export function expandItemEntries(items: Raw[], templates: Raw[]): Raw[] {
  return items.map((item) => {
    if (!Array.isArray(item.entries)) return item
    const entries = item.entries.flatMap((entry: unknown) => {
      const match = typeof entry === 'string' ? /^\{#itemEntry ([^|}]+)(?:\|([^}]+))?\}$/.exec(entry) : null
      if (!match) return [entry]
      const source = match[2] ?? String(item.source)
      const template = templates.find((t) => t.name === match[1] && t.source === source) ?? templates.find((t) => t.name === match[1] && BOOK_SOURCES.has(String(t.source)))
      if (!template || !Array.isArray(template.entriesTemplate)) throw new Error(`找不到物品正文模板：${match[1]}|${source}`)
      return fillTemplate(template.entriesTemplate, item) as unknown[]
    })
    return { ...item, entries }
  })
}

async function loadFoundry(path: string, key: string): Promise<Raw[]> {
  const raw = await readJson<Record<string, unknown>>(join(DATA_5ETOOLS, path))
  const list = raw[key]
  if (!Array.isArray(list)) throw new Error(`${path} 缺少数组 ${key}`)
  return list.filter(isObj).filter((item) => BOOK_SOURCES.has(String(item.source)))
}

export async function loadRawData(): Promise<RawData> {
  const unsupportedMods: UnsupportedMod[] = []
  const booksRaw = await readJson<Record<string, unknown>>(join(DATA_5ETOOLS, 'books.json'))
  const books = (Array.isArray(booksRaw.book) ? booksRaw.book : []).filter(isObj).map((b) => ({ source: String(b.source), name: String(b.name), translator: typeof b.translator === 'string' ? b.translator : undefined }))
  const classes = await loadClasses(unsupportedMods)
  return {
    spells: await loadSpells(unsupportedMods),
    monsters: await loadMonsters(unsupportedMods),
    items: filterBooks(await loadArray('items.json', 'item', unsupportedMods)),
    itemGroups: filterBooks(await loadArray('items.json', 'itemGroup', unsupportedMods)),
    itemEntryTemplates: await loadArray('items-base.json', 'itemEntry', unsupportedMods),
    baseItems: filterBooks(await loadArray('items-base.json', 'baseitem', unsupportedMods)),
    magicVariants: (await loadArray('magicvariants.json', 'magicvariant', unsupportedMods)).filter((v) => BOOK_SOURCES.has(String((v.inherits as Raw | undefined)?.source ?? v.source))),
    ...classes,
    races: filterBooks(expandVersions(await loadArray('races.json', 'race', unsupportedMods), unsupportedMods)),
    subraces: filterBooks(expandVersions(await loadArray('races.json', 'subrace', unsupportedMods), unsupportedMods)),
    backgrounds: filterBooks(await loadArray('backgrounds.json', 'background', unsupportedMods)),
    feats: filterBooks(await loadArray('feats.json', 'feat', unsupportedMods)),
    optionalFeatures: filterBooks(await loadArray('optionalfeatures.json', 'optionalfeature', unsupportedMods)),
    conditions: filterBooks(await loadArray('conditionsdiseases.json', 'condition', unsupportedMods)),
    diseases: filterBooks(await loadArray('conditionsdiseases.json', 'disease', unsupportedMods)),
    statuses: filterBooks(await loadArray('conditionsdiseases.json', 'status', unsupportedMods)),
    variantRules: filterBooks(await loadArray('variantrules.json', 'variantrule', unsupportedMods)),
    actions: filterBooks(await loadArray('actions.json', 'action', unsupportedMods)),
    legendaryGroups: filterBooks(await loadArray('bestiary/legendarygroups.json', 'legendaryGroup', unsupportedMods)),
    tables: filterBooks(await loadArray('tables.json', 'table', unsupportedMods)),
    loot: await loadLoot(unsupportedMods),
    books,
    spellLookup: await readJson<Record<string, Raw>>(join(DATA_5ETOOLS, 'generated', 'gendata-spell-source-lookup.json')),
    fallbackNames: await loadFallbackNames(),
    foundryClasses: await loadFoundry('class/foundry.json', 'class'),
    foundrySubclasses: await loadFoundry('class/foundry.json', 'subclass'),
    foundryClassFeatures: await loadFoundry('class/foundry.json', 'classFeature'),
    foundrySubclassFeatures: await loadFoundry('class/foundry.json', 'subclassFeature'),
    foundryFeats: await loadFoundry('foundry-feats.json', 'feat'),
    foundryRaces: await loadFoundry('foundry-races.json', 'raceFeature'),
    foundryOptionalFeatures: await loadFoundry('foundry-optionalfeatures.json', 'optionalfeature'),
    foundryItems: await loadFoundry('foundry-items.json', 'item'),
    foundryVariants: await loadFoundry('foundry-items.json', 'magicvariant'),
    foundryActions: await loadFoundry('foundry-actions.json', 'action'),
    fluff: await loadFluff(unsupportedMods),
    unsupportedMods,
  }
}
