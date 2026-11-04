import { describe, expect, it } from 'vitest'
import { buildGlossary, parserConsts, parserTable, termsFromRuleEntries } from '../../tools/data/convert/glossary'

const CN = `
Parser.SZ_TINY = "T";
Parser.SZ_LARGE = "L";
Parser.SKL_ABV_ABJ = "A";
Parser.SKL_ABJ = "防护";
Parser.TP_UNDEAD = "undead";
Parser.SIZE_ABV_TO_FULL = {
	[Parser.SZ_TINY]: "微型",
	[Parser.SZ_LARGE]: "大型",
};
Parser._ALIGNMENT_ABV_TO_FULL = {
	"L": "守序",
	// "special" values
	"U": "无阵营",
};
Parser.DMG_TYPE_TO_EN = {
	"强酸": "acid",
	"暗蚀": "necrotic",
};
Parser.ATB_ABV_TO_FULL = {
	"str": "力量",
};
Parser.MON_TYPE_TO_PLURAL = {};
Parser.MON_TYPE_TO_PLURAL[Parser.TP_UNDEAD] = "亡灵";
Parser.SP_SCHOOL_ABV_TO_FULL = {};
Parser.SP_SCHOOL_ABV_TO_FULL[Parser.SKL_ABV_ABJ] = Parser.SKL_ABJ;
Parser.WEAPON_CATEGORY_TO_FULL = { "simple": "简易" };
Parser.RARITIES_TO_CN = { "common": "常见" };
Parser.SPEED_TO_CN = { "walk": "步行" };
Parser.TOOLS_TO_CN = { "thieves' tools": "盗贼工具" };
`
const EN = `
Parser.SKL_ABV_ABJ = "A";
Parser.SKL_ABJ = "Abjuration";
Parser.SZ_TINY = "T";
Parser.SZ_LARGE = "L";
Parser.SIZE_ABV_TO_FULL = { [Parser.SZ_TINY]: "Tiny", [Parser.SZ_LARGE]: "Large" };
Parser._ALIGNMENT_ABV_TO_FULL = { "L": "lawful", "U": "unaligned" };
Parser.ATB_ABV_TO_FULL = { "str": "Strength" };
Parser.SP_SCHOOL_ABV_TO_FULL = {};
Parser.SP_SCHOOL_ABV_TO_FULL[Parser.SKL_ABV_ABJ] = Parser.SKL_ABJ;
`

describe('名称表输出（D5）', () => {
  it('读 parser.js 的三种写法：引号键、[常量] 键、逐行赋值；值可以是常量；跳过注释行', () => {
    const consts = parserConsts(CN)
    expect(parserTable(CN, 'SIZE_ABV_TO_FULL', consts)).toEqual([['T', '微型'], ['L', '大型']])
    expect(parserTable(CN, '_ALIGNMENT_ABV_TO_FULL', consts)).toEqual([['L', '守序'], ['U', '无阵营']])
    expect(parserTable(CN, 'MON_TYPE_TO_PLURAL', consts)).toEqual([['undead', '亡灵']])
    expect(parserTable(CN, 'SP_SCHOOL_ABV_TO_FULL', consts)).toEqual([['A', '防护']])
  })

  it('找不到表、引用了读不到的常量，都直接报错（不静默、不补）', () => {
    expect(() => parserTable(CN, 'NOPE', parserConsts(CN))).toThrow('没有读到名称表')
    expect(() => parserTable('Parser.X = {\n\t[Parser.MISSING]: "甲",\n};', 'X', new Map())).toThrow('读不到的常量')
  })

  it('生成名称表条目：伤害类型用英文代码、学派用英文小写全名、体型与阵营带英文名', () => {
    const g = buildGlossary(CN, EN, [])
    const by = (k: string) => g.find((e) => e.data.glossary === k)!
    expect(by('damage-type').data.terms).toEqual([{ code: 'acid', name: '强酸', nameEn: 'Acid' }, { code: 'necrotic', name: '暗蚀', nameEn: 'Necrotic' }])
    expect(by('spell-school').data.terms).toEqual([{ code: 'abjuration', name: '防护', nameEn: 'Abjuration', abbr: 'A' }])
    expect(by('size').data.terms).toEqual([{ code: 'T', name: '微型', nameEn: 'Tiny' }, { code: 'L', name: '大型', nameEn: 'Large' }])
    expect(by('alignment').data.terms).toEqual([{ code: 'L', name: '守序', nameEn: 'lawful' }, { code: 'U', name: '无阵营', nameEn: 'unaligned' }])
    expect(by('creature-type').data.terms).toEqual([{ code: 'undead', name: '亡灵', nameEn: 'Undead' }])
    expect(by('tool').data.terms).toEqual([{ code: "thieves' tools", name: '盗贼工具', nameEn: "Thieves' Tools" }])
    const e = by('size')
    expect(e).toMatchObject({ id: 'rule.glossary-size.phb', type: 'rule', data: { category: 'glossary', credit: { srd: true }, src: { book: 'PHB' } } })
  })

  it('武器特性与护甲类别从已转换的规则条目整理（PHB 优先，缩写去掉来源后缀）', () => {
    const rule = (id: string, name: string, nameEn: string, data: Record<string, unknown>) => ({ id, name, nameEn, data })
    const t = termsFromRuleEntries([
      rule('rule.item-property-ammunition.dmg', '弹药(DMG)', 'Ammunition', { category: 'itemProperty', abbreviation: 'A' }),
      rule('rule.item-property-ammunition.phb', '弹药', 'Ammunition', { category: 'itemProperty', abbreviation: 'A' }),
      rule('rule.item-property-burst-fire.dmg', '扫射', 'Burst Fire', { category: 'itemProperty', abbreviation: 'BF|DMG' }),
      rule('rule.item-type-light-armor.phb', '轻甲', 'Light Armor', { category: 'itemType', abbreviation: 'LA' }),
      rule('rule.item-type-shield.phb', '盾牌', 'Shield', { category: 'itemType', abbreviation: 'S' }),
    ])
    expect(t.weaponProperty).toEqual([{ code: 'A', name: '弹药', nameEn: 'Ammunition' }, { code: 'BF', name: '扫射', nameEn: 'Burst Fire' }])
    expect(t.armorCategory).toEqual([{ code: 'light', name: '轻甲', nameEn: 'Light Armor' }, { code: 'shield', name: '盾牌', nameEn: 'Shield' }])
  })
})
