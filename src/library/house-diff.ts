// P5.5 B1：房规只记改动。作者 _copy 的合并规则（utils.js copyApplier.getCopy）：
//   _copy 条目里写了的顶层字段用这条的（覆盖原件）；写成 null 的删掉；没写的从原件抄。
// 所以房规 = { _copy 指向原件, 只放改过的顶层字段 }，删掉的字段写 null；原件以后更新，没改过的地方跟着变。
// 比较前两边都先经作者 DataUtil.cleanJson（小窗 cleanEntity）去掉运行时字段。
import { stableStringify } from '../core/hash'

/** 来源由房规自己定（插件的"我的房规"），不算改动。 */
const NOT_COMPARED = new Set(['source'])

/** 顶层逐个字段比：值变了的给新值，删掉的给 null；没变的不出现。 */
export function topLevelChanges(was: Record<string, unknown>, now: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const k of new Set([...Object.keys(was), ...Object.keys(now)])) {
    if (NOT_COMPARED.has(k) || k === '_copy') continue
    if (!(k in now) || now[k] === undefined) { if (k in was) out[k] = null; continue }
    if (!(k in was) || stableStringify(was[k]) !== stableStringify(now[k])) out[k] = now[k]
  }
  return out
}

export interface FieldChange {
  field: string
  /** 改之前（新加的字段为 undefined）。 */
  before: unknown
  /** 改之后；删掉的为 null。 */
  after: unknown
}

/** P5.5 阶段 C G1：保存前「这次改了哪几项」。和房规只记改动是同一个比较（topLevelChanges），按字段名排好。 */
export function fieldChanges(was: Record<string, unknown>, now: Record<string, unknown>): FieldChange[] {
  return Object.entries(topLevelChanges(was, now))
    .map(([field, after]) => ({ field, before: was[field], after }))
    .sort((a, b) => a.field.localeCompare(b.field))
}
