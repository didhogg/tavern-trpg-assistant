import type { Entry } from '../../../src/schemas/pack'
import type { PlannedEntry } from './plan'
import type { ConvertContext } from './context'
import type { InlineContext } from '../markup/inline'
import { convertBlocks } from './blocks'
import { r11BlockOptions } from './blocksR11'
import { creditFor, keywordsOf, pageOf, str, obj } from './common'
import { plainText, summaryOf } from '../summary/summary'
import { renderInline, renderInlineList } from '../markup/inline'
import { foundryRulesFor, dedupeEffects } from './foundry'
import { rewardSpellGrants } from './rewardSpells'
import { reprintTargets } from './versions'

function textOf(entry: PlannedEntry, inline: InlineContext) {
  return convertBlocks(entry.raw.entries, inline, r11BlockOptions)
}

function entryOf(entry: PlannedEntry, data: Record<string, unknown>, text = data.text): Entry {
  return {
    id: entry.id,
    type: entry.type,
    name: entry.name,
    nameEn: entry.nameEn,
    keywords: keywordsOf(entry),
    unique: false,
    summary: summaryOf(entry.type, entry.name, data, plainText((text as never) ?? [])),
    data,
  }
}

function base(entry: PlannedEntry, ctx: ConvertContext, inline: InlineContext): Record<string, unknown> {
  return {
    src: pageOf(entry),
    credit: creditFor(entry, ctx.bookMachine.get(entry.source) ?? false),
    text: textOf(entry, inline),
  }
}

export function convertLanguage(entry: PlannedEntry, ctx: ConvertContext, inline: InlineContext): Entry {
  const raw = entry.raw
  const data = base(entry, ctx, inline)
  data.code = str(raw._code) || str(raw.ENG_name).trim().toLowerCase()
  if (['standard', 'exotic', 'secret'].includes(str(raw.type))) data.type = str(raw.type)
  if (typeof raw.script === 'string') data.script = raw.script
  if (typeof raw.script === 'string') {
    const target = ctx.index.byTypeName.get(`rule:script|${raw.script}`)?.[0]
    if (target) data.scriptRule = target.id
  }
  data.typicalSpeakers = renderInlineList(Array.isArray(raw.typicalSpeakers) ? raw.typicalSpeakers.map(String) : [], inline)
  if (Array.isArray(raw.dialects)) data.dialects = raw.dialects.map(String)
  return entryOf(entry, data)
}

export function convertDeity(entry: PlannedEntry, ctx: ConvertContext, inline: InlineContext): Entry {
  const raw = entry.raw
  const data = base(entry, ctx, inline)
  data.pantheon = str(raw.pantheon)
  if (Array.isArray(raw.alignment)) data.alignment = raw.alignment.map(String)
  if (str(raw.category)) data.category = str(raw.category)
  data.domains = Array.isArray(raw.domains) ? raw.domains.map(String) : []
  for (const key of ['province', 'symbol', 'title', 'reprintAlias', 'customExtensionOf']) if (typeof raw[key] === 'string') data[key] = raw[key]
  if (Array.isArray(raw.altNames)) data.altNames = raw.altNames.map(String)
  if (typeof raw.piety === 'boolean') data.piety = raw.piety
  return entryOf(entry, data)
}

const REWARD_KIND: Record<string, string> = {
  Blessing: 'blessing',
  Boon: 'boon',
  Charm: 'charm',
  'Piety Trait': 'pietyTrait',
  'Draconic Gift': 'draconicGift',
  Curse: 'curse',
  Other: 'other',
}

function supersededCult(entry: PlannedEntry, ctx: ConvertContext, data: Record<string, unknown>): void {
  const targets = reprintTargets(entry.raw)
  for (const target of targets) {
    for (const source of target.sources) {
      const hit = ctx.index.byTypeNameSource.get(`cult|${target.name}|${source}`)
      if (hit) {
        data.supersededBy = hit.id
        return
      }
    }
  }
}

