<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useVirtual } from './useVirtual'
import type { ScopedSearchHit } from '../../library/scoped-search'
import { useAppStore } from '../../stores/app'
import { useLibViewStore } from '../../stores/libview'
import { useToastStore } from '../../stores/toast'
import Checkbox from '../kit/Checkbox.vue'
import Icon from '../kit/Icon.vue'
import { openEntry, openReader } from './open'
import { hitCategories, hitCategoryKey, hitCategoryLabel, hitName, hitSource, withoutUnchecked } from './search-data'

/** 全库数据搜索（U2b）：和包弹窗同一种弹窗，多一个可折叠的"书目范围"。默认折叠、折叠状态记住；默认全勾已开启的书，取消勾选只对这次搜索有效。 */
const app = useAppStore()
const lib = useLibViewStore()
const toast = useToastStore()
const OPEN_KEY = 'search:books:open'

const q = ref('')
const hits = ref<ScopedSearchHit[]>([])
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

// 已安装并已开启的书 / 包（按作者分组）；没开启的不列
const groups = computed(() => (lib.shelf?.groups ?? []).map((g) => ({ name: g.name, rows: [...g.books, ...g.adventures].filter((r) => r.downloaded && r.view.visible) })).filter((g) => g.rows.length))
const total = computed(() => groups.value.reduce((n, g) => n + g.rows.length, 0))
const checkedCount = computed(() => groups.value.reduce((n, g) => n + g.rows.filter((r) => !unchecked.value.has(r.source)).length, 0))
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
  if (!term) { hits.value = []; searching.value = false; return }
  const c = lib.campaignLib
  if (!c) return
  searching.value = true
  failed.value = null
  try {
    const found = await app.svc().backend.library.scoped.search(c, term, { expand: true })
    if (mine === seq) hits.value = found
  } catch (e) {
    console.error('[trpg-assistant] 全库搜索失败', e)
    if (mine === seq) { failed.value = e instanceof Error ? e.message : String(e); toast.error('搜索出错了') }
  } finally {
    if (mine === seq) searching.value = false
  }
}
watch(q, () => { clearTimeout(timer); cat.value = 'all'; toTop(); timer = setTimeout(() => void run(), 250) })
onBeforeUnmount(() => clearTimeout(timer))

const visibleHits = computed(() => withoutUnchecked(hits.value, unchecked.value))
const pills = computed(() => hitCategories(visibleHits.value))
const list = computed(() => (cat.value === 'all' ? visibleHits.value : visibleHits.value.filter((h) => hitCategoryKey(h) === cat.value)))
const { range, toTop } = useVirtual(scrollEl, computed(() => list.value.length), ref(44))
const windowed = computed(() => list.value.slice(range.value.start, range.value.end))
const blocked = computed(() => hits.value.length - visibleHits.value.length)

function open(h: ScopedSearchHit): void {
  if (h.target.kind === 'entry') openEntry(h.ref, hitName(h))
  else if (h.target.kind === 'corpus') openReader({ set: h.target.set ?? h.ref.set, prop: h.target.prop, id: h.target.id, name: hitName(h) })
  else if (h.target.kind === 'document') openReader({ set: h.ref.set, prop: 'document', id: h.target.id, name: hitName(h) })
}
</script>

<template>
  <div class="lib-mbody" data-testid="search-page">
    <div class="lib-filter">
      <input v-model="q" class="trpg-input" type="search" placeholder="输入名字，如 火球术" aria-label="搜索全部已开启的书" data-autofocus />
    </div>
    <details class="lib-fold lib-fold--bar" :open="expanded" data-testid="search-books" @toggle="setExpanded(($event.target as HTMLDetailsElement).open)">
      <summary><span>书目范围</span><small>已勾选 {{ checkedCount }} / {{ total }}</small><span class="lib-end"><Icon :name="expanded ? 'caret-down' : 'caret-right'" :size="14" /></span></summary>
      <div class="lib-fold__body">
        <p class="lib-muted" style="margin: 0">取消勾选某些书 / 包，可以在这次搜索里临时屏蔽它们；下次进来重新全部勾选。</p>
        <div style="display: flex; gap: var(--sp-2)">
          <button class="trpg-btn trpg-btn--small" type="button" @click="setChecked(groups.flatMap((g) => g.rows.map((r) => r.source)), true)">全选</button>
          <button class="trpg-btn trpg-btn--small" type="button" @click="setChecked(groups.flatMap((g) => g.rows.map((r) => r.source)), false)">全不选</button>
        </div>
        <template v-for="g in groups" :key="g.name">
          <div class="lib-sec" style="padding: 0">{{ g.name }}<span class="lib-end"><button class="trpg-btn trpg-btn--small" type="button" @click="setChecked(g.rows.map((r) => r.source), !g.rows.every((r) => !unchecked.has(r.source)))">{{ g.rows.every((r) => !unchecked.has(r.source)) ? '这一类取消' : '这一类全选' }}</button></span></div>
          <Checkbox v-for="r in g.rows" :key="r.source" :model-value="!unchecked.has(r.source)" @update:model-value="(v: boolean) => setChecked([r.source], v)">{{ r.name }}</Checkbox>
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
      <div v-if="failed" class="lib-state"><h3>搜索出错了</h3><p class="lib-muted">{{ failed }}</p><button class="trpg-btn trpg-btn--primary" type="button" @click="run">重试</button></div>
      <div v-else-if="!q.trim()" class="lib-state"><p class="lib-muted">输入名字开始搜。</p></div>
      <div v-else-if="searching && !hits.length" class="lib-skel" aria-busy="true"><i /><i style="width:80%" /></div>
      <div v-else-if="!list.length" class="lib-state"><h3>没找到「{{ q.trim() }}」</h3><button class="trpg-btn" type="button" @click="q = ''">清空</button></div>
      <div v-else class="lib-list" role="list" data-testid="search-results" :style="{ paddingTop: `${range.padTop}px`, paddingBottom: `${range.padBottom}px` }">
        <button v-for="(h, i) in windowed" :key="`${h.ref.set}:${h.ref.prop}:${h.ref.hash}:${h.variant?.altId ?? ''}:${range.start + i}`" class="lib-list__row" type="button" role="listitem" @click="open(h)">
          <span class="lib-name">{{ hitName(h) }}</span>
          <span class="trpg-badge">{{ hitCategoryLabel(h) }}</span>
          <span v-if="h.variant" class="trpg-badge" data-tone="primary">同名</span>
          <span class="lib-src lib-end">{{ h.variant?.pack ?? hitSource(h) ?? '' }}</span>
        </button>
      </div>
    </div>
    <div class="lib-count">{{ q.trim() && !searching ? `共 ${list.length} 条` : '' }}</div>
  </div>
</template>
