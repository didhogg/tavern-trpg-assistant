<script lang="ts">
import type { EntryRef } from '../../library/scopes'
/** 同一个块（作者程序 + 战役 + 块内容）只问一次指向：一章里可能有几十个同样的块（所有实例共用）。 */
const memo = new Map<string, Promise<{ label: string | null; ref: EntryRef | null; isFluff: boolean }>>()
</script>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { useAppStore } from '../../stores/app'
import { useLibViewStore } from '../../stores/libview'
import Icon from '../kit/Icon.vue'
import Term from '../kit/Term.vue'
import EmbeddedEntity from './EmbeddedEntity.vue'
import EntryBody from './EntryBody.vue'
import { openEntry } from './open'

/**
 * 书里的数值块（{type:"statblock", tag/prop, name, source}，P5 T6）：照作者 _renderStatblock 的做法——
 * 带标题的框，把引用的条目内容摊开在书里（标了 collapsed 的默认折叠），进入视野才加载；
 * 背景类（monsterFluff 等）显示那一条的背景描述和配图。指向哪一条全由作者函数（frame statblockMeta）+ 库定位决定。
 */
const props = defineProps<{ block: Record<string, unknown>; codeSet: string }>()
const app = useAppStore()
const lib = useLibViewStore()
const root = ref<HTMLElement | null>(null)
const label = ref(String(props.block.displayName ?? props.block.name ?? ''))
const target = ref<EntryRef | null>(null)
const isFluff = ref(false)
const open = ref(!props.block.collapsed)
type Content = { kind: 'loading' } | { kind: 'entity'; item: unknown } | { kind: 'fluff'; entries: unknown; images: unknown } | { kind: 'missing'; why: string }
const content = shallowRef<Content | null>(null)
let meta: Promise<void> | null = null
let io: IntersectionObserver | undefined

function resolve(): Promise<void> {
  if (meta) return meta
  const c = lib.campaignLib
  // 块是响应式代理，传给小窗要先变成普通对象（postMessage 克隆不了代理）
  const block = JSON.parse(JSON.stringify(props.block)) as Record<string, unknown>
  const key = `${props.codeSet}|${c?.codeSet ?? ''}|${JSON.stringify(block)}`
  let p = memo.get(key)
  if (!p) {
    p = (async () => {
      const m = await (await app.svc().backend.library.service.frameOf(props.codeSet)).call('statblockMeta', block)
      const at = c && m.hash ? await app.svc().backend.library.scoped.locate(c, m.target, m.hash) : null
      return { label: m.displayName, ref: at ? at.ref : null, isFluff: m.isFluff }
    })()
    memo.set(key, p)
  }
  meta = p.then((r) => { if (r.label) label.value = r.label; target.value = r.ref; isFluff.value = r.isFluff }, (e: unknown) => { memo.delete(key); throw e })
  return meta
}
async function load(): Promise<void> {
  if (content.value) return
  content.value = { kind: 'loading' }
  try {
    await resolve()
    const ref = target.value
    if (!ref) { content.value = { kind: 'missing', why: '库里没有这一条（可能它所在的书还没装）' }; return }
    const s = app.svc().backend.library
    if (isFluff.value) {
      const f = await s.service.fluff(ref.set, ref.prop, ref.hash)
      const fl = (f?.fluff ?? null) as { entries?: unknown; images?: unknown } | null
      content.value = fl && (fl.entries || fl.images) ? { kind: 'fluff', entries: fl.entries ?? null, images: fl.images ?? null } : { kind: 'missing', why: f?.fluffError ? `背景描述读不出来：${f.fluffError}` : '作者没给这一条写背景描述' }
      return
    }
    const c = lib.campaignLib
    const d = c ? await s.scoped.detail(c, ref, { browse: true }) : null
    const item = d && !('hidden' in d) ? d.item : (await s.service.detail(ref.set, ref.prop, ref.hash))?.item
    content.value = item ? { kind: 'entity', item } : { kind: 'missing', why: '库里没有这一条（可能它所在的书还没装）' }
  } catch (e) {
    console.warn('[trpg-assistant] 读取书里的数值块失败', e)
    content.value = { kind: 'missing', why: '这一块这次没读出来，收起再展开可以重试' }
  }
}
function toggle(): void {
  open.value = !open.value
  if (open.value && content.value?.kind === 'missing') content.value = null
  if (open.value) void load()
}
onMounted(() => {
  void resolve().catch((e: unknown) => console.warn('[trpg-assistant] 解析内嵌块指向失败', e))
  // 照作者：进入视野才加载内容，一章几十个块也不会一下子全读
  io = new IntersectionObserver((list) => { if (list.some((x) => x.isIntersecting) && open.value) { void load(); io?.disconnect() } }, { rootMargin: '200px' })
  if (root.value) io.observe(root.value)
})
onBeforeUnmount(() => io?.disconnect())
</script>

<template>
  <section ref="root" class="lib-embedded" :data-fluff="isFluff ? 'true' : undefined" data-testid="statblock-block">
    <header class="lib-embedded__head">
      <button class="trpg-icon-btn" type="button" :aria-expanded="open" :aria-label="open ? `收起「${label}」` : `展开「${label}」`" @click="toggle"><Icon :name="open ? 'caret-down' : 'caret-right'" :size="16" /></button>
      <Term v-if="target" @open="openEntry(target!, label)">{{ label }}</Term><b v-else>{{ label }}</b>
      <small class="lib-muted">{{ isFluff ? '背景描述' : '数值块' }}</small>
    </header>
    <div v-if="open">
      <div v-if="!content || content.kind === 'loading'" class="lib-skel" aria-busy="true"><i style="width:60%" /><i /></div>
      <p v-else-if="content.kind === 'missing'" class="lib-muted">{{ content.why }}</p>
      <template v-else-if="content.kind === 'fluff'">
        <EntryBody v-if="content.entries" :block="content.entries" :code-set="codeSet" />
        <EntryBody v-if="content.images" :block="content.images" :code-set="codeSet" />
      </template>
      <EmbeddedEntity v-else-if="target" :prop="target.prop" :item="content.item" :code-set="codeSet" />
    </div>
  </section>
</template>
