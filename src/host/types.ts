export type EventHandler = (...args: unknown[]) => void

export interface EventSourceLike {
  on(name: string, handler: EventHandler): void
  removeListener?(name: string, handler: EventHandler): void
  off?(name: string, handler: EventHandler): void
}

export interface ChatMessage {
  mes?: string
  is_user?: boolean
  name?: string
  extra?: Record<string, unknown>
}

/** SillyTavern getContext() 中本项目用到的最小子集；其余字段按 unknown 处理。 */
export interface StContext {
  eventSource: EventSourceLike
  event_types: Record<string, string>
  extensionSettings: Record<string, unknown>
  saveSettingsDebounced: () => void
  setExtensionPrompt?: (
    key: string,
    value: string,
    position: number,
    depth: number,
    scan: boolean,
    role: number,
  ) => void
  extension_prompt_types?: Record<string, number>
  extension_prompt_roles?: Record<string, number>
  chat: ChatMessage[]
  characterId?: string | number
  characters?: Array<{ name?: string; avatar?: string }>
  groupId?: string | null
  groups?: Array<{ id: string; name?: string }>
  chatId?: string
  getCurrentChatId?: () => string | undefined
  name1?: string
  name2?: string
  chatMetadata?: Record<string, unknown>
  [key: string]: unknown
}

export interface TauriTavernHost {
  ready?: Promise<unknown>
  api?: Record<string, unknown>
}
