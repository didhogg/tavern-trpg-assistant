import { arr, rec } from './util'
import type { Lib } from './load'

export interface Inventory {
  /** 形如 skill:xxx 的记号及出现次数 */
  tokens: Record<string, number>
  /** 含 choose / fixed 的对象：位置（类型 + 字段路径，数组下标去掉）+ 键的组合 → 次数 */
  shapes: Record<string, number>
}

const TOKEN = /^(skill|tool|lang|weapon|armor|save|ability|item|spell|feat):/

/** 盘点全部「任选」记号和选项池的形状。读取器靠它保证“没见过的写法”会让测试失败。 */
export function inventory(l: Lib): Inventory {
  const tokens: Record<string, number> = {}
  const shapes: Record<string, number> = {}
  const walk = (v: unknown, where: string, type: string): void => {
    if (typeof v === 'string') {
      if (TOKEN.test(v)) tokens[v] = (tokens[v] ?? 0) + 1
      return
    }
    if (Array.isArray(v)) { for (const x of v) walk(x, where, type); return }
    if (v && typeof v === 'object') {
      const o = rec(v)
      if ('choose' in o || 'choices' in o || 'pool' in o) {
        const sig = `${type}:${where} {${Object.keys(o).sort().join(',')}}${typeof o.choose === 'object' && o.choose ? ' choose={' + Object.keys(rec(o.choose)).sort().join(',') + '}' : ''}`
        shapes[sig] = (shapes[sig] ?? 0) + 1
      }
      for (const [k, x] of Object.entries(o)) walk(x, where ? `${where}.${k}` : k, type)
    }
  }
  for (const r of l.rows) {
    const d = r.data
    for (const k of ['advancement', 'proficiencies', 'languages', 'abilityBonus', 'multiclass', 'equipment', 'startingEquipment']) if (k in d) walk(d[k], k, r.type)
  }
  void arr
  return { tokens: Object.fromEntries(Object.entries(tokens).sort()), shapes: Object.fromEntries(Object.entries(shapes).sort()) }
}
