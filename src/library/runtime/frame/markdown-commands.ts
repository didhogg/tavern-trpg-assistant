// P5.5 §16.7 第 2 条：正文 ⇄ Markdown，全用作者的程序（frame.html 已加载 render-markdown.js）。
// - 正文 → Markdown：作者 RendererMarkdown（render-markdown.js 第 960 行的用法 render({entries})）。
//   标签（{@spell …}、{@dice …}）按作者的「ignore」模式原样留在文字里（_renderString 的 ignore 分支），来回转不丢链接；
//   不改作者设置（VetoolsConfig.set 会存进浏览器），只在这个渲染器实例上用 ignore 的写法。
// - Markdown → 正文：作者 MarkdownConverter.getEntries（转换器 ConverterEntries.doParseMarkdown 用的同一个），
//   再照作者编辑器的做法给新写的骰子加标签（makebrew-builderui.js fnPostProcessDice → DiceConvert.getTaggedEntry）。
/* eslint-disable @typescript-eslint/no-explicit-any -- 作者程序是没有类型的 JS，这里只做转调 */
import { A, init } from './author'

const mod = (path: string): Promise<any> => import(/* @vite-ignore */ new URL(`js/${path}`, location.href).href)

export async function entriesToMarkdown(entries: unknown[]): Promise<string> {
  await init()
  const r = A.RendererMarkdown.get()
  // 作者 ignore 模式：字符串原样写出（含标签）
  r._renderString = (entry: string, textStack: string[]) => { textStack[0] += entry }
  return String(r.render({ entries: A.MiscUtil.copyFast(entries) }) ?? '').trim()
}

export async function markdownToEntries(md: string): Promise<unknown[]> {
  await init()
  const entries: unknown[] = A.MarkdownConverter.getEntries(md)
  const { DiceConvert } = await mod('converter/converterutils-tags.js')
  return entries.map((e) => DiceConvert.getTaggedEntry(e))
}

/** 比内容不比键的顺序（补回的键排在后面）。 */
const stable = (x: unknown): unknown => (Array.isArray(x) ? x.map(stable) : x && typeof x === 'object' ? Object.fromEntries(Object.keys(x).sort().map((k) => [k, stable((x as Record<string, unknown>)[k])])) : x)
const same = (a: unknown, b: unknown): boolean => JSON.stringify(stable(a)) === JSON.stringify(stable(b))
/** 转回来时作者转换器没写出的键（同类型时）从原来那一段补回（例如中文版的 ENG_name、列表的 style），不改写出来的。 */
function keepLost(back: unknown, was: unknown): unknown {
  if (!back || !was || typeof back !== 'object' || typeof was !== 'object' || Array.isArray(back) || Array.isArray(was)) return back
  const b = back as Record<string, unknown>, w = was as Record<string, unknown>
  if (b.type !== w.type) return back
  const out: Record<string, unknown> = { ...b }
  for (const [k, v] of Object.entries(w)) if (!(k in out)) out[k] = v
  return out
}

/**
 * 正文的一段（不是纯文字的那种：小标题段、列表、表格……）能不能用 Markdown 改：
 * 转成 Markdown 再用作者转换器转回来，和原来一模一样（补回作者转换器不写的键之后）才给 Markdown；否则给 null（这一段在 JSON 里改）。
 */
export async function blockMarkdown(block: unknown): Promise<string | null> {
  const md = await entriesToMarkdown([block])
  try {
    const back: unknown[] = A.MarkdownConverter.getEntries(md)
    return back.length === 1 && same(keepLost(back[0], block), block) ? md : null
  } catch (e) {
    // 作者转换器转不回来（例如小标题层级对不上）= 这一段不能用 Markdown 改
    console.debug('[trpg-assistant] 这一段转不回来，留给 JSON', e)
    return null
  }
}

/** Markdown → 正文的几段；was = 改之前的那一段（只有一段、类型没变时补回作者转换器不写的键）。 */
export async function markdownBlocks(md: string, was?: unknown): Promise<unknown[]> {
  const out = await markdownToEntries(md)
  return out.length === 1 && was !== undefined ? [keepLost(out[0], was)] : out
}
