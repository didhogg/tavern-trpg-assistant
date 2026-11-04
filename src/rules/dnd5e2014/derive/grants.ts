import type { Proficiencies } from '../data/entries/sheet'
import { ABILITY_KEYS, ARMOR_LABELS, LANGUAGE_LABELS, SKILLS, TOOL_LABELS, WEAPON_CATEGORY_LABELS, type AbilityKey } from '../data/enums'
import type { BackgroundData, ClassData, RaceData } from '../data/entries/character'

/** 种族 / 职业 / 背景选用后「可分配」的熟练项（U5R §10.3）。纯函数；界面与 e2e 只调这里。 */
export type GrantKind = 'race' | 'subrace' | 'class' | 'background'
export type GrantCategory = 'skills' | 'saves' | 'languages' | 'weapons' | 'armor' | 'tools'
export interface Grant {
  category: GrantCategory
  /** 同类别内的唯一键：技能 / 属性 / 语言键 / 护甲类别 / 武器类别或条目编号或名字 / 工具条目编号或名字。 */
  key: string
  label: string
  ref?: string
  name?: string
  weaponCategory?: 'simple' | 'martial'
}
export interface GrantChoice {
  /** 稳定编号：`{category}`，同类别多处补选合并数量。 */
  id: string
  category: GrantCategory
  count: number
  /** 可选范围；空 = 不限（界面从枚举全集里选）。 */
  from: string[]
  label: string
}
export type GrantPicks = Partial<Record<GrantCategory, string[]>>

export function sourceTag(kind: GrantKind, entryId: string): string { return `${kind}:${entryId}` }

const REF = /^\{\{ref:([^|}]+)\|([^}]*)\}\}$/

function weaponGrant(raw: string): Grant {
  const text = raw.trim()
  const ref = REF.exec(text)
  if (ref) return { category: 'weapons', key: ref[1]!, ref: ref[1], label: ref[2] || ref[1]! }
  for (const [code, label] of Object.entries(WEAPON_CATEGORY_LABELS)) {
    if (text.startsWith(label)) return { category: 'weapons', key: code, weaponCategory: code as 'simple' | 'martial', label: `${label}武器` }
  }
  return { category: 'weapons', key: text, name: text, label: text }
}
function toolGrant(raw: string): Grant {
  const text = raw.trim()
  const ref = REF.exec(text)
  if (ref) return { category: 'tools', key: ref[1]!, ref: ref[1], label: ref[2] || ref[1]! }
  return { category: 'tools', key: text, name: text, label: TOOL_LABELS[text] ?? text }
}
function skillGrant(key: string): Grant | null {
  return key in SKILLS ? { category: 'skills', key, label: SKILLS[key as keyof typeof SKILLS].label } : null
}
function languageGrant(key: string): Grant { return { category: 'languages', key, label: LANGUAGE_LABELS[key] ?? key } }

type Group = string[] | { fixed?: string[]; choose?: { count: number; from?: string[] } } | undefined
function groupParts(group: Group): { fixed: string[]; choose?: { count: number; from: string[] } } {
  if (!group) return { fixed: [] }
  if (Array.isArray(group)) return { fixed: group }
  return { fixed: group.fixed ?? [], choose: group.choose ? { count: group.choose.count, from: group.choose.from ?? [] } : undefined }
}

interface Plan { fixed: Grant[]; choices: GrantChoice[] }
function mergeChoice(plan: Plan, category: GrantCategory, count: number, from: string[], label: string): void {
  const found = plan.choices.find((c) => c.category === category)
  if (found) { found.count += count; found.from = [...new Set([...found.from, ...from])] } else plan.choices.push({ id: category, category, count, from, label })
}

function racePlan(data: RaceData | undefined): Plan {
  const plan: Plan = { fixed: [], choices: [] }
  if (!data) return plan
  const langs = data.languages
  if (Array.isArray(langs)) plan.fixed.push(...langs.map(languageGrant))
  else {
    plan.fixed.push(...(langs.fixed ?? []).map(languageGrant))
    if (langs.choose) mergeChoice(plan, 'languages', langs.choose, [], '语言')
  }
  const prof = data.proficiencies
  if (!Array.isArray(prof)) {
    const sk = groupParts(prof.skills); plan.fixed.push(...sk.fixed.map(skillGrant).filter((g): g is Grant => g !== null)); if (sk.choose) mergeChoice(plan, 'skills', sk.choose.count, sk.choose.from, '技能')
    const tl = groupParts(prof.tools); plan.fixed.push(...tl.fixed.map(toolGrant)); if (tl.choose) mergeChoice(plan, 'tools', tl.choose.count, tl.choose.from, '工具')
    const wp = groupParts(prof.weapons); plan.fixed.push(...wp.fixed.map(weaponGrant)); if (wp.choose) mergeChoice(plan, 'weapons', wp.choose.count, wp.choose.from, '武器')
    const ar = groupParts(prof.armor); plan.fixed.push(...ar.fixed.filter((a) => a in ARMOR_LABELS).map((a): Grant => ({ category: 'armor', key: a, label: ARMOR_LABELS[a]! })))
  }
  return plan
}

