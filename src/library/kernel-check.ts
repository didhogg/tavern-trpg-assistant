// P3-3 与 P3-1 的接线：读档检查直接问【库】的按战役取条目入口。
import type { KernelRefChecker } from '../core/saves/kernel'
import type { KernelDataVersion, KernelOverride } from '../schemas/kernel'
import type { BrewSetState } from './db'
import type { ScopedLibrary } from './scoped'
import type { CampaignLibrary } from './scopes'
import type { LibraryService } from './service'
import { SOURCES } from './sources'
import type { LibraryRevisionStore, LibraryView } from './revision'

export function scopedRefChecker(lib: ScopedLibrary): KernelRefChecker {
  return async (refs, library) => {
    const results = await lib.fetch(library as CampaignLibrary, refs)
    return results.map((result) => ({
      ok: result.ok,
      ref: result.ref,
      reason: result.ok ? undefined : result.reason,
      ...(result.ok ? { closed: result.closed, source: result.source } : {}),
    }))
  }
}

export function scopedCurrentOverrides(lib: ScopedLibrary): () => Promise<KernelOverride[]> {
  return () => lib.activeOverrides()
}

/**
 * 当前装的数据版本记号（N1）：所有已装官方集的提交号 + 可见来源集合，所有自制包的稳定标识 + 校验值。
 * 按源登记表走（加一个源 = 登记一行），不写死中/英；中英任一套变化都会变。
 */
export function libraryDataVersion(revisions: LibraryRevisionStore, service: LibraryService): (at?: LibraryView) => Promise<KernelDataVersion> {
  // at：按哪个资料版本算（开着的战役小窗用它打开时那一版；不给 = 当前发布的）
  return async (at) => {
    const view = at ?? await revisions.published()
    const brews: Record<string, BrewSetState> = { ...(await revisions.allBrewStates(view)) }
    for (const source of SOURCES.filter((s) => s.kind === 'brew')) {
      if (brews[source.id]?.packs) continue
      try {
        const installed = await service.brewInstalled(source.id, view)
        brews[source.id] = {
          packs: installed.map((entry) => {
            const head = entry.head as Record<string, unknown>
            const id = String(head.docIdLocal ?? '')
            const stable = typeof head.url === 'string' ? head.url : id
            return { docIdLocal: id, stableId: stable, checksum: String(head.checksum ?? head.version ?? head.dateAdded ?? head.filename ?? '') }
          }),
        }
      } catch {
        brews[source.id] = { packs: [] }
      }
    }
    return revisions.dataVersion(view, brews)
  }
}
