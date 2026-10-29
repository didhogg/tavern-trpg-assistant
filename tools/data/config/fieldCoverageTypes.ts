export interface FieldCoverageEntry {
  how: 'mapped' | 'text' | 'dropped'
  to?: string
  why?: string
}
