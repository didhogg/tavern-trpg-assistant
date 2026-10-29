import { libraryOf, ORIGINAL, type Variant } from '../../core/library/types'
import { setSourceUse } from '../../core/library/variants'
import type { FixKind, Issue } from '../../core/library/integrity'
import { useCampaignStore } from '../../stores/campaign'
import { useLibraryStore } from '../../stores/library'
import { useToastStore } from '../../stores/toast'
import { errorText } from '../format'
import { askConfirm } from '../kit/confirm'

function fail(message: string, error: unknown): void {
  console.error(`[trpg-assistant] ${message}`, error)
  useToastStore().error(`${message}：${errorText(error)}`)
}

/** 规则选项开关：即时生效，提示条带撤销。 */
export async function ruleOptionFlow(key: string, name: string, value: boolean): Promise<void> {
  const campaign = useCampaignStore()
  const toast = useToastStore()
  try {
    await campaign.mutate(async (s, owner) => ({ workspace: await s.library.setRuleOption(owner, key, value) }))
    toast.undoable(`「${name}」已${value ? '打开' : '关闭'}`, async () => {
      await campaign.mutate(async (s, owner) => ({ workspace: await s.library.setRuleOption(owner, key, !value) }))
    })
  } catch (error) {
    fail('设置失败', error)
  }
}

export async function updateFeaturesFlow(packId: string, name: string): Promise<void> {
  const campaign = useCampaignStore()
  const toast = useToastStore()
  try {
    const result = await campaign.mutate((s, owner) => s.library.updateFeaturesSafely(owner, packId))
    toast.success(result.kept.length ? result.kept.map((k) => k.reason).join('；') : `「${name}」的功能定义已更新`)
  } catch (error) {
    fail('更新失败', error)
  }
}

/** 某个来源的修改版「全部使用 / 全部不用」；会改变其他版本的条目时先确认并列出结果。 */
export async function sourceUseFlow(match: (v: Variant) => boolean, sourceName: string, use: boolean, nameOf: (entryKey: string) => string): Promise<void> {
  const campaign = useCampaignStore()
  const toast = useToastStore()
  const ws = campaign.workspace
  if (!ws) return
  try {
    const preview = setSourceUse(ws.data, match, use)
    if (!preview.changed.length) {
      toast.info('没有需要改动的条目')
      return
    }
    const label = (key: string): string => (key === ORIGINAL ? '原版' : '其他版本')
    const details = preview.changed.map((c) => `${nameOf(c.entryKey)}：${label(c.from)} → ${use ? `《${sourceName}》的版本` : label(c.to)}`)
    const other = preview.changed.some((c) => c.from !== ORIGINAL)
    if (other || !use) {
      const ok = await askConfirm({ title: use ? '全部使用' : '全部不用', message: use ? `将有 ${preview.changed.length} 个条目改用《${sourceName}》的版本：` : `《${sourceName}》正在使用的 ${preview.changed.length} 个条目会改回：`, details, confirmLabel: use ? '全部使用' : '全部不用' })
      if (!ok) return
    }
    const before = ws.data
    await campaign.mutate((s, owner) => s.library.setSourceUse(owner, match, use))
    toast.undoable(use ? `已改用《${sourceName}》的版本` : `已不再使用《${sourceName}》的版本`, async () => {
      await campaign.mutate(async (s, owner) => ({ workspace: await s.campaign.updateData(owner, () => before) }))
    })
  } catch (error) {
    fail('修改失败', error)
  }
}

export async function switchVariantFlow(entryKey: string, variantKey: string, name: string): Promise<void> {
  const campaign = useCampaignStore()
  const toast = useToastStore()
  const ws = campaign.workspace
  const before = ws ? libraryOf(ws.data).variants[entryKey]?.active : undefined
  try {
    await campaign.mutate(async (s, owner) => ({ workspace: await s.library.switchVariant(owner, entryKey, variantKey) }))
    toast.undoable(`「${name}」已切换版本`, async () => {
      if (before) await campaign.mutate(async (s, owner) => ({ workspace: await s.library.switchVariant(owner, entryKey, before) }))
    })
  } catch (error) {
    fail('切换失败', error)
  }
}

/** 体检修复：修复前写自动存档，修复后自动重新检查。 */
export async function repairFlow(issue: Issue, fix: FixKind, arg?: string): Promise<void> {
  const campaign = useCampaignStore()
  const library = useLibraryStore()
  const toast = useToastStore()
  try {
    await campaign.mutate(async (s, owner) => ({ workspace: await s.library.repair(owner, issue, fix, arg) }))
    await library.runIntegrity()
    toast.success('已修复')
  } catch (error) {
    fail('修复失败', error)
  }
}
