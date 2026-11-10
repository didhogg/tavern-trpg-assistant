<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CatalogFile, CatalogPair } from '../../library/brew-pairing'
import { useAppStore } from '../../stores/app'
import { useLibViewStore } from '../../stores/libview'
import { useToastStore } from '../../stores/toast'
import Icon from '../kit/Icon.vue'

/** 下载页的自制包目录（U4b）：中英文配对成一行（只有一种语言的单独一行）；点【下载】一次装两边，依赖由作者程序自动追装。目录要点【载入目录】才联网取。 */
const app = useAppStore()
const lib = useLibViewStore()
const toast = useToastStore()
const rows = ref<CatalogPair[] | null>(null)
const errors = ref<{ zh: string[]; en: string[] }>({ zh: [], en: [] })
const loading = ref(false)
const q = ref('')
const page = ref(0)
const busy = ref<Set<string>>(new Set())
const installed = ref<Set<string>>(new Set())
const PAGE = 40
const codeSet = computed(() => lib.campaignLib?.codeSet ?? 'cn')
const zhSet = computed(() => lib.brewSetId(codeSet.value) ?? 'cn-brew')

const fileName = (f: CatalogFile | null): string => (f ? String((f as { name?: unknown }).name ?? f.path.split('/').pop()?.replace(/\.json$/, '') ?? f.path) : '')
const nameOf = (r: CatalogPair): string => fileName(r.zh) || fileName(r.en)
const authorOf = (r: CatalogPair): string => { const a = ((r.zh ?? r.en) as { authors?: unknown } | null)?.authors; return Array.isArray(a) ? a.join('、') : '' }
const keyOf = (r: CatalogPair): string => `${r.zh?.path ?? ''}|${r.en?.path ?? ''}`
const filtered = computed(() => (rows.value ?? []).filter((r) => !q.value.trim() || `${nameOf(r)}${authorOf(r)}`.toLowerCase().includes(q.value.trim().toLowerCase())))
const pageRows = computed(() => filtered.value.slice(page.value * PAGE, (page.value + 1) * PAGE))
const isInstalled = (r: CatalogPair): boolean => [r.zh, r.en].filter((f): f is CatalogFile => !!f).every((f) => installed.value.has(f.urlDownload))

async function loadInstalled(): Promise<void> {
  const s = app.svc().backend.library
  const urls = new Set<string>()
  for (const id of [zhSet.value, s.brewPairs ? zhSet.value.replace(/^cn-/, 'en-') : '']) if (id) for (const p of await s.brewPacks.list(id).catch(() => [])) if (p.url) urls.add(p.url)
  installed.value = urls
}
async function loadCatalog(): Promise<void> {
  loading.value = true
  try {
    const r = await app.svc().backend.library.brewPairs.catalog(zhSet.value)
    rows.value = r.rows
    errors.value = r.errors
    page.value = 0
    await loadInstalled()
  } catch (e) { console.error('[trpg-assistant] 读取自制目录失败', e); toast.error('自制目录读取失败，请联网后重试') } finally { loading.value = false }
}
async function download(r: CatalogPair): Promise<void> {
  const k = keyOf(r)
  if (busy.value.has(k)) return
  busy.value = new Set([...busy.value, k])
  try {
    const svc = app.svc().backend.library.service
    let added = 0
    let wanted = 0
    const failed: string[] = []
    for (const [side, f, id] of [['中文', r.zh, zhSet.value], ['英文', r.en, zhSet.value.replace(/^cn-/, 'en-')]] as const) {
      if (!f) continue
      wanted++
      try { const res = await svc.brewAddUrl(id, f.urlDownload); added += res.value.length; if (res.errors.length) failed.push(side) } catch (e) { console.error('[trpg-assistant] 下载自制包失败', e); failed.push(side) }
    }
    await loadInstalled()
    await lib.load(app.svc(), null).catch(() => undefined)
    if (failed.length === wanted) toast.error('下载没有成功，请重试')
    else if (failed.length) toast.error(`${failed.join('、')}没有装好，另一边已装好（可重试）`)
    else toast.success(`刚刚下载完成了 ${wanted} 个包，同时下载了 ${Math.max(0, added - wanted)} 个额外依赖包`)
  } finally {
    const next = new Set(busy.value); next.delete(k); busy.value = next
  }
}
</script>

<template>
  <div data-testid="brew-catalog">
    <div class="lib-sec" style="padding-bottom: var(--sp-2)">
自制包
      <span class="lib-end"><button class="trpg-btn trpg-btn--small" type="button" disabled title="之后再做"><Icon name="plus" :size="14" />增加数据源仓库</button></span>
    </div>
    <div v-if="!rows" class="lib-state" style="padding: var(--sp-3) 0"><p class="lib-muted" style="margin: 0">自制包目录要联网取，点下面的按钮载入。</p><button class="trpg-btn" type="button" data-testid="brew-load" :disabled="loading" @click="loadCatalog">{{ loading ? '正在载入…' : '载入目录' }}</button></div>
    <template v-else>
      <div v-for="side in (['zh', 'en'] as const)" :key="side">
        <div v-if="errors[side].length" class="lib-banner lib-banner--warn" style="margin-bottom: var(--sp-2)"><Icon name="warning" :size="16" /><span>{{ side === 'zh' ? '中文' : '英文' }}目录读取失败：{{ errors[side][0] }}</span><span class="lib-end"><button class="trpg-btn trpg-btn--small" type="button" @click="loadCatalog">重试</button></span></div>
      </div>
      <input v-model="q" class="trpg-input" type="search" placeholder="搜索包名或作者" aria-label="搜索自制包" @input="page = 0" />
      <ul class="trpg-list" data-testid="brew-list">
        <li v-for="r in pageRows" :key="keyOf(r)" class="trpg-row">
          <div class="trpg-row__main"><div class="trpg-row__title lib-name">{{ nameOf(r) }}</div><div class="trpg-row__meta">{{ authorOf(r) }}<template v-if="r.status !== 'paired'"> · 只有{{ r.zh ? '中文' : '英文' }}</template></div></div>
          <div class="trpg-row__end">
            <span class="trpg-badge" :data-off="!r.zh">中</span><span class="trpg-badge" :data-off="!r.en">En</span>
            <span v-if="isInstalled(r)" class="trpg-badge" data-tone="success">已装</span>
            <button v-else class="trpg-btn trpg-btn--small" type="button" :disabled="busy.has(keyOf(r))" @click="download(r)">{{ busy.has(keyOf(r)) ? '下载中…' : '下载' }}</button>
          </div>
        </li>
        <li v-if="!pageRows.length" class="lib-muted" style="padding: var(--sp-3)">没有符合的包。</li>
      </ul>
      <div class="lib-count"><span>共 {{ filtered.length }} 项</span><span class="lib-end"><button class="trpg-btn trpg-btn--small" type="button" :disabled="page === 0" @click="page--">上一页</button><button class="trpg-btn trpg-btn--small" type="button" :disabled="(page + 1) * PAGE >= filtered.length" @click="page++">下一页</button></span></div>
    </template>
  </div>
</template>
