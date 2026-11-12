<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from 'vue'
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from 'reka-ui'
import { chooseEntry, type EntryRef, type EntrySelection } from '../../library/scopes'
import type { ScopedDetail } from '../../library/scoped'
import type { AuthorLine } from '../../library/runtime/frame/field-commands'
import { getSource } from '../../library/sources'
import { useAppStore } from '../../stores/app'
import { useCampaignStore } from '../../stores/campaign'
import { useLibViewStore } from '../../stores/libview'
import { useModalStore } from '../../stores/modal'
import { useToastStore } from '../../stores/toast'
import Icon from '../kit/Icon.vue'
import MoreMenu from '../kit/MoreMenu.vue'
import Switch from '../kit/Switch.vue'
import ClassView from './ClassView.vue'
import { byLevel, flattenFeatures } from './class-data'
import EntryBody from './EntryBody.vue'
import EntryVersions from './EntryVersions.vue'
import MissingEntry from './MissingEntry.vue'
import ReinstallBlock from './ReinstallBlock.vue'
import { ownerByPack, ownerFromOpenPack } from './reinstall'
import FeatureLevels from './FeatureLevels.vue'
import { authorName, nameOf as itemName } from './pack-data'
import { BLOCKS } from './statblock'
import { entryPageKey, useEntryLangStore } from '../../stores/entrylang'
import EntryAssociations from './EntryAssociations.vue'
import ImageBlock from './ImageBlock.vue'
import InlineText from './InlineText.vue'
import AuthorFragment from './author-fragment'
import { entriesOf, imagesOf } from './entry-content'

/** 条目详情壳（U1b）：弹窗里的一页。在 sheet 弹窗里前进；‹ 返回由宿主给。 */
const props = defineProps<{ entryRef: EntryRef; selection?: EntrySelection; pageKey?: string }>()
const app = useAppStore()
const lib = useLibViewStore()
const campaign = useCampaignStore()
const modal = useModalStore()
const toast = useToastStore()

type State = { kind: 'loading' } | { kind: 'ok'; d: ScopedDetail } | { kind: 'none' } | { kind: 'error'; message: string }
const state = shallowRef<State>({ kind: 'loading' })
const detail = computed(() => state.value.kind === 'ok' ? state.value.d : null)
const tab = ref('body')
const tabs = [['body', '正文'], ['background', '背景'], ['images', '图片'], ['related', '关联']] as const
const enabled = ref(true)
/** 中 / En 切换：只是同一个来源的另一种语言版本（作者的配对）；对不上就灰掉。 */
const langs = useEntryLangStore()
// 后端给的「为什么没有另一种语言」→ 标题栏切换按钮的悬停说明
const WHY: Record<string, string> = {
  'not-installed': '另一种语言的资料还没装', 'not-paired': '作者没给这一条配另一种语言', 'not-found': '另一种语言里找不到这一条',
  'pack-unpaired': '这个包没有配对的另一种语言包', 'structure-differs': '两种语言的包结构不一样，对不上', 'no-english-name': '这条自制条目没写英文名（ENG_name），对不上',
  'no-counterpart': '另一种语言里没有这一条', 'not-official': '另一种语言里没有这一条',
}
async function loadCounterpart(d: ScopedDetail): Promise<void> {
  langs.set(props.entryRef, { other: null, reason: null, loading: true }, props.selection)
  try {
    const cp = await app.svc().backend.library.counterparts.counterpart(d.ref, { docIdLocal: d.docIdLocal })
    langs.set(props.entryRef, { other: cp.status === 'found' ? cp.refs[0] : null, reason: cp.status === 'ambiguous' ? '另一种语言里有好几条对得上，没法确定是哪一条' : cp.reason ? WHY[cp.reason] ?? '另一种语言里没有这一条' : null, loading: false }, props.selection)
  } catch (e) {
    console.error('[trpg-assistant] 读取另一种语言失败', e)
    langs.set(props.entryRef, { other: null, reason: '这次没查出另一种语言（出错了，重新打开这一条再试）', loading: false }, props.selection)
  }
}
const codeSet = computed(() => getSource(props.entryRef.set).codeSet)
const sourceLine = ref('')
/** 摘要行：作者列表页每列的显示值（环阶、时间、学派…，B-35），名称与来源列不重复显示；没有列表定义的类别没有摘要行。 */
const summary = ref<Array<{ k: string; v: string }>>([])
/** 种族页：亚种直接全部列出（R94）；亚种在作者数据里是带 raceName 的独立条目。 */
/** 作者函数翻译的摘要行（法术的成分 / 持续时间、神祇的阵营、职业的熟练…，B-36）与职业每级熟练加值。 */
const authorLines = shallowRef<AuthorLine[]>([])
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
      const at = m.hash ? await s.scoped.locate({ ...lib.campaignLib, codeSet: codeSet.value }, 'legendaryGroup', m.hash) : null
      const stored = at ? await s.scoped.storedItem(at.ref) : null
      const entry = stored ? await frame.call('summaryEntry', 'legendaryGroup', JSON.parse(JSON.stringify(stored.item))) : null
      if (entry) groupBody.value = { name: lg.name, entry }
    }
    const lc = await s.sorting.cells(codeSet.value, props.entryRef.prop)
    const row = lc?.cells[props.entryRef.hash]
    if (lc && row) summary.value = lc.columns.flatMap((c, i) => {
      if (c.sort === 'name' || c.sort === 'source' || !row[i]) return []
      if (c.sort === 'concentration') return [{ k: c.title ?? c.text, v: codeSet.value === 'cn' ? '需要' : 'Required' }]
      return [{ k: c.text, v: row[i] }]
    })
    const c = lib.campaignLib
    const me = item as { name?: string; source?: string; raceName?: string } | null
    if (props.entryRef.prop === 'race' && c && me && !me.raceName) {
      const all = await s.scoped.query({ ...c, codeSet: codeSet.value }, 'race', { source: me.source, mode: 'browse', packDocIdLocal: detail.value?.docIdLocal })
      subraces.value = all.filter((r) => {
        const race = r.item as { raceName?: string; raceSource?: string }
        return race.raceName === me.name && (race.raceSource ?? r.source) === me.source
      }).map((r) => ({ name: itemName(r.item), entries: (r.item as { entries?: unknown }).entries ?? null, ref: r.ref }))
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
    const d = await s.backend.library.scoped.detail(c, props.entryRef, { browse: true, selection: props.selection })
    if (!d || 'hidden' in d) {
      state.value = { kind: 'none' }
      return
    }
    sourceLine.value = ''
    state.value = { kind: 'ok', d }
    enabled.value = !d.closed
    void loadExtras(d.item)
    void loadCounterpart(d)
    sourceLine.value = await sourceText(d.item, d.source)
    modal.setTitle(props.pageKey ?? entryPageKey(props.entryRef, props.selection), await authorName(app.svc(), codeSet.value, props.entryRef.prop, d.item))
  } catch (e) {
    console.error('[trpg-assistant] 读取条目失败', e)
    state.value = { kind: 'error', message: e instanceof Error ? e.message : String(e) }
    toast.error('读取这一条时出错了')
  }
}
onMounted(() => void load())

