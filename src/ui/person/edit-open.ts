// 打开模块的来源条目抽屉（通用编辑窗口，P6-R）：哪一块（人物上的路径，或某件物品上的路径）+ 标题 + 可选的说明 / 总数 / 添加条目落点。
// 一次只开一个，不叠加。
import { markRaw } from 'vue'
import { useModalStore } from '../../stores/modal'
import FieldEditor from './FieldEditor.vue'
import ItemPickPage from './ItemPickPage.vue'
import LevelPage from './LevelPage.vue'
import type { AddKind } from '../../rules/kernel/card-types'

export interface FieldsOpts { hint?: string; total?: { label: string; value: string }; addKey?: string; names?: Record<string, string>; width?: number }
export function openFields(title: string, target: { itemId?: string; path: string }, opts: FieldsOpts = {}): void {
  const { width = 560, ...rest } = opts
  useModalStore().open({ key: `person-fields:${target.itemId ?? ''}:${target.path}`, title, component: markRaw(FieldEditor), props: { target, title, ...rest }, variant: 'dialog', width, height: 760 })
}

/** 从库里给人物加东西（物品 / 法术 / 专长），和「从模板加入」同一个两栏页。 */
export function openPick(kind: AddKind, replace?: { id: string; name: string }): void {
  const title = replace ? `换掉「${replace.name}」` : { items: '加物品', spells: '加法术', feats: '加专长', races: '选种族', backgrounds: '选背景', classes: '加职业' }[kind]
  useModalStore().open({ key: `person-pick:${kind}`, title, component: markRaw(ItemPickPage), props: { kind, replace }, variant: 'dialog', width: 920, height: 680 })
}

/** 用作者完整建卡器改这个人（升级 / 兼职 / 要做选择的成长；空白人物从头建）。 */
export function openLevel(title = '用建卡器升级 / 调整'): void {
  useModalStore().open({ key: 'person-level-native', title, component: markRaw(LevelPage), variant: 'dialog', width: 1100, height: 900 })
}
