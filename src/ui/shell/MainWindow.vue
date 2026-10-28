<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useModalStore } from '../../stores/modal'
import { PAGE_TITLES, useUiStore, type PageId } from '../../stores/ui'
import Icon from '../kit/Icon.vue'
import ModalHost from '../kit/ModalHost.vue'
import HomeView from '../views/HomeView.vue'
import LibraryView from '../views/LibraryView.vue'
import SettingsView from '../views/SettingsView.vue'
import HeaderChips from './HeaderChips.vue'
import { clampRect, loadRect, MIN_H, MIN_W, saveRect, type Rect } from './windowRect'
import { useDrag, type Point } from './useDrag'

const ui = useUiStore()
const modal = useModalStore()
const NAV: Array<{ id: PageId; label: string; icon: string; bottom?: boolean }> = [
  { id: 'home', label: '首页', icon: 'house' },
  { id: 'library', label: '库', icon: 'books', bottom: true },
  { id: 'settings', label: '设置', icon: 'gear', bottom: true },
]
const VIEWS = { home: HomeView, library: LibraryView, settings: SettingsView }

const vw = ref(window.innerWidth)
const vh = ref(window.innerHeight)
const rect = ref<Rect>(loadRect(vw.value, vh.value))
const winEl = ref<HTMLElement | null>(null)
const innerW = ref(rect.value.w)

const fullscreen = computed(() => vw.value <= 480)
const layout = computed(() => (innerW.value >= 720 ? 'wide' : innerW.value > 480 ? 'mid' : 'narrow'))
const style = computed(() => (fullscreen.value ? {} : { left: `${rect.value.x}px`, top: `${rect.value.y}px`, width: `${rect.value.w}px`, height: `${rect.value.h}px` }))
const title = computed(() => PAGE_TITLES[ui.page])
const topNav = computed(() => NAV.filter((n) => !n.bottom))
const bottomNav = computed(() => NAV.filter((n) => n.bottom))

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

let observer: ResizeObserver | undefined
onMounted(() => {
  window.addEventListener('resize', onViewport)
  observer = new ResizeObserver((entries) => {
    const width = entries[0]?.contentRect.width
    if (width) innerW.value = width
  })
  if (winEl.value) observer.observe(winEl.value)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', onViewport)
  observer?.disconnect()
})
</script>

<template>
  <section
    ref="winEl"
    class="trpg-window"
    :style="style"
    :data-layout="layout"
    :data-fullscreen="fullscreen"
    role="dialog"
    aria-label="TRPG 跑团助手"
  >
    <div class="trpg-shell" :inert="modal.isOpen">
      <nav v-if="layout !== 'narrow'" class="trpg-side" aria-label="主导航">
        <div class="trpg-side__brand" title="拖动窗口" @pointerdown="startDrag">
          <Icon name="dice-five" :size="22" />
          <span v-if="layout === 'wide'" class="trpg-side__name">TRPG 跑团助手</span>
        </div>
        <ul class="trpg-side__list">
          <li v-for="n in topNav" :key="n.id">
            <button class="trpg-nav" type="button" :aria-current="ui.page === n.id ? 'page' : undefined" :title="n.label" @click="ui.go(n.id)">
              <Icon :name="n.icon" :size="20" /><span v-if="layout === 'wide'">{{ n.label }}</span>
            </button>
          </li>
        </ul>
        <ul class="trpg-side__list trpg-side__bottom">
          <li v-for="n in bottomNav" :key="n.id">
            <button class="trpg-nav" type="button" :aria-current="ui.page === n.id ? 'page' : undefined" :title="n.label" @click="ui.go(n.id)">
              <Icon :name="n.icon" :size="20" /><span v-if="layout === 'wide'">{{ n.label }}</span>
            </button>
          </li>
        </ul>
      </nav>
      <div class="trpg-main">
        <header class="trpg-head" @pointerdown="layout === 'narrow' ? startDrag($event) : undefined">
          <h1 class="trpg-head__title">{{ title }}</h1>
          <HeaderChips :layout="layout" />
          <button v-if="layout !== 'narrow'" class="trpg-icon-btn" type="button" aria-label="收起助手" @click="ui.windowOpen = false">
            <Icon name="x" :size="18" />
          </button>
        </header>
        <main class="trpg-content" tabindex="-1">
          <component :is="VIEWS[ui.page]" />
        </main>
        <nav v-if="layout === 'narrow'" class="trpg-tabs" aria-label="主导航">
          <button v-for="n in NAV" :key="n.id" class="trpg-tab" type="button" :aria-current="ui.page === n.id ? 'page' : undefined" @click="ui.go(n.id)">
            <Icon :name="n.icon" :size="22" /><span>{{ n.label }}</span>
          </button>
        </nav>
      </div>
    </div>
    <ModalHost />
    <div v-if="!fullscreen" class="trpg-resize" aria-hidden="true" @pointerdown="startResize" />
  </section>
</template>
