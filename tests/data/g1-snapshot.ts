import { readFileSync } from 'node:fs'
import { strFromU8, unzipSync } from 'fflate'
import { packPath } from './r9-pack-helpers'

/** 现在的包清单里的依赖（排序后的包编号）。 */
export function manifestOf(packId: string): { version: string; dataVersion: number; name: string; nameEn?: string; lineage: string; requires: string[]; sourceNames: Record<string, { name: string; nameEn?: string }> } {
  const files = unzipSync(new Uint8Array(readFileSync(packPath(packId))))
  const m = JSON.parse(strFromU8(files['trpg-manifest.json'])).pack
  return { version: m.version, dataVersion: m.dataVersion, name: m.name, nameEn: m.nameEn, lineage: m.lineage, requires: m.relationships.requires.map((r: { id: string }) => r.id).sort(), sourceNames: m.sourceNames ?? {} }
}
