import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'
import type { Services } from '../core/services'
import { DEFAULT_PREFETCH_CODE_SETS } from '../library/prefetch'
import { chooseSource, defaultCampaignLibrary, type CampaignLibrary } from '../library/scopes'
import type { ShelfGroup } from '../library/shelf'

export interface ShelfState {
  groups: ShelfGroup[]
  booksError: string | null
  adventuresError: string | null
}

/**
 * 库页状态（P5）：当前"看库"用的战役设置 + 书架。
 * 有战役（已绑定结算内核）→ 用战役级设置（读档不改它）；没有战役 → 无战役浏览：所有书显示为关、开关不可用（R60）。
 */
export const useLibViewStore = defineStore('library', () => {
  const campaignLib = shallowRef<CampaignLibrary | null>(null)
  const bound = ref(false)
  const shelf = shallowRef<ShelfState | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  let seq = 0

  /** 读当前战役的选书设置 + 书架。ownerKey 为 null = 没打开聊天。 */
  async function load(s: Services, ownerKey: string | null): Promise<void> {
    const mine = ++seq
    loading.value = true
    error.value = null
    try {
      const ks = s.backend.kernelSave
      let lib: CampaignLibrary | null = null
      if (ownerKey && (await ks.read(ownerKey))) lib = (await ks.libraryOf(ownerKey)) as CampaignLibrary
      const current = lib ?? defaultCampaignLibrary(s.rules.list()[0]?.id ?? 'dnd5e2014', DEFAULT_PREFETCH_CODE_SETS[0])
      const next = await s.backend.library.scoped.shelf(current)
      if (mine !== seq) return
      bound.value = !!lib
      campaignLib.value = current
      shelf.value = next
    } catch (e) {
      if (mine === seq) error.value = e instanceof Error ? e.message : String(e)
      console.error('[trpg-assistant] 读取书架失败', e)
    } finally {
      if (mine === seq) loading.value = false
    }
  }

  /** 开 / 关一本书（本战役）：立即生效，不出预览（R77）。 */
  async function toggleSource(s: Services, ownerKey: string, source: string, visible: boolean): Promise<void> {
    const ks = s.backend.kernelSave
    const lib = await ks.libraryOf(ownerKey)
    const lists = chooseSource(lib, source, visible)
    await ks.setLibrary(ownerKey, { ...lib, ...lists })
    await load(s, ownerKey)
  }

  return { campaignLib, bound, shelf, loading, error, load, toggleSource }
})
