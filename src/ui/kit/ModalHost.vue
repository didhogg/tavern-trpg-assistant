<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useModalStore } from '../../stores/modal'
import Icon from './Icon.vue'

const modal = useModalStore()
const rootEl = ref<HTMLElement | null>(null)
const cardEl = ref<HTMLElement | null>(null)
const titleId = `trpg-modal-title-${Math.random().toString(36).slice(2, 8)}`
const FOCUSABLE = 'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

let opener: HTMLElement | null = null
const pushedFrom: Array<HTMLElement | null> = []
const scrolls = new Map<string, number>()

const backLabel = computed(() => (modal.depth > 1 ? modal.stack[modal.depth - 2].title : ''))

/** 最近一次被点按的控件：macOS 的 WebKit 点按按钮不会让它获得焦点，打开弹窗时用它来还焦点。 */
let lastPressed: HTMLElement | null = null
function rememberPressed(event: Event): void {
  const origin = event.composedPath()[0]
  lastPressed = origin instanceof HTMLElement ? origin.closest<HTMLElement>('button, a[href], input, select, textarea, [tabindex]') : null
}
let listenRoot: Node | undefined
onMounted(() => {
  listenRoot = rootEl.value?.getRootNode()
  listenRoot?.addEventListener('pointerdown', rememberPressed, true)
})
onBeforeUnmount(() => listenRoot?.removeEventListener('pointerdown', rememberPressed, true))

function deepActive(): HTMLElement | null {
  const root = rootEl.value?.getRootNode()
  const active = (root instanceof ShadowRoot ? root.activeElement : document.activeElement) as HTMLElement | null
  const pressed = lastPressed && lastPressed.isConnected ? lastPressed : null
  // WebKit 点按按钮时焦点可能落在外层容器上，此时以被点按的控件为准
  if (pressed && (!active || active === document.body || (active !== pressed && active.contains(pressed)))) return pressed
  return active && active !== document.body ? active : null
}

function topFocusables(): HTMLElement[] {
  const card = cardEl.value
  if (!card) return []
  const scopes = [card.querySelector('.trpg-modal__head'), card.querySelector('.trpg-modal__page:not(.is-under)')]
  return scopes.flatMap((scope) => (scope ? [...scope.querySelectorAll<HTMLElement>(FOCUSABLE)] : [])).filter((el) => el.getClientRects().length > 0 && el.tabIndex >= 0 && el.getAttribute('aria-hidden') !== 'true')
}

function focusInto(): void {
  const page = cardEl.value?.querySelector<HTMLElement>('.trpg-modal__page:not(.is-under)')
  const preferred = page?.querySelector<HTMLElement>('[data-autofocus]')
  const target = preferred ?? page?.querySelector<HTMLElement>(FOCUSABLE) ?? cardEl.value
  target?.focus({ preventScroll: true })
}

function pageElements(): HTMLElement[] {
  return cardEl.value ? [...cardEl.value.querySelectorAll<HTMLElement>('.trpg-modal__page')] : []
}

/** 页面换页时浏览器会重置被隐藏页的滚动位置，这里手动记下并在返回时恢复。 */
function saveScrolls(): void {
  pageElements().forEach((el, i) => {
    const key = modal.stack[i]?.key
    if (key && !el.classList.contains('is-under')) scrolls.set(key, el.scrollTop)
  })
}

function restoreScrolls(): void {
  pageElements().forEach((el, i) => {
    const key = modal.stack[i]?.key
    const saved = key ? scrolls.get(key) : undefined
    if (saved !== undefined && !el.classList.contains('is-under')) el.scrollTop = saved
  })
}

function restore(el: HTMLElement | null): void {
  if (el && el.isConnected && el.getClientRects().length > 0) el.focus({ preventScroll: true })
}

watch(
  () => [modal.depth, modal.top?.key] as const,
  async ([now, key], [before, beforeKey]) => {
    saveScrolls()
    if (now === 0) {
      scrolls.clear()
      const target = opener
      opener = null
      pushedFrom.length = 0
      await nextTick()
      restore(target)
      return
    }
    if (before === 0) opener = deepActive()
    else if (now > before) pushedFrom.push(deepActive())
    await nextTick()
    if (now < before) restoreScrolls()
    if (now < before && before > 0) {
      const target = pushedFrom.pop() ?? null
      if (target && target.isConnected && target.getClientRects().length > 0) restore(target)
      else focusInto()
    } else if (now !== before || key !== beforeKey) focusInto()
  },
)

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    event.preventDefault()
    event.stopPropagation()
    modal.escape()
    return
  }
  if (event.key !== 'Tab') return
  // 一律由我们移动焦点：macOS 的 WebKit 默认不会让 Tab 停在按钮上，焦点会跑出弹窗
  event.preventDefault()
  const items = topFocusables()
  if (!items.length) return
  const active = deepActive()
  const index = active ? items.indexOf(active) : -1
  const next = event.shiftKey ? (index <= 0 ? items.length - 1 : index - 1) : index === -1 || index === items.length - 1 ? 0 : index + 1
  items[next].focus()
}
</script>

<template>
  <div ref="rootEl" class="trpg-modal-root">
    <div v-if="modal.isOpen" class="trpg-modal" :data-variant="modal.variant" @click.self="modal.requestClose()" @keydown.stop="onKeydown">
      <section ref="cardEl" class="trpg-modal__card" role="dialog" aria-modal="true" :aria-labelledby="titleId" tabindex="-1">
        <header class="trpg-modal__head">
          <button v-if="modal.depth > 1" class="trpg-modal__back" type="button" :aria-label="`返回：${backLabel}`" @click="modal.pop()">
            <Icon name="caret-left" :size="16" /><span>{{ backLabel }}</span>
          </button>
          <h2 :id="titleId" class="trpg-modal__title">{{ modal.top?.title }}</h2>
          <component :is="modal.top.header" v-if="modal.top?.header" v-bind="modal.top.props" />
          <button class="trpg-icon-btn trpg-modal__close" type="button" aria-label="关闭" @click="modal.requestClose()">
            <Icon name="x" :size="18" />
          </button>
        </header>
        <TransitionGroup tag="div" name="trpg-page" class="trpg-modal__pages">
          <div
            v-for="(page, i) in modal.stack"
            :key="page.key"
            class="trpg-modal__page"
            :class="{ 'is-under': i < modal.depth - 1 }"
            :inert="i < modal.depth - 1"
            :aria-hidden="i < modal.depth - 1 ? 'true' : undefined"
          >
            <component :is="page.component" v-bind="page.props" />
          </div>
        </TransitionGroup>
      </section>
    </div>
  </div>
</template>
