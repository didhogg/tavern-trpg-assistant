<script setup lang="ts">
// 用作者完整建卡器改这个人（P6-R）：升级、兼职、要做选择的成长（属性提升、子职业、专长……），带来的职业 / 种族特性由作者一起加上；
// 空白人物（还没有等级）= 作者从头建。作者窗口铺在这里给玩家用；作者完成 → 写进存档（一条撤销）；中途关掉 = 什么都不变。
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { usePersonStore } from '../../stores/person'
import { useModalStore } from '../../stores/modal'

const person = usePersonStore()
const modal = useModalStore()
const slot = ref<HTMLElement | null>(null)
const state = ref<'running' | 'failed'>('running')
onMounted(async () => {
  if (!slot.value) return
  const outcome = await person.levelNative(slot.value)
  if (outcome === 'failed') { state.value = 'failed'; return }
  state.value = 'running'
  modal.close(true)
})
/** 中途离开（✕ / Esc）：关掉建卡专用小窗，人物不变。 */
onBeforeUnmount(() => { if (state.value === 'running') person.stopNative() })
</script>

<template>
  <div class="bp" data-testid="level-page">
    <p v-if="state === 'failed'" class="bp-error" role="alert">这次没改成，原因见提示条。关掉这个窗口，人物没有变化。</p>
    <div v-show="state === 'running'" ref="slot" class="bp-slot" data-testid="level-slot">
      <p class="bp-hint" role="status">正在准备建卡资料…</p>
    </div>
  </div>
</template>
