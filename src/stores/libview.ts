import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'
import type { Services } from '../core/services'
import { useCampaignStore } from './campaign'
import { DEFAULT_PREFETCH_CODE_SETS } from '../library/prefetch'
import { chooseSource, defaultCampaignLibrary, type CampaignLibrary } from '../library/scopes'
import type { BrewPack } from '../library/brew-packs'
import type { PackPair } from '../library/custom-lang'
import type { ShelfGroup } from '../library/shelf'
import { SOURCES } from '../library/sources'

export interface ShelfState {
  groups: ShelfGroup[]
  booksError: string | null
  adventuresError: string | null
  /** 某套自制包读取失败（只影响自制那一块，P5-4 §3.1）。 */
  brewError?: string | null
}

/**
 * 库页状态（P5）：当前"看库"用的战役设置 + 书架。
 * 有战役（已绑定结算内核）→ 用战役级设置（读档不改它）；没有战役 → 无战役浏览：所有书显示为关、开关不可用（R60）。
 */
export const useLibViewStore = defineStore('library', () => {
  const campaignLib = shallowRef<CampaignLibrary | null>(null)
  const bound = ref(false)
  const shelf = shallowRef<ShelfState | null>(null)
  /** 我的库里的包（导入的 / 存入的副本）；书架按包编号隐藏这些副本。 */
  const minePacks = shallowRef<BrewPack[]>([])
  const brewSetId = (codeSet: string): string | null => SOURCES.find((x) => x.kind === 'brew' && x.codeSet === codeSet)?.id ?? null
  /** 官方资料没装：自制包读不了（作者程序启动要读官方数据），书架提示一句。 */
  const officialMissing = ref(false)
  /** P5.5【我的库】：中英配对后的包（一对一行）。 */
  const pairs = shallowRef<PackPair[] | null>(null)
  const pairsError = ref<string | null>(null)
  const pairsNote = ref<string | null>(null)
  let pairSeq = 0
  async function loadPairs(s: Services): Promise<void> {
    const mine = ++pairSeq
    pairsError.value = null
    pairsNote.value = null
    try {
      const next = await s.backend.library.bilingual.packs()
      if (mine === pairSeq) pairs.value = next
    } catch (e) {
      // 另一种语言的资料没装时配对读不出来：先只列现在这种语言的包（后端缺口见 P5.5 §16.7），别让整个我的库读不出来
      console.warn('[trpg-assistant] 中英配对读不出来，先只列这一种语言的包', e)
      const cs = campaignLib.value?.codeSet ?? DEFAULT_PREFETCH_CODE_SETS[0]
      try {
        const one = await s.backend.library.custom.packs(cs)
        if (mine !== pairSeq) return
        pairs.value = one.map((p) => ({ id: p.id, zh: cs === 'en' ? null : p, en: cs === 'en' ? p : null }))
        pairsNote.value = '另一种语言的资料没装，先只列这一种语言的包'
      } catch (e2) {
        console.error('[trpg-assistant] 读取我的库失败', e2)
        if (mine === pairSeq) pairsError.value = e2 instanceof Error ? e2.message : String(e2)
      }
    }
  }
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
      const brew = brewSetId(current.codeSet)
      const imported = brew ? (await s.backend.library.brewPacks.list(brew)).filter((p) => p.origin === 'import') : []
      const missing = !(await s.backend.library.service.officialInstalled(current.codeSet))
      if (mine !== seq) return
      officialMissing.value = missing
      bound.value = !!lib
      campaignLib.value = current
      shelf.value = next
      minePacks.value = imported
    } catch (e) {
      if (mine === seq) error.value = e instanceof Error ? e.message : String(e)
      console.error('[trpg-assistant] 读取书架失败', e)
    } finally {
      if (mine === seq) loading.value = false
    }
  }

  /**
   * 按「现在的战役」重读书架。下载完成、装 / 删包、拉取更新之后用它，别自己传 ownerKey：
   * 以前下载自制包后传了 null，书架被读成「没有战役」，所有书显示为关（P5-1 B-49）。
   */
  function refresh(s: Services): Promise<void> {
    const campaign = useCampaignStore()
    return load(s, campaign.hasCampaign ? campaign.owner?.ownerKey ?? null : null)
  }

  /** 开 / 关一本书（本战役）：立即生效，不出预览（R77）。 */
  async function toggleSource(s: Services, ownerKey: string, source: string, visible: boolean): Promise<void> {
    const ks = s.backend.kernelSave
    const lib = await ks.libraryOf(ownerKey)
    const lists = chooseSource(lib, source, visible)
    await ks.setLibrary(ownerKey, { ...lib, ...lists })
    await load(s, ownerKey)
  }

  /** 一次改多本书的开关（批量勾选）：逐个算出新的加入 / 排除，只写一次战役设置。 */
  async function applySources(s: Services, ownerKey: string, changes: Record<string, boolean>): Promise<void> {
    const ks = s.backend.kernelSave
    let cur = await ks.libraryOf(ownerKey)
    for (const [source, visible] of Object.entries(changes)) cur = { ...cur, ...chooseSource(cur, source, visible) }
    await ks.setLibrary(ownerKey, cur)
    await load(s, ownerKey)
  }

  return { applySources, campaignLib, pairs, pairsError, pairsNote, loadPairs, bound, officialMissing, shelf, minePacks, brewSetId, loading, error, load, refresh, toggleSource }
})