/** 摘要行里已经在下面的数值块 / 作者字段里出现过的标签不重复显示。 */
const summaryShown = computed(() => { const seen = new Set([...(block.value?.lines ?? []), ...authorLines.value].map((l) => l.label)); return summary.value.filter((x) => !seen.has(x.k)) })
const block = computed(() => detail.value ? BLOCKS[props.entryRef.prop]?.(detail.value.item) ?? null : null)
const body = computed(() => entriesOf(props.entryRef.prop, detail.value?.item) ?? summaryBody.value)
// 缺数据时这一条归哪个包（自制按包编号；从包列表点进来的按栈底的包），给【重新下载这个包】（P5-5 §11.2）
const packOwner = computed(() => (props.selection && 'docIdLocal' in props.selection ? ownerByPack(props.selection.docIdLocal) : null) ?? ownerFromOpenPack(props.pageKey))
const fluff = computed(() => detail.value?.fluff as { entries?: unknown[]; images?: unknown[] } | null)
const images = computed(() => imagesOf([fluff.value?.images, fluff.value?.entries, body.value, block.value?.sections.map((s) => s.entries)]))

async function setEnabled(next: boolean): Promise<void> {
  const owner = campaign.owner?.ownerKey
  if (!owner || !lib.bound) return
  const ks = app.svc().backend.kernelSave
  const cur = await ks.libraryOf(owner)
  await ks.setLibrary(owner, { ...cur, ...chooseEntry(cur, detail.value?.ref ?? props.entryRef, next) })
  enabled.value = next
  toast.success(next ? '已在本战役启用这一条' : '已在本战役停用这一条')
}
</script>

