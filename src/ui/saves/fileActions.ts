import { markRaw } from 'vue'
import { useModalStore } from '../../stores/modal'
import { openImport } from '../imports/openImport'
import ExportPage from './ExportPage.vue'

/** 导出窗口：抽屉先关闭，再打开导出窗口（范围预选该存档）。 */
export function openExport(saveId?: string): void {
  useModalStore().open({ key: 'export', title: '导出', component: markRaw(ExportPage), props: { saveId }, variant: 'dialog' })
}

export async function openImportPicker(file: File): Promise<void> {
  openImport(file)
}
