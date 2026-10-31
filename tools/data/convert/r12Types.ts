import type { Raw } from '../extract/load'

export interface R12OutlineItem {
  anchor: string
  parent?: string
  level: number
  kind: 'section' | 'entries' | 'inset'
  title: string
  titleEn?: string
  page?: number
}

export interface R12Stats {
  chapters: number
  statblocks: number
  statblockRefs: number
  fluffEmbeds: number
  tableBlocks: number
  tableRefs: number
  inlineTables: number
  images: number
  metadata: number
}

export interface R12PlanResult {
  entries: Array<{
    key: string
    type: 'book'
    raw: Raw
    source: string
    packId: string
    srd: false
    name: string
    nameEn: string
    page: number
    id: string
    missingName: false
    missingPage: boolean
    context: Record<string, string>
  }>
  stats: R12Stats
}
