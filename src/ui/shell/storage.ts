import type { Point } from './useDrag'

export function loadPoint(key: string, fallback: Point): Point {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const value = JSON.parse(raw) as Point
    return Number.isFinite(value.x) && Number.isFinite(value.y) ? value : fallback
  } catch (error) {
    console.warn('[trpg-assistant] 读取窗口位置失败', error)
    return fallback
  }
}

export function savePoint(key: string, value: Point): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.warn('[trpg-assistant] 保存窗口位置失败', error)
  }
}
