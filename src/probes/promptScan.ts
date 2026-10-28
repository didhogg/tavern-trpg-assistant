export const MARKER_COMMENT = 'TRPG-PROBE-COMMENT'
export const MARKER_INJECT = 'TRPG-PROBE-INJECT'

export interface ScanResult {
  length: number
  comment: boolean
  /** 注释的 <!-- 与 --> 是否原样保留 */
  commentIntact: boolean
  inject: boolean
  commentSnippet?: string
  injectSnippet?: string
  /** 注入文本所在的消息角色与距末尾的位置（仅对话补全格式） */
  injectAt?: { role: string; indexFromEnd: number }
}

function safeStringify(payload: unknown): string {
  if (typeof payload === 'string') return payload
  try {
    return JSON.stringify(payload) ?? ''
  } catch (error) {
    console.error('[trpg-assistant] 请求内容无法序列化', error)
    return ''
  }
}

function snippet(text: string, marker: string): string | undefined {
  const index = text.indexOf(marker)
  if (index < 0) return undefined
  return text.slice(Math.max(0, index - 6), index + marker.length + 12)
}

function locateInChat(payload: unknown, marker: string): { role: string; indexFromEnd: number } | undefined {
  const chat = (payload as { chat?: unknown })?.chat
  if (!Array.isArray(chat)) return undefined
  for (let i = 0; i < chat.length; i++) {
    const item = chat[i] as { role?: string; content?: unknown }
    const content = typeof item?.content === 'string' ? item.content : safeStringify(item?.content)
    if (content.includes(marker)) {
      return { role: String(item.role ?? '?'), indexFromEnd: chat.length - 1 - i }
    }
  }
  return undefined
}

export function scanPayload(payload: unknown): ScanResult {
  const text = safeStringify(payload)
  return {
    length: text.length,
    comment: text.includes(MARKER_COMMENT),
    commentIntact: text.includes(`<!--${MARKER_COMMENT}`) && text.includes('-->'),
    inject: text.includes(MARKER_INJECT),
    commentSnippet: snippet(text, MARKER_COMMENT),
    injectSnippet: snippet(text, MARKER_INJECT),
    injectAt: locateInChat(payload, MARKER_INJECT),
  }
}
