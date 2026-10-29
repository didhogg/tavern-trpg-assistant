<script setup lang="ts">
import { computed } from 'vue'

/** 骰子形状的 SVG：d4 三角、d6 圆角方形、d8 菱形、d10 风筝形、d12 五边形、d20 六边形加内三角、d100 风筝形。value 写在骰子中央。 */
const props = defineProps<{ sides: number; value?: number | string }>()

const kind = computed(() => ([4, 6, 8, 10, 12, 20, 100] as const).find((f) => props.sides <= f) ?? 100)
const text = computed(() => (props.value === undefined ? '' : String(props.value)))
const fontSize = computed(() => (text.value.length >= 3 ? 24 : text.value.length === 2 ? 32 : 38))
const y = computed(() => (kind.value === 4 ? 64 : 53))
</script>

<template>
  <svg class="trpg-die" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
    <polygon v-if="kind === 4" points="50,8 94,86 6,86" />
    <path v-else-if="kind === 6" class="trpg-die__body" d="M24 14h52a10 10 0 0 1 10 10v52a10 10 0 0 1-10 10H24a10 10 0 0 1-10-10V24a10 10 0 0 1 10-10z" />
    <template v-else-if="kind === 8"><polygon points="50,6 92,50 50,94 8,50" /><path class="trpg-die__facet" d="M8 50h84" /></template>
    <template v-else-if="kind === 10 || kind === 100"><polygon points="50,5 91,38 50,95 9,38" /><path class="trpg-die__facet" d="M50 5v90M9 38h82" /></template>
    <template v-else-if="kind === 12"><polygon points="50,7 92,38 76,88 24,88 8,38" /><path class="trpg-die__facet" d="M50 30l22 16-8 26H36l-8-26z" /></template>
    <template v-else><polygon points="50,5 90,27 90,73 50,95 10,73 10,27" /><path class="trpg-die__facet" d="M50 22l26 46H24z" /></template>
    <text v-if="text" x="50" :y="y" :font-size="fontSize" text-anchor="middle" dominant-baseline="central">{{ text }}</text>
  </svg>
</template>
