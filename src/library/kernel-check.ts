// P3-3 与 P3-1 的接线：读档检查直接问【库】的按战役取条目入口。
import type { KernelRefChecker } from '../core/saves/kernel'
import type { KernelOverride } from '../schemas/kernel'
import type { ScopedLibrary } from './scoped'
import type { CampaignLibrary } from './scopes'

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
