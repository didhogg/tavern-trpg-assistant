<script setup lang="ts">
/** 数值栏：小标签在上、衬线大数字在下（AC、被动察觉、速度、模板的数值条共用）。没有数值整栏留空。 */
defineProps<{ label: string; value?: number | string; unit?: string; size?: 'lg' | 'md' }>()
</script>

<template>
  <span class="trpg-stat" :class="size === 'md' ? 'trpg-stat--md' : ''">
    <template v-if="value !== undefined && value !== ''"><span class="trpg-stat__label">{{ label }}</span><span class="trpg-stat__sp">{{ ' ' }}</span><span class="trpg-stat__value">{{ value }}<span v-if="unit" class="trpg-stat__unit"> {{ unit }}</span></span></template>
  </span>
</template>
