<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useToastStore } from '../../stores/toast'
import Icon from './Icon.vue'

const store = useToastStore()
/** 酒馆自己的顶部栏下沿：提示条贴在它下面（宿主层）。只读宿主 DOM 的位置，读不到用 48px。 */
const HOST_BARS = ['#top-settings-holder', '#top-bar', 'header', '#ui-top-bar']
const top = ref(48)
function measure(): void {
  for (const selector of HOST_BARS) {
    const el = document.querySelector<HTMLElement>(selector)
    const box = el?.getBoundingClientRect()
    if (box && box.height > 0 && box.top < 4 && box.bottom < window.innerHeight / 2) {
      top.value = Math.round(box.bottom) + 8
      return
    }
  }
  top.value = 48
}
onMounted(() => {
  measure()
  window.addEventListener('resize', measure)
})
onBeforeUnmount(() => window.removeEventListener('resize', measure))
</script>

<template>
  <TransitionGroup name="trpg-toast" tag="div" class="trpg-toasts" role="status" aria-live="polite" :style="{ '--trpg-host-top': `${top}px` }">
    <div
      v-for="t in store.toasts"
      :key="t.id"
      class="trpg-toast"
      :data-kind="t.kind"
      @click="store.dismiss(t.id)"
      @pointerenter="store.pause(t.id)"
      @pointerleave="store.resume(t.id)"
      @focusin="store.pause(t.id)"
      @focusout="store.resume(t.id)"
    >
      <Icon v-if="t.kind === 'error'" name="warning" :size="16" />
      <Icon v-else-if="t.kind === 'success'" name="check-circle" :size="16" />
      <span class="trpg-toast__text">{{ t.message }}</span>
      <button v-if="t.undo" class="trpg-toast__btn" type="button" @click.stop="store.runUndo(t.id)">撤销</button>
      <button v-for="(a, i) in t.actions ?? []" :key="i" class="trpg-toast__btn" type="button" @click.stop="store.runAction(t.id, a)">{{ a.label }}</button>
      <small v-if="!t.undo && !t.actions?.length">点击关闭</small>
    </div>
  </TransitionGroup>
</template>
