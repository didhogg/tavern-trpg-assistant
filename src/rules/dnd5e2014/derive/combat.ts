import { withOverride, type AbilityResult, type AcResult, type DeriveContext, type DerivePerson, type HpResult, type Part, type SpeedResult } from './types'
import { crValue } from './abilities'

const SPEED_KEYS = ['walk', 'fly', 'swim', 'climb', 'burrow'] as const

/** U5 §6.6：UNIT2 只算无护甲 10 + 敏捷；模板怪物直接用它的 ac[0]。 */
export function deriveAc(person: DerivePerson, ctx: DeriveContext, abilities: Record<string, AbilityResult>): AcResult {
  const override = person.block.overrides?.ac
  if (override !== undefined) return { value: override, from: '覆盖', override: true, sources: [`覆盖 ${override}`], parts: [{ label: '覆盖', amount: override, kind: 'override' }] }
  const template = crValue(person) !== null
  if (template) {
    const ac = person.block.ac?.[0]
    if (!ac) return { value: null, from: '', override: false, sources: [], parts: [] }
    return { value: ac.value, from: ac.from ?? '模板', override: false, sources: [`模板 ${ac.value}${ac.from ? `（${ac.from}）` : ''}`], parts: [{ label: ac.from ? `模板（${ac.from}）` : '模板', amount: ac.value, kind: 'base' }] }
  }
  const dex = abilities.dex?.modifier ?? null
  if (dex === null) return { value: null, from: '', override: false, sources: [], parts: [] }
  let value = 10 + dex
  const sources = [`10 + 敏捷 ${dex >= 0 ? '+' : ''}${dex}`]
  const parts: Part[] = [{ label: '无甲 10', amount: 10, kind: 'base' }, { label: '敏捷调整值', amount: dex, kind: 'add' }]
  for (const effect of ctx.equipmentEffects) {
    if (effect.kind === 'ac' && effect.mode === 'bonus' && typeof effect.amount === 'number') {
      value += effect.amount
      sources.push(`效果 ${effect.amount >= 0 ? '+' : ''}${effect.amount}`)
      parts.push({ label: '效果', amount: effect.amount, kind: 'add' })
    }
  }
  const adjust = person.block.adjust?.ac
  if (adjust) { value += adjust; sources.push(`其他 ${adjust > 0 ? '+' : ''}${adjust}`); parts.push({ label: '其他', amount: adjust, kind: 'add' }) }
  return { value, from: adjust ? '敏捷 + 其他' : '敏捷', override: false, sources, parts }
}

function hpEffects(ctx: DeriveContext): { perLevel: number; flat: number } {
  let perLevel = 0
  let flat = 0
  for (const effect of ctx.equipmentEffects) {
    if (effect.kind !== 'hpMax') continue
    if (typeof effect.perLevel === 'number') perLevel += effect.perLevel
    if (typeof effect.flat === 'number') flat += effect.flat
  }
  return { perLevel, flat }
}

/** 读 `2d6+0` 这类生命骰式，只取骰数与骰面；读不出就不显示。 */
function diceFromFormula(formula: string | undefined): Array<{ sides: number; total: number }> {
  if (!formula) return []
  const match = /^\s*(\d+)d(\d+)/i.exec(formula)
  if (!match) return []
  const total = Number(match[1])
  const sides = Number(match[2])
  return total > 0 && sides > 0 ? [{ sides, total }] : []
}