<template>
  <div class="lib-mbody" data-testid="entry-page">
    <div v-if="state.kind === 'loading'" class="lib-skel" aria-busy="true"><i style="width:55%;height:22px" /><i /><i style="width:90%" /><i style="width:70%" /></div>
    <ReinstallBlock v-else-if="state.kind === 'none' && packOwner" :owner="packOwner" title="这个包里缺了这一条" @done="load" />
    <MissingEntry v-else-if="state.kind === 'none'" :entry-ref="entryRef" @retry="load" />
    <ReinstallBlock v-else-if="state.kind === 'error' && packOwner" :owner="packOwner" title="这一条读不出来" :detail="state.message" @done="load" />
    <div v-else-if="state.kind === 'error'" class="lib-state"><h3>这一条读不出来</h3><p class="lib-muted">{{ state.message }}</p><button class="trpg-btn trpg-btn--primary" type="button" @click="load">重试</button></div>
    <template v-else>
      <div class="lib-dtools">
        <span class="trpg-switch-wrap"><Switch :model-value="enabled" label="本战役启用这一条" :disabled="!lib.bound" @update:model-value="setEnabled" /><span>本战役启用</span></span>
        <span class="lib-end">
          <button class="trpg-icon-btn" type="button" disabled aria-label="编辑（稍后开放）" title="条目编辑稍后开放"><Icon name="pencil-simple" :size="18" /></button>
          <MoreMenu label="这一条" :items="[{ key: 'save', label: '存入我的库', disabled: true, reason: '稍后开放' }]" />
        </span>
      </div>
      <TabsRoot v-model="tab" class="lib-entrytabs">
        <TabsList class="lib-pills lib-entrytabs__list" aria-label="条目内容">
          <TabsTrigger v-for="[value, label] in tabs" :key="value" :value="value" class="trpg-pill">{{ label }}</TabsTrigger>
        </TabsList>
        <TabsContent value="body" class="lib-mscroll">
          <div class="lib-dbody">
            <div v-if="state.d.closed" class="lib-banner"><span>这本书在本战役里是关着的，内容照常可以看。</span></div>
            <div class="lib-srcline">{{ sourceLine || '未知来源' }}</div>
            <EntryVersions :key="`${entryRef.hash}-${state.d.version.altId}`" :detail="state.d" :entry-ref="state.d.ref" :preview-copy="!!selection" @changed="load" />
            <div v-if="summaryShown.length" class="lib-sumline" data-testid="entry-summary"><span v-for="x in summaryShown" :key="x.k">{{ x.k }} <b>{{ x.v }}</b></span></div>
            <div v-if="(block?.lines.length || authorLines.length) && entryRef.prop !== 'class'" class="lib-stat" data-testid="entry-statblock">
              <div v-for="l in [...(block?.lines ?? []), ...authorLines]" :key="l.label">
                <span>{{ l.label }}</span><span><AuthorFragment v-if="'markup' in l && l.markup" :markup="l.markup" :code-set="codeSet" inline /><InlineText v-else :text="l.value" :code-set="codeSet" /></span>
              </div>
            </div>
            <div v-if="block?.abilities.length" class="lib-abil"><div v-for="a in block.abilities" :key="a.key"><small>{{ a.label }}</small><b>{{ a.score }}</b> ({{ a.mod }})</div></div>
            <template v-for="sec in block?.sections ?? []" :key="sec.title"><h3>{{ sec.title }}</h3><EntryBody :block="sec.entries" :code-set="codeSet" /></template>
            <ClassView v-if="entryRef.prop === 'class'" :item="state.d.item" :entry-ref="state.d.ref" :code-set="codeSet" :doc-id-local="state.d.docIdLocal" :author-lines="authorLines" :pb="authorPb" />
            <FeatureLevels v-else-if="entryRef.prop === 'subclass'" :levels="byLevel(flattenFeatures((state.d.item as { subclassFeatures?: unknown }).subclassFeatures))" :code-set="codeSet" :open-upto="3" />
            <EntryBody v-else-if="body" :block="body" :code-set="codeSet" />
            <template v-if="groupBody"><h3>传奇组：{{ groupBody.name }}</h3><EntryBody :block="groupBody.entry" :code-set="codeSet" /></template>
            <p v-else-if="!body && !block?.lines.length && !block?.sections.length && !['class', 'subclass'].includes(entryRef.prop)" class="lib-muted">这一条没有正文。</p>
            <template v-if="subraces.length">
              <h3>亚种</h3>
              <div v-for="sr in subraces" :key="sr.ref.hash" class="lib-block" data-testid="subrace"><b>{{ sr.name }}</b><EntryBody :block="sr.entries" :code-set="codeSet" /></div>
            </template>
          </div>
        </TabsContent>
        <TabsContent value="background" class="lib-mscroll">
          <div class="lib-dbody">
            <p v-if="state.d.fluffError" class="lib-banner lib-banner--warn">这次没能读取背景。<button class="trpg-btn trpg-btn--small" type="button" @click="load">重试</button></p>
            <EntryBody v-else-if="fluff?.entries?.length" :block="fluff.entries" :code-set="codeSet" />
            <p v-else class="lib-muted">这份资料没有单独的背景说明。</p>
          </div>
        </TabsContent>
        <TabsContent value="images" class="lib-mscroll">
          <div class="lib-dbody">
            <div v-if="images.length" class="lib-gallery"><ImageBlock v-for="(image, i) in images" :key="i" :block="image" :code-set="codeSet" /></div>
            <p v-else-if="state.d.fluffError" class="lib-banner lib-banner--warn">这次没能读取配图。<button class="trpg-btn trpg-btn--small" type="button" @click="load">重试</button></p>
            <p v-else class="lib-muted">这份资料没有配图。</p>
          </div>
        </TabsContent>
        <TabsContent value="related" class="lib-mscroll">
          <div class="lib-dbody">
            <EntryAssociations v-if="tab === 'related'" :detail="state.d" :code-set="codeSet" />
          </div>
        </TabsContent>
      </TabsRoot>
    </template>
  </div>
</template>
