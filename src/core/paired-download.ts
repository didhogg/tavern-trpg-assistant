import { getSource, type SourceEntry } from '../library/sources'
import type { CatalogFile, CatalogPair } from '../library/brew-pairing'
import type { OfficialSetState } from '../library/db'
import type { BrewProgress } from '../library/service-brew'
import type { LibraryService } from '../library/service'

type InstallSourcesResult = Awaited<ReturnType<LibraryService['brewInstallSources']>>

/**
 * 中英一起下载（驾驶员 2026-11-12）：界面只说「下这一本 / 这本冒险 / 这个包」，后端按源登记里的 pair 找另一种语言，
 * 那边有同一本（同书号 / 冒险号 / 自制目录配上的文件）就一起下；没有、或那边已经装着，就只下这一种，原因写进 skipped。
 * 卸载那边已经按同一份登记一起删（core/removal-batch.ts withCounterparts）。新增语言只改登记，不改这里。
 */

export interface PairedTask { setId: string; taskId: string }
export interface PairedSkip { setId: string; reason: string }
export interface PairedStart { tasks: PairedTask[]; skipped: PairedSkip[] }
/** added：装上的文件数（每种语言一个）；entries：作者装上的包数（含自动带上的依赖包）。 */
export interface PairedBrewResult { added: number; entries: number; failed: Array<{ setId: string; error: unknown }>; skipped: PairedSkip[] }
export type PairedBrewProgress = (side: 'self' | 'pair', ...args: Parameters<BrewProgress>) => void

interface DirectoryLike { books: Array<{ id?: unknown; source?: unknown }>; adventures: Array<{ id?: unknown }> }
export interface PairedDownloadDeps {
  startOfficial: (setId: string, opts: { books?: string[] | null; sources?: string[] | null }) => string
  startAdventure: (setId: string, adventureId: string) => string
  officialState: (setId: string) => Promise<OfficialSetState | null>
  /** 某语言的作者书目（先用缓存，没有再联网；都取不到给 null）。 */
  directoryOf: (codeSet: string) => Promise<DirectoryLike | null>
  brewCatalog: (zhSetId: string) => Promise<{ rows: CatalogPair[] }>
  brewAddUrl: (setId: string, url: string, onProgress?: BrewProgress, signal?: AbortSignal) => Promise<{ value: unknown[] }>
  brewInstallSources: (setId: string, sources: string[], signal?: AbortSignal) => Promise<InstallSourcesResult>
  /** 某个自制源已装的包的下载网址。 */
  brewInstalledUrls: (setId: string) => Promise<Set<string>>
}

const same = (a: unknown, b: unknown): boolean => typeof a === 'string' && typeof b === 'string' && a.toLowerCase() === b.toLowerCase()
const inList = (list: readonly string[] | null | undefined, id: string): boolean => !!list?.some((x) => same(x, id))
const partnerOf = (set: SourceEntry): SourceEntry | null => (set.pair ? getSource(set.pair) : null)

export class PairedDownloads {
  constructor(private readonly deps: PairedDownloadDeps) {}

  /** 官方书：这一种照常下；另一种语言按同书号配（那边书目里没有的书号不下，已装的不重下）。books 为 null = 整套。 */
  async official(setId: string, sel: { books: string[] | null; sources?: string[] | null }): Promise<PairedStart> {
    const out: PairedStart = { tasks: [{ setId, taskId: this.deps.startOfficial(setId, { books: sel.books, sources: sel.sources ?? null }) }], skipped: [] }
    const pair = partnerOf(getSource(setId))
    if (!pair) return out
    const state = await this.deps.officialState(pair.id)
    const installed = state?.status === 'installed'
    if (sel.books === null) {
      if (installed && state.books === null) out.skipped.push({ setId: pair.id, reason: '另一种语言的整套已经装着' })
      else out.tasks.push({ setId: pair.id, taskId: this.deps.startOfficial(pair.id, { books: null, sources: null }) })
      return out
    }
    const dir = await this.deps.directoryOf(pair.codeSet)
    const has = (id: string): boolean => !dir || dir.books.some((b) => same(b.id, id))
    const done = (id: string): boolean => installed && (state.books === null || inList(state.books, id))
    // 用那边书目里的写法（大小写可能不同）；书目取不到时按同编号
    const theirs = (id: string): string => (dir?.books.map((b) => b.id).find((x): x is string => same(x, id)) ?? id)
    const books = sel.books.filter((id) => has(id) && !done(id)).map(theirs)
    const dropped = sel.books.filter((id) => !books.some((b) => same(b, id)))
    // 没有书号的来源行（只给来源）照样配过去；随丢掉的书一起的来源不带
    const sources = (sel.sources ?? []).filter((s) => !dropped.some((id) => same(id, s)) && !(installed && inList(state.sources as string[] | null | undefined, s)))
    const sourceOnly = !sel.books.length
    if (!books.length && !(sourceOnly && sources.length)) {
      out.skipped.push({ setId: pair.id, reason: sel.books.some((id) => !has(id)) ? '另一种语言的书目里没有这本' : '另一种语言的已经装着' })
      return out
    }
    out.tasks.push({ setId: pair.id, taskId: this.deps.startOfficial(pair.id, { books, sources: sources.length ? sources : null }) })
    return out
  }

