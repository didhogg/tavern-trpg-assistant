<script setup lang="ts">
// 技能 / 工具熟练的一张表（侧栏和属性页共用）：熟练标记 · 属性 · 名字 · 加值 · 被动；全取官方显示数据，点了不掷（掷骰等 P7）。
import { usePersonStore } from '../../stores/person'
import { named, signed, type skills } from './view'

defineProps<{ rows: ReturnType<typeof skills>; passive?: boolean; testid?: string }>()
const person = usePersonStore()
const PROF = (p: number): string => (p >= 2 ? '◉' : p >= 1 ? '●' : p > 0 ? '◐' : '○')
</script>

<template>
  <ul class="ps-skills" :data-testid="testid">
    <li v-for="k in rows" :key="k.key" :title="k.hover">
      <span class="ps-prof" :data-level="k.proficient">{{ PROF(k.proficient) }}</span>
      <span class="ps-skill-ab">{{ named(person.glossary, 'abilities', k.baseAbility) }}</span><span class="ps-skill-name">{{ k.label }}</span>
      <b>{{ signed(k.total) }}</b><small>{{ passive === false ? '' : k.passive }}</small>
    </li>
  </ul>
</template>
