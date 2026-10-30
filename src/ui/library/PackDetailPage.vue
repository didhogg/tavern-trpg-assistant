<script setup lang="ts">
import { computed, onMounted, ref, shallowRef, watch } from 'vue'
import { useAppStore } from '../../stores/app'
import { useCampaignStore } from '../../stores/campaign'
import { useLibraryStore } from '../../stores/library'
import { formatBytes } from '../format'
import SelectField from '../kit/SelectField.vue'
import Term from '../kit/Term.vue'
import VirtualList from '../kit/VirtualList.vue'
import { openEntry, openPackDetail } from './openDetail'
import { contributesLabel, findRow, SOURCE_LABEL } from './rows'
import { isHiddenType } from '../../core/library/hiddenTypes'
import { typeLabel } from './typeLabels'

interface Lite { entryId: string; name: string; nameEn?: string; type: string; summary: string }

const props = defineProps<{ packId: string }>()
const app = useAppStore()
const library = useLibraryStore()
const campaign = useCampaignStore()
const row = computed(() => findRow(props.packId, library.installed, library.catalog))
const nameOf = (id: string) => findRow(id, library.installed, library.catalog)?.name ?? id
const installedOf = (id: string) => library.installedMap.has(id)

const all = shallowRef<Lite[]>([])
const loaded = ref(false)
const category = ref('all')
const query = ref('')

async function load(): Promise<void> {
  if (!row.value?.installed) return
  const rows = await app.svc().db.entries.where('packId').equals(props.packId).toArray()
  all.value = rows
    .filter((r) => !r.override && !isHiddenType(r.type))
    .map((r) => ({ entryId: r.entryId, name: r.name, nameEn: r.nameEn, type: r.type, summary: r.summary }))
    .sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name, 'zh'))
  loaded.value = true
}
onMounted(load)
watch(() => row.value?.installed, load)

const categories = computed(() => {
  const counts: Record<string, number> = {}
  for (const e of all.value) counts[e.type] = (counts[e.type] ?? 0) + 1
  return [{ value: 'all', label: '全部' }, ...Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([t, n]) => ({ value: t, label: `${typeLabel(t)}（${n}）` }))]
})
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return all.value.filter((e) => (category.value === 'all' || e.type === category.value) && (!q || e.name.toLowerCase().includes(q) || (e.nameEn ?? '').toLowerCase().includes(q)))
})
const meta = computed(() => {
  const r = row.value
  if (!r) return ''
  return [SOURCE_LABEL[r.source], `v${r.version}`, formatBytes(r.byteSize), r.installed ? '已安装' : '未安装'].filter(Boolean).join(' · ')
})
const enabledText = computed(() => {
  const ws = campaign.workspace
  if (!ws || !row.value || ws.ruleId !== row.value.ruleId) return ''
  if (!row.value.installed) return '本存档：未安装'
  return ws.enabledPacks.some((p) => p.id === props.packId) ? '本存档：已启用' : '本存档：未启用'
})
</script>

<template>
  <div v-if="row" class="trpg-packdetail" data-testid="pack-detail">
    <div class="trpg-packdetail__head">
      <p class="trpg-row__meta">{{ meta }} · {{ contributesLabel(row) }}</p>
      <p v-if="row.description" class="trpg-packdetail__desc">{{ row.description }}</p>
      <ul class="trpg-detail-links">
        <li v-if="row.requires.length">需要：<template v-for="(id, i) in row.requires" :key="id"><template v-if="i">、</template><Term @open="openPackDetail(id)">{{ nameOf(id) }}</Term> {{ installedOf(id) ? '✓' : '（未安装）' }}</template></li>
        <li v-if="row.recommends.length">推荐：<template v-for="(id, i) in row.recommends" :key="id"><template v-if="i">、</template><Term @open="openPackDetail(id)">{{ nameOf(id) }}</Term></template></li>
        <li v-if="row.conflicts.length">冲突：<template v-for="(c, i) in row.conflicts" :key="c.id"><template v-if="i">、</template>{{ nameOf(c.id) }}</template></li>
        <li v-if="enabledText">{{ enabledText }}</li>
      </ul>
    </div>
    <template v-if="row.installed">
      <div class="trpg-packdetail__filter">
        <SelectField v-model="category" :options="categories" label="类别" />
        <input v-model="query" class="trpg-input" type="search" placeholder="搜索名称" aria-label="搜索条目" />
        <span class="trpg-field__hint" data-testid="entry-count">共 {{ filtered.length }} 条</span>
      </div>
      <div class="trpg-packdetail__list">
        <div v-if="!loaded" class="trpg-skeleton" aria-busy="true" />
        <p v-else-if="!filtered.length" class="trpg-empty">没有符合的条目 <button v-if="query || category !== 'all'" class="trpg-link" type="button" @click="query = ''; category = 'all'">清除筛选</button></p>
        <VirtualList v-else :items="filtered" :row-height="52" :key-of="(e) => e.entryId" label="条目列表">
          <template #default="{ item }">
            <div class="trpg-entryrow">
              <Term @open="openEntry(packId, item.entryId, item.name)">{{ item.name }}</Term>
              <span class="trpg-row__meta trpg-entryrow__sum">{{ typeLabel(item.type) }}<template v-if="item.summary"> · {{ item.summary }}</template></span>
            </div>
          </template>
        </VirtualList>
      </div>
    </template>
    <p v-else class="trpg-empty">安装后可以查看每一条。</p>
  </div>
  <p v-else class="trpg-empty">没有找到这个扩展包</p>
</template>
