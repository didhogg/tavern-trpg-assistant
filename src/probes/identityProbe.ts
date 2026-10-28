import { eventName, onEvent } from '../host/context'
import type { StContext } from '../host/types'
import { setResult } from './store'
import type { ProbeModule } from './types'

const ID = 'identity'
const TITLE = '角色卡 / 群组 / 聊天标识'

function snapshot(ctx: StContext): Record<string, unknown> {
  const character = ctx.characterId !== undefined ? ctx.characters?.[Number(ctx.characterId)] : undefined
  return {
    characterId: ctx.characterId ?? null,
    characterName: character?.name ?? null,
    avatarFile: character?.avatar ?? null,
    groupId: ctx.groupId ?? null,
    chatId: ctx.getCurrentChatId?.() ?? ctx.chatId ?? null,
    chatLength: ctx.chat?.length ?? 0,
    chatMetadataKeys: Object.keys(ctx.chatMetadata ?? {}).length,
    user: ctx.name1 ?? null,
  }
}

export function createIdentityProbe(ctx: StContext): ProbeModule {
  const seen: Array<Record<string, unknown>> = []
  const refresh = () => {
    const current = snapshot(ctx)
    const key = JSON.stringify([current.characterId, current.groupId, current.chatId])
    if (!seen.some((s) => s.key === key)) seen.push({ key, ...current })
    const kind = current.groupId ? '群组聊天' : current.characterId !== null ? '角色卡聊天' : '没有打开聊天'
    setResult(ID, TITLE, 'info', `当前：${kind}；已观察 ${seen.length} 种上下文`, { current, observed: seen })
  }
  return {
    id: ID,
    title: TITLE,
    hint: '在角色卡聊天、群组聊天、未打开聊天三种状态之间切换，观察标识是否都能取到。',
    actions: [{ label: '刷新', run: refresh }],
    start: () => {
      refresh()
      onEvent(ctx, eventName(ctx, 'CHAT_CHANGED', 'chat_id_changed'), refresh)
    },
  }
}
