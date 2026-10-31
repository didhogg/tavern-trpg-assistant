import type { Raw } from '../extract/load'

export interface R9Row {
  min?: number
  max?: number
  cells: string[]
  indent?: boolean
  values?: Record<string, unknown>
  /** 这一行要再掷的另一张表（子表）的 id。 */
  then?: string
}

export interface R9ParentHint {
  prop?: string
  uid?: string
  race?: string
  raceEn?: string
  cls?: string
  clsEn?: string
  bg?: string
  bgEn?: string
  deckName?: string
}

export interface R9Extra {
  gid?: string
  group?: { id: string; name: string }
  parentKey?: string
  footnotes?: string[]
  caption?: string
  reprintedAs?: unknown
  lastCol?: string
  crRaw?: Raw[]
  /** 行里的子表（单元格本身是一张表）；planR9 选完幸存者后补成独立的表。 */
  nested?: Array<{ min: number; max: number; table: Raw }>
}

export interface R9Candidate {
  origin: string
  source: string
  page?: number
  srd?: boolean
  name: string
  nameEn?: string
  cap: string
  expr?: string
  modifierPrompt?: string
  deck?: boolean
  kind: string
  ref?: boolean
  cols: string[]
  rows: R9Row[]
  parentId?: string
  parentHint?: R9ParentHint
  chapter?: string
  oldId?: string
  extra: R9Extra
  block?: Raw
  where?: 'entries' | '_lore' | 'variants' | 'legendaryGroup'
  host?: unknown
  weak?: boolean
  blockIndex?: number
  i?: number
  merged?: Array<{ origin: string; name: string; oldId?: string; source: string; page?: number }>
  survivorIndex?: number
  parentHints?: R9ParentHint[]
  parent?: string
  id?: string
}

export interface R9Replacement {
  entryId: string
  where: 'entries' | '_lore' | 'variants' | 'legendaryGroup'
  blockIndex: number
  tableId: string
}
