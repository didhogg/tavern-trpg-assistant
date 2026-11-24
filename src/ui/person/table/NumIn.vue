<script setup lang="ts">
// 表格里的原地数字输入（照 Tidy5e TextInputQuadrone / NumberInputQuadrone 与 dnd5e parseInputDelta）：
// 直接填数 = 设为这个数；填 +2 / -1 = 在原数上加减；回车或离开生效，Esc 还原。step = 两边带 − ＋（Tidy5e InlineQuantityTracker）。
import { ref, watch } from 'vue'
import Icon from '../../kit/Icon.vue'

const props = defineProps<{ value: number; label: string; min?: number; max?: number | null; step?: boolean; disabled?: boolean }>()
const emit = defineEmits<{ set: [value: number] }>()
const text = ref(String(props.value))
watch(() => props.value, (v) => { text.value = String(v) })
const clamp = (n: number): number => Math.max(props.min ?? 0, props.max == null ? n : Math.min(props.max, n))
function commit(): void {
  const t = text.value.trim()
  const n = /^[+-]\d+$/.test(t) ? props.value + Number(t) : Number(t)
  if (t === '' || !Number.isFinite(n)) { text.value = String(props.value); return }
  const v = clamp(Math.trunc(n))
  text.value = String(v)
  if (v !== props.value) emit('set', v)
}
const bump = (d: number): void => { const v = clamp(props.value + d); if (v !== props.value) emit('set', v) }
</script>

<template>
  <span class="ps-num" :data-step="step || undefined">
    <button v-if="step" class="ps-num-btn" type="button" :disabled="disabled || value <= (min ?? 0)" :aria-label="`${label}减一`" @click.stop="bump(-1)"><Icon name="minus" :size="12" /></button>
    <input v-model="text" class="ps-num-in" type="text" inputmode="numeric" :aria-label="label" :disabled="disabled" @click.stop @focus="($event.target as HTMLInputElement).select()" @keydown.enter.prevent="($event.target as HTMLInputElement).blur()" @keydown.esc="text = String(value)" @blur="commit">
    <button v-if="step" class="ps-num-btn" type="button" :disabled="disabled || (max != null && value >= max)" :aria-label="`${label}加一`" @click.stop="bump(1)"><Icon name="plus" :size="12" /></button>
  </span>
</template>
