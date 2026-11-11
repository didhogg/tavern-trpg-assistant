// 自制包的中英配对（P5 G-2、G-3a）。
// 配对规则照中文 fork 作者自己的脚本（codex-skills/5etools-json-translate/scripts/inspect_translation_scope.py 的
// resolve_homebrew_target）：同一个目录（creature、spell…）+ 文件头里声明的来源标识（_meta.sources[].json）有交集；
// 唯一对应才算配上，多个候选当歧义，不按文件名相似度猜。中文 fork 还要求译文与英文原件结构一致，所以配上的两个文件
// 同类数组里的条目按下标一一对应（实测 23 对真实文件 3138 条全部对齐，ENG_name 都等于英文名），官方数据的中英配对用的是同一做法。
import { BrewPacks, type BrewPack } from './brew-packs'
import type { EntryRef } from './scopes'
import type { LibraryService } from './service'
import type { LibraryView } from './revision'
import { getSource, type SourceEntry } from './sources'

/** 参与配对的一个文件（目录里的一项，或已装的一个包）。dir 为 null（本地导入的没有网址）时不限目录。 */
export interface PairableFile {
  key: string
  dir: string | null
  sources: string[]
}

export interface FilePairing {
  /** 唯一对应、互相唯一的配对。 */
  pairs: Array<{ zh: string; en: string }>
  zhOnly: string[]
  enOnly: string[]
  /** 有候选但不唯一（一个中文对多个英文，或反过来）：不配，交给界面当两个独立的包并标出来。 */
  ambiguous: { zh: string[]; en: string[] }
}

const share = (a: string[], b: string[]): boolean => a.some((s) => b.includes(s))
const sameDir = (a: PairableFile, b: PairableFile): boolean => a.dir === null || b.dir === null || a.dir === b.dir

/** 自制仓库里的相对路径 `目录/文件名.json` 的目录；没有目录返回 null。 */
export function dirOfPath(path: string): string | null {
  const i = path.indexOf('/')
  return i > 0 ? path.slice(0, i) : null
}

/** 已装包的网址 → 它在仓库里的目录（去掉登记的镜像根）；认不出返回 null。 */
export function dirOfUrl(url: string | null, source: Pick<SourceEntry, 'mirrors'>): string | null {
  if (!url) return null
  const root = source.mirrors.find((m) => url.startsWith(m))
  return root ? dirOfPath(url.slice(root.length)) : null
}

export function pairBrewFiles(zh: PairableFile[], en: PairableFile[]): FilePairing {
  const matches = (x: PairableFile, ys: PairableFile[]): string[] => ys.filter((y) => sameDir(x, y) && share(x.sources, y.sources)).map((y) => y.key)
  const zhMatch = new Map(zh.map((x) => [x.key, matches(x, en)]))
  const enMatch = new Map(en.map((y) => [y.key, matches(y, zh)]))
  const pairs: FilePairing['pairs'] = []
  const pairedZh = new Set<string>()
  const pairedEn = new Set<string>()
  for (const x of zh) {
    const m = zhMatch.get(x.key) ?? []
    if (m.length === 1 && (enMatch.get(m[0]) ?? []).length === 1) {
      pairs.push({ zh: x.key, en: m[0] })
      pairedZh.add(x.key)
      pairedEn.add(m[0])
    }
  }
  const rest = (files: PairableFile[], paired: Set<string>, match: Map<string, string[]>) => {
    const ambiguous: string[] = []
    const only: string[] = []
    for (const f of files) if (!paired.has(f.key)) (match.get(f.key)?.length ? ambiguous : only).push(f.key)
    return { ambiguous, only }
  }
  const z = rest(zh, pairedZh, zhMatch)
  const e = rest(en, pairedEn, enMatch)
  return { pairs, zhOnly: z.only, enOnly: e.only, ambiguous: { zh: z.ambiguous, en: e.ambiguous } }
}

/** 作者自制目录里的一项（只列配对用到的字段，其余原样带着）。 */
export interface CatalogFile {
  urlDownload: string
  path: string
  sources?: string[]
  [field: string]: unknown
}

export type PairStatus = 'paired' | 'zh-only' | 'en-only' | 'ambiguous'
export interface CatalogPair {
  zh: CatalogFile | null
  en: CatalogFile | null
  status: PairStatus
}
export interface InstalledPair {
  zh: BrewPack | null
  en: BrewPack | null
  status: PairStatus
}

