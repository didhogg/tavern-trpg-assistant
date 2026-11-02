<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { markRaw } from 'vue'
import peopleCss from './people.css?inline'
import type { Person, PeopleCategoryId } from '../../schemas/people'
import { useAppStore } from '../../stores/app'
import { useCampaignStore } from '../../stores/campaign'
import { useModalStore } from '../../stores/modal'
import { usePeopleStore } from '../../stores/people'
import { useToastStore } from '../../stores/toast'
import { openWizard } from '../saves/actions'
import { emptyPerson } from './fromEntry'
import { openPersonCard, registerPersonCard, type PersonCardInput } from './openPersonCard'
import { rowSummary } from './rows'
import type { CategoryFilter, SortDir, SortKey } from './list'
import CategoryBar from './CategoryBar.vue'
import PartyBar from './PartyBar.vue'
import PeopleHeader from './PeopleHeader.vue'
import PeopleToolbar from './PeopleToolbar.vue'
import PersonCardStub from './PersonCardStub.vue'
import PersonRow from './PersonRow.vue'
import SelectionBar from './SelectionBar.vue'
import TagEditor from './TagEditor.vue'
import TagManagePage from './TagManagePage.vue'
import TemplatePicker from './TemplatePicker.vue'
import TrashPage from './TrashPage.vue'
import SaveToLibrary from './SaveToLibrary.vue'

const app = useAppStore()
const campaign = useCampaignStore()
const modal = useModalStore()
const people = usePeopleStore()
const toast = useToastStore()
const root = ref<HTMLElement | null>(null)
const category = ref<CategoryFilter>('all')
const search = ref('')
const tagIds = ref<string[]>([])
const sortKey = ref<SortKey>('touched')
const sortDir = ref<SortDir>('desc')
const selecting = ref(false)
const selected = ref(new Set<string>())
const card = shallowRef<{ person?: Person; draft?: Person; from?: string } | null>(null)
const highlight = ref('')
const classNames = ref<Record<string, string>>({})
const raceNames = ref<Record<string, string>>({})
let scrollTop = 0
let highlightTimer: ReturnType<typeof setTimeout> | undefined
let unregister: (() => void) | undefined

const visible = computed(() => people.view({ categoryId: category.value, search: search.value, tagIds: tagIds.value, sortKey: sortKey.value, sortDir: sortDir.value, classNames: classNames.value, raceNames: raceNames.value }))
const allSelected = computed(() => visible.value.length > 0 && visible.value.every((p) => selected.value.has(p.id)))
const someSelected = computed(() => selected.value.size > 0 && !allSelected.value)
const hasFilter = computed(() => !!search.value.trim() || tagIds.value.length > 0)
const rows = computed(() => visible.value.map((person) => ({ person, summary: rowSummary(person, { classes: classNames.value, races: raceNames.value }, category.value === 'all') })))
const destinationLabel = (id: PeopleCategoryId): string => id === 'party' ? '队伍' : id === 'npc' ? 'NPC' : '敌人'
const highlightRow = (id: string): void => {
  highlight.value = id
  if (highlightTimer) clearTimeout(highlightTimer)
  highlightTimer = setTimeout(() => { highlight.value = '' }, 1300)
}
onMounted(async () => {
  const shadow = root.value?.getRootNode()
  if (shadow instanceof ShadowRoot && !shadow.querySelector('style[data-u6-people]')) {
    const style = document.createElement('style')
    style.dataset.u6People = ''
    style.textContent = peopleCss
    shadow.append(style)
  }
  unregister = registerPersonCard(openCard)
  try {
    const entries = await app.svc().db.entries.toArray()
    const classes: Record<string, string> = {}
    const races: Record<string, string> = {}
    for (const entry of entries) {
      if (entry.type === 'class' || entry.type === 'subclass') classes[entry.entryId] = entry.name
      if (entry.type === 'race' || entry.type === 'subrace') races[entry.entryId] = entry.name
    }
    classNames.value = classes
    raceNames.value = races
  } catch (error) {
    console.error('[trpg-assistant] 读取职业/种族名称失败', error)
  }
  window.addEventListener('keydown', onWindowKey)
})
onBeforeUnmount(() => {
  unregister?.()
  window.removeEventListener('keydown', onWindowKey)
  if (highlightTimer) clearTimeout(highlightTimer)
})
watch([category, search, tagIds], () => { if (selecting.value) selected.value = new Set() })
watch(() => campaign.hasCampaign, (has) => { if (!has) card.value = null })

