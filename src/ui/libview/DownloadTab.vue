<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { DataSetState } from '../../core/start-campaign'
import type { CatalogRow } from '../../library/scoped'
import { getSource } from '../../library/sources'
import { useAppStore } from '../../stores/app'
import { useDownloadsStore } from '../../stores/downloads'
import { useLibViewStore } from '../../stores/libview'
import Icon from '../kit/Icon.vue'
import MoreMenu from '../kit/MoreMenu.vue'
import { askConfirm } from '../kit/confirm'
import { formatBytes } from '../format'
import BrewCatalog from './BrewCatalog.vue'
import DlSection, { type DlGroup } from './DlSection.vue'
import { reportLibError } from './deps-flow'
import { ruleBadge } from './registry'
import { useToastStore } from '../../stores/toast'

/**
 * 下载页（U4，P5 T6 B2）：官方资料 / 冒险 / 自制包三个栏目，每栏 搜索 + 【多选】，官方和冒险按作者分类分组（可折叠）。
 * 每一行单独【下载】或显示「已装」；多选后底部【下载选中的 n 本】【下载这一类全部】。行和分组都来自书架那一份数据（作者书目），不手写书单。
 */
const app = useAppStore()
const lib = useLibViewStore()
const dl = useDownloadsStore()
const toast = useToastStore()
const sets = ref<DataSetState[]>([])
const error = ref<string | null>(null)
type Rule = 'all' | '5e' | '5.5e' | 'none'
const rule = ref<Rule>('all')
const RULES: Array<{ value: Rule; label: string }> = [{ value: 'all', label: '全部' }, { value: '5e', label: '5e' }, { value: '5.5e', label: '5.5e' }, { value: 'none', label: '未归类' }]
const qBooks = ref('')
const qAdv = ref('')
const selBooks = ref<Set<string>>(new Set())
const selAdv = ref<Set<string>>(new Set())

const keyOf = (r: CatalogRow): string => `${r.set}:${r.kind}:${r.id ?? `src:${r.source}`}`
const hit = (r: CatalogRow, q: string): boolean => !q.trim() || `${r.name} ${r.altName ?? ''} ${r.abv}`.toLowerCase().includes(q.trim().toLowerCase())
const ruleOk = (r: CatalogRow): boolean => rule.value === 'all' || (rule.value === 'none' ? ruleBadge(r) === null : ruleBadge(r) === rule.value)
const isOfficial = (r: CatalogRow): boolean => getSource(r.set).kind === 'official'
const groupsOf = (pick: (g: { books: CatalogRow[]; adventures: CatalogRow[] }) => CatalogRow[], q: string, extra: (r: CatalogRow) => boolean): Array<DlGroup<CatalogRow>> =>
  (lib.shelf?.groups ?? []).map((g) => ({ key: g.group, name: g.name, rows: pick(g).filter((r) => isOfficial(r) && hit(r, q) && extra(r)).map((r) => ({ key: keyOf(r), name: r.name, selectable: !r.downloaded && !rowTask(r), row: r })) })).filter((g) => g.rows.length)
const bookGroups = computed(() => groupsOf((g) => g.books, qBooks.value, ruleOk))
const advGroups = computed(() => groupsOf((g) => g.adventures, qAdv.value, () => true))
const allBooks = computed(() => (lib.shelf?.groups ?? []).flatMap((g) => g.books).filter(isOfficial))
const allAdv = computed(() => (lib.shelf?.groups ?? []).flatMap((g) => g.adventures).filter(isOfficial))
const officialReady = computed(() => sets.value.some((s) => s.status === 'installed'))

// 行 → 正在跑的任务：按书下载时记下「这一行属于哪个任务」，任务进度直接显示在行上
const pending = ref<Map<string, string>>(new Map())
const rowTask = (r: CatalogRow) => {
  if (r.kind === 'adventure') return dl.items.find((i) => i.kind === 'adventure' && i.set === r.set && i.item === r.id) ?? null
  const key = pending.value.get(keyOf(r))
  return key ? dl.items.find((i) => i.key === key) ?? null : null
}

