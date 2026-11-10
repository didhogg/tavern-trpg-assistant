<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { chooseEntry, type EntryRef } from '../../library/scopes'
import type { ScopedDetail } from '../../library/scoped'
import { getSource } from '../../library/sources'
import { useAppStore } from '../../stores/app'
import { useCampaignStore } from '../../stores/campaign'
import { useLibViewStore } from '../../stores/libview'
import { useModalStore } from '../../stores/modal'
import { useToastStore } from '../../stores/toast'
import Icon from '../kit/Icon.vue'
import MoreMenu from '../kit/MoreMenu.vue'
import Segmented from '../kit/Segmented.vue'
import Switch from '../kit/Switch.vue'
import ClassView from './ClassView.vue'
import { byLevel, flattenFeatures } from './class-data'
import EntryBody from './EntryBody.vue'
import EntryVersions from './EntryVersions.vue'
import { replaceEntry } from './open'
import FeatureLevels from './FeatureLevels.vue'
import { authorName, nameOf as itemName } from './pack-data'
import { BLOCKS } from './statblock'

/** 条目详情壳（U1b）：弹窗里的一页。在 sheet 弹窗里前进；‹ 返回由宿主给。 */
const props = defineProps<{ entryRef: EntryRef }>()
const app = useAppStore()
const lib = useLibViewStore()
const campaign = useCampaignStore()
const modal = useModalStore()
const toast = useToastStore()

type State = { kind: 'loading' } | { kind: 'ok'; d: ScopedDetail | null; item: unknown; closed: boolean } | { kind: 'none' } | { kind: 'error'; message: string }
const state = ref<State>({ kind: 'loading' })
const enabled = ref(true)
/** 中 / En 切换：只是同一个来源的另一种语言版本（作者的配对）；对不上就灰掉。 */
const other = ref<EntryRef | null>(null)
const lang = computed(() => getSource(props.entryRef.set).lang)
async function loadCounterpart(d: ScopedDetail | null): Promise<void> {
  other.value = null
  try {
    const cp = await app.svc().backend.library.counterparts.counterpart(props.entryRef, { docIdLocal: d?.version.altId && d.version.altId !== 'base' ? d.alternatives.find((a) => a.altId === d.version.altId)?.docIdLocal : undefined })
    if (cp.status === 'found') other.value = cp.refs[0]
  } catch (e) { console.error('[trpg-assistant] 读取另一种语言失败', e) }
}
function switchLang(v: string | undefined): void {
  if (!v || v === (lang.value === 'zh' ? 'zh' : 'en') || !other.value) return
  replaceEntry(other.value)
}
const codeSet = computed(() => getSource(props.entryRef.set).codeSet)
const sourceLine = ref('')
/** 摘要行：作者列表页每列的显示值（环阶、时间、学派…，B-35），名称与来源列不重复显示；没有列表定义的类别没有摘要行。 */
const summary = ref<Array<{ k: string; v: string }>>([])
/** 种族页：亚种直接全部列出（R94）；亚种在作者数据里是带 raceName 的独立条目。 */
/** 作者函数翻译的摘要行（法术的成分 / 持续时间、神祇的阵营、职业的熟练…，B-36）与职业每级熟练加值。 */
const authorLines = ref<Array<{ label: string; value: string }>>([])
const authorPb = ref<string[] | null>(null)
const subraces = ref<Array<{ name: string; entries: unknown; ref: EntryRef }>>([])
/** 正文不在 entries 里的类别（传奇组等）：作者拼出来的正文条目（frame summaryEntry，P5-1 B-40）。 */
const summaryBody = ref<unknown>(null)
/** 怪物所属的传奇组（巢穴动作 / 区域效应 / 神话遭遇）：怪物自己只带传奇组的名字和来源，内容在传奇组条目里，作者的详情页把它接在数值块后面。 */
const groupBody = ref<{ name: string; entry: unknown } | null>(null)
async function loadExtras(item: unknown): Promise<void> {
  const s = app.svc().backend.library
  summary.value = []
  subraces.value = []
  authorLines.value = []
  authorPb.value = null
  summaryBody.value = null
  groupBody.value = null
  try {
    const af = await (await s.service.frameOf(codeSet.value)).call('authorFields', props.entryRef.prop, JSON.parse(JSON.stringify(item)))
    authorLines.value = af.lines
    authorPb.value = af.pb
    summaryBody.value = await (await s.service.frameOf(codeSet.value)).call('summaryEntry', props.entryRef.prop, JSON.parse(JSON.stringify(item)))
    const lg = props.entryRef.prop === 'monster' ? (item as { legendaryGroup?: { name?: string; source?: string } } | null)?.legendaryGroup : null
    if (lg?.name && lib.campaignLib) {
      const frame = await s.service.frameOf(codeSet.value)
      const m = await frame.call('statblockMeta', { type: 'statblock', prop: 'legendaryGroup', name: lg.name, source: lg.source })
      const at = m.hash ? await s.scoped.locate(lib.campaignLib, 'legendaryGroup', m.hash) : null
      const stored = at ? await s.scoped.storedItem(at.ref) : null
      const entry = stored ? await frame.call('summaryEntry', 'legendaryGroup', JSON.parse(JSON.stringify(stored.item))) : null
      if (entry) groupBody.value = { name: lg.name, entry }
    }
    const lc = await s.sorting.cells(codeSet.value, props.entryRef.prop)
    const row = lc?.cells[props.entryRef.hash]
    if (lc && row) summary.value = lc.columns.map((c, i) => ({ k: c.text, v: row[i], sort: c.sort })).filter((x) => x.sort !== 'name' && x.sort !== 'source' && x.v).map(({ k, v }) => ({ k, v }))
    const c = lib.campaignLib
    const me = item as { name?: string; source?: string; raceName?: string } | null
    if (props.entryRef.prop === 'race' && c && me && !me.raceName) {
      const all = await s.scoped.query(c, 'race', { source: me.source })
      subraces.value = all.filter((r) => (r.item as { raceName?: string; raceSource?: string }).raceName === me.name).map((r) => ({ name: itemName(r.item), entries: (r.item as { entries?: unknown }).entries ?? null, ref: r.ref }))
    }
  } catch (e) { console.error('[trpg-assistant] 读取摘要行 / 亚种失败', e) }
}
/** 来源行：书的全名（作者的 sourceNames）+ 页码；名字取不到就退回来源缩写。 */
async function sourceText(item: unknown, source: string | null): Promise<string> {
  if (!source) return ''
  let name = source
  try { name = (await (await app.svc().backend.library.service.frameOf(codeSet.value)).call('sourceNames', [source]))[source]?.full ?? source } catch (e) { console.error('[trpg-assistant] 读取书名失败', e) }
  const page = (item as { page?: unknown } | null)?.page
  return `${name}${typeof page === 'number' ? ` · 第 ${page} 页` : ''} · ${source}`
}

