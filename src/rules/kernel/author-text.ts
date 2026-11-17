// 作者代码产出的显示文字，统一到本战役的作者小窗（中文战役 = 中文作者代码，英文战役 = 英文）取：
//   按编号：作者 Parser 的「编号 → 名字」表（小窗 valueLabels，和 P5.5 字段下拉同一个出口），例 币种 gp → 金币；
//   按位置：结算小窗在英文作者代码里找出的位置（frame/author-text.ts），小窗同一位置取文字，例 语言分组说明；
//   按原始数据渲染：作者自己的渲染函数（本战役语言的作者代码），例 前置条件。
// 取不到就原样显示，不写对照表。
import type { LibraryService } from '../../library/service'

export interface AuthorText {
  /** 一组编号 → 名字；作者没有覆盖这组编号的表 → 空表（调用方显示编号）。 */
  labels(values: string[], kind?: 'category'): Promise<Record<string, string>>
  /** 一组位置 → 文字；取不到的给 null。 */
  at(paths: string[][]): Promise<Array<string | null>>
  /** 一组原始前置条件（作者数据 prerequisite）→ 作者渲染的一句话；没有 / 渲染不出 → null。 */
  requirements(raws: unknown[]): Promise<Array<string | null>>
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
    requirements: async (raws) => {
      const live = raws.map((r, i) => [r, i] as const).filter(([r]) => Array.isArray(r) && r.length)
      if (!live.length) return raws.map(() => null)
      const got: Array<string | null> = await (await frame()).call('prerequisiteText', live.map(([r]) => r))
      const out: Array<string | null> = raws.map(() => null)
      live.forEach(([, i], n) => { out[i] = got[n] || null })
      return out
    },
  }
}
