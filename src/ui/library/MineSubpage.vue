<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from 'vue'
import { useAppStore } from '../../stores/app'
import { useCampaignStore } from '../../stores/campaign'
import { useLibraryStore } from '../../stores/library'
import { useToastStore } from '../../stores/toast'
import { errorText } from '../format'
import Icon from '../kit/Icon.vue'
import MoreMenu from '../kit/MoreMenu.vue'
import SelectField from '../kit/SelectField.vue'
import Term from '../kit/Term.vue'
import VirtualList from '../kit/VirtualList.vue'
import { askConfirm } from '../kit/confirm'
import { deleteMineFlow, duplicateMine, exportMine, openCreateMine, pickTargetPack } from './mineActions'
import { openEntry } from './openDetail'
import { typeLabel } from './typeLabels'

interface Lite { entryId: string; name: string; type: string; summary: string }
const props = defineProps<{ packId: string }>()
const emit = defineEmits<{ back: [] }>()
const app = useAppStore()
const library = useLibraryStore()
const campaign = useCampaignStore()
const toast = useToastStore()
const all = shallowRef<Lite[]>([])
const category = ref('all')
const query = ref('')
const pack = computed(() => library.installedMap.get(props.packId))

async function load(): Promise<void> {
  const rows = await app.svc().mine.entries(props.packId)
  all.value = rows.map((r) => ({ entryId: r.entryId, name: r.name, type: r.type, summary: r.summary })).sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name, 'zh'))
}
onMounted(load)

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

async function onEntryMenu(key: string, e: Lite): Promise<void> {
  if (key === 'copy') await guarded(() => app.svc().mine.copyEntry(props.packId, e.entryId), '复制失败')
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
  else if (key === 'delete' && (await deleteMineFlow(p.id, p.name))) emit('back')
}
</script>

<template>
  <div v-if="pack" class="trpg-minesub" data-testid="mine-sub">
    <button class="subpage-back" type="button" @click="$emit('back')"><Icon name="caret-left" :size="16" />我的</button>
    <div class="trpg-step-head">
      <h2 class="trpg-step-title">{{ pack.name }} <span class="trpg-row__meta">v{{ pack.version }}</span></h2>
      <MoreMenu :label="pack.name" :items="[{ key: 'rename', label: '改名与简介' }, { key: 'dup', label: '复制为新包' }, { key: 'export', label: '导出为文件' }, { key: 'delete', label: '删除', danger: true }]" @select="onPackMenu" />
    </div>
    <div class="trpg-packdetail__filter">
      <SelectField v-model="category" :options="categories" label="类别" />
      <input v-model="query" class="trpg-input" type="search" placeholder="搜索名称" aria-label="搜索条目" />
      <span class="trpg-field__hint">共 {{ filtered.length }} 条</span>
    </div>
    <div class="trpg-minesub__list">
      <p v-if="!filtered.length" class="trpg-empty">还没有条目</p>
      <VirtualList v-else :items="filtered" :row-height="52" :key-of="(e) => e.entryId" label="条目列表">
        <template #default="{ item }">
          <div class="trpg-entryrow">
            <Term @open="openEntry(packId, item.entryId, item.name)">{{ item.name }}</Term>
            <span class="trpg-row__meta trpg-entryrow__sum">{{ typeLabel(item.type) }}</span>
          </div>
          <button class="trpg-btn trpg-btn--small" type="button" disabled title="条目编辑器随后续版本提供">编辑</button>
          <MoreMenu :label="item.name" :items="[{ key: 'move', label: '移到…', disabled: !otherPacks.length || campaign.readOnly, reason: '没有别的我的包' }, { key: 'copy', label: '复制', disabled: campaign.readOnly }, { key: 'delete', label: '删除', danger: true, disabled: campaign.readOnly }]" @select="onEntryMenu($event, item)" />
        </template>
      </VirtualList>
    </div>
    <p class="trpg-field__hint">条目编辑器随后续版本提供；现在可以复制、移动、删除条目。</p>
  </div>
  <p v-else class="trpg-empty">没有找到这个包</p>
</template>
