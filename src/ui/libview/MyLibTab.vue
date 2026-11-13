<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import type { PackPair } from '../../library/custom-lang'
import { useAppStore } from '../../stores/app'
import { useCampaignStore } from '../../stores/campaign'
import { useLibViewStore } from '../../stores/libview'
import { useToastStore } from '../../stores/toast'
import { useUiStore } from '../../stores/ui'
import Icon from '../kit/Icon.vue'
import MoreMenu from '../kit/MoreMenu.vue'
import Switch from '../kit/Switch.vue'
import ErrorBanner from './ErrorBanner.vue'
import { importFiles } from './import-flow'
import { catsText, copiedFrom, exportPair, packTitle, sideOf, usePending, versionTag } from './mine'
import { openMyPack, openNewPack, packMenu, runPackMenu } from './mine-actions'
import { openDraft } from './edit-flow'
import { categoryLabel } from './registry'
import type { EditDraft } from '../../library/manage'

/**
 * P5.5 u7-1 我的库：只有一种东西——包（自己建的、复制的、导入的，全都能改）。中英一对包一行，带「中 / En」。
 * 从下载页装的包在书架；想改就在书架 ⋯ → 复制成我的。
 */
const app = useAppStore()
const lib = useLibViewStore()
const campaign = useCampaignStore()
const toast = useToastStore()
const ui = useUiStore()
const q = ref('')
const picker = ref<HTMLInputElement | null>(null)
const busy = ref(false)
const codeSet = computed(() => lib.campaignLib?.codeSet ?? 'cn')
const narrow = computed(() => ui.layout === 'narrow')
const pending = usePending(() => app.svc(), () => ['cn', 'en'], () => void reload())

const rows = computed(() => {
  const needle = q.value.trim().toLowerCase()
  return (lib.pairs ?? []).filter((p) => !needle || [p.zh, p.en].some((x) => x && `${x.own.full ?? ''}${x.own.json}${x.filename ?? ''}`.toLowerCase().includes(needle)))
})
const pack = (p: PackPair) => sideOf(p, codeSet.value)
const isPending = (p: PackPair) => pending.packs.value.has(p.id)
/** 只导入了一种语言的包：写明没找到另一种语言版（我的库只放导入 / 自己建的，不提示下载）。 */
const oneLang = (p: PackPair): string => (p.zh ? '只导入了中文版，没找到这个包的 English 版' : '只导入了 English 版，没找到这个包的中文版')
const rowOn = (p: PackPair): boolean => lib.bound && pack(p).sources.some((s) => lib.shelf?.groups.some((g) => [...g.books, ...g.adventures].some((r) => r.source === s && r.view.visible)))

// 没保存的草稿（u7-1 草稿条）：草稿只是草稿，不影响任何条目（Q15）
const drafts = ref<Array<EditDraft & { key: string }>>([])
async function loadDrafts(): Promise<void> {
  try { drafts.value = (await Promise.all(['cn', 'en'].map((c) => app.svc().backend.library.custom.drafts(c)))).flat().sort((a, b) => b.at - a.at) } catch (e) { console.warn('[trpg-assistant] 读取草稿没成功', e) }
}
const draftName = (d: EditDraft) => `${String(d.s.name ?? '') || '未命名'}（${categoryLabel(d.prop) ?? d.prop}）`
function continueDraft(key: string): void {
  const d = drafts.value.find((x) => x.key === key)
  if (d) openDraft(app.svc(), d, (id) => { const p = lib.pairs?.find((x) => x.id === id); return p ? packTitle(sideOf(p, d.codeSet)) : null }, lib.campaignLib).catch((e: unknown) => { console.error('[trpg-assistant] 接着改草稿失败', e); toast.error(e instanceof Error ? e.message : '没能打开草稿') })
}
async function reload(): Promise<void> {
  await lib.loadPairs(app.svc())
  void pending.check()
  void loadDrafts()
}
onMounted(() => void reload())
watch(() => lib.campaignLib, () => void reload())

async function toggle(p: PackPair, on: boolean): Promise<void> {
  const owner = campaign.owner?.ownerKey
  if (!owner || !lib.bound) return
  try { for (const s of pack(p).sources) await lib.toggleSource(app.svc(), owner, s, on) } catch (e) { console.error('[trpg-assistant] 开关失败', e); toast.error('没有保存成功') }
}
async function onPick(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  const files = [...(input.files ?? [])]
  input.value = ''
  if (!files.length) return
  busy.value = true
  try { if (await importFiles(app.svc(), codeSet.value, files, app.settings?.library.skipImportPreview ?? false, toast)) { await reload(); await lib.refresh(app.svc()) } } finally { busy.value = false }
}
const onMenu = (p: PackPair, key: string) => runPackMenu(app.svc(), key, p, codeSet.value, toast, app.settings?.library.skipRemovePrompt ?? false)
</script>

