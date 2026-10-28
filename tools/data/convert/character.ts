import type { Entry } from '../../../src/schemas/pack'
import type { PlannedEntry } from './plan'
import type { ConvertContext } from './context'
import { CLASS_PRIMARY } from '../config/books'
import { creditFor, keywordsOf, pageOf, str } from './common'
import { convertBlocks } from './blocks'
import { activitiesFromText } from './activities'
import { clip, plainText, summaryOf } from '../summary/summary'
import { prereqToRequires } from './character2'
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

function progressionOf(value: string): 'full' | 'half' | 'third' | 'pact' {
  if (value === 'full' || value === 'pact') return value
  if (value === '1/3') return 'third'
  if (value === '1/2' || value === 'artificer') return 'half'
  return 'full'
}

function proficienciesOf(value: unknown, inline: InlineContext): Record<string, unknown> {
  const prof = (value ?? {}) as Record<string, unknown>
  const skills = Array.isArray(prof.skills) ? ((prof.skills[0] as Record<string, unknown> | undefined)?.choose as Record<string, unknown> | undefined) : undefined
  return {
    armor: Array.isArray(prof.armor) ? prof.armor.map((v) => renderInline(String(v), inline)) : [],
    weapons: Array.isArray(prof.weapons) ? prof.weapons.map((v) => renderInline(String(v), inline)) : [],
    tools: Array.isArray(prof.tools) ? prof.tools.map((v) => renderInline(String(v), inline)) : [],
    ...(skills ? { skills: { choose: Number(skills.count ?? 0), from: Array.isArray(skills.from) ? skills.from.map(String) : [] } } : {}),
  }
}

function classTable(raw: Record<string, unknown>, inline: InlineContext): Record<string, unknown> | undefined {
  const groups = Array.isArray(raw.classTableGroups) ? raw.classTableGroups : []
  if (!groups.length) return undefined
  const cols: string[] = []
  for (const group of groups) {
    const g = group as Record<string, unknown>
    const labels = Array.isArray(g.colLabels) ? g.colLabels.map((l) => renderInline(String(l), inline)) : []
    if (g.title) cols.push(str(g.title))
    cols.push(...labels)
  }
  const rows: Array<{ level: number; values: string[] }> = []
  for (let level = 1; level <= 20; level++) {
    const values: string[] = []
    for (const group of groups) {
      const g = group as Record<string, unknown>
      const list = Array.isArray(g.rows) ? g.rows : Array.isArray(g.rowsSpellProgression) ? g.rowsSpellProgression : []
      const row = Array.isArray(list[level - 1]) ? (list[level - 1] as unknown[]) : []
      if (g.title) values.push('')
      values.push(...row.map((v) => renderInline(String(v), inline)))
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
    startingEquipment: Array.isArray((raw.startingEquipment as Record<string, unknown> | undefined)?.default) ? ((raw.startingEquipment as Record<string, unknown>).default as string[]).map((v) => renderInline(v, inline)) : [],
    ...(str(raw.spellcastingAbility) ? { spellcasting: { ability: str(raw.spellcastingAbility), progression: progressionOf(str(raw.casterProgression)), preparation: raw.preparedSpells ? 'prepared' : 'known' } } : {}),
    ...(classTable(raw, inline) ? { table: classTable(raw, inline) } : {}),
    subclassLevel,
    subclassTitle: str(raw.subclassTitle) || `${className}子职业`,
    ...(multiclass ? { multiclass: { requires: multiclassRequires(multiclass) ?? { all: [{ text: '见原书兼职规则' }] }, ...(multiclass.proficienciesGained ? { proficiencies: proficienciesOf(multiclass.proficienciesGained, inline) } : {}) } } : {}),
    advancement: [
      ...features.filter((f) => f.level > 0).map((f) => ({ kind: 'itemGrant', level: f.level, items: [f.id], optional: false })),
      ...features.filter((f) => f.name.includes('属性值提升')).map((f) => ({ kind: 'abilityScoreImprovement', level: f.level, points: 2 })),
      { kind: 'subclass', level: subclassLevel },
    ],
  }
  return { id: entry.id, type: 'class', name: entry.name, nameEn: entry.nameEn, keywords: keywordsOf(entry), unique: false, summary: summaryOf('class', entry.name, data, plainText(data.text as never)), data }
}

export function convertSubclass(entry: PlannedEntry, ctx: ConvertContext, inline: InlineContext): Entry {
  const raw = entry.raw
  const features = ctx.featuresByOwner.get(entry.id) ?? []
  const data: Record<string, unknown> = {
    src: pageOf(entry),
    credit: creditFor(entry, ctx.bookMachine.get(entry.source) ?? false),
    text: convertBlocks(raw.entries, inline),
    classId: entry.context.classId ?? '',
    ...(str(raw.spellcastingAbility) ? { spellcasting: { ability: str(raw.spellcastingAbility), progression: 'full' } } : {}),
    ...(expandedSpells(raw, ctx) ? { expandedSpells: expandedSpells(raw, ctx) } : {}),
    advancement: features.map((f) => ({ kind: 'itemGrant', level: f.level, items: [f.id], optional: false })),
  }
  return { id: entry.id, type: 'subclass', name: entry.name, nameEn: entry.nameEn, keywords: keywordsOf(entry), unique: false, summary: summaryOf('subclass', entry.name, data, plainText(data.text as never)), data }
}

const FEATURE_TYPES: Record<string, string> = { 'FS:F': '战斗风格', 'MV:B': '战技', EI: '魔能祈唤', AS: '奥秘', ED: '元素戒律', PB: '契约恩赐' }

function featureType(raw: Record<string, unknown>): string | undefined {
  const list = Array.isArray(raw.featureType) ? raw.featureType.map(String) : []
  if (!list.length) return undefined
  return list.map((code) => FEATURE_TYPES[code] ?? code).join('、')
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
  const data: Record<string, unknown> = {
    src: pageOf(entry),
    credit: creditFor(entry, ctx.bookMachine.get(entry.source) ?? false),
    text: convertBlocks(raw.entries, inline),
    owner: { type: entry.context.ownerType ?? 'optional', id: entry.context.ownerId ?? 'optional' },
    ...(typeof raw.level === 'number' ? { level: raw.level } : {}),
    ...(featureType(raw) ? { featureType: featureType(raw) } : {}),
    ...(raw.uses ? { uses: raw.uses } : {}),
    ...(raw.prerequisite ? { requires: prereqToRequires(raw.prerequisite, ctx) } : {}),
    ...(choicesOf(raw) ? { choices: choicesOf(raw) } : {}),
    ...(entry.context.ownerType === 'optional' ? { optional: true } : {}),
    activities: activitiesFromText(raw.entries, entry.name, entry.id),
  }
  const owner = entry.context.ownerType === 'class' ? str(raw.className) : entry.context.ownerType === 'subclass' ? `${str(raw.className)}·${str(raw.subclassShortName)}` : ''
  const level = typeof raw.level === 'number' ? `${raw.level}级` : ''
  const first = plainText(data.text as never).split(/[。！？.!?]/)[0] ?? ''
  const summary = owner ? clip([entry.name, `${owner} ${level}`.trim(), first].filter(Boolean).join('｜')) : summaryOf('feature', entry.name, data, plainText(data.text as never))
  return { id: entry.id, type: 'feature', name: entry.name, nameEn: entry.nameEn, keywords: keywordsOf(entry), unique: false, summary, data }
}