async function loadStatus(): Promise<void> {
  error.value = null
  try { sets.value = await app.svc().backend.starter.dataStatus() } catch (e) { console.error('[trpg-assistant] 读取下载页失败', e); error.value = e instanceof Error ? e.message : String(e) }
}
onMounted(() => void loadStatus())
// 任务结束（完成 / 失败 / 取消）才重读一次安装状态；任务进行中不整页重读
let lastRunning = 0
watch(() => dl.running.length + dl.paused.length, (n) => { if (n < lastRunning) void loadStatus() /* 书架由库页外壳在任务结束时重读 */; lastRunning = n }, { immediate: true })

/** 按书下载：同一次选中的书合成一个任务（中文这一套；每本单开会把整套重解析很多遍）。 */
function downloadBooks(rows: CatalogRow[]): void {
  const s = app.svc()
  const bySet = new Map<string, CatalogRow[]>()
  for (const r of rows.filter((x) => !x.downloaded)) bySet.set(r.set, [...(bySet.get(r.set) ?? []), r])
  for (const [setId, list] of bySet) {
    const books = list.flatMap((r) => (r.id ? [r.id] : []))
    const sources = list.map((r) => r.source)
    const label = list.length === 1 ? list[0].name : `${list[0].name} 等 ${list.length} 本`
    const start = (): void => {
      try {
        const id = s.backend.library.tasks.startOfficial(setId, { books: books.length ? books : null, sources })
        dl.rememberTask(id, label, start)
        const next = new Map(pending.value)
        for (const r of list) next.set(keyOf(r), `official-book:${label}`)
        pending.value = next
      } catch (e) { void reportLibError(s, e, `下载《${label}》`, toast, start) }
    }
    start()
  }
  dl.refresh()
}
function downloadAdventures(rows: CatalogRow[]): void {
  const s = app.svc()
  for (const r of rows.filter((x) => !x.downloaded && x.id)) {
    const before = rowTask(r)
    if (before?.status === 'failed') dl.markRetried(before.key)
    dl.rememberName(r.set, r.id!, r.name)
    try { s.backend.library.tasks.startAdventure(r.set, r.id!) } catch (e) { void reportLibError(s, e, `下载冒险《${r.name}》`, toast) }
  }
  dl.refresh()
}
function downloadAllOfficial(): void {
  const tasks = app.svc().backend.library.tasks
  for (const set of sets.value.filter((x) => x.status !== 'installed' && x.status !== 'running')) tasks.startOfficial(set.setId)
  dl.refresh()
}
async function downloadAllAdventures(): Promise<void> {
  const left = allAdv.value.filter((r) => !r.downloaded)
  if (!left.length) return
  if (await askConfirm({ title: `下载全部 ${left.length} 本冒险？`, message: '会在后台一本一本下载，进度见【库】标志；可以随时在那里取消。', confirmLabel: `下载 ${left.length} 本` })) downloadAdventures(left)
}

