// P5.5 B8-3 复制成我的：一本书 / 一个包整个复制进【我的库】成为一个新包（内容是原文，可以随便改；同一本可以复制多份），
// 或者把一条复制进你选的包。
// 整本 / 整包：条目编号一个不改（不用改任何引用），包头在原来源之外多登记一行这份复制件自己的来源（作者按「来源编号组合」认包，
// utils-brew-base.js _getBrewId，所以每份是不同的包）；和原件同编号的按「同编号不同包」并排，整包选用在 B8-4。
// 单条：换成目标包自己的来源（成为独立的一条），_copy 别的来源的在包头补依赖声明。
import { copyRawSource } from './copy-source'
import { listPacks, docIdOf, type MyPack, type PackDeps } from './custom-packs'
import { persist, type EntryDeps } from './custom-entries'
import type { LibraryDatabase } from './db'
import type { LibraryService } from './service'
import { BUILTIN_SCOPES, sourceUnit, type EntryRef } from './scopes'
import { officialSourceOf, SOURCES } from './sources'
import { packStableId } from './versions'

export interface CopyDeps extends PackDeps {
  db: LibraryDatabase
  lib: PackDeps['lib'] & Pick<LibraryService, 'currentView' | 'storedItem' | 'openFrameIn'>
  exportBrew: (codeSet: string, docIdLocal: string) => Promise<{ filename: string | null; body: unknown } | null>
  entries: EntryDeps
}

type Src = { json: string; full?: string; abbreviation?: string; [k: string]: unknown }
const low = (v: unknown): string => String(v ?? '').toLowerCase()
const brewSetOf = (codeSet: string) => {
  const s = SOURCES.find((x) => x.kind === 'brew' && x.codeSet === codeSet)
  if (!s) throw new Error(`作者程序 ${codeSet} 没有登记自制数据集`)
  return s
}

/**
 * 作者网站实际读哪些数据文件：开一个全新的隔离小窗（空的作者存储，只读官方数据；作者缓存是空的，不会漏），
 * 让作者把每类网站数据取一遍（小窗 authorDataFiles）。用完关掉、清掉临时存储。
 */
async function authorFiles(d: CopyDeps, codeSet: string): Promise<string[]> {
  const view = await d.lib.currentView()
  const scope = `${codeSet}:author-files:${Date.now()}`
  const f = await d.lib.openFrameIn(codeSet, scope, view)
  try {
    const r = await f.call('authorDataFiles')
    if (!r.paths.length) throw new Error(`作者一个数据文件都没读到，没法确定复制哪些内容${r.failed.length ? `（${r.failed[0].error}）` : ''}`)
    return r.paths
  } finally {
    f.close()
    await d.db.kv.where('scope').anyOf(scope, `${scope}:local`).delete()
  }
}

/** 包里有没有条目用这个来源（复制件自己那一行没有条目用）。 */
function used(body: Record<string, unknown>, json: string): boolean {
  return Object.entries(body).some(([k, v]) => !k.startsWith('_') && Array.isArray(v) && v.some((e) => low((e as { source?: unknown })?.source) === low(json)))
}

/**
 * 整本书（官方来源）或整个包（下载的 / 【我的库】里的）复制成【我的库】的一个新包。返回新包的身份、名字、每类几条。
 * 版本标签：照原来的（原来源有归类就照抄，没有就按作者对原来源的版本判断）。
 */
