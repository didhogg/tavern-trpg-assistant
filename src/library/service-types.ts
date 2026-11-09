// 【库】服务交出去的数据形状（插件自己的查询结果外壳；作者对象原样放在 item 里）。
import type { GeneratedPairReport } from './english-generated'
import type { Detail } from './runtime/frame/read-commands'
import type { EnglishMatch } from './runtime/frame/english-commands'

export interface QueryRow {
  hash: string | null
  source: string | null
  excluded: boolean
  item: unknown
}

export type English =
  | { status: 'found'; hash: string; via: EnglishMatch['via']; item: unknown; fluff: unknown }
  /** 英文没装；作者的配对没找到这一条；配到了但英文那边按编号取不到。 */
  | { status: 'not-installed' | 'not-paired' }
  | { status: 'not-found'; hash: string }

export interface DetailResult extends Detail {
  /** 中文条目的英文对象；没有登记配对语言的源为 null。 */
  english: English | null
}

/** 作者做法（getEnglishEntity）配出来的中英编号对照。 */
export interface EnglishPairs {
  source: string
  pair: string
  /** 类别 → 中文编号 → { 英文编号, 怎么找到的 } */
  pairs: Record<string, Record<string, { enHash: string; enSource: string | null; via: EnglishMatch['via'] }>>
  /** 作者的定位找不到英文记录的（含读文件出错）。 */
  unmatched: Array<{ prop: string; hash: string; error?: string }>
  via: Record<string, number>
  located: number
  /** 生成条目（版本 / 亚种 / 魔法变体）按母条目补的配对情况，按类别。 */
  generated?: Record<string, GeneratedPairReport>
}

/** 没配上的原因：不在作者索引里（作者的配对只覆盖索引里的条目）；索引里有但英文没找到；找到了但英文解析结果里没有这个编号。 */
export type UnpairedReason = 'not-in-index' | 'no-english-record' | 'english-not-in-parsed'

export interface EnglishCoverage {
  source: string
  pair: string
  props: Record<string, { total: number; paired: number; nameMismatch: number } & Partial<Record<UnpairedReason, number>>>
  via: Record<string, number>
  unpaired: Array<{ prop: string; hash: string | null; reason: UnpairedReason; enHash?: string }>
  /** 自动核对（只列不改）：配上的中英两条里，中文条目的 ENG_name 和英文条目的 name 不一样。 */
  nameMismatch: Array<{ prop: string; hash: string; enHash: string; via: EnglishMatch['via']; engName: unknown; enName: unknown }>
}
