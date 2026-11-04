import type { MonsterData } from '../../../rules/dnd5e2014/data/entries/spell-monster'
import type { BackgroundData, ClassData, RaceData } from '../../../rules/dnd5e2014/data/entries/character'
import type { AbilityKey } from '../../../rules/dnd5e2014/data/enums'
import { ABILITY_KEYS } from '../../../rules/dnd5e2014/data/enums'
import { assignGrants, grantsOf, removeStale, sourceTag, staleSources, type Grant, type GrantPicks, type Stale } from '../../../rules/dnd5e2014/derive'
import type { Person } from '../../../schemas/people'

/** 种族 / 职业 / 背景的「选择 → 补选 → 分配」写入，以及单职业升降级的写入（U5R §10.2、§10.3）。纯函数；界面与 e2e 只调这里。 */
export interface EntrySource { raceOf: (id?: string) => RaceData | undefined; backgroundOf: (id?: string) => BackgroundData | undefined; classOf: (id?: string) => ClassData | undefined; nameOf: (id?: string) => string }
export type FlowKind = 'race' | 'class' | 'background'
export interface FlowInput { kind: FlowKind; id: string; subId?: string; picks?: GrantPicks; /** false = 「只选用，先不分配」。 */ assign: boolean; selected?: string[]; removeOld?: boolean }
const clone = (b: MonsterData): MonsterData => JSON.parse(JSON.stringify(b)) as MonsterData
export const grantId = (g: Grant): string => `${g.category}:${g.key}`

/** 当前（旧）选择带来的来源标签，用来「移除旧来源内容」。 */
export function oldSources(block: MonsterData, kind: FlowKind): string[] {
  if (kind === 'race') return [block.race ? sourceTag('race', block.race) : '', block.subrace ? sourceTag('subrace', block.subrace) : ''].filter(Boolean)
  if (kind === 'background') return block.background ? [sourceTag('background', block.background)] : []
  return (block.classes ?? []).map((c) => sourceTag('class', c.class))
}

export interface FlowPlan { remove: Array<{ from: string; stale: Stale[] }>; write: Array<{ grant: Grant; from: string }> }
/** 分配页要显示的内容：要移除的（旧来源）与要写入的（新来源，已展开补选）。 */
export function planFlow(block: MonsterData, src: EntrySource, input: FlowInput): FlowPlan {
  const remove = oldSources(block, input.kind).map((from) => ({ from, stale: staleSources(block.proficiencies, from) })).filter((r) => r.stale.length)
  const write: FlowPlan['write'] = []
  if (input.kind === 'race') {
    write.push(...grantsOf('race', src.raceOf(input.id), input.picks).map((grant) => ({ grant, from: sourceTag('race', input.id) })))
    if (input.subId) write.push(...grantsOf('subrace', src.raceOf(input.subId), input.picks).map((grant) => ({ grant, from: sourceTag('subrace', input.subId!) })))
  } else if (input.kind === 'class') write.push(...grantsOf('class', src.classOf(input.id), input.picks).map((grant) => ({ grant, from: sourceTag('class', input.id) })))
  else write.push(...grantsOf('background', src.backgroundOf(input.id), input.picks).map((grant) => ({ grant, from: sourceTag('background', input.id) })))
  return { remove, write }
}

export function applyFlow(block: MonsterData, src: EntrySource, input: FlowInput): MonsterData {
  const plan = planFlow(block, src, input)
  let next = clone(block)
  const selectedOnly = new Set(input.selected ?? [])
  if (input.assign && input.removeOld !== false) {
    let prof = next.proficiencies
    for (const r of plan.remove) prof = removeStale(prof, r.from)
    next.proficiencies = prof
  }
  if (input.kind === 'race') { next.race = input.id; if (input.subId) next.subrace = input.subId; else delete next.subrace }
  else if (input.kind === 'background') next.background = input.id
  else {
    const level = next.classes?.[0]?.level ?? 1
    next.classes = [{ class: input.id, level }] as MonsterData['classes']
  }
  if (input.assign) {
    let prof = next.proficiencies
    const by = new Map<string, Grant[]>()
    for (const w of plan.write) if (selectedOnly.has(grantId(w.grant))) by.set(w.from, [...(by.get(w.from) ?? []), w.grant])
    for (const [from, grants] of by) prof = assignGrants(prof, grants, from)
    next.proficiencies = prof
  }
  if (next.proficiencies && Object.keys(next.proficiencies).length === 0) delete next.proficiencies
  return next
}

