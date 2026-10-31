import type { Raw } from '../extract/load'

export interface R9Row {
  min?: number
  max?: number
  cells: string[]
  indent?: boolean
  values?: Record<string, unknown>
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
