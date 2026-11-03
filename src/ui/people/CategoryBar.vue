<script setup lang="ts">
import type { CategoryFilter } from './list'
import type { PeopleCategoryId } from '../../schemas/people'
import CategoryTabs, { type TabOption } from '../kit/CategoryTabs.vue'

const props = defineProps<{ counts: Record<'all' | PeopleCategoryId, number>; modelValue: CategoryFilter }>()
const emit = defineEmits<{ 'update:modelValue': [value: CategoryFilter] }>()
const items: Array<{ id: CategoryFilter; label: string; icon: string }> = [
  { id: 'party', label: '队伍', icon: 'users-three' }, { id: 'npc', label: 'NPC', icon: 'user' }, { id: 'enemy', label: '敌人', icon: 'skull' }, { id: 'all', label: '全部', icon: 'list' },
]
const options = (): TabOption[] => items.map((i) => ({ value: i.id, label: i.label, icon: i.icon, count: props.counts[i.id], testid: `people-category-${i.id}` }))
</script>

<template>
  <CategoryTabs class="trpg-people__cats" :model-value="modelValue" :options="options()" label="人物分类" @update:model-value="(v) => emit('update:modelValue', v as CategoryFilter)" />
</template>
