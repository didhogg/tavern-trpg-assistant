// 插件 ⇄ 作者小窗之间的传话格式（D2-P2 B1 设计 §7 A）。
// 只传作者对象和文件原文本身，不挑字段、不改名。

export const CHANNEL = 'trpg-library' as const

/** 小窗启动完成后报给插件的情况：作者程序的全局对象在不在、加载时有没有报错。 */
export interface FrameReady {
  channel: typeof CHANNEL
  type: 'ready'
  codeSet: string
  authorVersion: string | null
  present: Record<string, boolean>
  errors: string[]
}

export type FrameMessage = FrameReady

export function isFrameMessage(data: unknown): data is FrameMessage {
  return typeof data === 'object' && data !== null && (data as { channel?: unknown }).channel === CHANNEL
}
