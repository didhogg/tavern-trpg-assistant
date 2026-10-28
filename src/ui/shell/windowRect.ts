export interface Rect { x: number; y: number; w: number; h: number }

export const MIN_W = 360
export const MIN_H = 480
const KEY = 'trpg-assistant:window'

export function clampRect(rect: Rect, vw: number, vh: number): Rect {
  const w = Math.min(Math.max(rect.w, MIN_W), Math.max(MIN_W, vw))
  const h = Math.min(Math.max(rect.h, MIN_H), Math.max(MIN_H, vh))
  return {
    w,
    h,
    x: Math.min(Math.max(rect.x, 0), Math.max(0, vw - w)),
    y: Math.min(Math.max(rect.y, 0), Math.max(0, vh - h)),
  }
}

export function defaultRect(vw: number, vh: number): Rect {
  const w = Math.min(960, vw - 32)
  const h = Math.min(640, vh - 32)
  return clampRect({ w, h, x: Math.round((vw - w) / 2), y: Math.round((vh - h) / 2) }, vw, vh)
}

export function loadRect(vw: number, vh: number): Rect {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const value = JSON.parse(raw) as Rect
      if ([value.x, value.y, value.w, value.h].every(Number.isFinite)) return clampRect(value, vw, vh)
    }
  } catch (error) {
    console.warn('[trpg-assistant] 读取窗口位置失败', error)
  }
  return defaultRect(vw, vh)
}

export function saveRect(rect: Rect): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(rect))
  } catch (error) {
    console.warn('[trpg-assistant] 保存窗口位置失败', error)
  }
}
