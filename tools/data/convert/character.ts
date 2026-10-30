import type { Entry } from '../../../src/schemas/pack'
import type { PlannedEntry } from './plan'
import type { ConvertContext } from './context'
import { CLASS_PRIMARY } from '../config/books'
import { creditFor, keywordsOf, pageOf, str } from './common'
import { convertBlocks } from './blocks'
import { activitiesFromText } from './activities'
import { clip, plainText, summaryOf } from '../summary/summary'
import { spellGrants, startingEquipmentOf } from './character2'
import { prereqToRequires } from './featRule'
import { dedupeEffects, foundryFeature, foundryRulesFor, usesFromText } from './foundry'
import { FEATURE_ACTIVITIES, FEATURE_EFFECTS, FEATURE_NO_USES, FEATURE_USES } from '../config/featureRules'
import { PROFICIENCY_TRAITS } from '../config/proficiencyTraits'
import { advancementExtras, foundryScaleValues, scaleValuesOf, spellcastingOf } from './classRules'
import type { InlineContext } from '../markup/inline'
import { renderInline } from '../markup/inline'

function multiclassRequires(raw: Record<string, unknown> | undefined): Record<string, unknown> | undefined {
  if (!raw || typeof raw.requirements !== 'object' || !raw.requirements) return undefined
  const req = raw.requirements as Record<string, unknown>
  const all: Array<Record<string, unknown>> = []
  if (Array.isArray(req.or)) {
    for (const item of req.or) {
      const map = item as Record<string, unknown>
      const next: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(map)) if (typeof value === 'number') next[key] = value
      if (Object.keys(next).length) all.push({ ability: next })
    }
  }
  for (const [key, value] of Object.entries(req)) if (typeof value === 'number') all.push({ ability: { [key]: value } })
  return all.length ? { all } : undefined
}

const ALL_SKILLS = [
  'acrobatics', 'animal handling', 'arcana', 'athletics', 'deception', 'history', 'insight', 'intimidation', 'investigation',
  'medicine', 'nature', 'perception', 'performance', 'persuasion', 'religion', 'sleight of hand', 'stealth', 'survival',
]
const WEAPON_GROUP: Record<string, string> = { simple: '简易', martial: '军用', firearms: '火器' }

/** 熟练项可能是文字，也可能是 { proficiency, optional? }。 */
function proficiencyText(value: unknown, inline: InlineContext, kind: 'armor' | 'weapons' | 'tools'): string {
  if (value && typeof value === 'object') {
    const id = str((value as Record<string, unknown>).proficiency)
    if (!id) throw new Error(`职业熟练项出现未知写法：${JSON.stringify(value)}`)
    return kind === 'weapons' ? (WEAPON_GROUP[id] ?? id) : id
  }
  return renderInline(String(value), inline)
}

function skillChoice(list: unknown): { choose: number; from: string[] } | undefined {
  if (!Array.isArray(list) || !list.length) return undefined
  const first = list[0] as Record<string, unknown>
  const choose = first.choose as Record<string, unknown> | undefined
  if (choose) return { choose: Number(choose.count ?? 0), from: Array.isArray(choose.from) ? choose.from.map(String) : [] }
  if (typeof first.any === 'number') return { choose: first.any, from: [...ALL_SKILLS] }
  return undefined
}

function proficienciesOf(value: unknown, inline: InlineContext): Record<string, unknown> {
  const prof = (value ?? {}) as Record<string, unknown>
  const skills = skillChoice(prof.skills)
  const list = (key: 'armor' | 'weapons' | 'tools'): string[] =>
    Array.isArray(prof[key]) ? (prof[key] as unknown[]).map((v) => proficiencyText(v, inline, key)) : []
  return {
    armor: list('armor'),
    weapons: list('weapons'),
    tools: list('tools'),
    ...(skills ? { skills } : {}),
  }
}

/** 等级表单元格：字符串、数字，或带类型的对象（加值、骰子、速度加值）。 */
function cellText(value: unknown, inline: InlineContext): string {
  if (value && typeof value === 'object') {
    const cell = value as Record<string, unknown>
    if (cell.type === 'bonus') return `+${Number(cell.value ?? 0)}`
    if (cell.type === 'bonusSpeed') return Number(cell.value ?? 0) ? `+${Number(cell.value)}尺` : '—'
    if (cell.type === 'dice' && Array.isArray(cell.toRoll)) {
      return cell.toRoll.map((d) => `${Number((d as Record<string, unknown>).number ?? 1)}d${Number((d as Record<string, unknown>).faces ?? 0)}`).join('+')
    }
    throw new Error(`职业等级表出现未知单元格：${JSON.stringify(value)}`)
  }
  return renderInline(String(value), inline)
}

