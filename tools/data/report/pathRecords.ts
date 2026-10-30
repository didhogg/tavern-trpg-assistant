import type { SourceRecord } from './fieldPaths'

/** 每条来源记录对每个路径最多计一次；用于 lost.affected，口径与 collectPaths 的出现次数不同。 */
export function recordCountsByPath(records: SourceRecord[]): Map<string, number> {
  const out = new Map<string, number>()
  for (const record of records) {
    const seen = new Set<string>()
    const walk = (value: unknown, path: string): void => {
      if (Array.isArray(value)) {
        const next = `${path}[]`
        for (const item of value) walk(item, next)
        return
      }
      if (!value || typeof value !== 'object') return
      for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
        const next = path ? `${path}.${key}` : key
        seen.add(`${record.type}.${next}`)
        if (Array.isArray(child) || (child && typeof child === 'object')) walk(child, next)
      }
    }
    walk(record.value, '')
    for (const path of seen) out.set(path, (out.get(path) ?? 0) + 1)
  }
  return out
}
