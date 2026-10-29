import { markRaw } from 'vue'
import { useModalStore } from '../../stores/modal'
import ImportPage from './ImportPage.vue'

/** 打开导入窗口（识别、预览、安装都在这一个弹窗里换页完成）。 */
export function openImport(file: File): void {
  useModalStore().open({ key: 'import', title: '导入文件', component: markRaw(ImportPage), props: { file }, variant: 'dialog' })
}
