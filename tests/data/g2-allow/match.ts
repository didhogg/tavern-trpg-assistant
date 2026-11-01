import type { Allow } from './types'

/**
 * 一个变化（条目 id、条目类型、路径）归哪些放行规则：
 *  - 写了精确 `ids` 的规则**各自都算**命中（不同子站可以先后改同一条目的同一路径，各自的 expect 都按自己的条目数）；
 *  - 只有没有任何 ids 规则管它时，才轮到按 `type` 的规则，且只算列表里第一条（宽规则不会抢走 ids 点名的条目）；
 *  - 都没有 = 没有放行（返回空数组）。
 */
export function attribute(allow: Allow[], id: string, type: string, path: string): Allow[] {
  const byIds = allow.filter((a) => a.ids?.includes(id) && a.path.test(path))
  if (byIds.length) return byIds
  const byType = allow.find((a) => !a.ids && a.type === type && a.path.test(path))
  return byType ? [byType] : []
}
