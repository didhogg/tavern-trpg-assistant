import { describe, expect, it } from 'vitest'
import { byLevel, classLines, classTable, flattenFeatures } from '../../src/ui/libview/class-data'

const cls = { hd: { number: 1, faces: 6 }, proficiency: ['int', 'wis'], classFeatures: [[{ name: '奥术回想', level: 1, entries: ['a'] }, { name: '施法', level: 1, entries: [] }], [{ name: '奥术传承', level: 2, entries: [] }]], classTableGroups: [{ colLabels: ['已知戏法'], rows: [[3], [3]] }] }
describe('职业页纯处理', () => {
  it('嵌套的特性按等级分组', () => {
    expect(byLevel(flattenFeatures(cls.classFeatures)).map((g) => [g.level, g.features.length])).toEqual([[1, 2], [2, 1]])
  })
  it('职业表：等级 / 特性 / 作者额外列', () => {
    const t = classTable(cls)
    expect(t.head).toEqual(['等级', '特性', '已知戏法'])
    expect(t.rows[0]).toEqual([1, '奥术回想，施法', 3])
    expect(t.rows[1]).toEqual([2, '奥术传承', 3])
    expect(t.rows.length).toBe(20)
  })
  it('带熟练加值列', () => {
    const t = classTable(cls, Array.from({ length: 20 }, (_, i) => `+${2 + Math.floor(i / 4)}`))
    expect(t.head).toEqual(['等级', '熟练加值', '特性', '已知戏法'])
    expect(t.rows[0]).toEqual([1, '+2', '奥术回想，施法', 3])
  })
  it('摘要：生命骰与豁免熟练', () => {
    expect(classLines(cls)).toEqual([{ label: '生命骰', value: '1d6' }, { label: '豁免熟练', value: '智力、感知' }])
  })
  it('读不到就空', () => { expect(classLines(null)).toEqual([]); expect(classTable(null).rows.length).toBe(20) })
})
