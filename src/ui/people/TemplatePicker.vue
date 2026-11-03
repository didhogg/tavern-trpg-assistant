<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from 'vue'
import type { Entry } from '../../schemas/pack'
import type { PeopleCategoryId, Person } from '../../schemas/people'
import { monsterDataSchema, type MonsterData } from '../../rules/dnd5e2014/data/entries/spell-monster'
import { toEntry } from '../../core/library/pins'
import { useAppStore } from '../../stores/app'
import { useCampaignStore } from '../../stores/campaign'
import { useLibraryStore } from '../../stores/library'
import { useModalStore } from '../../stores/modal'
import { usePeopleStore } from '../../stores/people'
import { useToastStore } from '../../stores/toast'
import { personFromEntry } from './fromEntry'
import { queryTemplates, type TemplateRow } from './templates'
import EntryDetailPage from '../library/EntryDetailPage.vue'
import Icon from '../kit/Icon.vue'
import SelectField from '../kit/SelectField.vue'
import CategoryTabs from '../kit/CategoryTabs.vue'
import EmptyState from '../kit/EmptyState.vue'
import SearchField from '../kit/SearchField.vue'
import VirtualList from '../kit/VirtualList.vue'
import TemplateCard from './TemplateCard.vue'
import TemplateFilter from './TemplateFilter.vue'
import TemplateFoot from './TemplateFoot.vue'
import TemplateSummary from './TemplateSummary.vue'

const props = defineProps<{ mode?: 'add' | 'apply'; onEditAdd?: (draft: Person, from: string) => void; onApply?: (block: MonsterData, name: string) => void; onAdded?: (persons: Person[], categoryId: PeopleCategoryId) => void }>()
const app = useAppStore()
const campaign = useCampaignStore()
const library = useLibraryStore()
const modal = useModalStore()
const people = usePeopleStore()
const toast = useToastStore()
const rows = shallowRef<TemplateRow[]>([])
const loading = ref(true)
const type = ref<'all' | 'monster' | 'npc'>('all')
const search = ref('')
const sort = ref<'name' | 'cr'>('name')
const scope = ref<'current' | 'all'>('current')
const sourcePacks = ref<string[]>([])
const crMin = ref(0)
const crMax = ref(30)
const creatureTypes = ref<string[]>([])
const sizes = ref<string[]>([])
const showFilters = ref(false)
const selectedId = ref('')
const detailOpen = ref(false)
const category = ref<'party' | 'npc' | 'enemy'>('enemy')
const count = ref(1)
const width = ref(window.innerWidth)
const narrow = computed(() => width.value < 1024)
const enabled = computed(() => new Set(campaign.workspace?.enabledPacks.map((p) => p.id) ?? []))

async function blockOf(entry: Entry, packId: string): Promise<MonsterData | null> {
  if (entry.type === 'npc') {
    const statId = typeof entry.data.statblock === 'string' ? entry.data.statblock : ''
    const pack = statId ? await library.packOfEntry(statId) : undefined
    const stat = pack ? await app.svc().db.entries.get([pack, statId]) : undefined
    const parsed = stat ? monsterDataSchema.safeParse(stat.data) : null
    return parsed?.success ? parsed.data as MonsterData : null
  }
  const parsed = monsterDataSchema.safeParse(entry.data)
  void packId
  return parsed.success ? parsed.data as MonsterData : null
}
onMounted(async () => {
  const entries = (await app.svc().db.entries.where('[ruleId+type]').anyOf([['dnd5e2014', 'monster'], ['dnd5e2014', 'npc']]).toArray()) as Entry[] | []
  const all: TemplateRow[] = []
  for (const stored of entries) {
    const entry = toEntry(stored as never)
    const packName = library.installedMap.get((stored as { packId?: string }).packId ?? '')?.name ?? (stored as { packId?: string }).packId ?? ''
    all.push({ packId: (stored as { packId?: string }).packId ?? '', packName, entry, block: await blockOf(entry, (stored as { packId?: string }).packId ?? '') })
  }
  rows.value = all
  loading.value = false
  const onResize = (): void => { width.value = window.innerWidth }
  window.addEventListener('resize', onResize)
})
const scopedRows = computed(() => scope.value === 'all' ? rows.value : rows.value.filter((r) => enabled.value.has(r.packId) || library.installedMap.get(r.packId)?.source === 'user'))
const countOf = (t: 'all' | 'monster' | 'npc'): number => scopedRows.value.filter((r) => t === 'all' || r.entry.type === t).length
const sourceOptions = computed(() => {
  const map = new Map<string, { id: string; name: string; count: number }>()
  for (const row of scopedRows.value) {
    const old = map.get(row.packId)
    map.set(row.packId, { id: row.packId, name: row.packName, count: (old?.count ?? 0) + 1 })
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, 'zh'))
})
const filtered = computed(() => queryTemplates(scopedRows.value, { type: type.value, search: search.value, sourcePacks: sourcePacks.value, crMin: crMin.value, crMax: crMax.value, creatureTypes: creatureTypes.value, sizes: sizes.value, sort: sort.value }))
const selected = computed(() => filtered.value.find((r) => r.entry.id === selectedId.value) ?? rows.value.find((r) => r.entry.id === selectedId.value) ?? null)
const activeFilters = computed(() => sourcePacks.value.length + (crMin.value > 0 || crMax.value < 30 ? 1 : 0) + creatureTypes.value.length + sizes.value.length)
const typeOptions = computed(() => [{ value: 'all', label: '全部', icon: 'list', count: countOf('all') }, { value: 'monster', label: '怪物', icon: 'skull', count: countOf('monster') }, { value: 'npc', label: '具名 NPC', icon: 'user', count: countOf('npc') }])
function choose(row: TemplateRow): void {
  selectedId.value = row.entry.id
  category.value = row.entry.type === 'npc' ? 'npc' : 'enemy'
  if (narrow.value) detailOpen.value = true
}
function clearFilters(): void { sourcePacks.value = []; crMin.value = 0; crMax.value = 30; creatureTypes.value = []; sizes.value = [] }
function normalizedCount(): number { return Math.max(1, Math.min(30, Math.floor(count.value) || 1)) }
async function add(): Promise<void> {
  if (!selected.value?.block) return
  const added = await people.addFromEntry({ ref: { packId: selected.value.packId, entryId: selected.value.entry.id }, count: normalizedCount(), categoryId: category.value })
  props.onAdded?.(added, category.value)
  toast.success(`已加入 ${added.map((p) => p.name).join('、')}（${category.value === 'party' ? '队伍' : category.value === 'npc' ? 'NPC' : '敌人'}）`)
}
function editAdd(): void {
  const row = selected.value
  if (!row?.block) return
  const draft = personFromEntry(row.entry, row.block, { name: row.entry.name, categoryId: category.value, now: Date.now(), sourceRef: { packId: row.packId, version: library.installedMap.get(row.packId)?.version ?? '0.0.0', entryId: row.entry.id } })
  modal.close(true)
  props.onEditAdd?.(draft, row.entry.name)
}
function apply(): void {
  if (!selected.value?.block) return
  props.onApply?.(selected.value.block, selected.value.entry.name)
  modal.close(true)
}
</script>

