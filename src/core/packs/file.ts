import type { Entry, PackFeature, PackManifest } from '../../schemas/pack'
import { FORMAT_VERSION } from '../../schemas/common'
import { stableStringify } from '../hash'
import type { AdventureItem } from '../../schemas/adventure'
import { writeZip } from './zip'

export type PackManifestInput = Omit<PackManifest, 'entryCount' | 'typeCounts' | 'license' | 'attribution' | 'description' | 'contributes' | 'relationships' | 'blobs' | 'dataVersion'> &
  Partial<Pick<PackManifest, 'license' | 'attribution' | 'description' | 'contributes' | 'relationships' | 'blobs' | 'dataVersion'>>

export interface BuildPackInput {
  manifest: PackManifestInput
  entries: Entry[]
  blobs?: Map<string, { bytes: Uint8Array; mime: string }>
  features?: PackFeature[]
  adventure?: Record<string, unknown>
  fallback?: AdventureItem[]
}

function sortedObject<T>(input: Record<string, T>): Record<string, T> {
  const out: Record<string, T> = {}
  for (const key of Object.keys(input).sort()) out[key] = input[key]
  return out
}

/** 生成 `.trpgpack`（formatVersion 2）：计数、哈希与文件顺序都由内容决定，保证逐字节可重现。 */
export function buildPackFile(input: BuildPackInput): Uint8Array {
  const entries = [...input.entries].sort((a, b) => a.id.localeCompare(b.id))
  const typeCounts: Record<string, number> = {}
  const byType = new Map<string, Entry[]>()
  for (const entry of entries) {
    typeCounts[entry.type] = (typeCounts[entry.type] ?? 0) + 1
    const list = byType.get(entry.type) ?? []
    list.push(entry)
    byType.set(entry.type, list)
  }
  const features = [...(input.features ?? [])].sort((a, b) => a.kind.localeCompare(b.kind) || a.id.localeCompare(b.id))
  const byKind = new Map<string, PackFeature[]>()
  for (const feature of features) {
    const list = byKind.get(feature.kind) ?? []
    list.push(feature)
    byKind.set(feature.kind, list)
  }
  const blobs = new Map([...(input.blobs ?? new Map())].sort(([a], [b]) => a.localeCompare(b)))
  const adventure = input.adventure ?? {}
  const fallback = input.fallback ?? []
  const manifest = Object.assign(
    {
      license: '',
      attribution: '',
      description: '',
      relationships: { requires: [], recommends: [], conflicts: [] },
      contributes: {},
      dataVersion: 2,
    },
    input.manifest,
    {
      entryCount: entries.length,
      typeCounts: sortedObject(typeCounts),
      blobs: [...blobs].map(([hash, blob]) => ({ hash, mime: blob.mime, size: blob.bytes.length })),
      contributes: {
        ...input.manifest.contributes,
        entries: entries.length,
        tables: entries.filter((e) => e.type === 'table').length,
        variants: entries.filter((e) => (e as { override?: unknown }).override !== undefined).length,
        adventures: ((adventure['adventure/adventure.json'] as { adventures?: unknown[] } | undefined)?.adventures ?? []).length,
        ruleOptions: features.filter((f) => f.kind === 'ruleOptions').length,
      },
    },
  ) as unknown as PackManifest
  const files: Record<string, Uint8Array | string> = {
    'trpg-manifest.json': stableStringify({ format: 'trpg-pack', formatVersion: FORMAT_VERSION, pack: manifest }),
  }
  for (const [type, list] of [...byType].sort(([a], [b]) => a.localeCompare(b))) files[`entries/${encodeURIComponent(type.toLowerCase())}.json`] = stableStringify(list)
  for (const [kind, list] of [...byKind].sort(([a], [b]) => a.localeCompare(b))) files[`features/${encodeURIComponent(kind.toLowerCase())}.json`] = stableStringify(list)
  for (const name of Object.keys(adventure).sort()) files[name] = stableStringify(adventure[name])
  if (fallback.length) files['adventure/fallback.json'] = stableStringify({ items: fallback })
  for (const [hash, blob] of blobs) files[`blobs/${hash}`] = blob.bytes
  return writeZip(files)
}
