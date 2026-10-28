<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useUiStore } from '../../stores/ui'
import Icon from '../kit/Icon.vue'
import { loadPoint, savePoint } from './storage'
import { useDrag, type Point } from './useDrag'

const BALL = 48
const ui = useUiStore()
const ball = ref<Point>(loadPoint('trpg-assistant:ball', { x: 16, y: Math.round(window.innerHeight / 2) }))

function fit(): void {
  ball.value = {
    x: Math.min(Math.max(ball.value.x, 0), Math.max(0, window.innerWidth - BALL)),
    y: Math.min(Math.max(ball.value.y, 0), Math.max(0, window.innerHeight - BALL)),
  }
}
onMounted(() => {
  fit()
  window.addEventListener('resize', fit)
})
onBeforeUnmount(() => window.removeEventListener('resize', fit))

const drag = useDrag({
  position: ball,
  size: () => ({ w: BALL, h: BALL }),
  onTap: () => {
    ui.windowOpen = !ui.windowOpen
  },
  onEnd: () => savePoint('trpg-assistant:ball', ball.value),
})
const style = computed(() => ({ left: `${ball.value.x}px`, top: `${ball.value.y}px` }))
</script>

<template>
  <button
    class="trpg-ball"
    type="button"
    aria-label="打开或收起 TRPG 跑团助手"
    :aria-expanded="ui.windowOpen"
    :style="style"
    @pointerdown="drag.onPointerDown"
    @keydown.enter.prevent="ui.windowOpen = !ui.windowOpen"
    @keydown.space.prevent="ui.windowOpen = !ui.windowOpen"
  >
    <Icon name="dice-five" :size="26" />
  </button>
</template>
