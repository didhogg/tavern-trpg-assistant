import type { Activity } from '../../../src/rules/dnd5e2014/data/activities'
import type { DamageType } from '../../../src/rules/dnd5e2014/data/enums'
import type { Effect } from '../../../src/rules/dnd5e2014/data/effects'
import type { Uses } from '../../../src/rules/dnd5e2014/data/common'
import type { Raw } from '../extract/load'
import { parseFormula } from '../../../src/rules/dnd5e2014/data/formula'
import { CONDITION_LABELS, CONDITIONS, DAMAGE_LABELS, SKILLS } from '../../../src/rules/dnd5e2014/data/enums'
import {
  ATTACK_BONUS_KEYS, CHANGE_KEYS, DAMAGE_BONUS_KEYS, MOVE_KEYS, RECOVERY_PERIOD, SCALE_ALIASES, SENSE_KEYS,
} from '../config/foundryKeys'

const SKILL_CODES: Record<string, string> = {
  acr: 'acrobatics', ani: 'animal handling', arc: 'arcana', ath: 'athletics', dec: 'deception', his: 'history', ins: 'insight',
  itm: 'intimidation', inv: 'investigation', med: 'medicine', nat: 'nature', per: 'perception', prf: 'performance', prs: 'persuasion',
  rel: 'religion', slt: 'sleight of hand', ste: 'stealth', sur: 'survival',
}
const DAMAGE_CN: Record<string, string> = Object.fromEntries(Object.entries(DAMAGE_LABELS).map(([code, label]) => [label, code]))
const CONDITION_CN: Record<string, string> = Object.fromEntries(Object.entries(CONDITION_LABELS).map(([code, label]) => [label, code]))

function str(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function number(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && /^[-+]?\d+(?:\.\d+)?$/.test(value.trim())) return Number(value)
  return undefined
}

export function damageKey(value: unknown): DamageType | undefined {
  const text = str(value).trim()
  return (DAMAGE_CN[text] ?? (/^[a-z]+$/.test(text) ? text : undefined)) as DamageType | undefined
}

function conditionKey(value: unknown): string | undefined {
  const text = str(value).trim()
  return CONDITION_CN[text] ?? ((CONDITIONS as readonly string[]).includes(text) ? text : undefined)
}

/** 把 Foundry 的公式写法转成我们 §6.4 的写法。 */
export function normalizeFoundryFormula(input: string): string {
  let out = input.trim()
  out = out.replace(/@scale\.([a-z0-9.-]+)/gi, (_m, id: string) => `scale.${SCALE_ALIASES[id] ?? id}`)
  out = out.replace(/@abilities\.(str|dex|con|int|wis|cha)\.mod/gi, '$1.mod')
  out = out.replace(/@abilities\.(str|dex|con|int|wis|cha)\.value/gi, '$1.score')
  out = out.replace(/@prof/gi, 'prof')
  out = out.replace(/@details\.level/gi, 'level')
  out = out.replace(/@classes\.([a-z0-9_-]+)\.levels/gi, 'class.$1.level')
  out = out.replace(/@level/gi, 'level')
  return out.replace(/\+\s*\+/g, '+')
}

function safeFormula(input: string): string | undefined {
  const normalized = normalizeFoundryFormula(input).replace(/^\++/, '')
  return parseFormula(normalized).ok ? normalized : undefined
}

function asList(value: unknown): unknown[] {
  return Array.isArray(value) ? value : value === undefined || value === null ? [] : [value]
}

function effectBase(effect: Raw): Record<string, unknown> {
  const duration = effect.duration && typeof effect.duration === 'object' ? (effect.duration as Raw) : undefined
  return {
    ...(duration ? { duration: { type: str(duration.units) || undefined, amount: number(duration.value), concentration: duration.concentration === true } } : {}),
    ...(effect.transfer === true ? { transfer: true } : {}),
  }
}

export interface FoundryRules {
  uses?: Uses
  effects?: Effect[]
  activities?: Activity[]
  unmapped: Map<string, { count: number; example: string }>
}

function markUnmapped(result: FoundryRules, key: string, example: string): void {
  const current = result.unmapped.get(key) ?? { count: 0, example }
  current.count++
  result.unmapped.set(key, current)
}

