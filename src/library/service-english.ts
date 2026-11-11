// 【库】中英配对表（作者做法；P5-1 B-42）：从 service.ts 拆出，保持单文件职责与行数上限。
import { addGeneratedPairs } from './english-generated'
import type { EnglishPairs } from './service'
import type { ParsedProp } from './runtime/frame/commands'
import type { AuthorFrame } from './runtime/host'
import { getSource, type SourceEntry } from './sources'
import type { LibraryView } from './revision'

export interface PairContext {
  openFrame: (codeSet: string, ctx?: { view?: LibraryView; filterIndex?: boolean }) => Promise<AuthorFrame>
  parsed: (sourceId: string, prop: string, view: LibraryView) => Promise<ParsedProp>
}

export async function buildEnglishPairsFor(ctx: PairContext, s: SourceEntry, view: LibraryView): Promise<EnglishPairs> {
  if (!s.pair) throw new Error(`${s.id} 没有登记配对的另一种语言`)
  const pair = getSource(s.pair)
  const [x, y] = await Promise.all([view.officialState(s.id), view.officialState(pair.id)])
  if (x?.status !== 'installed' || y?.status !== 'installed') throw new Error(`${s.id} 或 ${pair.id} 还没安装，不能配对`)
  const key = `english:${s.id}`
  const fingerprint = `${await view.commitOf(s)}+${await view.commitOf(pair)}+gen4`
  const saved = await view.derivedGet(key)
  if (saved?.fingerprint === fingerprint) return saved.value as EnglishPairs
  const cnFrame = await ctx.openFrame(s.codeSet, { view, filterIndex: true })
  const enFrame = await ctx.openFrame(pair.codeSet, { view, filterIndex: true }).catch((e: unknown) => { cnFrame.close(); throw e })
  try {
    const visible = await view.visibleSources(s.id)
    const docs = await cnFrame.call('englishLocators', visible)
    const matches = await enFrame.call('englishMatch', docs)
    const out: EnglishPairs = { source: s.id, pair: pair.id, pairs: {}, unmatched: [], via: {}, located: docs.length }
    for (const m of matches) {
      if (!m.enHash) { out.unmatched.push({ prop: m.prop, hash: m.hash, ...(m.error ? { error: m.error } : {}) }); continue }
      ;(out.pairs[m.prop] ??= {})[m.hash] = { enHash: m.enHash, enSource: m.enSource, via: m.via }
      out.via[m.via ?? 'none'] = (out.via[m.via ?? 'none'] ?? 0) + 1
    }
    out.generated = await addGeneratedPairs(out.pairs, {
      parsed: (side, prop) => ctx.parsed(side === 'cn' ? s.id : pair.id, prop, view).catch(() => null),
      templates: () => cnFrame.call('variantTemplateNames'),
      versions: (side, props) => (side === 'cn' ? cnFrame : enFrame).call('versionOrder', props),
    })
    out.via.generated = Object.values(out.generated).reduce((n, r) => n + r.paired, 0)
    await view.derivedPut(key, fingerprint, out)
    return out
  } finally {
    cnFrame.close()
    enFrame.close()
  }
}
