<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, provide, ref, watch } from 'vue'
import type { StContext } from '../host/types'
import ProbeList from './ProbeList.vue'
import { loadPoint, savePoint } from './shell/storage'
import { useDrag, type Point } from './shell/useDrag'

const props = defineProps<{ ctx: StContext; portalTarget: HTMLElement }>()
provide('portalTarget', props.portalTarget)

const BALL = 48
const open = ref(false)
const ball = ref<Point>(loadPoint('trpg-assistant:ball', { x: 16, y: Math.round(window.innerHeight / 2) }))
const win = ref<Point>(loadPoint('trpg-assistant:win', { x: 16, y: 16 }))

const winEl = ref<HTMLElement | null>(null)
const winSize = () => ({ w: winEl.value?.offsetWidth ?? 440, h: winEl.value?.offsetHeight ?? 600 })

function clampInto(point: Point, w: number, h: number): Point {
  return {
    x: Math.min(Math.max(point.x, 0), Math.max(0, window.innerWidth - w)),
    y: Math.min(Math.max(point.y, 0), Math.max(0, window.innerHeight - h)),
  }
}

function fitToViewport(): void {
  ball.value = clampInto(ball.value, BALL, BALL)
  if (open.value) {
    const { w, h } = winSize()
    win.value = clampInto(win.value, w, h)
  }
}

onMounted(() => window.addEventListener('resize', fitToViewport))
onBeforeUnmount(() => window.removeEventListener('resize', fitToViewport))
watch(open, (isOpen) => {
  if (isOpen) void Promise.resolve().then(fitToViewport)
})

const ballDrag = useDrag({
  position: ball,
  size: () => ({ w: BALL, h: BALL }),
  onTap: () => {
    open.value = !open.value
  },
  onEnd: () => savePoint('trpg-assistant:ball', ball.value),
})
const winDrag = useDrag({
  position: win,
  size: winSize,
  onEnd: () => savePoint('trpg-assistant:win', win.value),
})

const ballStyle = computed(() => ({ left: `${ball.value.x}px`, top: `${ball.value.y}px` }))
const winStyle = computed(() => ({ left: `${win.value.x}px`, top: `${win.value.y}px` }))
</script>

<template>
  <div class="trpg-root">
    <button class="trpg-ball" type="button" aria-label="打开或关闭 TRPG 跑团助手" :style="ballStyle" @pointerdown="ballDrag.onPointerDown">⚄</button>
    <section v-if="open" ref="winEl" class="trpg-window" :style="winStyle" role="dialog" aria-label="TRPG 跑团助手 M0 探针">
      <header class="trpg-window__head" @pointerdown="winDrag.onPointerDown">
        <span>TRPG 跑团助手 · M0 探针</span>
        <button class="trpg-icon-btn" type="button" aria-label="关闭" @click="open = false">✕</button>
      </header>
      <div class="trpg-window__body"><ProbeList :ctx="ctx" /></div>
    </section>
  </div>
</template>
