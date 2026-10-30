import type { Entry } from '../../../src/schemas/pack'
import type { PlannedEntry } from './plan'
import type { ConvertContext } from './context'
import { creditFor, DAMAGE_TYPE, keywordsOf, pageOf, str } from './common'
import { slug } from '../lib/slug'
import { convertBlocks } from './blocks'
import { plainText, summaryOf } from '../summary/summary'
import type { InlineContext } from '../markup/inline'
import { dedupeEffects, foundryFeature, foundryRulesFor } from './foundry'
import { ITEM_ACTIVITIES } from '../config/itemRules'

const RARITY = new Set(['none', 'common', 'uncommon', 'rare', 'very rare', 'legendary', 'artifact', 'varies'])

function categoryOf(raw: Record<string, unknown>): string {
  if (typeof raw._category === 'string') return raw._category
  const code = str(raw.type)
  if (raw.weapon === true || code === 'M' || code === 'R') return 'weapon'
  if (code === 'LA' || code === 'MA' || code === 'HA') return 'armor'
  if (code === 'S') return 'shield'
  if (code === 'A' || code === 'AF') return 'ammunition'
  if (code === 'T') return 'tool'
  if (code === 'P' || code === 'SC') return 'consumable'
  if (code === 'MNT') return 'mount'
  if (code === 'VE' || code === 'SHP') return 'vehicle'
  if (code === 'AT' || code === 'GS') return 'treasure'
  if (code === 'G' || code === 'FD' || code === 'EXP') return 'gear'
  return 'wondrous'
}

function rarityOf(raw: Record<string, unknown>): string {
  const value = str(raw.rarity).toLowerCase()
  return RARITY.has(value) ? value : 'none'
}

function attunementOf(raw: Record<string, unknown>): { required: boolean; by?: string } {
  const value = raw.reqAttune
  if (value === true) return { required: true }
  if (typeof value === 'string') return { required: true, by: value.slice(0, 160) }
  return { required: false }
}

function bonus(value: unknown): string | undefined {
  return typeof value === 'string' ? value : typeof value === 'number' ? `+${value}` : undefined
}

function damageDice(base: string, extra: string | undefined): string {
  if (!extra) return base
  const value = extra.trim()
  if (!value) return base
  if (/^\d+$/.test(base)) {
    const n = Number(base.replace(/[^\d-]/g, '')) + Number(value.replace(/[^\d-]/g, ''))
    return String(n)
  }
  return `${base}${value.startsWith('+') || value.startsWith('-') ? value : `+${value}`}`
}

function weaponOf(raw: Record<string, unknown>): Record<string, unknown> | undefined {
  const base = (raw._baseItem ?? {}) as Record<string, unknown>
  const code = str(raw.type)
  if (raw.weapon !== true && code !== 'M' && code !== 'R' && !base.weapon) return undefined
  const dmg1 = str(raw.dmg1) || str(base.dmg1)
  const dmgType = DAMAGE_TYPE[str(raw.dmgType) || str(base.dmgType)]
  const bonusValue = bonus(raw.bonusWeapon)
  const properties = (Array.isArray(raw.property) ? raw.property : Array.isArray(base.property) ? base.property : []).map(String)
  const range = typeof raw.range === 'number' ? raw.range : typeof base.range === 'number' ? base.range : undefined
  const rangeMax = typeof raw.rangeMax === 'number' ? raw.rangeMax : typeof base.rangeMax === 'number' ? base.rangeMax : undefined
  return {
    category: str(raw.weaponCategory) || str(base.weaponCategory) || undefined,
    damage: dmg1 && dmgType ? [{ dice: damageDice(dmg1, bonusValue), type: dmgType }] : [],
    ...(str(raw.dmg2) || str(base.dmg2) ? { versatile: str(raw.dmg2) || str(base.dmg2) } : {}),
    properties,
    ...(range ? { range: { normal: range, ...(rangeMax ? { long: rangeMax } : {}) } } : {}),
  }
}

