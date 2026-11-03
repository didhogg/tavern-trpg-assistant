<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { markRaw } from 'vue'
import peopleCss from './people.css?inline'
import dialogsCss from './people-dialogs.css?inline'
import type { Person, PeopleCategoryId } from '../../schemas/people'
import { useAppStore } from '../../stores/app'
import { useCampaignStore } from '../../stores/campaign'
import { useModalStore } from '../../stores/modal'
import { usePeopleStore } from '../../stores/people'
import { useToastStore } from '../../stores/toast'
import { openWizard } from '../saves/actions'
import { emptyPerson } from './fromEntry'
import { openPersonCard, registerPersonCard, type PersonCardInput } from './openPersonCard'
import { personIdentity } from './identity'
import { buildLabels, sharedLabels } from './labels'
import { rowSummary } from './rows'
import type { CategoryFilter, SortDir, SortKey } from './list'
import EmptyState from '../kit/EmptyState.vue'
import Icon from '../kit/Icon.vue'
import CategoryBar from './CategoryBar.vue'
import PartyBar from './PartyBar.vue'
import PeopleHeader from './PeopleHeader.vue'
import PeopleToolbar from './PeopleToolbar.vue'
import PersonCardStub from './PersonCardStub.vue'
import PersonRow from './PersonRow.vue'
import SelectionBar from './SelectionBar.vue'
import TagEditor from './TagEditor.vue'
import TagManagePage from './TagManagePage.vue'
import TemplateHeadHint from './TemplateHeadHint.vue'
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
const pendingAdd = ref<{ id: string; categoryId: PeopleCategoryId } | null>(null)
const highlight = ref('')
const pageWidth = ref(1000)
let sizeObserver: ResizeObserver | undefined
/** 内容区实际宽度：窗口大小、侧栏宽度都会影响，所以按页面自己的宽度决定卡片怎么排。 */
const tight = computed(() => pageWidth.value <= 700)
const stacked = computed(() => pageWidth.value <= 480 || (category.value === 'party' && pageWidth.value <= 720))
const classNames = ref<Record<string, string>>({})
const raceNames = ref<Record<string, string>>({})
const entryNames = ref<Record<string, string>>({})
let scrollTop = 0
let highlightTimer: ReturnType<typeof setTimeout> | undefined
let unregister: (() => void) | undefined
const VIEW_KEY = (): string => `trpg-people-view:${campaign.owner?.ownerKey ?? 'none'}`
function loadView(): void {
  try {
    const raw = localStorage.getItem(VIEW_KEY())
    if (!raw) return
    const saved = JSON.parse(raw) as { category?: CategoryFilter; sortKey?: SortKey; sortDir?: SortDir }
    if (saved.category === 'all' || saved.category === 'party' || saved.category === 'npc' || saved.category === 'enemy') category.value = saved.category
    if (saved.sortKey === 'touched' || saved.sortKey === 'created' || saved.sortKey === 'name' || saved.sortKey === 'level') sortKey.value = saved.sortKey
    if (saved.sortDir === 'asc' || saved.sortDir === 'desc') sortDir.value = saved.sortDir
  } catch (error) { console.warn('[trpg-assistant] 读取人物页视图设置失败', error) }
}
function saveView(): void {
  try { localStorage.setItem(VIEW_KEY(), JSON.stringify({ category: category.value, sortKey: sortKey.value, sortDir: sortDir.value })) } catch (error) { console.warn('[trpg-assistant] 保存人物页视图设置失败', error) }
}

