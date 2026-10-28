import { TrpgDatabase } from '../../src/core/db'
import { uuid } from '../../src/core/ids'
import { buildPackFile, type PackManifestInput } from '../../src/core/packs/file'
import { RuleRegistry } from '../../src/rules/registry'
import { dnd5e2014 } from '../../src/rules/dnd5e2014'
import type { Entry } from '../../src/schemas/pack'

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

export function makePack(overrides: Partial<PackManifestInput> = {}, entries: Entry[] = makeEntries(3), assets?: Map<string, Uint8Array>): Uint8Array {
  return buildPackFile({
    manifest: {
      id: 'dnd5e2014-core',
      ruleId: 'dnd5e2014',
      kind: 'data',
      name: '核心规则',
      version: '1.0.0',
      ...overrides,
    },
    entries,
    assets,
  })
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
