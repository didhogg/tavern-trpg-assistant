import { describe, expect, it, beforeAll } from 'vitest'
import { addListItem, addProficiency, addSense, removeItem, senseRows, setSenseRange, setToolLevel } from '../../src/ui/people/card/archiveOps'
import { archiveOf } from '../../src/ui/people/card/archive'
import type { MonsterData } from '../../src/rules/dnd5e2014/data/entries/spell-monster'
import type { Person } from '../../src/schemas/people'
import { loadSenseDefsFromSrd } from './helpers-sense'

const block = (over: Partial<MonsterData> = {}): MonsterData => ({ senses: [], languages: [], resist: [], immune: [], vulnerable: [], conditionImmune: [], ...over }) as MonsterData
const person = (b: MonsterData): Person => ({ id: 'p', name: '甲', categoryId: 'party', tags: [], pinned: false, hp: { current: null, temp: 0, deathSaves: { success: 0, fail: 0 } }, effects: [], block: b, giveAi: 'auto', createdAt: 0, touchedAt: 0 }) as Person

beforeAll(() => loadSenseDefsFromSrd())

describe('U5R 档案写入', () => {
  it('抗性 / 免疫 / 状态免疫：加一次只出现一次，移除后不见', () => {
    let b = addListItem(block(), 'resist', 'fire')
    b = addListItem(b, 'resist', 'fire')
    expect(b.resist).toEqual(['fire'])
    expect(removeItem(b, 'resist', 'fire').resist).toEqual([])
    expect(addListItem(block(), 'condition', 'charmed').conditionImmune).toEqual(['charmed'])
  })
  it('感官：同一种只有一行；改距离；读得出英文旧写法', () => {
    let b = addSense(block(), 'darkvision')
    expect(senseRows(b)).toMatchObject([{ key: 'darkvision', range: 60 }])
    expect(addSense(b, 'darkvision')).toBe(b)
    b = setSenseRange(b, 0, 120)
    expect(b.senses).toEqual(['黑暗视觉 120 尺'])
    expect(senseRows(block({ senses: ['darkvision 60 ft.'] }))[0]).toMatchObject({ key: 'darkvision', range: 60 })
    expect(setSenseRange(b, 0, -3)).toBe(b)
  })
  it('熟练：手动添加带 manual 来源；重复添加不重复；工具可切专精；移除', () => {
    let b = addProficiency(block(), { category: 'languages', key: 'elvish', label: '精灵语' })
    b = addProficiency(b, { category: 'languages', key: 'elvish', label: '精灵语' })
    expect(b.proficiencies?.languages).toEqual([{ id: 'elvish', sources: [{ kind: 'manual' }] }])
    b = addProficiency(b, { category: 'tools', key: 'item.thieves-tools.phb', ref: 'item.thieves-tools.phb', label: '盗贼工具' })
    b = setToolLevel(b, 'item.thieves-tools.phb', 'expertise')
    expect(b.proficiencies?.tools?.[0]?.level).toBe('expertise')
    expect(removeItem(b, 'languages', 'elvish').proficiencies?.languages).toEqual([])
  })
  it('档案三卡的数据：空类不出现、来源写明', () => {
    const p = person(block({ resist: ['fire'], proficiencies: { languages: [{ id: 'elvish', sources: [{ kind: 'auto', from: 'race:race.elf.phb' }] }] } as never }))
    const cards = archiveOf(p, (id) => (id === 'race.elf.phb' ? '精灵' : id ?? ''))
    expect(cards.map((c) => c.key)).toEqual(['defense', 'senses', 'proficiency'])
    expect(cards[0]!.groups.find((g) => g.key === 'resist')!.items[0]).toMatchObject({ label: '火焰', source: '手动添加' })
    expect(cards[2]!.groups.find((g) => g.key === 'languages')!.items[0]!.source).toBe('来自 精灵')
    expect(cards[1]!.groups[0]!.items).toEqual([])
  })
})
