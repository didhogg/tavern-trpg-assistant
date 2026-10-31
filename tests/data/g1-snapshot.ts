import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { gunzipSync } from 'node:zlib'
import { strFromU8, unzipSync } from 'fflate'
import { packPath } from './r9-pack-helpers'

export interface G1Entry { pack: string; type: string; name: string; nameEn?: string; summary: string; keywords: string[]; data: Record<string, unknown> }
export interface G1Pack { version: string; dataVersion: number; name: string; nameEn?: string; lineage: string; requires: string[]; entryCount: number }

/** G1 开工时（S1 已推送的 1.2.1 包）每个条目的全文与所在的包、每个包的依赖。G1 只允许 g1-additive.test.ts 里写明的变化。 */
export function loadG1Before(): { entries: Record<string, G1Entry>; packs: Record<string, G1Pack> } {
  return JSON.parse(gunzipSync(readFileSync(join(process.cwd(), 'tests/data/fixtures/g1-before.json.gz'))).toString('utf8'))
}

/** 现在的包清单里的依赖（排序后的包编号）。 */
export function manifestOf(packId: string): { version: string; dataVersion: number; name: string; nameEn?: string; lineage: string; requires: string[] } {
  const files = unzipSync(new Uint8Array(readFileSync(packPath(packId))))
  const m = JSON.parse(strFromU8(files['trpg-manifest.json'])).pack
  return { version: m.version, dataVersion: m.dataVersion, name: m.name, nameEn: m.nameEn, lineage: m.lineage, requires: m.relationships.requires.map((r: { id: string }) => r.id).sort() }
}