function changeToEffect(change: Raw, result: FoundryRules, example: string): Effect | undefined {
  const key = str(change.key)
  const value = change.value
  const mode = str(change.mode).toUpperCase()
  if (DAMAGE_BONUS_KEYS[key]) {
    const formula = typeof value === 'string' ? safeFormula(value) : undefined
    const ability = typeof value === 'string' ? /@abilities\.(str|dex|con|int|wis|cha)\.mod/.exec(value)?.[1] : undefined
    return { kind: 'damageBonus', amount: formula ?? (ability ? `${ability}.mod` : number(value) ?? 0), scope: DAMAGE_BONUS_KEYS[key].scope }
  }
  if (ATTACK_BONUS_KEYS[key]) return { kind: 'attackBonus', amount: typeof value === 'string' ? safeFormula(value) ?? 0 : number(value) ?? 0, scope: ATTACK_BONUS_KEYS[key].scope }
  if (key === CHANGE_KEYS.resistance || key === CHANGE_KEYS.immunity || key === CHANGE_KEYS.vulnerability) {
    const type = damageKey(value)
    if (!type) return undefined
    return { kind: key === CHANGE_KEYS.resistance ? 'resistance' : key === CHANGE_KEYS.immunity ? 'immunity' : 'vulnerability', damage: [type as never] }
  }
  if (key === CHANGE_KEYS.conditionImmunity) {
    const condition = conditionKey(value)
    return condition ? { kind: 'conditionImmunity', conditions: [condition as never] } : undefined
  }
  for (const [sense, path] of Object.entries(SENSE_KEYS)) if (key === path) return { kind: 'sense', sense: sense as never, range: number(value) ?? 0 }
  for (const [move, path] of Object.entries(MOVE_KEYS)) if (key === path) return value === true ? { kind: 'speed', mode: move as never, equalsWalk: true } : { kind: 'speed', mode: move as never, amount: number(value) ?? 0, bonus: number(value) ?? undefined }
  if (key === CHANGE_KEYS.acBonus) return { kind: 'ac', mode: 'bonus', amount: number(value) ?? 0 }
  if (key === CHANGE_KEYS.acFormula && typeof value === 'string') return { kind: 'ac', mode: 'base', formula: safeFormula(value) }
  if (key === CHANGE_KEYS.hpPerLevel) return { kind: 'hpMax', perLevel: number(value) ?? 0 }
  if (key === CHANGE_KEYS.hpOverall) {
    if (typeof value === 'string' && /level/i.test(value)) {
      const times = /(\d+)\s*\*\s*@details\.level|@details\.level\s*\*\s*(\d+)/i.exec(value)
      return { kind: 'hpMax', perLevel: times ? Number(times[1] ?? times[2]) : 1 }
    }
    return { kind: 'hpMax', flat: number(value) ?? 0 }
  }
  if (key === CHANGE_KEYS.initiativeBonus) return { kind: 'initiative', bonus: number(value) ?? 0 }
  if (key === CHANGE_KEYS.initiativeAlert && value === true) return { kind: 'initiative', bonus: 5 }
  if (key === CHANGE_KEYS.initiativeAdvantage && value === true) return { kind: 'initiative', advantage: true }
  if (key === 'system.attributes.init.roll.mode' && number(value) === 1) return { kind: 'initiative', advantage: true }
  if (key === CHANGE_KEYS.weaponProficiency) return { kind: 'proficiency', category: 'weapon', value: str(value) }
  if (key === CHANGE_KEYS.armorProficiency) return { kind: 'proficiency', category: 'armor', value: str(value) }
  if (key === CHANGE_KEYS.toolProficiency) return { kind: 'proficiency', category: 'tool', value: str(value) }
  if (key === CHANGE_KEYS.languageProficiency) return { kind: 'proficiency', category: 'language', value: str(value) }
  if (/^system\.abilities\.(str|dex|con|int|wis|cha)\.value$/.test(key)) {
    const ability = key.split('.')[2] as 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha'
    const score = number(value)
    return score ? { kind: 'abilitySet', ability, value: score } : undefined
  }
  const skill = /^system\.skills\.([a-z]+)\.(?:roll\.mode|bonuses\.check)$/.exec(key)
  if (skill) {
    const name = SKILL_CODES[skill[1]]
    if (!name) return undefined
    if (key.endsWith('roll.mode')) return number(value) === 1 ? { kind: 'skill', skill: name as never, level: 'advantage' } : undefined
    return { kind: 'skill', skill: name as never, level: 'bonus', amount: number(value) ?? 0 }
  }
  const abilityCheck = /^system\.abilities\.(str|dex|con|int|wis|cha)\.(check|save)\.(roll\.mode|bonuses\.(?:check|save))$/.exec(key)
  if (abilityCheck) {
    const ability = abilityCheck[1] as 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha'
    if (abilityCheck[2] === 'save') return number(value) === 1 ? { kind: 'save', ability, level: 'advantage' } : { kind: 'save', ability, level: 'bonus', amount: number(value) ?? 0 }
    return number(value) === 1 ? { kind: 'advantage', on: 'check', scope: ability } : { kind: 'note', text: `${ability} 检定加值 ${String(value)}` }
  }
  if (key === 'system.attributes.concentration.roll.mode' && number(value) === 1) return { kind: 'advantage', on: 'save', scope: 'concentration' }
  if (key === 'system.bonuses.spell.dc') return { kind: 'saveDcBonus', amount: typeof value === 'string' ? safeFormula(value) ?? 0 : number(value) ?? 0, scope: 'spell' }
  if (key === 'system.bonuses.spell.attack') return { kind: 'spellAttackBonus', amount: typeof value === 'string' ? safeFormula(value) ?? 0 : number(value) ?? 0, scope: 'spell' }
  if (key === 'flags.dnd5e.jackOfAllTrades') return { kind: 'note', text: '万事通：未列出的技能检定加一半熟练加值' }
  if (key === 'flags.dnd5e.observantFeat') return { kind: 'passive', skill: 'perception', bonus: 5 }
  if (key === 'flags.dnd5e.diamondSoul' || key === 'flags.dnd5e.reliableTalent' || key === 'flags.dnd5e.elvenAccuracy') return { kind: 'note', text: `Foundry 特性：${key.split('.').pop()}` }
  if (key === 'system.attributes.movement.hover') return { kind: 'note', text: '悬浮' }
  if (key.startsWith('system.description') || key.startsWith('system.activation')) return undefined
  if (mode === 'CUSTOM' && typeof value === 'string' && safeFormula(value)) return { kind: 'note', text: `${key}：${value}` }
  markUnmapped(result, key || '（空键）', example)
  return { kind: 'note', text: `Foundry 效果未映射：${key}` }
}

