// 版本清单的派生信息（P5 T1/N1）：从 revision.ts 拆出，保持单文件职责与行数上限。
import type { BrewSetState, LibraryDatabase, OfficialSetState } from './db'
import { hashValue } from '../core/hash'
import { kernelDataSource, SOURCES } from './sources'
import type { KernelDataVersion } from '../schemas/kernel'

/** 数据版本记号：所有已装官方集的提交号 + 可见来源集合，所有自制包的稳定标识 + 校验值。稳定排序后摘要。 */
export function dataVersionOf(officialStates: Record<string, OfficialSetState>, brewStates: Record<string, BrewSetState>): KernelDataVersion {
  const setsVersion = (keep: (id: string) => boolean): string => Object.entries(officialStates)
    .filter(([id, s]) => s.status === 'installed' && keep(id))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([id, s]) => {
      const base = `${id}:${s.commit}:${s.sources ? [...s.sources].sort().join(',') : '*'}`
      const files = Object.entries(s.fileOverrides ?? {}).sort(([a], [b]) => a.localeCompare(b))
      return files.length ? `${base}:${hashValue(files)}` : base
    })
    .join('|')
  const official = setsVersion(() => true)
  // 换算缓存只认结算小窗读的那一套（kernelDataSource）
  const kernelSet = kernelDataSource().id
  const kernelFiles = `v1:${hashValue(setsVersion((id) => id === kernelSet))}`
  const brewOut: Record<string, string> = {}
  for (const [setId, state] of Object.entries(brewStates)) {
    for (const pack of state.packs ?? []) {
      brewOut[`${setId}:${pack.docIdLocal}`] = `${pack.stableId ?? pack.docIdLocal}:${pack.checksum ?? ''}`
    }
  }
  return { official: `v2:${hashValue(official)}`, kernelFiles, brews: brewOut }
}

/** 把发布状态同步到旧的 sets 表（界面 / 旧测试还能读；内容状态以版本清单为准）。 */
export async function mirrorOfficialToSets(db: LibraryDatabase, official: Record<string, OfficialSetState>): Promise<void> {
  const existing = await db.sets.toArray()
  for (const rec of existing) {
    const id = String(rec.id)
    if (!official[id]) await db.sets.delete(id)
  }
  for (const [id, state] of Object.entries(official)) {
    if (!SOURCES.some((s) => s.id === id && s.kind === 'official')) continue
    if (state.status !== 'installed') { await db.sets.delete(id); continue }
    await db.sets.put({
      id, commit: state.commit, status: 'installed',
      ...(state.plan ? { plan: state.plan } : {}), sources: state.sources, books: state.books, adventures: state.adventures,
      updatedAt: Date.now(),
    })
  }
}
