export type Counter = Record<string, number>

export interface OldEntry {
  pack: string
  id: string
  type: string
  name: string
  nameEn: string
  book: string
  /** 旧条目 data 的顶层字段名（用来看"旧转换器给它加了什么标记"，不手写字段清单） */
  keys: string[]
  /** 旧条目自己写的署名（data.credit.by） */
  credit: string
}

/** T3 记录索引里的一行（所有源、所有形状）。 */
export interface NewRec { repo: string; category: string; name: string; nameEn: string; source: string; edition: string; shape: string }

/** 旧条目在新源里的去向。 */
export type Fate = 'sameBook' | 'elsewhere' | 'homebrewOnly' | 'nowhere'

export interface TypeRow {
  type: string
  total: number
  sameBook: number
  elsewhere: number
  homebrewOnly: number
  nowhere: number
  /** 对不上的条目里，宽松口径（只比字母和数字）也对不上的条数 */
  looseGone: number
  /** 名字在官方数据别处出现的位置：字段 / 所属结构类型 / 顶层或嵌套（取前 3） */
  elsewhereWhere: Array<[string, number]>
  /** 会消失的旧条目里，比"找到的"明显更常带的字段（旧转换器加的标记） */
  markers: Array<{ key: string; vanished: number; found: number }>
  credits: Array<[string, number]>
  examples: Record<Fate, Array<{ name: string; nameEn: string; book: string; credit: string }>>
}

export interface BookRow {
  book: string
  name: string
  nameEn: string
  edition: string
  oldPacks: string[]
  oldEntries: number
  sameBook: number
  newRecords: number
  newOnly: number
}

export interface CategoryRow {
  category: string
  inScope: number
  matched: number
  newOnly: number
  newOnlyByEdition: Array<[string, number]>
  outOfScope: number
}

export interface Vanish { id: string; type: string; name: string; nameEn: string; book: string; fate: Fate; credit: string }

export interface CompareResult {
  oldFingerprint: string
  newIndexSha256: string
  repos: Array<{ id: string; records: number; files: number }>
  oldPacks: number
  oldEntries: number
  oldBooks: number
  fates: Record<Fate, number>
  /** 严格口径（英文名转小写 + 同一本书）对不上的条数 = 上限；宽松口径（只比字母和数字）仍对不上的条数 = 下限参考 */
  goneStrict: number
  goneLoose: number
  /** 按书/按类别统计所用的官方仓库（去重合并） */
  officialRepos: string[]
  /** 旧条目名字在官方数据里出现过的字段名（程序统计，不是手写清单） */
  nameKeys: Array<[string, number]>
  creditAll: Array<[string, number]>
  creditVanished: Array<[string, number]>
  newOutOfScopeBooks: number
  newOutOfScopeRecords: number
  perBook: BookRow[]
  perType: TypeRow[]
  perCategory: CategoryRow[]
  vanish: Vanish[]
}
