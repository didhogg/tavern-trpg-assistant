import type { Pinia } from 'pinia'
import { watch } from 'vue'
import { requestPersistence } from '../../core/backup'
import { ownerFromHost } from '../../core/ids'
import { loadBuiltinPack } from '../../core/packs/builtinFile'
import { installBuiltinPacks } from '../../core/packs/builtins'
import { createServices } from '../../core/services'
import { eventName, getContext, onEvent } from '../../host/context'
import type { StContext } from '../../host/types'
import { DND5E2014_RULE_ID } from '../../rules/dnd5e2014'
import { useAppStore } from '../../stores/app'
import { useCampaignStore } from '../../stores/campaign'
import { useDiceStore } from '../../stores/dice'
import { useLibraryStore } from '../../stores/library'
import { useToastStore } from '../../stores/toast'

/** 启动：打开数据库、安装内置包、载入当前聊天的战役数据，并跟随聊天切换。 */
export async function bootApp(ctx: StContext, pinia: Pinia): Promise<() => void> {
  const app = useAppStore(pinia)
  const toast = useToastStore(pinia)
  const campaign = useCampaignStore(pinia)
  const dice = useDiceStore(pinia)
  const library = useLibraryStore(pinia)
  try {
    const services = createServices()
    app.setServices(services)
    const rule = services.rules.get(DND5E2014_RULE_ID)
    if (!rule) throw new Error('规则未注册')
    const built = await installBuiltinPacks(services.db, services.packs, rule, loadBuiltinPack)
    if (built.failed.length) {
      console.error('[trpg-assistant] 内置内容包安装失败', built.failed)
      toast.error(`内置规则资料安装失败：${built.failed.map((f) => f.message).join('；')}`)
    }
    await requestPersistence(services.db)
    await library.refreshInstalled()
    await app.refreshBackup()
    const owner = ownerFromHost(getContext())
    await campaign.init(services, owner)
    dice.setOwner(owner?.ownerKey ?? null)
    app.booted = true
  } catch (error) {
    console.error('[trpg-assistant] 启动失败', error)
    app.bootError = error instanceof Error ? error.message : String(error)
    return () => undefined
  }

  // 当前存档的名称与时间：存档切换、保存后重新读取
  const stopSave = watch(
    () => [campaign.workspace?.currentSaveId, campaign.workspace?.savedHash],
    () => void campaign.refreshCurrentSave().catch((error: unknown) => console.error('[trpg-assistant] 读取当前存档信息失败', error)),
    { immediate: true },
  )
  const stop = watch(
    () => campaign.readOnly,
    (readOnly) => {
      if (readOnly) toast.status('另一个窗口正在使用助手，这里只能查看')
    },
    { immediate: true },
  )
  const off = onEvent(ctx, eventName(ctx, 'CHAT_CHANGED', 'chat_id_changed'), () => {
    const next = ownerFromHost(getContext())
    void campaign.switchOwner(next).catch((error: unknown) => {
      console.error('[trpg-assistant] 切换聊天后载入战役数据失败', error)
      toast.error('切换聊天后载入战役数据失败，请重新打开助手')
    })
    dice.setOwner(next?.ownerKey ?? null)
  })
  return () => {
    stop()
    stopSave()
    off()
  }
}
