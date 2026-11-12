// 已装资料占多少空间（P5-5 §12 B2）：多选卸载时显示「约多少 MB」。
// 文件归属用作者目录（书目 / 冒险目录 / 来源索引，directory.owners）——和下载估算同一份；大小取本机缓存的文件清单，不联网。
// 一本书只算它独占的文件：书正文、只属于它的来源文件；和别的书共用的文件（共用文件、职业文件、多来源文件）不算，卸了也腾不出来。
// 目标先补上另一种语言（和执行时同一套规则），中英两份一起算。自制包按它在作者存储里的大小算。
import type { BrewPairs } from '../library/brew-pairing'
import type { BookDirectory } from '../library/directory'
import type { FileProvider } from '../library/files'
import type { LibraryView } from '../library/revision'
import { getSource } from '../library/sources'
import type { RemovalTarget } from './removal-impact'
import { withCounterparts } from './removal-batch'

const BREW_STORAGE_KEY = 'HOMEBREW_2_STORAGE'

export interface RemovalSizes {
  /** 每个输入目标（含它另一种语言的那份）的字节；算不出（没有文件清单 / 书目缓存）为 null。 */
  each: Array<number | null>
  /** 全部目标合在一起（共用文件只算一次）。 */
  total: number | null
}

interface Deps { files: FileProvider; directory: BookDirectory; brewPairs: Pick<BrewPairs, 'installed'> }

async function bytesOf(deps: Deps, view: LibraryView, targets: RemovalTarget[]): Promise<number | null> {
  let total = 0
  for (const t of await withCounterparts(view, deps.brewPairs, targets)) {
    const set = getSource(t.setId)
    if (t.kind === 'brew') {
      const docs = ((await view.kvGet(set.codeSet, BREW_STORAGE_KEY)) ?? []) as Array<{ head?: { docIdLocal?: string }; body?: unknown }>
      for (const d of docs) if (d.head?.docIdLocal && t.docIdLocals.includes(d.head.docIdLocal)) total += JSON.stringify(d.body ?? null).length
      continue
    }
    const list = await deps.files.cachedFileList(set, view)
    const rec = await deps.directory.peek(set.codeSet)
    if (!list || !rec) return null
    const books = new Set(t.bookIds ?? [])
    const adventures = new Set(t.adventureIds ?? [])
    const whole = !books.size && !adventures.size
    const sources = new Set([...(t.bookSources ?? []), ...rec.books.filter((b) => books.has(String(b.id))).map((b) => String(b.source))].map((s) => s.toLowerCase()))
    for (const [path, file] of Object.entries(list)) {
      const owner = rec.owners[path]
      if (whole) { total += file.size; continue }
      if (!owner) continue
      if ((owner.kind === 'book' && books.has(owner.id)) || (owner.kind === 'adventure' && adventures.has(owner.id))) total += file.size
      else if (owner.kind === 'source' && owner.sources.length && owner.sources.every((s) => sources.has(s.toLowerCase()))) total += file.size
    }
  }
  return total
}

export async function removalSizes(deps: Deps, view: LibraryView, targets: RemovalTarget[]): Promise<RemovalSizes> {
  const each: Array<number | null> = []
  for (const t of targets) each.push(await bytesOf(deps, view, [t]))
  return { each, total: await bytesOf(deps, view, targets) }
}
