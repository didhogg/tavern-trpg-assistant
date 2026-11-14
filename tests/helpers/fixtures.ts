import { TrpgDatabase } from '../../src/core/db'
import { uuid } from '../../src/core/ids'
import { RuleRegistry } from '../../src/rules/registry'
import { ruleDefinitions } from '../../src/rules'

export const PNG = Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='), (c) => c.charCodeAt(0))

export function makeRegistry(): RuleRegistry {
  const registry = new RuleRegistry()
  registry.register(ruleDefinitions().find((r) => r.id === 'dnd5e2014')!)
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

