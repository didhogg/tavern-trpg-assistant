import { TrpgDatabase } from '../../../src/core/db'
import { sha256Hex } from '../../../src/core/hash'

// B0 only: exercise the existing DB API without choosing B1's permanent schema.
const db = new TrpgDatabase()
const key = 'b0:author-output:2026-11-06'
function representation(value: unknown): unknown {
  if (value === undefined) return ['undefined']
  if (value === null || typeof value !== 'object') return [typeof value, value]
  if (Array.isArray(value)) return ['array', value.map(representation)]
  return ['object', Object.keys(value).sort().map(k => [k, representation((value as Record<string, unknown>)[k])])]
}
export function digest(value: unknown): string {
  return sha256Hex(JSON.stringify(representation(value)))
}
export async function save(value: unknown) {
  const before = digest(value)
  await db.setMeta(key, value)
  const after = digest(await db.getMeta(key))
  if (before !== after) throw new Error('B0: saved content changed')
  return { before, after, database: db.name, key }
}
export async function read() {
  const value = await db.getMeta(key)
  if (value === undefined) throw new Error('B0: saved snapshot missing')
  return { digest: digest(value), value }
}
