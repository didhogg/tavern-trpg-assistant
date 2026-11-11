<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CatalogRow } from '../../library/scoped'
import type { ShelfGroup } from '../../library/shelf'
import { getSource } from '../../library/sources'
import { useAppStore } from '../../stores/app'
import { useCampaignStore } from '../../stores/campaign'
import { useLibViewStore } from '../../stores/libview'
import { useToastStore } from '../../stores/toast'
import Icon from '../kit/Icon.vue'
import { ruleBadge } from './registry'
import MoreMenu from '../kit/MoreMenu.vue'
import Switch from '../kit/Switch.vue'
import { removeSource, saveToMine } from './actions'
import { pullUpdates, updateRow } from './update-flow'
import { useUpdatesStore } from '../../stores/updates'
import { useDownloadsStore } from '../../stores/downloads'
import { openBulk, openManage, openPack } from './open'

/** 书架（U2a）：官方 / 自制分开；每组可折叠；行 = 书名 · 版本 · 开关 · ⋯。无战役时所有书显示为关、开关不可用。书架搜索在列表下方。 */
const app = useAppStore()
const lib = useLibViewStore()
const campaign = useCampaignStore()
const toast = useToastStore()
const updates = useUpdatesStore()
const dl = useDownloadsStore()
// 这一行有没有更新 / 正在更新（检查结果来自后端，书架只显示）
const hasUpdate = (r: CatalogRow): boolean => !!(updates.brewOf(r.pack?.docIdLocal) || updates.officialOf(r.set, r.kind, r.id, r.source))
const updating = (r: CatalogRow): boolean => dl.items.some((i) => i.status === 'running' && (i.key === `update:${r.pack?.docIdLocal}` || i.label === `更新《${r.name}》`))
const q = ref('')

const kindOf = (r: CatalogRow): 'official' | 'brew' => (getSource(r.set).kind === 'brew' ? 'brew' : 'official')
// 只列已下载的（未装的在下载页）；有搜索词时按名称 / 缩写匹配
const mineSources = computed(() => new Set(lib.minePacks.flatMap((p) => p.sources)))
// 中英文名都能搜到（另一语言名由后端 altName 给，P5 T6 #18）
const match = (r: CatalogRow): boolean => r.downloaded && !mineSources.value.has(r.source) && (!q.value.trim() || `${r.name} ${r.altName ?? ''} ${r.abv}`.toLowerCase().includes(q.value.trim().toLowerCase()))
// 分类方式（设置 → 库 → 偏好）：作者分组 / 书或冒险
const regroup = (groups: ShelfGroup[]): ShelfGroup[] => (app.settings?.library.groupBy === 'kind'
  ? [{ group: 'books', name: '书', books: groups.flatMap((g) => g.books), adventures: [] }, { group: 'adventures', name: '冒险', books: [], adventures: groups.flatMap((g) => g.adventures) }]
  : groups)
const sections = computed(() => (['official', 'brew'] as const).map((kind) => ({
  kind,
  label: kind === 'official' ? '官方' : '自制',
  groups: regroup(lib.shelf?.groups ?? []).map((g): ShelfGroup => ({ ...g, books: g.books.filter((r) => kindOf(r) === kind && match(r)), adventures: g.adventures.filter((r) => kindOf(r) === kind && match(r)) })).filter((g) => g.books.length + g.adventures.length),
})).filter((s) => s.groups.length))
const total = computed(() => sections.value.reduce((n, s) => n + s.groups.reduce((m, g) => m + g.books.length + g.adventures.length, 0), 0))

async function onMenu(r: CatalogRow, key: string): Promise<void> {
  const s = app.svc()
  if (key === 'manage') openManage({ set: r.set, source: r.source, name: r.name, ...(r.pack ? { docIdLocal: r.pack.docIdLocal } : {}) })
  else if (key === 'save') await saveToMine(s, r, toast)
  else if ((key === 'rm' || key === 'rm-all') && (await removeSource(s, r, app.settings?.library.skipRemovePrompt ?? false, toast, key === 'rm-all'))) await lib.refresh(s)
}
async function onShelfMenu(key: string): Promise<void> {
  if (key === 'pull') await pullUpdates(app.svc(), lib.campaignLib?.codeSet ?? 'cn', toast)
}
const isOn = (r: CatalogRow): boolean => lib.bound && r.view.visible
async function toggle(r: CatalogRow, next: boolean): Promise<void> {
  const owner = campaign.owner?.ownerKey
  if (!owner || !lib.bound) return
  try { await lib.toggleSource(app.svc(), owner, r.source, next) } catch (e) { console.error('[trpg-assistant] 开关失败', e); toast.error('没有保存成功') }
}
</script>

