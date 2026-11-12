import type { Pinia } from 'pinia'
import { watch } from 'vue'
import { requestPersistence } from '../../core/backup'
import { scheduleCatalogPrefetch } from '../../library/prefetch'
import { ownerFromHost } from '../../core/ids'
import { createServices } from '../../core/services'
import { eventName, getContext, onEvent } from '../../host/context'
import type { StContext } from '../../host/types'
import { useAppStore } from '../../stores/app'
import { useCampaignStore } from '../../stores/campaign'
import { useDiceStore } from '../../stores/dice'
import { useDownloadsStore } from '../../stores/downloads'
import { useSavesStore } from '../../stores/saves'
import { useToastStore } from '../../stores/toast'

/** 启动：打开数据库、载入当前聊天的战役数据，并跟随聊天切换。 */
export async function bootApp(ctx: StContext, pinia: Pinia): Promise<() => void> {
  const app = useAppStore(pinia)
  const toast = useToastStore(pinia)
  const campaign = useCampaignStore(pinia)
  const dice = useDiceStore(pinia)
  const downloads = useDownloadsStore(pinia)
  const saves = useSavesStore(pinia)
  try {
    const services = createServices()
    app.setServices(services)
    await services.backend.library.ready
    await requestPersistence(services.db)
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

  // 当前存档的名称与时间、战役名：存档切换、保存后重新读取
  const stopSave = watch(
    () => [campaign.workspace?.currentSaveId, campaign.workspace?.savedHash, campaign.owner?.ownerKey],
    () => {
      void campaign.refreshCurrentSave().catch((error: unknown) => console.error('[trpg-assistant] 读取当前存档信息失败', error))
      void saves.refreshView().catch((error: unknown) => console.error('[trpg-assistant] 读取战役视图失败', error))
    },
    { immediate: true },
  )
  // 资料下载进度（侧栏库标签的小环）：定时读 library.tasks.list()
  const stopDownloads = downloads.start(() => app.svc().backend.library.tasks.list())
  const cancelPageDownloads = (): void => app.svc().backend.library.tasks.stopDownloads()
  const offline = (): void => {
    app.svc().backend.library.tasks.stopDownloads(new DOMException('网络已断开，已丢弃这次未完成的下载', 'NetworkError'))
  }
  window.addEventListener('pagehide', cancelPageDownloads)
  window.addEventListener('offline', offline)
  // S5：进入有结算内核的战役后开小窗；切换聊天/读档时关旧开新；没有战役/未绑定不开。
  let kernelSeq = 0
  const reconcileKernel = (): void => {
    const ownerKey = campaign.owner?.ownerKey ?? null
    const bound = !!campaign.workspace?.data?.kernel
    const seq = ++kernelSeq
    void (async () => {
      const services = app.svc()
      if (!ownerKey || !bound || campaign.readOnly) {
        await services.backend.kernel.closeAllExcept(null)
        return
      }
      await services.backend.kernel.enter(ownerKey)
      if (seq !== kernelSeq) return
    })().catch((error: unknown) => {
      console.error('[trpg-assistant] 结算内核启动失败', error)
      toast.error(`结算内核启动失败：${error instanceof Error ? error.message : String(error)}`)
    })
  }
  // 首次启动后台预取书目与文件清单（缓存在就什么都不做；联网失败静默，下次启动再试）
  const stopPrefetch = scheduleCatalogPrefetch(app.svc().backend.library.prefetch)
  reconcileKernel()
  const stopKernel = watch(
    () => [campaign.owner?.ownerKey ?? '', !!campaign.workspace?.data?.kernel, campaign.readOnly],
    () => reconcileKernel(),
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
    window.removeEventListener('pagehide', cancelPageDownloads)
    window.removeEventListener('offline', offline)
    cancelPageDownloads()
    stop()
    stopSave()
    stopDownloads()
    stopKernel()
    stopPrefetch()
    off()
    if (campaign.owner) void app.svc().backend.kernel.closeAllExcept(null)
  }
}
