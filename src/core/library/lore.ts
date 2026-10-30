import type { TextBlock } from '../../schemas/text'

/** 读取 lore 时只需要的最小条目形状；不依赖数据库实现。 */
export interface LoreSource {
  id: string
  type: string
  packId?: string
  layer?: number
  data: Record<string, unknown>
}

export interface LorePatch {
  target: string
  lore: TextBlock[]
  packId?: string
  layer?: number
}

/** 把隐藏类型 lore 的补丁按 target 建索引；同一 target 出现两次直接拒绝。 */
export function buildLoreIndex(entries: LoreSource[]): Map<string, LorePatch[]> {
  const out = new Map<string, LorePatch[]>()
  for (const entry of entries) {
    if (entry.type !== 'lore') continue
    const target = entry.data.target
    const lore = entry.data.lore
    if (typeof target !== 'string' || !Array.isArray(lore)) continue
    const list = out.get(target) ?? []
    if (list.length) throw new Error(`lore 补丁重复指向 ${target}`)
    list.push({ target, lore: lore as TextBlock[], packId: entry.packId, layer: entry.layer })
    out.set(target, list)
  }
  for (const list of out.values()) list.sort((a, b) => (a.layer ?? 0) - (b.layer ?? 0))
  return out
}

/** 条目内嵌 lore 优先；否则取补丁，补丁按包层级从低到高串联。 */
export function loreOf(entry: LoreSource, index: Map<string, LorePatch[]>): TextBlock[] {
  const own = entry.data.lore
  if (Array.isArray(own) && own.length) return own as TextBlock[]
  return (index.get(entry.id) ?? []).flatMap((patch) => patch.lore)
}
