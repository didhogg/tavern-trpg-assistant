<script setup lang="ts">
import { computed } from 'vue'
import { ICONS } from './icons'

const props = defineProps<{ name: string; size?: number }>()
const markup = computed(() => ICONS[props.name] ?? '')
const px = computed(() => `${props.size ?? 18}px`)
</script>

<template>
  <!-- 内容来自 icons.ts 中的常量（Phosphor 路径），不含用户输入 -->
  <!-- eslint-disable-next-line vue/no-v-html -->
  <svg class="trpg-icon" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true" focusable="false" :width="px" :height="px" v-html="markup" />
</template>
