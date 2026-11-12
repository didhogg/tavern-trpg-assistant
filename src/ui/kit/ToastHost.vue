<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useBannerStore, type HostBanner } from '../../stores/banners'
import { useModalStore } from '../../stores/modal'
import { useToastStore } from '../../stores/toast'
import ErrorDetailPage from '../libview/ErrorDetailPage.vue'
import { hasDetail, plainError } from '../libview/error-text'
import Icon from './Icon.vue'

const store = useToastStore()
/**
 * 错误横幅（页面里 ErrorBanner 登记的）和提示条在同一处、同一样式（错误红框）。横幅不自动消失：
 * 错误解决、页面关掉或点【×】才走。多于一条只露最新一条 +「还有 N 条提示」。
 */
const bannerStore = useBannerStore()
const modal = useModalStore()
const open = ref(false)
const banners = computed(() => [...bannerStore.banners].sort((a, b) => b.id - a.id))
const shown = computed(() => (open.value ? banners.value : banners.value.slice(0, 1)))
let seq = 0
function detail(b: HostBanner): void {
  modal.push({ key: `error-detail:${++seq}:${modal.depth}`, title: '出错详情', component: ErrorDetailPage, props: { text: b.text, what: b.what }, variant: 'sheet' })
}
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
  <div class="trpg-toasts" :style="{ '--trpg-host-top': `${top}px` }">
  <div v-if="banners.length" class="trpg-toasts__banners" data-testid="download-banners">
    <TransitionGroup name="trpg-toast">
      <div v-for="b in shown" :key="b.id" class="trpg-toast trpg-toast--banner" data-kind="error" role="alert" :data-testid="b.testid ?? 'error-banner'">
        <Icon name="warning" :size="16" />
        <span class="trpg-toast__text" :title="b.text">{{ plainError(b.text) }}</span>
        <button v-if="hasDetail(b.text)" class="trpg-toast__btn" type="button" data-testid="error-detail-open" @click="detail(b)">详情</button>
        <button v-for="a in b.actions" :key="a.label" class="trpg-toast__btn" type="button" :data-testid="a.testid" @click="a.run()">{{ a.label }}</button>
        <button v-if="b.dismiss" class="trpg-toast__btn" type="button" aria-label="关闭这条提示" @click="b.dismiss()"><Icon name="x" :size="14" /></button>
      </div>
    </TransitionGroup>
    <button v-if="banners.length > 1" class="trpg-toast trpg-toast--more" data-kind="error" type="button" :aria-expanded="open" data-testid="banners-more" @click="open = !open">
      <Icon :name="open ? 'minus' : 'caret-down'" :size="14" />{{ open ? '收起' : `还有 ${banners.length - 1} 条提示` }}
    </button>
  </div>
  <TransitionGroup name="trpg-toast" tag="div" class="trpg-toasts__list" role="status" aria-live="polite">
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
  </div>
</template>
