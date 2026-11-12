<script setup lang="ts">
import { useLibNoticeStore } from '../../stores/libnotice'
import { computed, onMounted, ref, watch } from 'vue'
import type { CatalogFile, CatalogPair } from '../../library/brew-pairing'
import { getSource } from '../../library/sources'
import { useAppStore } from '../../stores/app'
import { useBrewCatalogStore } from '../../stores/brewcatalog'
import { useDownloadsStore } from '../../stores/downloads'
import { useLibViewStore } from '../../stores/libview'
import { useToastStore } from '../../stores/toast'
import Icon from '../kit/Icon.vue'
import MoreMenu from '../kit/MoreMenu.vue'
import { confirmDependencies, downloadOfficialBook, reportLibError } from './deps-flow'
import DlSection, { type DlGroup } from './DlSection.vue'
import { askConfirm } from '../kit/confirm'

/** 下载页的自制包目录（U4b）：中英文配对成一行（只有一种语言的单独一行）；点【下载】先预览依赖（可不再提示），再一次装两边，依赖由作者程序自动追装。 */
const app = useAppStore()
const lib = useLibViewStore()
const toast = useToastStore()
const dl = useDownloadsStore()
const cat = useBrewCatalogStore()
const rows = computed(() => cat.rows)
const errors = computed(() => cat.errors)
const loading = computed(() => cat.loading)
const q = ref('')
const page = ref(0)
const busy = ref<Set<string>>(new Set())
// 正在看依赖预览（还没开始下载）的行：按钮写「准备中…」，不冒充下载中
const preparing = ref<Set<string>>(new Set())
const installed = ref<Set<string>>(new Set())
const PAGE = 40
const codeSet = computed(() => lib.campaignLib?.codeSet ?? 'cn')
const zhSet = computed(() => lib.brewSetId(codeSet.value) ?? 'cn-brew')

const fileName = (f: CatalogFile | null): string => (f ? String((f as { name?: unknown }).name ?? f.path.split('/').pop() ?? f.path).replace(/\.json$/, '') : '')
const nameOf = (r: CatalogPair): string => fileName(r.zh) || fileName(r.en)
const authorOf = (r: CatalogPair): string => { const a = ((r.zh ?? r.en) as { authors?: unknown } | null)?.authors; return Array.isArray(a) ? a.join('、') : '' }
const keyOf = (r: CatalogPair): string => `${r.zh?.path ?? ''}|${r.en?.path ?? ''}`
const filtered = computed(() => (rows.value ?? []).filter((r) => !q.value.trim() || `${nameOf(r)}${authorOf(r)}`.toLowerCase().includes(q.value.trim().toLowerCase())))
const pageRows = computed(() => filtered.value.slice(page.value * PAGE, (page.value + 1) * PAGE))
const isInstalled = (r: CatalogPair): boolean => [r.zh, r.en].filter((f): f is CatalogFile => !!f).every((f) => installed.value.has(f.urlDownload))

async function loadInstalled(): Promise<void> {
  const s = app.svc().backend.library
  const urls = new Set<string>()
  for (const id of [zhSet.value, s.brewPairs ? pairOf(zhSet.value) : '']) if (id) for (const p of await s.brewPacks.list(id).catch(() => [])) if (p.url) urls.add(p.url)
  installed.value = urls
}
async function loadCatalog(force = false): Promise<void> {
  await cat.load(app.svc(), zhSet.value, force)
  page.value = 0
  await loadInstalled()
}
onMounted(() => { void loadCatalog() })
// 目录没取回来的原因进库页顶部的浮动横幅（P5-5 §12.3）
const notices = useLibNoticeStore()
watch(() => [rows.value, errors.value.zh.length, errors.value.en.length, loading.value] as const, ([r, zh, en, busy]) => {
  if (busy) return
  for (const side of ['zh', 'en'] as const) {
    const n = side === 'zh' ? zh : en
    if (r && n) notices.show({ key: `brew-catalog:${side}`, text: `${side === 'zh' ? '中文' : '英文'}自制目录这次没取回来（可能是网络问题），${side === 'zh' ? '英文' : '中文'}的照常列出：${errors.value[side].join('；')}`, actions: [{ label: '重试', run: () => void loadCatalog(true) }] })
    else notices.dismiss(`brew-catalog:${side}`)
  }
  if (!r) notices.show({ key: 'brew-catalog', text: `自制包目录这次没取回来，请检查网络后重试：${[...errors.value.zh, ...errors.value.en].join('；') || '没有取到任何目录'}`, actions: [{ label: '重试', run: () => void loadCatalog(true) }] })
  else notices.dismiss('brew-catalog')
})
// 另一种语言的自制源按源登记里的 pair 找，不手写语言规则
const pairOf = (setId: string): string => getSource(setId).pair ?? setId
const langOf = (setId: string): string => (getSource(setId).lang === 'zh' ? '中文' : '英文')
const filesOf = (r: CatalogPair): Array<{ setId: string; url: string }> => ([[r.zh, zhSet.value], [r.en, pairOf(zhSet.value)]] as const).filter(([f]) => !!f).map(([f, setId]) => ({ setId, url: f!.urlDownload }))
const mark = (set: typeof busy, k: string, on: boolean): void => { const n = new Set(set.value); if (on) n.add(k); else n.delete(k); set.value = n }

