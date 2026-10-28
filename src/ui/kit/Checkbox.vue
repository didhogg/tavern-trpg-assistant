<script setup lang="ts">
defineProps<{ disabled?: boolean; indeterminate?: boolean }>()
const model = defineModel<boolean>({ default: false })
</script>

<template>
  <label class="trpg-check" :data-disabled="disabled">
    <input v-model="model" type="checkbox" :disabled="disabled" :indeterminate="indeterminate" />
    <span class="trpg-check__text"><slot /></span>
  </label>
</template>
