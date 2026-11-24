// 显示文字的两种类型（结算小窗和主线共用，不含运行逻辑）：
//   FrameText —— 小窗交出的「一段文字从哪来」，不是成品，界面不能直接显示；
//   Shown     —— 过了显示出口（kernel/display.ts）的成品，只有那里能做出来。
// 给界面的结果用 Displayed<小窗结果>：里面的 FrameText 全部换成 Shown。直接塞一个英文字符串进去 → 类型检查不过。
// 来路只有这几种，每种都接现有的统一出口（不写对照表）：
//   system      实际语言键：出口重新查本战役小窗语言包，缺键记诊断；args = 作者模板句的空位（中文模板里的 {} 按顺序填）
//   library     本战役这边已经出好的字（库里条目的名字、作者小窗按编号取的名字）：本来就是本战役语言，原样用
//   entry       条目里的原文：英文版同编号条目里的位置 → 本战役语言版同一位置（locale.ts zhAt）；带 at = 已按作者编号定好位置，
//               取本战役语言版同一处的原文交作者渲染器（作者改写过的名字，例如去掉充能后缀的怪物动作，也能取到）
//   author      作者代码里写死的文字：英文作者代码里的位置 → 本战役作者小窗同一位置（library/texts.ts）
//   name        带作者完整编号的名字：编号 → 本战役库名；多个来源保留全部编号，只合并共同译名；取不到有 fallback 就按它取；
//               strict = text 是作者原文（不是语言包的字），取不到算没翻到
//   requirement 候选的前置条件：本战役库里生效的那一条的原始条件，交本战役的作者代码渲染（library/texts.ts）
//   proficiency 作者熟练分组键，交本战役作者的 getMappedAnyProficiency 渲染
//   value       同组作者配置编号，复用 valueLabels 取名（与编辑表单、币种同一入口）
//   data        原样数据（编号、作者写法节选）：不是句子，不翻译，原样显示
//   plugin      插件自己的说明句：text 里的 {0}{1}… 是参数，参数各按自己的来路取
//   join        几段文字用 sep 连起来，每段各按自己的来路取
import type { KernelRefFlags } from '../../core/saves/split'

export type FrameText =
  | { $t: 'system'; text: string; key: string; fallback?: FrameText; args?: FrameText[] }
  | { $t: 'library'; text: string }
  | { $t: 'entry'; text: string; fallback?: FrameText; at?: EntryAt }
  | { $t: 'author'; text: string; at: string[] | null }
  | { $t: 'name'; text: string; ids: KernelRefFlags[]; strict?: true; fallback?: FrameText }
  | { $t: 'proficiency'; text: string; key: string; count: number }
  | { $t: 'value'; text: string; group: string[]; fallback?: FrameText }
  | { $t: 'requirement'; key: string }
  | { $t: 'data'; text: string }
  | { $t: 'plugin'; text: string; args?: FrameText[] }
  | { $t: 'join'; parts: FrameText[]; sep: string }

/** 文字在第几个条目（主线交给小窗的条目顺序）里的哪个位置；有它就按位置取本战役语言版同一处，不再比对文字。 */
export interface EntryAt { entry: number; path: Array<string | number> }

declare const shownBrand: unique symbol
/** 过了显示出口的文字（本战役语言；取不到的显示原文并记进 missed）。 */
export type Shown = string & { readonly [shownBrand]: true }

/** 小窗结果 → 给界面的结果：每个 FrameText 换成 Shown，其余原样。 */
export type Displayed<T> = T extends FrameText ? Shown
  : T extends Array<infer U> ? Displayed<U>[]
  : T extends object ? { [K in keyof T]: Displayed<T[K]> }
  : T

export const isFrameText = (v: unknown): v is FrameText => !!v && typeof v === 'object' && typeof (v as { $t?: unknown }).$t === 'string'

// 小窗里标来路的写法（只做标记，不取字）
export const fromLibrary = (text: string): FrameText => ({ $t: 'library', text })
export const fromEntry = (text: string, fallback?: FrameText, at?: EntryAt): FrameText => ({ $t: 'entry', text, ...(fallback ? { fallback } : {}), ...(at ? { at } : {}) })
export const fromAuthor = (text: string, at: string[] | null): FrameText => ({ $t: 'author', text, at })
export function named(text: string, id: KernelRefFlags | KernelRefFlags[], strict = false): FrameText {
  const ids = [...new Map((Array.isArray(id) ? id : [id]).map(ref => [`${ref.propDroppable}|${ref.source?.toLowerCase()}|${ref.hash}`, ref])).values()]
  return { $t: 'name', text, ids, ...(strict ? { strict: true as const } : {}) }
}
/** 按编号取库名，取不到再按 fallback（例：作者自己生成、库里没有的物品 → dnd5e 语言包同原文的键）。 */
export const namedOr = (text: string, id: KernelRefFlags, fallback: FrameText | null): FrameText => (fallback ? { ...(named(text, id) as Extract<FrameText, { $t: 'name' }>), fallback } : named(text, id))
export const requirementOf = (key: string): FrameText => ({ $t: 'requirement', key })
export const asData = (text: string): FrameText => ({ $t: 'data', text })
export const plugin = (text: string, ...args: FrameText[]): FrameText => ({ $t: 'plugin', text, ...(args.length ? { args } : {}) })
export const joined = (parts: FrameText[], sep: string): FrameText => ({ $t: 'join', parts, sep })

export const proficiencyText = (key: string, count: number): FrameText => ({ $t: 'proficiency', text: key, key, count })
export const valueText = (text: string, group: string[], fallback?: FrameText): FrameText => ({ $t: 'value', text, group: [...new Set(group)], ...(fallback ? { fallback } : {}) })