/**
 * 下载前看依赖（按作者程序：依赖包会一起装；需要的官方书可勾选一起下载）。返回 false = 用户取消或读不到依赖（已出横幅）。
 * 多个包合成一次预览。
 */
async function preview(rows: CatalogPair[], name: string): Promise<boolean> {
  for (const r of rows) mark(preparing, keyOf(r), true)
  try {
    const books = await confirmDependencies(app.svc(), name, rows.flatMap(filesOf), app.settings?.library.skipDependencyPrompt ?? false, () => app.updateSettings({ library: { ...app.settings!.library, skipDependencyPrompt: true } }))
    if (books === null) return false
    for (const b of books) void downloadOfficialBook(app.svc(), b).catch((e: unknown) => console.error('[trpg-assistant] 开始下载失败', e))
    return true
  } catch (e) {
    console.error('[trpg-assistant] 读取依赖失败', e)
    for (const r of rows) await dl.trackBrew(`brew:${keyOf(r)}`, `自制包《${nameOf(r)}》`, async () => '读不到这个包的依赖（可能是网络问题），什么都没装', () => void download(r))
    return false
  } finally { for (const r of rows) mark(preparing, keyOf(r), false) }
}
async function download(r: CatalogPair): Promise<void> {
  if (busy.value.has(keyOf(r))) return
  if (await preview([r], nameOf(r))) await install(r)
}
async function downloadMany(rows: CatalogPair[], skipPreview = false): Promise<void> {
  const todo = rows.filter((r) => !isInstalled(r) && !busy.value.has(keyOf(r)))
  if (!todo.length) return
  if (!skipPreview && !(await preview(todo, `选中的 ${todo.length} 个包`))) return
  for (const r of todo) await install(r)
}
async function downloadAll(): Promise<void> {
  const todo = filtered.value.filter((r) => !isInstalled(r))
  if (!todo.length) return
  if (await askConfirm({ title: `下载${q.value.trim() ? '搜到的' : '全部'} ${todo.length} 个自制包？`, message: '会在后台一个一个下载，依赖包按作者程序自动一起装；进度见【库】标志。包很多时会花比较久。', confirmLabel: `下载 ${todo.length} 个` })) await downloadMany(todo, true)
}
async function install(r: CatalogPair): Promise<void> {
  const k = keyOf(r)
  if (busy.value.has(k)) return
  mark(busy, k, true)
  try {
    await dl.trackBrew(`brew:${k}`, `自制包《${nameOf(r)}》`, async (report) => {
      const STAGE = { download: '下载文件（含依赖）', parse: '整理资料', publish: '放进书架' } as const
      // 中英一起：给这一行有的那种语言，后端按自制目录配上另一种语言一起装（core/paired-download.ts）。
      // 成败只看后端有没有抛错：没装上 / 中途断网 / 缺依赖都会抛（准备版本已作废，下了一半的东西不进书架）；
      // 作者在解析时报的零散提示不算失败（以前会把装好的包误判成失败）
      const [first] = filesOf(r)
      const res = await app.svc().backend.library.downloads.brewUrl(first.setId, first.url, (side, st, i, n) => report(`${r.zh && r.en ? `${langOf(side === 'self' ? first.setId : pairOf(first.setId))} · ` : ''}${STAGE[st]}`, i / n))
      const wanted = res.added + res.failed.length
      const added = res.entries
      const failed = res.failed.map((f) => ({ side: langOf(f.setId), e: f.error }))
      await loadInstalled()
      void lib.refresh(app.svc()).catch((e: unknown) => console.error('[trpg-assistant] 下载后刷新书架失败', e))
      const depFail = failed.find((x) => (x.e as { name?: unknown })?.name === 'BrewDependencyError')
      if (depFail) { await reportLibError(app.svc(), depFail.e, `下载《${nameOf(r)}》`, toast, () => void download(r)); return null }
      const why = (x: { e: unknown }): string => (x.e instanceof Error ? x.e.message : String(x.e))
      if (failed.length === wanted) return why(failed[0])
      if (failed.length) return `${failed.map((x) => x.side).join('、')}没有装好（另一边已装好）：${why(failed[0])}`
      toast.success(`刚刚下载完成了 ${wanted} 个包，同时下载了 ${Math.max(0, added - wanted)} 个额外依赖包`)
      return null
    }, () => void download(r))
  } finally { mark(busy, k, false) }
}
const selected = ref<Set<string>>(new Set())
const groups = computed<Array<DlGroup<CatalogPair>>>(() => [{ key: 'brew', name: '自制包', rows: pageRows.value.map((r) => ({ key: keyOf(r), name: nameOf(r), selectable: !isInstalled(r) && !busy.value.has(keyOf(r)), row: r })) }])
const brewRaw = (side: 'zh' | 'en'): void => { if (errors.value[side].length) console.warn(`[trpg-assistant] ${side} 自制目录读取失败`, errors.value[side]) }
watch(errors, () => { brewRaw('zh'); brewRaw('en') })
watch(q, () => { page.value = 0 })
</script>

