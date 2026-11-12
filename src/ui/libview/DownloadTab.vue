<script setup lang="ts">
import { useLibNoticeStore } from '../../stores/libnotice'
import { computed, markRaw, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { DataSetState } from '../../core/start-campaign'
import type { SelectionCheck } from '../../library/selection'
import type { CatalogRow } from '../../library/scoped'
import { getSource } from '../../library/sources'
import { useAppStore } from '../../stores/app'
import { useDownloadsStore } from '../../stores/downloads'
import { useLibViewStore } from '../../stores/libview'
import { useToastStore } from '../../stores/toast'
import MoreMenu from '../kit/MoreMenu.vue'
import { askChoice } from '../kit/choice'
import { formatBytes } from '../format'
import BrewCatalog from './BrewCatalog.vue'
import DlSection, { type DlGroup } from './DlSection.vue'
import DownloadAllPage, { type DownloadAllAnswer } from './DownloadAllPage.vue'
import { reportLibError } from './deps-flow'
import { ruleBadge } from './registry'

/**
 * 下载页（U4，P5 T6 C 段）：「官方资料与冒险」一栏 + 「自制包」一栏。每栏 搜索 + 【多选】，官方书和冒险按作者分类分组（可折叠、组间细线），
 * 有类型（书 / 冒险）和规则（5e / 5.5e / 未归类）两组筛选。每行单独【下载】或显示「已装」；多选后底部【下载选中的 n 项】【下载全部…】。
 * 行和分组都来自书架那一份数据（作者书目），不手写书单。
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
const q = ref('')
const sel = ref<Set<string>>(new Set())

const keyOf = (r: CatalogRow): string => `${r.set}:${r.kind}:${r.id ?? `src:${r.source}`}`
const hit = (r: CatalogRow): boolean => !q.value.trim() || `${r.name} ${r.altName ?? ''} ${r.abv}`.toLowerCase().includes(q.value.trim().toLowerCase())
const ruleOk = (r: CatalogRow): boolean => rule.value === 'all' || (rule.value === 'none' ? ruleBadge(r) === null : ruleBadge(r) === rule.value)
const isOfficial = (r: CatalogRow): boolean => getSource(r.set).kind === 'official'
// 冒险能不能下由后端的勾选检查说了算（library/selection.ts）：那套官方资料装过才行。
// 下载页的书和冒险同时开下载，这次勾的书不算（驾驶员 2026-11-12 定 A），所以不传勾选
const gate = ref<SelectionCheck | null>(null)
const advOk = (r: CatalogRow): boolean => !!gate.value?.sets[r.set]?.adventures
const advReason = (r: CatalogRow): string | undefined => (r.kind === 'adventure' && !advOk(r) ? gate.value?.sets[r.set]?.reason ?? undefined : undefined)
const canGet = (r: CatalogRow): boolean => !r.downloaded && !rowTask(r) && !finishing(r) && (r.kind === 'book' || advOk(r))
// 按作者分组列出；冒险是它所属分组里的一个包，和书并列（驾驶员 2026-11-12：不再分「全部 / 书 / 冒险」标签）
const groups = computed<Array<DlGroup<CatalogRow>>>(() => (lib.shelf?.groups ?? []).map((g) => ({
  key: g.group,
  name: g.name,
  rows: [...g.books, ...g.adventures]
    .filter((r) => isOfficial(r) && hit(r) && ruleOk(r))
    .map((r) => ({ key: keyOf(r), name: r.name, selectable: canGet(r), row: r })),
})).filter((g) => g.rows.length))
const allRows = computed(() => (lib.shelf?.groups ?? []).flatMap((g) => [...g.books, ...g.adventures]).filter(isOfficial))
const picked = computed(() => allRows.value.filter((r) => sel.value.has(keyOf(r))))
const pickedBooks = computed(() => picked.value.filter((r) => r.kind === 'book'))
const pickedAdv = computed(() => picked.value.filter((r) => r.kind === 'adventure'))

// 行 → 正在跑的任务：按任务号认，不按书名认（同名书 / 同名包不能互相覆盖）。
// 任务结束到书架刷新之间还有一小段空档，finishing() 用来显示「整理书架…」，不能先掉回【下载】。
const pending = ref<Map<string, string>>(new Map())
const taskOf = (r: CatalogRow) => {
  const id = pending.value.get(keyOf(r))
  return id ? dl.tasks.find((t) => t.id === id) ?? null : null
}
const rowTask = (r: CatalogRow) => {
  const byId = taskOf(r)
  if (byId) return dl.items.find((i) => i.taskId === byId.id) ?? null
  if (r.kind === 'adventure') return dl.items.find((i) => i.kind === 'adventure' && i.set === r.set && i.item === r.id) ?? null
  return null
}
const finishing = (r: CatalogRow): boolean => {
  const t = taskOf(r)
  return !!t && (t.status === 'done' || t.status === 'partial') && !r.downloaded
}

async function loadStatus(): Promise<void> {
  error.value = null
  try {
    sets.value = await app.svc().backend.starter.dataStatus()
    gate.value = await app.svc().backend.starter.checkSelection()
  } catch (e) { console.error('[trpg-assistant] 读取下载页失败', e); error.value = e instanceof Error ? e.message : String(e) }
}
onMounted(() => void loadStatus())
// 读不出来的原因进库页顶部的浮动横幅（P5-5 §12.3），页面里不放报错
const notices = useLibNoticeStore()
watch(error, (e) => {
  if (e) notices.show({ key: 'download-status', text: `下载页的安装状态没读出来，下面的列表照常可用：${e}`, actions: [{ label: '重试', run: () => void loadStatus() }] })
  else notices.dismiss('download-status')
})
// 任务结束（完成 / 失败 / 取消）才重读一次安装状态；任务进行中不整页重读（书架由库页外壳在任务结束时重读）
let lastRunning = 0
watch(() => dl.running.length + dl.paused.length, (n) => { if (n < lastRunning) void loadStatus(); lastRunning = n }, { immediate: true })

/** 按书下载：同一次选中的书合成一个任务（每本单开会把整套重解析很多遍）；另一种语言由后端按登记一起下。 */
function downloadBooks(rows: CatalogRow[]): void {
  const s = app.svc()
  const bySet = new Map<string, CatalogRow[]>()
  for (const r of rows.filter((x) => !x.downloaded)) bySet.set(r.set, [...(bySet.get(r.set) ?? []), r])
  for (const [setId, list] of bySet) {
    const books = list.flatMap((r) => (r.id ? [r.id] : []))
    const sources = list.map((r) => r.source)
    const label = list.length === 1 ? list[0].name : `${list[0].name} 等 ${list.length} 本`
    const start = async (): Promise<void> => {
      try {
        const started = await s.backend.library.downloads.official(setId, { books: books.length ? books : null, sources })
        for (const t of started.tasks) dl.rememberTask(t.taskId, t.setId === setId ? label : `${label}（另一种语言）`, () => void start())
        const id = started.tasks[0].taskId
        const next = new Map(pending.value)
        for (const r of list) next.set(keyOf(r), id)
        pending.value = next
        dl.refresh()
      } catch (e) { void reportLibError(s, e, `下载《${label}》`, toast, () => void start()) }
    }
    void start()
  }
  dl.refresh()
}
function downloadAdventures(rows: CatalogRow[]): void {
  const s = app.svc()
  for (const r of rows.filter((x) => !x.downloaded && x.id)) {
    const before = rowTask(r)
    if (before?.status === 'failed') dl.markRetried(before.key)
    void s.backend.library.downloads.adventure(r.set, r.id!).then((started) => {
      for (const t of started.tasks) dl.rememberName(t.setId, r.id!, r.name)
      const next = new Map(pending.value)
      next.set(keyOf(r), started.tasks[0].taskId)
      pending.value = next
      dl.refresh()
    }, (e: unknown) => reportLibError(s, e, `下载冒险《${r.name}》`, toast))
  }
  dl.refresh()
}
function downloadRows(rows: CatalogRow[]): void {
  const books = rows.filter((r) => r.kind === 'book')
  const adv = rows.filter((r) => r.kind === 'adventure')
  if (books.length) downloadBooks(books)
  if (adv.length) downloadAdventures(adv)
}
/** 【下载全部…】：弹窗勾选范围（全部书 / 全部冒险）。全部书 = 中文还没装的书按书合成一个任务，状态里其他没装的数据集（结算内核要的英文）照旧整套装。 */
async function downloadAll(): Promise<void> {
  const leftBooks = allRows.value.filter((r) => r.kind === 'book' && !r.downloaded)
  const leftAdv = allRows.value.filter((r) => r.kind === 'adventure' && !r.downloaded)
  const readyAdv = leftAdv.filter(advOk)
  const a = await askChoice<DownloadAllAnswer | null>({ key: 'download-all', title: '下载全部', component: markRaw(DownloadAllPage), props: (answer) => ({ bookCount: leftBooks.length, adventureCount: leftAdv.length, adventuresReady: readyAdv.length > 0, onAnswer: answer }) }, null)
  if (!a) return
  if (a.books) {
    downloadBooks(leftBooks)
    const shelfSets = new Set(leftBooks.map((r) => r.set))
    const tasks = app.svc().backend.library.tasks
    for (const set of sets.value.filter((x) => !shelfSets.has(x.setId) && x.status !== 'installed' && x.status !== 'running')) tasks.startOfficial(set.setId)
  }
  if (a.adventures) downloadAdventures(readyAdv)
  dl.refresh()
}

// 选中的要下载多少：书和冒险合计，后端按实际计划算（算不出就如实说，不拿整套冒充）
const estimate = ref<{ bytes: number | null; busy: boolean }>({ bytes: null, busy: false })
let estTimer: ReturnType<typeof setTimeout> | undefined
watch(sel, () => {
  clearTimeout(estTimer)
  const books = pickedBooks.value
  const adv = pickedAdv.value
  if (!books.length && !adv.length) { estimate.value = { bytes: null, busy: false }; return }
  estimate.value = { bytes: null, busy: true }
  estTimer = setTimeout(async () => {
    try {
      const setIds = [...new Set(books.map((r) => r.set))]
      const r = await app.svc().backend.library.estimate({
        sets: setIds,
        books: Object.fromEntries(setIds.map((id) => [id, books.filter((x) => x.set === id).flatMap((x) => (x.id ? [x.id] : []))])),
        sources: Object.fromEntries(setIds.map((id) => [id, books.filter((x) => x.set === id).map((x) => x.source)])),
        adventures: adv.flatMap((x) => (x.id ? [{ set: x.set, id: x.id }] : [])),
      }, { network: false })
      estimate.value = { bytes: r.totalBytes, busy: false }
    } catch (e) { console.warn('[trpg-assistant] 估算下载大小失败', e); estimate.value = { bytes: null, busy: false } }
  }, 300)
})
onBeforeUnmount(() => clearTimeout(estTimer))
// 栏目 ⋯ →【重新拉取书目】：重新取作者书目（书和冒险目录一起；取不到时后端保留旧的，书架不会变空），再按当前战役重读书架
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
const selText = computed(() => [pickedBooks.value.length ? `${pickedBooks.value.length} 本书` : '', pickedAdv.value.length ? `${pickedAdv.value.length} 本冒险` : ''].filter(Boolean).join('、') || '0 项')
</script>

<template>
  <div class="lib-scroll" data-testid="download-tab">
    <div v-if="!lib.shelf" class="lib-skel" aria-busy="true"><i /><i style="width:70%" /></div>
    <DlSection v-else v-model:q="q" v-model:selected="sel" title="官方资料与冒险" placeholder="搜索书名或冒险名（中英都行）" :groups="groups" testid="official-card" empty-text="书目暂时取不到，联网后会自动出现。">
      <template #tools><MoreMenu :label="reloading ? '正在拉取…' : '官方资料与冒险'" :items="MENU" @select="reloadDirectory" /></template>
      <template #above>
        <div class="lib-dlsec__bar">
          <div class="lib-pills" role="group" aria-label="规则版本">
            <button v-for="o in RULES" :key="o.value" class="trpg-pill" type="button" :aria-pressed="rule === o.value" @click="rule = o.value">{{ o.label }}</button>
          </div>
          <span v-if="sets.some((x) => x.status === 'incomplete')" class="lib-muted">上次装了一半，已下好的文件会复用</span>
        </div>
      </template>
      <template #row="{ item: r }">
        <div class="trpg-row__main">
          <div class="trpg-row__title lib-name">{{ r.name }}<small v-if="r.altName" class="lib-alt-name">{{ r.altName }}</small></div>
          <div class="trpg-row__meta">
            <span class="trpg-badge" data-testid="row-kind">{{ r.kind === 'adventure' ? '冒险' : '书' }}</span>
            <span v-if="ruleBadge(r)" class="trpg-badge">{{ ruleBadge(r) }}</span>
            <template v-if="r.kind === 'adventure' && r.shelf?.level"> {{ r.shelf.level.start }}–{{ r.shelf.level.end }} 级</template>
            <template v-else-if="r.shelf?.published"> 出版 {{ r.shelf.published.slice(0, 4) }}</template>
          </div>
        </div>
        <div class="trpg-row__end">
          <span v-if="r.downloaded" class="trpg-badge" data-tone="success">已装</span>
          <span v-else-if="rowTask(r) && rowTask(r)!.status !== 'failed'" class="lib-muted lib-dling" role="status">{{ rowTask(r)!.status === 'paused' ? '已暂停' : '下载中' }}{{ pctText(rowTask(r)!.pct) }}<span class="lib-bar" :data-indet="rowTask(r)!.pct == null" aria-hidden="true"><i :style="rowTask(r)!.pct == null ? undefined : { width: `${Math.round((rowTask(r)!.pct ?? 0) * 100)}%` }" /></span></span>
          <span v-else-if="finishing(r)" class="lib-muted lib-dling" role="status">整理书架…</span>
          <template v-else>
            <span v-if="rowTask(r)?.status === 'failed'" class="lib-muted" style="color: var(--danger-text)">失败</span>
            <button class="trpg-btn trpg-btn--small" type="button" data-testid="book-download" :disabled="r.kind === 'adventure' && !advOk(r)" :title="advReason(r)" @click="downloadRows([r])">{{ rowTask(r)?.status === 'failed' ? '重试' : '下载' }}</button>
          </template>
        </div>
      </template>
      <template #actions="{ selected, clear }">
        <span class="lib-muted">已选 {{ selText }}<template v-if="selected.size"> · {{ estimate.busy ? '正在计算大小…' : estimate.bytes == null ? '大小暂时算不出' : `要下载约 ${formatBytes(estimate.bytes)}` }}</template></span>
        <span class="lib-end">
          <button class="trpg-btn trpg-btn--small trpg-btn--primary" type="button" :disabled="!selected.size" data-testid="official-card-download-selected" @click="downloadRows(picked); clear()">下载选中的 {{ selected.size }} 项</button>
          <button class="trpg-btn trpg-btn--small" type="button" :disabled="!allRows.some((r) => !r.downloaded)" data-testid="download-all-open" @click="downloadAll">下载全部…</button>
        </span>
      </template>
    </DlSection>
    <!-- 自制包目录不放在上面的读取状态里：官方部分读取失败也不能把已拉取的目录弹掉 -->
    <BrewCatalog />
  </div>
</template>
