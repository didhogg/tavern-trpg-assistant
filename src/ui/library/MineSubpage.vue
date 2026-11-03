<script setup lang="ts">
import { computed, markRaw, onMounted, ref, shallowRef, watch } from 'vue'
import { useAppStore } from '../../stores/app'
import { useCampaignStore } from '../../stores/campaign'
import { useLibraryStore } from '../../stores/library'
import { useModalStore } from '../../stores/modal'
import { useToastStore } from '../../stores/toast'
import { errorText } from '../format'
import Checkbox from '../kit/Checkbox.vue'
import Icon from '../kit/Icon.vue'
import MoreMenu from '../kit/MoreMenu.vue'
import SelectField from '../kit/SelectField.vue'
import Term from '../kit/Term.vue'
import VirtualList from '../kit/VirtualList.vue'
import { askConfirm } from '../kit/confirm'
import { deleteMineFlow, duplicateMine, exportMine, openCreateMine, pickTargetPack } from './mineActions'
import { openEntry } from './openDetail'
import { typeLabel } from './typeLabels'
import { isHiddenType } from '../../core/library/hiddenTypes'
import { defaultMinePackId } from '../../core/library/mine'
import LibraryCardHost from '../people/card/LibraryCardHost.vue'

interface Lite { entryId: string; name: string; type: string; summary: string }
const props = defineProps<{ packId: string }>()
const emit = defineEmits<{ back: [] }>()
const app = useAppStore()
const library = useLibraryStore()
const campaign = useCampaignStore()
const modal = useModalStore()
const toast = useToastStore()
const all = shallowRef<Lite[]>([])
const category = ref('all')
const query = ref('')
const selecting = ref(false)
const selected = ref(new Set<string>())
const moving = ref('')
const renaming = ref<string | null>(null)
const renameValue = ref('')
const renameError = ref('')
const pack = computed(() => library.installedMap.get(props.packId))
const isDefault = computed(() => !!pack.value && pack.value.id === defaultMinePackId(pack.value.ruleId))

async function load(): Promise<void> {
  const rows = await app.svc().mine.entries(props.packId)
  all.value = rows.filter((r) => !isHiddenType(r.type)).map((r) => ({ entryId: r.entryId, name: r.name, type: r.type, summary: r.summary })).sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name, 'zh'))
}
onMounted(load)
function openCard(item: Lite): void {
  if (item.type !== 'monster') return
  modal.open({ key: `library-card-${props.packId}-${item.entryId}`, title: item.name, component: markRaw(LibraryCardHost), props: { packId: props.packId, entryId: item.entryId }, variant: 'dialog', bare: true })
}

const categories = computed(() => {
  const counts: Record<string, number> = {}
  for (const e of all.value) counts[e.type] = (counts[e.type] ?? 0) + 1
  return [{ value: 'all', label: '全部' }, ...Object.entries(counts).map(([t, n]) => ({ value: t, label: `${typeLabel(t)}（${n}）` }))]
})
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return all.value.filter((e) => (category.value === 'all' || e.type === category.value) && (!q || e.name.toLowerCase().includes(q)))
})
const otherPacks = computed(() => library.installed.filter((p) => p.source === 'user' && p.id !== props.packId && p.ruleId === pack.value?.ruleId))
const selectedEntries = computed(() => all.value.filter((e) => selected.value.has(e.entryId)))
const allSelected = computed(() => filtered.value.length > 0 && filtered.value.every((e) => selected.value.has(e.entryId)))
const someSelected = computed(() => selected.value.size > 0 && !allSelected.value)
const moveOptions = computed(() => [...otherPacks.value.map((p) => ({ value: p.id, label: p.name })), { value: '__new', label: '＋ 新建包...' }])
const packMenu = computed(() => isDefault.value
  ? [{ key: 'rename', label: '改名与简介' }, { key: 'export', label: '导出为文件' }]
  : [{ key: 'rename', label: '改名与简介' }, { key: 'dup', label: '复制为新包' }, { key: 'export', label: '导出为文件' }, { key: 'delete', label: '删除', danger: true }])

watch([query, category], () => { selected.value = new Set() })
watch(moving, (value) => { if (value) void moveSelected(value) })

