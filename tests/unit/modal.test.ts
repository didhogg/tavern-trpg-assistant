import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useModalStore, type ModalPage } from '../../src/stores/modal'

const page = (key: string, extra: Partial<ModalPage> = {}): ModalPage => ({ key, title: key, component: {}, ...extra })

describe('弹窗页面栈', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('弹窗内前进是入栈，返回是出栈，始终只有一个弹窗', () => {
    const modal = useModalStore()
    modal.open(page('a'))
    modal.push(page('b'))
    modal.push(page('c'))
    expect(modal.depth).toBe(3)
    modal.pop()
    expect(modal.top?.key).toBe('b')
    expect(modal.isOpen).toBe(true)
  })

  it('弹窗开着时再 open = 在弹窗里前进一页（驾驶员 11-25：弹窗上再弹只在当前弹窗里换页）', () => {
    const modal = useModalStore()
    modal.open(page('a'))
    modal.push(page('b'))
    modal.open(page('c'))
    expect(modal.stack.map((p) => p.key)).toEqual(['a', 'b', 'c'])
  })

  it('openApp（存档、开局向导）总是另起，先关旧的、不叠加，哪一页都显示', async () => {
    const modal = useModalStore()
    const ui = (await import('../../src/stores/ui')).useUiStore()
    const left = vi.fn()
    modal.open(page('a', { onLeave: left }))
    modal.push(page('b'))
    modal.openApp(page('saves'))
    expect(modal.stack.map((p) => p.key)).toEqual(['saves'])
    expect(left).toHaveBeenCalledOnce()
    ui.page = ui.page === 'home' ? 'library' : 'home'
    expect(modal.visible).toBe(true)
  })

  it('弹窗属于打开它的页：切到别的页藏起来、状态不变；在别的页 open 才换成新弹窗', async () => {
    const modal = useModalStore()
    const ui = (await import('../../src/stores/ui')).useUiStore()
    ui.page = 'people'
    modal.open(page('a'))
    modal.push(page('b'))
    ui.page = 'library'
    expect(modal.visible).toBe(false)
    expect(modal.depth).toBe(2)
    ui.page = 'people'
    expect(modal.visible).toBe(true)
    ui.page = 'library'
    modal.open(page('c'))
    expect(modal.stack.map((p) => p.key)).toEqual(['c'])
  })

  it('done：翻进来的页做完回上一页，第一页做完就关掉', () => {
    const modal = useModalStore()
    modal.open(page('a'))
    modal.push(page('b'))
    modal.done()
    expect(modal.top?.key).toBe('a')
    modal.done()
    expect(modal.isOpen).toBe(false)
  })

  it('没有弹窗时 push 等同于 open', () => {
    const modal = useModalStore()
    modal.push(page('a'))
    expect(modal.stack.map((p) => p.key)).toEqual(['a'])
  })

  it('Esc 逐页返回，到第一页再关闭', () => {
    const modal = useModalStore()
    modal.open(page('a'))
    modal.push(page('b'))
    modal.escape()
    expect(modal.depth).toBe(1)
    modal.escape()
    expect(modal.isOpen).toBe(false)
  })

  it('关闭前经过栈底页的 guard；guard 返回 false 时不关闭', () => {
    const modal = useModalStore()
    const guard = vi.fn(() => false)
    modal.open(page('wizard', { guard }))
    modal.requestClose()
    expect(guard).toHaveBeenCalledOnce()
    expect(modal.isOpen).toBe(true)
    modal.close(true)
    expect(modal.isOpen).toBe(false)
  })

  it('确认页上的 ✕ 等同于取消（返回），不触发栈底页的 guard', () => {
    const modal = useModalStore()
    const guard = vi.fn(() => false)
    modal.open(page('wizard', { guard }))
    modal.push(page('confirm:1'))
    modal.requestClose()
    expect(modal.top?.key).toBe('wizard')
    expect(guard).not.toHaveBeenCalled()
  })

  it('页面离开栈时依次通知，后进的先通知', () => {
    const modal = useModalStore()
    const order: string[] = []
    modal.open(page('a', { onLeave: () => order.push('a') }))
    modal.push(page('b', { onLeave: () => order.push('b') }))
    modal.close(true)
    expect(order).toEqual(['b', 'a'])
  })

  it('回到栈底页', () => {
    const modal = useModalStore()
    modal.open(page('a'))
    modal.push(page('b'))
    modal.push(page('c'))
    modal.popToRoot()
    expect(modal.stack.map((p) => p.key)).toEqual(['a'])
  })
})
