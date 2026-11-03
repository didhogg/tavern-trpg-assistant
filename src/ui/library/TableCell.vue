<script setup lang="ts">
import { computed } from 'vue'
import Term from '../kit/Term.vue'
import { parseInline, type Segment } from './inline'

const props = defineProps<{ text: string }>()
const emit = defineEmits<{ ref: [id: string]; roll: [formula: string] }>()

type RollSegment = { kind: 'roll'; formula: string }
type CellSegment = Segment | RollSegment

/** 表格单元格：保留可点术语，并把 `{{roll:2d8}}` 变成可点的掷骰按钮。 */
const segments = computed<CellSegment[]>(() => {
  const out: CellSegment[] = []
  let last = 0
  for (const m of props.text.matchAll(/\{\{roll:([^}|]+)(?:\|[^}]*)?\}\}/g)) {
    if (m.index! > last) out.push(...parseInline(props.text.slice(last, m.index)))
    out.push({ kind: 'roll', formula: m[1].trim() })
    last = m.index! + m[0].length
  }
  if (last < props.text.length) out.push(...parseInline(props.text.slice(last)))
  return out
})
</script>

<template>
  <template v-for="(s, i) in segments" :key="i">
    <Term v-if="s.kind === 'ref'" @open="emit('ref', s.id)">{{ s.text }}</Term>
    <button v-else-if="s.kind === 'roll'" class="trpg-link" type="button" :aria-label="`掷 ${s.formula}`" @click="emit('roll', s.formula)">{{ s.formula }}</button>
    <span v-else-if="s.kind === 'mark'" class="trpg-blocks__mark">{{ s.text }}</span>
    <template v-else>{{ s.text }}</template>
  </template>
</template>
