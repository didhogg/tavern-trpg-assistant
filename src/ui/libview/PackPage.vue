<script setup lang="ts">
import ErrorBanner from './ErrorBanner.vue'
import { computed, onMounted, ref, shallowRef, watch } from 'vue'
import { useVirtual } from './useVirtual'
import type { ListCells, SortDir } from '../../library/sorting'
import { getSource } from '../../library/sources'
import { useAppStore } from '../../stores/app'
import { useLibViewStore } from '../../stores/libview'
import Icon from '../kit/Icon.vue'
import { loadPackRows, matchName, type PackRow } from './pack-data'
import { openEntry, openReader } from './open'
import { categoryLabel, registeredCategories } from './registry'

/** 包 / 书弹窗的列表页（U1a + U3）：搜索与类别药丸始终显示；选"全部"平铺；点行弹窗内换成详情。不出现"书目来源"勾选（进包就是只看这个来源）。 */
const props = defineProps<{ set: string; source: string; name: string; abv?: string; kind?: 'book' | 'adventure'; corpora?: Array<{ prop: string; id: string; name: string }>; docIdLocal?: string }>()
const app = useAppStore()
const lib = useLibViewStore()

const rows = shallowRef<PackRow[]>([])
const loading = ref(true)
const failed = ref<string | null>(null)
const q = ref('')
const cat = ref('all')
const sortBy = ref('none')
const dir = ref<SortDir>('asc')
const cells = ref<ListCells | null>(null)
const scrollEl = ref<HTMLElement | null>(null)
const sorted = ref<PackRow[] | null>(null)
const codeSet = computed(() => getSource(props.set).codeSet)