export function convertReward(entry: PlannedEntry, ctx: ConvertContext, inline: InlineContext): Entry {
  const raw = entry.raw
  const kind = str(raw._rewardKind) === 'demonicBoon' ? 'demonicBoon' : REWARD_KIND[str(raw.type)]
  if (!kind) throw new Error(`未登记的奖励类型：${str(raw.type)}（${entry.name}）`)
  const data = base(entry, ctx, inline)
  data.rewardKind = kind
  if (typeof raw.type === 'string') data.type = raw.type
  if (typeof raw.rarity === 'string') data.rarity = raw.rarity
  if (Array.isArray(raw.effects)) {
    const effects = foundryRulesFor({ effects: raw.effects }).effects
    for (const effect of effects ?? []) {
      const rec = effect as Record<string, unknown>
      if (rec.kind === 'hpMax' && (rec.flat === 0 || rec.flat === undefined)) {
        const text = JSON.stringify(raw.effects)
        const match = /\+\s*(\d+)/.exec(text)
        if (match) rec.flat = Number(match[1])
      }
    }
    if (effects?.length) data.effects = dedupeEffects(effects as Array<Record<string, unknown>>)
  }
  const grants = rewardSpellGrants(raw, ctx, entry.name)
  if (grants.length) data.spellGrants = grants
  if (typeof raw.abilityEntry === 'string') data.abilityEntry = renderInline(raw.abilityEntry, inline)
  const signature = obj(raw.signatureSpells)
  if (signature && typeof signature.entry === 'string') data.signatureSpells = renderInline(signature.entry, inline)
  if (kind === 'demonicBoon') supersededCult(entry, ctx, data)
  return entryOf(entry, data)
}

export function convertCult(entry: PlannedEntry, ctx: ConvertContext, inline: InlineContext): Entry {
  const raw = entry.raw
  const data = base(entry, ctx, inline)
  const type = str(raw.type)
  if (!['Diabolical', 'Demonic', 'Elder Evil'].includes(type)) throw new Error(`未登记的教团类型：${type}`)
  data.type = type
  for (const [key, target] of [['goal', 'goal'], ['cultists', 'typicalMembers'], ['signatureSpells', 'signatureSpells']] as const) {
    const value = obj(raw[key])
    if (value && typeof value.entry === 'string') data[target] = renderInline(value.entry, inline)
  }
  return entryOf(entry, data)
}

const THREAT: Record<string, string> = { 妨害: 'setback', 中等: 'moderate', 危险: 'dangerous', 致命: 'deadly' }

function textBlocks(value: unknown, inline: InlineContext) {
  return convertBlocks(value, inline, r11BlockOptions)
}

export function convertHazard(entry: PlannedEntry, ctx: ConvertContext, inline: InlineContext): Entry {
  const raw = entry.raw
  const data = base(entry, ctx, inline)
  data.hazardKind = str(raw._hazardKind) || entry.context.hazardKind || 'trap'
  if (typeof raw.trapHazType === 'string') data.kind = raw.trapHazType
  if (Array.isArray(raw.rating)) {
    data.rating = raw.rating.map((item) => {
      const rec = obj(item)
      if (!rec || typeof rec.tier !== 'number' || typeof rec.threat !== 'string') throw new Error(`${entry.name} 的 rating 形状不合法`)
      const threat = THREAT[rec.threat]
      if (!threat) throw new Error(`未登记的威胁等级：${rec.threat}（${entry.name}）`)
      return { tier: rec.tier, threat }
    })
  }
  for (const key of ['trigger', 'effect', 'countermeasures', 'eActive', 'eDynamic', 'eConstant'] as const) {
    if (raw[key] !== undefined) data[key] = textBlocks(raw[key], inline)
  }
  for (const key of ['initiative', 'initiativeNote', 'hauntBonus'] as const) if (raw[key] !== undefined) data[key] = raw[key]
  return entryOf(entry, data)
}

export function convertObject(entry: PlannedEntry, ctx: ConvertContext, inline: InlineContext): Entry {
  const raw = entry.raw
  const data = base(entry, ctx, inline)
  if (typeof raw.objectType === 'string') data.objectType = raw.objectType
  const size = Array.isArray(raw.size) ? raw.size.map(String) : typeof raw.size === 'string' ? [raw.size] : []
  data.size = size
  data.ac = raw.ac
  data.hp = raw.hp
  const immune = Array.isArray(raw.immune) ? raw.immune.map((item) => typeof item === 'string' ? item : str(obj(item)?.special)) : []
  data.immune = immune.filter(Boolean)
  if (Array.isArray(raw.conditionImmune)) data.conditionImmune = raw.conditionImmune.map(String)
  if (raw.speed !== undefined) data.speed = raw.speed
  for (const key of ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const) if (typeof raw[key] === 'number') data[key] = raw[key]
  if (raw.actionEntries !== undefined) data.actions = textBlocks(raw.actionEntries, inline)
  return entryOf(entry, data)
}