function openCard(input: PersonCardInput): void {
  if (input.id) {
    const person = people.rowOf(input.id)
    if (!person) return
    card.value = { person }
  } else if (input.draft) card.value = { draft: input.draft, from: input.from }
  selecting.value = false
  selected.value = new Set()
  const parent = root.value?.closest('.trpg-content') as HTMLElement | null
  scrollTop = parent?.scrollTop ?? 0
}
function closeCard(): void {
  card.value = null
  nextTick(() => {
    const parent = root.value?.closest('.trpg-content') as HTMLElement | null
    if (parent) parent.scrollTop = scrollTop
  })
}
function onSaved(person: Person): void {
  if (category.value !== 'all') category.value = person.categoryId
  highlightRow(person.id)
  closeCard()
}
function onNew(): void {
  const categoryId: PeopleCategoryId = category.value === 'all' ? 'enemy' : category.value
  openPersonCard({ draft: emptyPerson({ name: '', categoryId, now: Date.now() }) })
}
function onTemplate(): void {
  modal.open({ key: 'people-template', title: '模板', component: markRaw(TemplatePicker), props: { mode: 'add', onEditAdd: (draft: Person, from: string) => openPersonCard({ draft, from }) }, variant: 'dialog' })
}
function onPageMenu(key: string): void {
  if (key === 'tags') modal.open({ key: 'people-tag-manage', title: '标签管理', component: markRaw(TagManagePage), variant: 'dialog' })
  else if (key === 'trash') modal.open({ key: 'people-trash', title: '回收站', component: markRaw(TrashPage), variant: 'dialog' })
}
function openTagEditor(mode: 'edit' | 'add' | 'remove', person?: Person): void {
  const ids = mode === 'edit' ? undefined : [...selected.value]
  if (mode !== 'edit' && !ids?.length) return
  modal.open({ key: `people-tags-${mode}-${person?.id ?? 'selected'}`, title: person ? `${person.name} 的标签` : mode === 'add' ? '加标签' : '去标签', component: markRaw(TagEditor), props: { mode, personId: person?.id, ids }, variant: 'dialog' })
}
function openSave(person: Person): void {
  modal.open({ key: `people-save-${person.id}`, title: '存入我的库', component: markRaw(SaveToLibrary), props: { person }, variant: 'dialog' })
}
function rowMenu(person: Person) {
  const other = (['party', 'npc', 'enemy'] as const).filter((id) => id !== person.categoryId)
  return [
    { key: 'pin', label: person.pinned ? '取消置顶' : '置顶' },
    ...other.map((id) => ({ key: `move:${id}`, label: `送到 ${destinationLabel(id)}` })),
    { key: 'tags', label: '编辑标签...' },
    { key: 'copy', label: '复制一份' },
    { key: 'save', label: '存入我的库...' },
    { key: 'delete', label: '删除', danger: true },
  ]
}
function onRowMenu(person: Person, key: string): void {
  if (key === 'pin') {
    people.setPinned(person.id, !person.pinned)
    toast.success(`${person.pinned ? '已取消置顶' : '已置顶'} ${person.name}`)
    return
  }
  if (key.startsWith('move:')) {
    const target = key.slice(5) as PeopleCategoryId
    people.move([person.id], target)
    toast.success(`已把 ${person.name} 送到 ${destinationLabel(target)}`)
    return
  }
  if (key === 'tags') { openTagEditor('edit', person); return }
  if (key === 'copy') {
    const copy = people.duplicate(person.id)
    highlightRow(copy.id)
    toast.success(`已复制：${copy.name}`)
    return
  }
  if (key === 'save') { openSave(person); return }
  if (key === 'delete') {
    people.trash([person.id])
    toast.undoable(`已移到回收站：${person.name}`, () => people.restore([person.id]))
  }
}
function toggleTag(id: string): void { if (!tagIds.value.includes(id)) tagIds.value = [...tagIds.value, id] }
function removeTag(id: string): void { tagIds.value = tagIds.value.filter((x) => x !== id) }
function clearFilters(): void { search.value = ''; tagIds.value = [] }
function startSelect(): void { selecting.value = true; selected.value = new Set() }
function finishSelect(): void { selecting.value = false; selected.value = new Set() }
function toggleSelected(id: string, value: boolean): void {
  const next = new Set(selected.value)
  if (value) next.add(id); else next.delete(id)
  selected.value = next
}
function toggleAll(value: boolean): void { selected.value = value ? new Set(visible.value.map((p) => p.id)) : new Set() }
function moveSelected(target: PeopleCategoryId): void {
  const count = selected.value.size
  people.move([...selected.value], target)
  toast.success(`已把 ${count} 人送到 ${destinationLabel(target)}`)
  selected.value = new Set([...selected.value].filter((id) => people.rowOf(id)?.categoryId === category.value || category.value === 'all'))
}
function deleteSelected(): void {
  const ids = [...selected.value]
  people.trash(ids)
  toast.undoable(`已移到回收站：${ids.length} 人`, () => people.restore(ids))
  selected.value = new Set()
}
function onRowOpen(person: Person): void { openPersonCard({ id: person.id }) }
function onWindowKey(event: KeyboardEvent): void {
  const target = event.target as HTMLElement | null
  const typing = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
  if (event.key === '/' && !typing) {
    event.preventDefault()
    root.value?.querySelector<HTMLInputElement>('input[data-testid="people-search"]')?.focus()
    return
  }
  if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && !typing) {
    const rowEls = [...(root.value?.querySelectorAll<HTMLElement>('[data-testid^="people-row-"]') ?? [])]
    if (!rowEls.length) return
    const active = root.value?.getRootNode() instanceof ShadowRoot ? (root.value.getRootNode() as ShadowRoot).activeElement as HTMLElement | null : document.activeElement as HTMLElement | null
    const current = active?.closest<HTMLElement>('[data-testid^="people-row-"]')
    const index = current ? rowEls.indexOf(current) : -1
    const next = event.key === 'ArrowDown' ? Math.min(rowEls.length - 1, index + 1) : Math.max(0, index < 0 ? 0 : index - 1)
    event.preventDefault(); rowEls[next].focus(); return
  }
  if (event.key === 'Escape' && selecting.value) { event.preventDefault(); finishSelect() }
}
function emptyText(): string {
  if (hasFilter.value) return '没有符合的人物'
  return category.value === 'all' ? '还没有人物' : '这个分类还没有人'
}
</script>

