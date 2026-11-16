// 显示文字的中英对照不止条目本身：小窗换算时还读作者给 Foundry 的补充文件（数值行标题、动作名……都写在那里）。
// 这里把「条目本身 + 同编号的补充记录」都配成英 ⇄ 中两份，交给统一出口 locale.ts localizeAll。
//   哪些是补充文件：照作者 test/test-foundry.js —— data/<目录>/foundry.json 与 data/foundry-*.json，取英文【库】已装清单里的
//   （不按「这次小窗读没读」：换算有缓存，命中缓存时小窗不会再读补充文件）。
//   哪条补充记录属于这条条目：名字 + 来源相同，或「所属」字段（职业 / 种族 / 子职业）指向它；
//     英文用英文条目名认，中文用同一编号的中文条目名认（中文版补充文件里所属字段是中文、名字另存 ENG_name）。
//   两边记录配对：作者的编号（类别 + 英文名 + 来源 + 等级），中文版英文名在 ENG_name。
// 中文版没有这个文件 / 这条记录 → 不配，出口照原样显示英文（作者没写中文就是英文，不是错）。
import type { FileProvider } from '../../library/files'
import type { LibraryView } from '../../library/revision'
import { kernelDataSource, officialSourceOf } from '../../library/sources'
import type { EntryPair } from './locale'

/** 作者认定的 Foundry 补充文件。 */
export const isSidecar = (path: string): boolean => /^data\/(?:[^/]+\/foundry|foundry-[^/]+)\.json$/.test(path)

type Rec = Record<string, unknown>
const PARENTS: Array<[string, string]> = [['className', 'classSource'], ['raceName', 'raceSource'], ['subclassShortName', 'subclassSource']]

/** 这条补充记录是否属于条目 e（e 与记录同一语言）。 */
export function belongs(rec: Rec, e: Rec): boolean {
  if (rec.name === e.name && rec.source === e.source) return true
  const names = [e.name, e.shortName].filter((x) => typeof x === 'string')
  return PARENTS.some(([n, s]) => names.includes(rec[n] as string) && rec[s] === e.source)
}

/** 作者编号：类别 + 英文名 + 来源 + 等级（中文版英文名在 ENG_name）。 */
const idOf = (prop: string, rec: Rec): string => [prop, rec.ENG_name ?? rec.name, rec.source, rec.level ?? ''].join('|')

/** 一个补充文件里，属于这对条目的记录按编号配成英 ⇄ 中。 */
export function sidecarPairsOf(en: Rec, zh: Rec, entry: EntryPair): EntryPair[] {
  const enEntry = entry.en as Rec
  const zhEntry = entry.zh as Rec
  const out: EntryPair[] = []
  for (const [prop, arr] of Object.entries(en)) {
    const zhArr = zh[prop]
    if (!Array.isArray(arr) || !Array.isArray(zhArr)) continue
    const zhById = new Map<string, Rec[]>()
    for (const r of zhArr as Rec[]) if (r && belongs(r, zhEntry)) zhById.set(idOf(prop, r), [...(zhById.get(idOf(prop, r)) ?? []), r])
    for (const r of arr as Rec[]) {
      if (!r || !belongs(r, enEntry)) continue
      const hit = zhById.get(idOf(prop, r))
      if (hit?.length === 1) out.push({ en: r, zh: hit[0] })
    }
  }
  return out
}

export type PairsOf = (rows: Array<{ entry: unknown; zh: unknown | null }>) => Promise<EntryPair[]>

/** 本战役小窗用的「条目 + 同编号补充记录」对照；补充文件每个只读、只解析一次。 */
export function pairsSource(opts: { files: Pick<FileProvider, 'get' | 'cachedFileList'>; view: LibraryView; codeSet: string }): PairsOf {
  const zhSource = officialSourceOf(opts.codeSet)
  const parsed = new Map<string, Promise<{ en: Rec; zh: Rec } | null>>()
  let paths: Promise<string[]> | null = null
  const load = (path: string) => {
    if (!parsed.has(path)) parsed.set(path, (async () => {
      const [en, zh] = await Promise.all([kernelDataSource(), zhSource].map((s) => opts.files.get(s, path, { allowNetwork: false, view: opts.view })))
      return en && zh ? { en: JSON.parse(en) as Rec, zh: JSON.parse(zh) as Rec } : null
    })())
    return parsed.get(path)!
  }
  return async (rows) => {
    const entries: EntryPair[] = rows.map((r) => ({ en: r.entry, zh: r.zh }))
    const live = entries.filter((p) => p.zh !== null && p.zh !== undefined)
    if (!live.length || zhSource.id === kernelDataSource().id) return entries
    const out = [...entries]
    paths ??= opts.files.cachedFileList(kernelDataSource(), opts.view).then((list) => Object.keys(list ?? {}).filter(isSidecar).sort())
    for (const path of await paths) {
      const file = await load(path)
      if (file) for (const p of live) out.push(...sidecarPairsOf(file.en, file.zh, p))
    }
    return out
  }
}
