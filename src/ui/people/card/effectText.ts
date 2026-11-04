import type { PersonEffect } from '../../../schemas/people'

const UNIT: Record<string, string> = { round: '轮', minute: '分钟', hour: '小时', day: '天', turn: '回合' }
/** 人物效果时长的短写法：「1 分钟」「8 小时」「立即」「特殊」；没有就空。 */
export function durationText(duration: PersonEffect['duration']): string {
  if (!duration) return ''
  if (duration.type === 'instant') return '立即'
  if (duration.type === 'permanent') return '永久'
  if (duration.type === 'special') return '特殊'
  if (duration.amount === undefined) return ''
  return `${duration.amount} ${UNIT[duration.unit ?? ''] ?? duration.unit ?? ''}`.trim()
}
