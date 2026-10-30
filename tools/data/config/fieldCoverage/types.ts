export type DropKind = 'image' | 'audio' | 'layout' | '2024-only' | 'internal-meta' | 'derived'

export interface CoverageEntry {
  how: 'mapped' | 'text' | 'dropped' | 'lost'
  to?: string
  wp?: string
  kind?: DropKind
  why?: string
  affected?: number
}
