<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useModalStore } from '../../stores/modal'
import { PAGE_TITLES, useUiStore, type PageId } from '../../stores/ui'
import Icon from '../kit/Icon.vue'
import ModalHost from '../kit/ModalHost.vue'
import LibraryView from '../libview/LibraryView.vue'
import HomeView from '../views/HomeView.vue'
import SettingsView from '../views/SettingsView.vue'
import { saveNow } from '../saves/actions'
import HeaderChips from './HeaderChips.vue'
import LibraryNav from './LibraryNav.vue'
import { clampRect, loadRect, MIN_H, MIN_W, saveRect, type Rect } from './windowRect'
import { useDrag, type Point } from './useDrag'

const ui = useUiStore()
const modal = useModalStore()
type NavItem = { id: PageId | 'library'; label: string; icon: string; bottom?: boolean }
// 库标签：进度环 + 库页面（P5）
const NAV = computed<NavItem[]>(() => [
  { id: 'home', label: '首页', icon: 'house' },
  { id: 'library', label: '库', icon: 'books', bottom: true },
  { id: 'settings', label: '设置', icon: 'gear', bottom: true },
])
const VIEWS = { home: HomeView, settings: SettingsView, library: LibraryView }

const vw = ref(window.innerWidth)
const vh = ref(window.innerHeight)
const rect = ref<Rect>(loadRect(vw.value, vh.value))
const winEl = ref<HTMLElement | null>(null)
const innerW = ref(rect.value.w)

const fullscreen = computed(() => vw.value <= 480)
const layout = computed(() => (innerW.value >= 720 ? 'wide' : innerW.value > 480 ? 'mid' : 'narrow'))
const style = computed(() => (fullscreen.value ? {} : { left: `${rect.value.x}px`, top: `${rect.value.y}px`, width: `${rect.value.w}px`, height: `${rect.value.h}px` }))
const title = computed(() => PAGE_TITLES[ui.page])
// 库页弹窗只占侧栏 / 底栏之外的空间：量出侧栏宽、底栏高，交给样式（--trpg-sheet-left / --trpg-sheet-bottom）；侧栏和底栏照常可点、可拖
const insets = ref({ left: 0, bottom: 0 })
function measureInsets(): void {
  const el = winEl.value
  if (!el) return
  insets.value = { left: el.querySelector<HTMLElement>('.trpg-side')?.offsetWidth ?? 0, bottom: el.querySelector<HTMLElement>('.trpg-tabs')?.offsetHeight ?? 0 }
}
const insetVars = computed(() => ({ '--trpg-sheet-left': `${insets.value.left}px`, '--trpg-sheet-bottom': `${insets.value.bottom}px` }))
// 弹窗是库页的 sheet 时，外壳其余部分照常可用；其他弹窗（确认、抽屉、向导）仍然整个外壳不可操作
const sheetOpen = computed(() => modal.visible && modal.variant === 'sheet')
const otherModalOpen = computed(() => modal.visible && modal.variant !== 'sheet')
const topNav = computed(() => NAV.value.filter((n) => !n.bottom))
const bottomNav = computed(() => NAV.value.filter((n) => n.bottom))

const pos = computed<Point>({
  get: () => ({ x: rect.value.x, y: rect.value.y }),
  set: (p) => {
    rect.value = { ...rect.value, x: p.x, y: p.y }
  },
})
const drag = useDrag({
  position: pos,
  size: () => ({ w: rect.value.w, h: rect.value.h }),
  onEnd: () => saveRect(rect.value),
})
function startDrag(event: PointerEvent): void {
  if (!fullscreen.value) drag.onPointerDown(event)
}

function startResize(event: PointerEvent): void {
  const handle = event.currentTarget as HTMLElement
  handle.setPointerCapture(event.pointerId)
  const sx = event.clientX
  const sy = event.clientY
  const origin = { ...rect.value }
  const onMove = (e: PointerEvent) => {
    rect.value = {
      ...origin,
      w: Math.min(Math.max(origin.w + e.clientX - sx, MIN_W), Math.max(MIN_W, vw.value - origin.x)),
      h: Math.min(Math.max(origin.h + e.clientY - sy, MIN_H), Math.max(MIN_H, vh.value - origin.y)),
    }
  }
  const onUp = () => {
    handle.removeEventListener('pointermove', onMove)
    handle.removeEventListener('pointerup', onUp)
    handle.removeEventListener('pointercancel', onUp)
    saveRect(rect.value)
  }
  handle.addEventListener('pointermove', onMove)
  handle.addEventListener('pointerup', onUp)
  handle.addEventListener('pointercancel', onUp)
}

