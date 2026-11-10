// 打开库页弹窗：包 / 书（栈底）、条目详情（弹窗内前进一页）。弹窗是 sheet 变体：宽屏居中、窄屏底部抽屉；同一时间只有一个弹窗，详情是入栈。
import { useModalStore } from '../../stores/modal'
import type { EntryRef } from '../../library/scopes'
import EntryPage from './EntryPage.vue'
import ManagePage from './ManagePage.vue'
import PackHeader from './PackHeader.vue'
import PackPage from './PackPage.vue'
import ReaderPage from './ReaderPage.vue'
import SearchPage from './SearchPage.vue'

export interface PackProps {
  set: string
  source: string
  name: string
  /** 书 / 冒险的包：弹窗里的列表放一条「书」条目，点进去是阅读器。 */
  kind?: 'book' | 'adventure'
  /** 自制包里带正文的书 / 冒险（B-29）。 */
  corpora?: Array<{ prop: string; id: string; name: string }>
}

export function openPack(p: PackProps): void {
  useModalStore().open({ key: `pack:${p.set}:${p.source}`, title: p.name, component: PackPage, header: PackHeader, props: { ...p }, variant: 'sheet' })
}

export function openEntry(ref: EntryRef, title = ''): void {
  useModalStore().push({ key: `entry:${ref.set}:${ref.prop}:${ref.hash}`, title, component: EntryPage, props: { entryRef: ref }, variant: 'sheet' })
}

export function openSearch(): void {
  useModalStore().open({ key: 'search', title: '全库数据搜索', component: SearchPage, variant: 'sheet' })
}

/** 包的【管理】：在包弹窗里前进一页；没有弹窗时直接打开。 */
export function openManage(p: PackProps): void {
  useModalStore().push({ key: `manage:${p.set}:${p.source}`, title: `管理 · ${p.name}`, component: ManagePage, props: { ...p }, variant: 'sheet' })
}

/** 书 / 冒险阅读器：弹窗里前进一页。 */
export function openReader(r: { set: string; prop: string; id: string; name: string }): void {
  useModalStore().push({ key: `reader:${r.set}:${r.prop}:${r.id}`, title: r.name, component: ReaderPage, props: { ...r }, variant: 'sheet' })
}
