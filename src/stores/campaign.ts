import { defineStore } from 'pinia'
import { computed, ref, shallowRef } from 'vue'
import { TrpgError } from '../core/errors'
import type { OwnerInfo } from '../core/ids'
import type { Services } from '../core/services'
import { isDirty } from '../core/saves/helpers'
import type { SaveSlot, Workspace, WorkspaceData } from '../schemas/campaign'

const PERSIST_DELAY = 500

/** 当前战役的状态入口：界面只读这里的状态、只调这里的 action（U2 §3）。 */
export const useCampaignStore = defineStore('campaign', () => {
  let services: Services | null = null
  let timer: ReturnType<typeof setTimeout> | undefined

  const owner = shallowRef<OwnerInfo | null>(null)
  const workspace = shallowRef<Workspace | null>(null)
  const readOnly = ref(false)
  const ready = ref(false)
  const dirty = ref(false)

  const hasCampaign = computed(() => workspace.value !== null)
  const currentSave = shallowRef<SaveSlot | null>(null)
  let adoptSeq = 0

  function svc(): Services {
    if (!services) throw new Error('存档服务尚未初始化')
    return services
  }

  function guardWrite(): void {
    if (readOnly.value) throw new TrpgError('E_READ_ONLY', '另一个窗口正在使用助手，此窗口为只读')
  }

  function adopt(ws: Workspace | null): void {
    workspace.value = ws
    dirty.value = ws ? isDirty(ws) : false
  }

  /** 当前存档的名称等信息（页头芯片与存档抽屉显示）。 */
  async function refreshCurrentSave(): Promise<void> {
    const seq = ++adoptSeq
    const id = workspace.value?.currentSaveId
    const save = id && services ? await services.campaign.getSave(id) : null
    if (seq === adoptSeq) currentSave.value = save
  }

  /** 载入指定归属（角色卡或群组）的当前数据；owner 为 null 表示没有打开聊天。 */
  async function init(s: Services, who: OwnerInfo | null): Promise<void> {
    services = s
    owner.value = who
    s.lock.onChange((value) => {
      readOnly.value = value
    })
    s.lock.start()
    readOnly.value = s.lock.readOnly
    adopt(who ? await s.campaign.getWorkspace(who.ownerKey) : null)
    ready.value = true
  }

  /** 切换聊天后换成另一个归属的当前数据（先把未写入的改动写掉）。 */
  async function switchOwner(who: OwnerInfo | null): Promise<void> {
    await flush()
    owner.value = who
    adopt(who && services ? await services.campaign.getWorkspace(who.ownerKey) : null)
  }

  async function flush(): Promise<void> {
    if (timer !== undefined) {
      clearTimeout(timer)
      timer = undefined
    }
    if (workspace.value && !readOnly.value) await svc().campaign.putWorkspace(workspace.value)
  }

  /** 修改游戏数据：先更新内存状态，再延迟写入存储。 */
  function updateData(updater: (data: WorkspaceData) => WorkspaceData): void {
    guardWrite()
    if (!workspace.value) throw new TrpgError('E_NO_WORKSPACE', '还没有当前战役')
    adopt({ ...workspace.value, data: updater(workspace.value.data) })
    if (timer !== undefined) clearTimeout(timer)
    timer = setTimeout(() => void flush(), PERSIST_DELAY)
  }

  async function startNew(input: { ruleId: string; packIds: string[]; name: string; note?: string }): Promise<SaveSlot> {
    guardWrite()
    if (!owner.value) throw new TrpgError('E_NO_WORKSPACE', '请先在酒馆中打开一个聊天')
    await flush()
    const result = await svc().campaign.startNewCampaign({ ...owner.value, ...input })
    adopt(result.workspace)
    return result.save
  }

  async function save(): Promise<boolean> {
    guardWrite()
    if (!owner.value) return false
    await flush()
    const result = await svc().campaign.saveCurrent(owner.value.ownerKey)
    adopt(result.workspace)
    return result.changed
  }

  async function branch(name?: string): Promise<SaveSlot> {
    guardWrite()
    if (!owner.value) throw new TrpgError('E_NO_WORKSPACE', '还没有当前战役')
    await flush()
    const result = await svc().campaign.branch(owner.value.ownerKey, name)
    adopt(result.workspace)
    return result.save
  }

  async function load(saveId: string, opts: { allowRuleSwitch?: boolean } = {}): Promise<void> {
    guardWrite()
    if (!owner.value) throw new TrpgError('E_NO_WORKSPACE', '请先在酒馆中打开一个聊天')
    await flush()
    adopt(await svc().campaign.loadSave(owner.value, saveId, opts))
  }

  async function setPackEnabled(packId: string, enabled: boolean): Promise<string[]> {
    guardWrite()
    if (!owner.value) throw new TrpgError('E_NO_WORKSPACE', '还没有当前战役')
    await flush()
    const result = await svc().campaign.setPackEnabled(owner.value.ownerKey, packId, enabled)
    adopt(result.workspace)
    return result.autoEnabled
  }

  return { owner, workspace, readOnly, ready, dirty, hasCampaign, currentSave, init, switchOwner, refreshCurrentSave, flush, updateData, startNew, save, branch, load, setPackEnabled }
})
