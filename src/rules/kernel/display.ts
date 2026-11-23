// 建卡和起始装备的唯一显示出口。身份与语言键均在这里核对；失败保留原文和诊断依据。
import type { KernelRefFlags } from '../../core/saves/split'
import type { TextReader, TextQuery } from '../../library/texts'
import { zhAt, type EntryPair } from './locale'
import type { Namer } from './naming'
import { isFrameText, type Displayed, type FrameText, type Shown } from './shown'

export interface DisplayContext {
  translate: boolean
  pairs: EntryPair[]
  namer: Namer
  author: TextReader
  requirementOf?: (key: string) => unknown
  /** 带位置的条目原文（FrameText entry.at）按这里取本战役语言版：entries[at.entry].zh 里 at.path 那一处。 */
  entries?: Array<{ zh: unknown | null }>
}
export interface DisplayIssue {
  text: string
  kind: FrameText['$t']
  reason: 'language-key-missing' | 'reference-unavailable' | 'ambiguous-name' | 'entry-position-unresolved' | 'author-position-unresolved' | 'author-rule-unresolved' | 'requirement-unavailable'
  path: string
  key?: string
  ids?: KernelRefFlags[]
}
export interface DisplayResult<T> { value: Displayed<T>; missed: string[]; issues: DisplayIssue[] }
type Resolution = { text: string | null; reason: DisplayIssue['reason'] }

const isId = (v: unknown): v is KernelRefFlags => !!v && typeof v === 'object' && typeof (v as KernelRefFlags).hash === 'string'
const mint = (s: string): Shown => s as Shown
function entryText(text: string, pairs: EntryPair[]): string | null {
  const got = new Set(pairs.filter(p => p.zh != null).map(p => zhAt(p.en, p.zh, text)).filter((x): x is string => !!x))
  return got.size === 1 ? [...got][0] : null
}