// ── 单职业升降级 ──────────────────────────────────────────────────────────────
export interface LevelPlanInput {
  to: number
  /** 升级掷骰：总等级 → 掷出的点数；没写的级数取平均。 */
  rolls?: Record<number, number>
  /** 属性值提升：级数 → 两个属性（相同 = +2，不同 = 各 +1）。 */
  asi?: Record<number, [AbilityKey, AbilityKey]>
  /** 降级时是否移除这些级带来的内容（属性提升）。 */
  removeOnDown?: boolean
  /** 当前最终属性值（超 20 不加）。 */
  finals?: Partial<Record<AbilityKey, number>>
  /** 应用后的生命上限（用来压当前生命）。 */
  newMax?: number | null
}
export interface LevelResult {
  block: MonsterData
  hpRolls?: Person['hpRolls']
  asiLog?: Person['asiLog']
  hitDiceUsed?: Person['hitDiceUsed']
  /** 压过的当前生命；null 表示不动。 */
  hpCurrent: number | null
  skipped: Array<{ level: number; ability: AbilityKey }>
}
export function applyLevels(person: Pick<Person, 'block' | 'hpRolls' | 'asiLog' | 'hitDiceUsed' | 'hp'>, entry: ClassData, input: LevelPlanInput): LevelResult {
  const block = clone(person.block)
  const row = block.classes?.[0]
  if (!row) return { block, hpCurrent: null, skipped: [] }
  const from = row.level
  const to = Math.max(1, Math.min(20, input.to))
  row.level = to
  const hpRolls = { ...(person.hpRolls ?? {}) }
  const asiLog = { ...(person.asiLog ?? {}) }
  const growth = { ...((block as unknown as { abilityGrowth?: Partial<Record<AbilityKey, number>> }).abilityGrowth ?? {}) }
  const skipped: LevelResult['skipped'] = []
  if (to > from) {
    for (const [lv, roll] of Object.entries(input.rolls ?? {})) if (Number(lv) > from && Number(lv) <= to) hpRolls[lv] = roll
    for (const [lv, pair] of Object.entries(input.asi ?? {})) {
      const level = Number(lv)
      if (level <= from || level > to) continue
      const gain: Partial<Record<AbilityKey, number>> = {}
      for (const a of pair) gain[a] = (gain[a] ?? 0) + 1
      let applied = false
      for (const a of ABILITY_KEYS) {
        const inc = gain[a]; if (!inc) continue
        if ((input.finals?.[a] ?? 0) + inc > 20) { skipped.push({ level, ability: a }); continue }
        growth[a] = (growth[a] ?? 0) + inc; applied = true
      }
      if (applied) asiLog[lv] = pair
    }
  } else if (to < from) {
    for (const lv of Object.keys(hpRolls)) if (Number(lv) > to) delete hpRolls[lv]
    for (const [lv, pair] of Object.entries(asiLog)) {
      if (Number(lv) <= to) continue
      if (input.removeOnDown !== false) for (const a of pair) { growth[a] = (growth[a] ?? 0) - 1; if (!growth[a]) delete growth[a] }
      delete asiLog[lv]
    }
  }
  const loose = block as unknown as { abilityGrowth?: Partial<Record<AbilityKey, number>> }
  if (Object.keys(growth).length) loose.abilityGrowth = growth; else delete loose.abilityGrowth
  const used = { ...(person.hitDiceUsed ?? {}) }
  const key = String(entry.hitDie)
  if (used[key] !== undefined) used[key] = Math.min(used[key]!, to)
  const cur = person.hp.current
  const hpCurrent = cur !== null && input.newMax !== undefined && input.newMax !== null && cur > input.newMax ? input.newMax : null
  return { block, hpRolls: Object.keys(hpRolls).length ? hpRolls : undefined, asiLog: Object.keys(asiLog).length ? asiLog : undefined, hitDiceUsed: Object.keys(used).length ? used : undefined, hpCurrent, skipped }
}
