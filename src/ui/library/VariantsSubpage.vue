<script setup lang="ts">
import { computed, ref } from 'vue'
import { libraryOf, ORIGINAL } from '../../core/library/types'
import { fromPack } from '../../core/library/variants'
import { useCampaignStore } from '../../stores/campaign'
import { useLibraryStore } from '../../stores/library'
import { useUiStore } from '../../stores/ui'
import Icon from '../kit/Icon.vue'
import Segmented from '../kit/Segmented.vue'
import SelectField from '../kit/SelectField.vue'
import Term from '../kit/Term.vue'
import { openEntry } from './openDetail'
import { sourceUseFlow, switchVariantFlow } from './saveActions'

defineEmits<{ back: [] }>()
const campaign = useCampaignStore()
const library = useLibraryStore()
const ui = useUiStore()
const filter = ref('all')
const query = ref('')

const lib = computed(() => libraryOf(campaign.workspace!.data))
const nameOf = (key: string): string => lib.value.pins[key]?.entry.name ?? key.slice(key.indexOf('/') + 1)
const typeOf = (key: string): string => lib.value.pins[key]?.entry.type ?? ''

interface Source { id: string; name: string; total: number; used: number }
const sources = computed<Source[]>(() => {
  const map = new Map<string, Source>()
  for (const slot of Object.values(lib.value.variants)) {
    for (const c of slot.candidates) {
      const id = c.source.type === 'pack' ? c.source.packId : 'house'
      const cur = map.get(id) ?? { id, name: c.source.type === 'house' ? '本存档房规' : c.sourceName, total: 0, used: 0 }
      cur.total++
      if (slot.active === c.key) cur.used++
      map.set(id, cur)
    }
  }
  return [...map.values()]
})

interface Item { key: string; name: string; type: string; active: string; slotCandidates: Array<{ key: string; sourceName: string }>; hidden: boolean; broken: boolean }
const items = computed<Item[]>(() =>
  Object.entries(lib.value.variants)
    .filter(([, slot]) => slot.candidates.length)
    .map(([key, slot]) => {
      const a = slot.candidates.find((c) => c.key === slot.active)
      const original = lib.value.pins[key]
      return { key, name: nameOf(key), type: typeOf(key), active: slot.active, slotCandidates: slot.candidates.map((c) => ({ key: c.key, sourceName: c.sourceName })), hidden: a?.mode === 'hide', broken: !!a && a.mode !== 'replace' && !original && !library.installedMap.has(key.slice(0, key.indexOf('/'))) }
    })
    .sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name, 'zh')),
)
const counts = computed(() => ({
  conflict: items.value.filter((i) => i.slotCandidates.length >= 2).length,
  unused: items.value.filter((i) => i.active === ORIGINAL).length,
  hidden: items.value.filter((i) => i.hidden).length,
}))
const shown = computed(() => {
  const q = query.value.trim().toLowerCase()
  return items.value.filter((i) => (filter.value === 'all' || (filter.value === 'conflict' && i.slotCandidates.length >= 2) || (filter.value === 'unused' && i.active === ORIGINAL) || (filter.value === 'hidden' && i.hidden)) && (!q || i.name.toLowerCase().includes(q)))
})
const options = (i: Item) => [{ value: ORIGINAL, label: '原版' }, ...i.slotCandidates.map((c) => ({ value: c.key, label: c.sourceName }))]
const goInstall = (key: string) => ui.openLibrary('ext', key.slice(0, key.indexOf('/')))
</script>

<template>
  <div class="page-stack" data-testid="variants-page">
    <button class="subpage-back" type="button" @click="$emit('back')"><Icon name="caret-left" :size="16" />本存档</button>
    <h2 class="trpg-group trpg-group--first">来源</h2>
    <ul class="trpg-list">
      <li v-for="s in sources" :key="s.id" class="trpg-row">
        <div class="trpg-row__main"><span class="trpg-row__title">{{ s.name }}</span><div class="trpg-row__meta">{{ s.total }} 处<template v-if="s.id !== 'house'"> · 使用中 {{ s.used }}</template></div></div>
        <div v-if="s.id !== 'house'" class="trpg-row__end">
          <button class="trpg-btn trpg-btn--small" type="button" :disabled="campaign.readOnly" @click="sourceUseFlow(fromPack(s.id), s.name, true, nameOf)">全部使用</button>
          <button class="trpg-btn trpg-btn--small" type="button" :disabled="campaign.readOnly" @click="sourceUseFlow(fromPack(s.id), s.name, false, nameOf)">全部不用</button>
        </div>
      </li>
    </ul>
    <div class="trpg-toolbar">
      <Segmented v-model="filter" label="筛选" :options="[{ value: 'all', label: '全部' }, { value: 'conflict', label: `有冲突 ${counts.conflict}` }, { value: 'unused', label: `未使用 ${counts.unused}` }, { value: 'hidden', label: `隐藏的 ${counts.hidden}` }]" />
      <input v-if="items.length > 8" v-model="query" class="trpg-input trpg-toolbar__search" type="search" placeholder="搜索条目" aria-label="搜索条目" />
    </div>
    <ul class="trpg-list">
      <li v-for="i in shown" :key="i.key" class="trpg-row" :data-testid="`variant-${i.name}`">
        <div class="trpg-row__main">
          <Term @open="openEntry(i.key.slice(0, i.key.indexOf('/')), i.key.slice(i.key.indexOf('/') + 1), i.name)">{{ i.name }}</Term>
          <div class="trpg-row__meta">{{ i.type }}<template v-if="i.slotCandidates.length > 1"> · 另有 {{ i.slotCandidates.length - 1 }} 个版本</template></div>
          <div v-if="i.broken" class="trpg-field__error">⚠ 修改无法显示：原版缺失 <button class="trpg-link" type="button" @click="goInstall(i.key)">去安装</button></div>
        </div>
        <div class="trpg-row__end trpg-row__end--select"><SelectField :model-value="i.active" :options="options(i)" :label="`${i.name} 使用的版本`" @update:model-value="switchVariantFlow(i.key, $event ?? ORIGINAL, i.name)" /></div>
      </li>
    </ul>
    <p v-if="!shown.length" class="trpg-empty">没有符合的条目</p>
  </div>
</template>
