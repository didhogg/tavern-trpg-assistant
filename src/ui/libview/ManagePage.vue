<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { chooseEntry, disabledEntries, type EntryRef } from '../../library/scopes'
import { useAppStore } from '../../stores/app'
import { useCampaignStore } from '../../stores/campaign'
import { useLibViewStore } from '../../stores/libview'
import { useToastStore } from '../../stores/toast'
import Checkbox from '../kit/Checkbox.vue'
import Segmented from '../kit/Segmented.vue'
import { levelText, loadEditRows, restoreRows, type EditRow } from './edit-rows'
import { nameOf } from './pack-data'
import type { PackHealth } from '../../library/pack-health'
import Icon from '../kit/Icon.vue'
import { downloadOfficialBook, installBrewSources } from './deps-flow'
import { categoryLabel } from './registry'

/** 包的【管理】（弹窗里的一页）：停用项目、被编辑 / 覆盖的条目；全部 / 部分勾选复原。只看这一本书 / 包里的。 */
const props = defineProps<{ set: string; source: string; name: string; docIdLocal?: string }>()
const app = useAppStore()
const lib = useLibViewStore()
const campaign = useCampaignStore()
const toast = useToastStore()
const tab = ref('disabled')
// 自制包的依赖（按作者程序：缺了这个包读不出）。只排版后端 packHealth 的结果
const health = ref<PackHealth | null>(null)
const depsError = ref<string | null>(null)
const missingCount = computed(() => health.value?.missing.length ?? 0)

interface OffRow { ref: EntryRef; name: string; picked: boolean }
const off = ref<OffRow[]>([])
const edits = ref<EditRow[]>([])
const loading = ref(true)
const canWrite = computed(() => lib.bound && !!campaign.owner)

async function load(): Promise<void> {
  loading.value = true
  try {
    const s = app.svc()
    const c = lib.campaignLib
    const rows: OffRow[] = []
    for (const ref of c ? disabledEntries(c) : []) {
      const stored = await s.backend.library.scoped.storedItem(ref)
      if (stored?.source === props.source) rows.push({ ref, name: nameOf(stored.item), picked: false })
    }
    off.value = rows
    edits.value = await loadEditRows(s, props.source)
    await loadDeps()
  } catch (e) { console.error('[trpg-assistant] 读取管理页失败', e); toast.error('读取管理页失败') } finally { loading.value = false }
}
async function loadDeps(): Promise<void> {
  if (!props.docIdLocal) return
  depsError.value = null
  try { health.value = (await app.svc().backend.library.packHealth(props.set, props.docIdLocal))[0] ?? null } catch (e) { console.error('[trpg-assistant] 读取依赖失败', e); depsError.value = e instanceof Error ? e.message : String(e) }
}
onMounted(() => void load())
const busyDep = ref<string | null>(null)
async function getDep(d: PackHealth['requires'][number]): Promise<void> {
  const s = app.svc()
  if (d.kind === 'official' && d.book) { downloadOfficialBook(s, d.book); toast.success(`已开始下载《${d.book.name}》，进度见【库】标志`); return }
  busyDep.value = d.source
  try { await installBrewSources(s, props.set, [d.source], `依赖包 ${d.source}`, toast, async () => { await lib.refresh(s); await loadDeps() }) } finally { busyDep.value = null }
}
const depName = (d: PackHealth['requires'][number]): string => (d.kind === 'official' ? `《${d.book?.name ?? d.source}》（官方书）` : d.provider?.replace(/\.json$/, '') ?? d.source)

async function enableAgain(): Promise<void> {
  const owner = campaign.owner?.ownerKey
  if (!owner || !canWrite.value) return
  const ks = app.svc().backend.kernelSave
  let cur = await ks.libraryOf(owner)
  for (const r of off.value.filter((x) => x.picked)) cur = { ...cur, ...chooseEntry(cur, r.ref, true) }
  await ks.setLibrary(owner, cur)
  toast.success('已复原')
  await lib.load(app.svc(), owner)
  await load()
}
async function restore(): Promise<void> {
  const c = lib.campaignLib
  if (!c) return
  try { await restoreRows(app.svc(), c, edits.value.filter((r) => r.picked), lib.bound ? campaign.owner?.ownerKey ?? null : null); toast.success('已复原'); await load() } catch (e) { console.error('[trpg-assistant] 复原失败', e); toast.error('复原没有成功') }
}
</script>

