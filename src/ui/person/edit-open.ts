// 打开模块的来源条目抽屉（通用编辑窗口，P6-R）：哪一块（人物上的路径，或某件物品上的路径）+ 标题 + 可选的说明 / 总数 / 添加条目落点。
// 一次只开一个，不叠加。
import { markRaw } from 'vue'
import { useModalStore } from '../../stores/modal'
import FieldEditor from './FieldEditor.vue'
import ItemPickPage from './ItemPickPage.vue'
import ImportAsk from './ask/ImportAsk.vue'
import LevelPage from './LevelPage.vue'
import type { AddKind } from '../../rules/kernel/card-types'
import type { PickKeep } from '../libview/usePickList'
import { addProp } from '../../rules/kernel/card-types'
import { useAppStore } from '../../stores/app'
import { useCampaignStore } from '../../stores/campaign'
import { useToastStore } from '../../stores/toast'
import { openStart } from '../libview/edit-flow'
import { packTitle } from '../libview/mine'
import { useLibViewStore } from '../../stores/libview'

export interface FieldsOpts { itemName?: string; hint?: string; total?: { label: string; value: string }; addKey?: string; names?: Record<string, string>; width?: number }
export function openFields(title: string, target: { itemId?: string; path: string }, opts: FieldsOpts = {}): void {
  const { width = 560, ...rest } = opts
  useModalStore().open({ key: `person-fields:${target.itemId ?? ''}:${target.path}`, title, component: markRaw(FieldEditor), props: { target, title, ...rest }, variant: 'dialog', width, height: 760 })
}

/** 从库里给人物加东西（物品 / 法术 / 专长），和「从模板加入」同一个两栏页。 */
/** heading = 弹窗标题换成这一句（如「为德鲁伊（2 级）选子职业」）；query = 打开时搜索框里先填的（刚新建的自制条目）。 */
export function openPick(kind: AddKind, replace?: { id: string; name: string }, keep?: PickKeep, heading?: string, query?: string): void {
  const title = heading ?? (replace ? `换掉「${replace.name}」` : { items: '加物品', spells: '加法术', feats: '加专长', races: '选种族', backgrounds: '选背景', classes: '加职业', subclasses: '选子职业' }[kind])
  useModalStore().open({ key: `person-pick:${kind}:${query ?? ''}`, title, component: markRaw(ItemPickPage), props: { kind, replace, keep, query }, variant: 'dialog', width: 920, height: 680 })
}

/**
 * 新建自制职业 / 种族 / 背景（驾驶员 11-25 评测：不另开入口）：进【我的库】同一个新建条目流程（选起点 → 编辑器 → 预览兼保存，选存进哪个包），
 * 类别按本战役规则定好；存好回到这里的选条目页、搜索框填好刚存的名字，点「用这条」走和官方条目同一条作者导入。
 */
export async function openNewOwn(kind: 'classes' | 'races' | 'backgrounds'): Promise<void> {
  const app = useAppStore()
  const key = useCampaignStore().owner?.ownerKey
  if (!key) return
  const library = await app.svc().backend.kernelSave.libraryOf(key)
  const prop = addProp(library.rule, kind)
  const type = prop ? (await app.svc().backend.library.custom.entryTypes(library.codeSet)).find((t) => t.prop === prop) : undefined
  if (!type) { useToastStore().error('这套资料不收这一类自制条目'); return }
  // 存进哪个包：默认上次用的（一个包都没有时后端建「我的资料」，和「复制成我的」同一个默认），预览兼保存页还能换
  const custom = app.svc().backend.library.custom
  const packId = await custom.suggestedPack(library.codeSet)
  const mine = (await custom.packs(library.codeSet)).find((p) => p.id === packId)
  await useLibViewStore().loadPairs(app.svc())
  openStart(library.codeSet, mine ? { id: mine.id, name: packTitle(mine) } : null, type, ({ name }) => openPick(kind, undefined, undefined, undefined, name))
}

/** 已经知道是哪一条（升级：这个人的职业）：直接一问一答导入（作者「导入到人物」整路，第一题选到第几级）。 */
export function openImport(entryRef: unknown, name: string, title: string, level?: number): void {
  useModalStore().open({ key: 'person-import', title, component: markRaw(ImportAsk), props: { entryRef, name, closeOnBack: true, level }, variant: 'dialog', width: 760, height: 680 })
}

/** 用作者完整建卡器改这个人（升级 / 兼职 / 要做选择的成长；空白人物从头建）。 */
export function openLevel(title = '用建卡器升级 / 调整'): void {
  useModalStore().open({ key: 'person-level-native', title, component: markRaw(LevelPage), variant: 'dialog', width: 1100, height: 900 })
}
