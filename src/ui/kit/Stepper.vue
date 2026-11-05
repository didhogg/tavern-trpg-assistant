<script setup lang="ts">
import Icon from './Icon.vue'
/** 数字加减：数字居中放大，两侧是小圆按钮；数字由外面决定怎么显示。 */
defineProps<{ value: string | number; minusLabel: string; plusLabel: string; minusDisabled?: boolean; plusDisabled?: boolean; minusTestid?: string; plusTestid?: string; valueTestid?: string }>()
defineEmits<{ minus: []; plus: [] }>()
</script>

<template>
  <span class="trpg-stepper">
    <button class="trpg-stepper__btn" type="button" :disabled="minusDisabled" :aria-label="minusLabel" :data-testid="minusTestid" @click.stop="$emit('minus')"><Icon name="minus" :size="14" /></button>
    <b class="trpg-stepper__val" :data-testid="valueTestid">{{ value }}</b>
    <button class="trpg-stepper__btn" type="button" :disabled="plusDisabled" :aria-label="plusLabel" :data-testid="plusTestid" @click.stop="$emit('plus')"><Icon name="plus" :size="14" /></button>
  </span>
</template>
