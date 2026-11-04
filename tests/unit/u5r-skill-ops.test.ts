import { describe, expect, it } from 'vitest'
import { clearSkillOverrides, cycleSkill, overrideCount, setSkillOverride } from '../../src/ui/people/card/skillOps'
import type { MonsterData } from '../../src/rules/dnd5e2014/data/entries/spell-monster'

const b = (over: object = {}): MonsterData => ({ speed: {}, senses: [], languages: [], ...over }) as unknown as MonsterData
describe('U5R 技能写入', () => {
  it('○→●→◆→○ 循环；◐ 变 ●；删除时连自动来源一起去掉', () => {
    let x = cycleSkill(b(), 'arcana'); expect(x.proficiencies?.skills?.[0]).toMatchObject({ skill: 'arcana', level: 'proficient', sources: [{ kind: 'manual' }] })
    x = cycleSkill(x, 'arcana'); expect(x.proficiencies?.skills?.[0]?.level).toBe('expertise')
    x = cycleSkill(x, 'arcana'); expect(x.proficiencies?.skills).toEqual([])
    const half = b({ proficiencies: { skills: [{ skill: 'history', level: 'half', sources: [{ kind: 'auto', from: 'class:class.bard.phb' }] }] } })
    const full = cycleSkill(half, 'history'); expect(full.proficiencies?.skills?.[0]).toMatchObject({ level: 'proficient', sources: [{ kind: 'auto', from: 'class:class.bard.phb' }] })
  })
  it('点图标会清掉模板写死的总值', () => {
    const x = cycleSkill(b({ skills: { stealth: 6, perception: 4 } }), 'stealth')
    expect(x.skills).toEqual({ perception: 4 })
  })
  it('覆盖：写入 / 清空 / 全部清除不动熟练', () => {
    let x = setSkillOverride(cycleSkill(b(), 'arcana'), 'arcana', 9)
    expect(x.overrides?.skills).toEqual({ arcana: 9 }); expect(overrideCount(x)).toBe(1)
    x = clearSkillOverrides(x)
    expect(x.overrides).toBeUndefined(); expect(x.proficiencies?.skills).toHaveLength(1)
    expect(setSkillOverride(x, 'arcana', null).overrides).toBeUndefined()
  })
})
