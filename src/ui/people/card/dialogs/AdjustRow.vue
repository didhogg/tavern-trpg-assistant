<script setup lang="ts">
import { computed } from 'vue'

/** 项目卡里「手动调整 + 覆盖」两个能填的控件（只读的东西是纯文字，不画框；U5R §1.3）。 */
const props = defineProps<{ adjust: number; override: number | null; unit?: string; label: string; readOnly: boolean; showAdjust?: boolean }>()
const emit = defineEmits<{ adjust: [value: number]; override: [value: number | null] }>()
const on = computed(() => props.override !== null)
const num = (e: Event): number => Number((e.target as HTMLInputElement).value)
</script>

<template>
  <label v-if="showAdjust !== false" class="trpg-adj"><span>手动调整</span><input class="trpg-input trpg-input--sm trpg-adj__num" type="number" step="1" :value="adjust" :disabled="readOnly || on" :aria-label="`${label} 手动调整`" @change="emit('adjust', num($event))" /><span v-if="unit">{{ unit }}</span></label>
  <span class="trpg-adj"><span>覆盖为</span>
    <span class="trpg-seg" role="group" :aria-label="`${label} 覆盖`"><button type="button" :aria-pressed="!on" :disabled="readOnly" @click="emit('override', null)">关</button><button type="button" :aria-pressed="on" :disabled="readOnly" :data-testid="`override-on-${label}`" @click="emit('override', override ?? 0)">开</button></span>
    <input v-if="on" class="trpg-input trpg-input--sm trpg-adj__num" type="number" step="1" :value="override ?? 0" :disabled="readOnly" :aria-label="`${label} 覆盖值`" @change="emit('override', num($event))" />
  </span>
</template>
