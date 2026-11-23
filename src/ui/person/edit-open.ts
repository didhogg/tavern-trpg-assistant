// 打开模块的来源条目抽屉（通用编辑窗口，P6-R）：哪一块（人物上的路径，或某件物品上的路径）+ 标题 + 可选的说明 / 总数 / 添加条目落点。
// 一次只开一个，不叠加。
import { markRaw } from 'vue'
import { useModalStore } from '../../stores/modal'
import FieldEditor from './FieldEditor.vue'
import ItemPickPage from './ItemPickPage.vue'
import type { AddKind } from '../../rules/kernel/card-types'

export interface FieldsOpts { hint?: string; total?: { label: string; value: string }; addKey?: string; names?: Record<string, string>; width?: number }
export function openFields(title: string, target: { itemId?: string; path: string }, opts: FieldsOpts = {}): void {
  const { width = 560, ...rest } = opts
  useModalStore().open({ key: `person-fields:${target.itemId ?? ''}:${target.path}`, title, component: markRaw(FieldEditor), props: { target, title, ...rest }, variant: 'dialog', width, height: 760 })
}

/** 从库里给人物加东西（物品 / 法术 / 专长），和「从模板加入」同一个两栏页。 */
export function openPick(kind: AddKind): void {
  const title = { items: '加物品', spells: '加法术', feats: '加专长' }[kind]
  useModalStore().open({ key: `person-pick:${kind}`, title, component: markRaw(ItemPickPage), props: { kind }, variant: 'dialog', width: 920, height: 680 })
}
