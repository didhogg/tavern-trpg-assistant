<script setup lang="ts">
import { ref, shallowRef, watch } from 'vue'
import type { AuthorMarkup } from '../../library/runtime/frame/author-markup'
import { useAppStore } from '../../stores/app'
import AuthorFragment from './author-fragment'
import EntryBody from './EntryBody.vue'

/**
 * 条目内容的紧凑版（P5 T6）：书里摊开的怪物 / 物品等数值块、整个内嵌在书里的对象都用它显示。
 * 和详情页同一个入口：作者的整条渲染（frame renderEntity，P5-5 §11.5），链接和表格照作者保留。
 * 作者也画不出来时退回通用正文（条目自己的 entries）。
 */
const props = defineProps<{ prop: string; item: unknown; codeSet: string }>()
const app = useAppStore()
const markup = shallowRef<AuthorMarkup | null>(null)
const state = ref<'loading' | 'ok' | 'fallback'>('loading')
watch(() => [props.prop, props.item, props.codeSet] as const, async ([prop, item, codeSet]) => {
  state.value = 'loading'
  try {
    markup.value = await (await app.svc().backend.library.service.frameOf(codeSet)).call('renderEntity', prop, JSON.parse(JSON.stringify(item)))
    state.value = markup.value ? 'ok' : 'fallback'
  } catch (e) {
    console.warn('[trpg-assistant] 作者没能画出书里的这一条，用通用正文显示', e)
    state.value = 'fallback'
  }
}, { immediate: true })
const entries = (item: unknown): unknown => (item && typeof item === 'object' ? (item as { entries?: unknown }).entries ?? null : null)
</script>

<template>
  <div class="lib-embedded__body">
    <div v-if="state === 'loading'" class="lib-skel" aria-busy="true"><i /><i style="width:70%" /></div>
    <AuthorFragment v-else-if="state === 'ok' && markup" :markup="markup" :code-set="codeSet" class="lib-entity" data-testid="embedded-author" />
    <EntryBody v-else-if="entries(item)" :block="entries(item)" :code-set="codeSet" />
    <p v-else class="lib-muted">这一条没有正文。</p>
  </div>
</template>
