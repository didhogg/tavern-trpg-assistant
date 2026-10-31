import type { ConvertedPack } from '../convert'
import { BOOKS, SRD_PACK_ID } from '../config/books'

export const EXPECTED_REQUIRES: Record<string, string[]> = {
  PHB: [], SCAG: ['PHB'], DMG: ['PHB', 'SCAG'], MM: ['DMG', 'SCAG'], XGE: ['PHB', 'DMG', 'SCAG'],
  TCE: ['PHB', 'SCAG', 'DMG', 'XGE'], VGM: ['PHB'], MTF: ['PHB'], MPMM: ['PHB'], BMT: ['DMG', 'SCAG'],
}
export interface LayerIssue { kind: string; pack: string; detail: string }
export function checkLayers(packs: ConvertedPack[]): LayerIssue[] {
  const issues: LayerIssue[] = []
  const layers = new Map(BOOKS.map((b) => [b.packId, b.layer]))
  layers.set(SRD_PACK_ID, 0)
  for (const b of BOOKS) {
    const expected = EXPECTED_REQUIRES[b.source] ?? []
    if ([...b.requiresBooks].sort().join('|') !== [...expected].sort().join('|')) issues.push({ kind: 'config', pack: b.packId, detail: `requiresBooks=${b.requiresBooks.join(',')} expected=${expected.join(',')}` })
  }
  for (const p of packs) {
    if (p.manifest.id === SRD_PACK_ID) continue
    const source = BOOKS.find((b) => b.packId === p.manifest.id)?.source ?? ''
    const expected = EXPECTED_REQUIRES[source] ?? []
    const actual = p.manifest.relationships.requires.map((d) => d.id === SRD_PACK_ID ? 'SRD' : (BOOKS.find((b) => b.packId === d.id)?.source ?? d.id)).filter((x) => x !== 'SRD').sort()
    if (actual.join('|') !== [...expected].sort().join('|')) issues.push({ kind: 'manifest', pack: p.manifest.id, detail: `requires=${actual.join(',')} expected=${expected.join(',')}` })
    for (const d of p.manifest.relationships.requires) {
      const dl = layers.get(d.id) ?? -1
      if (dl >= (layers.get(p.manifest.id) ?? 0)) issues.push({ kind: 'layer', pack: p.manifest.id, detail: `${d.id} layer ${dl} not below ${layers.get(p.manifest.id)}` })
    }
  }
  const entryPack = new Map(packs.flatMap((p) => p.entries.map((e) => [e.id, p.manifest.id] as const)))
  const loreTargets = new Set<string>()
  for (const p of packs) for (const entry of p.entries) {
    if (entry.type !== 'lore') continue
    const target = String((entry.data as { target?: unknown }).target ?? '')
    if (loreTargets.has(target)) issues.push({ kind: 'lore-duplicate', pack: p.manifest.id, detail: `${target} 有多个 lore 补丁` })
    loreTargets.add(target)
  }
  for (const p of packs) for (const entry of p.entries) {
    const credit = (entry.data as { credit?: { srd?: boolean } }).credit
    if (p.manifest.id === SRD_PACK_ID && credit?.srd === false) issues.push({ kind: 'srd-credit', pack: p.manifest.id, detail: `${entry.id} 在 SRD 中 credit.srd=false` })
    if (p.manifest.id !== SRD_PACK_ID && credit?.srd === true) issues.push({ kind: 'srd-credit', pack: p.manifest.id, detail: `${entry.id} 在非 SRD 中 credit.srd=true` })
    if (p.manifest.id === SRD_PACK_ID && (entry.data as { lore?: unknown }).lore !== undefined) issues.push({ kind: 'srd-lore', pack: p.manifest.id, detail: `${entry.id} 在 SRD 中含 data.lore` })
  }
  for (const p of packs) for (const entry of p.entries) {
    if (entry.type !== 'lore') continue
    const target = String((entry.data as { target?: unknown }).target ?? '')
    const targetPack = entryPack.get(target)
    if (!targetPack) issues.push({ kind: 'lore-target', pack: p.manifest.id, detail: `${entry.id} 的 target ${target} 不存在` })
    else if ((layers.get(targetPack) ?? 0) > (layers.get(p.manifest.id) ?? 0)) issues.push({ kind: 'lore-target', pack: p.manifest.id, detail: `${entry.id} 的 target ${target} 在更高层 ${targetPack}` })
  }
  // 环
  const graph = new Map(packs.map((p) => [p.manifest.id, p.manifest.relationships.requires.map((d) => d.id)]))
  const visiting = new Set<string>(), done = new Set<string>()
  const visit = (id: string): void => { if (done.has(id)) return; if (visiting.has(id)) throw new Error(`依赖环：${id}`); visiting.add(id); for (const n of graph.get(id) ?? []) visit(n); visiting.delete(id); done.add(id) }
  for (const id of graph.keys()) visit(id)
  return issues
}