function effectsOf(raw: Raw): Effect[] {
  const result: FoundryRules = { unmapped: new Map() }
  const out: Effect[] = []
  for (const effect of asList(raw.effects)) {
    if (!effect || typeof effect !== 'object') continue
    const rec = effect as Raw
    const base = effectBase(rec)
    for (const change of asList(rec.changes)) {
      if (!change || typeof change !== 'object') continue
      const converted = changeToEffect(change as Raw, result, str(rec.name) || '（未命名效果）')
      if (converted) out.push({ ...base, ...converted } as Effect)
    }
  }
  return out
}

function rangeOf(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== 'object') return undefined
  const rec = value as Raw
  const amount = number(rec.value) ?? number(rec.amount)
  return { type: str(rec.type) || 'point', ...(amount !== undefined ? { amount } : {}), ...(str(rec.units) ? { unit: str(rec.units) } : {}) }
}

function activityOf(raw: Raw, index: number, prefix: string): Activity | undefined {
  const type = str(raw.type)
  const activationRaw = raw.activation && typeof raw.activation === 'object' ? (raw.activation as Raw) : {}
  const typeMap: Record<string, 'action' | 'bonus' | 'reaction' | 'minute' | 'hour' | 'special'> = { action: 'action', bonus: 'bonus', reaction: 'reaction', minute: 'minute', hour: 'hour', special: 'special' }
  const activation = { type: typeMap[str(activationRaw.type)] ?? 'special', ...(number(activationRaw.value) ? { cost: number(activationRaw.value) } : {}) }
  const base = {
    id: `${prefix}.${index}`,
    name: str(raw.name) || `${prefix}${index ? `（${index + 1}）` : ''}`,
    activation,
    ...(rangeOf(raw.range) ? { range: rangeOf(raw.range) } : {}),
    ...(raw.target && typeof raw.target === 'object' ? { target: raw.target as Record<string, unknown> } : {}),
    ...(raw.duration && typeof raw.duration === 'object' ? { duration: raw.duration as Record<string, unknown> } : {}),
    ...(raw.uses && typeof raw.uses === 'object' ? { uses: foundryUses({ uses: raw.uses }) } : {}),
    ...(raw.consumption && typeof raw.consumption === 'object'
      ? { consumption: { targets: asList((raw.consumption as Raw).targets).map((target) => {
          const rec = target as Raw
          return { type: (str(rec.type) || 'resource') as 'uses' | 'spellSlot' | 'resource' | 'hitDie' | 'itemUses', value: typeof rec.value === 'number' ? Math.abs(rec.value) : str(rec.value), ...(str(rec.target) ? { target: str(rec.target) } : {}) }
        }) } }
      : {}),
  }
  if (type === 'attack') {
    const attack = raw.attack && typeof raw.attack === 'object' ? (raw.attack as Raw) : {}
    const kindMap: Record<string, 'mw' | 'rw' | 'ms' | 'rs'> = { mwak: 'mw', rwak: 'rw', msak: 'ms', rsak: 'rs' }
    return { ...base, kind: 'attack', attackKind: kindMap[str(attack.type)] ?? 'mw', ...(number(attack.bonus) ? { bonus: number(attack.bonus) } : {}), damage: damageParts(raw) } as Activity
  }
  if (type === 'save') {
    const save = raw.save && typeof raw.save === 'object' ? (raw.save as Raw) : {}
    const ability = (Array.isArray(save.ability) ? String(save.ability[0]) : str(save.ability)) as 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha'
    const dcRaw = save.dc && typeof save.dc === 'object' ? (save.dc as Raw) : {}
    const dc = number(dcRaw.value) ?? (typeof dcRaw.formula === 'string' ? safeFormula(dcRaw.formula) : undefined) ?? 'spell'
    const onSave = str((raw.damage as Raw | undefined)?.onSave) === 'half' ? 'half' : 'none'
    return { ...base, kind: 'save', ability, dc, onSave, damage: damageParts(raw) } as Activity
  }
  if (type === 'damage') {
    const parts = damageParts(raw)
    return parts.length ? ({ ...base, kind: 'damage', parts } as Activity) : undefined
  }
  if (type === 'heal') {
    const heal = raw.heal && typeof raw.heal === 'object' ? (raw.heal as Raw) : raw
    const formula = str((heal as Raw).formula) || '1'
    return { ...base, kind: 'heal', formula: safeFormula(formula) ?? '1' } as Activity
  }
  if (type === 'check') return { ...base, kind: 'check', ability: 'str' } as Activity
  if (type === 'cast') return undefined
  if (type === 'utility') return { ...base, kind: 'utility', text: str(raw.description) || base.name } as Activity
  return undefined
}

