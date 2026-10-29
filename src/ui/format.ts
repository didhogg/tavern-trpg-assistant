import type { SaveSlot } from '../schemas/campaign'

const pad = (n: number) => String(n).padStart(2, '0')

/** 10月28日 13:05 */
export function formatTime(ms: number): string {
  const d = new Date(ms)
  return `${d.getMonth() + 1}月${d.getDate()}日 ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function formatClock(ms: number): string {
  const d = new Date(ms)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1).replace(/\.0$/, '')}MB`
  if (bytes >= 1024) return `${Math.round(bytes / 1024)}KB`
  return `${bytes}B`
}

/** 存档摘要行：队伍前 3 名 · 地点 · 轮次。 */
export function summaryLine(save: SaveSlot): string {
  const { partyNames, location, round } = save.summary
  const parts = [partyNames.slice(0, 3).join('、'), location, round ? `第 ${round} 轮` : ''].filter(Boolean)
  return parts.join(' · ')
}

export function errorText(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}
