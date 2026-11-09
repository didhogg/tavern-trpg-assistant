import { markRaw } from 'vue'
import { useAppStore } from '../../stores/app'
import { useCampaignStore } from '../../stores/campaign'
import { useModalStore } from '../../stores/modal'
import { useToastStore } from '../../stores/toast'
import { errorText } from '../format'
import SaveDrawerPage from './SaveDrawerPage.vue'
import LoadConfirmPage, { type LoadTarget } from './LoadConfirmPage.vue'
import WizardPage from '../wizard/WizardPage.vue'
import { resetWizard } from '../wizard/state'

export function openSaveDrawer(): void {
  useModalStore().open({ key: 'saves', title: '存档', component: markRaw(SaveDrawerPage), variant: 'drawer' })
}

/** 开局向导：从首页横幅与存档抽屉底部「新建战役」打开，同一个向导。✕、Esc、点遮罩直接回首页，不弹放弃确认。 */
export function openWizard(): void {
  resetWizard()
  useModalStore().open({ key: 'wizard', title: '开始新冒险', component: markRaw(WizardPage), variant: 'dialog' })
}

/** 保存存档：成功提示「已保存存档」，没有改动提示「已是最新」。 */
export async function saveNow(): Promise<void> {
  const campaign = useCampaignStore()
  const toast = useToastStore()
  if (!campaign.hasCampaign || campaign.readOnly) return
  try {
    const changed = await campaign.save()
    await useAppStore().refreshBackup()
    toast.success(changed ? '已保存存档' : '已是最新')
  } catch (error) {
    console.error('[trpg-assistant] 保存存档失败', error)
    toast.error(`保存存档失败：${errorText(error)}`)
  }
}

/** 读取存档：在抽屉里换到「读取确认」一页（系统先检查，用户只做一次决定）。 */
export function openLoadConfirm(save: LoadTarget): void {
  const campaign = useCampaignStore()
  if (campaign.readOnly) return
  useModalStore().push({ key: `load:${save.id}`, title: `读取「${save.name}」`, component: markRaw(LoadConfirmPage), props: { save } })
}
