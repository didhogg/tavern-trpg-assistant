import type { AltRecord } from './alternatives'
import type { BrewPack } from './brew-packs'
import type { LibraryView } from './revision'
import type { EntryRef, EntrySelection } from './scopes'
import type { LibraryService } from './service'
import { getSource } from './sources'
import type { Alternative, Chosen } from './versions'

/** Read every part of a copy in its own author context. Unqualified links use the effective version. */
export async function detailItem(
  lib: LibraryService, ref: EntryRef, packs: Map<string, Map<string, BrewPack>>,
  collision: AltRecord | undefined, alternatives: Alternative[], chosen: Chosen, view: LibraryView, selection?: EntrySelection,
) {
  const alt = selection ? undefined : alternatives.find((a) => a.altId === chosen.altId)
  const packId = selection && 'docIdLocal' in selection ? selection.docIdLocal : alt?.docIdLocal
  const base = await lib.detail(ref.set, ref.prop, ref.hash, undefined, view)
  const basePackId = collision && collision.base !== 'official' ? collision.base : undefined
  const wanted = packId ?? (!alt ? basePackId : undefined)
  if (wanted) {
    for (const [set, candidates] of packs) {
      if (getSource(set).codeSet !== getSource(ref.set).codeSet) continue
      const pack = candidates.get(wanted)
      if (!pack) continue
      const entry = await lib.packDetail(set, pack, ref.prop, ref.hash, view)
      return entry ? { ...entry, base: base?.item ?? entry.item, docIdLocal: wanted } : null
    }
    return null
  }
  if (!base) return null
  if (!alt) return { ...base, base: base.item }
  const fluff = alt.ref ? await lib.fluff(alt.ref.set, alt.ref.prop, alt.ref.hash, view) : null
  return { ...base, base: base.item, item: alt.item, fluff: fluff?.fluff ?? null, fluffError: fluff?.fluffError ?? null, english: null }
}
