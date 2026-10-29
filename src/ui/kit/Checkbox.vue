<script setup lang="ts">
defineProps<{ disabled?: boolean; indeterminate?: boolean; label?: string }>()
const model = defineModel<boolean>({ default: false })
</script>

<template>
  <label class="trpg-check" :data-disabled="disabled">
    <input v-model="model" type="checkbox" :disabled="disabled" :indeterminate="indeterminate" :aria-label="label" />
    <span class="trpg-check__text"><slot /></span>
  </label>
</template>