function damageParts(raw: Raw): Array<{ dice: string; type: DamageType }> {
  const damage = raw.damage && typeof raw.damage === 'object' ? (raw.damage as Raw) : {}
  const parts = asList(damage.parts)
  const out: Array<{ dice: string; type: DamageType }> = []
  for (const part of parts) {
    if (!part || typeof part !== 'object') continue
    const rec = part as Raw
    const custom = rec.custom && typeof rec.custom === 'object' ? (rec.custom as Raw) : undefined
    const rawFormula = str(custom?.formula) || str(rec.formula) || (number(rec.number) !== undefined ? `${number(rec.number)}d${number(rec.denomination) ?? 6}` : '')
    const formula = /^\d{0,2}d\d{1,3}(?:\s*[+-]\s*\d+)?$/i.test(rawFormula.trim()) ? rawFormula.replace(/\s+/g, '') : undefined
    const type = damageKey(asList(rec.types)[0]) ?? 'force'
    if (formula) out.push({ dice: formula, type: type as DamageType })
  }
  return out
}

export function foundryActivities(raw: Raw, prefix: string): Activity[] {
  return asList(raw.activities).flatMap((item, index) => {
    if (!item || typeof item !== 'object') return []
    const activity = activityOf(item as Raw, index, prefix)
    return activity ? [activity] : []
  })
}

export function foundryUses(raw: Raw): Uses | undefined {
  const system = raw.system && typeof raw.system === 'object' ? (raw.system as Raw) : raw
  const maxRaw = system['uses.max']
  const max = typeof maxRaw === 'string' ? safeFormula(maxRaw) : number(maxRaw)
  if (max === undefined) return undefined
  const recovery = asList(system['uses.recovery']).find((item) => item && typeof item === 'object') as Raw | undefined
  const period = str(recovery?.period)
  const recharge = RECOVERY_PERIOD[period] ?? (typeof max === 'string' && max.startsWith('scale.') ? 'long' : 'special')
  return { max, recharge, ...(str(system['uses.per']) ? { per: str(system['uses.per']) } : {}) }
}

const ABILITY_NAMES: Record<string, string> = { 力量: 'str', 敏捷: 'dex', 体质: 'con', 智力: 'int', 感知: 'wis', 魅力: 'cha' }

