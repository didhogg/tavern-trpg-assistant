import type { Entry } from '../../../src/schemas/pack'
import type { TextBlock } from '../../../src/schemas/text'
import type { PlannedEntry } from './plan'
import type { ConvertContext } from './context'
import { creditFor, keywordsOf, pageOf, parseFraction, str } from './common'
import { convertBlocks } from './blocks'
import { renderInline } from '../markup/inline'
import { activitiesFromText } from './activities'
import { plainText, summaryOf } from '../summary/summary'
import type { InlineContext } from '../markup/inline'

function creatureType(raw: Record<string, unknown>): { type: string; tags: string[]; swarm?: boolean } {
  const value = raw.type
  if (typeof value === 'string') return { type: value, tags: [] }
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>
    return { type: str(obj.type) || 'unknown', tags: Array.isArray(obj.tags) ? obj.tags.map(String) : [], ...(obj.swarm === true ? { swarm: true } : {}) }
  }
  return { type: 'unknown', tags: [] }
}

function acOf(raw: Record<string, unknown>): Array<{ value: number; from?: string }> {
  const list = Array.isArray(raw.ac) ? raw.ac : []
  if (!list.length) return [{ value: 10, from: '未给出数值' }]
  return list.map((item) => {
    if (typeof item === 'number') return { value: item }
    const obj = item as Record<string, unknown>
    const value = Number(obj.ac ?? obj.value ?? 10)
    const from = str(obj.from) || str(obj.special)
    return { value: Number.isFinite(value) ? value : 10, ...(from ? { from } : {}) }
  })
}

function speedOf(raw: Record<string, unknown>): Record<string, number | boolean> {
  const value = raw.speed
  if (typeof value === 'number') return { walk: value }
  if (value && typeof value === 'object') {
    const out: Record<string, number | boolean> = {}
    for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
      if (typeof v === 'number') out[key] = v
      else if (typeof v === 'boolean') out[key] = v
      else if (v && typeof v === 'object' && typeof (v as Record<string, unknown>).number === 'number') out[key] = Number((v as Record<string, unknown>).number)
    }
    return out
  }
  return { walk: 0 }
}

function names(value: unknown, inline: InlineContext): string[] {
  if (!Array.isArray(value)) return []
  return value.map((item) => renderInline(typeof item === 'string' ? item : str((item as Record<string, unknown>).name) || JSON.stringify(item), inline))
}

function signedMap(value: unknown): Record<string, number> | undefined {
  if (!value || typeof value !== 'object') return undefined
  const out: Record<string, number> = {}
  for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
    if (typeof v === 'number') out[key] = v
    else if (typeof v === 'string') {
      const n = Number(v.replace(/[^\d+-]/g, ''))
      if (Number.isFinite(n)) out[key] = n
    }
  }
  return Object.keys(out).length ? out : undefined
}

function skillsOf(raw: Record<string, unknown>): Record<string, number> | undefined {
  return signedMap(raw.skill)
}

function namedActions(value: unknown, inline: InlineContext, entry: PlannedEntry): Array<{ name: string; text: TextBlock[]; activities?: unknown[] }> {
  if (!Array.isArray(value)) return []
  return value.map((item, index) => {
    const obj = item as Record<string, unknown>
    const name = renderInline(str(obj.name) || `行动 ${index + 1}`, inline)
    const text = convertBlocks(obj.entries, inline)
    const activities = activitiesFromText(obj.entries, name, `${entry.id}.${index}`)
    return { name, text, ...(activities.length ? { activities } : {}) }
  })
}

function spellcastingOf(raw: Record<string, unknown>, inline: InlineContext): Array<Record<string, unknown>> {
  const list = Array.isArray(raw.spellcasting) ? raw.spellcasting : []
  return list.map((item) => {
    const obj = item as Record<string, unknown>
    return {
      ability: str(obj.ability) || 'int',
      ...(typeof obj.dc === 'number' ? { dc: obj.dc } : {}),
      ...(typeof obj.attack === 'number' ? { attack: obj.attack } : {}),
      atWill: names(obj.will, inline),
      perDay: Object.fromEntries(Object.entries((obj.daily ?? {}) as Record<string, unknown>).map(([k, v]) => [k, names(v, inline)])),
      slots: Object.fromEntries(Object.entries((obj.slots ?? {}) as Record<string, unknown>).map(([k, v]) => [k, Number(v)])),
      name: renderInline(str(obj.name), inline),
      text: convertBlocks([...(Array.isArray(obj.headerEntries) ? obj.headerEntries : []), ...(Array.isArray(obj.entries) ? obj.entries : [])], inline),
    }
  })
}

