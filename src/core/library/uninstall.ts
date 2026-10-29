import type { TrpgDatabase } from '../db'
import { TrpgError } from '../errors'
import { setBuiltinRemoved, setUserRemoved } from '../packs/builtins'
import type { PackService } from '../packs/installer'
import { collectAssetHashes } from '../packs/refs'
import type { RuleRegistry } from '../../rules/registry'
import type { InstalledPack } from '../../schemas/pack'

const DAY = 86_400_000
export const TRASH_DAYS = 30

export interface UninstallImpact {
  pack: InstalledPack
  /** N 个存档启用了它。 */
  enabledIn: number
  /** N 个存档固定了它的条目。 */
  pinnedIn: number
  /** N 个存档导入过它的冒险内容。 */
  adventuresIn: number
  /** SRD 这类规则必选的包不能卸载。 */
  core: boolean
}

/** 卸载前统计各类存档的使用情况（L1 §3.6）。 */
export async function uninstallImpact(db: TrpgDatabase, rules: RuleRegistry, packId: string): Promise<UninstallImpact> {
  const pack = await db.packs.get(packId)
  if (!pack) throw new TrpgError('E_NOT_FOUND', '没有找到这个内容包')
  const saves = (await db.saves.toArray()).filter((s) => s.deletedAt === undefined)
  const pinsOf = (s: (typeof saves)[number]) => Object.keys(((s.snapshot as Record<string, unknown>).pins as Record<string, unknown>) ?? {})
  const adventuresOf = (s: (typeof saves)[number]) => (((s.snapshot as Record<string, unknown>).adventures as Array<{ packId?: string }>) ?? []).map((a) => a.packId)
  return {
    pack,
    enabledIn: saves.filter((s) => s.packs.some((p) => p.id === packId)).length,
    pinnedIn: saves.filter((s) => pinsOf(s).some((k) => k.startsWith(`${packId}/`))).length,
    adventuresIn: saves.filter((s) => adventuresOf(s).includes(packId)).length,
    core: rules.list().some((r) => r.corePackIds.includes(packId)),
  }
}

/** 确认窗里的说明行：按使用情况拼接，数量为 0 的不出现；最后统一一句。 */
export function impactLines(impact: UninstallImpact): string[] {
  const lines: string[] = []
  if (impact.enabledIn) lines.push(`${impact.enabledIn} 个存档启用了它。`)
  if (impact.adventuresIn) lines.push(`${impact.adventuresIn} 个存档导入过它的冒险内容。`)
  if (impact.pinnedIn) lines.push(`${impact.pinnedIn} 个存档固定了它的条目。`)
  lines.push('存档里已经用到的内容都有副本，不受影响；没用过的条目在重新安装前查不到。')
  if (impact.pack.source === 'builtin') lines.push('之后可以在库里重新安装。')
  if (impact.pack.source === 'user') lines.push('这是你自己做的内容，删除后可在库回收站中保留 30 天。建议先导出为文件。')
  return lines
}

/**
 * 清理没有任何引用、且创建超过 24 小时的图片（L1 §3.12）。
 * 扫描全部包、当前数据、存档（含自动存档与最近删除）。
 */
export async function cleanupBlobs(db: TrpgDatabase, now: number): Promise<number> {
  const referenced = new Set<string>()
  for (const p of await db.packs.toArray()) for (const h of p.blobHashes) referenced.add(h)
  for (const w of await db.workspaces.toArray()) collectAssetHashes(w.data, referenced)
  for (const s of await db.saves.toArray()) collectAssetHashes(s.snapshot, referenced)
  let removed = 0
  for (const blob of await db.blobs.toArray()) {
    if (referenced.has(blob.hash) || now - blob.createdAt < DAY) continue
    await db.blobs.delete(blob.hash)
    removed++
  }
  return removed
}

/** 卸载（L1 §3.6）：我的包先进库回收站；内置与下载的包记下「玩家卸载过」；最后清理图片。 */
export async function uninstallPack(deps: { db: TrpgDatabase; packs: PackService; rules: RuleRegistry; now: () => number }, packId: string): Promise<{ trashed: boolean }> {
  const impact = await uninstallImpact(deps.db, deps.rules, packId)
  if (impact.core) throw new TrpgError('E_BUILTIN_PROTECTED', '这是规则必选的内容包，不能卸载')
  const { pack } = impact
  let trashed = false
  if (pack.source === 'user') {
    await deps.db.packTrash.put({ id: pack.id, name: pack.name, ruleId: pack.ruleId, bytes: await deps.packs.exportPack(pack.id), deletedAt: deps.now() })
    trashed = true
  }
  await deps.packs.remove(packId)
  if (pack.source === 'builtin') await setBuiltinRemoved(deps.db, packId, true)
  if (pack.source === 'download') await setUserRemoved(deps.db, packId, true)
  await cleanupBlobs(deps.db, deps.now())
  return { trashed }
}

/** 恢复内置：从内置文件重新安装，不需要联网。 */
export async function restoreBuiltin(deps: { db: TrpgDatabase; packs: PackService }, packId: string, load: (id: string) => Promise<Uint8Array>): Promise<void> {
  await setBuiltinRemoved(deps.db, packId, false)
  const bytes = await load(packId)
  const rec = deps.packs.recognize(bytes)
  if (rec.type !== 'pack') throw new TrpgError('E_BAD_CONTENT', '内置文件不是内容包')
  await deps.packs.install(rec, { source: 'builtin', resolution: 'overwrite' })
}

/** 库回收站：超过 30 天的条目清除。 */
export async function purgeExpiredTrash(db: TrpgDatabase, now: number): Promise<number> {
  const old = (await db.packTrash.toArray()).filter((t) => now - t.deletedAt > TRASH_DAYS * DAY)
  for (const t of old) await db.packTrash.delete(t.id)
  return old.length
}
