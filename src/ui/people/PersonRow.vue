<script setup lang="ts">
import type { Person, Tag } from '../../schemas/people'
import type { RowSummary } from './rows'
import Checkbox from '../kit/Checkbox.vue'
import EntityAvatar from '../kit/EntityAvatar.vue'
import HpBar from '../kit/HpBar.vue'
import Icon from '../kit/Icon.vue'
import MoreMenu from '../kit/MoreMenu.vue'

const props = defineProps<{
  person: Person
  summary: RowSummary
  tags: Tag[]
  selecting: boolean
  selected: boolean
  partyMode?: boolean
  highlighted?: boolean
  menuItems: Array<{ key: string; label: string; danger?: boolean; disabled?: boolean; reason?: string }>
}>()
const emit = defineEmits<{ open: []; toggle: [value: boolean]; tag: [id: string]; menu: [key: string] }>()
const passive = (): number | undefined => typeof props.person.block.passive === 'number' ? props.person.block.passive : undefined
const speed = (): number | undefined => typeof props.person.block.speed?.walk === 'number' ? props.person.block.speed.walk : undefined
const tagName = (id: string): string => props.tags.find((t) => t.id === id)?.name ?? id
</script>

<template>
  <li
    class="trpg-person"
    :class="{ 'is-selected': selected, 'is-highlight': highlighted, 'is-party': partyMode }"
    :data-testid="`people-row-${person.id}`"
    role="listitem"
    tabindex="0"
    @click="selecting ? emit('toggle', !selected) : emit('open')"
    @keydown.enter.prevent="selecting ? emit('toggle', !selected) : emit('open')"
  >
    <Checkbox v-if="selecting" class="trpg-person__check" :model-value="selected" :label="`选择 ${person.name}`" @click.stop @update:model-value="(v) => emit('toggle', v)" />
    <EntityAvatar :art="person.block.art" :creature-type="person.block.creatureType?.type" :size="40" :label="person.name" @click.stop="selecting ? emit('toggle', !selected) : emit('open')" />
    <div class="trpg-person__main">
      <div class="trpg-person__name-line">
        <span class="trpg-person__name" :title="person.nameEn ? `${person.name} ${person.nameEn}` : person.name">{{ person.name }}</span>
        <span v-if="person.nameEn && person.nameEn !== person.name" class="trpg-person__en">{{ person.nameEn }}</span>
        <Icon v-if="person.pinned" name="push-pin-fill" :size="14" class="trpg-person__pin" />
      </div>
      <p v-if="summary.line2" class="trpg-row__meta trpg-person__line2">{{ summary.line2 }}</p>
      <div v-if="person.tags.length" class="trpg-person__tags">
        <button v-for="id in person.tags" :key="id" class="trpg-person__tag" type="button" :aria-label="`按标签「${tagName(id)}」筛选`" @click.stop="emit('tag', id)">{{ tagName(id) }}</button>
      </div>
      <p v-if="summary.effects.length && !partyMode" class="trpg-person__effects" :title="summary.effects.join('、')">效果：{{ summary.effects.join('、') }}</p>
    </div>
    <div class="trpg-person__vitals">
      <span class="trpg-person__hp-col"><HpBar v-if="summary.hp.max !== null" :current="summary.hp.current" :max="summary.hp.max" :temp="summary.hp.temp" /></span>
      <span class="trpg-person__ac">AC {{ summary.ac ?? '' }}</span>
      <span v-if="partyMode" class="trpg-person__party-col">被动察觉 {{ passive() ?? '' }}</span>
      <span v-if="partyMode" class="trpg-person__party-col">速度 {{ speed() !== undefined ? `${speed()} 尺` : '' }}</span>
    </div>
    <div v-if="!selecting" class="trpg-person__end">
      <span :data-testid="`people-row-more-${person.id}`" @click.stop>
        <MoreMenu :label="person.name" :items="menuItems" @select="emit('menu', $event)" />
      </span>
    </div>
  </li>
</template>

<style scoped>
.trpg-person { display: flex; align-items: flex-start; gap: 10px; min-height: 60px; padding: 10px 12px; border-bottom: 1px solid var(--line); cursor: pointer; position: relative; }
.trpg-person:hover { background: var(--panel); }
.trpg-person:focus-visible { outline: 2px solid var(--primary); outline-offset: -2px; }
.trpg-person.is-selected { background: color-mix(in srgb, var(--primary) 8%, transparent); }
.trpg-person.is-highlight::after { content: ''; position: absolute; inset: 0; background: color-mix(in srgb, var(--gold) 20%, transparent); pointer-events: none; animation: person-fade 1.2s ease forwards; }
.trpg-person__check { align-self: center; min-height: 44px; }
.trpg-person__main { flex: 1; min-width: 0; }
.trpg-person__name-line { display: flex; align-items: baseline; gap: 6px; min-width: 0; }
.trpg-person__name { font-family: var(--font-serif); font-size: 15px; font-weight: 600; color: var(--ink); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.trpg-person__en { font-size: 12px; color: var(--ink-2); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.trpg-person__pin { color: var(--ink-2); flex: none; }
.trpg-person__line2 { margin: 2px 0 0; }
.trpg-person__tags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
.trpg-person__tag { min-height: 22px; padding: 0 8px; border: 1px solid var(--line); border-radius: 999px; background: transparent; color: var(--ink-2); font: inherit; font-size: 12px; }
.trpg-person__tag:hover { border-color: var(--primary); }
.trpg-person__effects { margin: 4px 0 0; color: var(--ink-2); font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.trpg-person__vitals { flex: none; display: flex; flex-direction: row; align-items: center; justify-content: flex-end; gap: 12px; padding-top: 6px; }
.trpg-person__hp-col { display: inline-flex; justify-content: flex-end; min-width: 92px; }
.trpg-person__ac { font-size: 13px; font-weight: 500; font-variant-numeric: tabular-nums; min-width: 48px; text-align: right; white-space: nowrap; }
.trpg-person__party-col { font-size: 12.5px; color: var(--ink-2); white-space: nowrap; min-width: 70px; text-align: right; }
.trpg-person__end { flex: none; align-self: center; }
@keyframes person-fade { to { opacity: 0; } }
@media (max-width: 480px) {
  .trpg-person { flex-wrap: wrap; padding: 4px 10px; }
  .trpg-person__vitals { width: 100%; flex-wrap: wrap; flex-direction: row; align-items: center; justify-content: flex-start; padding: 0 0 0 50px; }
  .trpg-person__end { position: absolute; top: 6px; right: 6px; }
  .trpg-person__effects { display: none; }
  .trpg-person__line2 { margin-top: 0; line-height: 1.2; }
  .trpg-person.is-party .trpg-person__vitals { flex-wrap: nowrap; gap: 6px; }
  .trpg-person.is-party .trpg-person__party-col { min-width: 64px; }
  .trpg-person.is-party .trpg-person__hp-col { min-width: 0; }
  .trpg-person__tags { width: 100%; }
}
@media (prefers-reduced-motion: reduce) { .trpg-person.is-highlight::after { animation: none; opacity: 0; } }
</style>
