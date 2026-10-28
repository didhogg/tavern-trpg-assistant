<script setup lang="ts">
defineProps<{ options: Array<{ value: string; label: string }>; label: string }>()
const model = defineModel<string>()
</script>

<template>
  <div class="trpg-seg" role="group" :aria-label="label">
    <button v-for="o in options" :key="o.value" type="button" :aria-pressed="model === o.value" @click="model = o.value">
      {{ o.label }}
    </button>
  </div>
</template>
