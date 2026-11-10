<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { useDownloadsStore } from '../../stores/downloads'
import { useUiStore } from '../../stores/ui'
import Icon from '../kit/Icon.vue'
import RingIcon from '../kit/RingIcon.vue'

/**
 * 侧栏 / 底部标签栏上的"库"：没有下载时只有图标；有任务在下载或失败时，图标外一圈小环 + 旁边的数字（未完成项数）。
 * 鼠标悬停（触屏点按）小环 → 紧凑小窗，只列"正在下载 / 下载失败"的项；移开即消失。点库标签本身进库页（P5）。
 */
const props = defineProps<{ variant: 'side' | 'tab'; labeled: boolean }>()
const dl = useDownloadsStore()
const ui = useUiStore()
const open = ref(false)
const root = ref<HTMLElement | null>(null)

function onEnter(event: PointerEvent): void {
  if (event.pointerType === 'mouse' && dl.count) open.value = true
}
function onLeave(event: PointerEvent): void {
  if (event.pointerType === 'mouse') open.value = false
}
function onClick(event: MouseEvent): void {
  const touch = (event as PointerEvent).pointerType !== undefined && (event as PointerEvent).pointerType !== 'mouse' && (event as PointerEvent).pointerType !== ''
  if (touch && dl.count) {
    open.value = !open.value
    return
  }
  ui.go('library')
}
function closeOutside(event: Event): void {
  if (!root.value || !event.composedPath().includes(root.value)) open.value = false
}
watch(open, (now) => {
  if (now) document.addEventListener('pointerdown', closeOutside, true)
  else document.removeEventListener('pointerdown', closeOutside, true)
})
watch(() => dl.count, (n) => { if (!n) open.value = false })
onBeforeUnmount(() => document.removeEventListener('pointerdown', closeOutside, true))
const klass = props.variant === 'side' ? 'trpg-nav' : 'trpg-tab'
</script>

<template>
  <span ref="root" class="trpg-libnav" style="display: contents">
    <button :class="klass" type="button" title="库" :aria-label="dl.count ? `库，${dl.count} 项资料未完成` : '库'" :aria-current="ui.page === 'library' ? 'page' : undefined" data-testid="nav-library" @click="onClick" @pointerenter="onEnter" @pointerleave="onLeave">
      <span v-if="dl.ring !== 'none'" class="trpg-libmark" data-testid="lib-ring" :data-state="dl.ring">
        <span class="trpg-libmark__icon"><RingIcon :state="dl.ring" :pct="dl.pct" /><Icon name="books" :size="16" /></span>
        <b v-if="dl.count" class="trpg-count">{{ dl.count }}</b>
      </span>
      <Icon v-else name="books" :size="variant === 'side' ? 20 : 22" />
      <span v-if="labeled">库</span>
    </button>
    <div v-if="open && dl.count" class="trpg-pop" role="status" data-testid="lib-pop">
      <template v-if="dl.running.length">
        <h3>正在下载</h3>
        <div v-for="i in dl.running" :key="i.key" class="trpg-pop__row"><b>{{ i.label }}</b><small>{{ i.stage }}…</small></div>
      </template>
      <template v-if="dl.failed.length">
        <h3>下载失败</h3>
        <div v-for="i in dl.failed" :key="i.key" class="trpg-pop__row"><b>{{ i.label }}</b><small>失败</small><span class="trpg-field__hint">{{ i.error || '原因未知' }}。请到库页重试。</span></div>
      </template>
    </div>
  </span>
</template>
