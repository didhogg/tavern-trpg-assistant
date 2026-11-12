// 导入自制文件：读文件 → 预览（后端在隔离的作者存储里试装）→ 确认后真正导入。设置里"导入总是不预览"开着就跳过预览。
import type { Services } from '../../core/services'
import { SOURCES } from '../../library/sources'
import { askConfirm } from '../kit/confirm'
import { reportLibError } from './deps-flow'

type Toast = { success: (m: string) => void; error: (m: string) => void }

export async function importFiles(s: Services, codeSet: string, files: File[], skipPreview: boolean, toast: Toast): Promise<boolean> {
  const lib = s.backend.library
  try {
    const texts = await Promise.all(files.map(async (f) => ({ name: f.name, text: await f.text() })))
    const setId = SOURCES.find((x) => x.kind === 'brew' && x.codeSet === codeSet)?.id
    if (!setId) throw new Error(`没有登记自制数据集：${codeSet}`)
    if (!skipPreview) {
      const pre = await lib.custom.previewImport(codeSet, texts)
      const bad = pre.structure.filter((x) => !x.ok)
      const lines = [
        ...pre.files.map((f) => `${f.filename ?? '文件'}：${f.entries} 条`),
        `新增 ${pre.newEntries} 条` + (pre.alternatives.length ? `；与已有条目同编号 ${pre.alternatives.length} 条（在列表里分行显示，原件照常生效）` : ''),
        ...(pre.notJson.length ? [`不是 JSON，已跳过：${pre.notJson.join('、')}`] : []),
        ...pre.rejected.map((x) => `不会导入 ${x.name}：${x.reason}`),
        ...bad.map((x) => `${x.name} 的结构检查有 ${x.issues.length} 处提示（${x.issues[0]?.text ?? ''}）`),
        ...pre.authorErrors.slice(0, 3).map((e) => `作者程序报错：${String(e)}`),
      ]
      const ok = await askConfirm({ title: '导入预览', message: bad.length ? '结构检查有提示，仍可以导入（只提示，不替你改数据）。' : '检查通过，可以导入。', details: lines, confirmLabel: '确认导入' })
      if (!ok) return false
    }
    const r = await lib.service.brewImport(setId, texts)
    if (!r.ok) { await reportLibError(s, new Error(`作者程序报错：${String(r.errors[0])}`), '导入文件', toast); return false }
    const rejected = r.rejected ?? []
    if (rejected.length) toast.error(`没有导入：${rejected.map((x) => `${x.name}（${x.reason}）`).join('；')}`)
    toast.success(`已导入 ${files.length - rejected.length} 个文件`)
    return true
  } catch (e) {
    await reportLibError(s, e, '导入文件', toast, () => void importFiles(s, codeSet, files, true, toast))
    return false
  }
}
