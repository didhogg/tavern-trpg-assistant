<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { getSource } from '../../library/sources'
import { useAppStore } from '../../stores/app'
import { useReaderPositionStore } from '../../stores/reader-position'
import { replaceReader, type ReaderPart } from './open'

/** 书 / 冒险阅读器标题栏上的 中 / En 切换（P5 T6）：外观同条目详情；另一种语言有没有这本由后端 counterparts.corpus 判断。 */
const props = defineProps<{ set: string; prop: string; id: string; name: string; readerKey?: string; part?: ReaderPart }>()
const app = useAppStore()
const readerPos = useReaderPositionStore()
const lang = computed(() => (getSource(props.set).lang === 'zh' ? 'zh' : 'en'))
const target = ref<{ set: string; prop: string; id: string } | null>(null)
const hint = ref('正在找另一种语言…')
const WHY: Record<string, string> = { 'not-installed': '另一种语言的资料还没装', 'not-found': '另一种语言里这本还没下载', 'no-counterpart': '另一种语言里没有这本', 'not-paired': '这套资料没有另一种语言' }
let seq = 0
async function load(): Promise<void> {
  const my = ++seq
  target.value = null
  hint.value = '正在找另一种语言…'
  try {
    const r = await app.svc().backend.library.counterparts.corpus({ set: props.set, prop: props.prop, id: props.id })
    if (my !== seq) return
    target.value = r.target
    hint.value = r.target ? '' : WHY[r.reason ?? ''] ?? '另一种语言里没有这本'
  } catch (e) {
    if (my !== seq) return
    console.error('[trpg-assistant] 查另一种语言的书失败', e)
    hint.value = '这次没查出另一种语言（出错了，重新打开再试）'
  }
}
// 换页时标题栏组件会被复用：set / prop / id 变了要重新查，不能拿着上一页的目标。
watch(() => [props.set, props.prop, props.id] as const, () => void load(), { immediate: true })
function pick(v: 'en' | 'zh'): void {
  if (v === lang.value || !target.value) return
  const pos = readerPos.get(props.readerKey)
  // 章节名会随语言变化（例如「装备」/「Equipment」），跨语言定位用标题顺序，不拿中文名去英文正文里找。
  const part = pos
    ? { chapter: pos.chapter, section: null, ixNamedSection: null, headingIndex: pos.headingIndex ?? null, tocOpen: pos.tocOpen, scrollTop: pos.scrollTop }
    : props.part?.chapter != null ? props.part : undefined
  replaceReader({ ...target.value, name: props.name, ...(part ? { part } : {}) })
}
</script>

<template>
  <span class="lib-langsw" role="group" aria-label="语言" data-testid="reader-lang">
    <button
      v-for="o in ([{ v: 'en', t: 'En' }, { v: 'zh', t: '中文' }] as const)" :key="o.v" type="button" class="lib-langsw__btn"
      :aria-pressed="lang === o.v" :disabled="lang !== o.v && !target" :title="lang !== o.v && !target ? hint : lang === o.v ? '当前语言' : `换成${o.t}`"
      @click="pick(o.v)"
    >
      {{ o.t }}
    </button>
  </span>
</template>
