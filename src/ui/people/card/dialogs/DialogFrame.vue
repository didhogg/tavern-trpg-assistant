<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useModalStore } from '../../../../stores/modal'
import BrowserTabs, { type BrowserTab } from '../../../kit/BrowserTabs.vue'

/**
 * 居中弹窗的内页结构（U5R §10.0）：标签栏（可选）→ 滚动内容区 → 固定底栏。
 * fit：按内容定高——量一下内容的自然高度，设成弹窗高度（最小 minHeight，最大 800；内容变了会重新量）。
 * 内容少的资料弹窗用它，别留大片空白。
 */
const props = defineProps<{ tabs?: BrowserTab[]; tabLabel?: string; note?: string; fit?: boolean; minHeight?: number }>()
const tab = defineModel<string>('tab')
const modal = useModalStore()
const body = ref<HTMLElement>()
let observer: ResizeObserver | undefined
let frame = 0

function fitNow(): void {
  const el = body.value
  const card = el?.closest('.trpg-modal__card') as HTMLElement | null
  if (!el || !card) return
  const top = el.getBoundingClientRect().top - el.scrollTop
  const bottom = Math.max(0, ...[...el.children].map((child) => child.getBoundingClientRect().bottom))
  const content = bottom - top + 16 // 内容区下内边距
  const chrome = card.getBoundingClientRect().height - el.clientHeight
  const target = Math.round(Math.min(800, Math.max(props.minHeight ?? 260, chrome + content)))
  const current = Number.parseFloat(card.style.getPropertyValue('--trpg-dlg-h')) || 0
  if (Math.abs(target - current) > 3) modal.setTopHeight(target)
}
function schedule(): void { cancelAnimationFrame(frame); frame = requestAnimationFrame(fitNow) }

onMounted(() => {
  if (!props.fit || !body.value) return
  observer = new ResizeObserver(schedule)
  observer.observe(body.value)
  for (const child of body.value.children) observer.observe(child)
  new MutationObserver(() => { observer?.disconnect(); if (body.value) { observer?.observe(body.value); for (const child of body.value.children) observer?.observe(child) } schedule() }).observe(body.value, { childList: true })
  schedule()
})
onBeforeUnmount(() => { observer?.disconnect(); cancelAnimationFrame(frame) })
</script>

<template>
  <div class="trpg-dlg">
    <BrowserTabs v-if="tabs && tabs.length > 1 && tab !== undefined" v-model="tab" :tabs="tabs" :label="tabLabel ?? '分类'" />
    <div ref="body" class="trpg-dlg__body"><slot /></div>
    <footer class="trpg-dlg__foot"><p class="trpg-dlg__note">{{ note }}</p><div class="trpg-dlg__actions"><slot name="actions" /></div></footer>
  </div>
</template>
