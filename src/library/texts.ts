// 全局批量取字：作者配置、原文位置、规则文字和包语言键共用；业务不另开中文命令。
import type { AuthorTextQuery, TextQuery } from './runtime/text-query'
export type { TextQuery }
export interface TextReader { resolve(requests: TextQuery[]): Promise<Array<string | null>> }
type Frame = { call: (fn: 'authorTexts', requests: AuthorTextQuery[]) => Promise<Array<string | null>> }

export class TextService {
  private readonly cache = new Map<string, string | null>()
  constructor(private readonly frameOf: (codeSet: string) => Promise<Frame>,
    private readonly system: (codeSet: string, keys: string[]) => Promise<Array<string | null>>) {}

  reader(codeSet: string): TextReader { return { resolve: requests => this.resolve(codeSet, requests) } }
  async resolve(codeSet: string, requests: TextQuery[]): Promise<Array<string | null>> {
    const out: Array<string | null> = requests.map(() => null)
    const local = requests.map((q, i) => ({ q, i })).filter((row): row is { q: Extract<TextQuery, { source: 'system' }>; i: number } => row.q.source === 'system')
    const pending = new Map<string, { q: Exclude<TextQuery, { source: 'system' }>; positions: number[] }>()
    requests.forEach((q, i) => {
      if (q.source === 'system') return
      const key = `${codeSet}\u0000${JSON.stringify(q)}`
      if (q.source !== 'requirement' && this.cache.has(key)) { out[i] = this.cache.get(key)!; return }
      const row = pending.get(key) ?? { q, positions: [] }; row.positions.push(i); pending.set(key, row)
    })
    await Promise.all([
      (async () => { if (local.length) { const got = await this.system(codeSet, local.map(({ q }) => q.key)); local.forEach(({ i }, n) => { out[i] = got[n] ?? null }) } })(),
      (async () => {
        if (!pending.size) return
        const rows = [...pending]
        const got = await (await this.frameOf(codeSet)).call('authorTexts', rows.map(([, row]) => row.q))
        rows.forEach(([key, { q, positions }], n) => {
          const text = got[n] ?? null
          if (q.source !== 'requirement') this.cache.set(key, text)
          positions.forEach(i => { out[i] = text })
        })
      })(),
    ])
    return out
  }
  /** 作者配置的同组编号，编辑器、分类、币种等全部复用。 */
  async values(codeSet: string, groups: string[][], kind?: 'category'): Promise<Array<Record<string, string> | null>> {
    const requests = groups.flatMap(group => group.map(key => ({ source: 'value' as const, key, group, ...(kind ? { kind } : {}) })))
    const got = await this.resolve(codeSet, requests)
    let offset = 0
    return groups.map(group => {
      const pairs = group.flatMap((key, i) => got[offset + i] == null ? [] : [[key, got[offset + i]!]])
      offset += group.length
      return pairs.length ? Object.fromEntries(pairs) : null
    })
  }
}
