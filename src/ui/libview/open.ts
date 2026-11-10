// 打开库页弹窗：包 / 书（栈底）、条目详情（弹窗内前进一页）。弹窗是 sheet 变体：宽屏居中、窄屏底部抽屉；同一时间只有一个弹窗，详情是入栈。
import { useModalStore } from '../../stores/modal'
import type { EntryRef } from '../../library/scopes'
import EntryPage from './EntryPage.vue'
import PackHeader from './PackHeader.vue'
import PackPage from './PackPage.vue'

export interface PackProps {
  set: string
  source: string
  name: string
}

export function openPack(p: PackProps): void {
  useModalStore().open({ key: `pack:${p.set}:${p.source}`, title: p.name, component: PackPage, header: PackHeader, props: { ...p }, variant: 'sheet' })
}

export function openEntry(ref: EntryRef, title = ''): void {
  useModalStore().push({ key: `entry:${ref.set}:${ref.prop}:${ref.hash}`, title, component: EntryPage, props: { entryRef: ref }, variant: 'sheet' })
}
