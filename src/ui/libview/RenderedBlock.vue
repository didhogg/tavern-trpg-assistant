<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useAppStore } from '../../stores/app'

/**
 * 界面不认识的块 / 要作者算文字的块（abilityDc「豁免 DC = 8 + …」、abilityAttackMod、abilityGeneric、bonus…）：
 * 交给作者渲染器出文字（frame renderText，P5-1 B-40），不在界面里手翻。作者也渲染不出来才显示「暂时无法显示」+ 折叠原文。
 */
const props = defineProps<{ block: unknown; codeSet: string }>()
const app = useAppStore()
const state = ref<'loading' | 'ok' | 'fail'>('loading')
const text = ref('')
const json = (v: unknown): string => JSON.stringify(v, null, 1)
let seq = 0

async function run(): Promise<void> {
  const mine = ++seq
  state.value = 'loading'
  try {
    const t = await (await app.svc().backend.library.service.frameOf(props.codeSet)).call('renderText', JSON.parse(JSON.stringify(props.block)) as Record<string, unknown>)
    if (mine !== seq) return
    text.value = t
    state.value = t ? 'ok' : 'fail'
  } catch (e) {
    console.warn('[trpg-assistant] 作者渲染器没能渲染这一块', e)
    if (mine === seq) state.value = 'fail'
  }
}
onMounted(run)
watch(() => props.block, run)
</script>

<template>
  <p v-if="state === 'ok'" class="lib-ability" data-testid="rendered-block">{{ text }}</p>
  <div v-else-if="state === 'fail'" class="lib-block">
    <span class="lib-muted">这段内容暂时无法显示。</span>
    <details class="lib-fold"><summary>原文</summary><pre class="lib-fold__body">{{ json(block) }}</pre></details>
  </div>
</template>
