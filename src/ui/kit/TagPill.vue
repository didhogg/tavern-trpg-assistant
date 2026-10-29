<script setup lang="ts">
/** 药丸标签（带 ×）：标签文字与 × 的点击范围分开；× 的名称写明移除的是谁的哪个标签。 */
defineProps<{ label: string; owner?: string }>()
defineEmits<{ remove: [] }>()
</script>

<template>
  <span class="trpg-pill trpg-tag">
    <span>{{ label }}</span>
    <button class="trpg-tag__x" type="button" :aria-label="`移除${owner ? `${owner}的` : ''}『${label}』标签`" @click="$emit('remove')">×</button>
  </span>
</template>
