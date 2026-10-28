import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ToastKind = 'success' | 'info' | 'undo' | 'error' | 'status'

export interface Toast {
  id: number
  kind: ToastKind
  message: string
  undo?: () => void | Promise<void>
}

/** 停留时间（毫秒）：开发规范 §5.4。 */
export const TOAST_MS: Record<ToastKind, number> = { success: 4000, info: 4000, undo: 6000, error: 8000, status: 6000 }
export const MAX_TOASTS = 3

interface Timer {
  handle: ReturnType<typeof setTimeout> | undefined
  remaining: number
  startedAt: number
}

/** 提示条：全部自动消失，悬停或聚焦时暂停计时，同时最多 3 条（新的在下，最旧的先走）。 */
export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([])
  const timers = new Map<number, Timer>()
  let nextId = 1

  function dismiss(id: number): void {
    const timer = timers.get(id)
    if (timer?.handle !== undefined) clearTimeout(timer.handle)
    timers.delete(id)
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  function start(id: number, ms: number): void {
    const timer: Timer = { handle: undefined, remaining: ms, startedAt: Date.now() }
    timer.handle = setTimeout(() => dismiss(id), ms)
    timers.set(id, timer)
  }

  function push(kind: ToastKind, message: string, undo?: () => void | Promise<void>): number {
    const id = nextId++
    toasts.value = [...toasts.value, { id, kind, message, undo }]
    while (toasts.value.length > MAX_TOASTS) dismiss(toasts.value[0].id)
    start(id, TOAST_MS[kind])
    return id
  }

  function pause(id: number): void {
    const timer = timers.get(id)
    if (!timer || timer.handle === undefined) return
    clearTimeout(timer.handle)
    timer.handle = undefined
    timer.remaining = Math.max(500, timer.remaining - (Date.now() - timer.startedAt))
  }

  function resume(id: number): void {
    const timer = timers.get(id)
    if (!timer || timer.handle !== undefined) return
    start(id, timer.remaining)
  }

  async function runUndo(id: number): Promise<void> {
    const toast = toasts.value.find((t) => t.id === id)
    dismiss(id)
    await toast?.undo?.()
  }

  const success = (message: string) => push('success', message)
  const info = (message: string) => push('info', message)
  const status = (message: string) => push('status', message)
  const undoable = (message: string, undo: () => void | Promise<void>) => push('undo', message, undo)
  const error = (message: string) => push('error', message)

  return { toasts, push, dismiss, pause, resume, runUndo, success, info, status, undoable, error }
})
