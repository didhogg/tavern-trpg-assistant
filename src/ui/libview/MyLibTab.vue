<script setup lang="ts">
import { computed, ref } from 'vue'
import type { BrewPack } from '../../library/brew-packs'
import { useAppStore } from '../../stores/app'
import { useCampaignStore } from '../../stores/campaign'
import { useLibViewStore } from '../../stores/libview'
import { useToastStore } from '../../stores/toast'
import Icon from '../kit/Icon.vue'
import MoreMenu from '../kit/MoreMenu.vue'
import Switch from '../kit/Switch.vue'
import { askConfirm } from '../kit/confirm'
import { importFiles } from './import-flow'

/** 我的库（U6）：自己导入的包、从别处存入的本地副本。从下载页装的包在书架；房规 / 编辑 / 覆盖不放这里。条目编辑与新建是 P5.5，按钮先灰。 */
const app = useAppStore()
const lib = useLibViewStore()
const campaign = useCampaignStore()
const toast = useToastStore()
const q = ref('')
const picker = ref<HTMLInputElement | null>(null)
const busy = ref(false)
const codeSet = computed(() => lib.campaignLib?.codeSet ?? 'cn')
const packs = computed(() => lib.minePacks.filter((p) => !q.value.trim() || `${p.filename ?? ''}${p.sourceInfo.map((i) => i.full ?? '').join('')}`.toLowerCase().includes(q.value.trim().toLowerCase())))

const title = (p: BrewPack): string => p.sourceInfo[0]?.full ?? p.filename ?? '（未命名）'
const rowOn = (p: BrewPack): boolean => lib.bound && p.sources.some((s) => lib.shelf?.groups.some((g) => [...g.books, ...g.adventures].some((r) => r.source === s && r.view.visible)))

async function reload(): Promise<void> {
  await lib.refresh(app.svc())
}
async function toggle(p: BrewPack, on: boolean): Promise<void> {
  const owner = campaign.owner?.ownerKey
  if (!owner || !lib.bound) return
  try { for (const s of p.sources) await lib.toggleSource(app.svc(), owner, s, on) } catch (e) { console.error('[trpg-assistant] 开关失败', e); toast.error('没有保存成功') }
}
async function onPick(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  const files = [...(input.files ?? [])]
  input.value = ''
  if (!files.length) return
  busy.value = true
  try { if (await importFiles(app.svc(), codeSet.value, files, app.settings?.library.skipImportPreview ?? false, toast)) await reload() } finally { busy.value = false }
}
async function exportPack(p: BrewPack): Promise<void> {
  try {
    const r = await app.svc().backend.library.custom.exportBrew(codeSet.value, p.docIdLocal)
    if (!r) { toast.error('没有找到这个包'); return }
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([JSON.stringify(r.body, null, 2)], { type: 'application/json' }))
    a.download = r.filename ?? `${title(p)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
    toast.success(`已导出 ${a.download}`)
  } catch (e) { console.error('[trpg-assistant] 导出失败', e); toast.error('导出没有成功') }
}
async function remove(p: BrewPack): Promise<void> {
  const setId = lib.brewSetId(codeSet.value)
  if (!setId) return
  try {
    const impact = await app.svc().backend.removalImpact({ kind: 'brew', setId, docIdLocals: [p.docIdLocal] })
    const lines = [...impact.packs.map((x) => `${x.mustRemove ? '必须一起删除：' : '依赖它：'}${x.filename ?? x.docIdLocal}`), ...(impact.saves.length ? [`${impact.saves.length} 份存档 / 当前数据用到它`] : [])]
    if (!(app.settings?.library.skipRemovePrompt) || impact.packs.some((x) => x.mustRemove)) {
      if (!(await askConfirm({ title: `删除《${title(p)}》？`, message: '这个包会从本机删除。', details: lines.length ? lines : undefined, confirmLabel: '确认删除', danger: true }))) return
    }
    await app.svc().backend.library.service.brewDelete(setId, impact.removeTogether.length ? impact.removeTogether : [p.docIdLocal])
    toast.success('已删除')
    await reload()
  } catch (e) { console.error('[trpg-assistant] 删除失败', e); toast.error('没有成功，原有内容没有改动') }
}
</script>

<template>
  <div class="lib-scroll" data-testid="mylib-tab">
    <div class="lib-filter" style="padding-left: 0; padding-right: 0">
      <input v-model="q" class="trpg-input" type="search" placeholder="在我的库里搜索" aria-label="在我的库里搜索" />
      <button class="trpg-btn" type="button" :disabled="busy" data-testid="mylib-import" @click="picker?.click()"><Icon name="upload-simple" :size="16" />导入文件</button>
      <button class="trpg-btn trpg-btn--primary" type="button" disabled title="条目编辑与新建稍后开放（P5.5）"><Icon name="plus" :size="16" />新建条目</button>
      <input ref="picker" type="file" accept=".json,application/json" multiple hidden data-testid="mylib-file" @change="onPick" />
    </div>
    <div class="lib-sec" style="padding-top: 0">导入与存入的包</div>
    <div v-if="!packs.length" class="lib-state"><h3>这里放你自己的内容</h3><p class="lib-muted">导入作者格式的 JSON 文件，或在书架的 ⋯ 里把一本书"存入我的库"。</p></div>
    <ul v-else class="trpg-list" data-testid="mylib-list">
      <li v-for="p in packs" :key="p.docIdLocal" class="trpg-row">
        <div class="trpg-row__main"><div class="trpg-row__title lib-name">{{ title(p) }}</div><div class="trpg-row__meta">来源 {{ p.sources.length }} 个 · 条目 {{ p.entryCount }} 条</div></div>
        <div class="trpg-row__end">
          <Switch :model-value="rowOn(p)" :label="`在本战役里使用《${title(p)}》`" :disabled="!lib.bound" @update:model-value="(v: boolean) => toggle(p, v)" />
          <button class="trpg-btn trpg-btn--small" type="button" @click="exportPack(p)"><Icon name="download-simple" :size="14" />导出</button>
          <MoreMenu :label="title(p)" :items="[{ key: 'rm', label: '删除…', danger: true }]" @select="remove(p)" />
        </div>
      </li>
    </ul>
  </div>
</template>
