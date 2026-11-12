<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { CatalogRow } from '../../library/scoped'
import type { ShelfGroup } from '../../library/shelf'
import { getSource } from '../../library/sources'
import { useAppStore } from '../../stores/app'
import { useCampaignStore } from '../../stores/campaign'
import { useLibViewStore } from '../../stores/libview'
import { useToastStore } from '../../stores/toast'
import Checkbox from '../kit/Checkbox.vue'
import GroupCheck from '../kit/GroupCheck.vue'
import HoverTip from '../kit/HoverTip.vue'
import Icon from '../kit/Icon.vue'
import { formatBytes } from '../format'
import { ruleBadge } from './registry'
import MoreMenu from '../kit/MoreMenu.vue'
import Switch from '../kit/Switch.vue'
import { removeSource, removeTargets, saveToMine, targetOf } from './actions'
import { pullUpdates, updateRow } from './update-flow'
import { useUpdatesStore } from '../../stores/updates'
import { useDownloadsStore } from '../../stores/downloads'
import { openManage, openPack } from './open'

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
// 只列已下载的（未装的在下载页）；冒险正文没下、但它自带的条目已在本地的，也列出（条目能看，正文另下）。有搜索词时按名称 / 缩写匹配
const minePackIds = computed(() => new Set(lib.minePacks.map((p) => p.docIdLocal)))
// 中英文名都能搜到（另一语言名由后端 altName 给，P5 T6 #18）
const match = (r: CatalogRow): boolean => (r.downloaded || (r.kind === 'adventure' && r.count > 0)) && !(r.pack && minePackIds.value.has(r.pack.docIdLocal)) && (!q.value.trim() || `${r.name} ${r.altName ?? ''} ${r.abv}`.toLowerCase().includes(q.value.trim().toLowerCase()))
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
  else if (key === 'rm' && (await removeSource(s, r, app.settings?.library.skipRemovePrompt ?? false, toast))) await lib.refresh(s)
}