const visible = computed(() => people.view({ categoryId: category.value, search: search.value, tagIds: tagIds.value, sortKey: sortKey.value, sortDir: sortDir.value, classNames: classNames.value, raceNames: raceNames.value }))
const allSelected = computed(() => visible.value.length > 0 && visible.value.every((p) => selected.value.has(p.id)))
const someSelected = computed(() => selected.value.size > 0 && !allSelected.value)
const hasFilter = computed(() => !!search.value.trim() || tagIds.value.length > 0)
const rowLabels = computed(() => ({ classes: classNames.value, races: raceNames.value, sourceNames: entryNames.value }))
const rows = computed(() => visible.value.map((person) => ({ person, summary: rowSummary(person, rowLabels.value, category.value === 'all'), identity: personIdentity(person, rowLabels.value, category.value === 'all') })))
/** 队伍平均生命：所有队伍成员 当前/上限 之和；没有上限的不计，全都没有就不显示。 */
const partyAvgHp = computed(() => {
  let current = 0
  let max = 0
  for (const person of people.people) {
    if (person.categoryId !== 'party' || person.trashedAt !== undefined) continue
    const hp = rowSummary(person).hp
    if (hp.max === null || hp.max <= 0) continue
    current += Math.min(hp.current ?? hp.max, hp.max)
    max += hp.max
  }
  return max > 0 ? Math.round((current / max) * 100) : undefined
})
const destinationLabel = (id: PeopleCategoryId): string => id === 'party' ? '队伍' : id === 'npc' ? 'NPC' : '敌人'
const highlightRow = (id: string): void => {
  highlight.value = id
  if (highlightTimer) clearTimeout(highlightTimer)
  highlightTimer = setTimeout(() => { highlight.value = '' }, 1300)
}
onMounted(async () => {
  loadView()
  if (root.value && typeof ResizeObserver !== 'undefined') {
    sizeObserver = new ResizeObserver((entries) => { pageWidth.value = entries[0]?.contentRect.width ?? pageWidth.value })
    sizeObserver.observe(root.value)
  }
  const shadow = root.value?.getRootNode()
  if (shadow instanceof ShadowRoot && !shadow.querySelector('style[data-u6-people]')) {
    const style = document.createElement('style')
    style.dataset.u6People = ''
    style.textContent = `${peopleCss}\n${dialogsCss}`
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
    const names: Record<string, string> = {}
    for (const entry of entries) names[entry.entryId] = entry.name
    classNames.value = classes
    raceNames.value = races
    entryNames.value = names
    sharedLabels.value = buildLabels(entries)
  } catch (error) {
    console.error('[trpg-assistant] 读取职业/种族名称失败', error)
  }
  window.addEventListener('keydown', onWindowKey)
})
onBeforeUnmount(() => {
  sizeObserver?.disconnect()
  unregister?.()
  window.removeEventListener('keydown', onWindowKey)
  if (highlightTimer) clearTimeout(highlightTimer)
})
watch([category, search, tagIds], () => { if (selecting.value) selected.value = new Set() })
watch([category, sortKey, sortDir], saveView)
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
  pendingAdd.value = null
  modal.open({ key: 'people-template', title: '模板', component: markRaw(TemplatePicker), header: markRaw(TemplateHeadHint), props: { mode: 'add', onAdded: (added: Person[], categoryId: PeopleCategoryId) => { const last = added[added.length - 1]; if (last) pendingAdd.value = { id: last.id, categoryId } }, onEditAdd: (draft: Person, from: string) => openPersonCard({ draft, from }) }, variant: 'dialog' })
}
function scrollToPerson(id: string): void {
  nextTick(() => { root.value?.querySelector<HTMLElement>(`[data-testid="people-row-${id}"]`)?.scrollIntoView({ block: 'nearest' }); highlightRow(id) })
}
watch(() => modal.isOpen, (open) => {
  if (open || !pendingAdd.value) return
  const pending = pendingAdd.value
  pendingAdd.value = null
  category.value = pending.categoryId
  scrollToPerson(pending.id)
})
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
  <div ref="root" class="trpg-people" :class="{ 'is-tight': tight }" data-testid="people-page" tabindex="-1">
    <div v-if="!campaign.hasCampaign" class="trpg-people__no-campaign">
      <p>先开一个战役，人物会保存在这个战役里。</p>
      <button class="trpg-btn trpg-btn--primary" type="button" :disabled="campaign.readOnly" @click="openWizard()">去开局向导</button>
    </div>
    <PersonCardStub v-else-if="card" :person="card.person" :draft="card.draft" :from="card.from" @back="closeCard" @saved="onSaved" />
    <template v-else>
      <div class="trpg-people__top">
        <CategoryBar v-model="category" :counts="people.counts" />
        <PeopleHeader :trash-count="people.trashed.length" :read-only="campaign.readOnly" @template="onTemplate" @create="onNew" @menu="onPageMenu" />
      </div>
      <PartyBar v-if="category === 'party'" :name="people.partyName" :count="people.counts.party" :avg-hp="partyAvgHp" />
      <PeopleToolbar v-if="!selecting" :search="search" :sort-key="sortKey" :sort-dir="sortDir" :tags="people.tags" :selected-tag-ids="tagIds" :count="visible.length" :total="people.counts[category]" @update:search="search = $event" @update:sort-key="sortKey = $event" @update:sort-dir="sortDir = $event" @add-tag="toggleTag" @remove-tag="removeTag" @clear="clearFilters" @select="startSelect" />
      <SelectionBar v-else :count="selected.size" :total="visible.length" :all-selected="allSelected" :some-selected="someSelected" :category="category" @toggle-all="toggleAll" @move="moveSelected" @add-tag="openTagEditor('add')" @remove-tag="openTagEditor('remove')" @remove="deleteSelected" @done="finishSelect" />
      <div class="trpg-people__list">
        <EmptyState v-if="!visible.length" :icon="hasFilter ? 'magnifying-glass' : 'users-three'" :text="emptyText()" data-testid="people-empty">
          <button v-if="hasFilter" class="trpg-btn" type="button" @click="clearFilters">清除条件</button>
          <button v-else-if="!campaign.readOnly" class="trpg-btn" type="button" @click="onNew"><Icon name="plus" :size="16" />新建</button>
        </EmptyState>
        <ul v-else class="trpg-people__rows" role="list" aria-label="人物列表">
          <PersonRow v-for="row in rows" :key="row.person.id" :person="row.person" :summary="row.summary" :identity="row.identity" :tags="people.tags" :selecting="selecting" :selected="selected.has(row.person.id)" :party-mode="category === 'party'" :stacked="stacked" :highlighted="highlight === row.person.id" :menu-items="rowMenu(row.person)" @open="onRowOpen(row.person)" @toggle="(v) => toggleSelected(row.person.id, v)" @tag="toggleTag" @menu="(key) => onRowMenu(row.person, key)" />
        </ul>
      </div>
    </template>
  </div>
</template>