async function guarded(action: () => Promise<unknown>, failure: string): Promise<void> {
  try {
    await action()
    await library.refreshInstalled()
    await load()
  } catch (error) {
    console.error(`[trpg-assistant] ${failure}`, error)
    toast.error(`${failure}：${errorText(error)}`)
  }
}

function toggle(id: string, value: boolean): void {
  const next = new Set(selected.value)
  if (value) next.add(id)
  else next.delete(id)
  selected.value = next
}
function toggleAll(value: boolean): void {
  selected.value = value ? new Set(filtered.value.map((e) => e.entryId)) : new Set()
}
function startSelect(): void {
  selecting.value = true
  selected.value = new Set()
  renaming.value = null
}
function finishSelect(): void {
  selecting.value = false
  selected.value = new Set()
  moving.value = ''
}
function startRename(item: Lite): void {
  renaming.value = item.entryId
  renameValue.value = item.name
  renameError.value = ''
}
function cancelRename(): void {
  renaming.value = null
  renameError.value = ''
}
async function saveRename(item: Lite): Promise<void> {
  try {
    await app.svc().mine.renameEntry(props.packId, item.entryId, renameValue.value)
    await library.refreshInstalled()
    await load()
    toast.success('已改名')
    cancelRename()
  } catch (error) {
    renameError.value = errorText(error)
  }
}

async function moveSelected(target: string): Promise<void> {
  const p = pack.value
  if (!p || !selected.value.size) { moving.value = ''; return }
  const count = selected.value.size
  if (target === '__new') {
    moving.value = ''
    openCreateMine(p.ruleId, undefined, (newId) => {
      void (async () => {
        const targetPack = library.installedMap.get(newId)
        await guarded(() => app.svc().mine.moveEntries(p.id, newId, [...selected.value]), '移动失败')
        toast.success(`已把 ${count} 条移到《${targetPack?.name ?? '新包'}》`)
        finishSelect()
      })()
    })
    return
  }
  const targetPack = library.installedMap.get(target)
  await guarded(() => app.svc().mine.moveEntries(p.id, target, [...selected.value]), '移动失败')
  toast.success(`已把 ${count} 条移到《${targetPack?.name ?? target}》`)
  finishSelect()
}

async function deleteSelected(): Promise<void> {
  const p = pack.value
  if (!p || !selectedEntries.value.length) return
  const entries = selectedEntries.value
  const used = (await Promise.all(entries.map((e) => app.svc().mine.usage(p.id, e.entryId)))).reduce((a, b) => a + b, 0)
  const ok = await askConfirm({
    title: '删除条目',
    message: `删除这 ${entries.length} 条？`,
    details: [...entries.map((e) => e.name), `${used} 个存档在用，已固定，不受影响。`],
    confirmLabel: '删除',
    danger: true,
  })
  if (!ok) return
  await guarded(() => app.svc().mine.deleteEntries(p.id, entries.map((e) => e.entryId)), '删除失败')
  toast.success(`已删除 ${entries.length} 条`)
  finishSelect()
}

async function onEntryMenu(key: string, e: Lite): Promise<void> {
  if (key === 'rename') startRename(e)
  else if (key === 'copy') await guarded(() => app.svc().mine.copyEntry(props.packId, e.entryId), '复制失败')
  else if (key === 'move') {
    const target = await pickTargetPack(otherPacks.value.map((p) => ({ id: p.id, name: p.name })))
    if (target) await guarded(() => app.svc().mine.moveEntry(props.packId, target, e.entryId), '移动失败')
  } else if (key === 'delete') {
    const used = await app.svc().mine.usage(props.packId, e.entryId)
    const ok = await askConfirm({ title: '删除条目', message: `删除「${e.name}」？`, details: used ? [`${used} 个存档用到它（已固定，不受影响）。`] : [], confirmLabel: '删除', danger: true })
    if (ok) await guarded(() => app.svc().mine.deleteEntry(props.packId, e.entryId), '删除失败')
  }
}