<template>
  <div class="lib-scroll" data-testid="shelf-tab">
    <div v-if="lib.error" class="lib-banner lib-banner--warn" role="alert" data-testid="shelf-error"><Icon name="warning" :size="16" /><span>书架这次没读出来{{ lib.shelf ? '，下面是上次的内容' : '' }}：{{ lib.error }}</span><button class="trpg-btn trpg-btn--small lib-end" type="button" @click="lib.refresh(app.svc())">重试</button></div>
    <div v-if="!lib.shelf && lib.error" class="lib-state"><h3>还读不到书架</h3><p class="lib-muted">点上面的【重试】；已下载的资料不会丢。</p></div>
    <div v-else-if="!lib.shelf" class="lib-skel" aria-busy="true"><i /><i style="width:80%" /><i style="width:60%" /></div>
    <template v-else>
      <div class="lib-filter lib-filter--top">
        <input v-model="q" class="trpg-input" type="search" placeholder="搜索书目 / 包名" aria-label="搜索书目 / 包名" data-testid="shelf-search" />
      </div>
      <div v-if="!lib.bound" class="lib-banner" style="margin-top: var(--sp-2)"><Icon name="info" :size="16" /><span>先创建战役，开关才能用；所有书先显示为关。</span></div>
      <div v-if="lib.officialMissing" class="lib-banner" style="margin-top: var(--sp-2)" data-testid="official-missing"><Icon name="info" :size="16" /><span>官方资料没装：已下载的自制包会保留，但要先在【下载】页装好官方资料才能读。</span></div>
      <div v-if="lib.shelf.brewError" class="lib-banner lib-banner--warn" style="margin-top: var(--sp-2)"><Icon name="warning" :size="16" /><span>自制包读取失败：{{ lib.shelf.brewError }}</span></div>
      <div v-if="lib.shelf.booksError" class="lib-banner lib-banner--warn" style="margin-top: var(--sp-2)"><Icon name="warning" :size="16" /><span>书目读取失败：{{ lib.shelf.booksError }}</span></div>
      <div v-if="!total && !q" class="lib-state"><h3>还没有资料</h3><p class="lib-muted">去【下载】装官方资料或自制包。</p></div>
      <template v-for="s in sections" :key="s.kind">
        <div class="lib-sec">
          {{ s.label }}
          <span v-if="s.kind === 'official'" class="lib-end">
            <button class="trpg-btn trpg-btn--small" type="button" data-testid="open-bulk" :disabled="!lib.bound" :title="lib.bound ? undefined : '先创建战役'" @click="openBulk()">批量勾选…</button>
            <MoreMenu label="书架" :items="[{ key: 'pull', label: updates.checking ? '正在检查更新…' : '拉取更新', disabled: updates.checking }]" @select="onShelfMenu" />
          </span>
        </div>
        <div class="trpg-shelf lib-shelfbox">
          <details v-for="g in s.groups" :key="g.group" class="trpg-shelf__group" open>
            <summary class="trpg-shelf__sum">
              <span class="trpg-shelf__chev-closed"><Icon name="caret-right" :size="16" /></span><span class="trpg-shelf__chev-open"><Icon name="caret-down" :size="16" /></span>
              {{ g.name }}<small>{{ g.books.length + g.adventures.length }} 项</small>
            </summary>
            <div v-for="r in [...g.books, ...g.adventures]" :key="`${r.set}:${r.pack?.docIdLocal ?? r.source}:${r.id ?? ''}`" class="trpg-shelf__row" :data-off="!isOn(r)">
              <button class="lib-name" type="button" @click="openPack({ set: r.set, source: r.source, name: r.name, kind: r.kind, corpora: r.corpora, ...(r.pack ? { docIdLocal: r.pack.docIdLocal } : {}) })">{{ r.name }}<template v-if="r.kind === 'adventure'">（冒险）</template><small v-if="r.altName" class="lib-alt-name">{{ r.altName }}</small></button>
              <span v-if="ruleBadge(r)" class="trpg-badge" :title="r.shelf?.published ? `出版：${r.shelf.published}` : undefined">{{ ruleBadge(r) }}</span>
              <span v-if="updating(r)" class="lib-muted" role="status">更新中…</span>
              <button v-else-if="hasUpdate(r)" class="trpg-btn trpg-btn--small" type="button" data-testid="row-update" :title="`更新《${r.name}》`" @click="updateRow(app.svc(), r, toast)">有更新 · 更新</button>
              <Switch :model-value="isOn(r)" :label="`在本战役里使用《${r.name}》`" :disabled="!lib.bound" @update:model-value="(v: boolean) => toggle(r, v)" />
              <MoreMenu :label="r.name" :items="[{ key: 'manage', label: '管理' }, { key: 'save', label: '存入我的库' }, ...(getSource(r.set).kind === 'official' ? [{ key: 'rm', label: r.kind === 'adventure' ? '卸载这本冒险…' : '卸载这本书…', danger: true }, { key: 'rm-all', label: '卸载整套官方资料…', danger: true }] : [{ key: 'rm', label: '删除这个包…', danger: true }])]" @select="(k: string) => onMenu(r, k)" />
            </div>
          </details>
        </div>
      </template>
    </template>
  </div>
</template>
