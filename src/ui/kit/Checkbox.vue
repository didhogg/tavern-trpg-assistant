<script setup lang="ts">
import Icon from './Icon.vue'

/** 勾选框：自绘方框 + 对勾；dl = 这一项已在【库】里下载好（灰勾 + 「已下载」，只是状态，仍可点掉）。 */
defineProps<{ disabled?: boolean; indeterminate?: boolean; label?: string; dl?: boolean }>()
const model = defineModel<boolean>({ default: false })
</script>

<template>
  <label class="trpg-check" :data-on="model" :data-dl="dl ? 'true' : undefined" :data-disabled="disabled">
    <input v-model="model" type="checkbox" :disabled="disabled" :indeterminate="indeterminate" :aria-label="label" />
    <i class="trpg-check__box" aria-hidden="true"><Icon v-if="model" name="check" :size="12" /></i>
    <span class="trpg-check__text"><slot /></span>
    <span v-if="dl" class="trpg-dl"><Icon name="download-simple" :size="11" />已下载</span>
  </label>
</template>
