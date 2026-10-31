import type { TrpgDatabase } from '../../core/db'
import type { Fact } from './facts'

type Obj = Record<string, unknown>

/** 已安装的包里，哪些条目用 joins 登记加入了这个目标（职业、子职业、物品家族）。 */
export interface Joiner { id: string; packId: string; name: string; level: number; as: 'optional' | 'option' | 'member'; replaces?: string }

let cache: { key: string; map: Map<string, Joiner[]> } | undefined

/** 按已装包的组合缓存：装、卸、更新包后签名变化，自动重算。 */
export async function joinersOf(db: TrpgDatabase, ruleId: string, signature: string, targetId: string): Promise<Joiner[]> {
  if (!cache || cache.key !== signature) {
    const map = new Map<string, Joiner[]>()
    const rows = await db.entries.where('[ruleId+type]').equals([ruleId, 'feature']).filter((e) => Array.isArray((e.data as Obj).joins)).toArray()
    for (const e of rows) {
      for (const j of (e.data as Obj).joins as Obj[]) {
        if (typeof j.to !== 'string' || (j.as !== 'optional' && j.as !== 'option' && j.as !== 'member')) continue
        map.set(j.to, [...(map.get(j.to) ?? []), { id: e.entryId, packId: e.packId, name: e.name, level: typeof j.level === 'number' ? j.level : 0, as: j.as, ...(typeof j.replaces === 'string' ? { replaces: j.replaces } : {}) }])
      }
    }
    for (const list of map.values()) list.sort((a, b) => a.level - b.level || a.name.localeCompare(b.name, 'zh'))
    cache = { key: signature, map }
  }
  return cache.map.get(targetId) ?? []
}

/** 职业 / 子职业页的「可选特性」一行：N 级：名字（灰色小字是它所在的包），有取代关系的写「（替代 X）」。没有登记时返回 undefined。 */
export function optionalFeaturesFact(joiners: Joiner[], packName: (packId: string) => string): Fact | undefined {
  const optional = joiners.filter((j) => j.as === 'optional')
  if (!optional.length) return undefined
  const parts: Fact['parts'] = []
  let last = -1
  for (const j of optional) {
    if (j.level !== last) { parts.push(`\n${j.level} 级：`); last = j.level } else parts.push('、')
    parts.push({ ref: j.id, label: j.name, sub: packName(j.packId) })
    if (j.replaces) parts.push('（替代 ', { ref: j.replaces }, '）')
  }
  return { label: '可选特性', parts }
}
