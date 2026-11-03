<script setup lang="ts">
import { computed } from 'vue'

/** 生命栏：「生命」小标签 + 衬线「12 / 18」+ 8px 红色血条；临时生命接在红色后面一段金色。上限未知时由外面留空。 */
const props = defineProps<{ current: number | null; max: number | null; temp?: number }>()
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
  <span class="trpg-hpm">
    <span class="trpg-hpm__top"><span class="trpg-stat__label">生命</span> <span class="trpg-hpm__num"><b>{{ current ?? 0 }}</b><i>/</i><span>{{ max }}</span></span></span>
    <span class="trpg-hpm__track" role="img" :aria-label="`生命 ${label}`">
      <span class="trpg-hpm__fill" :style="{ width: `${pct}%` }" />
      <span v-if="temp" class="trpg-hpm__temp" :style="{ left: `${pct}%`, width: `${tempPct}%` }" />
    </span>
  </span>
</template>
