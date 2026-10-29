import { markRaw } from 'vue'
import { useLibraryStore } from '../../stores/library'
import { useModalStore, type ModalPage } from '../../stores/modal'
import EntryDetailPage from './EntryDetailPage.vue'
import PackDetailHeader from './PackDetailHeader.vue'
import PackDetailPage from './PackDetailPage.vue'
import { findRow } from './rows'

/** 包详情：没有弹窗时打开一个；已在某个弹窗内时，在同一个弹窗里换到这一页。 */
export function openPackDetail(packId: string): void {
  const library = useLibraryStore()
  const modal = useModalStore()
  const row = findRow(packId, library.installed, library.catalog)
  const page: ModalPage = { key: `pack:${packId}`, title: row?.name ?? packId, component: markRaw(PackDetailPage), header: markRaw(PackDetailHeader), props: { packId }, variant: 'dialog' }
  if (modal.isOpen) modal.push(page)
  else modal.open(page)
}

/** 条目详情：在当前弹窗里换到这一页（没有弹窗时打开一个）。 */
export function openEntry(packId: string, entryId: string, name: string): void {
  const modal = useModalStore()
  const page: ModalPage = { key: `entry:${packId}/${entryId}`, title: name, component: markRaw(EntryDetailPage), props: { packId, entryId }, variant: 'dialog' }
  if (modal.isOpen) modal.push(page)
  else modal.open(page)
}