export async function display<T>(value: T, ctx: DisplayContext): Promise<DisplayResult<T>> {
  const paths = new Map<FrameText, string>()
  const collect = (node: unknown, path = ''): void => {
    if (Array.isArray(node)) { node.forEach((v, i) => collect(v, `${path}[${i}]`)); return }
    if (!node || typeof node !== 'object') return
    if (isFrameText(node)) {
      paths.set(node, path)
      if (node.$t === 'plugin') node.args?.forEach((v, i) => collect(v, `${path}.args[${i}]`))
      if (node.$t === 'join') node.parts.forEach((v, i) => collect(v, `${path}.parts[${i}]`))
      if ((node.$t === 'entry' || node.$t === 'value' || node.$t === 'system') && node.fallback) collect(node.fallback, `${path}.fallback`)
      return
    }
    Object.entries(node).filter(([key]) => key !== 'raw' && key !== 'author').forEach(([key, v]) => collect(v, path ? `${path}.${key}` : key))
  }
  collect(value)
  const leaves = [...paths.keys()]
  const resolved = new Map<FrameText, Resolution>()
  // 自动从完整结果收集请求；一个出口、一次提交，与条目种类无关。
  const queryOf = (l: FrameText): { query: TextQuery; reason: DisplayIssue['reason'] } | null => {
    switch (l.$t) {
      case 'system': return { query: { source: 'system', key: l.key }, reason: 'language-key-missing' }
      case 'author': return ctx.translate && l.at ? { query: { source: 'author', path: l.at }, reason: 'author-position-unresolved' } : null
      case 'value': return { query: { source: 'value', key: l.text, group: l.group }, reason: 'author-rule-unresolved' }
      case 'proficiency': return { query: { source: 'proficiency', key: l.key, count: l.count }, reason: 'author-rule-unresolved' }
      case 'requirement': return { query: { source: 'requirement', raw: ctx.requirementOf?.(l.key) }, reason: 'requirement-unavailable' }
      case 'entry': {
        if (!ctx.translate || !l.at) return null
        const raw = l.at.path.reduce<unknown>((v, k) => (v && typeof v === 'object' ? (v as Record<string | number, unknown>)[k] : undefined), ctx.entries?.[l.at.entry]?.zh)
        return typeof raw === 'string' && raw.trim() ? { query: { source: 'render', text: raw }, reason: 'entry-position-unresolved' } : null
      }
      default: return null
    }
  }
  const pending = leaves.flatMap(l => { const query = queryOf(l); return query ? [{ leaf: l, ...query }] : [] })
  const got = pending.length ? await ctx.author.resolve(pending.map(row => row.query)) : []
  pending.forEach((row, i) => resolved.set(row.leaf, { text: got[i] ?? null, reason: row.reason }))
  const names = leaves.filter((l): l is Extract<FrameText, { $t: 'name' }> => l.$t === 'name')
  const nameGot = await Promise.all(names.map(l => Promise.all(l.ids.map(id => ctx.namer(id)))))
  names.forEach((l, i) => {
    const labels = new Set(nameGot[i].map(hit => hit?.label).filter(Boolean))
    const complete = nameGot[i].length > 0 && nameGot[i].every(hit => !!hit?.label)
    resolved.set(l, { text: complete && labels.size === 1 ? [...labels][0]! : null, reason: labels.size > 1 ? 'ambiguous-name' : 'reference-unavailable' })
  })

  const issues: DisplayIssue[] = []
  const miss = (l: FrameText, reason: DisplayIssue['reason']): string => {
    const text = l.$t === 'requirement' ? `前置条件（${l.key}）` : 'text' in l ? l.text : ''
    issues.push({ text, kind: l.$t, reason, path: paths.get(l) ?? '', ...('key' in l ? { key: l.key } : {}), ...(l.$t === 'name' ? { ids: l.ids } : {}) })
    return text
  }
  const textOf = (l: FrameText): string => {
    const done = resolved.get(l)
    if (done?.text != null) return done.text
    switch (l.$t) {
      case 'library': case 'data': return l.text
      case 'entry': return ctx.translate ? entryText(l.text, ctx.pairs) ?? (l.fallback ? textOf(l.fallback) : miss(l, 'entry-position-unresolved')) : l.text
      case 'author': return ctx.translate ? miss(l, 'author-position-unresolved') : l.text
      case 'name': return ctx.translate && l.strict ? miss(l, done!.reason) : l.text
      case 'system': return ctx.translate ? (l.fallback ? textOf(l.fallback) : miss(l, 'language-key-missing')) : l.text
      case 'proficiency': return miss(l, 'author-rule-unresolved')
      case 'value': return l.fallback ? textOf(l.fallback) : miss(l, 'author-rule-unresolved')
      case 'requirement': return miss(l, 'requirement-unavailable')
      case 'plugin': return l.text.replace(/\{(\d+)\}/g, (_, i: string) => l.args?.[Number(i)] ? textOf(l.args[Number(i)]) : '')
      case 'join': return l.parts.map(textOf).filter(Boolean).join(l.sep)
    }
  }
  const rebuild = async (node: unknown): Promise<unknown> => {
    if (Array.isArray(node)) return Promise.all(node.map(rebuild))
    if (!node || typeof node !== 'object') return node
    if (isFrameText(node)) return mint(textOf(node))
    const src = node as Record<string, unknown>
    const out: Record<string, unknown> = {}
    for (const [key, v] of Object.entries(src)) out[key] = key === 'author' || key === 'raw' ? v : await rebuild(v)
    if (isId(src.author)) {
      const hit = await ctx.namer(src.author)
      if (hit) out.ref = hit.ref
    }
    return out
  }
  const shown = await rebuild(value) as Displayed<T>
  return { value: shown, missed: [...new Set(issues.map(i => i.text))], issues: [...new Map(issues.map(i => [JSON.stringify(i), i])).values()] }
}
