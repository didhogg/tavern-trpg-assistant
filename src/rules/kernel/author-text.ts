// 作者代码产出的显示文字，统一到本战役的作者小窗（中文战役 = 中文作者代码，英文战役 = 英文）取：
//   按编号：作者 Parser 的「编号 → 名字」表（小窗 valueLabels，和 P5.5 字段下拉同一个出口），例 币种 gp → 金币；
//   按位置：结算小窗在英文作者代码里找出的位置（frame/author-text.ts），小窗同一位置取文字，例 语言分组说明。
// 取不到就原样显示，不写对照表。
import type { LibraryService } from '../../library/service'

export interface AuthorText {
  /** 一组编号 → 名字；作者没有覆盖这组编号的表 → 空表（调用方显示编号）。 */
  labels(values: string[], kind?: 'category'): Promise<Record<string, string>>
  /** 一组位置 → 文字；取不到的给 null。 */
  at(paths: string[][]): Promise<Array<string | null>>
}

/** 作者代码里的文字一次会话里不变：按「代码语言 + 位置」记住，建卡每次刷新不用再问小窗。 */
const atCache = new Map<string, string | null>()

export function authorTextFor(service: Pick<LibraryService, 'frameOf'>, codeSet: string): AuthorText {
  const frame = () => service.frameOf(codeSet)
  const keyOf = (path: string[]) => `${codeSet}\u0000${path.join('\u0000')}`
  return {
    labels: async (values, kind) => (values.length ? ((await (await frame()).call('valueLabels', [values], kind))[0] ?? {}) : {}),
    at: async (paths) => {
      const missing = paths.filter((p) => !atCache.has(keyOf(p)))
      if (missing.length) { const got = await (await frame()).call('authorAt', missing); missing.forEach((p, i) => atCache.set(keyOf(p), got[i] ?? null)) }
      return paths.map((p) => atCache.get(keyOf(p)) ?? null)
    },
  }
}

type Hinted = { hints?: Array<{ text: string; at: string[] | null }>; hint?: string }
/** 建卡选项里每一步的说明：有作者位置的按位置取本战役语言的文字，其余原样；合成 hint 一行一句。原样交回 items。 */
export async function localizeHints<T>(items: T, text: AuthorText): Promise<T> {
  const steps = (items as Array<{ steps: Hinted[] }>).flatMap((i) => i.steps).filter((s) => s.hints?.length)
  const lines = steps.flatMap((s) => s.hints!)
  const found = await text.at(lines.filter((l) => l.at).map((l) => l.at!))
  let n = 0
  const shown = new Map(lines.map((l) => [l, l.at ? found[n++] ?? l.text : l.text]))
  for (const s of steps) { s.hint = s.hints!.map((l) => shown.get(l)).join('\n'); delete s.hints }
  return items
}