function onViewport(): void {
  vw.value = window.innerWidth
  vh.value = window.innerHeight
  rect.value = clampRect(rect.value, vw.value, vh.value)
}

/** ⌘/Ctrl+S：焦点在助手内时保存。 */
function onKey(event: KeyboardEvent): void {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
    event.preventDefault()
    void saveNow()
  }
}

watch([layout, () => modal.visible], () => void nextTick(measureInsets))
watch(layout, (v) => { ui.layout = v }, { immediate: true })
let observer: ResizeObserver | undefined
onMounted(() => {
  window.addEventListener('resize', onViewport)
  observer = new ResizeObserver((entries) => {
    const width = entries[0]?.contentRect.width
    if (width) innerW.value = width
  })
  if (winEl.value) observer.observe(winEl.value)
  measureInsets()
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', onViewport)
  observer?.disconnect()
})
</script>

<template>
  <section ref="winEl" class="trpg-window" :style="[style, insetVars]" :data-layout="layout" :data-fullscreen="fullscreen" role="dialog" aria-label="TRPG 跑团助手" @keydown="onKey">
    <div class="trpg-shell" :inert="otherModalOpen">
      <nav v-if="layout !== 'narrow'" class="trpg-side" aria-label="主导航">
        <div class="trpg-side__brand" title="拖动窗口" @pointerdown="startDrag">
          <span class="trpg-brandmark"><Icon name="dice-five" :size="18" /></span>
          <span v-if="layout === 'wide'" class="trpg-side__name">TRPG 跑团助手</span>
        </div>
        <ul class="trpg-side__list">
          <li v-for="n in topNav" :key="n.id">
            <button class="trpg-nav" type="button" :aria-current="ui.page === n.id ? 'page' : undefined" :title="n.label" @click="ui.go(n.id as PageId)">
              <Icon :name="n.icon" :size="20" /><span v-if="layout === 'wide'">{{ n.label }}</span>
            </button>
          </li>
        </ul>
        <ul class="trpg-side__list trpg-side__bottom">
          <li v-for="n in bottomNav" :key="n.id">
            <LibraryNav v-if="n.id === 'library'" variant="side" :labeled="layout === 'wide'" />
            <button v-else class="trpg-nav" type="button" :aria-current="ui.page === n.id ? 'page' : undefined" :title="n.label" @click="ui.go(n.id as PageId)">
              <Icon :name="n.icon" :size="20" /><span v-if="layout === 'wide'">{{ n.label }}</span>
            </button>
          </li>
        </ul>
      </nav>
      <div class="trpg-main">
        <header class="trpg-head" title="拖动窗口" :inert="sheetOpen" @pointerdown="startDrag">
          <h1 class="trpg-head__title">{{ title }}</h1>
          <HeaderChips :layout="layout" />
          <button v-if="layout !== 'narrow'" class="trpg-icon-btn" type="button" aria-label="收起助手" @click="ui.windowOpen = false">
            <Icon name="x" :size="18" />
          </button>
        </header>
        <div class="trpg-body" :inert="sheetOpen">
          <main class="trpg-content" :data-flush="ui.page === 'settings' || ui.page === 'library' ? 'true' : undefined" tabindex="-1">
            <component :is="VIEWS[ui.page]" />
          </main>
          <button class="trpg-dice-btn" type="button" aria-label="掷骰" :aria-pressed="ui.diceOpen" @click="ui.diceOpen = !ui.diceOpen">
            <Icon name="dice-five" :size="28" />
          </button>
        </div>
        <nav v-if="layout === 'narrow'" class="trpg-tabs" aria-label="主导航">
          <template v-for="n in NAV" :key="n.id">
            <LibraryNav v-if="n.id === 'library'" variant="tab" :labeled="true" />
            <button v-else class="trpg-tab" type="button" :aria-current="ui.page === n.id ? 'page' : undefined" @click="ui.go(n.id as PageId)">
              <Icon :name="n.icon" :size="22" /><span>{{ n.label }}</span>
            </button>
          </template>
        </nav>
      </div>
    </div>
    <ModalHost @drag="startDrag" />
    <div v-if="!fullscreen" class="trpg-resize" aria-hidden="true" @pointerdown="startResize" />
  </section>
</template>
