<script setup lang="ts">
import { inject, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useAppStore } from '../../stores/app'
import { useDownloadsStore, type DownloadItem } from '../../stores/downloads'
import { useUiStore } from '../../stores/ui'
import { useLibNoticeStore } from '../../stores/libnotice'
import Icon from '../kit/Icon.vue'
import RingIcon from '../kit/RingIcon.vue'
import type { InstallReport } from '../../library/install'

/**
 * 侧栏 / 底部标签栏上的"库"：有下载时，图标外显示进度环和任务数。
 * 悬浮窗（P5 T6 B1）：挂到插件最外层（不被插件框裁掉，可以超出插件框、不超出屏幕），按图标位置定位；
 * 鼠标从图标移进悬浮窗不会消失；按后端任务号取消；失败转入横幅。
 */
const props = defineProps<{ variant: 'side' | 'tab'; labeled: boolean }>()
const app = useAppStore()
const dl = useDownloadsStore()
const ui = useUiStore()
const notices = useLibNoticeStore()
const portalTarget = inject<HTMLElement | undefined>('portalTarget', undefined)
const open = ref(false)
const btn = ref<HTMLElement | null>(null)
const pop = ref<HTMLElement | null>(null)
const pos = ref<{ left: number; top: number }>({ left: 0, top: 0 })
let closeTimer: ReturnType<typeof setTimeout> | undefined

/** 按图标在屏幕上的位置放悬浮窗：侧栏放在图标右边，底栏放在图标上方；超出屏幕就往回收。 */
async function place(): Promise<void> {
  await nextTick()
  const b = btn.value?.getBoundingClientRect()
  const p = pop.value?.getBoundingClientRect()
  if (!b || !p) return
  const pad = 8
  let left = props.variant === 'side' ? b.right + pad : b.left + b.width / 2 - p.width / 2
  let top = props.variant === 'side' ? b.bottom - p.height : b.top - p.height - pad
  left = Math.min(Math.max(pad, left), window.innerWidth - p.width - pad)
  top = Math.min(Math.max(pad, top), window.innerHeight - p.height - pad)
  pos.value = { left, top }
}
// 内容变了（新任务、失败原因、进度文字）悬浮窗大小会变：跟着重新定位，不让它被撑出屏幕
let ro: ResizeObserver | undefined
watch(pop, (el) => { ro?.disconnect(); if (el) { ro = new ResizeObserver(() => void place()); ro.observe(el) } })
function show(): void {
  clearTimeout(closeTimer)
  if (!dl.count) return
  open.value = true
  void place()
}
function hideSoon(): void {
  clearTimeout(closeTimer)
  closeTimer = setTimeout(() => { open.value = false }, 250)
}
function onEnter(event: PointerEvent): void { if (event.pointerType === 'mouse') show() }
function onLeave(event: PointerEvent): void { if (event.pointerType === 'mouse') hideSoon() }
function onClick(event: MouseEvent): void {
  const pt = (event as PointerEvent).pointerType
  if (pt && pt !== 'mouse' && dl.count) { if (open.value) open.value = false; else show(); return }
  ui.go('library')
}
function onFocusOut(event: FocusEvent): void {
  const to = event.relatedTarget as Node | null
  if (!to || !(pop.value?.contains(to) || btn.value?.contains(to))) hideSoon()
}
function closeOutside(event: Event): void {
  const path = event.composedPath()
  if ((btn.value && path.includes(btn.value)) || (pop.value && path.includes(pop.value))) return
  open.value = false
}
function onKey(event: KeyboardEvent): void { if (event.key === 'Escape') { open.value = false; btn.value?.focus() } }
watch(open, (now) => {
  if (now) { document.addEventListener('pointerdown', closeOutside, true); document.addEventListener('keydown', onKey, true) } else { document.removeEventListener('pointerdown', closeOutside, true); document.removeEventListener('keydown', onKey, true) }
})
watch(() => dl.count, (n) => { if (!n) open.value = false; else if (open.value) void place() })
onBeforeUnmount(() => { ro?.disconnect(); clearTimeout(closeTimer); document.removeEventListener('pointerdown', closeOutside, true); document.removeEventListener('keydown', onKey, true) })

const tasks = () => app.svc().backend.library.tasks
const cancelling = ref(new Set<string>())
async function cancel(i: DownloadItem): Promise<void> {
  const id = i.taskId
  if (cancelling.value.has(id)) return
  cancelling.value.add(id)
  try {
    await tasks().cancel(id)
    const state = await tasks().wait(id)
    const report = state.result as InstallReport | null
    if (state.status === 'cancelled') {
      const text = report?.publishable && !report.cancelled
        ? `「${i.label}」已安装，已停止后续准备。`
        : `已取消「${i.label}」未完成的下载。`
      notices.show({ key: `download:cancel:${id}`, text, actions: [] })
    }
  } catch (e) {
    const why = e instanceof Error ? e.message : String(e)
    notices.show({ key: `download:cancel:${id}`, text: `取消「${i.label}」失败：${why}`, actions: [] })
  } finally {
    cancelling.value.delete(id)
    dl.refresh()
  }
}
const klass = props.variant === 'side' ? 'trpg-nav' : 'trpg-tab'
const pctText = (i: DownloadItem): string => (i.pct === null ? '' : `${Math.round(i.pct * 100)}%`)
</script>

<template>
  <button ref="btn" :class="klass" type="button" title="库" :aria-label="dl.count ? `库，${dl.count} 项资料未完成` : '库'" :aria-expanded="dl.count ? open : undefined" :aria-current="ui.page === 'library' ? 'page' : undefined" data-testid="nav-library" @click="onClick" @pointerenter="onEnter" @pointerleave="onLeave" @focus="show" @focusout="onFocusOut">
    <span v-if="dl.ring !== 'none'" class="trpg-libmark" data-testid="lib-ring" :data-state="dl.ring">
      <span class="trpg-libmark__icon"><RingIcon :state="dl.ring" :pct="dl.pct" /><Icon name="books" :size="16" /><b v-if="dl.count" class="trpg-count" aria-hidden="true">{{ dl.count }}</b></span>
    </span>
    <Icon v-else name="books" :size="variant === 'side' ? 20 : 22" />
    <span v-if="labeled">库</span>
  </button>
  <Teleport :to="portalTarget ?? 'body'">
    <div v-if="open && dl.count" ref="pop" class="trpg-pop" role="dialog" aria-label="下载进度" data-testid="lib-pop" :style="{ left: `${pos.left}px`, top: `${pos.top}px` }" @pointerenter="show" @pointerleave="hideSoon" @focusout="onFocusOut">
      <h3>下载</h3>
      <div v-for="i in dl.running" :key="i.key" class="trpg-pop__row" data-status="running" data-testid="lib-pop-row">
        <span class="trpg-pop__ring"><RingIcon :state="i.pct === null ? 'spin' : 'running'" :pct="i.pct ?? 0" :size="26" /></span>
        <span class="trpg-pop__main"><b>{{ i.label }}</b><small>{{ cancelling.has(i.taskId) ? '正在取消…' : [i.stage, pctText(i)].filter(Boolean).join(' · ') }}</small></span>
        <span class="trpg-pop__acts">
          <button class="trpg-icon-btn" type="button" :disabled="cancelling.has(i.taskId)" :aria-label="`取消下载《${i.label}》`" title="取消下载" @click="cancel(i)"><Icon name="x" :size="14" /></button>
        </span>
      </div>
    </div>
  </Teleport>
</template>
