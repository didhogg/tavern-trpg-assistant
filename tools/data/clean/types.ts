import type { Entry } from '../../../src/schemas/pack'

export type Lang = 'zh' | 'en'

export interface Sample { id: string; path: string; before: string; after: string }

export interface RuleResult { entriesChanged: number; changes: number; samples: Sample[] }

/** 一条清理规则：对单个条目就地修改，返回改了多少处；zhOnly 的规则在英文那一遍不运行。 */
export interface Rule {
  id: string
  title: string
  zhOnly: boolean
  apply(entry: Entry, record: (path: string, before: string, after: string) => void): number
}

export interface CleanReport { lang: Lang; rules: Record<string, RuleResult & { title: string }> }
