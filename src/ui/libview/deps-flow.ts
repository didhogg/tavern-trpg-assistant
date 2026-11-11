// 依赖相关的界面动作（P5 T6，按作者程序做）：下载前预览、补装缺的依赖包、下载缺的官方书。
// 只调后端入口、只拼提示；依赖怎么算全在后端（pack-health / missing-refs）和作者程序里。
import { markRaw } from 'vue'
import type { Services } from '../../core/services'
import type { DownloadDependencyPreview } from '../../library/pack-health'
import { useDownloadsStore } from '../../stores/downloads'
import { askChoice } from '../kit/choice'
import DependencyPreviewPage, { type DependencyAnswer } from './DependencyPreviewPage.vue'

type Toast = { success: (m: string) => void; error: (m: string) => void }

/** 下载一本官方书（按书下载任务，进度在【库】悬浮窗）。 */
export function downloadOfficialBook(s: Services, book: { set: string; id: string; name: string }): void {
  const dl = useDownloadsStore()
  dl.rememberName(book.set, book.id, book.name)
  s.backend.library.tasks.startOfficial(book.set, { books: [book.id] })
}

/** 补装缺的自制依赖（作者 pGetSourceUrl 找网址、自动带上更深的依赖）。返回错误文字，成功为 null。 */
export async function installBrewSources(s: Services, setId: string, sources: readonly string[], label: string, toast: Toast, after?: () => Promise<void>): Promise<string | null> {
  // 交给小窗的参数必须是普通数组：Vue 响应式代理过 postMessage 会复制失败（DataCloneError）
  const plain: string[] = [...sources].map(String)
  let error: string | null = null
  await useDownloadsStore().trackBrew(`deps:${setId}:${plain.join(',')}`, label, async () => {
    let r
    try { r = await s.backend.library.service.brewInstallSources(setId, plain) } catch (e) {
      console.error('[trpg-assistant] 补装依赖失败', e)
      error = e instanceof Error ? e.message : String(e)
      return error
    }
    if (r.value.notFound.length) error = `自制仓库里找不到：${r.value.notFound.join('、')}`
    else if (!r.value.added.length) error = r.errors[0] ?? '没有装上任何包'
    // 真装上了才刷新；刷新放后台，不挡住结果提示（缺依赖时重读书架可能很慢）
    if (r.value.added.length && after) void after().catch((e: unknown) => console.error('[trpg-assistant] 装完依赖后刷新失败', e))
    if (error) return error
    toast.success(`已装好 ${r.value.added.length} 个依赖包`)
    return null
  }, () => void installBrewSources(s, setId, plain, label, toast, after))
  return error
}

/**
 * 下载自制包前：问后端这些文件依赖什么，有依赖就弹预览（可选「不再提示」）。
 * 返回 null = 用户取消；否则返回要一起下载的官方书。没有任何依赖时不弹。
 */
export async function confirmDependencies(s: Services, name: string, files: Array<{ setId: string; url: string }>, skip: boolean, saveSkip: () => Promise<void>): Promise<DependencyAnswer['books'] | null> {
  if (skip) return []
  const previews: DownloadDependencyPreview[] = []
  for (const f of files) previews.push(await s.backend.library.brewDependencyPreview(f.setId, f.url))
  if (!previews.some((p) => p.brew.length || p.official.length || p.unknown.length)) return []
  const a = await askChoice<DependencyAnswer>({ key: `deps:${name}`, title: '一起下载的依赖', component: markRaw(DependencyPreviewPage), props: (answer) => ({ name, previews, onAnswer: answer }) }, { ok: false, dontAsk: false, books: [] })
  if (!a.ok) return null
  if (a.dontAsk) await saveSkip()
  return a.books
}
