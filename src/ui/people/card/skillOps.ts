import type { SkillKey } from '../../../rules/dnd5e2014/data/enums'
import type { MonsterData } from '../../../rules/dnd5e2014/data/entries/spell-monster'

/** 技能弹窗的写入（U5R §10.8）：熟练等级写 proficiencies.skills，覆盖写 overrides.skills。纯函数。 */
type Level = 'half' | 'proficient' | 'expertise'
const clone = (b: MonsterData): MonsterData => JSON.parse(JSON.stringify(b)) as MonsterData

/** ○ → ● → ◆ → ○；◐ 点变 ●。切到 ○ 时删掉这一项（含自动来源）；顺手清掉模板写死的总值。 */
export function cycleSkill(block: MonsterData, skill: SkillKey): MonsterData {
  const next = clone(block)
  const rows = next.proficiencies?.skills ?? []
  const found = rows.find((r) => r.skill === skill)
  const set = (level: Level | null): void => {
    const others = rows.filter((r) => r.skill !== skill)
    next.proficiencies = { ...(next.proficiencies ?? {}), skills: level ? [...others, { skill, level, sources: found?.sources?.length ? found.sources : [{ kind: 'manual' as const }] }] : others }
  }
  if (!found) set('proficient')
  else if (found.level === 'half') set('proficient')
  else if (found.level === 'proficient') set('expertise')
  else set(null)
  if (next.skills) { delete next.skills[skill]; if (Object.keys(next.skills).length === 0) delete next.skills }
  return next
}
export function setSkillOverride(block: MonsterData, skill: SkillKey, value: number | null): MonsterData {
  const next = clone(block)
  const o = { ...(next.overrides ?? {}) } as { skills?: Record<string, number> }
  const skills = { ...(o.skills ?? {}) }
  if (value === null || !Number.isFinite(value)) delete skills[skill]; else skills[skill] = Math.trunc(value)
  if (Object.keys(skills).length) o.skills = skills; else delete o.skills
  next.overrides = o as MonsterData['overrides']
  if (next.overrides && Object.keys(next.overrides).length === 0) delete next.overrides
  return next
}
/** [清除手动修正]：只清覆盖，不动熟练图标。 */
export function clearSkillOverrides(block: MonsterData): MonsterData {
  const next = clone(block)
  if (next.overrides) { delete next.overrides.skills; if (Object.keys(next.overrides).length === 0) delete next.overrides }
  return next
}
export const overrideCount = (block: MonsterData): number => Object.keys(block.overrides?.skills ?? {}).length
