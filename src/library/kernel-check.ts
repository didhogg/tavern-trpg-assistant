// P3-3 与 P3-1 的接线：读档检查直接问【库】的按战役取条目入口。
import type { KernelRefChecker } from '../core/saves/kernel'
import type { KernelDataVersion, KernelOverride } from '../schemas/kernel'
import type { LibraryDatabase } from './db'
import type { ScopedLibrary } from './scoped'
import type { CampaignLibrary } from './scopes'
import type { LibraryService } from './service'
import { SOURCES } from './sources'

export function scopedRefChecker(lib: ScopedLibrary): KernelRefChecker {
  return async (refs, library) => {
    const results = await lib.fetch(library as CampaignLibrary, refs)
    return results.map((result) => ({
      ok: result.ok,
      ref: result.ref,
      reason: result.ok ? undefined : result.reason,
    }))
  }
}

export function scopedCurrentOverrides(lib: ScopedLibrary): () => Promise<KernelOverride[]> {
  return () => lib.activeOverrides()
}

/**
 * 当前装的数据版本记号：各官方源的提交号 + 各自制包的校验值。存档保存时现取，读档时比对。
 * 按源登记表走（加一个源 = 登记一行），不写死中/英。
 */
export function libraryDataVersion(db: LibraryDatabase, service: LibraryService): () => Promise<KernelDataVersion> {
  return async () => {
    let official = ''
    const brews: Record<string, string> = {}
    for (const source of SOURCES.filter((s) => s.kind === 'official')) {
      const set = await db.sets.get(source.id)
      if (set?.status !== 'installed') continue
      if (!official) official = String(set.commit ?? set.updatedAt ?? '')
      for (const brew of SOURCES.filter((s) => s.kind === 'brew' && s.codeSet === source.codeSet)) {
        for (const entry of await service.brewInstalled(brew.id)) {
          const key = `${brew.id}:${String(entry.head.docIdLocal ?? entry.head.filename ?? '')}`
          brews[key] = String(entry.head.checksum ?? entry.head.version ?? entry.head.dateAdded ?? entry.head.filename ?? '')
        }
      }
    }
    return { official, brews }
  }
}