<template>
  <div class="lib-mbody" data-testid="manage-page">
    <div class="lib-filter"><Segmented v-model="tab" label="管理分区" :options="[{ value: 'disabled', label: '停用项目' }, { value: 'edits', label: '被编辑 / 覆盖' }, ...(docIdLocal ? [{ value: 'deps', label: missingCount ? `依赖包 ⚠${missingCount}` : '依赖包' }] : [])]" /></div>
    <div v-if="missingCount && tab !== 'deps'" class="lib-banner lib-banner--warn" data-testid="manage-missing-deps"><Icon name="warning" :size="16" /><span>这个包缺 {{ missingCount }} 个依赖，缺了会读不出。</span><button class="trpg-btn trpg-btn--small lib-end" type="button" @click="tab = 'deps'">查看并下载</button></div>
    <div class="lib-mscroll">
<div class="lib-pad">
      <div v-if="loading" class="lib-skel" aria-busy="true"><i /><i style="width:70%" /></div>
      <template v-else-if="tab === 'deps'">
        <div v-if="depsError" class="lib-banner lib-banner--warn"><Icon name="warning" :size="16" /><span>依赖读不出来：{{ depsError }}</span><button class="trpg-btn trpg-btn--small lib-end" type="button" @click="loadDeps">重试</button></div>
        <p v-else-if="!health?.requires.length" class="lib-muted">这个包不依赖别的包。</p>
        <ul v-else class="trpg-list" data-testid="manage-deps">
          <li v-for="d in health.requires" :key="d.source" class="trpg-row">
            <div class="trpg-row__main"><div class="trpg-row__title lib-name">{{ depName(d) }}</div><div class="trpg-row__meta">提供：{{ d.props.map(categoryLabel).join('、') }}</div></div>
            <div class="trpg-row__end">
              <span v-if="d.ok" class="trpg-badge" data-tone="success">已装</span>
              <template v-else>
                <span class="trpg-badge" data-tone="warn">缺</span>
                <button class="trpg-btn trpg-btn--small trpg-btn--primary" type="button" :disabled="busyDep === d.source || (d.kind === 'official' && !d.book)" :title="d.kind === 'official' && !d.book ? '书目里找不到这本书' : undefined" @click="getDep(d)">{{ busyDep === d.source ? '下载中…' : d.kind === 'official' ? '下载这本书' : '下载' }}</button>
              </template>
            </div>
          </li>
        </ul>
      </template>
      <template v-else-if="tab === 'disabled'">
        <p v-if="!off.length" class="lib-muted">没有停用的条目。</p>
        <template v-else>
          <button class="trpg-btn trpg-btn--small trpg-btn--primary" type="button" style="justify-self: start" :disabled="!canWrite || !off.some((r) => r.picked)" @click="enableAgain">复原所选（{{ off.filter((r) => r.picked).length }}）</button>
          <Checkbox v-for="r in off" :key="`${r.ref.prop}:${r.ref.hash}`" v-model="r.picked"><b class="lib-name">{{ r.name }}</b></Checkbox>
        </template>
      </template>
      <template v-else>
        <p v-if="!edits.length" class="lib-muted">没有被编辑或覆盖的条目。</p>
        <template v-else>
          <button class="trpg-btn trpg-btn--small trpg-btn--primary" type="button" style="justify-self: start" :disabled="!edits.some((r) => r.picked)" @click="restore">复原所选（{{ edits.filter((r) => r.picked).length }}）</button>
          <Checkbox v-for="r in edits" :key="`${r.level}|${r.target}`" v-model="r.picked"><b class="lib-name">{{ r.name }}</b><span class="lib-src">（{{ levelText(r.level) }}）</span></Checkbox>
        </template>
      </template>
    </div>
</div>
  </div>
</template>
