import type { RefIndex } from '../markup/inline'

export interface ConvertContext {
  bookMachine: Map<string, boolean>
  classIds: Map<string, string>
  subclassIds: Map<string, string>
  spellLookup: Record<string, unknown>
  featuresByOwner: Map<string, Array<{ id: string; name: string; level: number }>>
  subclassLevelByClass: Map<string, number>
  tablesByParent: Map<string, Array<{ id: string; name: string }>>
  tableByName: Map<string, string>
  index: RefIndex
  resolveEntryId: (type: string, name: string) => string | undefined
}

export function makeContext(input: {
  bookMachine: Map<string, boolean>
  classIds: Map<string, string>
  subclassIds: Map<string, string>
  spellLookup: Record<string, unknown>
  featuresByOwner: Map<string, Array<{ id: string; name: string; level: number }>>
  subclassLevelByClass: Map<string, number>
  tablesByParent: Map<string, Array<{ id: string; name: string }>>
  tableByName: Map<string, string>
  index: RefIndex
}): ConvertContext {
  return {
    ...input,
    resolveEntryId: (type, name) => input.index.byTypeName.get(`${type}|${name}`)?.[0]?.id,
  }
}