<template>
  <div data-testid="brew-catalog">
    <div v-if="!rows && loading" class="lib-skel" aria-busy="true" data-testid="brew-loading"><i /><i style="width:70%" /></div>
    <div v-else-if="!rows" class="lib-state" data-testid="brew-load-error"><h3>自制包目录还没取回来</h3><button class="trpg-btn" type="button" data-testid="brew-load" @click="loadCatalog(true)">重新拉取</button></div>
    <DlSection v-else v-model:q="q" v-model:selected="selected" title="自制包" placeholder="搜索包名或作者" :groups="groups" testid="brew-list" flat empty-text="没有符合的包。">
      <template #tools><MoreMenu label="自制包列表" :items="[{ key: 'reload', label: loading ? '正在拉取…' : '重新拉取自制包列表', disabled: loading }]" @select="loadCatalog(true)" /></template>
      <template #above>
        <div class="lib-dlsec__bar">
          <template v-for="side in (['zh', 'en'] as const)" :key="side">
          </template>
          <button class="trpg-btn trpg-btn--small lib-end" type="button" disabled title="之后再做"><Icon name="plus" :size="14" />增加数据源仓库</button>
        </div>
      </template>
      <template #row="{ item: r }">
        <div class="trpg-row__main"><div class="trpg-row__title lib-name">{{ nameOf(r) }}</div><div class="trpg-row__meta">{{ authorOf(r) }}<template v-if="r.status !== 'paired'"> · 只有{{ r.zh ? '中文' : '英文' }}</template></div></div>
        <div class="trpg-row__end">
          <span class="trpg-badge" :data-off="!r.zh">中</span><span class="trpg-badge" :data-off="!r.en">En</span>
          <span v-if="isInstalled(r)" class="trpg-badge" data-tone="success">已装</span>
          <button v-else class="trpg-btn trpg-btn--small" type="button" :disabled="busy.has(keyOf(r)) || preparing.has(keyOf(r))" @click="download(r)">{{ preparing.has(keyOf(r)) ? '准备中…' : busy.has(keyOf(r)) ? '下载中…' : '下载' }}</button>
        </div>
      </template>
      <template #below>
        <div class="lib-count"><span>共 {{ filtered.length }} 项</span><span class="lib-end"><button class="trpg-btn trpg-btn--small" type="button" :disabled="page === 0" @click="page--">上一页</button><button class="trpg-btn trpg-btn--small" type="button" :disabled="(page + 1) * PAGE >= filtered.length" @click="page++">下一页</button></span></div>
      </template>
      <template #actions="{ selected: sel, clear }">
        <span class="lib-muted">已选 {{ sel.size }} 个（依赖会一起装）</span>
        <span class="lib-end">
          <button class="trpg-btn trpg-btn--small trpg-btn--primary" type="button" :disabled="!sel.size" data-testid="brew-download-selected" @click="downloadMany((rows ?? []).filter((r) => sel.has(keyOf(r)))); clear()">下载选中的 {{ sel.size }} 个</button>
          <button class="trpg-btn trpg-btn--small" type="button" :disabled="!filtered.some((r) => !isInstalled(r))" @click="downloadAll">下载{{ q.trim() ? '搜到的' : '全部' }}自制包</button>
        </span>
      </template>
    </DlSection>
  </div>
</template>
