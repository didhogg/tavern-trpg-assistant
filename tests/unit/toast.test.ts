import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { MAX_TOASTS, TOAST_MS, useToastStore } from '../../src/stores/toast'

describe('提示条', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    setActivePinia(createPinia())
  })
  afterEach(() => vi.useRealTimers())

  it('各类提示按规定时间自动消失（开发规范 §5.4）', () => {
    const toast = useToastStore()
    toast.success('已保存')
    toast.undoable('已删除', () => undefined)
    toast.error('下载失败')
    expect(toast.toasts).toHaveLength(3)
    vi.advanceTimersByTime(TOAST_MS.success - 1)
    expect(toast.toasts).toHaveLength(3)
    vi.advanceTimersByTime(1)
    expect(toast.toasts.map((t) => t.kind)).toEqual(['undo', 'error'])
    vi.advanceTimersByTime(TOAST_MS.undo - TOAST_MS.success)
    expect(toast.toasts.map((t) => t.kind)).toEqual(['error'])
    vi.advanceTimersByTime(TOAST_MS.error - TOAST_MS.undo)
    expect(toast.toasts).toHaveLength(0)
  })

  it('错误提示也会自动消失：没有任何类型常驻', () => {
    for (const ms of Object.values(TOAST_MS)) expect(ms).toBeLessThanOrEqual(8000)
  })

  it('同时最多 3 条，最旧的先走', () => {
    const toast = useToastStore()
    for (let i = 1; i <= MAX_TOASTS + 2; i++) toast.info(`第 ${i} 条`)
    expect(toast.toasts.map((t) => t.message)).toEqual(['第 3 条', '第 4 条', '第 5 条'])
  })

  it('悬停时暂停计时，离开后继续', () => {
    const toast = useToastStore()
    const id = toast.success('已保存')
    vi.advanceTimersByTime(3000)
    toast.pause(id)
    vi.advanceTimersByTime(60_000)
    expect(toast.toasts).toHaveLength(1)
    toast.resume(id)
    vi.advanceTimersByTime(TOAST_MS.success)
    expect(toast.toasts).toHaveLength(0)
  })

  it('点撤销：先关闭提示条，再执行撤销动作', async () => {
    const toast = useToastStore()
    const undo = vi.fn()
    const id = toast.undoable('已删除', undo)
    await toast.runUndo(id)
    expect(undo).toHaveBeenCalledOnce()
    expect(toast.toasts).toHaveLength(0)
  })
})
