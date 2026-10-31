import type { Raw, RawData } from '../extract/load'
import { VARIANT_SERIES, type VariantSeries } from '../config/series'
import { expandMagicVariants } from './items'

const str = (value: unknown): string => (typeof value === 'string' ? value : '')
const isObj = (value: unknown): value is Raw => !!value && typeof value === 'object' && !Array.isArray(value)

function seriesOf(variant: Raw): { series: VariantSeries; bonus: string; kind: string } | undefined {
  for (const series of VARIANT_SERIES) {
    const m = series.variant.exec(str(variant.ENG_name))
    if (m) return { series, bonus: m[1], kind: m[2] }
  }
  return undefined
}

/**
 * 加载数据后、规划之前：把「系列」变体改名（卓尔装备·匕首 +1），并把系列的家族条目加进 itemGroups。
 * 变体的英文名（ENG_name）不动，所以所有编号不变。中文与英文那一遍都走这里，用各自语言的名称。
 */
export function applyVariantSeries(data: RawData): RawData {
  const lang = process.env.TRPG_DATA_LANG === 'en' ? 'en' : 'zh'
  for (const series of VARIANT_SERIES) {
    const mine = data.magicVariants.filter((v) => seriesOf(v)?.series === series)
    if (!mine.length) continue
    const text = series[lang]
    for (const variant of mine) {
      const { bonus, kind } = seriesOf(variant)!
      const inherits = isObj(variant.inherits) ? variant.inherits : (variant.inherits = {}) as Raw
      inherits.namePrefix = `${text.series}${text.sep}`
      inherits.nameSuffix = ` +${bonus}`
      variant.name = `${text.series}${text.sep}${text.kind[kind]} +${bonus}`
      variant._series = series.key
    }
    // 家族的成员：用同一套展开逻辑算出具体物品的名字
    const members = expandMagicVariants({ items: [], baseItems: data.baseItems, magicVariants: mine }).items.map((item) => str(item.name))
    const lines = [text.note]
    for (const kind of ['Weapon', 'Armor']) {
      const first = mine.find((v) => seriesOf(v)?.kind === kind && seriesOf(v)?.bonus === '1')
      const entries = isObj(first?.inherits) && Array.isArray(first!.inherits.entries) ? (first!.inherits.entries as unknown[]) : []
      for (const line of entries) if (typeof line === 'string') lines.push(line.replace(/\{=bonus\w+\}/g, '+X'))
    }
    data.itemGroups.push({ name: text.series, ENG_name: series.familyEn, source: series.source, page: series.page, type: 'IG', entries: lines, items: members, _series: series.key })
  }
  return data
}
