// 导入自制文件：读文件 → 按文件语言分开（C4，后端认语言）→ 预览（会顶掉哪个包，u7-5）→ 确认后真正导入。
// 设置里"导入总是不预览"开着就跳过预览（顶掉已有的包时仍然要问）。
import { markRaw } from 'vue'
import type { Services } from '../../core/services'
import { askChoice } from '../kit/choice'
import { reportLibError } from './deps-flow'
import ImportPreviewPage from './ImportPreviewPage.vue'

type Toast = { success: (m: string) => void; error: (m: string) => void }

export async function importFiles(s: Services, _codeSet: string, files: File[], skipPreview: boolean, toast: Toast): Promise<boolean> {
  const bi = s.backend.library.bilingual
  try {
    const texts = await Promise.all(files.map(async (f) => ({ name: f.name, text: await f.text() })))
    const groups = await bi.previewImport(texts)
    const replacing = groups.some((g) => g.preview.replaces.length)
    if (!skipPreview || replacing) {
      const ok = await askChoice<boolean>({ key: 'confirm:import', title: '导入预览', component: markRaw(ImportPreviewPage), props: (answer) => ({ groups, onAnswer: answer }) }, false)
      if (!ok) return false
    }
    const results = await bi.importFiles(texts)
    const failed = results.filter((r) => !r.result.ok)
    if (failed.length) { await reportLibError(s, new Error(`作者程序报错：${String(failed[0].result.errors[0])}`), '导入文件', toast); return false }
    const rejected = results.flatMap((r) => r.result.rejected ?? [])
    if (rejected.length) toast.error(`没有导入：${rejected.map((x) => `${x.name}（${x.reason}）`).join('；')}`)
    toast.success(`已导入 ${files.length - rejected.length} 个文件`)
    return true
  } catch (e) {
    await reportLibError(s, e, '导入文件', toast, () => void importFiles(s, _codeSet, files, true, toast))
    return false
  }
}
