import type { Entry, PackManifest } from '../../schemas/pack'
import { FORMAT_VERSION } from '../../schemas/common'
import { writeZip } from './zip'

export type PackManifestInput = Omit<PackManifest, 'entryCount' | 'typeCounts' | 'license' | 'attribution' | 'description' | 'dependsOn'> &
  Partial<Pick<PackManifest, 'license' | 'attribution' | 'description' | 'dependsOn'>>

/** 生成 `.trpgpack`：条目数与分类计数由条目自动得出，保证说明与内容一致。 */
export function buildPackFile(input: {
  manifest: PackManifestInput
  entries: Entry[]
  assets?: Map<string, Uint8Array>
}): Uint8Array {
  const typeCounts: Record<string, number> = {}
  const byType = new Map<string, Entry[]>()
  for (const entry of input.entries) {
    typeCounts[entry.type] = (typeCounts[entry.type] ?? 0) + 1
    const list = byType.get(entry.type) ?? []
    list.push(entry)
    byType.set(entry.type, list)
  }
  const pack: PackManifest = {
    license: '',
    attribution: '',
    description: '',
    dependsOn: [],
    ...input.manifest,
    entryCount: input.entries.length,
    typeCounts,
  }
  const files: Record<string, Uint8Array | string> = {
    'trpg-manifest.json': JSON.stringify({ format: 'trpg-pack', formatVersion: FORMAT_VERSION, pack }),
  }
  for (const [type, list] of byType) files[`entries/${encodeURIComponent(type)}.json`] = JSON.stringify(list)
  for (const [path, bytes] of input.assets ?? []) files[`assets/${path}`] = bytes
  return writeZip(files)
}
