import { markRaw } from 'vue'
import { useModalStore } from '../../stores/modal'
import type { ImportResult } from '../../core/transfer/importer'
import ImportPage from './ImportPage.vue'
import ImportResultPage from './ImportResultPage.vue'

/** 打开导入窗口（识别、预览、安装都在这一个弹窗里换页完成）。 */
export function openImport(file: File): void {
  useModalStore().open({ key: 'import', title: '导入文件', component: markRaw(ImportPage), props: { file }, variant: 'dialog' })
}

/** 导入完成后换成结果页（同一个弹窗）。 */
export function openImportResult(result: ImportResult): void {
  useModalStore().open({ key: 'import-result', title: '导入结果', component: markRaw(ImportResultPage), props: { result }, variant: 'dialog' })
}
