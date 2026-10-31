import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Entry } from '../../../src/schemas/pack'
import { DATA_5ETOOLS } from '../extract/load'
import type { PlannedEntry } from './plan'
import type { ConvertContext } from './context'
import { refKey, renderInline, type InlineContext } from '../markup/inline'
import { convertBlocks } from './blocks'
import { foundryFeature } from './foundry'

type Rec = Record<string, unknown>
const isObj = (value: unknown): value is Rec => !!value && typeof value === 'object' && !Array.isArray(value)
const str = (value: unknown): string => (typeof value === 'string' ? value : '')

/** R15：来源里有、此前没进输出的字段（见 docs/handoff/D1.2a_R15_执行文档.md 第 3 节）。统计写进报告。 */
export const carryStats = { attachedItems: 0, attachedItemsUnresolved: 0, attachedSpells: 0, attachedSpellsUnresolved: 0, optionalFeatures: 0, optionalFeaturesUnresolved: 0, spellcastingMismatch: 0 }

/** 递归渲染：字符串里的 5etools 标签转成行内标记，数字、布尔原样。 */
export function renderDeep(value: unknown, inline: InlineContext): unknown {
  if (typeof value === 'string') return renderInline(value, inline)
  if (Array.isArray(value)) return value.map((item) => renderDeep(item, inline))
  if (isObj(value)) return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, renderDeep(item, inline)]))
  return value
}

/** 来源里的 `名称|来源`（或带 `#环数` 后缀）→ 条目 id。 */
export function resolveUid(ctx: ConvertContext, types: string[], uid: string, defaultSource?: string): string | undefined {
  const [namePart, sourcePart] = uid.split('|')
  const level = /#(\d+)$/.exec(namePart)?.[1]
  const name = namePart.replace(/#\d+$/, '')
  for (const type of types) {
    const bySource = sourcePart || defaultSource ? ctx.index.byTypeNameSource.get(refKey(`${type}|${name}|${(sourcePart || defaultSource)!.toUpperCase()}`)) : undefined
    const hit = bySource ?? ctx.index.byTypeName.get(refKey(`${type}|${name}`))?.[0]
    if (hit) return level ? `${hit.id}#${level}` : hit.id
  }
  return undefined
}

function ids(ctx: ConvertContext, types: string[], list: unknown, count: { ok: 'attachedItems' | 'attachedSpells' | 'optionalFeatures'; bad: 'attachedItemsUnresolved' | 'attachedSpellsUnresolved' | 'optionalFeaturesUnresolved' }, source?: string): string[] {
  const out: string[] = []
  for (const item of Array.isArray(list) ? list : []) {
    const id = typeof item === 'string' ? resolveUid(ctx, types, item, source) : undefined
    if (id) { out.push(id); carryStats[count.ok]++ } else carryStats[count.bad]++
  }
  return out
}

const MONSTER_FACETS: Record<string, string> = {
  senseTags: 'sense', languageTags: 'language', traitTags: 'trait', actionTags: 'action', spellcastingTags: 'spellcasting',
  savingThrowForced: 'saveForced', savingThrowForcedSpell: 'saveForcedSpell', savingThrowForcedLegendary: 'saveForcedLegendary',
  conditionInflict: 'conditionInflict', conditionInflictSpell: 'conditionInflictSpell', conditionInflictLegendary: 'conditionInflictLegendary',
  damageTagsSpell: 'damageSpell', damageTagsLegendary: 'damageLegendary',
}
const MONSTER_EXTRA = ['alignmentPrefix', 'group', 'dragonAge', 'dragonCastingColor', 'familiar', 'summonedBySpell', 'summonedBySpellLevel', 'summonedByClass', 'pbNote', 'shortName', 'sizeNote', 'actionNote', 'legendaryHeader']
const ITEM_FACETS: Record<string, string> = { miscTags: 'misc', reqAttuneTags: 'reqAttune', poison: 'poison', poisonTypes: 'poisonTypes', scfType: 'scf' }
const ITEM_EXTRA = ['focus', 'tattoo', 'detail1', 'light', 'staff', 'modifySpeed', 'curse', 'spellScrollLevel', 'carryingCapacity', 'speed', 'age', 'crew', 'grantsProficiency', 'grantsLanguage', 'seeAlsoVehicle', 'seeAlsoDeck', 'vehAc', 'vehHp', 'vehSpeed', 'vehDmgThresh', 'capCargo', 'capPassenger', 'conditionImmune', 'vulnerable', 'group', 'sentient', 'ammoType', 'critThreshold', 'bonusAbilityCheck', 'bonusProficiencyBonus', 'bonusWeaponDamage', 'weightNote', 'typeAlt', 'system', 'reload', 'recharge']

function facetsOf(raw: Rec, map: Record<string, string>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, name] of Object.entries(map)) {
    const value = raw[key]
    if (Array.isArray(value) && value.length) out[name] = value.map((item) => (typeof item === 'string' ? item : isObj(item) ? Object.entries(item).map(([k, v]) => `${k}=${String(v)}`).join(',') : String(item)))
    else if (typeof value === 'boolean' || typeof value === 'string') out[name] = [String(value)]
  }
  return out
}

