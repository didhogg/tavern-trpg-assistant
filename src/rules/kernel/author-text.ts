// 统一取字入口：显示出口一批提交所有出处；这里隐藏两个小窗的调用及静态配置缓存。
// 作者配置仍由原有 valueLabels 自动识别；不登记种族、职业、熟练或装备的中文表。
import type { LibraryService } from '../../library/service'
import type { TextQuery } from '../../library/runtime/text-query'
export type { TextQuery }

export interface AuthorText { resolve(requests: TextQuery[]): Promise<Array<string | null>> }
const cache = new Map<string, string | null>()

export function authorTextFor(service: Pick<LibraryService, 'frameOf'>, codeSet: string,
  system: (keys: string[]) => Promise<Array<string | null>> = async keys => keys.map(() => null)) {
  const reader: AuthorText = { resolve: async requests => {
    const out: Array<string | null> = requests.map(() => null)
    const local = requests.map((q, i) => ({ q, i })).filter((row): row is { q: Extract<TextQuery, { source: 'system' }>; i: number } => row.q.source === 'system')
    if (local.length) { const got = await system(local.map(({ q }) => q.key)); local.forEach(({ i }, n) => { out[i] = got[n] ?? null }) }
    const pending = new Map<string, { q: Exclude<TextQuery, { source: 'system' }>; positions: number[] }>()
    requests.forEach((q, i) => {
      if (q.source === 'system') return
      const key = `${codeSet}\u0000${JSON.stringify(q)}`
      if (q.source !== 'requirement' && cache.has(key)) { out[i] = cache.get(key)!; return }
      const row = pending.get(key) ?? { q, positions: [] }; row.positions.push(i); pending.set(key, row)
    })
    if (pending.size) {
      const rows = [...pending]
      const got: Array<string | null> = await (await service.frameOf(codeSet)).call('authorTexts', rows.map(([, row]) => row.q))
      rows.forEach(([key, { q, positions }], n) => {
        const text = got[n] ?? null
        if (q.source !== 'requirement') cache.set(key, text)
        positions.forEach(i => { out[i] = text })
      })
    }
    return out
  } }
  // 已有库分类名调用的兼容方法；同样经过唯一批量命令，不另接通道。
  return { ...reader, labels: async (values: string[], kind?: 'category'): Promise<Record<string, string>> => {
    const got = await reader.resolve(values.map(key => ({ source: 'value', key, group: values, ...(kind ? { kind } : {}) })))
    return Object.fromEntries(values.flatMap((key, i) => got[i] ? [[key, got[i]!]] : []))
  } }
}
