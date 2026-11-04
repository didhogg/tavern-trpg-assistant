<script setup lang="ts">
import type { PersonDerived } from '../../../rules/dnd5e2014/derive'
import { signed } from './format'

const props = defineProps<{ derived: PersonDerived; readOnly: boolean; slotsUsed?: Record<string, number> }>()
const emit = defineEmits<{ slot: [key: string, used: number]; attack: [] }>()
const available = (max: number, used: number): number => Math.max(0, max - used)
function setSlot(key: string, max: number, used: number, n: number): void {
  if (props.readOnly) return
  const remaining = max - used
  emit('slot', key, Math.max(0, Math.min(max, n <= remaining ? max - (n - 1) : max - n)))
}
</script>

<template>
  <section v-if="derived.spellSlots?.rows.length" class="trpg-card-slots" data-testid="person-card-slots">
    <header class="trpg-card-head">
      <h2>法术位</h2>
      <div class="trpg-card-head__actions">
        <span v-if="derived.spellcasting?.dc !== undefined" class="trpg-pill trpg-pill--sm is-static">法术 DC {{ derived.spellcasting.dc }}</span>
        <button v-if="derived.spellcasting?.attack !== undefined" class="trpg-pill trpg-pill--sm" type="button" data-testid="person-card-spell-attack" aria-label="法术攻击，填入骰盘自由标签" @click="emit('attack')">法术攻击 {{ signed(derived.spellcasting.attack) }}</button>
      </div>
    </header>
    <div class="trpg-card-slots__row">
      <div v-for="row in derived.spellSlots.rows" :key="row.key" class="trpg-slot-group">
        <span class="trpg-slot-group__title">{{ row.pact ? '契约' : `${row.level}环` }}</span>
        <button v-for="n in row.max" :key="n" class="trpg-dot trpg-dot--primary" :class="{ 'is-on': n <= available(row.max, row.used) }" type="button" :disabled="readOnly" :aria-label="`${row.pact ? '契约' : `${row.level}环`}法术位第 ${n} 个，${n <= available(row.max, row.used) ? '还有' : '已用'}`" @click="setSlot(row.key, row.max, row.used, n)" />
        <span class="trpg-slot-group__count">{{ available(row.max, row.used) }}/{{ row.max }}</span>
      </div>
    </div>
  </section>
</template>
