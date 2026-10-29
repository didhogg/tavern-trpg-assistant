import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SaveSlot } from '../schemas/campaign'
import { useAppStore } from './app'
import { useCampaignStore } from './campaign'

export type SaveScope = 'card' | 'all'

/** 存档抽屉用的存档列表与操作。 */
export const useSavesStore = defineStore('saves', () => {
  const app = useAppStore()
  const campaign = useCampaignStore()
  const scope = ref<SaveScope>('card')
  const manual = ref<SaveSlot[]>([])
  const autos = ref<SaveSlot[]>([])
  const deleted = ref<SaveSlot[]>([])
  const otherRules = ref<SaveSlot[]>([])
  /** 没有当前战役时：全部存档（按规则分组显示）。 */
  const everything = ref<SaveSlot[]>([])
  const loading = ref(false)

  async function refresh(): Promise<void> {
    const s = app.svc()
    loading.value = true
    try {
      const ws = campaign.workspace
      if (!ws) {
        everything.value = (await s.db.saves.toArray()).filter((x) => x.kind === 'manual' && x.deletedAt === undefined).sort((a, b) => b.updatedAt - a.updatedAt)
        manual.value = autos.value = deleted.value = otherRules.value = []
        return
      }
      const owner = { ownerKey: ws.ownerKey, ruleId: ws.ruleId }
      manual.value = await s.campaign.listManual(owner, scope.value)
      autos.value = await s.campaign.listAuto(ws.ownerKey, ws.ruleId)
      deleted.value = await s.campaign.listDeleted(ws.ruleId)
      otherRules.value = await s.campaign.listOtherRules(ws.ruleId)
    } finally {
      loading.value = false
    }
  }

  async function setScope(next: SaveScope): Promise<void> {
    scope.value = next
    await refresh()
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

  return { scope, manual, autos, deleted, otherRules, everything, loading, refresh, setScope, count, rename, setNote, remove, restore, purge, autoAsManual }
})
