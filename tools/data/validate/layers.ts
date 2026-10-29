import type { ConvertedPack } from '../convert'
import { BOOKS, SRD_PACK_ID } from '../config/books'

export const EXPECTED_REQUIRES: Record<string, string[]> = {
  PHB: [], SCAG: ['PHB'], DMG: ['PHB', 'SCAG'], MM: ['DMG', 'SCAG'], XGE: ['PHB', 'DMG', 'SCAG'],
  TCE: ['PHB'], VGM: ['PHB'], MTF: ['PHB'], MPMM: ['PHB'], BMT: ['DMG', 'SCAG'],
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
  // 环
  const graph = new Map(packs.map((p) => [p.manifest.id, p.manifest.relationships.requires.map((d) => d.id)]))
  const visiting = new Set<string>(), done = new Set<string>()
  const visit = (id: string): void => { if (done.has(id)) return; if (visiting.has(id)) throw new Error(`依赖环：${id}`); visiting.add(id); for (const n of graph.get(id) ?? []) visit(n); visiting.delete(id); done.add(id) }
  for (const id of graph.keys()) visit(id)
  return issues
}
