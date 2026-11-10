import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'
import type { Services } from '../core/services'
import type { CatalogPair } from '../library/brew-pairing'

/**
 * 自制包目录（下载页）：按作者仓库源的做法，库页一打开、有网就先把目录取回来放在这里；离开下载页再回来、下载失败，目录都还在，不用重新拉。
 * 只有取不到才给原因，页面里带【重试】；不自动反复重试。
 */
export const useBrewCatalogStore = defineStore('brewcatalog', () => {
  const rows = shallowRef<CatalogPair[] | null>(null)
  const errors = ref<{ zh: string[]; en: string[] }>({ zh: [], en: [] })
  const loading = ref(false)
  /** 整个目录取不到时的原因（有目录但某一种语言取失败，原因在 errors 里）。 */
  const error = ref<string | null>(null)
  let prefetched = false

  async function load(s: Services, zhSet: string, force = false): Promise<void> {
    if (loading.value || (rows.value && !force)) return
    loading.value = true
    error.value = null
    try {
      const r = await s.backend.library.brewPairs.catalog(zhSet)
      rows.value = r.rows
      errors.value = r.errors
    } catch (e) {
      console.error('[trpg-assistant] 读取自制目录失败', e)
      error.value = e instanceof Error ? e.message : String(e)
    } finally {
      loading.value = false
    }
  }

  /** 库页打开时调一次：有网就取；取失败不打扰，下载页里有原因和重试按钮。 */
  function prefetch(s: Services, zhSet: string): void {
    if (prefetched) return
    prefetched = true
    void load(s, zhSet)
  }

  return { rows, errors, loading, error, load, prefetch }
})
