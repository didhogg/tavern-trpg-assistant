<script setup lang="ts">
import { computed } from 'vue'
import type { PersonDerived } from '../../../rules/dnd5e2014/derive'
import Icon from '../../kit/Icon.vue'
import HoverTip from '../../kit/HoverTip.vue'
import { partLines, signed } from './format'

const props = defineProps<{ derived: PersonDerived; level: number | null; crText?: string; readOnly: boolean }>()
const emit = defineEmits<{ initiative: []; open: [tab: 'defense' | 'speed' | 'passive']; passive: [skill: 'perception' | 'insight' | 'investigation'] }>()
const speedText = computed(() => (props.derived.speed.walk === null ? '' : `${props.derived.speed.walk} 尺`))
const speedDetail = computed(() => {
  const names: Record<string, string> = { fly: '飞行', swim: '游泳', climb: '攀爬', burrow: '掘穴' }
  return ['步行', ...Object.keys(props.derived.speed.others).map((k) => names[k] ?? k)].join(' · ')
})
const speedLines = computed(() => {
  const out: string[] = []
  for (const [mode, parts] of Object.entries(props.derived.speed.parts)) {
    const name = ({ walk: '步行', fly: '飞行', swim: '游泳', climb: '攀爬', burrow: '掘穴' } as Record<string, string>)[mode] ?? mode
    out.push(`${name}：${parts!.map((p) => (p.overridden ? `${p.label}（已被覆盖）` : `${p.label} ${p.amount}`)).join(' + ')}`)
  }
  return out
})
const acDetail = computed(() => props.derived.ac.from.replace('敏捷', '无甲 + 敏捷').replace(/^无甲 \+ 无甲 \+/, '无甲 +') || '')
const passives = computed(() => {
  const labels = [['perception', '察觉'], ['insight', '洞悉'], ['investigation', '调查']] as const
  return labels.flatMap(([key, label]) => (props.derived.passives[key].value === null ? [] : [{ key, label, value: props.derived.passives[key].value!, lines: partLines(props.derived.passives[key].parts, props.derived.passives[key].value, '', true) }]))
})
</script>

<template>
  <section class="trpg-card-readout" data-testid="person-card-readout">
    <header class="trpg-card-head"><h2>战斗</h2><button class="trpg-icon-btn" type="button" aria-label="编辑读数" :disabled="readOnly" data-testid="person-card-readout-edit" @click="emit('open', 'defense')"><Icon name="pencil-simple" :size="20" /></button></header>
    <div class="trpg-card-readout__grid">
      <HoverTip :lines="partLines(derived.ac.parts, derived.ac.value, '', true)"><button class="trpg-readout-cell" type="button" data-testid="person-card-ac" @click="emit('open', 'defense')"><span class="trpg-readout-cell__label">AC</span><span class="trpg-readout-cell__value">{{ derived.ac.value ?? '' }}</span><span class="trpg-readout-cell__detail">{{ acDetail }}</span></button></HoverTip>
      <HoverTip :lines="partLines(derived.initiative.parts, derived.initiative.value)"><button class="trpg-readout-cell" type="button" :disabled="derived.initiative.value === null" aria-label="先攻，交给骰盘" data-testid="person-card-initiative" @click="emit('initiative')"><span class="trpg-readout-cell__label">先攻<Icon name="dice-five" :size="16" /></span><span class="trpg-readout-cell__value">{{ signed(derived.initiative.value) }}</span><span class="trpg-readout-cell__detail">敏捷</span></button></HoverTip>
      <HoverTip :lines="speedLines"><button class="trpg-readout-cell" type="button" data-testid="person-card-speed" @click="emit('open', 'speed')"><span class="trpg-readout-cell__label">速度</span><span class="trpg-readout-cell__value">{{ speedText }}</span><span class="trpg-readout-cell__detail">{{ speedDetail }}</span></button></HoverTip>
      <HoverTip :lines="partLines(derived.proficiency.parts, derived.proficiency.value)"><button class="trpg-readout-cell" type="button" data-testid="person-card-proficiency" @click="emit('open', 'defense')"><span class="trpg-readout-cell__label">熟练</span><span class="trpg-readout-cell__value">{{ signed(derived.proficiency.value) }}</span><span class="trpg-readout-cell__detail">{{ crText || (level ? `${level} 级` : '') }}</span></button></HoverTip>
    </div>
    <div v-if="passives.length" class="trpg-card-readout__passive"><span class="trpg-card-readout__passive-label">被动</span>
      <HoverTip v-for="row in passives" :key="row.key" :lines="row.lines"><button class="trpg-passive" type="button" :aria-label="`被动${row.label} ${row.value}，交给骰盘`" :data-testid="`person-card-passive-${row.key}`" @click="emit('passive', row.key)"><span>{{ row.label }}</span><b>{{ row.value }}</b></button></HoverTip>
    </div>
  </section>
</template>
