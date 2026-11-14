import type { AltRecord } from './alternatives'
import type { BrewPack } from './brew-packs'
import type { LibraryView } from './revision'
import type { ScopedDetail } from './scoped'
import { refKey, type EntryRef, type EntrySelection } from './scopes'
import { installedSource } from './service-read'
import type { LibraryService } from './service'
import { getSource, officialSourceOf } from './sources'

export interface LegendaryCreatureLink {
  ref: EntryRef
  name: string
  source: string | null
  pack: string | null
  selection: EntrySelection
}

type GroupPointer = { name: string; source: string }
type Candidate = LegendaryCreatureLink & { group: GroupPointer; packId?: string }
type Detail = Pick<ScopedDetail, 'ref' | 'docIdLocal'>

/** 传奇组是怪物引用的独立条目。只对照解析过的引用，用作者编号确认目标。 */
export async function creaturesOfGroup(
  lib: LibraryService, view: LibraryView, group: Detail,
  packs: Map<string, Map<string, BrewPack>>, alternatives: Map<string, AltRecord>,
): Promise<LegendaryCreatureLink[]> {
  const set = getSource(group.ref.set)
  const codeSet = set.codeSet
  const official = officialSourceOf(codeSet).id
  const packIndex = new Map([...packs.values()].flatMap((setPacks) => [...setPacks]))
  const officialGroup = await lib.storedItem(official, group.ref.prop, group.ref.hash, view)
  const hasOfficial = officialGroup && await installedSource(view, official, officialGroup.source)
  const groupPacks = [...packIndex.values()].filter((pack) => pack.hashes[group.ref.prop]?.includes(group.ref.hash))
  const groupPackId = group.docIdLocal
    ?? (set.kind === 'brew' && groupPacks.length === 1 ? groupPacks[0].docIdLocal : undefined)
  if (set.kind === 'brew' && !groupPackId) return []
  const providerIds = new Set(groupPacks.map((pack) => pack.docIdLocal))
  const providers = [...(hasOfficial ? [undefined] : []), ...providerIds]

  // undefined 表示官方原件。先认包内自己的组，跨包只接受唯一提供者。
  // 有多个可能提供同一编号时不从名字或安装顺序猜。
  function pointsHere(candidate: Candidate): boolean {
    if (!candidate.packId) return !groupPackId && hasOfficial === true
    if (providerIds.has(candidate.packId)) return candidate.packId === groupPackId
    return providers.length === 1 && providers[0] === groupPackId
  }

  const candidates: Candidate[] = []
  function add(ref: EntryRef, item: unknown, source: string | null, packId?: string): void {
    const monster = item as { name?: string; legendaryGroup?: GroupPointer } | null
    const pointer = monster?.legendaryGroup
    if (!monster?.name || !pointer?.name || !pointer.source) return
    const pack = packId ? packIndex.get(packId) : undefined
    candidates.push({
      ref, name: monster.name, source, group: pointer, packId,
      pack: pack?.filename ?? pack?.sourceInfo[0]?.full ?? null,
      selection: packId ? { docIdLocal: packId } : { original: true },
    })
  }

  const installedBrew = [...packs].filter(([, rows]) => rows.size).map(([id]) => id)
  for (const setId of [official, ...installedBrew]) {
    const ownersByHash = new Map<string, string | null>()
    for (const pack of packs.get(setId)?.values() ?? []) {
      for (const hash of pack.hashes.monster ?? []) ownersByHash.set(hash, ownersByHash.has(hash) ? null : pack.docIdLocal)
    }
    const rows = await lib.query(setId, 'monster', { view }).catch((e: unknown) => {
      if (e instanceof Error && e.message.includes('没有这一类的解析结果')) return []
      throw e
    })
    for (const row of rows) {
      if (!row.hash) continue
      const ref = { set: setId, prop: 'monster', hash: row.hash }
      const collision = alternatives.get(refKey(ref))
      const packId = collision?.base !== 'official' ? collision?.base ?? ownersByHash.get(row.hash) ?? undefined : undefined
      if (setId === official || packId) add(ref, row.item, row.source, packId)
    }
  }
  for (const { target, source, alts } of alternatives.values()) {
    if (target.prop !== 'monster') continue
    for (const alt of alts) {
      if (alt.kind !== 'collision' || !alt.docIdLocal || !packIndex.has(alt.docIdLocal)) continue
      add(target, alt.item, source, alt.docIdLocal)
    }
  }

  const relevant = candidates.filter(pointsHere)
  if (!relevant.length) return []
  const frame = await lib.frameOf(codeSet, view)
  const hashes = await frame.call('rawHashes', group.ref.prop, relevant.map((row) => row.group))
  return relevant
    .filter((_, i) => hashes[i] === group.ref.hash)
    .map(({ ref, name, source, pack, selection }) => ({ ref, name, source, pack, selection }))
}