function backgroundPlan(data: BackgroundData | undefined): Plan {
  const plan: Plan = { fixed: [], choices: [] }
  if (!data) return plan
  const sk = groupParts(data.proficiencies.skills); plan.fixed.push(...sk.fixed.map(skillGrant).filter((g): g is Grant => g !== null)); if (sk.choose) mergeChoice(plan, 'skills', sk.choose.count, sk.choose.from, '技能')
  const tl = groupParts(data.proficiencies.tools); plan.fixed.push(...tl.fixed.map(toolGrant)); if (tl.choose) mergeChoice(plan, 'tools', tl.choose.count, tl.choose.from, '工具')
  const lg = groupParts(data.proficiencies.languages); plan.fixed.push(...lg.fixed.map(languageGrant)); if (lg.choose) mergeChoice(plan, 'languages', lg.choose.count, lg.choose.from, '语言')
  return plan
}

function classPlan(data: ClassData | undefined): Plan {
  const plan: Plan = { fixed: [], choices: [] }
  if (!data) return plan
  plan.fixed.push(...data.saves.map((a): Grant => ({ category: 'saves', key: a, label: `${a.toUpperCase()} 豁免` })))
  const p = data.proficiencies
  plan.fixed.push(...p.armor.filter((a) => a in ARMOR_LABELS).map((a): Grant => ({ category: 'armor', key: a, label: ARMOR_LABELS[a]! })))
  plan.fixed.push(...p.weapons.map(weaponGrant))
  plan.fixed.push(...p.tools.filter((t) => REF.test(t.trim())).map(toolGrant))
  if (p.skills) mergeChoice(plan, 'skills', p.skills.choose, p.skills.from, '技能')
  if (p.toolChoose) mergeChoice(plan, 'tools', p.toolChoose.count, p.toolChoose.from.map((f) => f.replace(/^tool:/, '')), '工具')
  return plan
}

type AnyEntry = RaceData | ClassData | BackgroundData | undefined
function planOf(kind: GrantKind, entry: AnyEntry): Plan {
  if (kind === 'class') return classPlan(entry as ClassData | undefined)
  if (kind === 'background') return backgroundPlan(entry as BackgroundData | undefined)
  return racePlan(entry as RaceData | undefined)
}

/** 选用后还要玩家补选的项（技能 / 语言 / 工具 / 武器的「任选 N」）。 */
export function grantChoices(kind: GrantKind, entry: AnyEntry): GrantChoice[] { return planOf(kind, entry).choices }

/** 应分配集合 = 固定项 + 补选结果；同键只留一条。 */
export function grantsOf(kind: GrantKind, entry: AnyEntry, picks: GrantPicks = {}): Grant[] {
  const plan = planOf(kind, entry)
  const out = [...plan.fixed]
  for (const choice of plan.choices) {
    for (const key of picks[choice.category] ?? []) {
      out.push(choice.category === 'skills' ? (skillGrant(key) ?? { category: 'skills', key, label: key })
        : choice.category === 'languages' ? languageGrant(key)
          : choice.category === 'tools' ? toolGrant(key)
            : choice.category === 'weapons' ? weaponGrant(key)
              : { category: choice.category, key, label: key })
    }
  }
  const seen = new Set<string>()
  return out.filter((g) => { const id = `${g.category}:${g.key}`; if (seen.has(id)) return false; seen.add(id); return true })
}

// ── 写入 / 移除（对 block.proficiencies 的纯函数）──────────────────────────────

type Row = { sources?: Array<{ kind: string; from?: string }>; [k: string]: unknown }
const KEYER: Record<GrantCategory, (row: Row) => string> = {
  skills: (r) => String(r.skill), saves: (r) => String(r.ability), languages: (r) => String(r.id),
  weapons: (r) => String(r.ref ?? r.category ?? r.name), armor: (r) => String(r.category), tools: (r) => String(r.ref ?? r.name),
}
const CATEGORIES: GrantCategory[] = ['skills', 'saves', 'languages', 'weapons', 'armor', 'tools']