function classTable(raw: Record<string, unknown>, inline: InlineContext): Record<string, unknown> | undefined {
  const groups = Array.isArray(raw.classTableGroups) ? raw.classTableGroups : []
  if (!groups.length) return undefined
  const cols: string[] = []
  for (const group of groups) {
    const g = group as Record<string, unknown>
    const labels = Array.isArray(g.colLabels) ? g.colLabels.map((l) => renderInline(String(l), inline)) : []
    cols.push(...labels.map((label) => (g.title ? `${str(g.title)}·${label}` : label)))
  }
  const rows: Array<{ level: number; values: string[] }> = []
  for (let level = 1; level <= 20; level++) {
    const values: string[] = []
    for (const group of groups) {
      const g = group as Record<string, unknown>
      const list = Array.isArray(g.rows) ? g.rows : Array.isArray(g.rowsSpellProgression) ? g.rowsSpellProgression : []
      const row = Array.isArray(list[level - 1]) ? (list[level - 1] as unknown[]) : []
      values.push(...row.map((v) => cellText(v, inline)))
    }
    rows.push({ level, values })
  }
  return { cols, rows }
}

function expandedSpells(raw: Record<string, unknown>, ctx: ConvertContext): Array<{ level: number; spells: string[] }> | undefined {
  const list = Array.isArray(raw.additionalSpells) ? raw.additionalSpells : []
  const out = new Map<number, string[]>()
  for (const item of list) {
    if (!item || typeof item !== 'object') continue
    for (const group of Object.values(item as Record<string, unknown>)) {
      if (!group || typeof group !== 'object') continue
      for (const [key, spells] of Object.entries(group as Record<string, unknown>)) {
        if (!Array.isArray(spells)) continue
        const numeric = Number(key.replace(/^s/, ''))
        if (!Number.isFinite(numeric)) continue
        const level = numeric
        const ids = spells.map((name) => ctx.resolveEntryId('spell', String(name))).filter((id): id is string => !!id)
        if (ids.length) out.set(level, [...(out.get(level) ?? []), ...ids])
      }
    }
  }
  return out.size ? [...out].sort(([a], [b]) => a - b).map(([level, spells]) => ({ level, spells })) : undefined
}

function mergeAdvancement(items: Array<Record<string, unknown>>): Array<Record<string, unknown>> {
  const out: Array<Record<string, unknown>> = []
  const index = new Map<string, Record<string, unknown>>()
  for (const item of items) {
    const kind = String(item.kind)
    const level = String(item.level ?? '')
    const key = kind === 'itemGrant'
      ? `${kind}|${level}|${String(item.optional ?? false)}|${String(item.replaces ?? '')}`
      : `${kind}|${level}|${String(item.id ?? item.featureType ?? '')}`
    const current = index.get(key)
    if (current && kind === 'itemGrant') {
      current.items = [...new Set([...(current.items as string[]), ...((item.items as string[] | undefined) ?? [])])]
      continue
    }
    if (current) continue
    const copy = { ...item }
    index.set(key, copy)
    out.push(copy)
  }
  return out
}

function optionRefs(raw: Record<string, unknown>): { level: number; count: number; names: string[] }[] {
  const out: Array<{ level: number; count: number; names: string[] }> = []
  const walk = (value: unknown): void => {
    if (Array.isArray(value)) return value.forEach(walk)
    if (!value || typeof value !== 'object') return
    const rec = value as Record<string, unknown>
    if (rec.type === 'options' && Array.isArray(rec.entries)) {
      const names = rec.entries.flatMap((x) => {
        const r = x as Record<string, unknown>
        if (r.type !== 'refSubclassFeature' && r.type !== 'refClassFeature') return []
        const text = str(r.subclassFeature) || str(r.classFeature)
        return text ? [text.split('|')[0]] : []
      }).filter(Boolean)
      if (names.length) out.push({ level: Number(raw.level ?? 0), count: Number(rec.count ?? 1), names })
    }
    for (const item of Object.values(rec)) walk(item)
  }
  walk(raw.entries)
  return out
}

