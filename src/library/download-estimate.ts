// 下载大小预估（P4 补后端 B2）。规则不是我们定的：用作者离线设计的现成两条（plan.ts：预载 = 除冒险外全部数据 + 搜索索引；
// 按需 = 冒险正文按本取），从 GitHub 锁定版本文件清单直接算字节数，不另写分类。与真正下载走同一份计划，所以预估和实际对得上。
//   资料 = 要装的各套官方数据集（所选语言 + 结算内核要的英文）里还没装好的，每套的预载字节数
//   冒险 = 所选冒险里还没下载的，每本的正文文件字节数（文件路径由作者加载器给，书目步骤已缓存）
// network = false 只用已缓存的文件清单，没有的返回 null（界面写"正在计算下载文件大小"）；network = true 会联网取一次清单。
import type { LibraryDatabase } from './db'
import type { BookDirectory } from './directory'
import type { FileProvider } from './files'
import type { FileList } from './fetcher'
import { parsedKey } from './install'
import { adventurePlan, precachePlan } from './plan'
import { getSource } from './sources'

export interface EstimateInput {
  /** 要装的官方数据集（源登记表编号，如 cn-official、en-official）。 */
  sets: string[]
  /** 选了的冒险（书目里 kind = adventure 的行的 set + id）。 */
  adventures?: Array<{ set: string; id: string }>
}

export interface DownloadEstimate {
  data: { bytes: number | null; sets: Array<{ setId: string; installed: boolean; bytes: number | null }> }
  adventures: { bytes: number | null; items: Array<{ set: string; id: string; downloaded: boolean; bytes: number | null }> }
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
  constructor(private readonly deps: { db: LibraryDatabase; files: FileProvider; directory: BookDirectory }) {}

  private async listOf(setId: string, network: boolean, errors: string[]): Promise<FileList | null> {
    const source = getSource(setId)
    const cached = await this.deps.files.cachedFileList(source)
    if (cached || !network) return cached
    try { return await this.deps.files.fileList(source) } catch (e) { errors.push(`文件清单（${setId}）取不到：${msg(e)}`); return null }
  }

  async estimate(input: EstimateInput, { network = true }: EstimateOptions = {}): Promise<DownloadEstimate> {
    const errors: string[] = []
    const sets: DownloadEstimate['data']['sets'] = []
    for (const setId of [...new Set(input.sets)]) {
      const installed = (await this.deps.db.sets.get(setId))?.status === 'installed'
      if (installed) { sets.push({ setId, installed, bytes: 0 }); continue }
      const list = await this.listOf(setId, network, errors)
      sets.push({ setId, installed, bytes: list ? precachePlan(list).bytes : null })
    }

    const items: DownloadEstimate['adventures']['items'] = []
    for (const pick of input.adventures ?? []) {
      const source = getSource(pick.set)
      const rec = network ? await this.deps.directory.get(source.codeSet) : await this.deps.directory.peek(source.codeSet)
      const file = rec?.adventureFiles[pick.id]
      if (!rec || !file) {
        if (rec?.errors.adventures) errors.push(rec.errors.adventures)
        items.push({ set: pick.set, id: pick.id, downloaded: false, bytes: null })
        continue
      }
      const downloaded = !!(await this.deps.db.derived.get(parsedKey(pick.set, rec.adventureProp, pick.id)))
      if (downloaded) { items.push({ set: pick.set, id: pick.id, downloaded, bytes: 0 }); continue }
      const list = await this.listOf(pick.set, network, errors)
      items.push({ set: pick.set, id: pick.id, downloaded, bytes: list ? adventurePlan(list, file.split('/').at(-1) as string).bytes : null })
    }

    const data = { bytes: sum(sets.map((x) => x.bytes)), sets }
    const adventures = { bytes: sum(items.map((x) => x.bytes)), items }
    const totalBytes = data.bytes === null || adventures.bytes === null ? null : data.bytes + adventures.bytes
    return { data, adventures, totalBytes, computing: totalBytes === null && errors.length === 0, errors: [...new Set(errors)] }
  }
}
