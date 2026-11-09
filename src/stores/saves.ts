import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'
import type { CampaignView } from '../core/saves/view'
import type { SaveSlot } from '../schemas/campaign'
import { useAppStore } from './app'
import { useCampaignStore } from './campaign'

/** 没有当前战役时，按规则分开的战役列表。 */
export interface RuleCampaigns { ruleId: string; view: CampaignView }

/** 存档抽屉用的数据与操作：战役视图（当前战役的存档树、其他战役）+ 自动存档 / 最近删除 / 其他规则。 */
export const useSavesStore = defineStore('saves', () => {
  const app = useAppStore()
  const campaign = useCampaignStore()
  /** 当前战役视图（页头芯片、首页横幅、抽屉都读它）；没有当前战役时为 null。 */
  const view = shallowRef<CampaignView | null>(null)
  /** 没有当前战役时：每条已安装规则的战役列表。 */
  const byRule = shallowRef<RuleCampaigns[]>([])
  const autos = ref<SaveSlot[]>([])
  const deleted = ref<SaveSlot[]>([])
  const otherRules = ref<SaveSlot[]>([])
  const loading = ref(false)
  let seq = 0

  /** 只更新战役视图（轻量，页头用）。 */
  async function refreshView(): Promise<void> {
    const mine = ++seq
    const ws = campaign.workspace
    const next = ws ? await app.svc().campaign.getCampaignView(ws.ownerKey, ws.ruleId) : null
    if (mine === seq) view.value = next
  }

  async function refresh(): Promise<void> {
    const s = app.svc()
    loading.value = true
    try {
      await refreshView()
      const ws = campaign.workspace
      if (ws) {
        autos.value = await s.campaign.listAuto(ws.ownerKey, ws.ruleId)
        deleted.value = await s.campaign.listDeleted(ws.ruleId)
        otherRules.value = await s.campaign.listOtherRules(ws.ruleId)
        byRule.value = []
        return
      }
      const owner = campaign.owner
      const ids = s.rules.list().map((r) => r.id)
      byRule.value = owner ? await Promise.all(ids.map(async (ruleId) => ({ ruleId, view: await s.campaign.getCampaignView(owner.ownerKey, ruleId) }))) : []
      autos.value = deleted.value = []
      const manual = (await s.db.saves.toArray()).filter((x) => x.kind === 'manual' && x.deletedAt === undefined && !s.rules.has(x.ruleId))
      otherRules.value = manual.sort((a, b) => b.updatedAt - a.updatedAt)
    } finally {
      loading.value = false
    }
  }

  async function count(): Promise<number> {
    return (await app.svc().db.saves.toArray()).filter((x) => x.kind === 'manual' && x.deletedAt === undefined).length
  }

  async function run<T>(action: () => Promise<T>): Promise<T> {
    const result = await action()
    await refresh()
    return result
  }

  const rename = (id: string, name: string) =>
    run(async () => {
      const saved = await app.svc().campaign.renameSave(id, name)
      await campaign.refreshCurrentSave()
      return saved
    })
  const setNote = (id: string, note: string) => run(() => app.svc().campaign.setNote(id, note))
  const remove = (id: string) => run(() => app.svc().campaign.deleteSave(id))
  const restore = (id: string) => run(() => app.svc().campaign.restoreSave(id))
  const purge = (ids: string[]) => run(() => app.svc().campaign.purgeSaves(ids))
  const autoAsManual = (id: string) => run(() => app.svc().campaign.saveAutoAsManual(id))

  return { view, byRule, autos, deleted, otherRules, loading, refreshView, refresh, count, rename, setNote, remove, restore, purge, autoAsManual }
})