async function load(): Promise<void> {
  state.value = { kind: 'loading' }
  const s = app.svc()
  const c = lib.campaignLib
  if (!c) { state.value = { kind: 'error', message: '还没有读取库设置' }; return }
  try {
    const d = await s.backend.library.scoped.detail(c, props.entryRef)
    if (d && 'hidden' in d) {
      // 本战役关着这本书 / 不在范围：仍然能看（R33），只在顶部提示
      const raw = await s.backend.library.service.detail(props.entryRef.set, props.entryRef.prop, props.entryRef.hash)
      if (!raw) { state.value = { kind: 'none' }; return }
      state.value = { kind: 'ok', d: null, item: raw.item, closed: true }
      enabled.value = false
      sourceLine.value = await sourceText(raw.item, raw.source ?? null)
    } else if (!d) {
      state.value = { kind: 'none' }
      return
    } else {
      state.value = { kind: 'ok', d, item: d.item, closed: false }
      sourceLine.value = await sourceText(d.item, d.source ?? null)
      enabled.value = true
    }
    void loadExtras(state.value.item)
    void loadCounterpart(state.value.kind === 'ok' ? state.value.d : null)
    const key = `entry:${props.entryRef.set}:${props.entryRef.prop}:${props.entryRef.hash}`
    modal.setTitle(key, await authorName(app.svc(), getSource(props.entryRef.set).codeSet, props.entryRef.prop, state.value.item))
  } catch (e) {
    console.error('[trpg-assistant] 读取条目失败', e)
    state.value = { kind: 'error', message: e instanceof Error ? e.message : String(e) }
    toast.error('读取这一条时出错了')
  }
}
onMounted(() => void load())

/** 摘要行里已经在下面的数值块 / 作者字段里出现过的标签不重复显示。 */
const summaryShown = computed(() => { const seen = new Set([...(block.value?.lines ?? []), ...authorLines.value].map((l) => l.label)); return summary.value.filter((x) => !seen.has(x.k)) })
const block = computed(() => (state.value.kind === 'ok' ? BLOCKS[props.entryRef.prop]?.(state.value.item) ?? null : null))
/** 正文：多数类别在 entries 里；随机表条目本身就是一张表，表组是几张表（作者提取出来的形状）。 */
const body = computed(() => {
  if (state.value.kind !== 'ok') return null
  const it = state.value.item as { entries?: unknown; tables?: unknown } | null
  if (!it) return null
  if (props.entryRef.prop === 'table') return { ...it, type: 'table' }
  if (props.entryRef.prop === 'tableGroup') return it.tables ?? it.entries ?? null
  return it.entries ?? summaryBody.value ?? null
})

