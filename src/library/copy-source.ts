// 存入【我的库】（P5 B-27）：把官方的一本书 / 一条条目原样存成作者格式的自制文件。
// 原样 = 取官方下载下来的原始文件（本来就是作者的自制文件格式），按每条的 source 挑出这本书的记录，套上作者自制文件的 _meta.sources。
// 不取作者加载器处理后的对象：加载器会把职业特性、牌组、亚种等改写成运行时形状（P5-0 §2.4 后处理清单），那样复制出来不是原文。
// 哪些顶层字段算条目类别，问作者加载器登记表（frame 的 loaders），不写类别清单；一个条目的编号用作者规则（frame 的 rawHashes）算。
import type { LibraryDatabase } from './db'
import type { LibraryService } from './service'
import { CODE_SETS, type SourceEntry } from './sources'

export interface RawCopy {
  json: Record<string, unknown>
  /** 每类复制了几条（正文另计）。 */
  counts: Record<string, number>
  /** 带上了正文的书 / 冒险。 */
  corpora: Array<{ prop: string; id: string }>
  /** 没复制到的（例如冒险正文还没下载、文件不是 JSON）。 */
  skipped: Array<{ what: string; reason: string }>
}

const low = (v: unknown): string => String(v ?? '').toLowerCase()
const isEntity = (o: unknown): o is Record<string, unknown> => !!o && typeof o === 'object' && !Array.isArray(o)

export interface CopyOptions {
  db: LibraryDatabase
  lib: Pick<LibraryService, 'frameOf'>
  official: SourceEntry
  /** 要存的来源（作者的 source 标识）。 */
  source: string
  /** 只存这一条（类别 + 作者编号）；不给就是整个来源。 */
  entry?: { prop: string; hash: string }
  /** 已有的本地副本内容：新内容并进去，同编号的换成新的（作者按来源认包，同来源再存会整个替换）。 */
  base?: Record<string, unknown>
}

export async function copyRawSource(o: CopyOptions): Promise<RawCopy> {
  const frame = await o.lib.frameOf(o.official.codeSet)
  const loaders = await frame.call('loaders')
  const corpusData = new Set(loaders.filter((l) => l.kind === 'corpus').flatMap((l) => l.props.slice(1)))
  const props = new Set(loaders.flatMap((l) => l.props).filter((p) => !p.startsWith('raw_') && !corpusData.has(p)))
  const want = low(o.source)
  const found: Record<string, Record<string, unknown>[]> = {}
  const skipped: RawCopy['skipped'] = []

  // 1. 官方原始文件里这个来源的记录
  const files = await o.db.files.where('source').equals(o.official.id).toArray()
  for (const f of files) {
    if (!f.path.startsWith('data/') || !f.path.endsWith('.json') || f.path.startsWith('data/generated/') || f.path.startsWith('data/adventure/') || f.path.startsWith('data/book/')) continue
    let json: unknown
    try { json = JSON.parse(f.text) } catch { skipped.push({ what: f.path, reason: '不是 JSON' }); continue }
    if (!isEntity(json)) continue
    for (const [prop, arr] of Object.entries(json)) {
      if (!props.has(prop) || !Array.isArray(arr)) continue
      const hit = arr.filter((e) => isEntity(e) && low(e.source) === want) as Record<string, unknown>[]
      if (hit.length) found[prop] = [...(found[prop] ?? []), ...hit]
    }
  }

  // 2. 只存一条：按作者规则算编号挑出来
  if (o.entry) {
    const all = found[o.entry.prop] ?? []
    const hashes = all.length ? await frame.call('rawHashes', o.entry.prop, all) : []
    const one = all.filter((_, i) => hashes[i] === o.entry!.hash)
    for (const k of Object.keys(found)) delete found[k]
    if (one.length) found[o.entry.prop] = one
  }

  // 3. 书 / 冒险正文：目录行在 book / adventure 里，正文在各自的文件里（作者加载器的文件拼法 corpusFile）
  const corpora: RawCopy['corpora'] = []
  if (!o.entry) {
    for (const l of loaders.filter((x) => x.kind === 'corpus')) {
      const [prop, propData] = l.props
      for (const row of found[prop] ?? []) {
        const id = String(row.id ?? '')
        const path = await frame.call('corpusFile', prop, id)
        const text = (await o.db.files.get([o.official.id, path]))?.text
        if (text === undefined) { skipped.push({ what: `${prop} ${id}`, reason: '正文还没下载' }); continue }
        try {
          const data = (JSON.parse(text) as Record<string, unknown>)[propData]
          if (!Array.isArray(data)) throw new Error(`没有 ${propData}`)
          found[propData] = [...(found[propData] ?? []), ...data.filter(isEntity)]
          corpora.push({ prop, id })
        } catch (e) {
          skipped.push({ what: `${prop} ${id}`, reason: e instanceof Error ? e.message : String(e) })
        }
      }
    }
  }

  // 4. 并进已有的本地副本
  const json: Record<string, unknown[]> = {}
  for (const [k, v] of Object.entries(o.base ?? {})) if (k !== '_meta' && Array.isArray(v)) json[k] = [...v]
  const counts: Record<string, number> = {}
  for (const [prop, rows] of Object.entries(found)) {
    if (!corpusData.has(prop)) counts[prop] = rows.length // 正文另计（corpora）
    const have = json[prop] ?? []
    if (!have.length) { json[prop] = rows; continue }
    const haveHashes = await frame.call('rawHashes', prop, have)
    const newHashes = await frame.call('rawHashes', prop, rows)
    rows.forEach((row, i) => {
      const at = newHashes[i] ? haveHashes.indexOf(newHashes[i]) : -1
      if (at >= 0) have[at] = row
      else have.push(row)
    })
    json[prop] = have
  }

  // 5. _copy 指向别的来源（例如怪物 _copy 了怪物图鉴里的怪）：作者自制文件要在 _meta.dependencies 里声明才展开得了
  //    （和房规写 _copy 时用的是同一个办法，custom.ts createHouseRule → editableAddDependencies；格式：类别 → 来源列表）
  const dependencies: Record<string, string[]> = {}
  for (const [prop, rows] of Object.entries(json)) {
    for (const row of rows as Array<{ _copy?: { source?: string } }>) {
      const from = row?._copy?.source
      if (typeof from === 'string' && low(from) !== want && !(dependencies[prop] ?? []).some((x) => low(x) === low(from))) (dependencies[prop] ??= []).push(from)
    }
  }

  // 6. 作者自制文件的 _meta：来源全名 / 缩写取作者，版本风格按作者对来源的判断，版本号写这份官方数据的版本（说明副本是从哪个版本存的）
  const names = (await frame.call('sourceNames', [o.source]))[o.source]
  const edition = (await frame.call('editionOf', [o.source]))[o.source]
  const now = Math.floor(Date.now() / 1000)
  const meta = {
    sources: [{ json: o.source, abbreviation: names?.abv ?? o.source, full: names?.full ?? o.source, authors: [], convertedBy: [], version: CODE_SETS[o.official.codeSet].version }],
    dateAdded: now, dateLastModified: now,
    ...(Object.keys(dependencies).length ? { dependencies } : {}),
    ...(edition?.classic === null || edition === undefined ? {} : { edition: edition.classic ? 'classic' : 'one' }),
  }
  return { json: { _meta: meta, ...json }, counts, corpora, skipped }
}
