import type { RefIndex } from '../markup/inline'
import type { Raw } from '../extract/load'

export interface ConvertContext {
  bookMachine: Map<string, boolean>
  classIds: Map<string, string>
  subclassIds: Map<string, string>
  spellLookup: Record<string, unknown>
  itemGroups: Raw[]
  legendaryGroups: Raw[]
  featuresByOwner: Map<string, Array<{ id: string; name: string; level: number; raw: Record<string, unknown> }>>
  subclassLevelByClass: Map<string, number>
  subclassNames: Map<string, string>
  tablesByParent: Map<string, Array<{ id: string; name: string }>>
  tableByName: Map<string, string>
  index: RefIndex
  resolveEntryId: (type: string, name: string) => string | undefined
  foundryClasses?: Raw[]
  foundrySubclasses?: Raw[]
  foundryClassFeatures?: Raw[]
  foundrySubclassFeatures?: Raw[]
  foundryFeats?: Raw[]
  foundryRaces?: Raw[]
  foundryOptionalFeatures?: Raw[]
  foundryItems?: Raw[]
  unmappedFoundry?: Map<string, { count: number; example: string }>
}

export function makeContext(input: {
  bookMachine: Map<string, boolean>
  classIds: Map<string, string>
  subclassIds: Map<string, string>
  spellLookup: Record<string, unknown>
  itemGroups: Raw[]
  legendaryGroups: Raw[]
  featuresByOwner: Map<string, Array<{ id: string; name: string; level: number; raw: Record<string, unknown> }>>
  subclassLevelByClass: Map<string, number>
  subclassNames: Map<string, string>
  tablesByParent: Map<string, Array<{ id: string; name: string }>>
  tableByName: Map<string, string>
  index: RefIndex
  foundryClasses?: Raw[]
  foundrySubclasses?: Raw[]
  foundryClassFeatures?: Raw[]
  foundrySubclassFeatures?: Raw[]
  foundryFeats?: Raw[]
  foundryRaces?: Raw[]
  foundryOptionalFeatures?: Raw[]
  foundryItems?: Raw[]
  unmappedFoundry?: Map<string, { count: number; example: string }>
}): ConvertContext {
  return {
    ...input,
    resolveEntryId: (type, name) => input.index.byTypeName.get(`${type}|${name}`)?.[0]?.id,
  }
}