let foundryMonsters: Rec[] | undefined
/** TCE 召唤物等怪物的 Foundry 效果在 bestiary/foundry.json 里（不在怪物记录本身）。 */
function foundryMonster(plan: PlannedEntry): Rec | undefined {
  foundryMonsters ??= ((JSON.parse(readFileSync(join(DATA_5ETOOLS, 'bestiary', 'foundry.json'), 'utf8')) as Rec).monster as Rec[] | undefined) ?? []
  return foundryMonsters.find((m) => str(m.name) === str(plan.raw.name) && str(m.source) === plan.source)
}

function carryMonster(plan: PlannedEntry, data: Rec, ctx: ConvertContext, inline: InlineContext): void {
  const raw = plan.raw
  const facets = facetsOf(raw, MONSTER_FACETS)
  if (Object.keys(facets).length) data.facets = facets
  const attached = ids(ctx, ['item'], raw.attachedItems, { ok: 'attachedItems', bad: 'attachedItemsUnresolved' }, plan.source)
  if (attached.length) data.attachedItems = attached
  const extra: Rec = {}
  for (const key of MONSTER_EXTRA) if (raw[key] !== undefined) extra[key] = renderDeep(raw[key], inline)
  const speed = raw.speed
  if (isObj(speed) && Object.values(speed).some((v) => isObj(v) || Array.isArray(v)) || (isObj(speed) && 'alternate' in speed)) extra.speed = renderDeep(speed, inline)
  if (isObj(raw.skill) && raw.skill.other !== undefined) extra.skillOther = renderDeep(raw.skill.other, inline)
  const chances = (Array.isArray(raw.alignment) ? raw.alignment : []).filter((a) => isObj(a) && a.chance !== undefined)
  if (chances.length) extra.alignmentChance = renderDeep(chances, inline)
  if (isObj(raw.cr) && raw.cr.xp !== undefined) extra.crXp = raw.cr.xp
  if (raw.initiative !== undefined) extra.initiative = renderDeep(raw.initiative, inline)
  if (Object.keys(extra).length) data.extra = extra
  if (isObj(raw.type) && raw.type.swarmSize !== undefined && isObj(data.creatureType)) data.creatureType = { ...data.creatureType, swarmSize: String(raw.type.swarmSize) }
  const rawCast = Array.isArray(raw.spellcasting) ? raw.spellcasting.filter(isObj) : []
  const outCast = Array.isArray(data.spellcasting) ? (data.spellcasting as Rec[]) : []
  if (rawCast.length && rawCast.length !== outCast.length) carryStats.spellcastingMismatch++
  else rawCast.forEach((block, i) => {
    const target = outCast[i]
    for (const key of ['type', 'displayAs', 'hidden', 'chargesItem'] as const) if (block[key] !== undefined) target[key] = renderDeep(block[key], inline)
    if (block.footerEntries !== undefined) target.footer = convertBlocks(block.footerEntries, inline)
    if (isObj(block.spells) && isObj(target.spells)) for (const [level, spells] of Object.entries(block.spells)) if (isObj(spells) && spells.lower !== undefined && isObj((target.spells as Rec)[level])) ((target.spells as Rec)[level] as Rec).lower = spells.lower
  })
  const effects = Array.isArray(raw.effects) && raw.effects.length ? raw.effects : foundryMonster(plan)?.effects
  if (Array.isArray(effects) && effects.length) {
    const notes = effects.filter(isObj).map((effect) => ({ kind: 'note', text: foundryEffectText(effect, inline.lang === 'en') }))
    data.effects = [...(Array.isArray(data.effects) ? data.effects : []), ...notes]
  }
}

/** Foundry 效果（名称 + 若干 key/mode/value 改动）没有对应的现有效果种类时，保留成一条说明文字，不丢。 */
export function foundryEffectText(effect: Rec, en: boolean): string {
  const changes = (Array.isArray(effect.changes) ? effect.changes : []).filter(isObj).map((c) => `${str(c.key)} ${String(c.mode ?? '')} ${String(c.value ?? '')}`.trim())
  return `${en ? 'Foundry effect' : 'Foundry 效果'}：${str(effect.name)}${changes.length ? `（${changes.join('；')}）` : ''}${effect.disabled === true ? (en ? ' (disabled)' : '（默认停用）') : ''}`
}