export function convertMonster(entry: PlannedEntry, ctx: ConvertContext, inline: InlineContext): Entry {
  const raw = entry.raw
  const text = convertBlocks(raw.entries, inline)
  const actions = namedActions(raw.action, inline, entry)
  const legendaryRaw = raw.legendary as Record<string, unknown> | undefined
  const legendaryActions = namedActions(legendaryRaw?.legendaryActions, inline, entry)
  const data: Record<string, unknown> = {
    src: pageOf(entry),
    credit: creditFor(entry, ctx.bookMachine.get(entry.source) ?? false),
    text,
    size: Array.isArray(raw.size) ? raw.size.map(String) : [String(raw.size ?? 'M')],
    creatureType: creatureType(raw),
    ...(Array.isArray(raw.alignment) ? { alignment: raw.alignment.map(String).join(' ') } : str(raw.alignment) ? { alignment: str(raw.alignment) } : {}),
    ac: acOf(raw),
    hp: hpOf(raw),
    speed: speedOf(raw),
    abilities: { str: Number(raw.str ?? 0), dex: Number(raw.dex ?? 0), con: Number(raw.con ?? 0), int: Number(raw.int ?? 0), wis: Number(raw.wis ?? 0), cha: Number(raw.cha ?? 0) },
    ...(signedMap(raw.save) ? { saves: signedMap(raw.save) } : {}),
    ...(skillsOf(raw) ? { skills: skillsOf(raw) } : {}),
    senses: names(raw.senses, inline),
    ...(typeof raw.passive === 'number' ? { passive: raw.passive } : {}),
    languages: names(raw.languages, inline),
    cr: crOf(raw),
    ...(typeof raw.xp === 'number' ? { xp: raw.xp } : {}),
    resist: names(raw.resist, inline),
    immune: names(raw.immune, inline),
    vulnerable: names(raw.vulnerable, inline),
    conditionImmune: names(raw.conditionImmune, inline),
    traits: namedActions(raw.trait, inline, entry),
    actions,
    bonusActions: namedActions(raw.bonus, inline, entry),
    reactions: namedActions(raw.reaction, inline, entry),
    ...(legendaryRaw ? { legendary: { count: Number(legendaryRaw.count ?? 0), actions: legendaryActions } } : {}),
    ...(Array.isArray(raw.mythic) ? { mythic: namedActions(raw.mythic, inline, entry) } : {}),
    spellcasting: spellcastingOf(raw, inline),
  }
  const unique = raw.isNamedCreature === true
  return { id: entry.id, type: 'monster', name: entry.name, nameEn: entry.nameEn, keywords: keywordsOf(entry), unique, summary: summaryOf('monster', entry.name, data, plainText(text)), data }
}

function hpOf(raw: Record<string, unknown>): { average: number; formula?: string; special?: string } {
  const hp = (raw.hp ?? {}) as Record<string, unknown>
  const formula = str(hp.formula)
  const special = str(hp.special)
  return { average: Number(hp.average ?? 0), ...(formula ? { formula } : {}), ...(special ? { special } : {}) }
}

function crOf(raw: Record<string, unknown>): number | { value: number; lair?: number; coven?: number } {
  const cr = raw.cr
  if (cr && typeof cr === 'object') {
    const obj = cr as Record<string, unknown>
    return {
      value: parseFraction(obj.cr ?? obj.value),
      ...(obj.lair !== undefined ? { lair: parseFraction(obj.lair) } : {}),
      ...(obj.coven !== undefined ? { coven: parseFraction(obj.coven) } : {}),
    }
  }
  return parseFraction(cr)
}
