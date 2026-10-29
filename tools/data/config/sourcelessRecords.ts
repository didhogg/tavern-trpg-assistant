/** 没有 source/inherits.source 的记录：逐项登记来源与页码依据。 */
export interface SourcelessSource {
  file: string
  key: string
  book: string
  page: number
  basis: string
}

export const SOURCELESS_RECORDS: SourcelessSource[] = [
  { file: 'life.json', key: 'lifeTrinket', book: 'PHB', page: 160, basis: 'PHB 第 160–161 页「饰品」表，100 项，与记录逐项对应' },
  { file: 'loot.json', key: 'dragonMundaneItems', book: 'FTD', page: 72, basis: 'FTD 第 72 页龙族宝藏表引用的普通物品子表；D1.2b 来源，矩阵扫描但 D1.2a 跳过' },
  { file: 'monsterfeatures.json', key: 'monsterfeatures', book: 'DMG', page: 280, basis: 'DMG 第 280 页「Monster Features」表；中文版同表第 207 页' },
  { file: 'msbcr.json', key: 'cr', book: 'DMG', page: 274, basis: 'DMG 第 274 页「Monster Statistics by Challenge Rating」表，34 行与记录一致' }
]

export function sourcelessFor(file: string, key: string): SourcelessSource | undefined {
  return SOURCELESS_RECORDS.find((x) => x.file === file && x.key === key)
}
