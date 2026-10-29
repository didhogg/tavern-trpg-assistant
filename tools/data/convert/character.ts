import type { Entry } from '../../../src/schemas/pack'
import type { PlannedEntry } from './plan'
import type { ConvertContext } from './context'
import { CLASS_PRIMARY } from '../config/books'
import { creditFor, keywordsOf, pageOf, str } from './common'
import { convertBlocks } from './blocks'
import { activitiesFromText } from './activities'
import { clip, plainText, summaryOf } from '../summary/summary'
import { prereqToRequires } from './character2'
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
  const seen = new Set<string>()
  return items.filter((item) => {
    const key = `${String(item.kind)}|${String(item.id ?? item.level ?? '')}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
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
    ...(spellcastingOf(raw, false) ? { spellcasting: spellcastingOf(raw, false) } : {}),
    ...(classTable(raw, inline) ? { table: classTable(raw, inline) } : {}),
    subclassLevel,
    subclassTitle: str(raw.subclassTitle) || `${className}子职业`,
    ...(multiclass ? { multiclass: { requires: multiclassRequires(multiclass) ?? { all: [{ text: '见原书兼职规则' }] }, ...(multiclass.proficienciesGained ? { proficiencies: proficienciesOf(multiclass.proficienciesGained, inline) } : {}) } } : {}),
    advancement: mergeAdvancement([
      ...features.filter((f) => f.level > 0).map((f) => ({ kind: 'itemGrant', level: f.level, items: [f.id], optional: false })),
      ...features.filter((f) => f.name.includes('属性值提升')).map((f) => ({ kind: 'abilityScoreImprovement', level: f.level, points: 2 })),
      ...features.filter((f) => f.name.includes('专精')).map((f) => ({ kind: 'expertise', level: f.level, count: 2, from: 'proficient' })),
      { kind: 'subclass', level: subclassLevel },
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
  const data: Record<string, unknown> = {
    src: pageOf(entry),
    credit: creditFor(entry, ctx.bookMachine.get(entry.source) ?? false),
    text: convertBlocks(raw.entries, inline),
    classId: entry.context.classId ?? '',
    ...(spellcastingOf(raw, true) ? { spellcasting: spellcastingOf(raw, true) } : {}),
    ...(expandedSpells(raw, ctx) ? { expandedSpells: expandedSpells(raw, ctx) } : {}),
    advancement: mergeAdvancement([
      ...features.map((f) => ({ kind: 'itemGrant', level: f.level, items: [f.id], optional: false })),
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
