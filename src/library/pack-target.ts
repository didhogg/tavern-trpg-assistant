import type { AltRecord } from './alternatives'
import { refKey, type EntryRef } from './scopes'
import { officialSourceOf } from './sources'
import { variantsOf, type Alternative } from './versions'

/** 同编号的自制副本仍指向原件的现有备选记录，以便详情和战役选用使用同一个编号。 */
export function packTarget(ref: EntryRef, codeSet: string, docIdLocal: string, alternatives: Map<string, AltRecord>): { ref: EntryRef; altId: string | null } {
  const official = { ...ref, set: officialSourceOf(codeSet).id }
  for (const candidate of [ref, official]) {
    const record = alternatives.get(refKey(candidate))
    const owned = record?.alts.find((alt) => alt.docIdLocal === docIdLocal)
    if (owned) return { ref: candidate, altId: owned.altId }
  }
  return { ref, altId: null }
}


export function packVariant(chosenAltId: string, alts: Alternative[], docIdLocal: string, isAlternative: boolean) {
  const picked = variantsOf(chosenAltId, alts).find(({ variant }) => isAlternative ? variant.docIdLocal === docIdLocal : variant.kind === 'base')?.variant
  if (!picked || !isAlternative) return picked
  return { ...picked, effective: alts.find((alt) => alt.altId === chosenAltId)?.docIdLocal === docIdLocal }
}