export function convertClass(entry: PlannedEntry, ctx: ConvertContext, inline: InlineContext): Entry {
  const raw = entry.raw
  const className = str(raw.name)
  const classSlug = entry.nameEn.toLowerCase()
  const primary = CLASS_PRIMARY[classSlug] ?? ['str']
  const features = ctx.featuresByOwner.get(entry.id) ?? []
  const subclassLevel = ctx.subclassLevelByClass.get(entry.id) ?? 3
  const multiclass = raw.multiclassing as Record<string, unknown> | undefined
  const proficiencies = proficienciesOf(raw.startingProficiencies, inline)
  const data: Record<string, unknown> = {
    src: pageOf(entry),
    credit: creditFor(entry, ctx.bookMachine.get(entry.source) ?? false),
    text: convertBlocks(raw.entries, inline),
    hitDie: Number((raw.hd as Record<string, unknown> | undefined)?.faces ?? 8),
    primaryAbility: primary,
    saves: (Array.isArray(raw.proficiency) ? raw.proficiency : []).map(String),
    proficiencies,
    startingEquipment: startingEquipmentOf(raw),
    ...(spellcastingOf(raw, false) ? { spellcasting: spellcastingOf(raw, false) } : {}),
    ...(classTable(raw, inline) ? { table: classTable(raw, inline) } : {}),
    subclassLevel,
    subclassTitle: str(raw.subclassTitle) || `${className}子职业`,
    ...(multiclass ? { multiclass: { requires: multiclassRequires(multiclass) ?? { all: [{ text: '见原书兼职规则' }] }, ...(multiclass.proficienciesGained ? { proficiencies: proficienciesOf(multiclass.proficienciesGained, inline) } : {}) } } : {}),
    advancement: mergeAdvancement([
      ...features.filter((f) => f.level > 0).map((f) => {
        const featureId = f.id || ctx.resolveEntryId('feature', f.name) || ''
        if ((f.raw as Record<string, unknown>).isClassFeatureVariant !== true) return { kind: 'itemGrant', level: f.level, items: [featureId], optional: false }
        const text = JSON.stringify((f.raw as Record<string, unknown>).entries ?? '')
        const match = /替代([^，。；、]+?)特性/.exec(text)
        const target = match ? features.find((x) => x.name === match[1] && x.id !== f.id)?.id : undefined
        return { kind: 'itemGrant', level: f.level, items: [featureId], optional: 'tce-ocf', ...(target ? { replaces: target } : {}) }
      }),
      ...features.filter((f) => f.name.includes('属性值提升')).map((f) => ({ kind: 'abilityScoreImprovement', level: f.level, points: 2, explain: f.id })),
      ...features.flatMap((f) => PROFICIENCY_TRAITS[f.id] ? [{ kind: 'trait', level: f.level, grants: PROFICIENCY_TRAITS[f.id].grants ?? [], choices: PROFICIENCY_TRAITS[f.id].choices ?? [] }] : []),
      ...features.filter((f) => f.name.includes('专精')).map((f) => ({ kind: 'expertise', level: f.level, count: 2, from: 'proficient' })),
      { kind: 'subclass', level: subclassLevel, ...(() => { const all = [...ctx.featuresByOwner.values()].flat(); const candidates = all.filter((x) => String((x.raw as Record<string, unknown>).className ?? '') === className && Number((x.raw as Record<string, unknown>).level ?? 0) === subclassLevel); const f = candidates.find((x) => /道途|范型/.test(x.name)) ?? candidates[0]; return f ? { explain: f.id } : {} })() },
      ...scaleValuesOf(raw),
      ...foundryScaleValues(ctx, entry),
      ...advancementExtras(raw),
    ]),
  }
  return { id: entry.id, type: 'class', name: entry.name, nameEn: entry.nameEn, keywords: keywordsOf(entry), unique: false, summary: summaryOf('class', entry.name, data, plainText(data.text as never)), data }
}

