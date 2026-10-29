import { markRaw } from 'vue'
import { TrpgError } from '../../core/errors'
import type { SaveSlot } from '../../schemas/campaign'
import { useAppStore } from '../../stores/app'
import { useCampaignStore } from '../../stores/campaign'
import { useModalStore } from '../../stores/modal'
import { useSavesStore } from '../../stores/saves'
import { useToastStore } from '../../stores/toast'
import { askChoice } from '../kit/choice'
import { askConfirm } from '../kit/confirm'
import { errorText } from '../format'
import SaveDrawerPage from './SaveDrawerPage.vue'
import UnsavedLoadPage from './UnsavedLoadPage.vue'
import WizardPage from '../wizard/WizardPage.vue'
import { resetWizard, wizard } from '../wizard/state'

export function openSaveDrawer(): void {
  useModalStore().open({ key: 'saves', title: '存档', component: markRaw(SaveDrawerPage), variant: 'drawer' })
}

/** 开局向导：从首页横幅与存档抽屉「＋ 新存档」打开，同一个向导。 */
export function openWizard(): void {
  const modal = useModalStore()
  resetWizard()
  const guard = (): boolean => {
    if (!wizard.touched) return true
    void askConfirm({ title: '放弃这次新建？', message: '已经选好的内容不会保存。', confirmLabel: '放弃', cancelLabel: '继续填写', danger: true }).then((ok) => {
      if (ok) modal.close(true)
    })
    return false
  }
  modal.open({ key: 'wizard', title: '开始新冒险', component: markRaw(WizardPage), variant: 'dialog', guard })
}

/** 保存：成功提示「已保存」，没有改动提示「已是最新」。 */
export async function saveNow(): Promise<void> {
  const campaign = useCampaignStore()
  const toast = useToastStore()
  if (!campaign.hasCampaign || campaign.readOnly) return
  try {
    const changed = await campaign.save()
    await useAppStore().refreshBackup()
    toast.success(changed ? '已保存' : '已是最新')
  } catch (error) {
    console.error('[trpg-assistant] 保存失败', error)
    toast.error(`保存失败：${errorText(error)}`)
  }
}

export interface LoadOutcome { loaded: boolean }

/**
 * 读取存档（U2 §3.5）：有未保存改动时先问「保存后读取 / 不保存直接读取 / 取消」；
 * 其他规则的存档先确认切换规则。确认页都在当前弹窗内换页显示。
 */
export async function loadSaveFlow(save: SaveSlot): Promise<LoadOutcome> {
  const campaign = useCampaignStore()
  const modal = useModalStore()
  const toast = useToastStore()
  const saves = useSavesStore()
  if (campaign.readOnly) return { loaded: false }
  try {
    const switching = !!campaign.workspace && campaign.workspace.ruleId !== save.ruleId
    if (switching) {
      const rule = useAppStore().svc().rules.get(save.ruleId)
      const ok = await askConfirm({
        title: '切换规则',
        message: `「${save.name}」使用 ${rule?.name ?? save.ruleId}。读取后，整个助手会切换为该规则的界面与资料；当前的「${campaign.currentSave?.name ?? '存档'}」会先写入自动存档。`,
        confirmLabel: '切换并读取',
      })
      if (!ok) return { loaded: false }
    } else if (campaign.hasCampaign && campaign.dirty) {
      const choice = await askChoice<'save' | 'discard' | 'cancel'>(
        {
          key: 'confirm:unsaved',
          title: '有未保存的改动',
          component: markRaw(UnsavedLoadPage),
          props: (answer) => ({ current: campaign.currentSave?.name ?? '当前存档', target: save.name, onChoose: answer }),
        },
        'cancel',
      )
      if (choice === 'cancel') return { loaded: false }
      if (choice === 'save') await campaign.save()
    } else if (campaign.hasCampaign && save.ownerKey !== campaign.owner?.ownerKey) {
      const ok = await askConfirm({ title: '读取其他角色卡的存档', message: `「${save.name}」属于其他角色卡，读取时会复制为这张卡的新存档。`, confirmLabel: '读取' })
      if (!ok) return { loaded: false }
    }
    await campaign.load(save.id, { allowRuleSwitch: switching || !campaign.hasCampaign })
    await saves.refresh()
    toast.success(`已读取「${save.name}」`)
    modal.close(true)
    return { loaded: true }
  } catch (error) {
    console.error('[trpg-assistant] 读取存档失败', error)
    toast.error(error instanceof TrpgError ? error.message : `读取失败：${errorText(error)}`)
    return { loaded: false }
  }
}
