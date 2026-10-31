import 'fake-indexeddb/auto'
import { describe, expect, it } from 'vitest'
import { TrpgDatabase } from '../../src/core/db'
import { uuid } from '../../src/core/ids'
import { familiesOf, groupMembers, loreOf } from '../../src/ui/library/series'

describe('家族成员整理', () => {
  it('卓尔装备：按武器/护甲分组，同一基础物品的 +1 +2 +3 排成一行', () => {
    const members = [
      { id: 'a1', name: '卓尔装备·匕首 +1', baseItem: 'dagger', category: 'weapon' },
      { id: 'a2', name: '卓尔装备·匕首 +2', baseItem: 'dagger', category: 'weapon' },
      { id: 'a3', name: '卓尔装备·匕首 +3', baseItem: 'dagger', category: 'weapon' },
      { id: 'b1', name: '卓尔装备·胸甲 +1', baseItem: 'breastplate', category: 'armor' },
    ]
    const sections = groupMembers(members, { dagger: '匕首', breastplate: '胸甲' })
    expect(sections.map((s) => s.title)).toEqual(['武器', '护甲'])
    expect(sections[0].rows).toEqual([{ label: '匕首', links: [{ id: 'a1', text: '+1' }, { id: 'a2', text: '+2' }, { id: 'a3', text: '+3' }] }])
    expect(sections[1].rows[0].label).toBe('胸甲')
  })
  it('没有加值档的家族（龙鳞甲各颜色）：一行列完，链接文字是成员名', () => {
    const sections = groupMembers([{ id: 'r', name: '红龙鳞甲', category: 'armor' }, { id: 'b', name: '蓝龙鳞甲', category: 'armor' }], {})
    expect(sections).toHaveLength(1)
    expect(sections[0].rows).toHaveLength(1)
    expect(sections[0].rows[0].label).toBe('')
    expect(sections[0].rows[0].links.map((l) => l.text).sort()).toEqual(['红龙鳞甲', '蓝龙鳞甲'].sort())
  })
})

const row = (packId: string, entryId: string, type: string, name: string, data: Record<string, unknown>) => ({ packId, entryId, ruleId: 'dnd5e2014', type, name, keywords: [], unique: false, summary: '', data })

describe('按成员反查家族、背景描述的来源', () => {
  it('familiesOf：家族名去掉「（系列）」；换了已装包的组合后重新计算', async () => {
    const db = new TrpgDatabase(`s-${uuid()}`)
    await db.entries.bulkPut([
      row('mm', 'item.drow-equipment-family.mm', 'item', '卓尔装备（系列）', { category: 'family', members: ['item.dagger-drow-plus-1.mm'] }),
      row('mm', 'item.dagger-drow-plus-1.mm', 'item', '卓尔装备·匕首 +1', { category: 'weapon' }),
    ])
    expect(await familiesOf(db, 'dnd5e2014', 'a', 'item.dagger-drow-plus-1.mm')).toEqual([{ id: 'item.drow-equipment-family.mm', packId: 'mm', name: '卓尔装备' }])
    expect(await familiesOf(db, 'dnd5e2014', 'a', 'item.other')).toEqual([])
    await db.entries.delete(['mm', 'item.drow-equipment-family.mm'])
    expect(await familiesOf(db, 'dnd5e2014', 'a', 'item.dagger-drow-plus-1.mm')).toHaveLength(1) // 签名没变：用缓存
    expect(await familiesOf(db, 'dnd5e2014', 'b', 'item.dagger-drow-plus-1.mm')).toEqual([]) // 签名变了：重算
  })

  it('loreOf：条目自带的背景描述在前，别的包的补丁在后并带来源包；没有内容时为空', async () => {
    const db = new TrpgDatabase(`s-${uuid()}`)
    await db.entries.bulkPut([
      row('mm', 'lore.monster.aboleth.mm', 'lore', '底栖魔鱼', { target: 'monster.aboleth.srd', lore: [{ p: '在众神到来之前……' }] }),
    ])
    const own = { entryId: 'monster.aboleth.srd', data: { lore: [{ p: '自带' }] } }
    const got = await loreOf(db, 'dnd5e2014', 'x', own)
    expect(got).toEqual([{ blocks: [{ p: '自带' }] }, { packId: 'mm', blocks: [{ p: '在众神到来之前……' }] }])
    expect(await loreOf(db, 'dnd5e2014', 'x', { entryId: 'monster.lich.srd', data: {} })).toEqual([])
    expect(await loreOf(db, 'dnd5e2014', 'x', { entryId: 'monster.aboleth.srd', data: { lore: [] } })).toEqual([{ packId: 'mm', blocks: [{ p: '在众神到来之前……' }] }])
  })
})
