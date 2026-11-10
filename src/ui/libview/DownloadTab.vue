<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import type { DataSetState } from '../../core/start-campaign'
import type { DownloadEstimate } from '../../library/download-estimate'
import type { CatalogRow } from '../../library/scoped'
import { useAppStore } from '../../stores/app'
import { useDownloadsStore } from '../../stores/downloads'
import { useLibViewStore } from '../../stores/libview'
import Icon from '../kit/Icon.vue'
import { formatBytes } from '../format'

/** 下载页（U4a）：官方资料（整套，中英自动一起装）+ 冒险按本下载。进度 / 失败用统一的警告样式；完成只用顶部提示，页面里不另提示。 */
const app = useAppStore()
const lib = useLibViewStore()
const dl = useDownloadsStore()
const sets = ref<DataSetState[]>([])
const est = ref<DownloadEstimate | null>(null)
const adventures = ref<CatalogRow[]>([])
const q = ref('')
const loading = ref(true)
const error = ref<string | null>(null)
const CODE_SET = 'cn'

const officialStatus = computed<'none' | 'running' | 'incomplete' | 'installed'>(() => {
  if (!sets.value.length) return 'none'
  if (sets.value.some((s) => s.status === 'running')) return 'running'
  if (sets.value.every((s) => s.status === 'installed')) return 'installed'
  return sets.value.some((s) => s.status === 'incomplete') ? 'incomplete' : 'none'
})
const official = computed(() => dl.items.find((i) => i.key === 'official') ?? null)
const adventureTask = (row: CatalogRow) => dl.items.find((i) => i.label === `冒险《${row.name}》`) ?? null
const shownAdventures = computed(() => adventures.value.filter((r) => !q.value.trim() || `${r.name}${r.abv}`.toLowerCase().includes(q.value.trim().toLowerCase())))

async function load(): Promise<void> {
  const s = app.svc()
  error.value = null
  try {
    sets.value = await s.backend.starter.dataStatus()
    est.value = await s.backend.starter.estimateDownload({ codeSet: CODE_SET }, { network: false })
    if (lib.campaignLib) adventures.value = (await s.backend.library.scoped.catalog(lib.campaignLib, { remote: true })).filter((r) => r.kind === 'adventure')
  } catch (e) {
    console.error('[trpg-assistant] 读取下载页失败', e)
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}
onMounted(() => void load())
// 任务有变化（开始 / 完成 / 失败）就重读状态；完成的提示由下载状态仓库统一在顶部给
watch(() => [dl.running.length, dl.failed.length, dl.justDone], () => void load())

function startOfficial(): void {
  const tasks = app.svc().backend.library.tasks
  for (const set of sets.value.filter((x) => x.status !== 'installed' && x.status !== 'running')) tasks.startOfficial(set.setId)
  dl.refresh()
}
function cancelOfficial(): void {
  const tasks = app.svc().backend.library.tasks
  for (const t of dl.tasks.filter((x) => x.kind === 'official' && x.status === 'running')) tasks.cancel(t.id)
  dl.refresh()
}
function startAdventure(row: CatalogRow): void {
  if (!row.id) return
  dl.rememberName(row.set, row.id, row.name)
  app.svc().backend.library.tasks.startAdventure(row.set, row.id)
  dl.refresh()
}
</script>

<template>
  <div class="lib-scroll" data-testid="download-tab">
    <div v-if="error" class="lib-banner lib-banner--warn" style="margin-top: var(--sp-3)"><Icon name="warning" :size="16" /><span>读取下载页失败：{{ error }}</span><span class="lib-end"><button class="trpg-btn trpg-btn--small" type="button" @click="load">重试</button></span></div>
    <div v-else-if="loading" class="lib-skel" aria-busy="true"><i /><i style="width:70%" /></div>
    <template v-else>
      <section class="lib-dlcard" data-testid="official-card">
        <div class="lib-dlcard__top">
          <b class="lib-title">官方资料</b>
          <span class="lib-end">
            <span v-if="officialStatus === 'installed'" class="trpg-badge" data-tone="success">已安装</span>
            <button v-else-if="officialStatus === 'running'" class="trpg-btn trpg-btn--small" type="button" @click="cancelOfficial">取消</button>
            <button v-else class="trpg-btn trpg-btn--primary" type="button" data-testid="official-download" @click="startOfficial">{{ officialStatus === 'incomplete' ? '继续' : '下载' }}</button>
          </span>
        </div>
        <p class="lib-muted" style="margin: 0; font-size: var(--fs-sm)">全部规则书和数据，中英文自动一起装。<template v-if="est?.data.bytes">大小约 {{ formatBytes(est.data.bytes) }}。</template></p>
        <div v-if="official?.status === 'running'" class="lib-banner" role="status"><span class="trpg-spinner" aria-hidden="true" /><span>{{ official.stage }}…<template v-if="official.pct !== null"> {{ Math.round(official.pct * 100) }}%</template></span></div>
        <div v-else-if="official?.status === 'failed'" class="lib-banner lib-banner--warn"><Icon name="warning" :size="16" /><span>下载没有成功：{{ official.error || '原因未知' }}</span><span class="lib-end"><button class="trpg-btn trpg-btn--small" type="button" @click="startOfficial">重试</button></span></div>
        <div v-else-if="officialStatus === 'incomplete'" class="lib-banner lib-banner--warn"><Icon name="warning" :size="16" /><span>官方资料装了一半，已经下好的文件会直接复用。</span></div>
      </section>

      <div class="lib-sec">冒险（官方，按本下载）</div>
      <input v-model="q" class="trpg-input" type="search" placeholder="搜索冒险名" aria-label="搜索冒险名" />
      <p v-if="officialStatus !== 'installed'" class="lib-muted" style="font-size: var(--fs-sm)">先装官方资料，才能下载冒险正文。</p>
      <ul v-else class="trpg-list" data-testid="adventure-list">
        <li v-for="r in shownAdventures" :key="`${r.set}:${r.id}`" class="trpg-row">
          <div class="trpg-row__main"><div class="trpg-row__title lib-name">{{ r.name }}</div><div class="trpg-row__meta">{{ r.shelf?.level ? `${r.shelf.level.start}–${r.shelf.level.end} 级` : '' }}</div></div>
          <div class="trpg-row__end">
            <span v-if="r.downloaded" class="trpg-badge" data-tone="success">已装</span>
            <span v-else-if="adventureTask(r)?.status === 'running'" class="lib-muted"><span class="trpg-spinner" aria-hidden="true" /> 下载中…</span>
            <template v-else>
              <span v-if="adventureTask(r)?.status === 'failed'" class="lib-muted" style="color: var(--danger-text)">失败</span>
              <button class="trpg-btn trpg-btn--small" type="button" @click="startAdventure(r)">{{ adventureTask(r)?.status === 'failed' ? '重试' : '下载' }}</button>
            </template>
          </div>
        </li>
        <li v-if="!shownAdventures.length" class="lib-muted" style="padding: var(--sp-3)">没有符合的冒险。</li>
      </ul>

      <div class="lib-sec">自制包</div>
      <p class="lib-muted" style="font-size: var(--fs-sm)">自制包目录与【增加数据源仓库】稍后开放。</p>
    </template>
  </div>
</template>
