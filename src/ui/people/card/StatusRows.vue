<script setup lang="ts">
import { computed } from 'vue'
import type { Person } from '../../../schemas/people'
import type { PersonDerived } from '../../../rules/dnd5e2014/derive'
import Icon from '../../kit/Icon.vue'
import AddEffectPopover, { type EffectChoice } from './AddEffectPopover.vue'
import EffectPill from './EffectPill.vue'

const props = defineProps<{
  person: Person
  derived: PersonDerived
  conditions: EffectChoice[]
  spells: EffectChoice[]
  readOnly: boolean
  effectSummary: (ref?: string) => string
}>()
const emit = defineEmits<{
  live: [patch: { exhaustion?: number; slotsUsed?: Record<string, number>; effects?: Person['effects'] }]
  placeholder: [kind: 'custom']
}>()
const EXHAUSTION = ['无影响', '属性检定具有劣势', '速度减半', '攻击检定和豁免检定具有劣势', '生命值上限减半', '速度降为 0', '死亡']
const level = computed(() => props.person.exhaustion ?? 0)
const exhaustionText = computed(() => {
  if (level.value === 0) return EXHAUSTION[0]
  return `${level.value} 级：${EXHAUSTION.slice(1, level.value + 1).join('；')}`
})
const available = (max: number, used: number): number => Math.max(0, max - used)
function setSlot(key: string, max: number, used: number, n: number): void {
  if (props.readOnly) return
  const remaining = max - used
  const nextUsed = n <= remaining ? max - (n - 1) : max - n
  emit('live', { slotsUsed: { ...(props.person.slotsUsed ?? {}), [key]: Math.max(0, Math.min(max, nextUsed)) } })
}
function stepExhaustion(delta: number): void {
  if (props.readOnly) return
  emit('live', { exhaustion: Math.max(0, Math.min(6, level.value + delta)) })
}
function addEffect(effect: EffectChoice): void {
  emit('live', { effects: [...props.person.effects, { id: `fx-${Date.now().toString(36)}-${props.person.effects.length}`, category: 'other', name: effect.name, ref: effect.ref, concentration: false, note: effect.duration, addedAt: Date.now() }] })
}
function removeEffect(index: number): void {
  emit('live', { effects: props.person.effects.filter((_, i) => i !== index) })
}
</script>

<template>
  <section class="trpg-card-status" data-testid="person-card-statuses">
    <template v-if="derived.spellSlots?.rows.length">
      <div class="trpg-status-row">
        <span class="trpg-status-row__label">法术位</span>
        <div class="trpg-status-row__body">
          <p class="trpg-status-row__hint">点圆点：实心 = 还有，空心 = 已用</p>
          <div v-for="row in derived.spellSlots.rows" :key="row.key" class="trpg-slot-row">
            <span class="trpg-slot-row__title">{{ row.pact ? '契约' : `${row.level}环` }}</span>
            <button v-for="n in row.max" :key="n" class="trpg-dot trpg-dot--primary" :class="{ 'is-on': n <= available(row.max, row.used) }" type="button" :disabled="readOnly" :aria-label="`${row.pact ? '契约' : `${row.level}环`}法术位第 ${n} 个，${n <= available(row.max, row.used) ? '还有' : '已用'}`" @click="setSlot(row.key, row.max, row.used, n)" />
            <span class="trpg-slot-row__count">{{ available(row.max, row.used) }}/{{ row.max }}</span>
          </div>
        </div>
      </div>
    </template>
    <div class="trpg-status-row">
      <span class="trpg-status-row__label">力竭</span>
      <div class="trpg-status-row__body trpg-exhaustion">
        <button class="trpg-icon-btn trpg-exhaustion__step" type="button" aria-label="减少一级力竭" :disabled="readOnly || level <= 0" @click="stepExhaustion(-1)"><Icon name="minus" :size="16" /></button>
        <span class="trpg-exhaustion__value" data-testid="person-card-exhaustion">{{ level }}</span>
        <button class="trpg-icon-btn trpg-exhaustion__step" type="button" aria-label="增加一级力竭" :disabled="readOnly || level >= 6" @click="stepExhaustion(1)"><Icon name="plus" :size="16" /></button>
        <span class="trpg-exhaustion__slash">/ 6</span>
        <span class="trpg-exhaustion__text">{{ exhaustionText }}</span>
      </div>
    </div>
    <div class="trpg-status-row">
      <span class="trpg-status-row__label">效果</span>
      <div class="trpg-status-row__body trpg-effects">
        <template v-if="person.effects.length">
          <EffectPill v-for="(effect, index) in person.effects" :key="`${effect.name}-${index}`" :effect="effect" :summary="effectSummary(effect.ref)" :read-only="readOnly" @remove="removeEffect(index)" />
        </template>
        <span v-else class="trpg-effects__empty">当前无效果</span>
        <AddEffectPopover :conditions="conditions" :spells="spells" :existing="person.effects.map((effect) => effect.name)" :read-only="readOnly" @add="addEffect" @custom="emit('placeholder', 'custom')" />
      </div>
    </div>
  </section>
</template>
