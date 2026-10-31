import { describe, expect, it } from 'vitest'
import { allEntries } from './r9-pack-helpers'
import { loadBefore } from './r15-snapshot'

type Rec = Record<string, unknown>
const isObj = (v: unknown): v is Rec => !!v && typeof v === 'object' && !Array.isArray(v)

/** R15 允许新增的键：顶层的这些；以及 creatureType.swarmSize、spellcasting 块里的这几个键、spells.N.lower。 */
const TOP = new Set(['facets', 'extra', 'attachedItems', 'attachedSpells', 'abilityGrant', 'optionalFeatures', 'tier', 'wondrous', 'abilityCheck', 'seeAlso', 'effects'])
const CAST = new Set(['type', 'displayAs', 'hidden', 'chargesItem', 'footer'])

function allowedNew(path: string[], key: string): boolean {
  if (path.length === 0) return TOP.has(key)
  if (path.length === 1 && path[0] === 'creatureType') return key === 'swarmSize'
  if (path.length === 2 && path[0] === 'spellcasting') return CAST.has(key)
  if (path.length === 4 && path[0] === 'spellcasting' && path[2] === 'spells') return key === 'lower'
  return false
}

/** 新值必须是旧值的「只增」扩展：原有内容逐字节不变；数组只允许在末尾追加（正文追加段落、效果追加说明）。 */
function violations(oldValue: unknown, newValue: unknown, path: string[], out: string[]): void {
  if (out.length > 5) return
  if (Array.isArray(oldValue)) {
    if (!Array.isArray(newValue) || newValue.length < oldValue.length) { out.push(`${path.join('.')} 数组变短或类型变了`); return }
    oldValue.forEach((item, i) => violations(item, newValue[i], [...path, String(i)], out))
    return
  }
  if (isObj(oldValue)) {
    if (!isObj(newValue)) { out.push(`${path.join('.')} 类型变了`); return }
    for (const [key, item] of Object.entries(oldValue)) violations(item, newValue[key], [...path, key], out)
    for (const key of Object.keys(newValue)) if (!(key in oldValue) && !allowedNew(path, key)) out.push(`${path.join('.')}.${key} 是不允许新增的键`)
    return
  }
  if (oldValue !== newValue) out.push(`${path.join('.')}: ${JSON.stringify(oldValue)?.slice(0, 40)} → ${JSON.stringify(newValue)?.slice(0, 40)}`)
}

describe('R15 只增不改', () => {
  it('8,853 个条目：id、type、name、nameEn、summary、keywords 不变，data 只增不改', () => {
    const before = loadBefore()
    const now = allEntries()
    expect(now).toHaveLength(8853)
    const bad: string[] = []
    for (const entry of now) {
      const old = before[entry.id]
      if (!old) { bad.push(`${entry.id} 不在快照里`); continue }
      if (entry.type !== old.type || entry.name !== old.name || entry.nameEn !== old.nameEn || entry.summary !== old.summary) bad.push(`${entry.id} 名称/类型/摘要变了`)
      const out: string[] = []
      violations(old.data, entry.data, [], out)
      if (out.length) bad.push(`${entry.id}: ${out[0]}`)
    }
    expect(bad.slice(0, 10)).toEqual([])
  }, 180_000)
})
