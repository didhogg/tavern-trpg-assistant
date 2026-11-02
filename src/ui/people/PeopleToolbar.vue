<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import type { Tag } from '../../schemas/people'
import type { SortDir, SortKey } from './list'
import Combobox from '../kit/Combobox.vue'
import Icon from '../kit/Icon.vue'
import SelectField from '../kit/SelectField.vue'
import TagPill from '../kit/TagPill.vue'

const props = defineProps<{ search: string; sortKey: SortKey; sortDir: SortDir; tags: Tag[]; selectedTagIds: string[]; count: number }>()
const emit = defineEmits<{ 'update:search': [value: string]; 'update:sortKey': [value: SortKey]; 'update:sortDir': [value: SortDir]; addTag: [id: string]; removeTag: [id: string]; clear: []; select: [] }>()
const text = ref(props.search)
const tagChoice = ref('')
const composing = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined
watch(() => props.search, (value) => { if (value !== text.value) text.value = value })
watch(text, () => {
  if (composing.value) return
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => emit('update:search', text.value), 150)
})
onBeforeUnmount(() => { if (timer) clearTimeout(timer) })
const tagOptions = computed(() => props.tags.filter((t) => !props.selectedTagIds.includes(t.id)).map((t) => ({ value: t.id, label: t.name })))
const sortOptions = [{ value: 'touched', label: '修改时间' }, { value: 'created', label: '创建时间' }, { value: 'name', label: '名称' }, { value: 'level', label: '等级或挑战等级' }]
const dirLabel = computed(() => props.sortKey === 'name' ? (props.sortDir === 'asc' ? 'A→Z' : 'Z→A') : props.sortKey === 'level' ? (props.sortDir === 'asc' ? '从低到高' : '从高到低') : (props.sortDir === 'asc' ? '从旧到新' : '从新到旧'))
watch(tagChoice, (value) => {
  if (!value) return
  emit('addTag', value)
  tagChoice.value = ''
})
function toggleDir(): void { emit('update:sortDir', props.sortDir === 'asc' ? 'desc' : 'asc') }
</script>

<template>
  <div class="trpg-people__tools">
    <div class="trpg-people__search">
      <Icon name="magnifying-glass" :size="16" />
      <input
        v-model="text"
        class="trpg-input"
        type="search"
        placeholder="搜名字、种族、职业、标签"
        aria-label="搜名字、种族、职业、标签"
        data-testid="people-search"
        @compositionstart="composing = true"
        @compositionend="composing = false"
      />
      <button v-if="text" class="trpg-people__clear" type="button" aria-label="清除搜索" @click="text = ''">×</button>
    </div>
    <div class="trpg-people__tag-choice" data-testid="people-tag-filter">
      <Combobox v-model="tagChoice" :options="tagOptions" label="添加标签筛选" placeholder="＋ 标签" />
    </div>
    <span class="trpg-people__sort"><SelectField :model-value="sortKey" :options="sortOptions" label="排序" data-testid="people-sort" @update:model-value="(v) => emit('update:sortKey', v as SortKey)" /></span>
    <button class="trpg-toolbar__dir" type="button" :aria-label="`排序方向：${dirLabel}`" :title="dirLabel" data-testid="people-sort-dir" @click="toggleDir">
      <Icon :name="sortDir === 'asc' ? 'sort-ascending' : 'sort-descending'" :size="18" />
    </button>
    <button class="trpg-btn trpg-btn--small" type="button" data-testid="people-select" @click="emit('select')">选择</button>
  </div>
  <div v-if="search || selectedTagIds.length" class="trpg-people__filters">
    <span class="trpg-field__hint">筛选：</span>
    <TagPill v-for="id in selectedTagIds" :key="id" :label="tags.find((t) => t.id === id)?.name ?? id" @remove="emit('removeTag', id)" />
    <span class="trpg-field__hint">共 {{ count }} 人</span>
    <button class="trpg-btn trpg-btn--quiet" type="button" data-testid="people-clear" @click="emit('clear')">清除</button>
  </div>
</template>

<style scoped>
.trpg-people__tools { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; padding: 0 0 8px; }
.trpg-people__search { display: flex; align-items: center; gap: 6px; flex: 1; min-width: 200px; max-width: 360px; color: var(--ink-2); position: relative; }
.trpg-people__search .trpg-input { padding-left: 30px; padding-right: 30px; }
.trpg-people__search > .trpg-icon { position: absolute; left: 10px; pointer-events: none; }
.trpg-people__clear { position: absolute; right: 4px; width: 28px; height: 28px; border: 0; background: transparent; color: var(--ink-2); font-size: 18px; cursor: pointer; }
.trpg-people__tag-choice { width: 150px; }
.trpg-people__sort { width: 150px; flex: none; }
.trpg-people__filters { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; padding: 2px 0 8px; }
.trpg-toolbar__dir { min-width: 36px; min-height: 32px; border: 1px solid var(--line); border-radius: var(--radius-sm); background: var(--card); color: var(--ink); }
@media (max-width: 480px) {
  .trpg-people__search { max-width: none; width: calc(100% - 0px); }
  .trpg-people__tag-choice { width: 110px; }
}
</style>