export function convertSubclass(entry: PlannedEntry, ctx: ConvertContext, inline: InlineContext): Entry {
  const raw = entry.raw
  const features = ctx.featuresByOwner.get(entry.id) ?? []
  const optionNames = new Set<string>()
  const choices: Array<Record<string, unknown>> = []
  for (const feature of features) for (const choice of optionRefs(feature.raw)) {
    const pool = choice.names.map((name) => features.find((f) => f.name === name && f.level === choice.level)?.id ?? features.find((f) => f.name === name)?.id ?? ctx.resolveEntryId('feature', name)).filter((id): id is string => !!id)
    for (const name of choice.names) optionNames.add(name)
    if (pool.length) choices.push({ kind: 'itemChoice', level: choice.level || feature.level, count: choice.count, pool })
  }
  const data: Record<string, unknown> = {
    src: pageOf(entry),
    credit: creditFor(entry, ctx.bookMachine.get(entry.source) ?? false),
    text: (() => { const own = convertBlocks(raw.entries, inline); if (own.length) return own; const minLevel = Math.min(...features.filter((f) => f.level > 0).map((f) => f.level)); const intro = features.find((f) => f.level === minLevel && (f.name === entry.name || f.name === str(raw.shortName))); return intro ? convertBlocks(intro.raw.entries, inline) : [] })(),
    classId: entry.context.classId ?? '',
    ...(spellcastingOf(raw, true) ? { spellcasting: spellcastingOf(raw, true) } : {}),
    ...(expandedSpells(raw, ctx) ? { expandedSpells: expandedSpells(raw, ctx) } : {}),
    advancement: mergeAdvancement([
      ...features.filter((f) => !optionNames.has(f.name)).map((f) => ({ kind: 'itemGrant', level: f.level, items: [f.id], optional: false })),
      ...features.flatMap((f) => PROFICIENCY_TRAITS[f.id] ? [{ kind: 'trait', level: f.level, grants: PROFICIENCY_TRAITS[f.id].grants ?? [], choices: PROFICIENCY_TRAITS[f.id].choices ?? [] }] : []),
      ...choices,
      ...foundryScaleValues(ctx, entry),
    ]),
  }
  return { id: entry.id, type: 'subclass', name: entry.name, nameEn: entry.nameEn, keywords: keywordsOf(entry), unique: false, summary: summaryOf('subclass', entry.name, data, plainText(data.text as never)), data }
}

const FEATURE_TYPES: Record<string, string> = { 'FS:F': '战斗风格', 'MV:B': '战技', EI: '魔能祈唤', AS: '奥秘', ED: '元素戒律', PB: '契约恩赐' }

function featureType(raw: Record<string, unknown>): string | undefined {
  const list = Array.isArray(raw.featureType) ? raw.featureType.map(String) : []
  if (!list.length) return undefined
  return list.map((code) => FEATURE_TYPES[code] ?? code).join('、')
}

function roleOf(name: string): 'mechanic' | 'procedure' | 'intro' {
  if (/属性值提升|道途特性|范型特性|子职业特性|选择.*(子职业|道途|范型)/.test(name)) return 'procedure'
  return 'mechanic'
}

function optionKinds(raw: Record<string, unknown>): string[] | undefined {
  const list = Array.isArray(raw.featureType) ? raw.featureType.map(String) : []
  return list.length ? list : undefined
}

function choicesOf(raw: Record<string, unknown>): Array<{ name: string; count: number; pool: string[] }> | undefined {
  const out: Array<{ name: string; count: number; pool: string[] }> = []
  const walk = (value: unknown): void => {
    if (Array.isArray(value)) return value.forEach(walk)
    if (!value || typeof value !== 'object') return
    const obj = value as Record<string, unknown>
    if (obj.type === 'options' && Array.isArray(obj.entries)) {
      const pool = obj.entries.map((item) => str((item as Record<string, unknown>).optionalfeature) || str((item as Record<string, unknown>).name)).filter(Boolean)
      out.push({ name: str(obj.name) || '选择', count: Number(obj.count ?? 1), pool })
    }
    for (const child of Object.values(obj)) walk(child)
  }
  walk(raw.entries)
  return out.length ? out : undefined
}

