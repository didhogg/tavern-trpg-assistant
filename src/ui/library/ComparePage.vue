<script setup lang="ts">
import { computed } from 'vue'
import { stableStringify } from '../../core/hash'
import type { Entry } from '../../schemas/pack'

const props = defineProps<{ left: Entry; right: Entry; leftLabel: string; rightLabel: string }>()
const show = (v: unknown): string => (v === undefined ? '（没有）' : typeof v === 'string' ? v : JSON.stringify(v))
const rows = computed(() => {
  const keys = new Set([...Object.keys(props.left.data), ...Object.keys(props.right.data)])
  const out = [...keys]
    .filter((k) => stableStringify(props.left.data[k]) !== stableStringify(props.right.data[k]))
    .map((k) => ({ key: k, left: show(props.left.data[k]), right: show(props.right.data[k]) }))
  if (props.left.summary !== props.right.summary) out.unshift({ key: '简介', left: props.left.summary || '（没有）', right: props.right.summary || '（没有）' })
  return out
})
</script>

<template>
  <div class="page-stack" data-testid="compare">
    <p v-if="!rows.length" class="trpg-empty">两个版本没有差异。</p>
    <table v-else class="trpg-compare">
      <thead><tr><th>字段</th><th>{{ leftLabel }}</th><th>{{ rightLabel }}</th></tr></thead>
      <tbody><tr v-for="r in rows" :key="r.key"><th>{{ r.key }}</th><td>{{ r.left }}</td><td>{{ r.right }}</td></tr></tbody>
    </table>
  </div>
</template>