// 选中的书要下载多少：后端按所选书算（拿不到书目时是「计算中」，不拿整套冒充）
const estimate = ref<{ bytes: number | null; busy: boolean }>({ bytes: null, busy: false })
let estTimer: ReturnType<typeof setTimeout> | undefined
watch(selBooks, (sel) => {
  clearTimeout(estTimer)
  const rows = allBooks.value.filter((r) => sel.has(keyOf(r)))
  if (!rows.length) { estimate.value = { bytes: null, busy: false }; return }
  estimate.value = { bytes: null, busy: true }
  estTimer = setTimeout(async () => {
    try {
      const setId = rows[0].set
      const books = rows.flatMap((r) => (r.id ? [r.id] : []))
      const r = await app.svc().backend.library.estimate({ sets: [setId], books: { [setId]: books }, sources: { [setId]: rows.map((x) => x.source) } }, { network: false })
      estimate.value = { bytes: r.data.bytes, busy: false }
    } catch (e) { console.warn('[trpg-assistant] 估算下载大小失败', e); estimate.value = { bytes: null, busy: false } }
  }, 300)
})
onBeforeUnmount(() => clearTimeout(estTimer))
// 栏目 ⋯ →【重新拉取书目】：重新取作者书目（取不到时后端保留旧的，书架不会变空），再按当前战役重读书架
const reloading = ref(false)
async function reloadDirectory(): Promise<void> {
  if (reloading.value) return
  reloading.value = true
  const s = app.svc()
  try {
    const rec = await s.backend.library.directory.refresh(lib.campaignLib?.codeSet ?? 'cn')
    await lib.refresh(s)
    await loadStatus()
    if (rec.errors.books || rec.errors.adventures) await reportLibError(s, new Error('这次没联上作者书目（可能是网络问题），下面先显示上一次取到的列表'), '重新拉取书目', toast, () => void reloadDirectory())
    else toast.success('书目已重新拉取')
  } catch (e) { await reportLibError(s, e, '重新拉取书目', toast, () => void reloadDirectory()) } finally { reloading.value = false }
}
const MENU = [{ key: 'reload', label: '重新拉取书目' }]
const pctText = (p: number | null | undefined): string => (p == null ? '' : ` ${Math.round(p * 100)}%`)
const officialAll = computed(() => dl.items.find((i) => i.key === 'official') ?? null)
</script>

