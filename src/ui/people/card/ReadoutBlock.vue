<script setup lang="ts">
import { computed } from 'vue'
import type { PersonDerived } from '../../../rules/dnd5e2014/derive'
import Icon from '../../kit/Icon.vue'
import HelpPopover from './HelpPopover.vue'

const props = defineProps<{ derived: PersonDerived; level: number | null; crText?: string }>()
const emit = defineEmits<{ initiative: [] }>()
const signed = (value: number | null): string => (value === null ? '' : value >= 0 ? `+${value}` : `${value}`)
const speedText = computed(() => {
  if (props.derived.speed.walk === null) return ''
  return `${props.derived.speed.walk} 尺`
})
const speedDetail = computed(() => {
  const names: Record<string, string> = { fly: '飞', swim: '游', climb: '攀', burrow: '掘' }
  const extra = Object.entries(props.derived.speed.others).map(([key, value]) => `${names[key] ?? key} ${value}`)
  return ['步行', ...extra].join(' · ')
})
const passiveRows = computed(() => {
  const labels = [['perception', '察觉'], ['insight', '洞悉'], ['investigation', '调查']] as const
  return labels.flatMap(([key, label]) => {
    const value = props.derived.passives[key].value
    return value === null ? [] : [{ key, label, value }]
  })
})
</script>

<template>
  <section class="trpg-card-readout" data-testid="person-card-readout">
    <div class="trpg-card-readout__grid">
      <div class="trpg-readout-cell">
        <span class="trpg-readout-cell__label">AC</span>
        <span class="trpg-readout-cell__value">{{ derived.ac.value ?? '' }}</span>
        <span class="trpg-readout-cell__detail">{{ derived.ac.from }}</span>
      </div>
      <button class="trpg-readout-cell is-button" type="button" :disabled="derived.initiative.value === null" aria-label="先攻，交给骰盘" data-testid="person-card-initiative" @click="emit('initiative')">
        <span class="trpg-readout-cell__label">先攻<Icon name="dice-five" :size="14" /></span>
        <span class="trpg-readout-cell__value">{{ signed(derived.initiative.value) }}</span>
        <span class="trpg-readout-cell__detail">敏捷</span>
      </button>
      <div class="trpg-readout-cell">
        <span class="trpg-readout-cell__label">速度</span>
        <span class="trpg-readout-cell__value">{{ speedText }}</span>
        <span class="trpg-readout-cell__detail">{{ speedDetail }}</span>
      </div>
      <div class="trpg-readout-cell">
        <span class="trpg-readout-cell__label">熟练</span>
        <span class="trpg-readout-cell__value">{{ signed(derived.proficiency.value) }}</span>
        <span class="trpg-readout-cell__detail">{{ crText || (level ? `${level} 级` : '') }}</span>
      </div>
    </div>
    <p v-if="passiveRows.length" class="trpg-card-readout__passive">
      <span class="trpg-card-readout__passive-label">被动</span>
      <template v-for="(row, index) in passiveRows" :key="row.key"><span v-if="index" class="trpg-card-readout__sep"> · </span><span>{{ row.label }} <strong>{{ row.value }}</strong></span></template>
    </p>
    <div class="trpg-card-readout__help"><HelpPopover kind="readout" /></div>
  </section>
</template>