export function convertFeature(entry: PlannedEntry, ctx: ConvertContext, inline: InlineContext): Entry {
  const raw = entry.raw
  const ownerType = entry.context.ownerType ?? 'optional'
  const foundryRaw = foundryFeature({
    classFeatures: ctx.foundryClassFeatures,
    subclassFeatures: ctx.foundrySubclassFeatures,
    feats: ctx.foundryFeats,
    races: ctx.foundryRaces,
    optionalFeatures: ctx.foundryOptionalFeatures,
  }, raw, ownerType, entry.source)
  const rules = foundryRaw ? foundryRulesFor(foundryRaw) : undefined
  for (const [key, value] of rules?.unmapped ?? []) {
    const current = ctx.unmappedFoundry?.get(key) ?? { count: 0, example: entry.id }
    ctx.unmappedFoundry?.set(key, { count: current.count + value.count, example: current.example })
  }
  const text = plainText(convertBlocks(raw.entries, inline))
  const uses = FEATURE_NO_USES.has(entry.id) ? undefined : rules?.uses ?? FEATURE_USES[entry.id] ?? usesFromText(text)
  const configEffects = FEATURE_EFFECTS[entry.id] ?? []
  const spellEffects = spellGrants(raw, ctx).map((g) => ({ kind: 'spellGrant', spells: [g.spell], mode: g.mode, ...(g.ability ? { ability: g.ability } : {}), ...(g.uses ? { uses: g.uses } : {}) }))
  const skillEffects: Array<Record<string, unknown>> = []
  for (const item of Array.isArray(raw.skillProficiencies) ? raw.skillProficiencies : []) {
    if (!item || typeof item !== 'object') continue
    for (const [skill, value] of Object.entries(item as Record<string, unknown>)) if (value === true) skillEffects.push({ kind: 'skill', skill, level: 'proficient' })
  }
  const effects = dedupeEffects([...(rules?.effects ?? []) as unknown as Array<Record<string, unknown>>, ...configEffects, ...spellEffects, ...skillEffects])
  const baseActivities = rules?.activities?.length ? rules.activities : activitiesFromText(raw.entries, entry.name, entry.id)
  const configuredActivities = FEATURE_ACTIVITIES[entry.id] ?? []
  const consumes = ownerType === 'optional' ? (Array.isArray(raw.consumes) ? raw.consumes : raw.consumes && typeof raw.consumes === 'object' ? [raw.consumes] : []) : []
  const activities = consumes.length
    ? [...baseActivities, ...configuredActivities, {
        id: `${entry.id}.consume`,
        name: `消耗：${entry.name}`,
        kind: 'utility' as const,
        text: `消耗 ${consumes.map((c) => `${Number((c as Record<string, unknown>).amount ?? (c as Record<string, unknown>).amountMin ?? 1)} ${String((c as Record<string, unknown>).name ?? '资源')}`).join('、')}`,
        activation: { type: 'special' as const },
        consumption: { targets: consumes.map((c) => ({ type: 'resource' as const, value: Number((c as Record<string, unknown>).amount ?? (c as Record<string, unknown>).amountMin ?? 1), target: String((c as Record<string, unknown>).name ?? 'resource') })) },
      }]
    : [...baseActivities, ...configuredActivities]
  const data: Record<string, unknown> = {
    src: pageOf(entry),
    credit: creditFor(entry, ctx.bookMachine.get(entry.source) ?? false),
    text: convertBlocks(raw.entries, inline),
    ...(ownerType !== 'optional' ? { owner: { type: ownerType, id: entry.context.ownerId ?? 'optional' } } : {}),
    ...(optionKinds(raw) ? { optionKind: optionKinds(raw) } : {}),
    ...(typeof raw.level === 'number' ? { level: raw.level } : {}),
    ...(featureType(raw) ? { featureType: featureType(raw) } : {}),
    role: (() => { if (ownerType !== 'subclass') return roleOf(entry.name); const siblings = ctx.featuresByOwner.get(entry.context.ownerId ?? '') ?? []; const min = Math.min(...siblings.filter((f) => f.level > 0).map((f) => f.level)); const subName = ctx.subclassNames.get(entry.context.ownerId ?? ''); const intro = siblings.find((f) => f.level === min && (f.name === subName || f.name === str(raw.subclassShortName))); return intro?.id === entry.id ? 'intro' : roleOf(entry.name) })(),
    ...(uses ? { uses } : {}),
    ...(effects.length ? { effects } : {}),
    ...(raw.prerequisite ? { requires: prereqToRequires(raw.prerequisite, ctx) } : {}),
    ...(choicesOf(raw) ? { choices: choicesOf(raw) } : {}),
    ...((ownerType === 'optional' || raw.isClassFeatureVariant === true) ? { optional: true } : {}),
    activities,
  }
  if (foundryRaw) (data.credit as { structured?: { by: string; license: string } }).structured = { by: '5etools-foundry', license: 'MIT' }
  const owner = ownerType === 'class' ? str(raw.className) : ownerType === 'subclass' ? `${str(raw.className)}·${str(raw.subclassShortName)}` : ''
  const level = typeof raw.level === 'number' ? `${raw.level}级` : ''
  const first = plainText(data.text as never).split(/[。！？.!?]/)[0] ?? ''
  const summary = owner ? clip([entry.name, `${owner} ${level}`.trim(), first].filter(Boolean).join('｜')) : summaryOf('feature', entry.name, data, plainText(data.text as never))
  return { id: entry.id, type: 'feature', name: entry.name, nameEn: entry.nameEn, keywords: keywordsOf(entry), unique: false, summary, data }
}
