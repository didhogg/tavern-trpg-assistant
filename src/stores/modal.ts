import { defineStore } from 'pinia'
import { computed, ref, shallowRef, type Component } from 'vue'
import { useUiStore, type PageId } from './ui'

/** sheet = 库页的包 / 书 / 搜索弹窗：宽屏居中浮在整个窗口上，窄屏从底部上拉（P5）。 */
export type ModalVariant = 'dialog' | 'drawer' | 'confirm' | 'sheet'

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
  /** 抽屉宽度（px；不写 = 440）；`dialog` 变体写了就是居中弹窗的宽（U5R：窄屏变底部整页）。窗口更窄时取 100%。 */
  width?: number
  /** 居中弹窗的高度上限（px），不写用默认 800；内容少的弹窗写小一点，别留大片空白。 */
  height?: number
  /** 页面自带完整外壳（例如人物卡）时不显示宿主标题栏。 */
  bare?: boolean
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
  const ui = useUiStore()
  /** 弹窗是在哪个页面打开的；库页的 sheet 弹窗切到别的页面时只是藏起来（状态原样保留），切回来再显示。 */
  const owner = ref<PageId | null>(null)

  const isOpen = computed(() => stack.value.length > 0)
  const top = computed(() => stack.value[stack.value.length - 1])
  const depth = computed(() => stack.value.length)
  const variant = computed<ModalVariant>(() => stack.value[0]?.variant ?? 'dialog')
  /** 现在是否显示：sheet 弹窗只在它所属的页面显示，其余变体（确认、抽屉、向导）一直显示。 */
  const visible = computed(() => stack.value.length > 0 && (variant.value !== 'sheet' || owner.value === ui.page))

  function leave(page: ModalPage | undefined): void {
    page?.onLeave?.()
  }

  function clear(): void {
    const pages = [...stack.value].reverse()
    stack.value = []
    owner.value = null
    for (const page of pages) leave(page)
  }

  /** 打开一个新弹窗；已有弹窗时先关闭它（不叠加）。 */
  function open(page: ModalPage): void {
    if (stack.value.length) clear()
    direction.value = 'forward'
    owner.value = ui.page
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

  /** 把栈顶页换成另一页（语言切换用：不增加返回层数）。 */
  function replace(page: ModalPage): void {
    if (!stack.value.length) { open(page); return }
    const removed = stack.value[stack.value.length - 1]
    direction.value = 'forward'
    stack.value = [...stack.value.slice(0, -1), page]
    leave(removed)
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

  /** 改栈顶页的高度上限（居中弹窗按内容定高用）；页面对象是浅层响应，换一个新对象才会更新。 */
  function setTopHeight(height: number): void {
    const page = stack.value[stack.value.length - 1]
    if (!page || page.height === height) return
    stack.value = [...stack.value.slice(0, -1), { ...page, height }]
  }

  return { stack, direction, isOpen, visible, top, depth, variant, open, push, replace, pop, popToRoot, close, requestClose, escape, setTitle, setTopHeight }
})
