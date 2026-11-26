import { computed, ref } from 'vue'
import type { LibraryExportTarget } from '../../library/custom-export'
import { useAppStore } from '../../stores/app'
import { useToastStore } from '../../stores/toast'
import { downloadJson } from './mine'

export function useLibraryExport(label: string) {
  const app = useAppStore()
  const toast = useToastStore()
  const busy = ref(false)
  const menu = computed(() => ({ key: 'export', label: busy.value ? '正在准备导出…' : label, disabled: busy.value }))

  async function run(target: LibraryExportTarget, name: string): Promise<void> {
    if (busy.value) return
    busy.value = true
    const notice = toast.status(`正在准备《${name}》的导出…`)
    try {
      const file = await app.svc().backend.library.custom.exportSelection(target)
      const stem = name.trim().replace(/[<>:"/\\|?*]/g, '－').replace(/[. ]+$/g, '') || '资料'
      downloadJson(`${stem}.json`, file.body)
      if (file.incomplete) toast.info(`已导出《${name}》在本机可读取的部分，部分原文件或正文未能读取`)
      else toast.success(`已导出《${name}》`)
    } catch (e) {
      console.error('[trpg-assistant] 导出失败', e)
      toast.error(e instanceof Error ? e.message : '导出没有成功')
    } finally {
      toast.dismiss(notice)
      busy.value = false
    }
  }

  return { menu, run }
}