function rowsOf(prof: Proficiencies | undefined, cat: GrantCategory): Row[] { return ((prof as Record<string, Row[] | undefined> | undefined)?.[cat]) ?? [] }
function rowFor(grant: Grant, sources: Row['sources']): Row {
  switch (grant.category) {
    case 'skills': return { skill: grant.key, level: 'proficient', sources }
    case 'saves': return { ability: grant.key, sources }
    case 'languages': return { id: grant.key, sources }
    case 'armor': return { category: grant.key, sources }
    case 'weapons': return grant.ref ? { ref: grant.ref, sources } : grant.weaponCategory ? { category: grant.weaponCategory, sources } : { name: grant.name ?? grant.key, sources }
    case 'tools': return grant.ref ? { ref: grant.ref, level: 'proficient', sources } : { name: grant.name ?? grant.key, level: 'proficient', sources }
  }
}

/** 把一组应分配项写进熟练表；已有同键行只补来源，不重复；返回新对象。 */
export function assignGrants(prof: Proficiencies | undefined, grants: Grant[], from: string): Proficiencies {
  const next: Record<string, Row[]> = {}
  for (const cat of CATEGORIES) { const rows = rowsOf(prof, cat); if (rows.length) next[cat] = rows.map((r) => ({ ...r, sources: [...(r.sources ?? [])] })) }
  for (const grant of grants) {
    const rows = (next[grant.category] ??= [])
    const found = rows.find((r) => KEYER[grant.category](r) === grant.key)
    if (!found) { rows.push(rowFor(grant, [{ kind: 'auto', from }])); continue }
    const has = (found.sources ?? []).some((s) => s.kind === 'auto' && s.from === from)
    if (!has) found.sources = [...(found.sources ?? []), { kind: 'auto', from }]
  }
  return next as Proficiencies
}

export interface Stale { category: GrantCategory; key: string; /** row：整行移除；source：只摘掉这个来源，行留着（还有别的来源）。 */ action: 'row' | 'source' }

/** 更换来源时「应移除集合」：带这个自动来源的行；有别的来源的只摘来源，没有的整行移除（手动加的行不动）。 */
export function staleSources(prof: Proficiencies | undefined, from: string): Stale[] {
  const out: Stale[] = []
  for (const cat of CATEGORIES) {
    for (const row of rowsOf(prof, cat)) {
      const src = row.sources ?? []
      if (!src.some((s) => s.kind === 'auto' && s.from === from)) continue
      const left = src.filter((s) => !(s.kind === 'auto' && s.from === from))
      out.push({ category: cat, key: KEYER[cat](row), action: left.length === 0 ? 'row' : 'source' })
    }
  }
  return out
}

export function removeStale(prof: Proficiencies | undefined, from: string): Proficiencies {
  const stale = new Map(staleSources(prof, from).map((s) => [`${s.category}:${s.key}`, s.action]))
  const next: Record<string, Row[]> = {}
  for (const cat of CATEGORIES) {
    const rows: Row[] = []
    for (const row of rowsOf(prof, cat)) {
      const action = stale.get(`${cat}:${KEYER[cat](row)}`)
      if (action === 'row') continue
      rows.push(action === 'source' ? { ...row, sources: (row.sources ?? []).filter((s) => !(s.kind === 'auto' && s.from === from)) } : row)
    }
    if (rows.length) next[cat] = rows
  }
  return next as Proficiencies
}

/** 可恢复集合 = 应分配 − 已有（按键判断；手动加的同键行算已有）。 */
export function restorable(prof: Proficiencies | undefined, expected: Grant[]): Grant[] {
  return expected.filter((g) => !rowsOf(prof, g.category).some((r) => KEYER[g.category](r) === g.key))
}

// ── 属性点数池（U5R §10.5）─────────────────────────────────────────────────────

export interface PoolState {
  /** 池里每个数的值（如标准数组 15,14,13,12,10,8）。 */
  pool: number[]
  /** 属性 → 占用的池序号。 */
  placed: Partial<Record<AbilityKey, number>>
}

export function poolUsed(state: PoolState): Set<number> { return new Set(Object.values(state.placed)) }
/** 把池里第 index 个数放进某属性；该数已被别的属性占用时先让出来；该属性原有的数回池。 */
export function poolPlace(state: PoolState, ability: AbilityKey, index: number): PoolState {
  if (index < 0 || index >= state.pool.length) return state
  const placed = { ...state.placed }
  for (const key of ABILITY_KEYS) if (placed[key] === index) delete placed[key]
  placed[ability] = index
  return { pool: state.pool, placed }
}
/** 再点一次：退回池。 */
export function poolReturn(state: PoolState, ability: AbilityKey): PoolState {
  const placed = { ...state.placed }
  delete placed[ability]
  return { pool: state.pool, placed }
}
export function poolValue(state: PoolState, ability: AbilityKey): number | null {
  const i = state.placed[ability]
  return i === undefined ? null : state.pool[i]!
}
export function poolComplete(state: PoolState): boolean { return ABILITY_KEYS.every((k) => state.placed[k] !== undefined) }
