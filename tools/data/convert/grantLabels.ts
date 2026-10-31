import type { ConvertedPack } from './index'

type Rec = Record<string, unknown>
const isObj = (value: unknown): value is Rec => !!value && typeof value === 'object' && !Array.isArray(value)

/**
 * S1：跨包的可选授予（`optional: 'tce-ocf'`）可能指向没装的包。授予里带上目标的显示名（labels）与目标所在的包（packId），
 * 界面查不到条目时用它们显示「荒野伙伴（可选 · 需要《塔莎的万事坩埚》）」，不再露出编号。返回写入的授予数。
 */
export function labelOptionalGrants(packs: ConvertedPack[]): number {
  const where = new Map<string, { name: string; packId: string }>()
  for (const pack of packs) for (const entry of pack.entries) where.set(entry.id, { name: entry.name, packId: pack.manifest.id })
  let count = 0
  for (const pack of packs) for (const entry of pack.entries) {
    const advancement = (entry.data as Rec).advancement
    if (!Array.isArray(advancement)) continue
    for (const step of advancement) {
      if (!isObj(step) || step.kind !== 'itemGrant' || step.optional !== 'tce-ocf' || !Array.isArray(step.items)) continue
      const targets = (step.items as string[]).map((id) => [id, where.get(id)] as const).filter((x): x is [string, { name: string; packId: string }] => !!x[1])
      if (!targets.length) throw new Error(`${entry.id} 的可选授予指向不存在的条目：${(step.items as string[]).join('、')}`)
      step.labels = Object.fromEntries(targets.map(([id, t]) => [id, t.name]))
      step.packId = targets[0][1].packId
      count++
    }
  }
  return count
}
