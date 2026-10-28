import { TrpgDatabase } from '../../src/core/db'
import { uuid } from '../../src/core/ids'
import { sha256Hex } from '../../src/core/hash'
import { buildPackFile, type BuildPackInput, type PackManifestInput } from '../../src/core/packs/file'
import { RuleRegistry } from '../../src/rules/registry'
import { dnd5e2014 } from '../../src/rules/dnd5e2014'
import type { Entry } from '../../src/schemas/pack'
import type { PackCategory } from '../../src/schemas/pack'

export const PNG = Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='), (c) => c.charCodeAt(0))

export function makeEntries(count: number, type = 'spell', prefix = 'e'): Entry[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${prefix}${i + 1}`,
    type,
    name: `${type}-${i + 1}`,
    keywords: [],
    unique: false,
    summary: '',
    data: { n: i + 1 },
  }))
}

function blobsOf(assets?: Map<string, Uint8Array>): Map<string, { bytes: Uint8Array; mime: string }> | undefined {
  if (!assets) return undefined
  const out = new Map<string, { bytes: Uint8Array; mime: string }>()
  for (const bytes of assets.values()) out.set(sha256Hex(bytes), { bytes, mime: 'image/png' })
  return out
}

export function makePack(overrides: Partial<PackManifestInput> = {}, entries: Entry[] = makeEntries(3), assets?: Map<string, Uint8Array>): Uint8Array {
  return buildPackFile({
    manifest: {
      id: 'dnd5e2014-srd',
      ruleId: 'dnd5e2014',
      category: 'rules',
      name: 'SRD 基础规则',
      version: '1.0.0',
      ...overrides,
    },
    entries,
    blobs: blobsOf(assets),
  })
}

export function makeCategoryPack(category: PackCategory, overrides: Partial<PackManifestInput> = {}, entries?: Entry[]): Uint8Array {
  return makePack({ category, ...overrides }, entries)
}

export function makeRegistry(): RuleRegistry {
  const registry = new RuleRegistry()
  registry.register(dnd5e2014)
  return registry
}

export async function withDb<T>(run: (db: TrpgDatabase) => Promise<T>): Promise<T> {
  const db = new TrpgDatabase(`test-${uuid()}`)
  try {
    return await run(db)
  } finally {
    db.close()
    await db.delete()
  }
}

/** 可控时钟：每次读取前进 1 毫秒，保证时间先后可排序。 */
export function makeClock(start = 1_700_000_000_000): () => number {
  let t = start
  return () => ++t
}

export type { BuildPackInput }