function normalizeSize(value: unknown): string[] | undefined {
  if (Array.isArray(value)) return value.map(String)
  if (typeof value === 'string') return [value]
  return undefined
}

export function convertVehicle(entry: PlannedEntry, ctx: ConvertContext, inline: InlineContext): Entry {
  const raw = entry.raw
  const data = base(entry, ctx, inline)
  data.vehicleType = str(raw.vehicleType)
  const size = normalizeSize(raw.size)
  if (size) data.size = size
  for (const key of ['dimensions', 'terrain'] as const) if (Array.isArray(raw[key])) data[key] = raw[key].map(String)
  for (const key of ['capCrew', 'capPassenger', 'capCargo', 'cost', 'pace', 'speed', 'ac', 'hp', 'hull', 'immune', 'conditionImmune', 'str', 'dex', 'con', 'int', 'wis', 'cha', 'actionThresholds'] as const) {
    if (raw[key] !== undefined) data[key] = raw[key]
  }
  if (typeof raw.capCrewNote === 'string') data.capCrewNote = renderInline(raw.capCrewNote, inline)
  if (Array.isArray(raw.control)) {
    data.control = raw.control.map((item) => {
      const rec = obj(item) ?? {}
      return { name: str(rec.name), ...(typeof rec.ac === 'number' ? { ac: rec.ac } : {}), ...(typeof rec.hp === 'number' ? { hp: rec.hp } : {}), text: textBlocks(rec.entries, inline) }
    })
  }
  if (Array.isArray(raw.movement)) {
    data.movement = raw.movement.map((item) => {
      const rec = obj(item) ?? {}
      const speed = Array.isArray(rec.speed) ? rec.speed.map((s) => {
        const row = obj(s) ?? {}
        return { mode: str(row.mode), entries: Array.isArray(row.entries) ? renderInlineList(row.entries.map(String), inline) : [] }
      }) : undefined
      return {
        name: str(rec.name),
        ...(typeof rec.ac === 'number' ? { ac: rec.ac } : {}),
        ...(typeof rec.hp === 'number' ? { hp: rec.hp } : {}),
        ...(typeof rec.hpNote === 'string' ? { hpNote: renderInline(rec.hpNote, inline) } : {}),
        ...(typeof rec.isControl === 'boolean' ? { isControl: rec.isControl } : {}),
        ...(speed ? { speed } : {}),
      }
    })
  }
  if (Array.isArray(raw.weapon)) {
    data.weapon = raw.weapon.map((item) => {
      const rec = obj(item) ?? {}
      const actions = Array.isArray(rec.action) ? rec.action.map((action) => {
        const row = obj(action) ?? {}
        return { name: str(row.name), text: textBlocks(row.entries, inline) }
      }) : undefined
      return {
        name: str(rec.name),
        ...(typeof rec.ac === 'number' ? { ac: rec.ac } : {}),
        ...(typeof rec.hp === 'number' ? { hp: rec.hp } : {}),
        ...(typeof rec.dt === 'number' ? { dt: rec.dt } : {}),
        ...(typeof rec.count === 'number' ? { count: rec.count } : {}),
        ...(typeof rec.crew === 'number' ? { crew: rec.crew } : {}),
        ...(rec.size ? { size: normalizeSize(rec.size) } : {}),
        ...(Array.isArray(rec.costs) ? { costs: rec.costs.map((cost) => { const c = obj(cost) ?? {}; return { ...(typeof c.cost === 'number' ? { cost: c.cost } : {}), ...(typeof c.note === 'string' ? { note: renderInline(c.note, inline) } : {}) } }) } : {}),
        text: textBlocks(rec.entries, inline),
        ...(actions ? { actions } : {}),
      }
    })
  }
  if (raw.action !== undefined) data.actions = textBlocks(raw.action, inline)
  return entryOf(entry, data)
}
