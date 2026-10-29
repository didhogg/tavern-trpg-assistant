<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useCampaignStore } from '../../stores/campaign'
import { useLibraryStore } from '../../stores/library'
import { useUiStore } from '../../stores/ui'
import Term from '../kit/Term.vue'
import PackActions from './PackActions.vue'
import { installFromCatalog } from './actions'
import { openPackDetail } from './openDetail'
import { buildPackRows, CATEGORY_LABEL, CATEGORY_ORDER, contributesLabel, type PackRow } from './rows'

const props = defineProps<{ ruleId: string }>()
const library = useLibraryStore()
const campaign = useCampaignStore()
const ui = useUiStore()
const query = ref('')
const onlyUpdates = ref(false)

onMounted(() => void library.loadCatalog())

const rows = computed(() => buildPackRows(library.installed, library.catalog, props.ruleId).filter((r) => r.source !== 'user'))
const updates = computed(() => rows.value.filter((r) => r.updateVersion))
const shown = computed(() => {
  const q = query.value.trim().toLowerCase()
  return rows.value.filter((r) => (!onlyUpdates.value || r.updateVersion) && (!q || r.name.toLowerCase().includes(q) || (r.nameEn ?? '').toLowerCase().includes(q)))
})
// 同一分类内：已安装的在前，再列可安装的；同系列的归在系列名下，按 order 编号
const groups = computed(() =>
  CATEGORY_ORDER.map((c) => {
    const list = shown.value.filter((r) => r.category === c).sort((a, b) => Number(b.installed) - Number(a.installed) || (a.series?.order ?? 0) - (b.series?.order ?? 0) || a.name.localeCompare(b.name, 'zh'))
    const bySeries = new Map<string, PackRow[]>()
    const single: PackRow[] = []
    for (const r of list) {
      if (r.series) bySeries.set(r.series.id, [...(bySeries.get(r.series.id) ?? []), r])
      else single.push(r)
    }
    return { category: c, label: CATEGORY_LABEL[c], single, series: [...bySeries.values()] }
  }).filter((g) => g.single.length || g.series.length),
)

async function updateAll(): Promise<void> {
  for (const r of updates.value) void installFromCatalog(r.id)
}

watch(() => ui.libraryFocusPack, async (id) => {
  if (!id) return
  await nextTick()
  document.getElementById('trpg-assistant-root')?.shadowRoot?.querySelector(`[data-testid="ext-${id}"]`)?.scrollIntoView({ block: 'center' })
  ui.libraryFocusPack = null
}, { immediate: true })
</script>

<template>
  <div class="page-stack" data-testid="ext-list">
    <div class="trpg-toolbar">
      <input v-if="rows.length > 8" v-model="query" class="trpg-input trpg-toolbar__search" type="search" placeholder="搜索名称" aria-label="搜索扩展包" />
      <button v-if="updates.length" class="trpg-pill" type="button" :aria-pressed="onlyUpdates" data-testid="only-updates" @click="onlyUpdates = !onlyUpdates">有更新 {{ updates.length }}</button>
      <button v-if="onlyUpdates && updates.length" class="trpg-btn trpg-btn--small" type="button" :disabled="campaign.readOnly" @click="updateAll">全部更新</button>
    </div>
    <p v-if="library.catalogState === 'error'" class="trpg-field__hint" role="status">没能连上数据仓库：{{ library.catalogError }} <button class="trpg-btn trpg-btn--small" type="button" @click="library.loadCatalog(true)">重试</button></p>
    <section v-for="g in groups" :key="g.category" :aria-label="g.label">
      <h3 class="trpg-group">{{ g.label }}</h3>
      <ul class="trpg-list">
        <li v-for="r in g.single" :key="r.id" class="trpg-row" :data-testid="`ext-${r.id}`">
          <div class="trpg-row__main"><Term @open="openPackDetail(r.id)">{{ r.name }}</Term><div class="trpg-row__meta">{{ contributesLabel(r) }}</div></div>
          <div class="trpg-row__end"><PackActions :row="r" /></div>
        </li>
        <template v-for="s in g.series" :key="s[0].series!.id">
          <li class="trpg-row trpg-row--series"><span class="trpg-row__title">{{ s[0].series!.name }}（系列）</span></li>
          <li v-for="r in s" :key="r.id" class="trpg-row trpg-row--nested" :data-testid="`ext-${r.id}`">
            <div class="trpg-row__main"><span class="trpg-row__meta">{{ r.series!.order }}</span> <Term @open="openPackDetail(r.id)">{{ r.name }}</Term><div class="trpg-row__meta">{{ contributesLabel(r) }}</div></div>
            <div class="trpg-row__end"><PackActions :row="r" /></div>
          </li>
        </template>
      </ul>
    </section>
    <p v-if="!groups.length" class="trpg-empty">{{ library.catalogState === 'loading' ? '正在读取数据仓库…' : '没有符合的扩展包' }}</p>
  </div>
</template>