export async function copyToMine(d: CopyDeps, codeSet: string, target: { kind: 'source'; source: string } | { kind: 'pack'; docIdLocal: string }) {
  const frame = await d.lib.frameOf(codeSet)
  let body: Record<string, unknown>
  let counts: Record<string, number> = {}
  if (target.kind === 'source') {
    const copy = await copyRawSource({ db: d.db, lib: d.lib, official: officialSourceOf(codeSet), source: target.source, view: await d.lib.currentView(), authorFiles: () => authorFiles(d, codeSet) })
    if (!Object.values(copy.counts).some((n) => n > 0) && !copy.corpora.length) throw new Error(`官方资料里没有来源 ${target.source} 的内容可复制（还没下载？）`)
    body = copy.json as Record<string, unknown>
    counts = copy.counts
  } else {
    const mine = (await listPacks(d, codeSet)).find((p) => p.docIdLocal === target.docIdLocal)
    const got = mine ? await frame.call('packExport', target.docIdLocal) : await d.exportBrew(codeSet, target.docIdLocal)
    if (!got) throw new Error('取不到这个包的内容')
    body = structuredClone(got.body) as Record<string, unknown>
    for (const [k, v] of Object.entries(body)) if (!k.startsWith('_') && Array.isArray(v)) counts[k] = v.length
  }
  const meta = (body._meta ??= {}) as { sources?: Src[] }
  const sources = meta.sources ?? []
  if (!sources.length) throw new Error('这个包的包头没有来源，作者认不出它')
  // 复制件再复制：原来那份自己的一行（没有条目用）换成新的，不叠加
  const base = used(body, sources[sources.length - 1].json) ? sources : sources.slice(0, -1)
  const from = base[base.length - 1]
  const stem = from.json.replace(/[^A-Za-z0-9_-]/g, '') || 'PACK'
  let n = 1
  while (await frame.call('sourceTaken', `${stem}_COPY${n}`)) n++
  const own = { json: `${stem}_COPY${n}`, full: `${from.full ?? from.json}（副本 ${n}）`, abbreviation: `${from.abbreviation ?? from.json}${n}`, authors: [], version: '1' }
  meta.sources = [...base, own]
  // 版本标签照原来的（导入会发布新版本、旧小窗随之关闭，所以先查好）
  const was = (await d.manage.assignments()).get(sourceUnit(from.json))
  let scopes = was?.scopes ? [...was.scopes] : []
  if (!scopes.length) {
    const ed = (await frame.call('editionOf', [from.json]))[from.json]
    if (ed && ed.classic !== null) scopes = BUILTIN_SCOPES.filter((s) => s.edition === (ed.classic ? 'classic' : 'one')).map((s) => s.id)
  }
  const r = await d.lib.brewImport(brewSetOf(codeSet).id, [{ name: `${own.json}.json`, text: JSON.stringify(body) }])
  if (!r.ok) throw new Error(`作者没有收下这份复制件：${r.errors.join('；')}`)
  if (scopes.length) await d.manage.setAssignment(sourceUnit(own.json), { scopes, global: false })
  return { id: packStableId({ sources: meta.sources.map((s) => s.json) })!, json: own.json, full: own.full, counts, parse: r.parse }
}

/**
 * 一条复制进【我的库】的一个包：取这条的作者原文（官方的取原始文件，自制的取存储里的），换成目标包自己的来源，存进去成为独立的一条。
 * 原文 _copy 别的来源（包括它原来那本书）的，在目标包的包头补依赖声明。
 */
export async function copyEntryToPack(d: CopyDeps, codeSet: string, ref: EntryRef, pack: string, opts: { rule?: string } = {}) {
  let ent: Record<string, unknown> | undefined
  if (SOURCES.find((s) => s.id === ref.set)?.kind === 'official') {
    const stored = await d.lib.storedItem(ref.set, ref.prop, ref.hash)
    if (!stored?.source) throw new Error('找不到这一条或它没有来源')
    const copy = await copyRawSource({ db: d.db, lib: d.lib, official: officialSourceOf(codeSet), source: stored.source, entry: { prop: ref.prop, hash: ref.hash }, view: await d.lib.currentView(), authorFiles: () => authorFiles(d, codeSet) })
    ent = ((copy.json as Record<string, unknown>)[ref.prop] as Array<Record<string, unknown>> | undefined)?.[0]
  } else {
    ent = (await d.lib.storedItem(ref.set, ref.prop, ref.hash))?.item as Record<string, unknown> | undefined
    if (ent) ent = await (await d.lib.frameOf(codeSet)).call('cleanEntity', ent)
  }
  if (!ent) throw new Error('找不到这一条的原文')
  const { source: _s, uniqueId: _u, ...rest } = ent
  const deps = typeof (rest._copy as { source?: unknown } | undefined)?.source === 'string' ? { [ref.prop]: [String((rest._copy as { source: string }).source)] } : null
  if (deps) {
    await d.lib.mutateAuthor(codeSet, 'custom-pack-deps', async (view) => {
      const f = await d.lib.frameOf(codeSet, view)
      await f.call('packAddDependencies', await docIdOf(f, pack), deps)
    })
  }
  return persist(d.entries, codeSet, ref.prop, rest, { record: true, pack, ...(opts.rule ? { rule: opts.rule } : {}) })
}

export type { MyPack }