/** 正文里有明确次数/恢复方式的特性；只识别明确写法，不把“攻击一次”当资源。 */
export function usesFromText(text: string): Uses | undefined {
  const normalized = text.replace(/\s+/g, ' ')
  const n = normalized.match(/两次长休之间使用([一二三四五六七八九十\d]+)次/)
  if (n) {
    const map: Record<string, number> = { 一: 1, 二: 2, 两: 2, 三: 3, 四: 4 }
    return { max: map[n[1]] ?? Number(n[1]) ?? 1, recharge: 'long' }
  }
  const ability = normalized.match(/次数等于你的?(力量|敏捷|体质|智力|感知|魅力)调整值(?:（(?:至少|最少)(\d+)次）)?/)
  if (ability) {
    const key = ABILITY_NAMES[ability[1]] ?? 'cha'
    return { max: `max(${Number(ability[2] ?? 1)},${key}.mod)`, recharge: /长休/.test(normalized) ? 'long' : 'special' }
  }
  if (/次数等于你的?熟练加值|熟练加值次/.test(normalized)) return { max: 'prof', recharge: /长休/.test(normalized) ? 'long' : 'special' }
  if (/完成一次短休或长休后才能再次使用|完成一次长休或短休后才能再次使用|短休或长休后才能再次使用|完成一次短休或长休后.*恢复|完成一次长休或短休后.*恢复|完成一次短休或长休/.test(normalized)) return { max: 1, recharge: 'shortOrLong' }
  if (/完成一次长休后才能再次使用|完成一次长休后才能再?次?施展|完成一次长休前你都不能再次使用|直到(?:你)?完成一次长休|必须完成一次长休才能再次|完成一次长休后.*恢复.*次数|完成一次长休后.*重获.*次数/.test(normalized)) return { max: 1, recharge: 'long' }
  if (/完成一次短休后才能再次使用|直到完成一次短休/.test(normalized)) return { max: 1, recharge: 'short' }
  if (/每长休|每完成一次长休|长休后.*恢复.*次数/.test(normalized)) return { max: 1, recharge: 'long' }
  if (/每短休/.test(normalized)) return { max: 1, recharge: 'short' }
  if (/充能/.test(normalized)) return { max: 1, recharge: 'special' }
  if (/长休/.test(normalized) && /短休/.test(normalized) && !/法术位/.test(normalized)) return { max: 1, recharge: 'shortOrLong' }
  if (/完成一次长休|每长休|每次长休/.test(normalized) && !/法术位/.test(normalized)) return { max: 1, recharge: 'long' }
  if (/次数/.test(normalized) && !/法术位/.test(normalized)) return { max: 1, recharge: 'long' }
  if (/完成一次短休|每短休/.test(normalized) && !/法术位/.test(normalized)) return { max: 1, recharge: 'short' }
  if (/次数等于|次数为|次数等同于/.test(normalized)) return { max: 1, recharge: 'long' }
  return undefined
}

export function foundryRulesFor(raw: Raw): FoundryRules {
  const result: FoundryRules = { unmapped: new Map() }
  const uses = foundryUses(raw)
  const activities = foundryActivities(raw, str(raw.name) || 'feature')
  const effects = effectsOf(raw)
  return { ...(uses ? { uses } : {}), ...(effects.length ? { effects } : {}), ...(activities.length ? { activities } : {}), unmapped: result.unmapped }
}

export function foundryFeature(ctx: {
  classFeatures?: Raw[]
  subclassFeatures?: Raw[]
  feats?: Raw[]
  races?: Raw[]
  optionalFeatures?: Raw[]
  items?: Raw[]
}, raw: Raw, ownerType: string, source: string): Raw | undefined {
  const name = str(raw.name)
  if (ownerType === 'class') return ctx.classFeatures?.find((x) => str(x.name) === name && str(x.className) === str(raw.className) && str(x.classSource) === str(raw.classSource) && str(x.source) === source)
  if (ownerType === 'subclass') return ctx.subclassFeatures?.find((x) => str(x.name) === name && str(x.className) === str(raw.className) && str(x.classSource) === str(raw.classSource) && str(x.subclassShortName) === str(raw.subclassShortName) && str(x.subclassSource) === str(raw.subclassSource) && str(x.source) === source)
  if (ownerType === 'feat') return ctx.feats?.find((x) => str(x.name) === name && str(x.source) === source)
  if (ownerType === 'race') return ctx.races?.find((x) => str(x.name) === name && str(x.source) === source)
  if (ownerType === 'optional') return ctx.optionalFeatures?.find((x) => str(x.name) === name && str(x.source) === source)
  if (ownerType === 'item') return ctx.items?.find((x) => str(x.name) === name && str(x.source) === source)
  return undefined
}

export function dedupeEffects(effects: Array<Record<string, unknown>>): Array<Record<string, unknown>> {
  const seen = new Set<string>()
  return effects.filter((effect) => {
    const key = JSON.stringify({ ...effect, transfer: undefined })
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export { SKILLS }
