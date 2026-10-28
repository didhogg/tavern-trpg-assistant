<script setup lang="ts">
const props = defineProps<{
  message: string
  details?: string[]
  confirmLabel: string
  cancelLabel?: string
  danger?: boolean
  onAnswer: (value: boolean) => void
}>()
</script>

<template>
  <div class="trpg-confirm">
    <p class="trpg-confirm__message">{{ props.message }}</p>
    <ul v-if="props.details?.length" class="trpg-confirm__details">
      <li v-for="line in props.details" :key="line">{{ line }}</li>
    </ul>
    <div class="trpg-confirm__actions">
      <button class="trpg-btn" type="button" :data-autofocus="props.danger ? '' : undefined" @click="props.onAnswer(false)">{{ props.cancelLabel ?? '取消' }}</button>
      <button class="trpg-btn" :class="props.danger ? 'trpg-btn--danger' : 'trpg-btn--primary'" type="button" :data-autofocus="props.danger ? undefined : ''" @click="props.onAnswer(true)">
        {{ props.confirmLabel }}
      </button>
    </div>
  </div>
</template>
