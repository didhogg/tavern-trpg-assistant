type Raw = Record<string, unknown>

/**
 * 「系列」：一条通用魔法变体（如卓尔 +1/+2/+3 的武器与护甲）展开成上百个具体物品后，用一个「家族」条目把它们归在一起。
 * 新增系列 = 在这里加一项；变体按英文名匹配，名称、说明、排除条件都在这里写明。
 */
export interface VariantSeries {
  key: string
  /** 匹配变体的英文名；第 1 个捕获组是加值档（1/2/3），第 2 个是类别（Weapon/Armor）。 */
  variant: RegExp
  source: string
  page: number
  /** 家族条目在编号里的名字（`item.<slug>-family.<来源>`），也是英文名的 slug 依据。 */
  familyEn: string
  zh: { series: string; sep: string; kind: Record<string, string>; note: string }
  en: { series: string; sep: string; kind: Record<string, string>; note: string }
  /** 系列不适用的基础物品（除了变体自己 excludes 的）。 */
  excludeBase: (base: Raw) => boolean
}

export const VARIANT_SERIES: VariantSeries[] = [
  {
    key: 'drow-equipment',
    variant: /^Drow \+([123]) (Weapon|Armor)$/,
    source: 'MM',
    page: 126,
    familyEn: 'Drow Equipment',
    zh: { series: '卓尔装备', sep: '·', kind: { Weapon: '武器', Armor: '护甲' }, note: '每种武器与护甲都有 +1、+2、+3 三档。' },
    en: { series: 'Drow Equipment', sep: ': ', kind: { Weapon: 'Weapon', Armor: 'Armor' }, note: 'Every weapon and armor comes in +1, +2 and +3 versions.' },
    // 卓尔装备是幻想时代的武器与护甲，不含城主指南里的现代、未来枪械
    excludeBase: (base) => base.firearm === true,
  },
]

export const SERIES_BY_KEY = new Map(VARIANT_SERIES.map((s) => [s.key, s]))
