<script setup lang="ts">
import ErrorBanner from './ErrorBanner.vue'
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { useVirtual } from './useVirtual'
import type { ScopedSearchHit } from '../../library/scoped-search'
import { useAppStore } from '../../stores/app'
import { useLibViewStore } from '../../stores/libview'
import Checkbox from '../kit/Checkbox.vue'
import GroupCheck from '../kit/GroupCheck.vue'
import Icon from '../kit/Icon.vue'
import { openEntry, openReader } from './open'
import { hitCategories, hitCategoryKey, hitCategoryLabel, hitName, hitSource, loadAllHits, searchScopeGroups, withoutUnchecked, type ScopeRow } from './search-data'

/** 全库数据搜索（U2b）：和包弹窗同一种弹窗，多一个可折叠的"书目范围"。默认折叠、折叠状态记住；默认全勾已开启的书，取消勾选只对这次搜索有效。 */
const app = useAppStore()
const lib = useLibViewStore()
const OPEN_KEY = 'search:books:open'

const q = ref('')
const hits = shallowRef<ScopedSearchHit[]>([])
const searching = ref(false)
const failed = ref<string | null>(null)
const cat = ref('all')
const scrollEl = ref<HTMLElement | null>(null)
const unchecked = ref<Set<string>>(new Set())
const expanded = computed(() => (app.settings?.library.collapsed ?? []).includes(OPEN_KEY))

async function setExpanded(open: boolean): Promise<void> {
  if (!app.settings || open === expanded.value) return
  const rest = app.settings.library.collapsed.filter((k) => k !== OPEN_KEY)
  try { await app.updateSettings({ library: { ...app.settings.library, collapsed: open ? [...rest, OPEN_KEY] : rest } }) } catch (e) { console.error('[trpg-assistant] 保存折叠状态失败', e) }
}

// 已安装并已开启的书 / 包：和书架、我的库同一份登记（作者分组 + 自制内容 + 我的库），P5-5 §11.3
const groups = computed(() => searchScopeGroups(lib.shelf?.groups ?? [], new Set(lib.minePacks.map((p) => p.docIdLocal)), (r) => r.view.visible))
const allRows = computed(() => groups.value.flatMap((g) => g.rows))
const isChecked = (r: ScopeRow): boolean => !r.sources.every((x) => unchecked.value.has(x))
const total = computed(() => allRows.value.length)
const checkedCount = computed(() => allRows.value.filter(isChecked).length)
const sourcesOf = (rows: readonly ScopeRow[]): string[] => rows.flatMap((r) => r.sources)
function setChecked(sources: string[], on: boolean): void {
  const next = new Set(unchecked.value)
  for (const s of sources) {
    if (on) next.delete(s)
    else next.add(s)
  }
  unchecked.value = next
}

let timer: ReturnType<typeof setTimeout> | undefined
let seq = 0
async function run(): Promise<void> {
  const term = q.value.trim()
  const mine = ++seq
  const c = lib.campaignLib
  if (!term) {
    // 空态：显示全部条目（边取边显示）
    hits.value = []
    if (!c) return
    searching.value = true
    failed.value = null
    try { await loadAllHits(app.svc(), c, (part) => { if (mine === seq) hits.value = part }) } catch (e) {
      console.error('[trpg-assistant] 读取全部条目失败', e)
      if (mine === seq) { failed.value = e instanceof Error ? e.message : String(e) }
    } finally { if (mine === seq) searching.value = false }
    return
  }
  if (!c) return
  searching.value = true
  failed.value = null
  try {
    const found = await app.svc().backend.library.scoped.search(c, term, { expand: true })
    if (mine === seq) hits.value = found
  } catch (e) {
    console.error('[trpg-assistant] 全库搜索失败', e)
    if (mine === seq) { failed.value = e instanceof Error ? e.message : String(e) }
  } finally {
    if (mine === seq) searching.value = false
  }
}
watch(q, () => { clearTimeout(timer); cat.value = 'all'; toTop(); timer = setTimeout(() => void run(), 250) })
onMounted(() => void run())
onBeforeUnmount(() => clearTimeout(timer))

const visibleHits = computed(() => withoutUnchecked(hits.value, unchecked.value))
const pills = computed(() => hitCategories(visibleHits.value))
const list = computed(() => (cat.value === 'all' ? visibleHits.value : visibleHits.value.filter((h) => hitCategoryKey(h) === cat.value)))
const { range, toTop } = useVirtual(scrollEl, computed(() => list.value.length))
const windowed = computed(() => list.value.slice(range.value.start, range.value.end))
const blocked = computed(() => hits.value.length - visibleHits.value.length)

