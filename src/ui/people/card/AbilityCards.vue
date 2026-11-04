<script setup lang="ts">
import { computed } from 'vue'
import type { PersonDerived } from '../../../rules/dnd5e2014/derive'
import { ABILITY_KEYS, ABILITY_LABELS, type AbilityKey } from '../../../rules/dnd5e2014/data/enums'
import Icon from '../../kit/Icon.vue'
import HoverTip from '../../kit/HoverTip.vue'
import { partLines, signed } from './format'

const props = defineProps<{ derived: PersonDerived; readOnly: boolean; unconfigured: boolean }>()
const emit = defineEmits<{ check: [ability: AbilityKey]; save: [ability: AbilityKey]; edit: [] }>()
const spoken = (value: number | null): string => (value === null ? '空' : value < 0 ? `负 ${Math.abs(value)}` : `正 ${value}`)
const abilities = computed(() => props.derived.abilities)
</script>

<template>
  <section class="trpg-card-abilities" aria-label="属性" data-testid="person-card-abilities">
    <header class="trpg-card-head">
      <h2>属性</h2>
      <button class="trpg-icon-btn" type="button" aria-label="编辑属性" :disabled="readOnly" data-testid="person-card-abilities-edit" @click="emit('edit')"><Icon name="pencil-simple" :size="20" /></button>
    </header>
    <p class="trpg-card-abilities__legend"><Icon name="dice-five" :size="16" /><span>点调整值掷检定，点「豁免」掷豁免</span><span class="trpg-card-abilities__prof-dot" aria-hidden="true" /><span>豁免有熟练</span></p>
    <div class="trpg-card-abilities__grid">
      <article v-for="key in ABILITY_KEYS" :key="key" class="trpg-ability-card" :data-testid="`person-card-ability-${key}`">
        <span class="trpg-ability-card__name">{{ ABILITY_LABELS[key] }}</span>
        <HoverTip :lines="partLines(abilities[key].parts, abilities[key].value, '', true)"><button class="trpg-ability-card__check" type="button" :disabled="readOnly || abilities[key].modifier === null" :aria-label="`${ABILITY_LABELS[key]}检定 ${spoken(abilities[key].modifier)}`" @click="emit('check', key)">{{ signed(abilities[key].modifier) }}</button></HoverTip>
        <span class="trpg-ability-card__score">{{ abilities[key].value ?? '' }}<HoverTip v-if="abilities[key].capped" :text="`算出 ${abilities[key].parts.reduce((n, p) => n + (p.kind === 'cap' ? 0 : p.amount), 0)}，上限 ${abilities[key].cap}`"><span class="trpg-ability-card__cap" tabindex="0" role="img" aria-label="被上限截断" /></HoverTip></span>
        <HoverTip :lines="partLines(derived.saves[key].parts, derived.saves[key].value)"><button class="trpg-ability-card__save" type="button" :disabled="readOnly || derived.saves[key].value === null" :aria-label="`${ABILITY_LABELS[key]}豁免 ${spoken(derived.saves[key].value)}`" @click="emit('save', key)"><span class="trpg-ability-card__ring" :class="{ 'is-on': derived.saves[key].proficient }" aria-hidden="true" />豁免 {{ signed(derived.saves[key].value) }}</button></HoverTip>
      </article>
    </div>
    <button v-if="unconfigured && !readOnly" class="trpg-btn trpg-card-abilities__setup" type="button" data-testid="person-card-abilities-setup" @click="emit('edit')"><Icon name="pencil-simple" :size="16" />配置属性：标准数组、4d6 或购点</button>
  </section>
</template>
