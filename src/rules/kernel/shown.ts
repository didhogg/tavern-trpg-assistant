// 显示文字的两种类型（结算小窗和主线共用，不含运行逻辑）：
//   FrameText —— 小窗交出的「一段文字从哪来」，不是成品，界面不能直接显示；
//   Shown     —— 过了显示出口（kernel/display.ts）的成品，只有那里能做出来。
// 给界面的结果用 Displayed<小窗结果>：里面的 FrameText 全部换成 Shown。直接塞一个英文字符串进去 → 类型检查不过。
// 来路只有这几种，每种都接现有的统一出口（不写对照表）：
//   system      dnd5e 语言包出的字：小窗按本战役语言包出字，已经是本战役语言，原样用
//   library     本战役这边已经出好的字（库里条目的名字、作者小窗按编号取的名字）：本来就是本战役语言，原样用
//   entry       条目里的原文：英文版同编号条目里的位置 → 本战役语言版同一位置（locale.ts zhAt）
//   author      作者代码里写死的文字：英文作者代码里的位置 → 本战役作者小窗同一位置（author-text.ts）
//   name        带作者编号的名字：编号 → 本战役库里这一条的名字（naming.ts）；取不到用 text（dnd5e 语言包出的字）；
//               strict = text 是作者原文（不是语言包的字），取不到算没翻到
//   requirement 候选的前置条件：本战役库里生效的那一条的原始条件，交本战役的作者代码渲染（author-text.ts）
//   data        原样数据（编号、作者写法节选）：不是句子，不翻译，原样显示
//   plugin      插件自己的说明句：text 里的 {0}{1}… 是参数，参数各按自己的来路取
//   join        几段文字用 sep 连起来，每段各按自己的来路取
import type { KernelRefFlags } from '../../core/saves/split'

export type FrameText =
  | { $t: 'system'; text: string }
  | { $t: 'library'; text: string }
  | { $t: 'entry'; text: string }
  | { $t: 'author'; text: string; at: string[] | null }
  | { $t: 'name'; text: string; id: KernelRefFlags; strict?: true }
  | { $t: 'requirement'; key: string }
  | { $t: 'data'; text: string }
  | { $t: 'plugin'; text: string; args?: FrameText[] }
  | { $t: 'join'; parts: FrameText[]; sep: string }

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
export const sys = (text: string): FrameText => ({ $t: 'system', text })
export const fromLibrary = (text: string): FrameText => ({ $t: 'library', text })
export const fromEntry = (text: string): FrameText => ({ $t: 'entry', text })
export const fromAuthor = (text: string, at: string[] | null): FrameText => ({ $t: 'author', text, at })
export const named = (text: string, id: KernelRefFlags, strict = false): FrameText => ({ $t: 'name', text, id, ...(strict ? { strict: true as const } : {}) })
export const requirementOf = (key: string): FrameText => ({ $t: 'requirement', key })
export const asData = (text: string): FrameText => ({ $t: 'data', text })
export const plugin = (text: string, ...args: FrameText[]): FrameText => ({ $t: 'plugin', text, ...(args.length ? { args } : {}) })
export const joined = (parts: FrameText[], sep: string): FrameText => ({ $t: 'join', parts, sep })