// 书 / 冒险本身是"书"类别里的一条条目（点进去是阅读器，不在包外壳上放按钮）；官方的从书目索引找，自制的用包里带的正文
const readers = ref<Array<{ set: string; prop: string; id: string; name: string }>>([])
async function loadReaders(): Promise<void> {
  if (props.corpora?.length) { readers.value = props.corpora.map((c) => ({ set: props.set, prop: c.prop, id: c.id, name: c.name })); return }
  if (!props.kind) return
  try {
    const index = await app.svc().backend.library.links.corpusIndex(codeSet.value)
    const found: Array<{ set: string; prop: string; id: string; name: string }> = []
    for (const [prop, m] of index) for (const providers of m.values()) { const r = providers[0]; if (r && r.source === props.source && (r.set ?? props.set) === props.set) found.push({ set: props.set, prop, id: r.id, name: props.name }) }
    readers.value = found
  } catch (e) { console.error('[trpg-assistant] 读取书目索引失败', e) }
}
async function load(): Promise<void> {
  const c = lib.campaignLib
  if (!c) return
  loading.value = true
  failed.value = null
  try {
    rows.value = await loadPackRows(app.svc(), c, props.set, props.source, (part) => { rows.value = part }, props.docIdLocal)
  } catch (e) {
    console.error('[trpg-assistant] 读取包内容失败', e)
    failed.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}
onMounted(() => { void load(); void loadReaders() })

const pills = computed(() => {
  const count = new Map<string, number>()
  for (const r of rows.value) count.set(r.prop, (count.get(r.prop) ?? 0) + 1)
  return registeredCategories([...count].map(([prop, n]) => ({ prop, n })))
})
const shownReaders = computed(() => (cat.value === 'all' || cat.value === 'book' ? readers.value.filter((r) => !q.value.trim() || r.name.toLowerCase().includes(q.value.trim().toLowerCase())) : []))
const byCat = computed(() => (cat.value === 'all' ? rows.value : rows.value.filter((r) => r.prop === cat.value)))
const filtered = computed(() => matchName(sorted.value && cat.value !== 'all' ? sorted.value : byCat.value, q.value))
const { range, toTop } = useVirtual(scrollEl, computed(() => filtered.value.length))
const visible = computed(() => filtered.value.slice(range.value.start, range.value.end))
// 列与每列显示什么都来自作者列表页（B-35）；来源列不用作者的文字（带标记），我们自己在行尾灰字标
const cols = computed(() => (cells.value?.columns ?? []).map((c, i) => ({ ...c, i, text: c.sort === 'concentration' ? c.title ?? c.text : c.text })).filter((c) => c.sort !== 'source'))
const nameCol = computed(() => cols.value.find((c) => c.sort === 'name')?.i ?? 0)
function cellValue(row: PackRow, column: typeof cols.value[number]): string {
  if (column.i === nameCol.value) return row.name
  const value = cells.value?.cells[row.ref.hash]?.[column.i] ?? ''
  return column.sort === 'concentration' && value ? (codeSet.value === 'cn' ? '需要' : 'Required') : value
}
function sortOn(key: string): void {
  if (sortBy.value !== key) { sortBy.value = key; dir.value = 'asc' } else if (dir.value === 'asc') dir.value = 'desc'
  else sortBy.value = 'none'
}

// 选了具体类别 → 问后端这一类有哪些能排序的列（作者没有定义的类别没有排序列，就不显示排序）
watch(cat, async (prop) => {
  toTop()
  sortBy.value = 'none'
  sorted.value = null
  cells.value = null
  if (prop === 'all') return
  try { cells.value = await app.svc().backend.library.sorting.cells(codeSet.value, prop) } catch (e) { console.error('[trpg-assistant] 读取列表列失败', e) }
})
/** 排序没成功：横幅说明，列表按原顺序显示（P5-5 §12.3） */
const sortError = ref<string | null>(null)
watch([sortBy, dir], async () => {
  sortError.value = null
  if (cat.value === 'all' || sortBy.value === 'none') { sorted.value = null; return }
  try {
    sorted.value = await app.svc().backend.library.sorting.sort(codeSet.value, cat.value, byCat.value, (r) => r.ref.hash, sortBy.value, dir.value)
  } catch (e) {
    console.error('[trpg-assistant] 排序失败', e)
    sortError.value = e instanceof Error ? e.message : String(e)
    sorted.value = null
  }
})
watch(q, () => toTop())
</script>

<template>
  <div class="lib-mbody" data-testid="pack-page">
    <div class="lib-filter">
      <input v-model="q" class="trpg-input" type="search" placeholder="搜索这本书里的条目" aria-label="搜索这本书里的条目" data-autofocus />
    </div>
    <div class="lib-pills" role="group" aria-label="类别">
      <button class="trpg-pill" type="button" :aria-pressed="cat === 'all'" @click="cat = 'all'">全部<small>{{ rows.length }}</small></button>
      <button v-if="readers.length" class="trpg-pill" type="button" :aria-pressed="cat === 'book'" @click="cat = 'book'">书<small>{{ readers.length }}</small></button>
      <button v-for="p in pills" :key="p.prop" class="trpg-pill" type="button" :aria-pressed="cat === p.prop" @click="cat = p.prop">{{ categoryLabel(p.prop) }}<small>{{ p.n }}</small></button>
    </div>
    <ErrorBanner v-if="sortError && !failed" :text="`排序没有成功，先按原顺序显示：${sortError}`" what="排序" dismissible @dismiss="sortError = null" />
    <template v-if="failed">
      <ErrorBanner :text="`这个包没读出来：${failed}`" what="读取这个包" :actions="[{ label: '重试', run: load }]" />
      <div class="lib-state"><h3>这个包暂时读不出来</h3><p class="lib-muted">点上面的【重试】再读一次。</p></div>
    </template>
    <div v-else-if="loading && !rows.length" class="lib-skel" aria-busy="true"><i /><i style="width:80%" /><i style="width:60%" /></div>
    <div v-else ref="scrollEl" class="lib-mscroll">
      <div v-if="cat === 'book' ? false : !filtered.length && !shownReaders.length" class="lib-state"><h3>{{ q ? '没有符合的' : '这个包里没有可显示的条目' }}</h3><button v-if="q" class="trpg-btn" type="button" @click="q = ''">清空筛选</button></div>
      <div v-else-if="cat === 'book'" class="lib-list" role="list">
        <button v-for="r in shownReaders" :key="`${r.prop}:${r.id}`" class="lib-list__row" type="button" role="listitem" data-testid="book-row" @click="openReader(r)"><span class="lib-name">{{ r.name }}</span><span class="trpg-badge">{{ r.prop === 'adventure' ? '冒险' : '书' }}</span></button>
      </div>
      <div v-else-if="cat !== 'all' && cols.length" class="lib-tablewrap" data-testid="pack-table">
        <table class="lib-table">
          <thead>
            <tr>
              <th v-for="c in cols" :key="c.i" :aria-sort="c.sort && sortBy === c.sort ? (dir === 'asc' ? 'ascending' : 'descending') : undefined">
                <button v-if="c.sort" class="lib-th" type="button" :title="c.title ?? undefined" @click="sortOn(c.sort)">{{ c.text }}<Icon :name="sortBy === c.sort && dir === 'desc' ? 'sort-descending' : 'sort-ascending'" :size="14" :class="{ 'lib-sortable': sortBy !== c.sort }" /></button>
                <template v-else>{{ c.text }}</template>
              </th>
              <th class="lib-src">来源</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="range.padTop" aria-hidden="true" class="lib-spacer" :style="{ height: `${range.padTop}px` }"><td :colspan="cols.length + 1" /></tr>
            <tr v-for="r in visible" :key="`${r.ref.prop}:${r.ref.hash}:${r.selection && 'docIdLocal' in r.selection ? r.selection.docIdLocal : ''}`" tabindex="0" :data-off="r.off" @click="openEntry(r.ref, r.name, r.selection)" @keydown.enter="openEntry(r.ref, r.name, r.selection)">
              <td v-for="c in cols" :key="c.i" :class="{ 'lib-name': c.i === nameCol }">{{ cellValue(r, c) }}</td>
              <td class="lib-src">{{ r.pack ?? abv ?? r.source ?? '' }}</td>
            </tr>
            <tr v-if="range.padBottom" aria-hidden="true" class="lib-spacer" :style="{ height: `${range.padBottom}px` }"><td :colspan="cols.length + 1" /></tr>
          </tbody>
        </table>
      </div>
      <div v-else class="lib-list" role="list" :style="{ paddingTop: `${range.padTop}px`, paddingBottom: `${range.padBottom}px` }">
        <button v-for="r in shownReaders" :key="`r${r.prop}:${r.id}`" class="lib-list__row" type="button" role="listitem" data-testid="book-row" @click="openReader(r)"><span class="lib-name">{{ r.name }}</span><span class="trpg-badge">{{ r.prop === 'adventure' ? '冒险' : '书' }}</span></button>
        <button v-for="r in visible" :key="`${r.ref.prop}:${r.ref.hash}:${r.selection && 'docIdLocal' in r.selection ? r.selection.docIdLocal : ''}`" class="lib-list__row" type="button" role="listitem" :data-off="r.off" @click="openEntry(r.ref, r.name, r.selection)">
          <span class="lib-name">{{ r.name }}</span>
          <span v-if="cat === 'all'" class="trpg-badge">{{ categoryLabel(r.prop) }}</span>
          <span class="lib-src lib-end">{{ r.pack ?? abv ?? r.source ?? '' }}</span>
        </button>
      </div>
    </div>
    <div class="lib-count">{{ loading ? '正在读取…' : `共 ${filtered.length} 条` }}</div>
  </div>
</template>