export type BrewCounterpartReason = 'not-found' | 'pack-unpaired' | 'structure-differs' | 'no-counterpart' | 'no-english-name'
export type CounterpartRef = EntryRef & { docIdLocal?: string }
export interface BrewCounterpart {
  refs: CounterpartRef[]
  reason: BrewCounterpartReason | null
}

const isCatalogFile = (x: unknown): x is CatalogFile => !!x && typeof x === 'object' && typeof (x as CatalogFile).path === 'string' && typeof (x as CatalogFile).urlDownload === 'string'

function rowsOf<T>(pairing: FilePairing, zh: Map<string, T>, en: Map<string, T>): Array<{ zh: T | null; en: T | null; status: PairStatus }> {
  const get = (m: Map<string, T>, k: string): T | null => m.get(k) ?? null
  return [
    ...pairing.pairs.map((p) => ({ zh: get(zh, p.zh), en: get(en, p.en), status: 'paired' as const })),
    ...pairing.ambiguous.zh.map((k) => ({ zh: get(zh, k), en: null, status: 'ambiguous' as const })),
    ...pairing.ambiguous.en.map((k) => ({ zh: null, en: get(en, k), status: 'ambiguous' as const })),
    ...pairing.zhOnly.map((k) => ({ zh: get(zh, k), en: null, status: 'zh-only' as const })),
    ...pairing.enOnly.map((k) => ({ zh: null, en: get(en, k), status: 'en-only' as const })),
  ]
}

export class BrewPairs {
  private readonly packs: BrewPacks

  constructor(private readonly lib: LibraryService) {
    this.packs = new BrewPacks(lib)
  }

  /** 这个自制源配对的另一种语言的自制源（源登记里的 pair）。 */
  private partnerOf(set: SourceEntry): SourceEntry {
    if (!set.pair) throw new Error(`${set.id} 没有登记配对语言`)
    return getSource(set.pair)
  }

  /**
   * 下载页：中文自制目录与英文自制目录按上面的规则合并。配上的是一行（中英各一个文件）；
   * 只有一种语言的、有歧义的各自一行。某一边目录取不到时，那一边的错误原样交回，另一边照常列。
   */
  async catalog(zhId = 'cn-brew'): Promise<{ rows: CatalogPair[]; errors: { zh: string[]; en: string[] } }> {
    const zhSet = getSource(zhId)
    const enSet = this.partnerOf(zhSet)
    const [zhRes, enRes] = await Promise.all([this.lib.brewCatalog(zhSet.id), this.lib.brewCatalog(enSet.id)])
    const files = (value: unknown[] | null): Map<string, CatalogFile> => new Map((value ?? []).filter(isCatalogFile).map((f) => [f.path, f]))
    const zh = files(zhRes.value)
    const en = files(enRes.value)
    const pairable = (m: Map<string, CatalogFile>): PairableFile[] => [...m.values()].map((f) => ({ key: f.path, dir: dirOfPath(f.path), sources: Array.isArray(f.sources) ? f.sources : [] }))
    return { rows: rowsOf(pairBrewFiles(pairable(zh), pairable(en)), zh, en), errors: { zh: zhRes.errors, en: enRes.errors } }
  }

  /** 已装的包两两配对：同样的规则，目录从下载网址里取；自己写的（可编辑）包不参与。 */
  async installed(zhId = 'cn-brew', view?: LibraryView): Promise<InstalledPair[]> {
    const zhSet = getSource(zhId)
    const enSet = this.partnerOf(zhSet)
    const side = async (set: SourceEntry): Promise<Map<string, BrewPack>> => new Map((await this.packs.list(set.id, view)).filter((p) => !p.isEditable).map((p) => [p.docIdLocal, p]))
    const zh = await side(zhSet)
    const en = await side(enSet)
    const pairable = (m: Map<string, BrewPack>, set: SourceEntry): PairableFile[] => [...m.values()].map((p) => ({ key: p.docIdLocal, dir: dirOfUrl(p.url, set), sources: p.sources }))
    return rowsOf(pairBrewFiles(pairable(zh, zhSet), pairable(en, enSet)), zh, en)
  }

