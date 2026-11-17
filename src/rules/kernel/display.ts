// 显示出口（建卡选项、起始装备交给界面之前必须经过这里，一处）：小窗交回的结果里每段 FrameText（shown.ts）
// 按它的来路接现有出口换成本战役语言的成品 Shown；其余数据原样。界面拿到的结果类型是 Displayed<…>，
// 文字字段只能是 Shown —— 只有本文件能做出 Shown（守卫测试 display-guard 查这一点）。
// 取不到（位置不唯一、库里没有、作者代码没有这段）就显示原文，记进 missed，语言审计按它数，不悄悄放行。
import type { KernelRefFlags } from '../../core/saves/split'
import type { AuthorText } from './author-text'
import { zhAt, type EntryPair } from './locale'
import type { Namer } from './naming'
import { isFrameText, type Displayed, type FrameText, type Shown } from './shown'

export interface DisplayContext {
  /** 本战役语言和小窗出字的语言不同（中文战役）= 条目原文、作者代码文字要换。 */
  translate: boolean
  /** 同编号条目的英文 / 本战役语言两份（条目原文按位置换）。 */
  pairs: EntryPair[]
  namer: Namer
  author: AuthorText
  /** 候选编号 → 本战役库里生效的那一条的原始前置条件（没有 = undefined）。 */
  requirementOf?: (key: string) => unknown
}
export interface DisplayResult<T> { value: Displayed<T>; missed: string[] }

const isId = (v: unknown): v is KernelRefFlags => !!v && typeof v === 'object' && typeof (v as KernelRefFlags).hash === 'string'
const mint = (s: string): Shown => s as Shown

/** 条目原文：所有同编号条目里按位置找，几份给出同一个译文才算（和原 localizeAll 同一规则）。 */
function entryText(text: string, pairs: EntryPair[]): string | null {
  const got = new Set(pairs.filter((p) => p.zh !== null && p.zh !== undefined).map((p) => zhAt(p.en, p.zh, text)).filter((x): x is string => !!x))
  return got.size === 1 ? [...got][0] : null
}

export async function display<T>(value: T, ctx: DisplayContext): Promise<DisplayResult<T>> {
  const leaves: FrameText[] = []
  const collect = (node: unknown): void => {
    if (Array.isArray(node)) { node.forEach(collect); return }
    if (!node || typeof node !== 'object') return
    if (isFrameText(node)) {
      leaves.push(node)
      if (node.$t === 'plugin') node.args?.forEach(collect)
      if (node.$t === 'join') node.parts.forEach(collect)
      return
    }
    Object.values(node).forEach(collect)
  }
  collect(value)

  // 批量取：作者代码位置、前置条件、名字
  const authorLeaves = leaves.filter((l): l is Extract<FrameText, { $t: 'author' }> => l.$t === 'author' && !!l.at && ctx.translate)
  const authorGot = await ctx.author.at(authorLeaves.map((l) => l.at!))
  const reqLeaves = leaves.filter((l): l is Extract<FrameText, { $t: 'requirement' }> => l.$t === 'requirement')
  const reqRaw = reqLeaves.map((l) => ctx.requirementOf?.(l.key))
  const reqGot = await ctx.author.requirements(reqRaw)
  const nameLeaves = leaves.filter((l): l is Extract<FrameText, { $t: 'name' }> => l.$t === 'name')
  const nameGot = await Promise.all(nameLeaves.map((l) => ctx.namer(l.id)))

  const missed: string[] = []
  const resolved = new Map<FrameText, string>()
  const miss = (text: string): string => { missed.push(text); return text }
  authorLeaves.forEach((l, i) => resolved.set(l, authorGot[i] ?? miss(l.text)))
  reqLeaves.forEach((l, i) => resolved.set(l, reqGot[i] ?? miss(`前置条件（${l.key}）`)))
  nameLeaves.forEach((l, i) => resolved.set(l, nameGot[i]?.label || (l.strict && ctx.translate ? miss(l.text) : l.text)))
  const textOf = (l: FrameText): string => {
    const done = resolved.get(l)
    if (done !== undefined) return done
    switch (l.$t) {
      case 'system': case 'library': case 'data': return l.text
      case 'entry': return ctx.translate ? entryText(l.text, ctx.pairs) ?? miss(l.text) : l.text
      case 'author': return ctx.translate ? miss(l.text) : l.text // 没有位置：作者代码里找不到这段
      case 'plugin': return l.text.replace(/\{(\d+)\}/g, (_, i: string) => (l.args?.[Number(i)] ? textOf(l.args[Number(i)]) : ''))
      case 'join': return l.parts.map(textOf).filter(Boolean).join(l.sep)
      default: return ''
    }
  }

  // 换成品：FrameText → Shown；带作者编号（author 字段）的节点补上库里的 ref（原 nameAll 的另一半）
  const refs = new Map<KernelRefFlags, Awaited<ReturnType<Namer>>>()
  nameLeaves.forEach((l, i) => refs.set(l.id, nameGot[i]))
  const rebuild = async (node: unknown): Promise<unknown> => {
    if (Array.isArray(node)) return Promise.all(node.map(rebuild))
    if (!node || typeof node !== 'object') return node
    if (isFrameText(node)) return mint(textOf(node))
    const src = node as Record<string, unknown>
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(src)) out[k] = k === 'author' || k === 'raw' ? v : await rebuild(v)
    if (isId(src.author)) {
      const hit = refs.has(src.author) ? refs.get(src.author) : await ctx.namer(src.author)
      if (hit) out.ref = hit.ref
    }
    return out
  }
  return { value: await rebuild(value) as Displayed<T>, missed: [...new Set(missed)] }
}