<template>
  <div class="lib-scroll" data-testid="download-tab">
    <div v-if="error" class="lib-banner lib-banner--warn" style="margin-top: var(--sp-3)" role="alert" data-testid="download-load-error"><Icon name="warning" :size="16" /><span>下载页的安装状态没读出来，下面的列表照常可用。</span><span class="lib-end"><button class="trpg-btn trpg-btn--small" type="button" @click="loadStatus">重试</button></span></div>
    <div v-if="!lib.shelf" class="lib-skel" aria-busy="true"><i /><i style="width:70%" /></div>
    <template v-else>
      <DlSection v-model:q="qBooks" v-model:selected="selBooks" title="官方资料" placeholder="搜索书名（中文或英文）" :groups="bookGroups" testid="official-card" empty-text="书目暂时取不到，联网后会自动出现。">
        <template #tools><MoreMenu :label="`${reloading ? '正在拉取…' : '下载列表'}`" :items="MENU" @select="reloadDirectory" /></template>
        <template #above>
          <div class="lib-dlsec__bar">
            <div class="lib-pills" role="group" aria-label="规则版本">
              <button v-for="o in RULES" :key="o.value" class="trpg-pill" type="button" :aria-pressed="rule === o.value" @click="rule = o.value">{{ o.label }}</button>
            </div>
            <span v-if="officialAll?.status === 'running'" class="lib-muted lib-dling" role="status">整套下载中：{{ officialAll.stage }}{{ pctText(officialAll.pct) }}</span>
            <span v-else-if="sets.some((x) => x.status === 'incomplete')" class="lib-muted">上次装了一半，已下好的文件会复用</span>
          </div>
        </template>
        <template #row="{ item: r }">
          <div class="trpg-row__main"><div class="trpg-row__title lib-name">{{ r.name }}<small v-if="r.altName" class="lib-alt-name">{{ r.altName }}</small></div><div class="trpg-row__meta"><span v-if="ruleBadge(r)" class="trpg-badge">{{ ruleBadge(r) }}</span><template v-if="r.shelf?.published"> 出版 {{ r.shelf.published.slice(0, 4) }}</template></div></div>
          <div class="trpg-row__end">
            <span v-if="r.downloaded" class="trpg-badge" data-tone="success">已装</span>
            <span v-else-if="rowTask(r) && rowTask(r)!.status !== 'failed'" class="lib-muted lib-dling" role="status">{{ rowTask(r)!.status === 'paused' ? '已暂停' : '下载中' }}{{ pctText(rowTask(r)!.pct) }}<span class="lib-bar" :data-indet="rowTask(r)!.pct == null" aria-hidden="true"><i :style="rowTask(r)!.pct == null ? undefined : { width: `${Math.round((rowTask(r)!.pct ?? 0) * 100)}%` }" /></span></span>
            <template v-else>
              <span v-if="rowTask(r)?.status === 'failed'" class="lib-muted" style="color: var(--danger-text)">失败</span>
              <button class="trpg-btn trpg-btn--small" type="button" data-testid="book-download" @click="downloadBooks([r])">{{ rowTask(r)?.status === 'failed' ? '重试' : '下载' }}</button>
            </template>
          </div>
        </template>
        <template #actions="{ selected, clear }">
          <span class="lib-muted">已选 {{ selected.size }} 本<template v-if="selected.size"> · {{ estimate.busy ? '正在计算大小…' : estimate.bytes == null ? '大小暂时算不出' : `要下载 ${formatBytes(estimate.bytes)}` }}</template></span>
          <span class="lib-end">
            <button class="trpg-btn trpg-btn--small trpg-btn--primary" type="button" :disabled="!selected.size" data-testid="official-card-download-selected" @click="downloadBooks(allBooks.filter((r) => selected.has(keyOf(r)))); clear()">下载选中的 {{ selected.size }} 本</button>
            <button class="trpg-btn trpg-btn--small" type="button" :disabled="sets.every((x) => x.status === 'installed')" @click="downloadAllOfficial">下载全部官方资料</button>
          </span>
        </template>
      </DlSection>

      <DlSection v-model:q="qAdv" v-model:selected="selAdv" title="冒险（官方，按本下载）" placeholder="搜索冒险名" :groups="officialReady ? advGroups : []" testid="adventure-list" :empty-text="officialReady ? '冒险目录暂时取不到。' : '先装官方资料，才能下载冒险正文。'">
        <template #tools><MoreMenu :label="`${reloading ? '正在拉取…' : '下载列表'}`" :items="MENU" @select="reloadDirectory" /></template>
        <template #row="{ item: r }">
          <div class="trpg-row__main"><div class="trpg-row__title lib-name">{{ r.name }}<small v-if="r.altName" class="lib-alt-name">{{ r.altName }}</small></div><div class="trpg-row__meta">{{ r.shelf?.level ? `${r.shelf.level.start}–${r.shelf.level.end} 级` : '' }}</div></div>
          <div class="trpg-row__end">
            <span v-if="r.downloaded" class="trpg-badge" data-tone="success">已装</span>
            <span v-else-if="rowTask(r)?.status === 'running'" class="lib-muted lib-dling" role="status">下载中{{ pctText(rowTask(r)!.pct) }}<span class="lib-bar" :data-indet="rowTask(r)!.pct == null" aria-hidden="true"><i :style="rowTask(r)!.pct == null ? undefined : { width: `${Math.round((rowTask(r)!.pct ?? 0) * 100)}%` }" /></span></span>
            <template v-else>
              <span v-if="rowTask(r)?.status === 'failed'" class="lib-muted" style="color: var(--danger-text)">失败</span>
              <button class="trpg-btn trpg-btn--small" type="button" @click="downloadAdventures([r])">{{ rowTask(r)?.status === 'failed' ? '重试' : '下载' }}</button>
            </template>
          </div>
        </template>
        <template #actions="{ selected, clear }">
          <span class="lib-muted">已选 {{ selected.size }} 本</span>
          <span class="lib-end">
            <button class="trpg-btn trpg-btn--small trpg-btn--primary" type="button" :disabled="!selected.size" @click="downloadAdventures(allAdv.filter((r) => selected.has(keyOf(r)))); clear()">下载选中的 {{ selected.size }} 本</button>
            <button class="trpg-btn trpg-btn--small" type="button" :disabled="!allAdv.some((r) => !r.downloaded)" @click="downloadAllAdventures">下载全部冒险</button>
          </span>
        </template>
      </DlSection>
    </template>
    <!-- 自制包目录不放在上面的读取状态里：官方部分读取失败也不能把已拉取的目录弹掉 -->
    <BrewCatalog />
  </div>
</template>
