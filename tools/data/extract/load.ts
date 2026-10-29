import { join } from 'node:path'
import { BOOK_SOURCES } from '../config/books'
import { listFiles, readJson, REPO_ROOT } from '../lib/io'

export const DATA_5ETOOLS = join(REPO_ROOT, 'reference', '5etools-cn-main（数据库）', 'data')
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
  foundryActions: Raw[]
}

function isObj(value: unknown): value is Raw {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function applyMod(value: unknown, mod: unknown): unknown {
  if (!isObj(mod)) return mod
  const mode = mod.mode
  if (mode === 'appendArr') {
    const base = Array.isArray(value) ? value : []
    const items = mod.items
    return [...base, ...(Array.isArray(items) ? items : [items])]
  }
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
  return { ...(isObj(value) ? value : {}), ...mod }
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

function applyMods(base: Raw, mod: Raw): Raw {
  let out: Raw = { ...base }
  const star = mod['*']
  if (isObj(star) && star.mode === 'replaceTxt' && typeof star.replace === 'string' && typeof star.with === 'string') {
    out = replaceText(out, star.replace, star.with) as Raw
  }
  for (const [key, value] of Object.entries(mod)) {
    if (key === '*') continue
    if (isObj(value) && typeof value.mode === 'string') out[key] = applyMod(out[key], value)
    else if (isObj(value) && isObj(out[key])) out[key] = applyMods(out[key] as Raw, value)
    else out[key] = value
  }
  return out
}

/** 处理 5etools 的 _copy / _mod 继承。 */
export function resolveCopies(list: Raw[]): Raw[] {
  const byKey = new Map<string, Raw>()
  for (const item of list) byKey.set(`${String(item.source)}|${String(item.name)}`, item)
  return list.map((item) => {
    const copy = item._copy
    if (!isObj(copy)) return item
    const base = byKey.get(`${String(copy.source)}|${String(copy.name)}`)
    if (!base) return item
    const { _copy, _mod, ...own } = item
    const merged = { ...base, ...own }
    if (isObj(_mod)) return applyMods(merged, _mod)
    return merged
  })
}

async function loadArray(relPath: string, key: string): Promise<Raw[]> {
  const raw = await readJson<Record<string, unknown>>(join(DATA_5ETOOLS, relPath))
  const value = raw[key]
  if (!Array.isArray(value)) throw new Error(`${relPath} 缺少数组 ${key}`)
  return resolveCopies(value.filter(isObj))
}

function filterBooks(list: Raw[]): Raw[] {
  return list.filter((item) => BOOK_SOURCES.has(String(item.source)))
}

async function loadMonsters(): Promise<Raw[]> {
  const out: Raw[] = []
  for (const path of await listFiles(join(DATA_5ETOOLS, 'bestiary'), (n) => n.startsWith('bestiary-') && n.endsWith('.json'))) {
    const raw = await readJson<Record<string, unknown>>(path)
    if (Array.isArray(raw.monster)) out.push(...raw.monster.filter(isObj))
  }
  return filterBooks(resolveCopies(out))
}

async function loadSpells(): Promise<Raw[]> {
  const out: Raw[] = []
  for (const path of await listFiles(join(DATA_5ETOOLS, 'spells'), (n) => n.startsWith('spells-') && n.endsWith('.json'))) {
    const raw = await readJson<Record<string, unknown>>(path)
    if (Array.isArray(raw.spell)) out.push(...raw.spell.filter(isObj))
  }
  return filterBooks(resolveCopies(out))
}

async function loadClasses(): Promise<Pick<RawData, 'classes' | 'subclasses' | 'classFeatures' | 'subclassFeatures'>> {
  const out = { classes: [] as Raw[], subclasses: [] as Raw[], classFeatures: [] as Raw[], subclassFeatures: [] as Raw[] }
  for (const path of await listFiles(join(DATA_5ETOOLS, 'class'), (n) => n.startsWith('class-') && n.endsWith('.json'))) {
    const raw = await readJson<Record<string, unknown>>(path)
    const map = { class: 'classes', subclass: 'subclasses', classFeature: 'classFeatures', subclassFeature: 'subclassFeatures' } as const
    for (const key of ['class', 'subclass', 'classFeature', 'subclassFeature'] as const) {
      if (Array.isArray(raw[key])) out[map[key]].push(...raw[key].filter(isObj))
    }
  }
  return {
    classes: filterBooks(resolveCopies(out.classes)),
    subclasses: filterBooks(resolveCopies(out.subclasses)),
    classFeatures: filterBooks(resolveCopies(out.classFeatures)),
    subclassFeatures: filterBooks(resolveCopies(out.subclassFeatures)),
  }
}

async function loadLoot(): Promise<Raw[]> {
  const raw = await readJson<Record<string, unknown>>(join(DATA_5ETOOLS, 'loot.json'))
  const out: Raw[] = []
  for (const key of ['individual', 'hoard', 'dragon', 'gems', 'artObjects', 'magicItems', 'dragonMundaneItems']) {
    const list = raw[key]
    if (!Array.isArray(list)) continue
    for (const item of resolveCopies(list.filter(isObj))) if (BOOK_SOURCES.has(String(item.source))) out.push({ ...item, _lootCategory: key })
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

const DAMAGE_CN: Record<string, string> = {
  acid: '强酸', bludgeoning: '钝击', cold: '冷冻', fire: '火焰', force: '力场', lightning: '闪电', necrotic: '死灵',
  piercing: '穿刺', poison: '毒素', psychic: '心灵', radiant: '光耀', slashing: '挥砍', thunder: '雷鸣',
}

function fillTemplate(value: unknown, item: Raw): unknown {
  if (typeof value === 'string') {
    return value.replace(/\{\{item\.(\w+)\}\}/g, (_all, key: string) => {
      const field = item[key]
      if (Array.isArray(field)) return field.map((v) => DAMAGE_CN[String(v)] ?? String(v)).join('、')
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
  const booksRaw = await readJson<Record<string, unknown>>(join(DATA_5ETOOLS, 'books.json'))
  const books = (Array.isArray(booksRaw.book) ? booksRaw.book : []).filter(isObj).map((b) => ({ source: String(b.source), name: String(b.name), translator: typeof b.translator === 'string' ? b.translator : undefined }))
  const classes = await loadClasses()
  return {
    spells: await loadSpells(),
    monsters: await loadMonsters(),
    items: filterBooks(await loadArray('items.json', 'item')),
    itemGroups: filterBooks(await loadArray('items.json', 'itemGroup')),
    itemEntryTemplates: await loadArray('items-base.json', 'itemEntry'),
    baseItems: filterBooks(await loadArray('items-base.json', 'baseitem')),
    magicVariants: (await loadArray('magicvariants.json', 'magicvariant')).filter((v) => BOOK_SOURCES.has(String((v.inherits as Raw | undefined)?.source ?? v.source))),
    ...classes,
    races: filterBooks(await loadArray('races.json', 'race')),
    subraces: filterBooks(await loadArray('races.json', 'subrace')),
    backgrounds: filterBooks(await loadArray('backgrounds.json', 'background')),
    feats: filterBooks(await loadArray('feats.json', 'feat')),
    optionalFeatures: filterBooks(await loadArray('optionalfeatures.json', 'optionalfeature')),
    conditions: filterBooks(await loadArray('conditionsdiseases.json', 'condition')),
    diseases: filterBooks(await loadArray('conditionsdiseases.json', 'disease')),
    statuses: filterBooks(await loadArray('conditionsdiseases.json', 'status')),
    variantRules: filterBooks(await loadArray('variantrules.json', 'variantrule')),
    actions: filterBooks(await loadArray('actions.json', 'action')),
    legendaryGroups: filterBooks(await loadArray('bestiary/legendarygroups.json', 'legendaryGroup')),
    tables: filterBooks(await loadArray('tables.json', 'table')),
    loot: await loadLoot(),
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
    foundryActions: await loadFoundry('foundry-actions.json', 'action'),
  }
}
