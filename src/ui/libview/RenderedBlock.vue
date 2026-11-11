<script setup lang="ts">
import { computed, ref, shallowRef, watch } from 'vue'
import type { AuthorMarkup } from '../../library/runtime/frame/author-markup'
import { useAppStore } from '../../stores/app'
import AuthorFragment from './author-fragment'

/**
 * 界面不认识的块 / 要作者算文字的块（abilityDc「豁免 DC = 8 + …」、abilityAttackMod、abilityGeneric、bonus…）：
 * 交给作者渲染器生成内容，同时保留作者链接。作者也渲染不出来才显示「暂时无法显示」和原文。
 */
const props = defineProps<{ block: unknown; codeSet: string }>()
const app = useAppStore()
const ability = computed(() => {
  const block = props.block
  return block && typeof block === 'object' && 'type' in block && ['abilityDc', 'abilityAttackMod', 'abilityGeneric'].includes(String(block.type))
})
const state = ref<'loading' | 'ok' | 'fail'>('loading')
const markup = shallowRef<AuthorMarkup | null>(null)
const json = (v: unknown): string => JSON.stringify(v, null, 1)
let seq = 0

async function run(): Promise<void> {
  const mine = ++seq
  state.value = 'loading'
  try {
    const t = await (await app.svc().backend.library.service.frameOf(props.codeSet)).call('renderContent', JSON.parse(JSON.stringify(props.block)))
    if (mine !== seq) return
    markup.value = t
    state.value = t.html ? 'ok' : 'fail'
  } catch (e) {
    console.warn('[trpg-assistant] 作者渲染器没能渲染这一块', e)
    if (mine === seq) state.value = 'fail'
  }
}
watch(() => [props.block, props.codeSet], run, { immediate: true })
</script>

<template>
  <AuthorFragment v-if="state === 'ok' && markup" :markup="markup" :code-set="codeSet" :class="{ 'lib-ability': ability }" data-testid="rendered-block" />
  <div v-else-if="state === 'fail'" class="lib-block">
    <span class="lib-muted">这段内容暂时无法显示。</span>
    <details class="lib-fold"><summary>原文</summary><pre class="lib-fold__body">{{ json(block) }}</pre></details>
  </div>
</template>
