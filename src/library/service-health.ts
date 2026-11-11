// 【库】体检与中英覆盖率（P5 M7 / B-26）：从 service.ts 拆出，保持单文件职责与行数上限。
import { healthItemsOf, healthReport, type HealthItem, type HealthReport, type Layers34Summary, type StoredReport } from './health'
import type { InstallReport } from './install'
import { parsedKey } from './install'
import type { BrewParseReport } from './brew'
import type { ParsedProp } from './runtime/frame/commands'
import type { AuthorFrame } from './runtime/host'
import type { EnglishCoverage, EnglishPairs, UnpairedReason } from './service'
import { SOURCES, officialSourceOf, getSource } from './sources'
import type { LibraryView } from './revision'

export interface HealthContext {
  report: (sourceId: string, view: LibraryView) => Promise<{ parse: Pick<InstallReport['parse'], 'props'> }>
  parsed: (sourceId: string, prop: string, view: LibraryView) => Promise<ParsedProp>
  englishPairs: (sourceId: string, view: LibraryView) => Promise<EnglishPairs>
  frame: (codeSet: string, view: LibraryView) => Promise<AuthorFrame>
  stored: <T>(key: string, fingerprint: (fp: string) => boolean, view: LibraryView) => Promise<StoredReport<T> | undefined>
  brewSourceCounts: (sourceId: string, view: LibraryView) => Promise<Record<string, number>>
}

export async function englishCoverageOf(ctx: HealthContext, sourceId: string, view: LibraryView): Promise<EnglishCoverage> {
  const s = getSource(sourceId)
  const pairs = await ctx.englishPairs(s.id, view)
  const unmatched = new Set(pairs.unmatched.map((u) => `${u.prop}\u0000${u.hash}`))
  const out: EnglishCoverage = { source: s.id, pair: pairs.pair, props: {}, via: pairs.via, unpaired: [], nameMismatch: [] }
  for (const prop of Object.keys((await ctx.report(s.id, view)).parse.props)) {
    const cn = await ctx.parsed(s.id, prop, view)
    const enRec = await view.derivedGet(parsedKey(pairs.pair, prop))
    const enParsed = enRec ? (enRec.value as ParsedProp) : null
    const en = new Map((enParsed?.hashes ?? []).map((h, i) => [h, i]))
    const row: EnglishCoverage['props'][string] = (out.props[prop] = { total: cn.items.length, paired: 0, nameMismatch: 0 })
    cn.hashes.forEach((hash, i) => {
      const hit = hash ? pairs.pairs[prop]?.[hash] : undefined
      let reason: UnpairedReason | null = null
      if (!hit) reason = hash && unmatched.has(`${prop}\u0000${hash}`) ? 'no-english-record' : 'not-in-index'
      else if (!en.has(hit.enHash)) reason = 'english-not-in-parsed'
      if (!reason) {
        row.paired++
        const engName = (cn.items[i] as { ENG_name?: unknown }).ENG_name
        const enName = (enParsed!.items[en.get(hit!.enHash)!] as { name?: unknown }).name
        if (engName !== undefined && engName !== enName) {
          row.nameMismatch++
          out.nameMismatch.push({ prop, hash: hash!, enHash: hit!.enHash, via: hit!.via, engName, enName })
        }
        return
      }
      row[reason] = (row[reason] ?? 0) + 1
      out.unpaired.push({ prop, hash, reason, ...(hit ? { enHash: hit.enHash } : {}) })
    })
  }
  await view.derivedPut(`audit:english:${s.id}`, `${await view.commitOf(s)}+${await view.commitOf(getSource(pairs.pair))}`, out)
  return out
}

/** 体检：源登记表里每个源的各份报告汇成一份（第 9 节）。每个来源隔离失败，不让一套坏掉遮住别的。 */
export async function healthOf(ctx: HealthContext, view: LibraryView): Promise<HealthReport> {
  const items: HealthItem[] = []
  for (const source of SOURCES) {
    try {
      const commit = await view.commitOf(source)
      const set = source.kind === 'official' ? await view.officialState(source.id) : null
      const pairCommit = source.pair ? await view.commitOf(getSource(source.pair)) : ''
      const input: Parameters<typeof healthItemsOf>[0] = {
        source,
        installed: source.kind === 'official' ? set?.status === 'installed' : !!(await view.brewState(source.id)),
        install: source.kind === 'official' ? await ctx.stored<InstallReport>(`audit:${source.id}`, (fp) => fp === commit, view) : undefined,
        brew: source.kind === 'brew' ? await ctx.stored<BrewParseReport>(`audit:${source.id}`, () => true, view) : undefined,
        english: await ctx.stored<EnglishCoverage>(`audit:english:${source.id}`, (fp) => fp === `${commit}+${pairCommit}`, view),
        layers34: await ctx.stored<Layers34Summary>(`audit:layers34:${source.id}`, (fp) => fp.startsWith(`${commit}+`), view),
      }
      if (source.kind === 'brew' && (await view.officialState(officialSourceOf(source.codeSet).id))?.status !== 'installed') {
        input.officialMissing = officialSourceOf(source.codeSet).id
      } else if (source.kind === 'brew') {
        input.brewStorage = await (await ctx.frame(source.codeSet, view)).call('brewStorage')
        input.brewSourceCounts = await ctx.brewSourceCounts(source.id, view)
      }
      items.push(...healthItemsOf(input))
    } catch (e) {
      items.push({ source: source.id, check: 'source', level: 'error', title: '这个来源的体检失败（其他来源照常）', count: 1, details: [e instanceof Error ? e.message : String(e)] })
    }
  }
  return healthReport(items)
}


/** 读某个版本里存下的报告；stale 表示报告不是当前提交号做的。 */
export async function storedOf<T>(view: LibraryView, key: string, fingerprint: (fp: string) => boolean): Promise<StoredReport<T> | undefined> {
  const rec = await view.derivedGet(key)
  return rec ? { value: rec.value as T, stale: !fingerprint(rec.fingerprint) } : undefined
}

/** 这套作者程序对应的官方数据装好了吗。 */
export async function officialInstalledOf(view: LibraryView, codeSet: string): Promise<boolean> {
  return (await view.officialState(officialSourceOf(codeSet).id))?.status === 'installed'
}

/** 下载 / 更新完成后在后台把中英配对表建好（P5-1 B-42）。 */
export async function warmEnglishPairsOf(ctx: { englishPairs: (id: string, view: LibraryView) => Promise<unknown>; onLog?: (e: { level: 'warn'; source: string; kind: string; message: string }) => void }, sourceId: string, view: LibraryView): Promise<void> {
  const s = getSource(sourceId)
  if (!s.pair) return
  const pair = getSource(s.pair)
  const [x, y] = await Promise.all([view.officialState(s.id), view.officialState(pair.id)])
  if (x?.status !== 'installed' || y?.status !== 'installed') return
  try { await ctx.englishPairs(sourceId, view) } catch (e) {
    ctx.onLog?.({ level: 'warn', source: sourceId, kind: 'english-pairs', message: e instanceof Error ? e.message : String(e) })
  }
}
