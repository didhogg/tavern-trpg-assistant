import { defineStore } from 'pinia'
import { computed, shallowRef, type Component } from 'vue'

export type ModalVariant = 'dialog' | 'drawer' | 'confirm'

export interface ModalPage {
  /** 同一弹窗内唯一；确认页以 `confirm:` 开头。 */
  key: string
  title: string
  component: Component
  props?: Record<string, unknown>
  /** 标题栏右侧的附加内容（如包详情的状态按钮与「⋯」）。 */
  header?: Component
  /** 弹窗外观，只看栈底页。 */
  variant?: ModalVariant
  /** 用户用 ✕、遮罩或 Esc 关闭栈底页之前调用；返回 false 表示拦截（页面自行显示确认页）。 */
  guard?: () => boolean
  /** 页面离开栈（返回或关闭）时调用。 */
  onLeave?: () => void
}

/**
 * 全局弹窗宿主的状态：一个页面栈。
 * 同一时间只有一个弹窗；弹窗内的前进、确认、详情都是入栈，「‹」与 Esc 出栈，不叠加第二个弹窗（开发规范 §5.3）。
 */
export const useModalStore = defineStore('modal', () => {
  const stack = shallowRef<ModalPage[]>([])
  const direction = shallowRef<'forward' | 'back'>('forward')

  const isOpen = computed(() => stack.value.length > 0)
  const top = computed(() => stack.value[stack.value.length - 1])
  const depth = computed(() => stack.value.length)
  const variant = computed<ModalVariant>(() => stack.value[0]?.variant ?? 'dialog')

  function leave(page: ModalPage | undefined): void {
    page?.onLeave?.()
  }

  function clear(): void {
    const pages = [...stack.value].reverse()
    stack.value = []
    for (const page of pages) leave(page)
  }

  /** 打开一个新弹窗；已有弹窗时先关闭它（不叠加）。 */
  function open(page: ModalPage): void {
    if (stack.value.length) clear()
    direction.value = 'forward'
    stack.value = [page]
  }

  /** 在当前弹窗内前进一页；没有弹窗时等同于 open。 */
  function push(page: ModalPage): void {
    if (!stack.value.length) {
      open(page)
      return
    }
    direction.value = 'forward'
    stack.value = [...stack.value, page]
  }

  /** 返回上一页；已在第一页时关闭弹窗。 */
  function pop(): void {
    if (stack.value.length <= 1) {
      clear()
      return
    }
    direction.value = 'back'
    const removed = stack.value[stack.value.length - 1]
    stack.value = stack.value.slice(0, -1)
    leave(removed)
  }

  /** 回到栈底页（保留第一页的状态）。 */
  function popToRoot(): void {
    while (stack.value.length > 1) pop()
  }

  /** 关闭整个弹窗。force 为 true 时不经过栈底页的 guard。 */
  function close(force = false): boolean {
    if (!stack.value.length) return true
    if (!force && stack.value[0].guard && stack.value[0].guard() === false) return false
    clear()
    return true
  }

  /** ✕ 与遮罩：确认页上等同于取消（返回），其余页走栈底页的 guard 后关闭。 */
  function requestClose(): void {
    const page = top.value
    if (page && page.key.startsWith('confirm:') && stack.value.length > 1) pop()
    else if (page && page.key.startsWith('confirm:')) close(true)
    else close()
  }

  /** Esc：逐页返回；到第一页再关闭。 */
  function escape(): void {
    if (stack.value.length > 1) pop()
    else requestClose()
  }

  function setTitle(key: string, title: string): void {
    stack.value = stack.value.map((p) => (p.key === key ? { ...p, title } : p))
  }

  return { stack, direction, isOpen, top, depth, variant, open, push, pop, popToRoot, close, requestClose, escape, setTitle }
})
