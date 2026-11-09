<script setup lang="ts">
import Icon from './Icon.vue'
/** 数字加减：[−] 数字 [+]；数字怎么显示由外面决定（例如「7 天」）。 */
defineProps<{ value: string | number; minusLabel: string; plusLabel: string; minusDisabled?: boolean; plusDisabled?: boolean }>()
defineEmits<{ minus: []; plus: [] }>()
</script>

<template>
  <span class="trpg-stepper">
    <button class="trpg-stepper__btn" type="button" :disabled="minusDisabled" :aria-label="minusLabel" @click.stop="$emit('minus')"><Icon name="minus" :size="14" /></button>
    <b class="trpg-stepper__val">{{ value }}</b>
    <button class="trpg-stepper__btn" type="button" :disabled="plusDisabled" :aria-label="plusLabel" @click.stop="$emit('plus')"><Icon name="plus" :size="14" /></button>
  </span>
</template>
