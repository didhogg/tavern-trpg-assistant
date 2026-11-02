<script setup lang="ts">
import { computed } from 'vue'
import type { PeopleCategoryId } from '../../schemas/people'
import type { CategoryFilter } from './list'
import Checkbox from '../kit/Checkbox.vue'

const props = defineProps<{ count: number; total: number; allSelected: boolean; someSelected: boolean; category: CategoryFilter }>()
const emit = defineEmits<{ toggleAll: [value: boolean]; move: [category: PeopleCategoryId]; addTag: []; removeTag: []; remove: []; done: [] }>()
const destinations = computed(() => {
  const all: Array<{ id: PeopleCategoryId; label: string }> = [{ id: 'party', label: '送到队伍' }, { id: 'npc', label: '送到NPC' }, { id: 'enemy', label: '送到敌人' }]
  return props.category === 'all' ? all : all.filter((x) => x.id !== props.category)
})
</script>

<template>
  <div class="trpg-people__selection" data-testid="people-selection-bar">
    <Checkbox :model-value="allSelected" :indeterminate="someSelected" label="全选" @update:model-value="(v) => emit('toggleAll', v)">全选 {{ total }} 人</Checkbox>
    <span class="trpg-field__hint">已选 {{ count }} 人</span>
    <button v-for="d in destinations" :key="d.id" class="trpg-btn trpg-btn--small" type="button" :disabled="!count" @click="emit('move', d.id)">{{ d.label }}</button>
    <button class="trpg-btn trpg-btn--small" type="button" :disabled="!count" @click="emit('addTag')">加标签</button>
    <button class="trpg-btn trpg-btn--small" type="button" :disabled="!count" @click="emit('removeTag')">去标签</button>
    <button class="trpg-btn trpg-btn--small trpg-btn--danger" type="button" :disabled="!count" @click="emit('remove')">删除</button>
    <button class="trpg-btn trpg-btn--small" type="button" @click="emit('done')">完成</button>
  </div>
</template>

<style scoped>
.trpg-people__selection { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; min-height: 44px; padding: 4px 8px; background: var(--panel); }
.trpg-people__selection .trpg-field__hint { margin-right: auto; }
@media (max-width: 480px) { .trpg-people__selection { gap: 4px; } .trpg-people__selection .trpg-btn { padding-left: 8px; padding-right: 8px; } }
</style>