<template>
  <div ref="root" class="trpg-people" data-testid="people-page" tabindex="-1">
    <div v-if="!campaign.hasCampaign" class="trpg-people__no-campaign">
      <p>先开一个战役，人物会保存在这个战役里。</p>
      <button class="trpg-btn trpg-btn--primary" type="button" :disabled="campaign.readOnly" @click="openWizard()">去开局向导</button>
    </div>
    <PersonCardStub v-else-if="card" :person="card.person" :draft="card.draft" :from="card.from" @back="closeCard" @saved="onSaved" />
    <template v-else>
      <PeopleHeader :total="people.counts.all" :trash-count="people.trashed.length" :read-only="campaign.readOnly" @template="onTemplate" @create="onNew" @menu="onPageMenu" />
      <CategoryBar v-model="category" :counts="people.counts" />
      <PartyBar v-if="category === 'party'" :name="people.partyName" :count="people.counts.party" />
      <PeopleToolbar v-if="!selecting" :search="search" :sort-key="sortKey" :sort-dir="sortDir" :tags="people.tags" :selected-tag-ids="tagIds" :count="visible.length" @update:search="search = $event" @update:sort-key="sortKey = $event" @update:sort-dir="sortDir = $event" @add-tag="toggleTag" @remove-tag="removeTag" @clear="clearFilters" @select="startSelect" />
      <SelectionBar v-else :count="selected.size" :total="visible.length" :all-selected="allSelected" :some-selected="someSelected" :category="category" @toggle-all="toggleAll" @move="moveSelected" @add-tag="openTagEditor('add')" @remove-tag="openTagEditor('remove')" @remove="deleteSelected" @done="finishSelect" />
      <div class="trpg-people__list">
        <p v-if="!visible.length" class="trpg-empty">{{ emptyText() }} <button v-if="hasFilter" class="trpg-link" type="button" @click="clearFilters">清除条件</button><button v-else-if="!campaign.readOnly" class="trpg-link" type="button" @click="onNew">＋ 新建</button></p>
        <ul v-else class="trpg-people__rows" role="list" aria-label="人物列表">
          <PersonRow v-for="row in rows" :key="row.person.id" :person="row.person" :summary="row.summary" :tags="people.tags" :selecting="selecting" :selected="selected.has(row.person.id)" :party-mode="category === 'party'" :highlighted="highlight === row.person.id" :menu-items="rowMenu(row.person)" @open="onRowOpen(row.person)" @toggle="(v) => toggleSelected(row.person.id, v)" @tag="toggleTag" @menu="(key) => onRowMenu(row.person, key)" />
        </ul>
      </div>
    </template>
  </div>
</template>

<style scoped>
.trpg-people { min-height: 100%; display: flex; flex-direction: column; }
.trpg-people__no-campaign { display: grid; justify-items: center; gap: 12px; padding: 48px 12px; color: var(--ink-2); }
.trpg-people__rows { list-style: none; margin: 0; padding: 0; border: 1px solid var(--line); border-radius: var(--radius); background: var(--card); box-shadow: var(--shadow-card); overflow: hidden; }
.trpg-people__list { min-height: 0; }
</style>
