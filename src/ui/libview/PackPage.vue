<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import type { SortColumn, SortDir } from '../../library/sorting'
import { getSource } from '../../library/sources'
import { useAppStore } from '../../stores/app'
import { useLibViewStore } from '../../stores/libview'
import { useToastStore } from '../../stores/toast'
import Icon from '../kit/Icon.vue'
import SelectField from '../kit/SelectField.vue'
import { loadPackRows, matchName, type PackRow } from './pack-data'
import { openEntry } from './open'
import { categoryLabel, registeredCategories } from './registry'

/** 包 / 书弹窗的列表页（U1a + U3）：搜索与类别药丸始终显示；选"全部"平铺；点行弹窗内换成详情。不出现"书目来源"勾选（进包就是只看这个来源）。 */
const props = defineProps<{ set: string; source: string; name: string; abv?: string }>()
const app = useAppStore()
const lib = useLibViewStore()
const toast = useToastStore()

const rows = ref<PackRow[]>([])
const loading = ref(true)
const failed = ref<string | null>(null)
const q = ref('')
const cat = ref('all')
const sortBy = ref('none')
const dir = ref<SortDir>('asc')
const columns = ref<SortColumn[]>([])
const shown = ref(300)
const sorted = ref<PackRow[] | null>(null)
const codeSet = computed(() => getSource(props.set).codeSet)

async function load(): Promise<void> {
  const c = lib.campaignLib
  if (!c) return
  loading.value = true
  failed.value = null
  try {
    rows.value = await loadPackRows(app.svc(), c, props.set, props.source, (part) => { rows.value = part })
  } catch (e) {
    console.error('[trpg-assistant] 读取包内容失败', e)
    failed.value = e instanceof Error ? e.message : String(e)
    toast.error('读取这个包失败')
  } finally {
    loading.value = false
  }
}
onMounted(() => void load())

const pills = computed(() => {
  const count = new Map<string, number>()
  for (const r of rows.value) count.set(r.prop, (count.get(r.prop) ?? 0) + 1)
  return registeredCategories([...count].map(([prop, n]) => ({ prop, n })))
})
const byCat = computed(() => (cat.value === 'all' ? rows.value : rows.value.filter((r) => r.prop === cat.value)))
const filtered = computed(() => matchName(sorted.value && cat.value !== 'all' ? sorted.value : byCat.value, q.value))
const visible = computed(() => filtered.value.slice(0, shown.value))
const sortOptions = computed(() => [{ value: 'none', label: '默认顺序' }, ...columns.value.map((c) => ({ value: c.sort, label: c.text }))])

// 选了具体类别 → 问后端这一类有哪些能排序的列（作者没有定义的类别没有排序列，就不显示排序）
watch(cat, async (prop) => {
  shown.value = 300
  sortBy.value = 'none'
  sorted.value = null
  columns.value = []
  if (prop === 'all') return
  try { columns.value = await app.svc().backend.library.sorting.columns(codeSet.value, prop) } catch (e) { console.error('[trpg-assistant] 读取排序列失败', e) }
})
watch([sortBy, dir], async () => {
  if (cat.value === 'all' || sortBy.value === 'none') { sorted.value = null; return }
  try {
    sorted.value = await app.svc().backend.library.sorting.sort(codeSet.value, cat.value, byCat.value, (r) => r.ref.hash, sortBy.value, dir.value)
  } catch (e) {
    console.error('[trpg-assistant] 排序失败', e)
    toast.error('排序没有成功')
    sorted.value = null
  }
})
watch(q, () => { shown.value = 300 })
</script>

<template>
  <div class="lib-mbody" data-testid="pack-page">
    <div class="lib-filter">
      <input v-model="q" class="trpg-input" type="search" placeholder="搜索这本书里的条目" aria-label="搜索这本书里的条目" data-autofocus />
    </div>
    <div class="lib-pills" role="group" aria-label="类别">
      <button class="trpg-pill" type="button" :aria-pressed="cat === 'all'" @click="cat = 'all'">全部<small>{{ rows.length }}</small></button>
      <button v-for="p in pills" :key="p.prop" class="trpg-pill" type="button" :aria-pressed="cat === p.prop" @click="cat = p.prop">{{ categoryLabel(p.prop) }}<small>{{ p.n }}</small></button>
    </div>
    <div v-if="columns.length" class="lib-sortbar">
      <SelectField v-model="sortBy" :options="sortOptions" label="排序" prefix="排序：" />
      <button class="trpg-btn trpg-btn--small" type="button" :disabled="sortBy === 'none'" :aria-label="dir === 'asc' ? '升序，点击改降序' : '降序，点击改升序'" @click="dir = dir === 'asc' ? 'desc' : 'asc'">
        <Icon :name="dir === 'asc' ? 'sort-ascending' : 'sort-descending'" :size="14" />{{ dir === 'asc' ? '升序' : '降序' }}
      </button>
    </div>
    <div v-if="failed" class="lib-state"><h3>这个包读不出来</h3><p class="lib-muted">{{ failed }}</p><button class="trpg-btn trpg-btn--primary" type="button" @click="load">重试</button></div>
    <div v-else-if="loading && !rows.length" class="lib-skel" aria-busy="true"><i /><i style="width:80%" /><i style="width:60%" /></div>
    <div v-else class="lib-mscroll">
      <div v-if="!filtered.length" class="lib-state"><h3>{{ q ? '没有符合的' : '这个包里没有可显示的条目' }}</h3><button v-if="q" class="trpg-btn" type="button" @click="q = ''">清空筛选</button></div>
      <div v-else class="lib-list" role="list">
        <button v-for="r in visible" :key="`${r.ref.prop}:${r.ref.hash}`" class="lib-list__row" type="button" role="listitem" :data-off="r.off" @click="openEntry(r.ref, r.name)">
          <span class="lib-name">{{ r.name }}</span>
          <span v-if="cat === 'all'" class="trpg-badge">{{ categoryLabel(r.prop) }}</span>
          <span class="lib-src lib-end">{{ r.pack ?? abv ?? r.source ?? '' }}</span>
        </button>
        <button v-if="filtered.length > shown" class="trpg-btn trpg-btn--small" type="button" style="margin: var(--sp-3) var(--sp-4)" @click="shown += 300">显示更多（还有 {{ filtered.length - shown }} 条）</button>
      </div>
    </div>
    <div class="lib-count">{{ loading ? '正在读取…' : `共 ${filtered.length} 条` }}</div>
  </div>
</template>
