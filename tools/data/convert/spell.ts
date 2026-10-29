import type { Entry } from '../../../src/schemas/pack'
import type { PlannedEntry } from './plan'
import type { ConvertContext } from './context'
import { creditFor, keywordsOf, pageOf, str } from './common'
import { convertBlocks } from './blocks'
import { activitiesFromText, damageFromText } from './activities'
import { renderInline } from '../markup/inline'
import { plainText, summaryOf } from '../summary/summary'
import type { InlineContext } from '../markup/inline'

const SCHOOL: Record<string, string> = { A: 'abjuration', C: 'conjuration', D: 'divination', E: 'enchantment', V: 'evocation', I: 'illusion', N: 'necromancy', T: 'transmutation' }
const TIME_UNIT: Record<string, 'action' | 'bonus' | 'reaction' | 'minute' | 'hour'> = { action: 'action', bonus: 'bonus', reaction: 'reaction', minute: 'minute', hour: 'hour' }

function rangeOf(raw: Record<string, unknown>): { type: string; amount?: number; unit?: string } {
  const range = (raw.range ?? {}) as Record<string, unknown>
  if (typeof range.distance === 'object' && range.distance) {
    const d = range.distance as Record<string, unknown>
    return { type: str(range.type) || 'point', amount: Number(d.amount ?? 0), unit: str(d.type) || 'feet' }
  }
  return { type: str(range.type) || 'special' }
}

function healFromText(value: unknown): string | undefined {
  const text = strings(value).join(' ')
  const match = /(?:恢复|治疗)[^。]{0,60}?(?:@dice |@damage )?(\d+d\d+|\d+)/.exec(text)
  if (!match) return undefined
  return match[1].replace(/\s+/g, '')
}

function strings(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') out.push(value)
  else if (Array.isArray(value)) for (const item of value) strings(item, out)
  else if (value && typeof value === 'object') for (const item of Object.values(value)) strings(item, out)
  return out
}

function classIdsOf(entry: PlannedEntry, ctx: ConvertContext): { classes: string[]; subclasses: string[] } {
  const lookup = ctx.spellLookup[entry.source.toLowerCase()] as Record<string, unknown> | undefined
  const info = lookup?.[entry.name] as Record<string, unknown> | undefined
  const classes = new Set<string>()
  const subclasses = new Set<string>()
  const classMap = info?.class as Record<string, Record<string, unknown>> | undefined
  if (classMap) {
    for (const [classSource, byClass] of Object.entries(classMap)) {
      for (const [className, present] of Object.entries(byClass)) {
        if (!present) continue
        const id = ctx.classIds.get(`${className}|${classSource}`)
        if (id) classes.add(id)
      }
    }
  }
  const variantMap = info?.classVariant as Record<string, Record<string, unknown>> | undefined
  if (variantMap) {
    for (const [classSource, byClass] of Object.entries(variantMap)) {
      for (const className of Object.keys(byClass ?? {})) {
        const id = ctx.classIds.get(`${className}|${classSource}`)
        if (id) classes.add(id)
      }
    }
  }
  const subMap = info?.subclass as Record<string, Record<string, Record<string, Record<string, unknown>>>> | undefined
  if (subMap) {
    for (const [classSource, byClass] of Object.entries(subMap)) {
      for (const [className, bySubSource] of Object.entries(byClass ?? {})) {
        for (const [subSource, byName] of Object.entries(bySubSource ?? {})) {
          for (const subName of Object.keys(byName ?? {})) {
            const id = ctx.subclassIds.get(`${className}|${classSource}|${subName}|${subSource}`)
            if (id) subclasses.add(id)
          }
        }
      }
    }
  }
  return { classes: [...classes], subclasses: [...subclasses] }
}

