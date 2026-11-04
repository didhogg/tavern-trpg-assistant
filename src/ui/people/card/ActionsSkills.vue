<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Person } from '../../../schemas/people'
import type { PersonDerived } from '../../../rules/dnd5e2014/derive'
import { ABILITY_LABELS, SKILL_KEYS, SKILLS, type SkillKey } from '../../../rules/dnd5e2014/data/enums'
import Icon from '../../kit/Icon.vue'
import HoverTip from '../../kit/HoverTip.vue'
import Segmented from '../../kit/Segmented.vue'
import EmptyState from '../../kit/EmptyState.vue'
import { partLines, signed } from './format'

interface ActionRow { id: string; name: string; hit?: number; damage?: string; text: string }
const props = defineProps<{ person: Person; derived: PersonDerived; readOnly: boolean }>()
const emit = defineEmits<{ skill: [skill: SkillKey]; allSkills: []; editSkills: []; free: [expression: string, note: string] }>()
const filter = ref<'all' | 'prof'>('all')
const LEVEL = { none: '没有熟练', half: '半熟练', proficient: '熟练', expertise: '专精' } as const
const rows = computed(() => SKILL_KEYS.map((key) => ({ key, label: SKILLS[key].label, ability: ABILITY_LABELS[SKILLS[key].ability], res: props.derived.skills[key] })))
const shown = computed(() => (filter.value === 'prof' ? rows.value.filter((r) => r.res.level !== 'none') : rows.value))
const profOnly = computed(() => rows.value.filter((r) => r.res.level !== 'none'))
const actions = computed<ActionRow[]>(() => {
  const out: ActionRow[] = []
  for (const group of [props.person.block.actions, props.person.block.bonusActions, props.person.block.reactions]) {
    for (const act of group ?? []) {
      const attack = act.activities?.find((a) => a.kind === 'attack') as { bonus?: number; damage?: Array<{ dice: string }> } | undefined
      out.push({ id: `${act.name}`, name: act.name, hit: attack?.bonus, damage: attack?.damage?.[0]?.dice, text: '' })
    }
  }
  return out
})
const filters = [{ value: 'all', label: '全部' }, { value: 'prof', label: '熟练' }]
function mark(level: keyof typeof LEVEL): string { return level === 'none' ? 'ring' : level === 'half' ? 'half' : level === 'proficient' ? 'solid' : 'diamond' }
</script>

<template>
  <div class="trpg-actskills">
    <section class="trpg-actskills__actions" data-testid="person-card-actions">
      <header class="trpg-card-head"><h2>行动</h2></header>
      <ul v-if="actions.length" class="trpg-actlist">
        <li v-for="a in actions" :key="a.id" class="trpg-actlist__row">
<span class="trpg-actlist__name">{{ a.name }}</span>
          <button v-if="a.hit !== undefined" class="trpg-boxbtn" type="button" :aria-label="`${a.name} 命中 ${signed(a.hit)}，填入骰盘`" @click="emit('free', `1d20${signed(a.hit)}`, `${a.name} 命中`)">{{ signed(a.hit) }}</button>
          <button v-if="a.damage" class="trpg-boxbtn trpg-boxbtn--wide" type="button" :aria-label="`${a.name} 伤害 ${a.damage}，填入骰盘`" @click="emit('free', a.damage, `${a.name} 伤害`)">{{ a.damage }}</button>
        </li>
      </ul>
      <EmptyState v-else icon="books" text="还没有行动。" />
    </section>
    <section class="trpg-actskills__skills" data-testid="person-card-skills">
      <header class="trpg-card-head"><h2>技能</h2><div class="trpg-card-head__actions"><Segmented v-model="filter" class="trpg-actskills__filter" :options="filters" label="技能筛选" /><button class="trpg-icon-btn" type="button" :disabled="readOnly" aria-label="编辑技能" data-testid="person-card-skills-edit" @click="emit('editSkills')"><Icon name="pencil-simple" :size="20" /></button></div></header>
      <ul class="trpg-skills is-wide">
        <li v-for="r in shown" :key="r.key">
<button class="trpg-skill" :class="{ 'is-none': r.res.level === 'none' }" type="button" :disabled="r.res.value === null" :data-testid="`person-card-skill-${r.key}`" @click="emit('skill', r.key)">
          <HoverTip :lines="[LEVEL[r.res.level], ...partLines(r.res.parts, r.res.value)]"><span class="trpg-skill__mark" :class="`is-${mark(r.res.level)}`" aria-hidden="true" /></HoverTip>
          <span class="trpg-skill__name"><b>{{ r.label }}</b><small>{{ r.ability }}</small></span><span class="trpg-skill__value">{{ signed(r.res.value) }}</span>
</button>
</li>
      </ul>
      <ul class="trpg-skills is-narrow">
        <li v-for="r in profOnly" :key="r.key"><button class="trpg-skill" type="button" :disabled="r.res.value === null" @click="emit('skill', r.key)"><span class="trpg-skill__mark" :class="`is-${mark(r.res.level)}`" aria-hidden="true" /><span class="trpg-skill__name"><b>{{ r.label }}</b><small>{{ r.ability }}</small></span><span class="trpg-skill__value">{{ signed(r.res.value) }}</span></button></li>
        <li v-if="!profOnly.length" class="trpg-card-empty">还没有熟练的技能。</li>
      </ul>
      <button class="trpg-btn trpg-skills__all" type="button" data-testid="person-card-all-skills" @click="emit('allSkills')"><Icon name="dice-five" :size="16" />全部技能 {{ rows.length }} 项</button>
    </section>
  </div>
</template>
