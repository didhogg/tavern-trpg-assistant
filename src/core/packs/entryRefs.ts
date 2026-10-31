import type { TrpgDatabase } from '../db'
import { TrpgError } from '../errors'
import type { RuleRegistry } from '../../rules/registry'
import type { RecognizedPack } from './recognize'

/** 本包能引用的包：自己、声明的依赖及其依赖的依赖（已安装的）、规则的核心包（SRD）。 */
async function reachOf(db: TrpgDatabase, rec: RecognizedPack, core: string[]): Promise<Set<string>> {
  const installed = new Map((await db.packs.toArray()).map((p) => [p.id, p.relationships.requires.map((d) => d.id)]))
  installed.set(rec.manifest.id, rec.manifest.relationships.requires.map((d) => d.id))
  const reach = new Set<string>([rec.manifest.id, ...core])
  const visit = (id: string): void => { for (const d of installed.get(id) ?? []) if (!reach.has(d)) { reach.add(d); visit(d) } }
  visit(rec.manifest.id)
  return reach
}

/**
 * 安装前检查条目之间的引用（规则提供检查函数，见 RuleDefinition.checkPack）。
 * 新格式（dataVersion ≥ 3）的包不合规就拒绝安装；旧格式的包只在控制台提示，照常安装——设备上已有的旧版书不能因此装不上。
 */
export async function assertEntryRefs(db: TrpgDatabase, rules: RuleRegistry, rec: RecognizedPack): Promise<void> {
  const rule = rules.get(rec.manifest.ruleId)
  if (!rule?.checkPack) return
  const reach = await reachOf(db, rec, rule.corePackIds)
  const own = new Map(rec.entries.map((e) => [e.id, e]))
  // 其他已安装的包：只取条目编号与所在的包；joins 等需要目标内容时，再按需取
  const owners = new Map<string, string>()
  for (const [packId, entryId] of (await db.entries.where('ruleId').equals(rec.manifest.ruleId).primaryKeys()) as Array<[string, string]>) if (packId !== rec.manifest.id) owners.set(entryId, packId)
  const needed = new Set<string>()
  for (const e of rec.entries) for (const j of Array.isArray(e.data.joins) ? (e.data.joins as Array<Record<string, unknown>>) : []) for (const k of ['to', 'replaces', 'pool']) if (typeof j[k] === 'string') needed.add(j[k] as string)
  const loaded = new Map<string, { type: string; data: Record<string, unknown>; packId: string }>()
  for (const id of needed) {
    const packId = owners.get(id)
    const row = packId && !own.has(id) ? await db.entries.get([packId, id]) : undefined
    if (row) loaded.set(id, { type: row.type, data: row.data, packId: row.packId })
  }
  const problems = rule.checkPack({
    packId: rec.manifest.id,
    entries: rec.entries.map((e) => ({ id: e.id, type: e.type, data: e.data as Record<string, unknown> })),
    reach,
    lookup: (id) => {
      const mine = own.get(id)
      if (mine) return { type: mine.type, data: mine.data as Record<string, unknown>, packId: rec.manifest.id }
      return loaded.get(id) ?? (owners.has(id) ? { type: '', data: {}, packId: owners.get(id)! } : undefined)
    },
  })
  if (!problems.length) return
  if ((rec.manifest.dataVersion ?? 1) < 3) {
    console.warn(`[trpg-assistant] 「${rec.manifest.name}」是旧格式的包，有 ${problems.length} 处引用不合规，已照常安装：${problems.slice(0, 3).join('；')}`)
    return
  }
  throw new TrpgError('E_BAD_REFS', `这个内容包里有 ${problems.length} 处引用不合规，不能安装：${problems.slice(0, 3).join('；')}${problems.length > 3 ? '……' : ''}`, { problems })
}
