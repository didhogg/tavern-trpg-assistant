import 'fake-indexeddb/auto'
import { describe, expect, it } from 'vitest'
import { TrpgDatabase } from '../../src/core/db'
import { uuid } from '../../src/core/ids'
import { joinersOf, optionalFeaturesFact } from '../../src/ui/library/joins'

const row = (packId: string, entryId: string, name: string, data: Record<string, unknown>) => ({ packId, entryId, ruleId: 'dnd5e2014', type: 'feature', name, keywords: [], unique: false, summary: '', data })

describe('joins 反查与「可选特性」一行', () => {
  it('joinersOf：按目标收集已装包里登记加入它的特性，按等级与名字排序；换了已装包的组合后重算', async () => {
    const db = new TrpgDatabase(`j-${uuid()}`)
    await db.entries.bulkPut([
      row('tce', 'feature.b.tce', '替换戏法', { joins: [{ to: 'class.cleric.phb', level: 4, as: 'optional' }] }),
      row('tce', 'feature.a.tce', '神力掌控', { joins: [{ to: 'class.cleric.phb', level: 2, as: 'optional' }] }),
      row('hb', 'feature.c.hb', '自制特性', { joins: [{ to: 'class.cleric.phb', level: 2, as: 'optional', replaces: 'feature.x.phb' }, { to: 'class.wizard.phb', level: 1, as: 'optional' }] }),
      row('phb', 'feature.plain.phb', '普通特性', {}),
    ])
    const got = await joinersOf(db, 'dnd5e2014', 'sig1', 'class.cleric.phb')
    expect(got.map((j) => `${j.level}:${j.name}`)).toEqual(['2:神力掌控', '2:自制特性', '4:替换戏法'])
    expect(got[1]).toMatchObject({ packId: 'hb', replaces: 'feature.x.phb' })
    expect(await joinersOf(db, 'dnd5e2014', 'sig1', 'class.rogue.phb')).toEqual([])
    await db.entries.delete(['tce', 'feature.a.tce'])
    expect(await joinersOf(db, 'dnd5e2014', 'sig1', 'class.cleric.phb')).toHaveLength(3) // 签名没变：用缓存
    expect((await joinersOf(db, 'dnd5e2014', 'sig2', 'class.cleric.phb')).map((j) => j.name)).toEqual(['自制特性', '替换戏法'])
  })

  it('optionalFeaturesFact：没有登记时没有这一行；有登记时按等级分组，名字干净，包名是灰色小字，取代关系写在后面', () => {
    expect(optionalFeaturesFact([], (p) => p)).toBeUndefined()
    expect(optionalFeaturesFact([{ id: 'o1', packId: 'tce', name: '图腾选项', level: 3, as: 'option' }], (p) => p)).toBeUndefined()
    const fact = optionalFeaturesFact([
      { id: 'a', packId: 'tce', name: '神力掌控', level: 2, as: 'optional' },
      { id: 'b', packId: 'hb', name: '自制特性', level: 2, as: 'optional', replaces: 'feature.x.phb' },
      { id: 'c', packId: 'tce', name: '替换戏法', level: 4, as: 'optional' },
    ], (p) => ({ tce: '塔莎的万事坩埚', hb: '我的包' }[p] ?? p))!
    expect(fact.label).toBe('可选特性')
    expect(fact.parts).toEqual(['\n2 级：', { ref: 'a', label: '神力掌控', sub: '塔莎的万事坩埚' }, '、', { ref: 'b', label: '自制特性', sub: '我的包' }, '（替代 ', { ref: 'feature.x.phb' }, '）', '\n4 级：', { ref: 'c', label: '替换戏法', sub: '塔莎的万事坩埚' }])
    expect(JSON.stringify(fact)).not.toMatch(/可选 ·|需要《/) // 名字里不出现任何括号说明
  })
})
