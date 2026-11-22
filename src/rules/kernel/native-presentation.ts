import type { EntryRef, EntrySelection } from '../../library/scopes'

export interface NativeLabel {
  name: string
  ref: EntryRef
  selection?: EntrySelection
}

export interface NativePresentation {
  /** 与作者建卡器使用同一个编号。仅供显示和打开资料卡。 */
  labels: Record<string, Record<string, NativeLabel>>
  /** 旧控件中只有名称、没有条目编号时，仅用一致且无歧义的对照。 */
  terms: Record<string, string>
}

/** 建卡右栏的资料卡：库里同一张卡的只读排版（inertMarkup 清过）。 */
export interface NativeCardPreview {
  html: string
  chinese: boolean
}
