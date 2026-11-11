<script setup lang="ts">
import { computed } from 'vue'
import EntryBody from './EntryBody.vue'
import { BLOCKS } from './statblock'

/**
 * 条目内容的紧凑版（P5 T6）：书里摊开的怪物 / 物品等数值块、整个内嵌在书里的对象都用它显示。
 * 分类数值块用详情页同一个登记表（BLOCKS），正文交给同一个正文组件；不另写一套。对应作者的 getFnRenderCompact。
 */
const props = defineProps<{ prop: string; item: unknown; codeSet: string }>()
const block = computed(() => BLOCKS[props.prop]?.(props.item) ?? null)
const entries = computed(() => (typeof props.item === 'object' && props.item ? (props.item as { entries?: unknown }).entries ?? null : null))
</script>

<template>
  <div class="lib-embedded__body">
    <div v-if="block?.lines.length" class="lib-stat"><div v-for="l in block.lines" :key="l.label"><span>{{ l.label }}</span><span>{{ l.value }}</span></div></div>
    <div v-if="block?.abilities.length" class="lib-abil"><div v-for="a in block.abilities" :key="a.key"><small>{{ a.label }}</small><b>{{ a.score }}</b> ({{ a.mod }})</div></div>
    <template v-for="sec in block?.sections ?? []" :key="sec.title"><h4>{{ sec.title }}</h4><EntryBody :block="sec.entries" :code-set="codeSet" /></template>
    <EntryBody v-if="entries" :block="entries" :code-set="codeSet" />
    <p v-if="!block?.lines.length && !block?.sections.length && !entries" class="lib-muted">这一条没有正文。</p>
  </div>
</template>
