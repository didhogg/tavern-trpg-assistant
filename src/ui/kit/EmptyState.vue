<script setup lang="ts">
import Icon from './Icon.vue'

/** 空状态：居中 48px 图标 + 一句说明 + 一个按钮（可选，放进默认插槽）。 */
defineProps<{ icon: string; text: string }>()
</script>

<template>
  <div class="trpg-emptystate">
    <Icon :name="icon" :size="48" />
    <p class="trpg-emptystate__text">{{ text }}</p>
    <slot />
  </div>
</template>
