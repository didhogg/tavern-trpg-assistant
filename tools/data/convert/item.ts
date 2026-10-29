import type { Entry } from '../../../src/schemas/pack'
import type { PlannedEntry } from './plan'
import type { ConvertContext } from './context'
import { creditFor, DAMAGE_TYPE, keywordsOf, pageOf, str } from './common'
import { convertBlocks } from './blocks'
import { plainText, summaryOf } from '../summary/summary'
import type { InlineContext } from '../markup/inline'

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
  const code = str(raw.type)
  const kind = code === 'S' ? 'shield' : code === 'LA' ? 'light' : code === 'MA' ? 'medium' : code === 'HA' ? 'heavy' : ''
  if (!kind) return undefined
  const ac = typeof raw.ac === 'number' ? raw.ac : typeof base.ac === 'number' ? base.ac : kind === 'shield' ? 2 : 10
  return {
    category: kind,
    ac,
    ...(Number.isFinite(Number(raw.dexMax)) ? { dexCap: Number(raw.dexMax) } : {}),
    ...(Number.isFinite(Number(raw.strength)) ? { strReq: Number(raw.strength) } : {}),
    stealthDisadvantage: raw.stealth === true,
  }
}

function chargesOf(raw: Record<string, unknown>): Record<string, unknown> | undefined {
  if (typeof raw.charges === 'number') return { max: raw.charges, ...(str(raw.recharge) ? { recharge: str(raw.recharge) } : {}) }
  return undefined
}

function bonusesOf(raw: Record<string, unknown>): Record<string, string> | undefined {
  const out: Record<string, string> = {}
  const map: Record<string, string> = { bonusAc: 'ac', bonusWeapon: 'attack', bonusSpellAttack: 'spellAttack', bonusSpellSaveDc: 'spellDc' }
  for (const [key, target] of Object.entries(map)) {
    const value = bonus(raw[key])
    if (value) out[target] = value
  }
  return Object.keys(out).length ? out : undefined
}

export function convertItem(entry: PlannedEntry, ctx: ConvertContext, inline: InlineContext): Entry {
  const raw = entry.raw
  const base = (raw._baseItem ?? {}) as Record<string, unknown>
  const text = convertBlocks(raw.entries, inline)
  const category = categoryOf(raw)
  const data: Record<string, unknown> = {
    src: pageOf(entry),
    credit: creditFor(entry, ctx.bookMachine.get(entry.source) ?? false),
    text,
    category,
    ...(str(base.name) ? { baseItem: str(base.name) } : {}),
    rarity: rarityOf(raw),
    attunement: attunementOf(raw),
    ...(typeof raw.weight === 'number' ? { weight: raw.weight } : typeof base.weight === 'number' ? { weight: base.weight } : {}),
    ...(typeof raw.value === 'number' ? { value: Math.round(raw.value) } : typeof base.value === 'number' ? { value: Math.round(base.value) } : {}),
    ...(weaponOf(raw) ? { weapon: weaponOf(raw) } : {}),
    ...(armorOf(raw) ? { armor: armorOf(raw) } : {}),
    ...(chargesOf(raw) ? { charges: chargesOf(raw) } : {}),
    ...(bonusesOf(raw) ? { bonuses: bonusesOf(raw) } : {}),
    ...(category === 'consumable' ? { consumable: true } : {}),
    properties: (Array.isArray(raw.property) ? raw.property : Array.isArray(base.property) ? base.property : []).map(String),
    lootTables: (Array.isArray(raw.lootTables) ? raw.lootTables : []).map(String),
  }
  const unique = data.rarity === 'artifact'
  return { id: entry.id, type: 'item', name: entry.name, nameEn: entry.nameEn, keywords: keywordsOf(entry), unique, summary: summaryOf('item', entry.name, data, plainText(text)), data }
}
