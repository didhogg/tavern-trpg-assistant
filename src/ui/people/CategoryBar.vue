<script setup lang="ts">
import type { CategoryFilter } from './list'
import type { PeopleCategoryId } from '../../schemas/people'

defineProps<{ counts: Record<'all' | PeopleCategoryId, number>; modelValue: CategoryFilter }>()
const emit = defineEmits<{ 'update:modelValue': [value: CategoryFilter] }>()
const items: Array<{ id: CategoryFilter; label: string }> = [
  { id: 'all', label: '全部' }, { id: 'party', label: '队伍' }, { id: 'npc', label: 'NPC' }, { id: 'enemy', label: '敌人' },
]
</script>

<template>
  <div class="trpg-people__cats" role="tablist" aria-label="人物分类">
    <button v-for="item in items" :key="item.id" class="trpg-people__cat" type="button" role="tab" :aria-selected="modelValue === item.id" :data-testid="`people-category-${item.id}`" @click="emit('update:modelValue', item.id)">
      {{ item.label }} <span>{{ counts[item.id] }}</span>
    </button>
  </div>
</template>

<style scoped>
.trpg-people__cats { display: flex; flex-wrap: wrap; gap: 6px; padding: 2px 0 12px; }
.trpg-people__cat { min-height: 32px; padding: 0 12px; border: 0; border-radius: 999px; background: transparent; color: var(--ink-2); font: inherit; font-size: 14px; font-weight: 500; cursor: pointer; }
.trpg-people__cat span { font-size: 12px; margin-left: 4px; }
.trpg-people__cat:hover { background: var(--panel); }
.trpg-people__cat[aria-selected='true'] { background: var(--primary); color: var(--primary-ink); }
.trpg-people__cat:active { transform: scale(0.97); }
@media (prefers-reduced-motion: reduce) { .trpg-people__cat:active { transform: none; } }
</style>
