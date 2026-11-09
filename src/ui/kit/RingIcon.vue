<script setup lang="ts">
import { computed } from 'vue'

/**
 * 资料进度环（侧栏库标签 30px）。环 = 到了第几步（下载 → 整理 → 准备结算），不是精确百分比。
 * state：running 按 pct 填充 | spin 当前阶段没有总数，转圈 | warn 失败（虚线 + 角标 !）| done 闭合 + 角标 ✓
 */
const props = withDefaults(defineProps<{ state: 'running' | 'spin' | 'warn' | 'done'; pct?: number; size?: number }>(), { pct: 0, size: 30 })
const r = computed(() => props.size / 2 - 3)
const c = computed(() => 2 * Math.PI * r.value)
const mid = computed(() => props.size / 2)
const dash = computed(() => {
  if (props.state === 'running') return `${c.value * Math.min(1, Math.max(0.04, props.pct))} ${c.value}`
  if (props.state === 'spin') return `${c.value * 0.22} ${c.value * 0.1}`
  if (props.state === 'warn') return '4 3'
  return `${c.value} ${c.value}`
})
const badge = computed(() => (props.state === 'warn' ? '!' : props.state === 'done' ? '✓' : ''))
</script>

<template>
  <span class="trpg-ring" :data-state="state" :style="{ width: `${size}px`, height: `${size}px` }">
    <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`" aria-hidden="true">
      <circle data-part="track" :cx="mid" :cy="mid" :r="r" fill="none" stroke-width="3" />
      <circle data-part="arc" :cx="mid" :cy="mid" :r="r" fill="none" stroke-width="3" stroke-linecap="round" :stroke-dasharray="dash" :transform="state === 'spin' ? undefined : `rotate(-90 ${mid} ${mid})`" />
    </svg>
    <span v-if="badge" class="trpg-ring__badge">{{ badge }}</span>
  </span>
</template>