async function onPackMenu(key: string): Promise<void> {
  const p = pack.value
  if (!p) return
  if (key === 'rename') openCreateMine(p.ruleId, { id: p.id, name: p.name, description: p.description })
  else if (key === 'dup') await duplicateMine(p.id)
  else if (key === 'export') await exportMine(p.id, p.name, p.version)
  else if (key === 'delete' && !isDefault.value && (await deleteMineFlow(p.id, p.name))) emit('back')
}
</script>

<template>
  <div v-if="pack" class="trpg-minesub" data-testid="mine-sub">
    <button class="subpage-back" type="button" @click="$emit('back')"><Icon name="caret-left" :size="16" />我的</button>
    <div class="trpg-step-head">
      <h2 class="trpg-step-title">{{ pack.name }} <span class="trpg-row__meta">v{{ pack.version }}</span></h2>
      <MoreMenu :label="pack.name" :items="packMenu" @select="onPackMenu" />
    </div>
    <div class="trpg-packdetail__filter">
      <SelectField v-model="category" :options="categories" label="类别" />
      <input v-model="query" class="trpg-input" type="search" placeholder="搜索名称" aria-label="搜索条目" />
      <span class="trpg-field__hint">共 {{ filtered.length }} 条</span>
    </div>
    <div class="trpg-toolbar">
      <button v-if="!selecting" class="trpg-btn trpg-btn--small" type="button" data-testid="mine-select" @click="startSelect">选择</button>
      <template v-else>
        <Checkbox :model-value="allSelected" :indeterminate="someSelected" label="全选" @update:model-value="toggleAll">全选</Checkbox>
        <span class="trpg-field__hint" data-testid="mine-selected-count">已选 {{ selected.size }} 条</span>
        <div data-testid="mine-bulk-move">
          <SelectField v-model="moving" :options="moveOptions" label="移到别的包" placeholder="移到别的包" />
        </div>
        <button class="trpg-btn trpg-btn--small" type="button" data-testid="mine-bulk-delete" :disabled="!selected.size" @click="deleteSelected">删除</button>
        <button class="trpg-btn trpg-btn--small" type="button" data-testid="mine-finish-select" @click="finishSelect">完成</button>
      </template>
    </div>
    <div class="trpg-minesub__list">
      <p v-if="!filtered.length" class="trpg-empty">还没有条目</p>
      <VirtualList v-else :items="filtered" :row-height="renaming ? 64 : 52" :key-of="(e) => e.entryId" label="条目列表">
        <template #default="{ item }">
          <Checkbox v-if="selecting" :model-value="selected.has(item.entryId)" :label="`选择 ${item.name}`" @update:model-value="(value) => toggle(item.entryId, value)" />
          <div class="trpg-entryrow">
            <input v-if="renaming === item.entryId" v-model="renameValue" class="trpg-input" data-testid="mine-rename-input" :aria-label="`重命名 ${item.name}`" @keydown.enter.prevent="saveRename(item)" @keydown.esc.prevent="cancelRename" />
            <Term v-else @open="openEntry(packId, item.entryId, item.name)">{{ item.name }}</Term>
            <span class="trpg-row__meta trpg-entryrow__sum">{{ typeLabel(item.type) }}</span>
            <span v-if="renaming === item.entryId && renameError" class="trpg-field__error" data-testid="mine-rename-error" role="alert">{{ renameError }}</span>
          </div>
          <template v-if="!selecting">
            <button v-if="item.type === 'monster'" class="trpg-btn trpg-btn--small" type="button" @click="openCard(item)">打开 ›</button>
            <button v-else class="trpg-btn trpg-btn--small" type="button" disabled title="条目编辑器随后续版本提供">编辑</button>
            <MoreMenu :label="item.name" :items="[{ key: 'rename', label: '改名', disabled: campaign.readOnly }, { key: 'move', label: '移到…', disabled: !otherPacks.length || campaign.readOnly, reason: '没有别的我的包' }, { key: 'copy', label: '复制', disabled: campaign.readOnly }, { key: 'delete', label: '删除', danger: true, disabled: campaign.readOnly }]" @select="onEntryMenu($event, item)" />
          </template>
        </template>
      </VirtualList>
    </div>
    <p class="trpg-field__hint">条目编辑器随后续版本提供；现在可以改名、复制、移动、删除条目。</p>
  </div>
  <p v-else class="trpg-empty">没有找到这个包</p>
</template>
