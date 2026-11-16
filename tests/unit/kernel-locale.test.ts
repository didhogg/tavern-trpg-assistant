// 中文战役显示文字：同一编号的中英条目，按「英文版里的位置 → 中文版同一位置」换回中文（src/rules/kernel/locale.ts）。
import { describe, expect, it } from 'vitest'
import { localizeAll, zhAt } from '../../src/rules/kernel/locale'

// 作者数据原样节选（侍僧 PHB、牧师 PHB 的中英两版）
const acolyteEn = { name: 'Acolyte', startingEquipment: [{ _: [{ item: 'holy symbol|phb', displayName: 'holy symbol (a gift to you when you entered the priesthood)' }, { special: 'sticks of incense', quantity: 5 }, { special: 'vestments' }] }] }
const acolyteZh = { name: '侍僧', ENG_name: 'Acolyte', startingEquipment: [{ _: [{ item: '圣徽|phb', displayName: '圣徽（出任神职时的礼物）' }, { special: '熏香', quantity: 5 }, { special: '祭袍' }] }] }
const clericEn = { name: 'Cleric', classTableGroups: [{ colLabels: ['{@filter Cantrips Known|spells|level=0|class=Cleric}'] }] }
const clericZh = { name: '牧师', classTableGroups: [{ colLabels: ['{@filter 已知戏法|spells|level=0|class=牧师}'] }] }

describe('zhAt：同编号条目同位置取中文', () => {
  it('小窗改过大小写的特殊物品名、备注名也能对上', () => {
    expect(zhAt(acolyteEn, acolyteZh, 'Sticks of Incense')).toBe('熏香')
    expect(zhAt(acolyteEn, acolyteZh, 'Holy Symbol (A Gift to You When You Entered the Priesthood)')).toBe('圣徽（出任神职时的礼物）')
  })
  it('作者标签里的文字：职业表列名', () => {
    expect(zhAt(clericEn, clericZh, 'Cantrips Known')).toBe('已知戏法')
  })
  it('英文版里没有这段文字 / 没有中文条目 → null', () => {
    expect(zhAt(acolyteEn, acolyteZh, 'Skills')).toBeNull()
    expect(zhAt(acolyteEn, null, 'Vestments')).toBeNull()
  })
  it('同一段英文在两处、中文不同 → 不换', () => {
    expect(zhAt({ a: ['x', 'x'] }, { a: ['甲', '乙'] }, 'x')).toBeNull()
    expect(zhAt({ a: ['x', 'x'] }, { a: ['甲', '甲'] }, 'x')).toBe('甲')
  })
  it('中英相同的位置（编号）不算译文：标题 Breath 和编号 breath 同在一条记录里', () => {
    const en = { advancement: [{ title: 'Breath', configuration: { identifier: 'breath' } }] }
    const zh = { advancement: [{ title: '吐息', configuration: { identifier: 'breath' } }] }
    expect(zhAt(en, zh, 'Breath')).toBe('吐息')
  })
  it('结构对不上（数组长短不同）的那一段不取', () => {
    expect(zhAt({ a: ['x'] }, { a: ['甲', '乙'] }, 'x')).toBeNull()
  })
})

describe('localizeAll：小窗结果统一出口（不分类型）', () => {
  const pairs = [{ en: acolyteEn, zh: acolyteZh }, { en: clericEn, zh: clericZh }]
  // 小窗交回的形状原样节选：起始装备选项 + 建卡步骤
  const result = {
    sections: [{ refKey: 'k', groups: [{ index: 0, choices: [{ key: '_', entries: [
      { index: 0, kind: 'item', uid: 'holy symbol|phb', displayName: 'Holy Symbol (A Gift to You When You Entered the Priesthood)', raw: { displayName: 'holy symbol (a gift to you when you entered the priesthood)' } },
      { index: 1, kind: 'special', quantity: 5, text: 'Sticks of Incense' },
    ] }] }] }],
    steps: [{ type: 'ScaleValue', title: 'Cantrips Known' }, { type: 'Trait', title: 'Saving Throws', value: 'skills:his' }],
  }
  it('显示文字换中文，编号字段和原样数据不动', () => {
    const out = localizeAll(result, pairs)
    const [e0, e1] = out.sections[0].groups[0].choices[0].entries
    expect(e0.displayName).toBe('圣徽（出任神职时的礼物）')
    expect(e0.uid).toBe('holy symbol|phb')
    expect(e0.raw?.displayName).toBe('holy symbol (a gift to you when you entered the priesthood)')
    expect(e1.text).toBe('熏香')
    expect(out.steps[0].title).toBe('已知戏法')
    expect(out.steps[1].title).toBe('Saving Throws')
    expect(out.steps[1].value).toBe('skills:his')
  })
  it('没有中文条目（英文战役 / 本来就交中文）→ 原样返回', () => {
    expect(localizeAll(result, [{ en: acolyteEn, zh: null }])).toBe(result)
  })
})
