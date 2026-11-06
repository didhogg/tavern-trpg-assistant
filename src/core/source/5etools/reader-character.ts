import type { Entry } from '../../../schemas/pack'

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v)

// ---------- 职业 ----------
export interface FeatureRef {
  name: string
  className: string
  classSource: string
  subclassShortName?: string
  subclassSource?: string
  level: number
  source?: string
  gainSubclassFeature?: boolean
}
export interface FeatureMatch { level: number; name: string; nameEn?: string; gainSubclassFeature?: boolean }
export interface SubclassView {
  name: string
  nameEn?: string
  refs: number
  resolved: number
  missing: number
  byLevel: Record<string, string[]>
}
export interface ClassView {
  name: string
  nameEn?: string
  source?: string
  hitDie?: number
  saves: string[]
  classTableGroups: unknown
  spellcasting: { ability: string; progression?: string } | null
  subclassTitle?: string
  subclassLevel: number | null
  classRefs: number
  classFeaturesResolved: number
  classFeaturesMissing: number
  missing: FeatureRef[]
  byLevel: Record<string, string[]>
  subclasses: SubclassView[]
}

export function parseFeatureRef(text: string): FeatureRef {
  const p = String(text).split('|')
  if (p.length >= 6) return { name: p[0], className: p[1], classSource: p[2], subclassShortName: p[3], subclassSource: p[4], level: Number(p[5]), source: p[6] }
  return { name: p[0], className: p[1], classSource: p[2], level: Number(p[3]), source: p[4] }
}

export function featureRefs(value: unknown): FeatureRef[] {
  const out: FeatureRef[] = []
  for (const item of Array.isArray(value) ? value : []) {
    if (typeof item === 'string') out.push(parseFeatureRef(item))
    else if (isObj(item) && typeof item.classFeature === 'string') out.push({ ...parseFeatureRef(item.classFeature), gainSubclassFeature: item.gainSubclassFeature === true })
  }
  return out
}

function matchFeature(features: Entry[], ref: FeatureRef): Entry | undefined {
  return features.find((entry) => {
    const f = entry.data
    if (!(f.name === ref.name || f.ENG_name === ref.name)) return false
    if (f.className !== ref.className) return false
    if (ref.classSource && f.classSource !== ref.classSource) return false
    if (ref.subclassShortName && f.subclassShortName !== ref.subclassShortName) return false
    if (ref.subclassSource && f.subclassSource !== ref.subclassSource) return false
    return Number(f.level) === ref.level
  })
}

function byLevelOf(items: FeatureMatch[]): Record<string, string[]> {
  const map = new Map<number, string[]>()
  for (const x of items) map.set(x.level, [...(map.get(x.level) ?? []), x.name])
  return Object.fromEntries([...map].sort((a, b) => a[0] - b[0]))
}

export function classView(classEntry: Entry, features: Entry[], subclasses: Entry[]): ClassView {
  const d = classEntry.data
  const classFeatures = features.filter((f) => !f.data.subclassShortName)
  const classRefs = featureRefs(d.classFeatures)
  const resolved: FeatureMatch[] = []
  const missing: FeatureRef[] = []
  for (const ref of classRefs) {
    const f = matchFeature(classFeatures, ref)
    if (f) resolved.push({ level: ref.level, name: f.name, nameEn: f.nameEn, gainSubclassFeature: ref.gainSubclassFeature })
    else if (!ref.gainSubclassFeature) missing.push(ref)
  }
  const ownSubclasses = subclasses.filter((s) => s.data.className === d.name && s.data.classSource === d.source)
  const subViews: SubclassView[] = ownSubclasses.map((s) => {
    const refs = featureRefs(s.data.subclassFeatures)
    const got: FeatureMatch[] = []
    let miss = 0
    for (const ref of refs) {
      const f = matchFeature(features.filter((x) => x.data.subclassShortName), ref)
      if (f) got.push({ level: ref.level, name: f.name, nameEn: f.nameEn })
      else miss += 1
    }
    return { name: s.name, nameEn: s.nameEn, refs: refs.length, resolved: got.length, missing: miss, byLevel: byLevelOf(got) }
  })
  const subclassRef = classRefs.find((r) => r.gainSubclassFeature)
  return {
    name: classEntry.name,
    nameEn: classEntry.nameEn,
    source: typeof d.source === 'string' ? d.source : undefined,
    hitDie: Number.isFinite(Number((isObj(d.hd) ? d.hd.faces : undefined))) ? Number((isObj(d.hd) ? d.hd.faces : undefined)) : undefined,
    saves: Array.isArray(d.proficiency) ? d.proficiency.map(String) : [],
    classTableGroups: d.classTableGroups ?? null,
    spellcasting: typeof d.spellcastingAbility === 'string' ? { ability: d.spellcastingAbility, progression: typeof d.casterProgression === 'string' ? d.casterProgression : undefined } : null,
    subclassTitle: typeof d.subclassTitle === 'string' ? d.subclassTitle : undefined,
    subclassLevel: subclassRef?.level ?? null,
    classRefs: classRefs.length,
    classFeaturesResolved: resolved.length,
    classFeaturesMissing: missing.length,
    missing,
    byLevel: byLevelOf(resolved),
    subclasses: subViews,
  }
}