<template>
  <div class="trpg-template" :class="{ 'is-stack': narrow }" data-testid="template-picker">
    <template v-if="!(narrow && detailOpen)">
      <CategoryTabs v-model="type" class="trpg-template__tabs" :options="typeOptions" label="模板类型" />
      <div class="trpg-template__toolwrap">
      <div class="trpg-toolrow trpg-template__tools">
        <SearchField v-model="search" label="搜模板名字" placeholder="搜名字、英文名" clear-label="清除模板搜索" />
        <button class="trpg-btn" type="button" data-testid="template-filter-toggle" :aria-expanded="showFilters" @click="showFilters = !showFilters">筛选<span v-if="activeFilters" class="trpg-template__badge">{{ activeFilters }}</span></button>
        <span class="trpg-template__sort"><SelectField v-model="sort" :options="[{ value: 'name', label: '名称' }, { value: 'cr', label: '挑战等级' }]" label="模板排序" prefix="排序：" /></span>
        <span class="trpg-toolrow__count">共 {{ filtered.length }} 条<template v-if="search || activeFilters"> ・ <button class="trpg-template__clearall" type="button" @click="search = ''; clearFilters()">清除</button></template></span>
      </div>
      <TemplateFilter v-if="showFilters" :scope="scope" :sources="sourceOptions" :source-packs="sourcePacks" :cr-min="crMin" :cr-max="crMax" :creature-types="creatureTypes" :sizes="sizes" :active-count="activeFilters" :result-count="filtered.length" @update:scope="scope = $event" @update:source-packs="sourcePacks = $event" @update:cr-min="crMin = $event" @update:cr-max="crMax = $event" @update:creature-types="creatureTypes = $event" @update:sizes="sizes = $event" @clear="clearFilters" @done="showFilters = false" />
      </div>
      <div class="trpg-template__body">
        <div class="trpg-template__list">
          <div v-if="loading" class="trpg-skeleton" aria-busy="true" />
          <EmptyState v-else-if="!filtered.length" icon="magnifying-glass" text="没有符合的模板" />
          <VirtualList v-else class="trpg-template__vlist" :items="filtered" :row-height="78" :key-of="(r) => r.entry.id" label="模板列表">
            <template #default="{ item }">
              <TemplateCard :row="item" :selected="selectedId === item.entry.id" @pick="choose(item)" />
            </template>
          </VirtualList>
        </div>
        <div v-if="!narrow" class="trpg-template__preview">
          <EmptyState v-if="!selected" icon="skull" text="选一条看资料卡" />
          <template v-else>
            <div class="trpg-template__scroll">
              <TemplateSummary :row="selected" />
              <EntryDetailPage :pack-id="selected.packId" :entry-id="selected.entry.id" compact />
            </div>
            <p v-if="!selected.block" class="trpg-field__error trpg-template__warn">它的数值所在的书没有安装。</p>
            <TemplateFoot v-model:category="category" v-model:count="count" :mode="mode" :can-use="!!selected.block" @edit-add="editAdd" @add="add" @apply="apply" />
          </template>
        </div>
      </div>
    </template>
    <div v-else class="trpg-template__detailpage">
      <button class="trpg-btn trpg-btn--quiet trpg-template__back" type="button" @click="detailOpen = false"><Icon name="caret-left" :size="16" />模板</button>
      <div v-if="selected" class="trpg-template__scroll">
        <TemplateSummary :row="selected" />
        <EntryDetailPage :pack-id="selected.packId" :entry-id="selected.entry.id" compact />
      </div>
      <template v-if="selected">
        <p v-if="!selected.block" class="trpg-field__error trpg-template__warn">它的数值所在的书没有安装。</p>
        <TemplateFoot v-model:category="category" v-model:count="count" :mode="mode" :can-use="!!selected.block" @edit-add="editAdd" @add="add" @apply="apply" />
      </template>
    </div>
  </div>
</template>