  /**
   * 一条自制条目在另一种语言里是哪一条：先找它所在的包的配对包，再按"同类数组、同一下标"取英文（中文）那条的作者编号，
   * 并核对另一边库里真的有。同一条在几个包里（同编号挂备选）各自找，取得的结果合并去重。
   */
  async entry(ref: EntryRef, opts: { docIdLocal?: string } = {}): Promise<BrewCounterpart> {
    const here = getSource(ref.set)
    const other = this.partnerOf(here)
    const zhId = here.lang === 'zh' ? here.id : other.id
    const view = await this.lib.currentView()
    const pairs = (await this.installed(zhId, view)).filter((p) => p.zh && p.en)
    const index = async (set: SourceEntry) => new Map((await (await this.lib.frameOf(set.codeSet, view)).call('brewDocIndex')).map((d) => [d.docIdLocal, d.props]))
    const mine = await index(here)
    const theirs = await index(other)
    const refs = new Map<string, CounterpartRef>()
    let inPack = false
    let paired = false
    let shape = false
    for (const [docId, props] of mine) {
      if (opts.docIdLocal && docId !== opts.docIdLocal) continue // 同编号拆行后，只看这一行所在的包（B-31）
      const arr = props[ref.prop]
      if (!arr?.includes(ref.hash)) continue
      inPack = true
      const pair = pairs.find((p) => (here.lang === 'zh' ? p.zh : p.en)?.docIdLocal === docId)
      const partner = pair && (here.lang === 'zh' ? pair.en : pair.zh)
      if (!partner) continue
      paired = true
      const target = theirs.get(partner.docIdLocal)?.[ref.prop]
      if (!target || target.length !== arr.length) { shape = true; continue }
      const rows = (await this.lib.packOwnedItems(other.id, partner, view))[ref.prop] ?? []
      for (let i = 0; i < arr.length; i++) {
        const h = target[i]
        if (arr[i] === ref.hash && h && rows.some((r) => r.hash === h)) {
          refs.set(`${partner.docIdLocal}|${h}`, { set: other.id, prop: ref.prop, hash: h, docIdLocal: partner.docIdLocal })
        }
      }
    }
    if (refs.size) return { refs: [...refs.values()], reason: null }
    const reason: BrewCounterpartReason = !inPack ? 'not-found' : !paired ? 'pack-unpaired' : shape ? 'structure-differs' : 'no-counterpart'
    if (reason === 'not-found') return { refs: [], reason }
    // 按位置对不上（自己写的条目、本地导入的、没配对的包）：改按"英文名 + 来源"找
    const named = await this.byName(ref)
    if (named.refs.length && !opts.docIdLocal) return named
    return { refs: [], reason: named.reason === 'no-english-name' && reason === 'pack-unpaired' ? 'no-english-name' : reason }
  }

  /**
   * 按"英文名 + 来源"对（P5 G-3b，办法 B）：中文条目带作者的 ENG_name（英文名），英文那边找同类别、同来源、name 等于它的；
   * 反过来英文条目的 name 去找中文那边 ENG_name 等于它的。同名不止一条就都列出（界面当"有歧义"）。不写任何条目。
   * 实测 23 对真实中英自制文件 3138 条：唯一且对 3036、重名 90、没有 ENG_name 12、配错 0。
   */
  private async byName(ref: EntryRef): Promise<BrewCounterpart> {
    const here = getSource(ref.set)
    const other = this.partnerOf(here)
    const mine = await this.lib.storedItem(here.id, ref.prop, ref.hash)
    if (!mine) return { refs: [], reason: 'not-found' }
    const item = mine.item as { name?: unknown; ENG_name?: unknown }
    const needle = here.lang === 'zh' ? item.ENG_name : item.name
    if (typeof needle !== 'string' || !needle.trim() || !mine.source) return { refs: [], reason: here.lang === 'zh' ? 'no-english-name' : 'no-counterpart' }
    if (!(await this.lib.brewInstalled(other.id)).length) return { refs: [], reason: 'no-counterpart' }
    const field = other.lang === 'zh' ? 'ENG_name' : 'name'
    const rows = await this.lib.query(other.id, ref.prop, { source: mine.source })
    const refs = rows.filter((r) => r.hash && typeof (r.item as Record<string, unknown>)[field] === 'string' && ((r.item as Record<string, string>)[field]).trim() === needle.trim())
    return { refs: refs.map((r) => ({ set: other.id, prop: ref.prop, hash: r.hash as string })), reason: refs.length ? null : 'no-counterpart' }
  }
}