export function deriveHp(person: DerivePerson, ctx: DeriveContext, abilities: Record<string, AbilityResult>): HpResult {
  const override = person.block.overrides?.hpMax
  const con = abilities.con?.modifier ?? null
  const classes = ctx.classes.filter((row) => row.level > 0)
  const dice = new Map<number, { total: number; used: number }>()
  const hitUsed = person.hitDiceUsed ?? {}
  let max: number | null
  const sources: string[] = []
  let parts: Part[] = []
  if (override !== undefined) {
    max = override
    sources.push(`覆盖 ${override}`)
  } else if (classes.length > 0) {
    if (classes.some((row) => !row.entry) || con === null) {
      max = null
    } else {
      let total = 0
      let first = true
      let nth = 0
      for (const row of classes) {
        const entry = row.entry!
        const die = entry.hitDie
        let portion = 0
        for (let level = 1; level <= row.level; level++) {
          nth += 1
          const rolled = first ? undefined : person.hpRolls?.[String(nth)]
          const roll = first ? die : rolled ?? Math.floor(die / 2) + 1
          first = false
          const gain = Math.max(1, roll + con)
          portion += gain
          sources.push(`${sources.length === 0 ? '1 级' : '升级'} d${die} ${roll} + 体质 ${con >= 0 ? '+' : ''}${con} = ${gain}`)
          parts.push({ label: `${nth} 级 d${die} ${rolled !== undefined ? '掷出 ' : ''}${roll} + 体质 ${con >= 0 ? '+' : ''}${con}`, amount: gain, kind: parts.length === 0 ? 'base' : 'add' })
        }
        total += portion
        dice.set(die, { total: (dice.get(die)?.total ?? 0) + row.level, used: dice.get(die)?.used ?? 0 })
      }
      const effects = hpEffects(ctx)
      const extra = effects.perLevel * Math.min(20, classes.reduce((n, row) => n + row.level, 0)) + effects.flat
      if (extra) {
        total += extra
        sources.push(`效果 ${extra >= 0 ? '+' : ''}${extra}`)
        parts.push({ label: '效果', amount: extra, kind: 'add' })
      }
      for (const adj of person.hpAdj ?? []) {
        const amount = (adj.flat ?? 0) + (adj.perLevel ?? 0) * nth
        if (!amount) continue
        total += amount
        sources.push(`${adj.label} ${amount >= 0 ? '+' : ''}${amount}`)
        parts.push({ label: adj.source ? `${adj.label}（${adj.source}）` : adj.label, amount, kind: 'add' })
      }
      max = total
    }
  } else {
    const average = person.block.hp?.average ?? 0
    max = average > 0 ? average : null
    if (max !== null) { sources.push(`模板 ${max}`); parts.push({ label: '模板平均', amount: max, kind: 'base' }) }
    for (const row of diceFromFormula(person.block.hp?.formula)) dice.set(row.sides, { total: row.total, used: 0 })
  }
  for (const [sides, count] of Object.entries(person.hitDiceOverride ?? {})) {
    const die = Number(sides)
    if (Number.isInteger(die) && die > 0) dice.set(die, { total: count, used: 0 })
  }
  if (max === null) { sources.length = 0; parts = [] }
  if (override !== undefined) parts = withOverride(parts, override)
  return {
    value: max,
    sources,
    parts,
    dice: [...dice.entries()].sort((a, b) => a[0] - b[0]).map(([sides, row]) => ({ sides, total: row.total, used: Math.min(row.total, hitUsed[String(sides)] ?? 0) })),
  }
}

export function deriveSpeed(person: DerivePerson, ctx: DeriveContext): SpeedResult {
  const sources: string[] = []
  const partsOut: SpeedResult['parts'] = {}
  const others: SpeedResult['others'] = {}
  let walk: number | null = null
  for (const mode of SPEED_KEYS) {
    const raw = person.block.speed?.[mode]
    let value: number | null = typeof raw === 'number' && Number.isFinite(raw) ? raw : null
    let parts: Part[] = value === null ? [] : [{ label: '设定', amount: value, kind: 'base' }]
    if (mode === 'walk' && value === null) {
      value = ctx.subrace?.speed?.walk ?? ctx.race?.speed?.walk ?? null
      if (value !== null) { sources.push(`种族步行 ${value}`); parts = [{ label: '种族', amount: value, kind: 'base' }] }
    }
    const adjust = person.block.adjust?.speed?.[mode]
    if (adjust) { value = (value ?? 0) + adjust; sources.push(`${mode} 其他 ${adjust > 0 ? '+' : ''}${adjust}`); parts.push({ label: '其他', amount: adjust, kind: 'add' }) }
    const override = person.block.overrides?.speed?.[mode]
    if (override !== undefined) { value = override; sources.push(`${mode} 覆盖 ${override}`); parts = withOverride(parts, override) }
    if (parts.length > 0) partsOut[mode] = parts
    if (mode === 'walk') walk = value
    else if (value !== null && value > 0) others[mode] = value
  }
  return { walk, parts: partsOut, others, sources }
}