async function setEnabled(next: boolean): Promise<void> {
  const owner = campaign.owner?.ownerKey
  if (!owner || !lib.bound) return
  const ks = app.svc().backend.kernelSave
  const cur = await ks.libraryOf(owner)
  await ks.setLibrary(owner, { ...cur, ...chooseEntry(cur, props.entryRef, next) })
  enabled.value = next
  toast.success(next ? '已在本战役启用这一条' : '已在本战役停用这一条')
}
</script>

<template>
  <div class="lib-mbody" data-testid="entry-page">
    <div v-if="state.kind === 'loading'" class="lib-skel" aria-busy="true"><i style="width:55%;height:22px" /><i /><i style="width:90%" /><i style="width:70%" /></div>
    <div v-else-if="state.kind === 'none'" class="lib-state"><h3>库里没有这一条</h3><p class="lib-muted">这一条所在的书还没下载。</p></div>
    <div v-else-if="state.kind === 'error'" class="lib-state"><h3>这一条读不出来</h3><p class="lib-muted">{{ state.message }}</p><button class="trpg-btn trpg-btn--primary" type="button" @click="load">重试</button></div>
    <template v-else>
      <div class="lib-dtools">
        <Segmented :model-value="lang === 'zh' ? 'zh' : 'en'" label="语言" :options="[{ value: 'en', label: 'En', disabled: lang === 'zh' && !other, hint: '另一种语言里没有这一条' }, { value: 'zh', label: '中文', disabled: lang !== 'zh' && !other, hint: '另一种语言里没有这一条' }]" @update:model-value="switchLang" />
        <span class="trpg-switch-wrap"><Switch :model-value="enabled" label="本战役启用这一条" :disabled="!lib.bound" @update:model-value="setEnabled" /><span>本战役启用</span></span>
        <span class="lib-end">
          <button class="trpg-icon-btn" type="button" disabled aria-label="编辑（稍后开放）" title="条目编辑稍后开放"><Icon name="pencil-simple" :size="18" /></button>
          <MoreMenu label="这一条" :items="[{ key: 'save', label: '存入我的库', disabled: true, reason: '稍后开放' }]" />
        </span>
      </div>
      <div class="lib-mscroll">
        <div class="lib-dbody">
          <div v-if="state.kind === 'ok' && state.closed" class="lib-banner"><span>这本书在本战役里是关着的，内容照常可以看。</span></div>
          <div class="lib-srcline">{{ sourceLine || '未知来源' }}</div>
          <EntryVersions v-if="state.kind === 'ok'" :key="`${entryRef.hash}-${state.d?.version.altId ?? ''}`" :detail="state.d" :entry-ref="entryRef" @changed="load" />
          <div v-if="summaryShown.length" class="lib-sumline" data-testid="entry-summary"><span v-for="x in summaryShown" :key="x.k">{{ x.k }} <b>{{ x.v }}</b></span></div>
          <div v-if="(block?.lines.length || authorLines.length) && entryRef.prop !== 'class'" class="lib-stat" data-testid="entry-statblock"><div v-for="l in [...(block?.lines ?? []), ...authorLines]" :key="l.label"><span>{{ l.label }}</span><span>{{ l.value }}</span></div></div>
          <div v-if="block?.abilities.length" class="lib-abil"><div v-for="a in block.abilities" :key="a.key"><small>{{ a.label }}</small><b>{{ a.score }}</b> ({{ a.mod }})</div></div>
          <template v-for="sec in block?.sections ?? []" :key="sec.title"><h3>{{ sec.title }}</h3><EntryBody :block="sec.entries" :code-set="codeSet" /></template>
          <ClassView v-if="entryRef.prop === 'class' && state.kind === 'ok'" :item="state.item" :entry-ref="entryRef" :code-set="codeSet" :author-lines="authorLines" :pb="authorPb" />
          <FeatureLevels v-else-if="entryRef.prop === 'subclass' && state.kind === 'ok'" :levels="byLevel(flattenFeatures((state.item as { subclassFeatures?: unknown }).subclassFeatures))" :code-set="codeSet" :open-upto="3" />
          <EntryBody v-else-if="body" :block="body" :code-set="codeSet" />
          <template v-if="groupBody"><h3>传奇组：{{ groupBody.name }}</h3><EntryBody :block="groupBody.entry" :code-set="codeSet" /></template>
          <p v-else-if="!block?.lines.length && !block?.sections.length" class="lib-muted">这一条没有正文。</p>
          <template v-if="subraces.length">
            <h3>亚种</h3>
            <div v-for="sr in subraces" :key="sr.ref.hash" class="lib-block" data-testid="subrace"><b>{{ sr.name }}</b><EntryBody :block="sr.entries" :code-set="codeSet" /></div>
          </template>
        </div>
      </div>
    </template>
  </div>
</template>