function armorOf(raw: Record<string, unknown>): Record<string, unknown> | undefined {
  const base = (raw._baseItem ?? {}) as Record<string, unknown>
  const rawCode = str(raw.type).split('|')[0]
  const baseCode = str(base.type).split('|')[0]
  const code = ['S', 'LA', 'MA', 'HA'].includes(rawCode) ? rawCode : baseCode
  const kind = code === 'S' ? 'shield' : code === 'LA' ? 'light' : code === 'MA' ? 'medium' : code === 'HA' ? 'heavy' : ''
  if (!kind) return undefined
  const ac = typeof raw.ac === 'number' ? raw.ac : typeof base.ac === 'number' ? base.ac : kind === 'shield' ? 2 : 10
  return {
    category: kind,
    ac,
    ...(Number.isFinite(Number(raw.dexMax)) ? { dexCap: Number(raw.dexMax) } : kind === 'medium' ? { dexCap: 2 } : {}),
    ...(Number.isFinite(Number(raw.strength)) && Number(raw.strength) > 0 ? { strReq: Number(raw.strength) } : {}),
    stealthDisadvantage: raw.stealth === true,
  }
}

function chargesOf(raw: Record<string, unknown>): Record<string, unknown> | undefined {
  if (typeof raw.charges === 'number') return { max: raw.charges, ...(str(raw.recharge) ? { recharge: str(raw.recharge) } : {}) }
  return undefined
}

function bonusesOf(raw: Record<string, unknown>): Record<string, string> | undefined {
  const out: Record<string, string> = {}
  const map: Record<string, string> = { bonusAc: 'ac', bonusSavingThrow: 'save', bonusWeapon: 'attack', bonusSpellAttack: 'spellAttack', bonusSpellSaveDc: 'spellDc' }
  for (const [key, target] of Object.entries(map)) {
    const value = bonus(raw[key])
    if (value) out[target] = value
  }
  return Object.keys(out).length ? out : undefined
}

function itemEffects(raw: Record<string, unknown>): Array<Record<string, unknown>> {
  const out: Array<Record<string, unknown>> = []
  const staticAbility = (raw.ability as Record<string, unknown> | undefined)?.static
  if (staticAbility && typeof staticAbility === 'object') {
    for (const [ability, value] of Object.entries(staticAbility as Record<string, unknown>)) if (typeof value === 'number') out.push({ kind: 'abilitySet', ability, value })
  }
  const modify = (raw.modifySpeed as Record<string, unknown> | undefined)?.multiply
  if (modify && typeof modify === 'object') {
    for (const [mode, value] of Object.entries(modify as Record<string, unknown>)) if (typeof value === 'number') out.push({ kind: 'speed', mode, multiplier: value })
  }
  if (Array.isArray(raw.resist)) for (const value of raw.resist) if (typeof value === 'string') out.push({ kind: 'resistance', damage: [value] })
  if (Array.isArray(raw.immune)) for (const value of raw.immune) if (typeof value === 'string') out.push({ kind: 'immunity', damage: [value] })
  return out
}

