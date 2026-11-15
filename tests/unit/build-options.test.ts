// P6 建卡额外必选项（build-options.ts）：作者条目写法 → 子职业 / 专长 / 可选特性。形状取自真实库条目（牧师、战士、法师、变体人类）。
import { describe, expect, it } from 'vitest'
import { candidatesOf, extrasOf } from '../../src/rules/kernel/build-options'

const feature = (name: string, level: number, gain = false) => ({ name, level, ...(gain ? { gainSubclassFeature: true } : {}) })
const cleric = { name: 'Cleric', source: 'PHB', subclassTitle: 'Divine Domain', classFeatures: [[feature('Spellcasting', 1), feature('Divine Domain', 1, true)], [feature('Channel Divinity', 2)]] }
const fighter = { name: 'Fighter', source: 'PHB', subclassTitle: 'Martial Archetype', optionalfeatureProgression: [{ name: 'Fighting Style', featureType: ['FS:F'], progression: { 1: 1 } }], classFeatures: [[feature('Fighting Style', 1)], [], [feature('Martial Archetype', 3, true)]] }
const wizard = { name: 'Wizard', source: 'PHB', subclassTitle: 'Arcane Tradition', classFeatures: [[feature('Arcane Recovery', 1)], [feature('Arcane Tradition', 2, true)]] }

describe('P6 建卡额外必选项', () => {
  it('子职业：1 级就要选的才算（牧师 1、战士 3、法师 2）', () => {
    expect(extrasOf('class', cleric).extras).toEqual([{ kind: 'subclass', title: 'Divine Domain', count: 1, className: 'Cleric', classSource: 'PHB' }])
    expect(extrasOf('class', fighter).extras.some((x) => x.kind === 'subclass')).toBe(false)
    expect(extrasOf('class', wizard).extras).toEqual([])
  })
  it('可选特性：取 1 级的数量（对象或数组两种写法）', () => {
    expect(extrasOf('class', fighter).extras).toEqual([{ kind: 'optionalfeature', title: 'Fighting Style', count: 1, featureType: ['FS:F'] }])
    expect(extrasOf('class', { optionalfeatureProgression: [{ name: 'X', featureType: ['A'], progression: [2, 0, 3] }] }).extras[0]).toMatchObject({ count: 2 })
    expect(extrasOf('class', { optionalfeatureProgression: [{ name: 'Y', featureType: ['A'], progression: { 2: 1 } }] }).extras).toEqual([])
  })
  it('种族专长：任选 N 个；认不出的写法进 unsupported，不静默漏掉', () => {
    expect(extrasOf('race', { feats: [{ any: 1 }] }).extras).toEqual([{ kind: 'feat', title: '专长', count: 1 }])
    const odd = extrasOf('race', { feats: [{ scale: true }] })
    expect(odd.extras).toEqual([])
    expect(odd.unsupported).toHaveLength(1)
    expect(extrasOf('race', {}).extras).toEqual([])
  })
  it('候选：子职业按所属职业筛、可选特性按类型筛、专长全列并标没筛前置', async () => {
    const rows: Record<string, Array<{ ref: { set: string; prop: string; hash: string }; item: Record<string, unknown>; source: string }>> = {
      subclass: [{ ref: { set: 's', prop: 'subclass', hash: 'a' }, item: { name: '生命领域', className: '牧师', classSource: 'PHB' }, source: 'PHB' }, { ref: { set: 's', prop: 'subclass', hash: 'b' }, item: { name: '武艺', className: '战士', classSource: 'PHB' }, source: 'PHB' }],
      optionalfeature: [{ ref: { set: 's', prop: 'optionalfeature', hash: 'c' }, item: { name: '箭术', featureType: ['FS:F'] }, source: 'PHB' }, { ref: { set: 's', prop: 'optionalfeature', hash: 'd' }, item: { name: '呼啸', featureType: ['EI'] }, source: 'PHB' }],
      feat: [{ ref: { set: 's', prop: 'feat', hash: 'e' }, item: { name: '警觉' }, source: 'PHB' }],
    }
    const q = async (prop: string) => rows[prop]
    const sub = await candidatesOf({ kind: 'subclass', title: 'd', count: 1, className: 'Cleric', classSource: 'PHB' }, ['牧师', 'Cleric'], q)
    expect(sub.candidates.map((c) => c.name)).toEqual(['生命领域'])
    const opt = await candidatesOf({ kind: 'optionalfeature', title: 'x', count: 1, featureType: ['FS:F'] }, [], q)
    expect(opt.candidates.map((c) => c.name)).toEqual(['箭术'])
    const feat = await candidatesOf({ kind: 'feat', title: '专长', count: 1 }, [], q)
    expect(feat.unfiltered).toBe(true)
    expect(feat.candidates).toHaveLength(1)
  })
})
