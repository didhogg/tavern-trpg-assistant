// 下载大小预估（P4 补后端 B2；P5 T2 改成按书计划）。规则不是我们定的：用作者离线设计的现成两条
// （plan.ts：预载 = 除冒险外全部数据 + 搜索索引；按需 = 冒险正文按本取），从 GitHub 锁定版本文件清单直接算字节数。
// 按书安装时用作者目录/index 的“来源 → 文件”映射筛；预估与真正下载共用同一份官方计划。
// 新增传输字节 = 计划里本地没有 / 指纹不对的字节，不用“整套未 installed”反推全量大小。
import type { LibraryDatabase } from './db'
import type { BookDirectory, DirectoryRecord } from './directory'
import type { FileProvider } from './files'
import type { FileList } from './fetcher'
import { parsedKey } from './install'
import { adventurePlan, officialPlan, precachePlan, type OfficialPlan } from './plan'
import type { LibraryRevisionStore, LibraryView } from './revision'
import { getSource } from './sources'

export interface EstimateInput {
  /** 要装的官方数据集（源登记表编号，如 cn-official、en-official）。 */
  sets: string[]
  /** 每个数据集选中的来源（书）；不填 = 全部。 */
  sources?: Record<string, string[]>
  /** 每个数据集选中的书正文编号；不填 = 全部。 */
  books?: Record<string, string[]>
  /** 选了的冒险（书目里 kind = adventure 的行的 set + id）。 */
  adventures?: Array<{ set: string; id: string }>
}

export interface DownloadEstimate {
  data: { bytes: number | null; sets: Array<{ setId: string; installed: boolean; bytes: number | null; totalBytes: number | null; sharedBytes: number | null; reusedBytes: number | null }> }
  adventures: { bytes: number | null; items: Array<{ set: string; id: string; downloaded: boolean; bytes: number | null; totalBytes: number | null }> }
  /** 资料 + 冒险；任何一部分还没算出来就是 null。 */
  totalBytes: number | null
  /** 有文件清单 / 书目还没取到（network = false 时的正常状态）。 */
  computing: boolean
  /** 联网取文件清单 / 书目失败的原因。 */
  errors: string[]
}

export interface EstimateOptions { network?: boolean }

const msg = (e: unknown): string => (e instanceof Error ? e.message : String(e))
const sum = (xs: Array<number | null>): number | null => (xs.some((x) => x === null) ? null : xs.reduce((n: number, x) => n + (x as number), 0))

export class DownloadEstimator {
  constructor(private readonly deps: { db: LibraryDatabase; files: FileProvider; directory: BookDirectory; revisions: LibraryRevisionStore }) {}

  private async listOf(setId: string, network: boolean, errors: string[], view: LibraryView): Promise<FileList | null> {
    const source = getSource(setId)
    const cached = await this.deps.files.cachedFileList(source, view)
    if (cached || !network) return cached
    try { return await this.deps.files.fileList(source, view) } catch (e) { errors.push(`文件清单（${setId}）取不到：${msg(e)}`); return null }
  }

  private async missingBytes(view: LibraryView, setId: string, list: FileList, files: string[]): Promise<number> {
    const source = getSource(setId)
    let bytes = 0
    for (const path of files) {
      const expected = list[path]
      if (!expected) continue
      const local = await view.fileSha(source, path)
      if (local !== expected.sha) bytes += expected.size
    }
    return bytes
  }

  async estimate(input: EstimateInput, { network = true }: EstimateOptions = {}): Promise<DownloadEstimate> {
    const errors: string[] = []
    const view = await this.deps.revisions.published()
    const sets: DownloadEstimate['data']['sets'] = []
    for (const setId of [...new Set(input.sets)]) {
      const state = await view.officialState(setId)
      const needBooks = input.books?.[setId] ?? null
      const needSources = input.sources?.[setId] ?? null
      const installed = state?.status === 'installed'
        && (!needBooks || state.books === null || needBooks.every((b) => state.books!.includes(b)))
        && (!needSources || state.sources === null || needSources.every((s) => state.sources!.some((x) => x.toLowerCase() === s.toLowerCase())))
      const list = await this.listOf(setId, network, errors, view)
      if (!list) { sets.push({ setId, installed, bytes: null, totalBytes: null, sharedBytes: null, reusedBytes: null }); continue }
      const rec = network ? await this.deps.directory.get(getSource(setId).codeSet) : await this.deps.directory.peek(getSource(setId).codeSet)
      const picked = !!(needBooks || needSources)
      // 选了具体书 / 来源却拿不到作者书目：只能说"算不出"，不能拿整套大小冒充这几本（P5 T6 G5）
      if (picked && (!rec || rec.errors.books)) {
        if (rec?.errors.books) errors.push(rec.errors.books)
        sets.push({ setId, installed, bytes: installed ? 0 : null, totalBytes: null, sharedBytes: null, reusedBytes: null })
        continue
      }
      const plan = rec
        ? officialPlan(list, rec.owners, { sources: needSources, books: needBooks }, { indexSources: rec.indexSources, codeSet: getSource(setId).codeSet })
        : precachePlan(list)
      if (installed) { sets.push({ setId, installed, bytes: 0, totalBytes: plan.bytes, sharedBytes: 0, reusedBytes: plan.bytes }); continue }
      const missing = await this.missingBytes(view, setId, list, plan.files)
      const shared = (plan as OfficialPlan).shared?.bytes ?? 0
      sets.push({ setId, installed, bytes: missing, totalBytes: plan.bytes, sharedBytes: shared, reusedBytes: Math.max(0, plan.bytes - missing) })
    }

    const items: DownloadEstimate['adventures']['items'] = []
    for (const pick of input.adventures ?? []) {
      const source = getSource(pick.set)
      const rec: DirectoryRecord | null = network ? await this.deps.directory.get(source.codeSet) : await this.deps.directory.peek(source.codeSet)
      const file = rec?.adventureFiles[pick.id]
      if (!rec || !file) {
        if (rec?.errors.adventures) errors.push(rec.errors.adventures)
        items.push({ set: pick.set, id: pick.id, downloaded: false, bytes: null, totalBytes: null })
        continue
      }
      const downloaded = !!(await view.derivedGet(parsedKey(pick.set, rec.adventureProp, pick.id)))
      if (downloaded) { items.push({ set: pick.set, id: pick.id, downloaded, bytes: 0, totalBytes: 0 }); continue }
      const list = await this.listOf(pick.set, network, errors, view)
      if (!list) { items.push({ set: pick.set, id: pick.id, downloaded, bytes: null, totalBytes: null }); continue }
      const plan = adventurePlan(list, file.split('/').at(-1) as string)
      items.push({ set: pick.set, id: pick.id, downloaded, bytes: await this.missingBytes(view, pick.set, list, plan.files), totalBytes: plan.bytes })
    }

    const data = { bytes: sum(sets.map((x) => x.bytes)), sets }
    const adventures = { bytes: sum(items.map((x) => x.bytes)), items }
    const totalBytes = data.bytes === null || adventures.bytes === null ? null : data.bytes + adventures.bytes
    return { data, adventures, totalBytes, computing: totalBytes === null && errors.length === 0, errors: [...new Set(errors)] }
  }
}
