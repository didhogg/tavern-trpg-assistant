<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import type { Tag } from '../../schemas/people'
import type { SortDir, SortKey } from './list'
import Combobox from '../kit/Combobox.vue'
import Icon from '../kit/Icon.vue'
import SearchField from '../kit/SearchField.vue'
import SelectField from '../kit/SelectField.vue'
import TagPill from '../kit/TagPill.vue'

const props = defineProps<{ search: string; sortKey: SortKey; sortDir: SortDir; tags: Tag[]; selectedTagIds: string[]; count: number; total: number }>()
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
  <div class="trpg-toolrow">
    <SearchField v-model="text" class="trpg-toolrow__search" label="搜名字、种族、职业、标签" testid="people-search" clear-label="清除搜索" @compositionstart="composing = true" @compositionend="composing = false" />
    <div class="trpg-toolrow__tag" data-testid="people-tag-filter">
      <Combobox v-model="tagChoice" :options="tagOptions" label="添加标签筛选" placeholder="标签" />
    </div>
    <span class="trpg-toolrow__sort"><SelectField :model-value="sortKey" :options="sortOptions" label="排序" prefix="排序：" data-testid="people-sort" @update:model-value="(v) => emit('update:sortKey', v as SortKey)" /></span>
    <button class="trpg-btn trpg-btn--square trpg-toolbar__dir" type="button" :aria-label="`排序方向：${dirLabel}`" :title="dirLabel" data-testid="people-sort-dir" @click="toggleDir">
      <Icon :name="sortDir === 'asc' ? 'sort-ascending' : 'sort-descending'" :size="18" />
    </button>
    <button class="trpg-btn" type="button" data-testid="people-select" @click="emit('select')">选择</button>
    <span class="trpg-toolrow__count">显示 {{ count }} / 共 {{ total }}</span>
  </div>
  <div v-if="selectedTagIds.length" class="trpg-people__filters">
    <span v-if="selectedTagIds.length" class="trpg-field__hint">筛选：</span>
    <TagPill v-for="id in selectedTagIds" :key="id" :label="tags.find((t) => t.id === id)?.name ?? id" @remove="emit('removeTag', id)" />
    <button class="trpg-btn trpg-btn--quiet trpg-btn--small" type="button" data-testid="people-clear" @click="emit('clear')">清除</button>
  </div>
</template>
