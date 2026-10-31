import { isObj } from '../walk'
import type { Rule } from '../types'

const WITH_SOURCE = /^([A-Za-z0-9]+)\|[A-Za-z0-9]+$/

function strip(list: unknown, path: string, record: (path: string, before: string, after: string) => void): number {
  if (!Array.isArray(list)) return 0
  let changes = 0
  const out: unknown[] = []
  for (const item of list) {
    const match = typeof item === 'string' ? WITH_SOURCE.exec(item) : null
    if (typeof item === 'string' && match) { record(path, item, match[1]); changes++; if (!out.includes(match[1])) out.push(match[1]) } else out.push(item)
  }
  list.splice(0, list.length, ...out)
  return changes
}

/** 规则 2：武器属性只存代码（`AF|DMG` → `AF`）。 */
export const propertiesRule: Rule = {
  id: 'R2-properties',
  title: '武器属性只存代码',
  zhOnly: false,
  apply(entry, { record }) {
    if (entry.type !== 'item') return 0
    const weapon = isObj(entry.data.weapon) ? entry.data.weapon : undefined
    return strip(entry.data.properties, 'properties', record) + strip(weapon?.properties, 'weapon.properties', record)
  },
}
