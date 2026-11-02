<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from 'vue'
import type { Entry } from '../../schemas/pack'
import type { Person } from '../../schemas/people'
import { monsterDataSchema, type MonsterData } from '../../rules/dnd5e2014/data/entries/spell-monster'
import { toEntry } from '../../core/library/pins'
import { useAppStore } from '../../stores/app'
import { useCampaignStore } from '../../stores/campaign'
import { useLibraryStore } from '../../stores/library'
import { useModalStore } from '../../stores/modal'
import { usePeopleStore } from '../../stores/people'
import { useToastStore } from '../../stores/toast'
import { personFromEntry } from './fromEntry'
import { crValue } from './list'
import { formatCr } from './rows'
import { queryTemplates, type TemplateRow } from './templates'
import { CREATURE, SIZE } from '../library/zh'
import EntryDetailPage from '../library/EntryDetailPage.vue'
import Icon from '../kit/Icon.vue'
import SelectField from '../kit/SelectField.vue'
import Segmented from '../kit/Segmented.vue'
import VirtualList from '../kit/VirtualList.vue'
import TemplateFilter from './TemplateFilter.vue'

const props = defineProps<{ mode?: 'add' | 'apply'; onEditAdd?: (draft: Person, from: string) => void; onApply?: (block: MonsterData, name: string) => void }>()
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
const typeOptions = computed(() => [{ value: 'all', label: `全部 ${countOf('all')}` }, { value: 'monster', label: `怪物 ${countOf('monster')}` }, { value: 'npc', label: `具名 NPC ${countOf('npc')}` }])
const metaOf = (row: TemplateRow): string => {
  if (!row.block) return `${row.entry.type === 'npc' ? '具名 NPC' : '怪物'} ・ 数值未安装`
  const cr = crValue(row.block.cr)
  const size = (row.block.size ?? []).map((s) => SIZE[s] ?? s).join('')
  const creature = CREATURE[row.block.creatureType.type] ?? row.block.creatureType.type
  return [row.entry.type === 'npc' ? '具名 NPC' : '怪物', cr !== undefined ? `挑战 ${formatCr(cr)}` : '', size + creature, row.packName].filter(Boolean).join(' ・ ')
}
function choose(row: TemplateRow): void {
  selectedId.value = row.entry.id
  category.value = row.entry.type === 'npc' ? 'npc' : 'enemy'
  if (narrow.value) detailOpen.value = true
}
function clearFilters(): void { sourcePacks.value = []; crMin.value = 0; crMax.value = 30; creatureTypes.value = []; sizes.value = [] }
function close(): void { modal.close(true) }
function step(delta: number): void { count.value = Math.max(1, Math.min(30, count.value + delta)) }
function normalizedCount(): number { return Math.max(1, Math.min(30, Math.floor(count.value) || 1)) }
async function add(): Promise<void> {
  if (!selected.value?.block) return
  const added = await people.addFromEntry({ ref: { packId: selected.value.packId, entryId: selected.value.entry.id }, count: normalizedCount(), categoryId: category.value })
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
  <div class="trpg-template" data-testid="template-picker">
    <div class="trpg-template__head">
      <Segmented v-model="type" :options="typeOptions" label="模板类型" />
      <span class="trpg-field__hint">选一个，看清楚再加入</span>
    </div>
    <div class="trpg-template__tools">
      <input v-model="search" class="trpg-input trpg-template__search" type="search" placeholder="搜名字、英文名" aria-label="搜模板名字" />
      <button class="trpg-btn trpg-btn--small" type="button" data-testid="template-filter-toggle" @click="showFilters = !showFilters">筛选 {{ activeFilters || '' }}</button>
      <SelectField v-model="sort" :options="[{ value: 'name', label: '名称' }, { value: 'cr', label: '挑战等级' }]" label="模板排序" />
      <span class="trpg-field__hint">共 {{ filtered.length }} 条</span>
      <button v-if="search || activeFilters" class="trpg-btn trpg-btn--quiet" type="button" @click="search = ''; clearFilters()">清除</button>
    </div>
    <TemplateFilter v-if="showFilters" :scope="scope" :sources="sourceOptions" :source-packs="sourcePacks" :cr-min="crMin" :cr-max="crMax" :creature-types="creatureTypes" :sizes="sizes" :active-count="activeFilters" :result-count="filtered.length" @update:scope="scope = $event" @update:source-packs="sourcePacks = $event" @update:cr-min="crMin = $event" @update:cr-max="crMax = $event" @update:creature-types="creatureTypes = $event" @update:sizes="sizes = $event" @clear="clearFilters" @done="showFilters = false" />
    <div v-if="detailOpen && narrow" class="trpg-template__detailpage">
      <button class="trpg-btn trpg-btn--quiet" type="button" @click="detailOpen = false"><Icon name="caret-left" :size="14" />模板</button>
      <h3>{{ selected?.entry.name }}</h3>
      <div v-if="selected" class="trpg-template__detailbody"><EntryDetailPage :pack-id="selected.packId" :entry-id="selected.entry.id" /></div>
    </div>
    <div v-else class="trpg-template__body">
      <div class="trpg-template__list">
        <div v-if="loading" class="trpg-skeleton" aria-busy="true" />
        <p v-else-if="!filtered.length" class="trpg-empty">没有符合的模板</p>
        <VirtualList v-else :items="filtered" :row-height="56" :key-of="(r) => r.entry.id" label="模板列表">
          <template #default="{ item }">
            <button class="trpg-template__row" :class="{ 'is-selected': selectedId === item.entry.id }" type="button" :data-testid="`tpl-row-${item.entry.id}`" @click="choose(item)">
              <span class="trpg-template__row-name">{{ item.entry.name }}<span v-if="item.entry.nameEn" class="trpg-row__meta"> {{ item.entry.nameEn }}</span></span>
              <span class="trpg-template__row-meta">{{ metaOf(item) }}</span>
            </button>
          </template>
        </VirtualList>
      </div>
      <div v-if="!narrow" class="trpg-template__preview">
        <p v-if="!selected" class="trpg-empty">选一条看资料卡</p>
        <EntryDetailPage v-else :pack-id="selected.packId" :entry-id="selected.entry.id" />
      </div>
    </div>
    <div v-if="selected && (!narrow || detailOpen)" class="trpg-template__foot">
      <button class="trpg-btn" type="button" data-testid="tpl-edit-add" :disabled="!selected.block" @click="editAdd">编辑后加入</button>
      <label class="trpg-field trpg-template__cat"><span class="trpg-field__label">放进</span><SelectField v-model="category" :options="[{ value: 'party', label: '队伍' }, { value: 'npc', label: 'NPC' }, { value: 'enemy', label: '敌人' }]" label="放进分类" data-testid="tpl-category" /></label>
      <span class="trpg-template__count"><button type="button" :disabled="count <= 1" @click="step(-1)">−</button><input v-model.number="count" type="number" min="1" max="30" aria-label="数量" data-testid="tpl-count" @blur="count = normalizedCount()" /><button type="button" :disabled="count >= 30" @click="step(1)">＋</button></span>
      <button v-if="mode === 'apply'" class="trpg-btn trpg-btn--primary" type="button" data-testid="tpl-apply" @click="apply">套用到人物</button>
      <button v-else class="trpg-btn trpg-btn--primary" type="button" data-testid="tpl-add" :disabled="!selected.block" @click="add">加入列表</button>
    </div>
    <p v-if="selected && !selected.block" class="trpg-field__error">它的数值所在的书没有安装。</p>
    <button class="trpg-icon-btn trpg-template__close" type="button" aria-label="关闭模板" @click="close"><Icon name="x" :size="18" /></button>
  </div>
</template>

<style scoped>
.trpg-template { display: flex; flex-direction: column; gap: 8px; min-height: 0; height: 100%; }
.trpg-template__head, .trpg-template__tools { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.trpg-template__search { flex: 1; min-width: 180px; max-width: 360px; }
.trpg-template__body { display: grid; grid-template-columns: minmax(280px, 400px) 1fr; gap: 12px; min-height: 0; flex: 1; }
.trpg-template__list { min-height: 0; overflow: hidden; border: 1px solid var(--line); border-radius: var(--radius); background: var(--card); }
.trpg-template__preview { min-height: 0; overflow: auto; border: 1px solid var(--line); border-radius: var(--radius); background: var(--card); padding: 12px; }
.trpg-template__row { display: grid; gap: 2px; width: 100%; min-height: 56px; padding: 8px 10px; border: 0; border-left: 3px solid transparent; border-bottom: 1px solid var(--line); background: transparent; color: var(--ink); text-align: left; cursor: pointer; }
.trpg-template__row.is-selected { background: color-mix(in srgb, var(--primary) 8%, transparent); border-left-color: var(--primary); }
.trpg-template__row-name { font-size: 14px; font-weight: 500; }
.trpg-template__row-meta { font-size: 12px; color: var(--ink-2); }
.trpg-template__detailpage { min-height: 0; overflow: auto; }
.trpg-template__detailbody { border: 1px solid var(--line); border-radius: var(--radius); background: var(--card); padding: 12px; }
.trpg-template__foot { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding-top: 8px; border-top: 1px solid var(--line); }
.trpg-template__cat { display: flex; align-items: center; gap: 6px; }
.trpg-template__cat .trpg-field__label { white-space: nowrap; }
.trpg-template__count { display: inline-flex; align-items: center; border: 1px solid var(--line); border-radius: var(--radius-sm); overflow: hidden; }
.trpg-template__count button { min-width: 32px; min-height: 32px; border: 0; background: var(--card); color: var(--ink); }
.trpg-template__count input { width: 48px; height: 32px; border: 0; border-left: 1px solid var(--line); border-right: 1px solid var(--line); background: var(--card); color: var(--ink); text-align: center; }
.trpg-template__close { position: absolute; top: 8px; right: 8px; }
@media (max-width: 1023px) {
  .trpg-template__body { display: block; overflow: auto; }
  .trpg-template__list { min-height: 320px; }
  .trpg-template__preview { display: none; }
  .trpg-template__foot { position: sticky; bottom: 0; background: var(--card); }
}
:global(.trpg-modal__card:has(.trpg-template)) { width: min(1100px, 92%); height: 86%; }
</style>