// 多选卸载（P5-5 §12，和下载页同一套规则）：分组框 [ ] 全选这一组、[−] 取消这一组；底部写已选几项、约多大
const rowKey = (r: CatalogRow): string => `${r.set}:${r.pack?.docIdLocal ?? r.source}:${r.id ?? ''}`
const multi = ref(false)
const selected = ref<Set<string>>(new Set())
const shownRows = computed(() => sections.value.flatMap((x) => x.groups.flatMap((g) => [...g.books, ...g.adventures])))
const picked = computed(() => shownRows.value.filter((r) => selected.value.has(rowKey(r))))
function setMulti(on: boolean): void { multi.value = on; selected.value = new Set() }
function pick(rows: CatalogRow[], on: boolean): void {
  const next = new Set(selected.value)
  for (const r of rows) { if (on) next.add(rowKey(r)); else next.delete(rowKey(r)) }
  selected.value = next
}
const size = ref<{ busy: boolean; bytes: number | null }>({ busy: false, bytes: null })
let sizeSeq = 0
watch(picked, async (rows) => {
  const mine = ++sizeSeq
  if (!rows.length) { size.value = { busy: false, bytes: null }; return }
  size.value = { busy: true, bytes: null }
  try {
    const r = await app.svc().backend.removalSizes(rows.map(targetOf))
    if (mine === sizeSeq) size.value = { busy: false, bytes: r.total }
  } catch (e) {
    console.warn('[trpg-assistant] 算占用大小失败', e)
    if (mine === sizeSeq) size.value = { busy: false, bytes: null }
  }
})
const removing = ref(false)
async function removePicked(): Promise<void> {
  const rows = picked.value
  if (!rows.length || removing.value) return
  removing.value = true
  try {
    if (await removeTargets(app.svc(), rows.map(targetOf), rows.map((r) => r.name), false, toast)) { setMulti(false); await lib.refresh(app.svc()) }
  } finally { removing.value = false }
}
// 多选下栏：选中的一次全部启用 / 全部禁用（本战役，只写一次战役设置；原「批量勾选」并进这里）
const switching = ref(false)
async function switchPicked(on: boolean): Promise<void> {
  const owner = campaign.owner?.ownerKey
  const rows = picked.value
  if (!owner || !lib.bound || !rows.length || switching.value) return
  switching.value = true
  try {
    await lib.applySources(app.svc(), owner, Object.fromEntries(rows.map((r) => [r.source, on])))
    toast.success(`已${on ? '启用' : '禁用'} ${rows.length} 项`)
  } catch (e) { console.error('[trpg-assistant] 批量开关失败', e); toast.error('没有保存成功') } finally { switching.value = false }
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
    <div v-if="!lib.shelf && lib.error" class="lib-state"><h3>还读不到书架</h3><p class="lib-muted">点顶部提示里的【重试】；已下载的资料不会丢。</p></div>
    <div v-else-if="!lib.shelf" class="lib-skel" aria-busy="true"><i /><i style="width:80%" /><i style="width:60%" /></div>
    <template v-else>
      <div class="lib-filter lib-filter--top">
        <input v-model="q" class="trpg-input" type="search" placeholder="搜索书目 / 包名" aria-label="搜索书目 / 包名" data-testid="shelf-search" />
      </div>
      <div v-if="!lib.bound" class="lib-banner" style="margin-top: var(--sp-2)"><Icon name="info" :size="16" /><span>先创建战役，开关才能用；所有书先显示为关。</span></div>
      <div v-if="lib.officialMissing" class="lib-banner" style="margin-top: var(--sp-2)" data-testid="official-missing"><Icon name="info" :size="16" /><span>官方资料没装：已下载的自制包会保留，但要先在【下载】页装好官方资料才能读。</span></div>
      <div v-if="!total && !q" class="lib-state"><h3>还没有资料</h3><p class="lib-muted">去【下载】装官方资料或自制包。</p></div>
      <template v-for="s in sections" :key="s.kind">
        <div class="lib-sec">
          {{ s.label }}
          <span class="lib-end">
            <button class="trpg-btn trpg-btn--small" type="button" :aria-pressed="multi" :data-testid="`shelf-multi-${s.kind}`" @click="setMulti(!multi)"><Icon :name="multi ? 'x' : 'check'" :size="14" />{{ multi ? '退出多选' : '多选' }}</button>
            <template v-if="s.kind === 'official'">
            <MoreMenu label="书架" :items="[{ key: 'pull', label: updates.checking ? '正在检查更新…' : '拉取更新', disabled: updates.checking }]" @select="onShelfMenu" />
            </template>
          </span>
        </div>
        <div class="trpg-shelf lib-shelfbox">
          <details v-for="g in s.groups" :key="g.group" class="trpg-shelf__group" open>
            <summary class="trpg-shelf__sum">
              <span class="trpg-shelf__chev-closed"><Icon name="caret-right" :size="16" /></span><span class="trpg-shelf__chev-open"><Icon name="caret-down" :size="16" /></span>
              {{ g.name }}<small>{{ g.books.length + g.adventures.length }} 项</small>
              <span v-if="multi" class="lib-end"><GroupCheck :selected="[...g.books, ...g.adventures].filter((r) => selected.has(rowKey(r))).length" :total="g.books.length + g.adventures.length" :label="g.name" @change="(all: boolean) => pick([...g.books, ...g.adventures], all)" /></span>
            </summary>
            <div v-for="r in [...g.books, ...g.adventures]" :key="rowKey(r)" class="trpg-shelf__row" :data-off="!isOn(r)">
              <Checkbox v-if="multi" class="lib-rowpick" :model-value="selected.has(rowKey(r))" :label="`选择《${r.name}》`" @update:model-value="(v: boolean) => pick([r], v)" />
              <button class="lib-name" type="button" @click="openPack({ set: r.set, source: r.source, name: r.name, kind: r.kind, corpora: r.corpora, ...(r.pack ? { docIdLocal: r.pack.docIdLocal } : {}) })">{{ r.name }}<template v-if="r.kind === 'adventure'">（冒险）</template><small v-if="r.altName" class="lib-alt-name">{{ r.altName }}</small></button>
              <span v-if="r.kind === 'adventure' && !r.downloaded" class="lib-muted" title="这本冒险自带的怪物、物品等已在本地；正文在下载页另下">正文没下载</span>
              <span v-if="ruleBadge(r)" class="trpg-badge" :title="r.shelf?.published ? `出版：${r.shelf.published}` : undefined">{{ ruleBadge(r) }}</span>
              <span v-if="updating(r)" class="lib-muted" role="status">更新中…</span>
              <button v-else-if="hasUpdate(r)" class="trpg-btn trpg-btn--small" type="button" data-testid="row-update" :title="`更新《${r.name}》`" @click="updateRow(app.svc(), r, toast)">有更新 · 更新</button>
              <HoverTip inline :text="!lib.bound ? '先创建战役，开关才能用' : isOn(r) ? '本战役启用' : '本战役停用'"><Switch :model-value="isOn(r)" :label="`在本战役里使用《${r.name}》`" :disabled="!lib.bound" data-testid="shelf-switch" @update:model-value="(v: boolean) => toggle(r, v)" /></HoverTip>
              <MoreMenu :label="r.name" :items="[{ key: 'manage', label: '管理' }, { key: 'save', label: '存入我的库' }, ...(getSource(r.set).kind === 'official' ? [{ key: 'rm', label: r.kind === 'adventure' ? '卸载这本冒险…' : '卸载这本书…', danger: true }] : [{ key: 'rm', label: '删除这个包…', danger: true }])]" @select="(k: string) => onMenu(r, k)" />
            </div>
          </details>
        </div>
      </template>
      <div v-if="multi" class="lib-selbar" data-testid="shelf-selbar">
        <span class="lib-muted">已选 {{ picked.length }} 项<template v-if="picked.length"> · {{ size.busy ? '正在计算大小…' : size.bytes == null ? '大小暂时算不出' : `约 ${formatBytes(size.bytes)}` }}</template></span>
        <span class="lib-end">
          <button class="trpg-btn trpg-btn--small" type="button" data-testid="shelf-enable-picked" :disabled="!picked.length || !lib.bound || switching" :title="lib.bound ? undefined : '先创建战役'" @click="switchPicked(true)">全部启用</button>
          <button class="trpg-btn trpg-btn--small" type="button" data-testid="shelf-disable-picked" :disabled="!picked.length || !lib.bound || switching" :title="lib.bound ? undefined : '先创建战役'" @click="switchPicked(false)">全部禁用</button>
          <button class="trpg-btn trpg-btn--small trpg-btn--danger" type="button" data-testid="shelf-remove-picked" :disabled="!picked.length || removing" @click="removePicked">{{ removing ? '正在卸载…' : `卸载选中的 ${picked.length} 项…` }}</button></span>
      </div>
    </template>
  </div>
</template>