export function convertSpell(entry: PlannedEntry, ctx: ConvertContext, inline: InlineContext): Entry {
  const raw = entry.raw
  const text = convertBlocks(raw.entries, inline)
  if (Array.isArray(raw.entriesHigherLevel)) text.push(...convertBlocks(raw.entriesHigherLevel, inline))
  const time = Array.isArray(raw.time) ? (raw.time[0] as Record<string, unknown> | undefined) : undefined
  const components = (raw.components ?? {}) as Record<string, unknown>
  const m = typeof components.m === 'string' ? { text: components.m } : typeof components.m === 'object' && components.m ? (components.m as Record<string, unknown>) : undefined
  const durations = (Array.isArray(raw.duration) ? raw.duration : []).map((item) => {
    const d = item as Record<string, unknown>
    const nested = (d.duration ?? {}) as Record<string, unknown>
    return {
      type: str(d.type) || 'special',
      ...(nested.amount ? { amount: Number(nested.amount) } : {}),
      ...(nested.type ? { unit: str(nested.type) } : {}),
      concentration: d.concentration === true,
    }
  })
  if (!durations.length) durations.push({ type: 'special', concentration: false })
  const classes = classIdsOf(entry, ctx)
  const textDamage = damageFromText(raw.entries)
  const saveCodes = Array.isArray(raw.savingThrow) ? raw.savingThrow.map((s) => String(s).slice(0, 3)) : []
  const activities = activitiesFromText(raw.entries, entry.name, entry.id)
  const attack = Array.isArray(raw.spellAttack) ? String(raw.spellAttack[0]) : ''
  if (attack && !activities.some((a) => a.kind === 'attack')) {
    activities.push({
      id: `${entry.id}.attack`,
      name: `${entry.name}（攻击）`,
      kind: 'attack',
      attackKind: attack.toUpperCase() === 'M' ? 'ms' : 'rs',
      damage: textDamage,
      activation: { type: 'action' },
    })
  }
  if (saveCodes.length && !activities.some((a) => a.kind === 'save')) {
    activities.push({
      id: `${entry.id}.save`,
      name: `${entry.name}（豁免）`,
      kind: 'save',
      ability: saveCodes[0] as never,
      dc: 'spell',
      onSave: /半伤|伤害减半|一半/.test(plainText(text)) ? 'half' : 'none',
      ...(textDamage.length ? { damage: textDamage } : {}),
      activation: { type: 'action' },
    })
  }
  if (!activities.length && textDamage.length) {
    activities.push({ id: `${entry.id}.damage`, name: entry.name, kind: 'damage', parts: textDamage, activation: { type: 'action' } })
  }
  const heal = healFromText(raw.entries)
  if (heal && !activities.some((a) => a.kind === 'heal')) {
    activities.push({ id: `${entry.id}.heal`, name: `${entry.name}（治疗）`, kind: 'heal', formula: heal, activation: { type: 'action' } })
  }
  const data: Record<string, unknown> = {
    src: pageOf(entry),
    credit: creditFor(entry, ctx.bookMachine.get(entry.source) ?? false),
    text,
    level: Number(raw.level ?? 0),
    school: SCHOOL[str(raw.school)] ?? 'evocation',
    castTime: [{ n: Number(time?.number ?? 1), unit: TIME_UNIT[str(time?.unit)] ?? 'action', ...(str(time?.condition) ? { condition: renderInline(str(time?.condition), inline) } : {}) }],
    range: rangeOf(raw),
    components: { v: components.v === true, s: components.s === true, ...(m ? { m: { text: renderInline(str(m.text), inline) } } : {}) },
    duration: durations,
    ritual: (raw.meta as Record<string, unknown> | undefined)?.ritual === true,
    classes: classes.classes,
    subclasses: classes.subclasses,
    ...(Array.isArray(raw.entriesHigherLevel) ? { higherLevel: plainText(convertBlocks(raw.entriesHigherLevel, inline)).slice(0, 2000) } : {}),
    ...(raw.scalingLevelDice ? { cantripScaling: raw.scalingLevelDice } : {}),
    ...(saveCodes.length ? { save: saveCodes } : {}),
    ...(textDamage.length ? { damage: textDamage } : {}),
    activities,
  }
  const summary = summaryOf('spell', entry.name, data, plainText(text))
  return { id: entry.id, type: 'spell', name: entry.name, nameEn: entry.nameEn, keywords: keywordsOf(entry), unique: false, summary, data }
}
