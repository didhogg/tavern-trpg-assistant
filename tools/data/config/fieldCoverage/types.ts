export type DropKind = 'image' | 'audio' | 'layout' | '2024-only' | 'out-of-scope' | 'internal-meta' | 'derived' | 'fonts' | 'token'

export interface CoverageEntry {
  how: 'mapped' | 'text' | 'dropped' | 'lost'
  to?: string
  wp?: string
  kind?: DropKind
  why?: string
  affected?: number
}
