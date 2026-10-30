import type { Entry } from '../../../src/schemas/pack'
import type { TextBlock } from '../../../src/schemas/text'
import type { PlannedEntry } from './plan'
import type { ConvertContext } from './context'
import { creditFor, keywordsOf, pageOf, parseFraction, str } from './common'
import { slug } from '../lib/slug'
import { convertBlocks } from './blocks'
import { inlinePlainText, renderInline } from '../markup/inline'
import { activitiesFromText } from './activities'
import { convertVariants } from './variants'
import { plainText, summaryOf } from '../summary/summary'
import type { InlineContext } from '../markup/inline'

function tagText(tag: unknown): string {
  if (tag && typeof tag === 'object') {
    const t = tag as Record<string, unknown>
    return `${t.prefixHidden === true ? '' : str(t.prefix)}${str(t.tag)}`
  }
  return String(tag)
}

/** 阵营：代码用空格连接；特殊写法与带备注的写法取其文字。 */
function alignmentText(list: unknown[]): string {
  return list
    .map((v) => {
      if (v && typeof v === 'object') {
        const o = v as Record<string, unknown>
        if (typeof o.special === 'string') return o.special
        if (Array.isArray(o.alignment)) return o.alignment.map(String).join(' ')
        return ''
      }
      return String(v)
    })
    .filter(Boolean)
    .join(' ')
}

function creatureType(raw: Record<string, unknown>): { type: string; tags: string[]; swarm?: boolean } {
  const value = raw.type
  if (typeof value === 'string') return { type: value, tags: [] }
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>
    return { type: str(obj.type) || 'unknown', tags: Array.isArray(obj.tags) ? obj.tags.map(tagText) : [], ...(obj.swarm === true ? { swarm: true } : {}) }
  }
  return { type: 'unknown', tags: [] }
}