function carryItem(plan: PlannedEntry, data: Rec, ctx: ConvertContext, inline: InlineContext): void {
  const raw = plan.raw
  const facets = facetsOf(raw, ITEM_FACETS)
  if (Object.keys(facets).length) data.facets = facets
  if (raw.tier !== undefined) data.tier = String(raw.tier)
  if (typeof raw.wondrous === 'boolean') data.wondrous = raw.wondrous
  if (isObj(raw.attachedSpells)) {
    const out: Rec = {}
    const a = raw.attachedSpells
    if (typeof a.ability === 'string') out.ability = a.ability
    const lists = (value: unknown): string[] => ids(ctx, ['spell'], value, { ok: 'attachedSpells', bad: 'attachedSpellsUnresolved' }, undefined)
    if (Array.isArray(a.will)) out.will = lists(a.will)
    if (Array.isArray(a.other)) out.other = lists(a.other)
    for (const key of ['daily', 'charges', 'limited'] as const) if (isObj(a[key])) out[key] = Object.fromEntries(Object.entries(a[key] as Rec).map(([n, list]) => [n, lists(list)]))
    if (Object.keys(out).length) data.attachedSpells = out
  }
  if (raw.ability !== undefined) data.abilityGrant = renderDeep(raw.ability, inline)
  const optional = ids(ctx, ['feature'], raw.optionalfeatures, { ok: 'optionalFeatures', bad: 'optionalFeaturesUnresolved' }, undefined)
  if (optional.length) data.optionalFeatures = optional
  const extra: Rec = {}
  for (const key of ITEM_EXTRA) if (raw[key] !== undefined) extra[key] = renderDeep(raw[key], inline)
  if (raw._family === true) for (const key of ['type', 'baseItem'] as const) if (raw[key] !== undefined) extra[key] = renderDeep(raw[key], inline)
  if (Object.keys(extra).length) data.extra = extra
  const foundry = foundryFeature({ items: ctx.foundryItems }, raw, 'item', plan.source)
  if (foundry) {
    const kept = (isObj(foundry.activities) ? Object.values(foundry.activities) : Array.isArray(foundry.activities) ? foundry.activities : []).filter((a) => isObj(a) && (a.spell !== undefined || a.consumption !== undefined || a.attack !== undefined || (isObj(a.uses) && a.uses.recovery !== undefined) || (isObj(a.damage) && a.damage.includeBase !== undefined)))
    if (kept.length) data.extra = { ...(isObj(data.extra) ? data.extra : {}), foundryActivities: renderDeep(kept, inline) }
    if (foundry.system !== undefined) data.extra = { ...(isObj(data.extra) ? data.extra : {}), system: renderDeep(foundry.system, inline) }
    if (isObj(raw._merge) && raw._merge.effects === true && Array.isArray(foundry.effects) && foundry.effects.length) {
      const notes = foundry.effects.filter(isObj).map((effect) => ({ kind: 'note', text: foundryEffectText(effect, inline.lang === 'en') }))
      data.effects = [...(Array.isArray(data.effects) ? data.effects : []), ...notes]
    }
  }
  if (raw.additionalEntries !== undefined && Array.isArray(data.text)) data.text = [...data.text, ...convertBlocks(raw.additionalEntries, inline)]
}

/** 转换之后、入包之前：补上来源里的这些字段。只新增键，不改已有字段。 */
export function carryExtras(plan: PlannedEntry, built: Entry, ctx: ConvertContext, inline: InlineContext): Entry {
  const data = built.data as Rec
  if (plan.type === 'monster') carryMonster(plan, data, ctx, inline)
  else if (plan.type === 'item') carryItem(plan, data, ctx, inline)
  else if (plan.type === 'spell' && Array.isArray(plan.raw.abilityCheck)) data.abilityCheck = plan.raw.abilityCheck.map(String)
  else if (plan.type === 'rule' && Array.isArray(plan.raw.seeAlsoAction)) {
    const seeAlso = plan.raw.seeAlsoAction.map((uid) => (typeof uid === 'string' ? resolveUid(ctx, ['rule:action', 'rule'], uid, plan.source) : undefined)).filter((id): id is string => !!id)
    if (seeAlso.length) data.seeAlso = seeAlso
  }
  return built
}
