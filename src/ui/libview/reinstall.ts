// 缺数据时「重新下载这个包」（驾驶员 2026-11-12，P5-5 §11.2）：找出这条数据所属的书 / 冒险 / 自制包，
// 走现有下载入口重装（官方：按书 / 按冒险下载任务；自制：作者按网址重新加入，同一个包会被替换），恢复原状。
// 只找归属、只调现有入口；不新增后端。
import type { Services } from '../../core/services'
import type { CatalogRow } from '../../library/scoped'
import { getSource } from '../../library/sources'
import { useDownloadsStore } from '../../stores/downloads'
import { useLibViewStore } from '../../stores/libview'
import { useModalStore } from '../../stores/modal'

const rows = (): CatalogRow[] => (useLibViewStore().shelf?.groups ?? []).flatMap((g) => [...g.books, ...g.adventures])

/** 自制包：按真实包编号找。 */
export function ownerByPack(docIdLocal: string): CatalogRow | null {
  return rows().find((r) => r.pack?.docIdLocal === docIdLocal) ?? null
}

/** 书 / 冒险阅读器：官方按书号，自制按包里带的正文。 */
export function ownerByCorpus(set: string, prop: string, id: string): CatalogRow | null {
  return rows().find((r) => r.set === set && (r.id === id || !!r.corpora?.some((c) => c.prop === prop && c.id === id))) ?? null
}

/** 从包列表直接点进来的页（栈底是包页、这一页紧挨着它）：归这个包。经链接再往里走的页不算（可能是别的书）。 */
export function ownerFromOpenPack(pageKey: string | undefined): CatalogRow | null {
  const [bottom, next] = useModalStore().stack
  if (!bottom?.key.startsWith('pack:') || !pageKey || next?.key !== pageKey) return null
  const p = bottom.props as { set?: string; source?: string; docIdLocal?: string } | undefined
  if (!p?.set) return null
  if (p.docIdLocal) return ownerByPack(p.docIdLocal)
  return rows().find((r) => r.set === p.set && r.source === p.source) ?? null
}

const isUrl = (s: string | null | undefined): s is string => !!s && /^https?:\/\//i.test(s)

/**
 * 重新下载（或第一次下载）这本书 / 冒险 / 自制包。error：错误文字；taskId：官方后台任务编号（按它看结果）。
 * after：自制包装完后调用。
 */
export async function reinstall(s: Services, r: CatalogRow, after?: () => void): Promise<{ error: string | null; taskId?: string }> {
  if (!navigator.onLine) return { error: '现在没有网络，连上后再试' }
  const dl = useDownloadsStore()
  if (getSource(r.set).kind === 'official') {
    if (!r.id) return { error: '这一项不是单独的一本书，只能在【下载】页整套重新下载' }
    // 中英一起（后端按登记配另一种语言）；按这一种的任务看结果
    const d = s.backend.library.downloads
    const started = r.kind === 'adventure' ? await d.adventure(r.set, r.id) : await d.official(r.set, { books: [r.id] })
    for (const t of started.tasks) dl.rememberName(t.setId, r.id, r.name)
    dl.refresh()
    return { error: null, taskId: started.tasks[0].taskId }
  }
  const url = r.pack?.stableId
  if (!isUrl(url)) return { error: '这个包是从本地文件导入的，没有下载地址；请到【我的库】重新导入原文件' }
  let error: string | null = null
  await dl.trackBrew(`reinstall:${url}`, `自制包《${r.name}》`, async (report) => {
    const STAGE = { download: '下载文件（含依赖）', parse: '整理资料', publish: '放进书架' } as const
    // 中英一起：另一种语言配上的包也重下；两边都没装上才算失败
    const r2 = await s.backend.library.downloads.brewUrl(r.set, url, (side, st, i, n) => report(`${side === 'pair' ? '另一种语言 · ' : ''}${STAGE[st]}`, i / n))
    const self = r2.failed.find((f) => f.setId === r.set)
    if (self) {
      console.error('[trpg-assistant] 重新下载自制包失败', self.error)
      error = self.error instanceof Error ? self.error.message : String(self.error)
      return error
    }
    for (const f of r2.failed) console.warn('[trpg-assistant] 另一种语言的包没装上', f.setId, f.error)
    await useLibViewStore().refresh(s)
    return null
  }, () => void reinstall(s, r, after))
  if (!error) after?.()
  return { error }
}