<template>
  <div class="lib-scroll" data-testid="mylib-tab">
    <div class="lib-stack">
      <div class="lib-filter" style="padding-left: 0; padding-right: 0; padding-top: 0">
        <input v-model="q" class="trpg-input" type="search" :placeholder="narrow ? '搜索' : '在我的库里搜索'" aria-label="在我的库里搜索" />
        <button class="trpg-btn" type="button" :disabled="busy" data-testid="mylib-import" @click="picker?.click()"><Icon name="upload-simple" :size="16" />{{ narrow ? '导入' : '导入文件' }}</button>
        <button class="trpg-btn trpg-btn--primary" type="button" data-testid="mylib-newpack" @click="openNewPack(app.svc(), codeSet)"><Icon name="plus" :size="16" />新建包</button>
        <input ref="picker" type="file" accept=".json,application/json" multiple hidden data-testid="mylib-file" @change="onPick" />
      </div>
      <div v-if="drafts.length" class="lib-drafts" data-testid="mylib-drafts">
        <Icon name="pencil-simple" :size="16" />
        <span>{{ narrow ? `${drafts.length} 份没保存的草稿` : `有 ${drafts.length} 份没保存的草稿：${drafts.slice(0, 3).map(draftName).join(' · ')}` }}</span>
        <span class="lib-end"><button class="trpg-btn trpg-btn--small" type="button" data-testid="draft-continue" @click="continueDraft(drafts[0].key)">继续{{ drafts.length > 1 ? '最新的' : '' }}</button><MoreMenu v-if="drafts.length > 1" label="继续哪一份草稿" :items="drafts.map((d) => ({ key: d.key, label: `继续：${draftName(d)}` }))" @select="continueDraft" /></span>
      </div>
      <ErrorBanner v-if="pending.failed.value" :text="`后台整理没成功：${pending.failed.value}。你存的内容都在。`" what="后台整理" :actions="[{ label: '重试', run: pending.retry }]" data-testid="mylib-parse-failed" />
      <ErrorBanner v-if="lib.pairsError" :text="`我的库没读出来：${lib.pairsError}`" what="读取我的库" :actions="[{ label: '重试', run: reload }]" />
      <div v-if="lib.pairs === null && !lib.pairsError" class="lib-skel" aria-busy="true"><i /><i style="width:80%" /></div>
      <div v-else-if="!rows.length && !q" class="lib-state" data-testid="mylib-empty">
        <h3>这里放你自己的包</h3>
        <p class="lib-muted">新建一个包往里加条目，或者导入作者格式的 JSON 文件。想改官方的书，在书架那本书的 ⋯ 里选「复制成我的」。</p>
        <span style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: center"><button class="trpg-btn trpg-btn--primary" type="button" @click="openNewPack(app.svc(), codeSet)"><Icon name="plus" :size="16" />新建包</button><button class="trpg-btn" type="button" @click="picker?.click()"><Icon name="upload-simple" :size="16" />导入文件</button></span>
      </div>
      <div v-else-if="!rows.length" class="lib-state"><h3>没有符合的包</h3><button class="trpg-btn" type="button" @click="q = ''">清空搜索</button></div>
      <ul v-else class="trpg-list" data-testid="mylib-list">
        <li v-for="p in rows" :key="p.id" class="trpg-row" data-testid="mylib-row">
          <div class="trpg-row__main lib-pack">
            <div class="trpg-row__title">
              <button class="lib-name trpg-link" type="button" data-testid="mylib-open" @click="openMyPack(lib, p, codeSet)">{{ packTitle(pack(p)) }}</button>
              <span class="trpg-badge">{{ versionTag(app.svc(), pack(p).scopes) }}</span>
              <span class="lib-langs" :title="p.zh && p.en ? '中文、英文两个文件' : p.zh ? '只有中文' : '只有英文'"><span v-if="p.zh" class="trpg-badge" data-tone="info">中</span><span v-if="p.en" class="trpg-badge" data-tone="info">En</span></span>
              <span v-if="isPending(p)" class="lib-pending" data-testid="mylib-pending"><Icon name="arrow-clockwise" :size="12" />整理中</span>
            </div>
            <div class="lib-pack__cats">{{ copiedFrom(pack(p)) ? `复制自 ${copiedFrom(pack(p))} · ` : '' }}{{ catsText(pack(p)) }}</div>
            <div v-if="!p.zh || !p.en" class="lib-faint" style="font-size: 12px" data-testid="mylib-onelang">{{ oneLang(p) }}</div>
          </div>
          <div class="trpg-row__end">
            <Switch :model-value="rowOn(p)" :label="`在本战役里使用《${packTitle(pack(p))}》`" :disabled="!lib.bound" @update:model-value="(v: boolean) => toggle(p, v)" />
            <button v-if="!narrow" class="trpg-btn trpg-btn--small" type="button" data-testid="mylib-export" @click="exportPair(app.svc(), p.id, packTitle(pack(p)), toast)"><Icon name="download-simple" :size="14" />导出</button>
            <MoreMenu :label="packTitle(pack(p))" :items="packMenu(p, { withExport: narrow })" @select="(k: string) => onMenu(p, k)" />
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
