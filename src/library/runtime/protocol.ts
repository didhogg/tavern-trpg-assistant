// 插件 ⇄ 作者小窗之间的传话格式（D2-P2 B1 设计 §7 A）。
// 只传文件原文和作者存储的值本身，不挑字段、不改名。
// 注意：小窗里的 frame/early.ts 是普通脚本、不能 import，它按同样的格式手写了一份，改这里要同步改那里。

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

/** 小窗 → 插件：作者程序要一个文件，或要读写它自己的存储。 */
export type FrameRequestBody =
  | { op: 'file'; path: string }
  | { op: 'kv-get'; key: string }
  | { op: 'kv-set'; key: string; value: unknown }
  | { op: 'kv-remove'; key: string }

export type FrameRequest = { channel: typeof CHANNEL; type: 'request'; id: number } & FrameRequestBody

/** 插件 → 小窗：回答。文件不存在时 ok=true、value=null（作者程序自己按"没有这个文件"处理）。 */
export interface FrameResponse {
  channel: typeof CHANNEL
  type: 'response'
  id: number
  ok: boolean
  value?: unknown
  error?: string
}

export type FrameMessage = FrameReady | FrameRequest | FrameResponse

export function isFrameMessage(data: unknown): data is FrameMessage {
  return typeof data === 'object' && data !== null && (data as { channel?: unknown }).channel === CHANNEL
}
