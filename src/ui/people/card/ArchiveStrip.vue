<script setup lang="ts">
import { computed } from 'vue'
import type { Person } from '../../../schemas/people'
import { ARMOR_LABELS, CONDITION_LABELS, DAMAGE_LABELS, LANGUAGE_LABELS, TOOL_LABELS, WEAPON_CATEGORY_LABELS } from '../../../rules/dnd5e2014/data/enums'

const props = defineProps<{ person: Person; nameOf: (id?: string) => string }>()
const block = computed(() => props.person.block)
const labels = (values: string[] | undefined, map: Record<string, string>): string[] => (values ?? []).map((value) => map[value] ?? value)
const sense = (value: string): string => {
  const names: Record<string, string> = { darkvision: '黑暗视觉', blindsight: '盲视', tremorsense: '震颤感知', truesight: '真实视觉' }
  return value.replace(/^(\w+)\s+(\d+)\s*(?:ft\.?|feet)?/i, (_, key, range) => `${names[String(key).toLowerCase()] ?? key} ${range} 尺`)
}
const languageItems = computed(() => [
  ...(block.value.proficiencies?.languages ?? []).map((row) => LANGUAGE_LABELS[row.id] ?? row.id),
  ...(block.value.languages ?? []),
])
const weaponItems = computed(() => (block.value.proficiencies?.weapons ?? []).map((row) => {
  if (row.name) return row.name
  if (row.ref) return props.nameOf(row.ref)
  return row.category ? `${WEAPON_CATEGORY_LABELS[row.category]}武器` : ''
}).filter(Boolean))
const armorItems = computed(() => (block.value.proficiencies?.armor ?? []).map((row) => ARMOR_LABELS[row.category] ?? row.category))
const toolItems = computed(() => (block.value.proficiencies?.tools ?? []).map((row) => {
  if (row.name) return TOOL_LABELS[row.name] ?? row.name
  if (row.ref) return props.nameOf(row.ref)
  return ''
}).filter(Boolean))
const rows = computed(() => [
  { key: 'defense', label: '防御', groups: [
    { key: 'resist', label: '抗性', items: labels(block.value.resist, DAMAGE_LABELS) },
    { key: 'immune', label: '免疫', items: labels(block.value.immune, DAMAGE_LABELS) },
    { key: 'vulnerable', label: '易伤', items: labels(block.value.vulnerable, DAMAGE_LABELS) },
    { key: 'condition', label: '状态免疫', items: labels(block.value.conditionImmune, CONDITION_LABELS) },
  ] },
  { key: 'senses', label: '感官', groups: [{ key: 'senses', label: '', items: (block.value.senses ?? []).map(sense) }] },
  { key: 'proficiencies', label: '熟练', groups: [
    { key: 'languages', label: '语言', items: languageItems.value },
    { key: 'weapons', label: '武器', items: weaponItems.value },
    { key: 'armor', label: '护甲', items: armorItems.value },
    { key: 'tools', label: '工具', items: toolItems.value },
  ] },
])
</script>

<template>
  <section class="trpg-card-archive" data-testid="person-card-archive">
    <div v-for="row in rows" :key="row.key" class="trpg-card-archive__row">
      <span class="trpg-card-archive__label">{{ row.label }}</span>
      <div class="trpg-card-archive__body">
        <span v-for="group in row.groups" :key="group.key" class="trpg-card-archive__group">
          <span v-if="group.label" class="trpg-card-archive__group-label">{{ group.label }}</span>
          <template v-if="group.items.length">
            <span v-for="item in group.items.slice(0, 3)" :key="item" class="trpg-archive-pill">{{ item }}</span>
            <span v-if="group.items.length > 3" class="trpg-archive-pill trpg-archive-pill--more" :title="group.items.slice(3).join('、')">+{{ group.items.length - 3 }}</span>
          </template>
          <span v-else class="trpg-card-archive__empty">—</span>
        </span>
      </div>
    </div>
  </section>
</template>
