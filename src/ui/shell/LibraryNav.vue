<script setup lang="ts">
import { plainError } from '../libview/error-text'
import { computed, inject, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useAppStore } from '../../stores/app'
import { useDownloadsStore, type DownloadItem } from '../../stores/downloads'
import { useUiStore } from '../../stores/ui'
import { useToastStore } from '../../stores/toast'
import Icon from '../kit/Icon.vue'
import RingIcon from '../kit/RingIcon.vue'
import { askConfirm } from '../kit/confirm'

/**
 * 侧栏 / 底部标签栏上的"库"：没有下载时只有图标；有下载 / 暂停 / 失败时，图标外一圈小环 + 数字。
 * 悬浮窗（P5 T6 B1）：挂到插件最外层（不被插件框裁掉，可以超出插件框、不超出屏幕），按图标位置定位；
 * 鼠标从图标移进悬浮窗不会消失；每一项按后端任务号暂停 / 继续 / 取消，失败可重试或逐项关掉；最后一项没了外环就消失。
 */
const props = defineProps<{ variant: 'side' | 'tab'; labeled: boolean }>()
const app = useAppStore()
const dl = useDownloadsStore()
const ui = useUiStore()
const toast = useToastStore()
const portalTarget = inject<HTMLElement | undefined>('portalTarget', undefined)
const open = ref(false)
const btn = ref<HTMLElement | null>(null)
const pop = ref<HTMLElement | null>(null)
const pos = ref<{ left: number; top: number }>({ left: 0, top: 0 })
const items = computed(() => [...dl.running, ...dl.paused, ...dl.failed])
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
const ringOf = (i: DownloadItem): 'running' | 'spin' | 'warn' => (i.status === 'failed' ? 'warn' : i.pct === null ? 'spin' : 'running')
function pause(i: DownloadItem): void { if (i.taskId && !tasks().pause(i.taskId)) toast.error('现在不能暂停这一项'); dl.refresh() }
async function resume(i: DownloadItem): Promise<void> {
  if (!i.taskId) return
  try { const id = await tasks().resume(i.taskId); if (id) dl.rememberTask(id, i.label) } catch (e) { console.error('[trpg-assistant] 继续下载失败', e); toast.error(e instanceof Error ? e.message : '继续下载没有成功') }
  dl.refresh()
}
async function cancel(i: DownloadItem): Promise<void> {
  if (!i.taskId) return
  const ok = await askConfirm({ title: `取消下载《${i.label}》？`, message: '已经下好的文件会留着，之后重新下载可以接着用；书架保持现在的样子。', confirmLabel: '取消下载', cancelLabel: '继续下载', danger: true })
  if (!ok) return
  try { await tasks().cancel(i.taskId) } catch (e) { console.error('[trpg-assistant] 取消下载失败', e); toast.error('取消没有成功') }
  dl.refresh()
}
function retry(i: DownloadItem): void {
  if (i.kind === 'official' && i.key.startsWith('official-book:')) { if (!dl.retryTask(i.key)) ui.go('library') } else if (i.kind === 'official') { dl.markRetried(i.key); for (const set of i.sets ?? []) tasks().startOfficial(set) } else if (i.kind === 'adventure' && i.set && i.item) { dl.markRetried(i.key); tasks().startAdventure(i.set, i.item) } else dl.retryBrew(i.key)
  dl.refresh()
}
function clearFailed(): void { for (const i of dl.failed) dl.dismiss(i.key) }
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
      <div v-for="i in items" :key="i.key" class="trpg-pop__row" :data-status="i.status" data-testid="lib-pop-row">
        <span class="trpg-pop__ring"><RingIcon :state="ringOf(i)" :pct="i.pct ?? 0" :size="26" /></span>
        <span class="trpg-pop__main" :title="i.status === 'failed' ? i.error ?? undefined : undefined"><b>{{ i.label }}</b><small>{{ i.status === 'failed' ? `失败：${plainError(i.error)}` : [i.stage, pctText(i)].filter(Boolean).join(' · ') }}</small></span>
        <span class="trpg-pop__acts">
          <template v-if="i.status === 'running' && i.taskId && i.key.startsWith('official-book:')"><button class="trpg-btn trpg-btn--small" type="button" @click="pause(i)">暂停</button></template>
          <template v-if="i.status === 'paused'"><button class="trpg-btn trpg-btn--small trpg-btn--primary" type="button" @click="resume(i)">继续</button></template>
          <button v-if="i.status !== 'failed' && i.taskId" class="trpg-icon-btn" type="button" :aria-label="`取消下载《${i.label}》`" title="取消下载" @click="cancel(i)"><Icon name="x" :size="14" /></button>
          <template v-if="i.status === 'failed'">
            <button class="trpg-btn trpg-btn--small" type="button" data-testid="pop-retry" @click="retry(i)">重试</button>
            <button class="trpg-icon-btn" type="button" :aria-label="`关掉《${i.label}》这条失败`" title="关掉这一条" @click="dl.dismiss(i.key)"><Icon name="x" :size="14" /></button>
          </template>
        </span>
      </div>
      <div v-if="dl.failed.length > 1" class="trpg-pop__foot"><button class="trpg-btn trpg-btn--small" type="button" @click="clearFailed">清除失败项</button></div>
    </div>
  </Teleport>
</template>
