// P5.5 C8 / C9：双语编辑里的两件纯计算（不读库、不写库）。
// C8 从另一语言填入：「只填空着的 / 全部换掉」各会改哪几项，以及按选的那种填好的条目。
//    名字规则照作者中文版（中文条目用 ENG_name 记英文名）：英文 → 中文时英文 name 填进中文的 ENG_name，不覆盖中文 name；
//    中文 → 英文时用中文条目的 ENG_name 当英文 name。来源、编号由所在的包定，不填。
// C9 两边对不上的「不用翻译的字段」：按字段表的控件形状，数字 / 开关 / 下拉 / 多选（以及只由这些组成的一组、几个）算不用翻译。
import type { FieldShape } from './brew-validate'
import { fieldChanges, type FieldChange } from './house-diff'
import { stableStringify } from '../core/hash'

export type Lang = 'zh' | 'en'
type Ent = Record<string, unknown>

/** 不跟着另一语言走的字段：来源、页码、编号这些由包和条目自己定。 */
const OWN = new Set(['source', 'page', 'uniqueId', 'ENG_name', 'translator', 'name'])

const isEmpty = (v: unknown): boolean => v === undefined || v === null || v === '' || (Array.isArray(v) && !v.length) || (typeof v === 'object' && v !== null && !Array.isArray(v) && !Object.keys(v).length)

export interface FillPlan {
  /** 只填空着的：会改哪几项。 */
  onlyEmpty: FieldChange[]
  /** 全部换成另一语言的：会改哪几项（含已经填了的）。 */
  all: FieldChange[]
}

/** 按选的方式填好的条目（current 不改，返回新的）。to = 正在编辑的这一边的语言。 */
export function fillFrom(current: Ent, other: Ent, to: Lang, mode: 'onlyEmpty' | 'all'): Ent {
  const out: Ent = { ...current }
  for (const [k, v] of Object.entries(other)) {
    if (OWN.has(k) || k.startsWith('_')) continue
    if (mode === 'all' || isEmpty(out[k])) out[k] = structuredClone(v)
  }
  // 名字（作者中文版规矩）
  if (to === 'zh') {
    if (typeof other.name === 'string' && (mode === 'all' || isEmpty(out.ENG_name))) out.ENG_name = other.name
  } else if (typeof other.ENG_name === 'string' && (mode === 'all' || isEmpty(out.name))) {
    out.name = other.ENG_name
  }
  return out
}

/** 两种填法各会改哪几项（字段名、改前、改后），保存确认 / 填入确认用。 */
export function fillPlan(current: Ent, other: Ent, to: Lang): FillPlan {
  return {
    onlyEmpty: fieldChanges(current, fillFrom(current, other, to, 'onlyEmpty')),
    all: fieldChanges(current, fillFrom(current, other, to, 'all')),
  }
}

const NEUTRAL = new Set(['number', 'switch', 'select', 'multiselect', 'const'])

/** 这个形状是不是「不用翻译」：数字 / 开关 / 下拉 / 多选，或者只由它们组成的一组、几个。 */
export function isLanguageNeutral(shape: FieldShape | undefined, defs: Record<string, FieldShape>, seen = new Set<string>()): boolean {
  if (!shape) return false
  if ('ref' in shape) {
    if (seen.has(shape.ref)) return false
    seen.add(shape.ref)
    return isLanguageNeutral(defs[shape.ref], defs, seen)
  }
  if (NEUTRAL.has(shape.c)) return true
  if (shape.c === 'list' || shape.c === 'map') return isLanguageNeutral(shape.of, defs, seen)
  if (shape.c === 'group') return shape.props.length > 0 && shape.props.every((p) => isLanguageNeutral(p.shape, defs, seen))
  return false
}

/** 两边都填了、但不一样的「不用翻译的字段」（只看顶层字段）。 */
export function neutralMismatches(a: Ent, b: Ent, fields: Array<{ name: string; shape?: FieldShape }>, defs: Record<string, FieldShape>): string[] {
  return fields
    .filter((f) => isLanguageNeutral(f.shape, defs) && !isEmpty(a[f.name]) && !isEmpty(b[f.name]) && stableStringify(a[f.name]) !== stableStringify(b[f.name]))
    .map((f) => f.name)
}
