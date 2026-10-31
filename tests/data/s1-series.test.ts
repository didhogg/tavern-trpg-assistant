import { describe, expect, it } from 'vitest'
import { allEntries } from './r9-pack-helpers'

type Rec = Record<string, unknown>

/** S1 增补 B：卓尔装备系列（改名、家族条目、不含枪械）。说明句只来自 5etools 数据里变体自带的文字，不用官方书的译文。 */
describe('S1 卓尔装备系列', () => {
  const entries = allEntries()
  const byId = new Map(entries.map((e) => [e.id, e]))
  const family = byId.get('item.drow-equipment-family.mm')!
  const drowItems = entries.filter((e) => e.type === 'item' && /-drow-plus-\d\.mm$/.test(e.id))

  it('家族条目：在怪物图鉴包，名称「卓尔装备（系列）」，成员 = 全部卓尔具体物品，且都存在', () => {
    expect(family).toBeDefined()
    expect(family.name).toBe('卓尔装备（系列）')
    expect(family.nameEn).toBe('Drow Equipment (Family)')
    const members = (family.data as Rec).members as string[]
    expect(new Set(members)).toEqual(new Set(drowItems.map((e) => e.id)))
    for (const id of members) expect(byId.has(id), id).toBe(true)
    expect((family.data as Rec).category).toBe('family')
  })

  it('命名：「卓尔装备·匕首 +1」「Drow Equipment: Dagger +1」；母条目「卓尔装备·武器 +1」；编号不变', () => {
    expect(byId.get('item.dagger-drow-plus-1.mm')!.name).toBe('卓尔装备·匕首 +1')
    expect(byId.get('item.dagger-drow-plus-1.mm')!.nameEn).toBe('Drow Equipment: Dagger +1')
    expect(byId.get('item.breastplate-drow-plus-3.mm')!.name).toBe('卓尔装备·胸甲 +3')
    expect(byId.get('item.drow-plus-1-weapon.mm')!.name).toBe('卓尔装备·武器 +1')
    expect(byId.get('item.drow-plus-2-armor.mm')!.nameEn).toBe('Drow Equipment: Armor +2')
    for (const e of drowItems) {
      expect(e.name, e.id).toMatch(/^卓尔装备·.+ \+[123]$/)
      expect(e.nameEn, e.id).toMatch(/^Drow Equipment: .+ \+[123]$/)
    }
  })

  it('不含枪械：卓尔装备的基础物品没有 firearm 类，且每个展开物都指向存在的母条目与基础物品', () => {
    for (const e of drowItems) {
      expect(byId.has(String((e.data as Rec).variantOf)), e.id).toBe(true)
      expect(byId.has(String((e.data as Rec).baseItem)), e.id).toBe(true)
      expect(e.id, e.id).not.toMatch(/rifle|pistol|musket|revolver|shotgun|laser/)
    }
  })

  it('家族正文是数据里的说明句（含「+X」），不含官方书译文的特有措辞', () => {
    const text = JSON.stringify((family.data as Rec).text)
    expect(text).toContain('+X')
    expect(text).toContain('阳光')
    expect(text).not.toContain('一名 卓尔 drow')
  })

  it('全库没有名字形如「+数字紧接字母或汉字」，也没有含汉字的英文名（只有中文的别名除外已改写）', () => {
    for (const e of entries) {
      expect(e.name, e.id).not.toMatch(/\+\d[A-Za-z一-鿿]/)
      expect(e.nameEn ?? '', e.id).not.toMatch(/[一-鿿]/)
      expect(e.nameEn ?? '', e.id).not.toMatch(/\+\d[A-Za-z]/)
    }
  })
})
