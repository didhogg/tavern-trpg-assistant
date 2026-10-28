<script setup lang="ts">
import Icon from './Icon.vue'

/** 开关：开 = 圆钮在右、轨道填充主色（━●）；关 = 圆钮在左、轨道空心（○━）。 */
defineProps<{ label: string; disabled?: boolean; lockedReason?: string }>()
const model = defineModel<boolean>({ default: false })

function toggle(): void {
  model.value = !model.value
}
</script>

<template>
  <span class="trpg-switch-wrap" :title="lockedReason">
    <Icon v-if="lockedReason" name="lock" :size="14" />
    <button
      class="trpg-switch"
      type="button"
      role="switch"
      :aria-checked="model"
      :aria-label="label"
      :aria-description="lockedReason"
      :disabled="disabled"
      :data-on="model"
      @click="toggle"
    >
      <span class="trpg-switch__thumb" />
    </button>
  </span>
</template>
