<script setup lang="ts">
/** disabled：该项暂不可用（灰色，点不动）；hint 写不可用的原因，显示成悬停提示。 */
defineProps<{ options: Array<{ value: string; label: string; disabled?: boolean; hint?: string }>; label: string }>()
const model = defineModel<string>()
</script>

<template>
  <div class="trpg-seg" role="group" :aria-label="label">
    <button v-for="o in options" :key="o.value" type="button" :aria-pressed="model === o.value" :disabled="o.disabled" :title="o.disabled ? o.hint : undefined" @click="model = o.value">
      {{ o.label }}
    </button>
  </div>
</template>
