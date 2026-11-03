<script setup lang="ts">
import { computed, ref } from 'vue'
import { useModalStore } from '../../stores/modal'
import { usePeopleStore } from '../../stores/people'
import { errorText } from '../format'
import TagPill from '../kit/TagPill.vue'

const props = defineProps<{
  mode: 'edit' | 'add' | 'remove'
  personId?: string
  ids?: string[]
  title?: string
}>()
const modal = useModalStore()
const people = usePeopleStore()
const query = ref('')
const error = ref('')
const person = computed(() => (props.personId ? people.rowOf(props.personId) : undefined))
const targets = computed(() => props.personId ? [props.personId] : (props.ids ?? []))
const selectedTags = computed(() => person.value?.tags ?? [])
const selectedPeople = computed(() => people.people.filter((p) => targets.value.includes(p.id)))
const counts = computed(() => {
  const map: Record<string, number> = {}
  for (const p of selectedPeople.value) for (const id of p.tags) map[id] = (map[id] ?? 0) + 1
  return map
})
const candidates = computed(() => {
  const q = query.value.trim().toLowerCase()
  return people.tags.filter((tag) => {
    if (props.mode === 'remove') return (counts.value[tag.id] ?? 0) > 0
    if (q && !tag.name.toLowerCase().includes(q)) return false
    return true
  })
})
function added(id: string): boolean { return selectedTags.value.includes(id) }
function applyAdd(id: string): void {
  error.value = ''
  people.applyTags(targets.value, { add: [id] })
  query.value = ''
}
function applyRemove(id: string): void {
  people.applyTags(targets.value, { remove: [id] })
  query.value = ''
}
function createAndAdd(): void {
  const name = query.value.trim()
  if (!name) return
  try {
    const existing = people.tags.find((t) => t.name.toLowerCase() === name.toLowerCase())
    const tag = existing ?? people.createTag(name)
    people.applyTags(targets.value, { add: [tag.id] })
    query.value = ''
    error.value = ''
  } catch (e) {
    error.value = errorText(e)
  }
}
function onEnter(): void {
  if (props.mode === 'remove') { if (candidates.value[0]) applyRemove(candidates.value[0].id); return }
  if (candidates.value[0]) applyAdd(candidates.value[0].id)
  else createAndAdd()
}
function close(): void { modal.requestClose() }
</script>

<template>
  <div class="trpg-tag-editor" :data-testid="`tag-editor-${mode}`">
    <div v-if="mode === 'edit'" class="trpg-tag-editor__current">
      <TagPill v-for="id in person?.tags ?? []" :key="id" :label="people.tags.find((t) => t.id === id)?.name ?? id" :owner="person?.name" @remove="applyRemove(id)" />
    </div>
    <p v-else-if="mode === 'remove'" class="trpg-field__hint">点一个标签，从所选的人身上拿掉。</p>
    <p v-else class="trpg-field__hint">点候选或输入新名字，给所选的人加上。</p>
    <div class="trpg-tag-editor__input">
      <input v-model="query" class="trpg-input" :placeholder="mode === 'edit' ? '输入或选择标签' : mode === 'add' ? '输入或选择标签' : '搜索标签'" :aria-label="mode === 'remove' ? '搜索标签' : '输入或选择标签'" data-testid="tag-editor-input" @keydown.enter.prevent="onEnter" />
      <button v-if="mode !== 'remove' && query.trim() && !candidates.some((t) => t.name === query.trim())" class="trpg-btn trpg-btn--small" type="button" @click="createAndAdd">新建并添加「{{ query.trim() }}」</button>
    </div>
    <p v-if="error" class="trpg-field__error" role="alert">{{ error }}</p>
    <ul class="trpg-tag-editor__list">
      <li v-for="tag in candidates" :key="tag.id">
        <button class="trpg-tag-editor__candidate" type="button" @click="mode === 'remove' ? applyRemove(tag.id) : applyAdd(tag.id)">
          <span>{{ tag.name }}</span>
          <span class="trpg-row__meta">{{ mode === 'remove' ? `${counts[tag.id] ?? 0} 人有` : added(tag.id) && mode === 'edit' ? '已添加' : '' }}</span>
        </button>
      </li>
    </ul>
    <div class="trpg-tag-editor__foot">
      <button class="trpg-btn" type="button" @click="close">关闭</button>
    </div>
  </div>
</template>

<style scoped>
.trpg-tag-editor { display: grid; gap: 8px; }
.trpg-tag-editor__current { display: flex; flex-wrap: wrap; gap: 6px; }
.trpg-tag-editor__input { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
.trpg-tag-editor__input .trpg-input { flex: 1; min-width: 180px; }
.trpg-tag-editor__list { list-style: none; margin: 0; padding: 0; display: grid; gap: 2px; max-height: 260px; overflow: auto; }
.trpg-tag-editor__candidate { display: flex; justify-content: space-between; gap: 12px; width: 100%; min-height: 36px; padding: 4px 8px; border: 0; border-radius: var(--radius-sm); background: transparent; color: var(--ink); text-align: left; }
.trpg-tag-editor__candidate:hover { background: var(--panel); }
.trpg-tag-editor__foot { display: flex; justify-content: flex-end; padding-top: 4px; }
</style>
