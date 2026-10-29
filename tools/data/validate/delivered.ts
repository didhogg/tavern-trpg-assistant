import type { Entry } from '../../../src/schemas/pack'
import type { CoverageEntry } from '../config/fieldCoverage'
import { KNOWN_EMPTY } from '../config/knownEmpty'

/** 已完成并承诺兑现的工作包；每个包提交前加入。R0 为空。 */
export const DELIVERED_WP: string[] = ['R1', 'R2', 'R3']

function values(value: unknown, path: string): unknown[] {
  if (!value || typeof value !== 'object') return []
  const rec = value as Record<string, unknown>
  const [head, ...tail] = path.split('.')
  const key = head.endsWith('[]') ? head.slice(0, -2) : head
  const child = rec[key]
  if (!tail.length) return [child]
  if (!Array.isArray(child)) return values(child, tail.join('.'))
  return child.flatMap((item) => values(item, tail.join('.')))
}

function nonEmpty(value: unknown): boolean {
  if (value === undefined || value === null) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (typeof value === 'number') return Number.isFinite(value)
  if (typeof value === 'boolean') return value
  if (Array.isArray(value)) return value.some(nonEmpty)
  if (typeof value === 'object') return Object.values(value).some(nonEmpty)
  return true
}

export function targetValues(entries: Entry[], to: string): unknown[] {
  const [root, ...rest] = to.split('.')
  if (root === 'entry') return entries.map((e) => (e as unknown as Record<string, unknown>)[rest.join('.')])
  return entries.flatMap((e) => values(e, to))
}

export function checkDelivered(
  entries: Entry[],
  coverage: Record<string, CoverageEntry>,
  delivered: string[] = DELIVERED_WP,
  knownEmpty: Record<string, string> = KNOWN_EMPTY,
): string[] {
  const done = new Set(delivered)
  const missing: string[] = []
  for (const [path, entry] of Object.entries(coverage)) {
    if (entry.how === 'dropped' || !entry.wp || !done.has(entry.wp) || knownEmpty[path]) continue
    if (!targetValues(entries, entry.to ?? '').some(nonEmpty)) missing.push(path)
  }
  return missing.sort()
}

export function assertDelivered(entries: Entry[], coverage: Record<string, CoverageEntry>): void {
  const missing = checkDelivered(entries, coverage)
  if (missing.length) throw new Error(`已兑现字段没有出现在输出中：${missing.slice(0, 20).join('、')}`)
}
