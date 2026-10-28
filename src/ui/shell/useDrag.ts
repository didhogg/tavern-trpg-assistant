import type { Ref } from 'vue'

export interface Point { x: number; y: number }

interface DragOptions {
  position: Ref<Point>
  size: () => { w: number; h: number }
  onTap?: () => void
  onEnd?: () => void
  threshold?: number
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), Math.max(min, max))
}

/** 指针拖动（鼠标与触屏通用）；位移不超过阈值视为点按。 */
export function useDrag(options: DragOptions) {
  const threshold = options.threshold ?? 5

  function onPointerDown(event: PointerEvent): void {
    if (event.button !== 0) return
    const button = (event.target as HTMLElement).closest('button')
    if (button && button !== event.currentTarget) return
    const handle = event.currentTarget as HTMLElement
    handle.setPointerCapture(event.pointerId)
    const startX = event.clientX
    const startY = event.clientY
    const origin = { ...options.position.value }
    let moved = false

    const onMove = (e: PointerEvent) => {
      const dx = e.clientX - startX
      const dy = e.clientY - startY
      if (!moved && Math.hypot(dx, dy) < threshold) return
      moved = true
      const { w, h } = options.size()
      options.position.value = {
        x: clamp(origin.x + dx, 0, window.innerWidth - w),
        y: clamp(origin.y + dy, 0, window.innerHeight - h),
      }
    }
    const onUp = (e: PointerEvent) => {
      handle.removeEventListener('pointermove', onMove)
      handle.removeEventListener('pointerup', onUp)
      handle.removeEventListener('pointercancel', onUp)
      if (handle.hasPointerCapture(e.pointerId)) handle.releasePointerCapture(e.pointerId)
      if (moved) options.onEnd?.()
      else options.onTap?.()
    }
    handle.addEventListener('pointermove', onMove)
    handle.addEventListener('pointerup', onUp)
    handle.addEventListener('pointercancel', onUp)
  }

  return { onPointerDown }
}
