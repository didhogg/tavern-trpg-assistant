import { eventName, onEvent } from '../host/context'
import type { StContext } from '../host/types'
import { setResult } from './store'
import type { ProbeModule } from './types'

const ID = 'events'
const TITLE = '聊天事件'
const WATCHED: Array<[string, string]> = [
  ['CHAT_CHANGED', 'chat_id_changed'],
  ['MESSAGE_SENT', 'message_sent'],
  ['MESSAGE_RECEIVED', 'message_received'],
  ['MESSAGE_SWIPED', 'message_swiped'],
  ['MESSAGE_EDITED', 'message_edited'],
  ['MESSAGE_DELETED', 'message_deleted'],
  ['GENERATION_STARTED', 'generation_started'],
  ['GENERATION_ENDED', 'generation_ended'],
]

export function createEventsProbe(ctx: StContext): ProbeModule {
  const counts: Record<string, number> = {}
  const log: Array<{ at: string; event: string; args: string }> = []
  const publish = () => {
    const missing = WATCHED.map(([key]) => key).filter((key) => !counts[key])
    setResult(ID, TITLE, 'info', missing.length ? `尚未观察到：${missing.join('、')}` : '全部事件都已观察到', {
      counts,
      recent: log.slice(-30),
    })
  }
  return {
    id: ID,
    title: TITLE,
    hint: '依次做：发送消息、等回复、切换回复（左右箭头）、编辑一条消息、删除一条消息、切换聊天，观察事件是否都能收到。',
    actions: [{ label: '刷新', run: publish }],
    start: () => {
      for (const [key, fallback] of WATCHED) {
        onEvent(ctx, eventName(ctx, key, fallback), (...args) => {
          counts[key] = (counts[key] ?? 0) + 1
          log.push({ at: new Date().toISOString(), event: key, args: JSON.stringify(args).slice(0, 120) })
          publish()
        })
      }
      publish()
    },
  }
}
