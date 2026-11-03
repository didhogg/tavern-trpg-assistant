<script setup lang="ts">
import type { PersonDerived } from '../../../rules/dnd5e2014/derive'
import { ABILITY_KEYS, ABILITY_LABELS, type AbilityKey } from '../../../rules/dnd5e2014/data/enums'
import Icon from '../../kit/Icon.vue'
import HelpPopover from './HelpPopover.vue'

const props = defineProps<{ derived: PersonDerived; readOnly: boolean }>()
const emit = defineEmits<{ check: [ability: AbilityKey]; save: [ability: AbilityKey] }>()
const signed = (value: number | null): string => (value === null ? '' : value >= 0 ? `+${value}` : `${value}`)
const spoken = (value: number | null): string => (value === null ? '空' : value < 0 ? `负 ${Math.abs(value)}` : `正 ${value}`)
</script>

<template>
  <section class="trpg-card-abilities" aria-label="属性" data-testid="person-card-abilities">
    <div class="trpg-card-abilities__head">
      <h2>属性</h2>
      <HelpPopover kind="ability" />
    </div>
    <div class="trpg-card-abilities__legend"><Icon name="dice-five" :size="16" /><span>检定</span><Icon name="dice-five" :size="16" /><span>豁免</span><span class="trpg-card-abilities__prof-dot" /> <span>= 有熟练</span></div>
    <div class="trpg-card-abilities__grid">
      <article v-for="key in ABILITY_KEYS" :key="key" class="trpg-ability-card" :data-testid="`person-card-ability-${key}`">
        <span class="trpg-ability-card__name">{{ ABILITY_LABELS[key] }}</span>
        <button class="trpg-ability-card__check" type="button" :disabled="readOnly || props.derived.abilities[key].modifier === null" :aria-label="`${ABILITY_LABELS[key]}检定 ${spoken(props.derived.abilities[key].modifier)}`" @click="emit('check', key)">
          <span>{{ signed(props.derived.abilities[key].modifier) }}</span><Icon name="dice-five" :size="12" />
        </button>
        <span class="trpg-ability-card__score">{{ props.derived.abilities[key].value ?? '' }}</span>
        <button class="trpg-ability-card__save" :class="{ 'is-proficient': props.derived.saves[key].proficient }" type="button" :disabled="readOnly || props.derived.saves[key].value === null" :aria-label="`${ABILITY_LABELS[key]}豁免 ${spoken(props.derived.saves[key].value)}`" @click="emit('save', key)">
          <span v-if="props.derived.saves[key].proficient" class="trpg-ability-card__dot" />豁免 {{ signed(props.derived.saves[key].value) }}
        </button>
        <span v-if="props.derived.abilities[key].capped" class="trpg-ability-card__cap">上限 {{ props.derived.abilities[key].cap }}</span>
      </article>
    </div>
  </section>
</template>
