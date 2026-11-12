// 打开库页弹窗：包 / 书（栈底）、条目详情（弹窗内前进一页）。弹窗是 sheet 变体：宽屏居中、窄屏底部抽屉；同一时间只有一个弹窗，详情是入栈。
import { useModalStore } from '../../stores/modal'
import { entryPageKey } from '../../stores/entrylang'
import type { EntryRef, EntrySelection } from '../../library/scopes'
import EntryPage from './EntryPage.vue'
import EntryLangSwitch from './EntryLangSwitch.vue'
import ReaderLangSwitch from './ReaderLangSwitch.vue'
import BulkPage from './BulkPage.vue'
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
  /** 自制包的真实包编号：同来源多个包各开各的（P5 T6 包身份）。 */
  docIdLocal?: string
}

export function openPack(p: PackProps): void {
  useModalStore().open({ key: `pack:${p.set}:${p.docIdLocal ?? p.source}`, title: p.name, component: PackPage, header: PackHeader, props: { ...p }, variant: 'sheet' })
}

export function openEntry(ref: EntryRef, title = '', selection?: EntrySelection): void {
  const modal = useModalStore()
  const key = `${entryPageKey(ref, selection)}:page:${modal.depth}`
  modal.push({ key, title, component: EntryPage, header: EntryLangSwitch, props: { entryRef: ref, selection, pageKey: key }, variant: 'sheet' })
}

export function openSearch(): void {
  useModalStore().open({ key: 'search', title: '全库数据搜索', component: SearchPage, variant: 'sheet' })
}

/** 包的【管理】：在包弹窗里前进一页；没有弹窗时直接打开。 */
export function openManage(p: PackProps): void {
  useModalStore().push({ key: `manage:${p.set}:${p.docIdLocal ?? p.source}`, title: `管理 · ${p.name}`, component: ManagePage, props: { ...p }, variant: 'sheet' })
}

/** 书 / 冒险阅读器：弹窗里前进一页。 */
export interface ReaderPart { chapter: number | null; section: string | null; ixNamedSection?: number | null; headingIndex?: number | null; tocOpen?: boolean; scrollTop?: number }
export interface ReaderTarget { set: string; prop: string; id: string; name: string; part?: ReaderPart }

export function openReader(r: ReaderTarget): void {
  const modal = useModalStore()
  const key = `reader:${r.set}:${r.prop}:${r.id}:${modal.depth}`
  modal.push({ key, title: r.name, component: ReaderPage, header: ReaderLangSwitch, props: { ...r, readerKey: key }, variant: 'sheet' })
}

/** 阅读器换语言：把当前这一页换成另一种语言的同一本书（不增加返回层数）。 */
export function replaceReader(r: ReaderTarget): void {
  const modal = useModalStore()
  const key = `reader:${r.set}:${r.prop}:${r.id}:${Math.max(0, modal.depth - 1)}`
  modal.replace({ key, title: r.name, component: ReaderPage, header: ReaderLangSwitch, props: { ...r, readerKey: key }, variant: 'sheet' })
}

export function openBulk(): void {
  useModalStore().open({ key: 'bulk', title: '批量勾选', component: BulkPage, variant: 'sheet' })
}

/** 语言切换：把当前详情页换成另一种语言里的同一条（不增加返回层数）。 */
export function replaceEntry(ref: EntryRef, title = '', selection?: EntrySelection): void {
  const modal = useModalStore()
  const key = `${entryPageKey(ref, selection)}:page:${Math.max(0, modal.depth - 1)}`
  modal.replace({ key, title, component: EntryPage, header: EntryLangSwitch, props: { entryRef: ref, selection, pageKey: key }, variant: 'sheet' })
}
