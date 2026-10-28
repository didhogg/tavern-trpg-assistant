<script setup lang="ts">
/** 下划线术语：只负责「查看」，点击或 Enter 触发 open；与同一行的开关、勾选框互不影响。 */
defineProps<{ label?: string }>()
defineEmits<{ open: [] }>()
</script>

<template>
  <button class="trpg-term" type="button" :aria-label="label" aria-haspopup="dialog" @click.stop="$emit('open')">
    <slot />
  </button>
</template>