function open(h: ScopedSearchHit): void {
  if (h.target.kind === 'entry') openEntry(h.ref, hitName(h), h.variant?.docIdLocal ? { docIdLocal: h.variant.docIdLocal } : h.variant?.kind === 'base' ? { original: true } : undefined)
  else if (h.target.kind === 'corpus') openReader({ set: h.target.set ?? h.ref.set, prop: h.target.prop, id: h.target.id, name: hitName(h) })
  else if (h.target.kind === 'document') openReader({ set: h.ref.set, prop: 'document', id: h.target.id, name: hitName(h) })
}
</script>

<template>
  <div class="lib-mbody" data-testid="search-page">
    <div class="lib-filter">
      <input v-model="q" class="trpg-input" type="search" placeholder="输入名字，如 火球术（不输入时列出全部）" aria-label="搜索全部已开启的书" data-autofocus />
    </div>
    <details class="lib-fold lib-fold--bar" :open="expanded" data-testid="search-books" @toggle="setExpanded(($event.target as HTMLDetailsElement).open)">
      <summary><span>书目范围</span><small>已勾选 {{ checkedCount }} / {{ total }}</small><span class="lib-end"><Icon :name="expanded ? 'caret-down' : 'caret-right'" :size="14" /></span></summary>
      <div class="lib-fold__body">
        <p class="lib-muted" style="margin: 0">取消勾选某些书 / 包，可以在这次搜索里临时屏蔽它们；下次进来重新全部勾选。</p>
        <div class="lib-sec" style="padding: 0">全部<span class="lib-end"><GroupCheck :selected="checkedCount" :total="total" label="全部" @change="(all: boolean) => setChecked(sourcesOf(allRows), all)" /></span></div>
        <template v-for="g in groups" :key="g.key">
          <div class="lib-sec" style="padding: 0" data-testid="search-scope-group">{{ g.name }}<span class="lib-end"><GroupCheck :selected="g.rows.filter(isChecked).length" :total="g.rows.length" :label="g.name" @change="(all: boolean) => setChecked(sourcesOf(g.rows), all)" /></span></div>
          <Checkbox v-for="r in g.rows" :key="r.key" :model-value="isChecked(r)" @update:model-value="(v: boolean) => setChecked(r.sources, v)">{{ r.name }}</Checkbox>
        </template>
        <p v-if="!groups.length" class="lib-muted" style="margin: 0">还没有已开启的书。</p>
      </div>
    </details>
    <div v-if="pills.length" class="lib-pills" role="group" aria-label="类别">
      <button class="trpg-pill" type="button" :aria-pressed="cat === 'all'" @click="cat = 'all'">全部<small>{{ visibleHits.length }}</small></button>
      <button v-for="p in pills" :key="p.key" class="trpg-pill" type="button" :aria-pressed="cat === p.key" @click="cat = p.key">{{ p.label }}<small>{{ p.n }}</small></button>
    </div>
    <div v-if="blocked" class="lib-banner" style="margin: 0 var(--sp-4) var(--sp-2)"><Icon name="info" :size="16" /><span>已屏蔽 {{ blocked }} 条（取消勾选的书）。</span></div>
    <div ref="scrollEl" class="lib-mscroll">
      <template v-if="failed">
        <ErrorBanner :text="`搜索没有成功：${failed}`" what="搜索" :actions="[{ label: '重试', run }]" />
        <div class="lib-state"><h3>这次没搜出来</h3><p class="lib-muted">点顶部提示里的【重试】再搜一次；上次的结果还在。</p></div>
      </template>
 <div v-else-if="searching && !hits.length" class="lib-skel" aria-busy="true"><i /><i style="width:80%" /></div>
      <div v-else-if="!list.length" class="lib-state"><h3>{{ q.trim() ? `没找到「${q.trim()}」` : '还没有可显示的条目' }}</h3><button v-if="q.trim()" class="trpg-btn" type="button" @click="q = ''">清空</button></div>
      <div v-else class="lib-list" role="list" data-testid="search-results" :style="{ paddingTop: `${range.padTop}px`, paddingBottom: `${range.padBottom}px` }">
        <button v-for="(h, i) in windowed" :key="`${h.ref.set}:${h.ref.prop}:${h.ref.hash}:${h.variant?.altId ?? ''}:${range.start + i}`" class="lib-list__row" type="button" role="listitem" @click="open(h)">
          <span class="lib-name">{{ hitName(h) }}</span>
          <span class="trpg-badge">{{ hitCategoryLabel(h) }}</span>
          <span v-if="h.variant" class="trpg-badge" data-tone="primary">同名</span>
          <span class="lib-src lib-end">{{ h.variant?.pack ?? hitSource(h) ?? '' }}</span>
        </button>
      </div>
    </div>
    <div class="lib-count">{{ searching ? '正在读取…' : `共 ${list.length} 条` }}</div>
  </div>
</template>