// ---------- 种族 / 亚种 ----------
export interface RaceView {
  name: string
  nameEn?: string
  source?: string
  isSubrace: boolean
  parentRace?: string
  parentRaceSource?: string
  size: unknown[]
  speed: unknown
  ability: unknown
  darkvision?: number
  languages: unknown
  skillProficiencies: unknown
  toolProficiencies: unknown
  weaponProficiencies: unknown
  armorProficiencies: unknown
  traits: Array<{ name: string; nameEn?: string }>
  tags: Record<string, number>
}

export function raceView(entry: Entry): RaceView {
  const d = entry.data
  const traits = (Array.isArray(d.entries) ? d.entries : [])
    .filter(isObj)
    .map((x) => ({ name: String(x.name ?? ''), ...(typeof x.ENG_name === 'string' ? { nameEn: x.ENG_name } : {}) }))
    .filter((x) => x.name)
  const tags: Record<string, number> = {}
  const collect = (v: unknown): void => {
    if (typeof v === 'string') { for (const m of v.matchAll(/\{@([A-Za-z0-9_]+)/g)) tags[m[1]] = (tags[m[1]] ?? 0) + 1; return }
    if (Array.isArray(v)) { for (const x of v) collect(x); return }
    if (v && typeof v === 'object') for (const x of Object.values(v)) collect(x)
  }
  collect(d.entries)
  return {
    name: entry.name,
    nameEn: entry.nameEn,
    source: typeof d.source === 'string' ? d.source : undefined,
    isSubrace: typeof d.raceName === 'string',
    parentRace: typeof d.raceName === 'string' ? d.raceName : undefined,
    parentRaceSource: typeof d.raceSource === 'string' ? d.raceSource : undefined,
    size: Array.isArray(d.size) ? d.size : [],
    speed: d.speed,
    ability: d.ability,
    darkvision: Number.isFinite(Number(d.darkvision)) ? Number(d.darkvision) : undefined,
    languages: d.languageProficiencies,
    skillProficiencies: d.skillProficiencies,
    toolProficiencies: d.toolProficiencies,
    weaponProficiencies: d.weaponProficiencies,
    armorProficiencies: d.armorProficiencies,
    traits,
    tags,
  }
}

// ---------- 背景 ----------
export interface BackgroundView {
  name: string
  nameEn?: string
  source?: string
  edition?: string
  ability: unknown
  feats: unknown
  skillProficiencies: unknown
  toolProficiencies: unknown
  languageProficiencies: unknown
  startingEquipment: unknown
  traits: Array<{ name: string; nameEn?: string }>
}

export function backgroundView(entry: Entry): BackgroundView {
  const d = entry.data
  const traits = (Array.isArray(d.entries) ? d.entries : [])
    .filter(isObj)
    .map((x) => ({ name: String(x.name ?? ''), ...(typeof x.ENG_name === 'string' ? { nameEn: x.ENG_name } : {}) }))
    .filter((x) => x.name)
  return {
    name: entry.name,
    nameEn: entry.nameEn,
    source: typeof d.source === 'string' ? d.source : undefined,
    edition: typeof d.edition === 'string' ? d.edition : undefined,
    ability: d.ability,
    feats: d.feats,
    skillProficiencies: d.skillProficiencies,
    toolProficiencies: d.toolProficiencies,
    languageProficiencies: d.languageProficiencies,
    startingEquipment: d.startingEquipment,
    traits,
  }
}

// ---------- 专长 ----------
export interface FeatView {
  name: string
  nameEn?: string
  source?: string
  category?: string
  prerequisite: unknown
  ability: unknown
  skillProficiencies: unknown
  toolProficiencies: unknown
  expertise: unknown
  senses: unknown
  additionalSpells: unknown
  traits: Array<{ name: string; nameEn?: string }>
}

export function featView(entry: Entry): FeatView {
  const d = entry.data
  const traits = (Array.isArray(d.entries) ? d.entries : [])
    .filter(isObj)
    .map((x) => ({ name: String(x.name ?? ''), ...(typeof x.ENG_name === 'string' ? { nameEn: x.ENG_name } : {}) }))
    .filter((x) => x.name)
  return {
    name: entry.name,
    nameEn: entry.nameEn,
    source: typeof d.source === 'string' ? d.source : undefined,
    category: typeof d.category === 'string' ? d.category : undefined,
    prerequisite: d.prerequisite,
    ability: d.ability,
    skillProficiencies: d.skillProficiencies,
    toolProficiencies: d.toolProficiencies,
    expertise: d.expertise,
    senses: d.senses,
    additionalSpells: d.additionalSpells,
    traits,
  }
}

// ---------- 可选特性 ----------
export interface OptionalFeatureView {
  name: string
  nameEn?: string
  source?: string
  featureType: string[]
  prerequisite: unknown
  consumes: unknown
  isClassFeatureVariant: boolean
}

export function optionalFeatureView(entry: Entry): OptionalFeatureView {
  const d = entry.data
  return {
    name: entry.name,
    nameEn: entry.nameEn,
    source: typeof d.source === 'string' ? d.source : undefined,
    featureType: Array.isArray(d.featureType) ? d.featureType.map(String) : [],
    prerequisite: d.prerequisite,
    consumes: d.consumes,
    isClassFeatureVariant: d.isClassFeatureVariant === true,
  }
}

// ---------- 升级 1–20 ----------
export interface LevelRow {
  level: number
  features: string[]
  asi: boolean
  subclass: boolean
  slots: number[] | null
  pact: { count: number; level: number | null } | null
  hpAverage: number
}
export interface LevelUpView {
  name: string
  nameEn?: string
  hitDie: number | null
  subclassLevel: number | null
  levels: LevelRow[]
  cantrips: number[] | null
  spellsKnown: number[] | null
  slotsReadable: boolean
}

function tableGroups(d: Record<string, unknown>): Array<Record<string, unknown>> {
  return Array.isArray(d.classTableGroups) ? (d.classTableGroups as Array<Record<string, unknown>>) : []
}
function groupRows(group: Record<string, unknown>): unknown[][] | null {
  return Array.isArray(group.rows) ? (group.rows as unknown[][]) : null
}
function numberRows(group: Record<string, unknown>): number[] | null {
  const rows = groupRows(group)
  if (!rows || rows.length < 20) return null
  const values = rows.map((r) => Number(r[0]))
  return values.every((n) => Number.isFinite(n)) ? values.slice(0, 20) : null
}
function labelIndex(labels: string[], include: string, exclude?: string): number {
  return labels.findIndex((l) => l.includes(include) && (!exclude || !l.includes(exclude)))
}

export function levelUpView(classEntry: Entry, features: Entry[], subclasses: Entry[]): LevelUpView {
  const cls = classView(classEntry, features, subclasses)
  const d = classEntry.data
  const hd = isObj(d.hd) ? d.hd : {}
  const hitDie = Number.isFinite(Number(hd.faces)) ? Number(hd.faces) : null
  const levels: LevelRow[] = []
  for (let level = 1; level <= 20; level++) {
    const names = cls.byLevel[String(level)] ?? []
    levels.push({
      level,
      features: names,
      asi: names.some((n) => /Ability Score Improvement|属性值提升/i.test(n)),
      subclass: cls.subclassLevel === level,
      slots: null,
      pact: null,
      hpAverage: hitDie ? Math.floor(hitDie / 2) + 1 : 0,
    })
  }
  let slotsReadable = false
  let cantrips: number[] | null = null
  let spellsKnown: number[] | null = null
  for (const group of tableGroups(d)) {
    const labels = Array.isArray(group.colLabels) ? group.colLabels.map(String) : []
    if (Array.isArray(group.rowsSpellProgression)) {
      const rows = (group.rowsSpellProgression as unknown[][]).map((r) => r.map(Number))
      if (rows.length >= 20) {
        slotsReadable = true
        for (let i = 0; i < 20; i++) levels[i].slots = rows[i] ?? null
      }
      continue
    }
    const rows = groupRows(group)
    if (!rows || rows.length < 20) continue
    const pactCount = labelIndex(labels, '法术位', '环阶')
    const pactLevel = labelIndex(labels, '法术位环阶')
    if (pactCount >= 0 && pactLevel >= 0) {
      slotsReadable = true
      for (let i = 0; i < 20; i++) {
        const text = String(rows[i]?.[pactLevel] ?? '')
        const m = text.match(/level=(\d+)/) ?? text.match(/(\d+)\s*环/)
        levels[i].pact = { count: Number(rows[i]?.[pactCount] ?? 0), level: m ? Number(m[1]) : null }
      }
      continue
    }
    const cantrip = labelIndex(labels, '戏法')
    if (cantrip >= 0 && !cantrips) cantrips = numberRows({ rows: rows.map((r) => [r[cantrip]]) })
    const known = labelIndex(labels, '已知法术', '戏法')
    if (known >= 0 && !spellsKnown) spellsKnown = numberRows({ rows: rows.map((r) => [r[known]]) })
  }
  return { name: classEntry.name, nameEn: classEntry.nameEn, hitDie, subclassLevel: cls.subclassLevel, levels, cantrips, spellsKnown, slotsReadable }
}