  /** 冒险正文：这一种照常下；另一种语言的官方资料装着、书目里有同一个冒险号、还没下过，才一起下。 */
  async adventure(setId: string, adventureId: string): Promise<PairedStart> {
    const out: PairedStart = { tasks: [{ setId, taskId: this.deps.startAdventure(setId, adventureId) }], skipped: [] }
    const pair = partnerOf(getSource(setId))
    if (!pair) return out
    const state = await this.deps.officialState(pair.id)
    if (state?.status !== 'installed') { out.skipped.push({ setId: pair.id, reason: '另一种语言的官方资料还没装' }); return out }
    if (inList(state.adventures, adventureId)) { out.skipped.push({ setId: pair.id, reason: '另一种语言的已经下过' }); return out }
    const dir = await this.deps.directoryOf(pair.codeSet)
    const id = dir ? dir.adventures.map((a) => a.id).find((x): x is string => same(x, adventureId)) : adventureId
    if (!id) { out.skipped.push({ setId: pair.id, reason: '另一种语言的冒险书目里没有这本' }); return out }
    out.tasks.push({ setId: pair.id, taskId: this.deps.startAdventure(pair.id, id) })
    return out
  }

  /** 自制包（按目录里的文件网址）：这一种装完，再按中英目录配对装另一种语言的那个文件。两边各自成败，都写回。 */
  async brewUrl(setId: string, url: string, onProgress?: PairedBrewProgress, signal?: AbortSignal): Promise<PairedBrewResult> {
    const out: PairedBrewResult = { added: 0, entries: 0, failed: [], skipped: [] }
    await this.run(out, setId, () => this.deps.brewAddUrl(setId, url, (...a) => onProgress?.('self', ...a), signal))
    signal?.throwIfAborted()
    const pair = await this.partnerFiles(setId, (mine) => mine.urlDownload === url, out)
    for (const p of pair) {
      signal?.throwIfAborted()
      await this.run(out, p.setId, () => this.deps.brewAddUrl(p.setId, p.file.urlDownload, (...a) => onProgress?.('pair', ...a), signal))
    }
    signal?.throwIfAborted()
    return out
  }

  /** 自制依赖（按来源名补装）：这一种装完，再把目录里提供这些来源的文件的另一种语言版本装上。 */
  async brewSources(setId: string, sources: string[], signal?: AbortSignal): Promise<PairedBrewResult & { result: InstallSourcesResult }> {
    const out: PairedBrewResult = { added: 0, entries: 0, failed: [], skipped: [] }
    const result = await this.deps.brewInstallSources(setId, sources, signal)
    signal?.throwIfAborted()
    out.added++
    const pair = await this.partnerFiles(setId, (mine) => (Array.isArray(mine.sources) ? mine.sources : []).some((s) => sources.some((x) => same(x, s))), out)
    for (const p of pair) {
      signal?.throwIfAborted()
      await this.run(out, p.setId, () => this.deps.brewAddUrl(p.setId, p.file.urlDownload, undefined, signal))
    }
    signal?.throwIfAborted()
    return { ...out, result }
  }

  private async run(out: PairedBrewResult, setId: string, fn: () => Promise<{ value: unknown[] }>): Promise<void> {
    try { out.entries += (await fn()).value.length; out.added++ } catch (error) { out.failed.push({ setId, error }) }
  }

  /** 目录里和「这一种」配上的另一种语言文件（没装过的）。目录取不到 / 没配上 → skipped 写原因。 */
  private async partnerFiles(setId: string, match: (mine: CatalogFile) => boolean, out: PairedBrewResult): Promise<Array<{ setId: string; file: CatalogFile }>> {
    const set = getSource(setId)
    const pair = partnerOf(set)
    if (!pair) return []
    const mine = set.lang === 'zh' ? 'zh' : 'en'
    const other = mine === 'zh' ? 'en' : 'zh'
    let rows: CatalogPair[]
    try { rows = (await this.deps.brewCatalog(mine === 'zh' ? set.id : pair.id)).rows } catch (e) {
      out.skipped.push({ setId: pair.id, reason: `另一种语言的自制目录取不到：${e instanceof Error ? e.message : String(e)}` })
      return []
    }
    const installed = await this.deps.brewInstalledUrls(pair.id)
    const files = rows.filter((r) => r[mine] && match(r[mine]!) && r[other]).map((r) => r[other]!)
    const todo = files.filter((f) => !installed.has(f.urlDownload))
    if (!files.length) out.skipped.push({ setId: pair.id, reason: '另一种语言没有配上的包' })
    else if (!todo.length) out.skipped.push({ setId: pair.id, reason: '另一种语言的已经装着' })
    return todo.map((file) => ({ setId: pair.id, file }))
  }
}
