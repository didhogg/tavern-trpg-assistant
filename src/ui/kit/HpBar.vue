<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ current: number | null; max: number | null; temp?: number; width?: number }>()
const pct = computed(() => {
  if (props.max === null || props.max <= 0 || props.current === null) return 0
  return Math.max(0, Math.min(100, Math.round((props.current / props.max) * 100)))
})
const tempPct = computed(() => {
  if (props.max === null || props.max <= 0 || !props.temp) return 0
  return Math.max(0, Math.min(100 - pct.value, Math.round((props.temp / props.max) * 100)))
})
const label = computed(() => `${props.current ?? 0}/${props.max ?? '?'}${props.temp ? `（临时 ${props.temp}）` : ''}`)
</script>

<template>
  <span class="trpg-hp" :style="{ '--hp-w': `${width ?? 64}px` }">
    <span class="trpg-hp__num">{{ current ?? 0 }}/{{ max }}</span>
    <span class="trpg-hp__track" role="img" :aria-label="`生命 ${label}`">
      <span class="trpg-hp__fill" :style="{ width: `${pct}%` }" />
      <span v-if="temp" class="trpg-hp__temp" :style="{ left: `${pct}%`, width: `${tempPct}%` }" />
    </span>
  </span>
</template>

<style scoped>
.trpg-hp { display: inline-flex; align-items: center; gap: 6px; flex: none; }
.trpg-hp__num { font-size: 13px; font-weight: 500; font-variant-numeric: tabular-nums; white-space: nowrap; }
.trpg-hp__track { width: var(--hp-w); height: 6px; border-radius: 3px; background: var(--line); overflow: hidden; position: relative; flex: none; }
.trpg-hp__fill { position: absolute; inset: 0 auto 0 0; background: var(--ok); border-radius: 3px; }
.trpg-hp__temp { position: absolute; top: 0; bottom: 0; background: var(--gold); border-radius: 0 3px 3px 0; }
</style>
