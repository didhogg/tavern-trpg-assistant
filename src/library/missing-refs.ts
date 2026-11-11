// 缺的条目 → 该补哪本书 / 哪个包（P5 T6 后4，读档补包与条目详情「缺依赖」共用）。
//   官方：编号 → 来源（hash-source，实测中文官方 32,278 条全对）→ 作者书目里的书 / 冒险 → 按书下载
//   自制：哪个已装包的原始编号里有它 → 那个包缺的依赖（包体检）→ 一键补装依赖（作者自动带上更深的依赖）
//         没有包含它的包（包本身没装）→ 编号末尾的来源交给作者自制仓库去找（作者 pGetSourceUrl；找不到会如实失败）
// 只读本地，不联网。
import type { BrewPacks } from './brew-packs'
import type { BookDirectory } from './directory'
import { sourceFromHash } from './hash-source'
import { installedOfficialSources } from './installed-sources'
import { packHealth } from './pack-health'
import type { LibraryRevisionStore } from './revision'
import { SOURCES, getSource } from './sources'

export interface DownloadSuggestion {
  set: string
  kind: 'official' | 'brew'
  /** official：要下的书 / 冒险；推不出来是 null（只能整套）。 */
  book?: { id: string; name: string; source: string; kind: 'book' | 'adventure' } | null
  /** brew：要补装的来源（交给 service.brewInstallSources）。 */
  sources?: string[]
  /** brew：条目所在、但缺依赖的包（补上依赖就恢复）；为 null 时是包本身没装。 */
  via?: string | null
  refs: number
  labels: string[]
}

const safeDecode = (x: string): string => { try { return decodeURIComponent(x) } catch { return x } }

export interface MissingRef { set: string; prop: string; hash: string; label?: string }

/** suggestions：该补的书 / 包；unresolved：包还在、也不缺依赖，但条目就是没了（上游删了 / 改了编号），补装也回不来。 */
export async function suggestDownloads(deps: { brewPacks: BrewPacks; directory: BookDirectory; revisions: LibraryRevisionStore }, refs: MissingRef[]): Promise<{ suggestions: DownloadSuggestion[]; unresolved: MissingRef[] }> {
  const view = await deps.revisions.published()
  const out = new Map<string, DownloadSuggestion>()
  const unresolved: MissingRef[] = []
  const add = (key: string, base: Omit<DownloadSuggestion, 'refs' | 'labels'>, label?: string): void => {
    const hit = out.get(key) ?? { ...base, refs: 0, labels: [] }
    hit.refs++
    if (label && hit.labels.length < 5 && !hit.labels.includes(label)) hit.labels.push(label)
    out.set(key, hit)
  }
  const known = new Map<string, Map<string, string>>()
  const books = new Map<string, Map<string, NonNullable<DownloadSuggestion['book']>>>()
  const installed = new Map<string, Set<string>>()
  const officialOf = async (setId: string): Promise<void> => {
    if (known.has(setId)) return
    const rec = await deps.directory.peek(getSource(setId).codeSet)
    const k = new Map<string, string>()
    for (const s of [...Object.keys(rec?.sources ?? {}), ...await installedOfficialSources(view, setId)]) k.set(s.toLowerCase(), s)
    const b = new Map<string, NonNullable<DownloadSuggestion['book']>>()
    for (const [kind, list] of [['book', rec?.books ?? []], ['adventure', rec?.adventures ?? []]] as const) {
      for (const it of list as Array<{ id?: unknown; source?: unknown; name?: unknown }>) {
        if (typeof it.source === 'string' && it.id) { b.set(it.source.toLowerCase(), { id: String(it.id), name: String(it.name ?? it.source), source: it.source, kind }); k.set(it.source.toLowerCase(), it.source) }
      }
    }
    known.set(setId, k)
    installed.set(setId, new Set((await installedOfficialSources(view, setId)).map((x) => x.toLowerCase())))
    books.set(setId, b)
  }
  for (const ref of refs) {
    const set = SOURCES.find((s) => s.id === ref.set)
    if (!set) continue
    if (set.kind === 'official') {
      await officialOf(set.id)
      const src = sourceFromHash(ref.hash, known.get(set.id)!)
      const book = src ? books.get(set.id)!.get(src.toLowerCase()) ?? null : null
      // 这本书已经装着、条目却没有：上游删了 / 改了编号，下载补不回来
      if (src && installed.get(set.id)!.has(src.toLowerCase())) { unresolved.push(ref); continue }
      add(`o|${set.id}|${book?.id ?? '?'}`, { set: set.id, kind: 'official', book }, ref.label)
      continue
    }
    const packs = await deps.brewPacks.list(set.id, view)
    const owner = packs.find((p) => (p.hashes[ref.prop] ?? []).includes(ref.hash))
    if (owner) {
      const [health] = await packHealth(deps, set.id, owner.docIdLocal)
      const missing = health?.missing ?? []
      if (!missing.length) { unresolved.push(ref); continue }
      for (const m of missing.filter((x) => x.kind === 'official')) {
        const officialSet = m.book?.set ?? SOURCES.find((x) => x.kind === 'official' && x.codeSet === set.codeSet)?.id ?? set.id
        add(`o|${officialSet}|${m.book?.id ?? '?'}`, { set: officialSet, kind: 'official', book: m.book ? { id: m.book.id, name: m.book.name, source: m.source, kind: 'book' } : null }, ref.label)
      }
      const brewSources = missing.filter((x) => x.kind === 'brew').map((x) => x.source)
      if (brewSources.length) {
        add(`b|${set.id}|${owner.docIdLocal}`, { set: set.id, kind: 'brew', sources: [], via: owner.filename ?? owner.docIdLocal }, ref.label)
        const hit = out.get(`b|${set.id}|${owner.docIdLocal}`)!
        hit.sources = [...new Set([...(hit.sources ?? []), ...brewSources])]
      }
      continue
    }
    const tokens = ref.hash.split(/[_,~:=]/).filter(Boolean)
    const last = tokens.length > 1 ? tokens[tokens.length - 1] : null
    const src = last ? safeDecode(last) : null
    add(`b|${set.id}|src:${src ?? '?'}`, { set: set.id, kind: 'brew', sources: src ? [src] : [], via: null }, ref.label)
  }
  return { suggestions: [...out.values()], unresolved }
}