function contentsOf(raw: Record<string, unknown>, ctx: ConvertContext): Array<{ item: string; qty: number }> | undefined {
  const source = Array.isArray(raw.packContents) ? raw.packContents : []
  const out: Array<{ item: string; qty: number }> = []
  for (const entry of source) {
    const rec = typeof entry === 'string' ? { item: entry } : entry && typeof entry === 'object' ? entry as Record<string, unknown> : undefined
    if (!rec) continue
    const name = str(rec.item).split('|')[0]
    const id = ctx.resolveEntryId('item', name)
    if (id) out.push({ item: id, qty: Number(rec.quantity ?? rec.qty ?? 1) })
  }
  return out.length ? out : undefined
}
export function convertItem(entry: PlannedEntry, ctx: ConvertContext, inline: InlineContext): Entry {
  const raw = entry.raw
  const foundryRaw = foundryFeature({ items: ctx.foundryItems }, raw, 'item', entry.source)
  const rules = foundryRaw ? foundryRulesFor(foundryRaw) : undefined
  for (const [key, value] of rules?.unmapped ?? []) {
    const current = ctx.unmappedFoundry?.get(key) ?? { count: 0, example: entry.id }
    ctx.unmappedFoundry?.set(key, { count: current.count + value.count, example: current.example })
  }
  const effects = dedupeEffects([...itemEffects(raw), ...(rules?.effects ?? []) as unknown as Array<Record<string, unknown>>])
  const activities = [...(rules?.activities ?? []), ...(ITEM_ACTIVITIES[entry.id] ?? [])]
  const base = (raw._baseItem ?? {}) as Record<string, unknown>
  const family = raw._family === true
  const familyEntries = raw.entries
  const footnote = family && Array.isArray(familyEntries) && familyEntries.length === 1 && typeof familyEntries[0] === 'string' && familyEntries[0].startsWith('{@note * ')
  const text = family
    ? (footnote ? [] : convertBlocks(familyEntries, inline))
    : raw._template === true
      ? [{ p: entry.name }]
      : convertBlocks(raw.entries, inline)
  const category = family ? 'family' : raw._template === true ? 'template' : categoryOf(raw)
  const baseId = str(base.name) ? ctx.resolveEntryId('item', str(base.name)) : undefined
  const data: Record<string, unknown> = {
    src: pageOf(entry),
    credit: creditFor(entry, ctx.bookMachine.get(entry.source) ?? false),
    text,
    category,
    ...(baseId ? { baseItem: baseId } : {}),
    ...(raw._template === true ? { variantTemplate: { requires: Array.isArray(raw.requires) ? raw.requires : [], ...(Array.isArray(raw.excludes) ? { excludes: raw.excludes } : {}) } } : {}),
    rarity: rarityOf(raw),
    attunement: attunementOf(raw),
    ...(typeof raw.weight === 'number' ? { weight: raw.weight } : typeof base.weight === 'number' ? { weight: base.weight } : {}),
    ...(typeof raw.value === 'number' ? { value: Math.round(raw.value) } : typeof base.value === 'number' ? { value: Math.round(base.value) } : {}),
    ...(weaponOf(raw) ? { weapon: weaponOf(raw) } : {}),
    ...(armorOf(raw) ? { armor: armorOf(raw) } : {}),
    ...(chargesOf(raw) ? { charges: chargesOf(raw) } : {}),
    ...(bonusesOf(raw) ? { bonuses: bonusesOf(raw) } : {}),
    ...(effects.length ? { effects } : {}),
    ...(activities.length ? { activities } : {}),
    ...(category === 'consumable' ? { consumable: true } : {}),
    ...(contentsOf(raw, ctx) ? { contents: contentsOf(raw, ctx) } : {}),
    ...(raw.atomicPackContents === true ? { atomic: true } : {}),
    ...(raw.containerCapacity && typeof raw.containerCapacity === 'object' ? { container: raw.containerCapacity } : {}),
    ...(family ? { members: (Array.isArray(raw.items) ? raw.items : []).map((x) => ctx.resolveEntryId('item', String(x).split('|')[0])).filter((id): id is string => !!id) } : {}),
    tags: [str(raw.type ?? raw.baseItem ?? 'item')],
    ...(raw._variant && typeof raw._variant === 'object' ? { variantOf: `item.${slug(str((raw._variant as Record<string, unknown>).ENG_name) || str((raw._variant as Record<string, unknown>).name))}.${str(raw.source).toLowerCase()}` } : {}),
    properties: (Array.isArray(raw.property) ? raw.property : Array.isArray(base.property) ? base.property : []).map(String),
    lootTables: (Array.isArray(raw.lootTables) ? raw.lootTables : []).map(String),
  }
  if (foundryRaw) (data.credit as { structured?: { by: string; license: string } }).structured = { by: '5etools-foundry', license: 'MIT' }
  const unique = data.rarity === 'artifact'
  const displayName = family ? `${entry.name}（系列）` : entry.name
  const displayNameEn = family ? `${entry.nameEn} (Family)` : entry.nameEn
  return { id: entry.id, type: 'item', name: displayName, nameEn: displayNameEn, keywords: keywordsOf(entry), unique, summary: summaryOf('item', displayName, data, plainText(text)), data }
}