function acOf(raw: Record<string, unknown>, inline: InlineContext): Array<{ value: number; from?: string; condition?: string; braces?: true }> {
  const list = Array.isArray(raw.ac) ? raw.ac : []
  if (!list.length) return [{ value: 10, from: '未给出数值' }]
  const plain = (text: string): string => inlinePlainText(renderInline(text, inline))
  return list.map((item) => {
    if (typeof item === 'number') return { value: item }
    const obj = item as Record<string, unknown>
    const value = Number(obj.ac ?? obj.value ?? 10)
    const from = (Array.isArray(obj.from) ? obj.from.map(str) : [str(obj.from)]).concat(str(obj.special)).filter(Boolean).map(plain).join('、')
    const condition = plain(str(obj.condition))
    return { value: Number.isFinite(value) ? value : 10, ...(from ? { from } : {}), ...(condition ? { condition } : {}), ...(obj.braces === true ? { braces: true as const } : {}) }
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

/** 抗性、免疫、易伤可能是 { resist/immune/vulnerable/conditionImmune: [...], preNote?, note? } 或 { special }。 */
function resistanceText(item: Record<string, unknown>): string {
  if (typeof item.special === 'string') return item.special
  const list = ['resist', 'immune', 'vulnerable', 'conditionImmune']
    .map((key) => item[key])
    .find((v): v is unknown[] => Array.isArray(v))
  if (!list) throw new Error(`抗性写法无法识别：${JSON.stringify(item)}`)
  const body = list.map((v) => (typeof v === 'string' ? v : resistanceText(v as Record<string, unknown>))).join('、')
  const pre = typeof item.preNote === 'string' ? `${item.preNote} ` : ''
  const note = typeof item.note === 'string' ? (/^[（(]/.test(item.note) ? item.note : `（${item.note}）`) : ''
  return `${pre}${body}${note}`
}

function names(value: unknown, inline: InlineContext): string[] {
  if (!Array.isArray(value)) return []
  return value.map((item) => renderInline(typeof item === 'string' ? item : typeof (item as Record<string, unknown>).name === 'string' ? str((item as Record<string, unknown>).name) : resistanceText(item as Record<string, unknown>), inline))
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

/** { "1e": [法术…] } 这类「次数 → 法术列表」的写法。 */
function listMap(value: unknown, inline: InlineContext): Record<string, string[]> {
  return Object.fromEntries(Object.entries((value ?? {}) as Record<string, unknown>).map(([k, v]) => [k, names(v, inline)]))
}

function spellsByLevel(value: unknown, inline: InlineContext): Record<string, { slots?: number; spells: string[] }> {
  const out: Record<string, { slots?: number; spells: string[] }> = {}
  for (const [level, item] of Object.entries((value ?? {}) as Record<string, unknown>)) {
    const obj = item as Record<string, unknown>
    out[level] = { ...(typeof obj.slots === 'number' ? { slots: obj.slots } : {}), spells: names(obj.spells, inline) }
  }
  return out
}

function spellcastingOf(raw: Record<string, unknown>, inline: InlineContext): Array<Record<string, unknown>> {
  const list = Array.isArray(raw.spellcasting) ? raw.spellcasting : []
  return list.map((item) => {
    const obj = item as Record<string, unknown>
    const extra = (key: string): Record<string, unknown> => (obj[key] ? { [key]: listMap(obj[key], inline) } : {})
    return {
      ability: str(obj.ability) || 'int',
      ...(typeof obj.dc === 'number' ? { dc: obj.dc } : {}),
      ...(typeof obj.attack === 'number' ? { attack: obj.attack } : {}),
      atWill: names(obj.will, inline),
      perDay: listMap(obj.daily, inline),
      slots: Object.fromEntries(Object.entries((obj.slots ?? {}) as Record<string, unknown>).map(([k, v]) => [k, Number(v)])),
      ...(obj.spells ? { spells: spellsByLevel(obj.spells, inline) } : {}),
      ...extra('recharge'),
      ...extra('rest'),
      ...extra('restLong'),
      ...extra('legendary'),
      ...extra('charges'),
      ...(Array.isArray(obj.ritual) ? { ritual: names(obj.ritual, inline) } : {}),
      name: renderInline(str(obj.name), inline),
      text: convertBlocks([...(Array.isArray(obj.headerEntries) ? obj.headerEntries : []), ...(Array.isArray(obj.entries) ? obj.entries : [])], inline),
    }
  })
}

export function convertMonster(entry: PlannedEntry, ctx: ConvertContext, inline: InlineContext): Entry {
  const raw = entry.raw
  const groupRef = raw.legendaryGroup as Record<string, unknown> | undefined
  const group = groupRef ? (ctx.legendaryGroups.find((g) => String(g.name) === String(groupRef.name) && String(g.source) === String(groupRef.source)) ?? ctx.legendaryGroups.find((g) => String(g.name) === String(groupRef.name) || String(g.ENG_name) === String(groupRef.ENG_name))) : undefined
  const text = convertBlocks(raw.entries, inline)
  const variants = convertVariants(raw._variants, inline)
  const actions = namedActions(raw.action, inline, entry)
  const legendaryRaw = Array.isArray(raw.legendary) ? raw.legendary : undefined
  const legendaryActions = namedActions(legendaryRaw, inline, entry)
  const data: Record<string, unknown> = {
    src: pageOf(entry),
    credit: creditFor(entry, ctx.bookMachine.get(entry.source) ?? false),
    text,
    size: Array.isArray(raw.size) ? raw.size.map(String) : [String(raw.size ?? 'M')],
    creatureType: creatureType(raw),
    ...(Array.isArray(raw.alignment) ? { alignment: alignmentText(raw.alignment) } : str(raw.alignment) ? { alignment: str(raw.alignment) } : {}),
    ac: acOf(raw, inline),
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
    ...(legendaryRaw ? { legendary: { count: Number(raw.legendaryActions ?? 3), actions: legendaryActions, ...(group ? { lairActions: convertBlocks(group.lairActions, inline), regionalEffects: convertBlocks(group.regionalEffects, inline), group: `legendary.${slug(str(group.ENG_name) || str(group.name))}.${str(group.source).toLowerCase()}` } : {}) } } : {}),
    ...(!legendaryRaw && group ? { legendary: { count: 0, actions: [], lairActions: convertBlocks(group.lairActions, inline), regionalEffects: convertBlocks(group.regionalEffects, inline), group: `legendary.${slug(str(group.ENG_name) || str(group.name))}.${str(group.source).toLowerCase()}` } } : {}),
    ...(Array.isArray(raw.environment) ? { tags: [...raw.environment, ...(Array.isArray(raw.damageTags) ? raw.damageTags : []), ...(Array.isArray(raw.miscTags) ? raw.miscTags : [])].map(String) } : {}),
    ...(Array.isArray(raw.mythic) ? { mythic: namedActions(raw.mythic, inline, entry) } : {}),
    spellcasting: spellcastingOf(raw, inline),
    ...(variants.length ? { variants } : {}),
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
