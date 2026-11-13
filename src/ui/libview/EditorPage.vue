<script setup lang="ts">
import { computed, markRaw, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useAppStore } from '../../stores/app'
import { useLibViewStore } from '../../stores/libview'
import { useModalStore } from '../../stores/modal'
import { useToastStore } from '../../stores/toast'
import { askConfirm } from '../kit/confirm'
import Icon from '../kit/Icon.vue'
import Segmented from '../kit/Segmented.vue'
import type { EditSession } from './edit-flow'
import EmbeddedEntity from './EmbeddedEntity.vue'
import EntryForm from './EntryForm.vue'
import FillPage from './FillPage.vue'
import JsonBox from './JsonBox.vue'
import { langName, plain, useEditor } from './use-editor'

/**
 * P5.5 u7-10 编辑器（驾驶员 2026-11-13 第二版）：宽屏左栏 = 主编辑语言的表单，右侧栏 = ［另一语言 | JSON | 预览］一次一种，
 * 另一语言和 JSON 能直接改、预览只能看；窄屏上半栏是另一语言 / JSON / 预览（能收起、能拖高度），下半栏是表单。
 * 每栏只写自己的语言；中文条目的英文名存的时候由后端按英文那一条自动写（bilingual.saveBoth）。
 */
const props = defineProps<{ session: EditSession }>()
const app = useAppStore()
const lib = useLibViewStore()
const modal = useModalStore()
const toast = useToastStore()
const ed = useEditor(() => app.svc(), props.session)
const loaded = ref(false)
const failed = ref<string | null>(null)
onMounted(() => ed.ready.then(() => { loaded.value = true }, (e: unknown) => { failed.value = e instanceof Error ? e.message : String(e) }))

// 宽窄：看编辑器自己有多宽（弹窗在不同窗口里大小不一样）
const root = ref<HTMLElement | null>(null)
const wide = ref(true)
let ro: ResizeObserver | null = null
onMounted(() => { if (root.value) { ro = new ResizeObserver(([e]) => { wide.value = e.contentRect.width >= 600 }); ro.observe(root.value) } })
onBeforeUnmount(() => ro?.disconnect())

const L = computed(() => ed.left.value)
const R = computed(() => ed.right.value)
const tab = ref('other')
const tabs = computed(() => [{ value: 'other', label: langName(ed.cs[R.value]) }, { value: 'json', label: 'JSON' }, { value: 'preview', label: '预览' }])
const formKey = ref(0)
function swap(): void { ed.left.value = R.value; formKey.value++ }
// 预览跟着左栏，停手半秒再画（作者渲染不必每个字都画一次）
const previewItem = ref<unknown>(ed.ents.main.value)
let pt: ReturnType<typeof setTimeout> | null = null
watch(() => ed.ents[L.value].value, (e) => { if (pt) clearTimeout(pt); pt = setTimeout(() => { previewItem.value = e ? structuredClone(e) : null }, 500) })
const topOpen = ref(true)
const topH = ref(260)
function drag(e: PointerEvent): void {
  const y0 = e.clientY, h0 = topH.value
  const move = (m: PointerEvent) => { topH.value = Math.max(120, Math.min(600, h0 + m.clientY - y0)) }
  const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up) }
  window.addEventListener('pointermove', move)
  window.addEventListener('pointerup', up)
}
const showJson = () => { tab.value = 'json'; topOpen.value = true }

// 从左栏那一种语言填入右栏空着的（u7-10c）
const labelOf = (side: 'main' | 'other') => (f: string) => ed.tables[side].value?.fields.find((x) => x.name === f)?.label ?? ed.tables[side].value?.labels[f] ?? f
function openFill(): void {
  const cur = ed.ents[R.value].value ? plain(ed.ents[R.value].value!) : null, from = ed.ents[L.value].value ? plain(ed.ents[L.value].value!) : null
  if (!cur || !from) return
  const bi = app.svc().backend.library.bilingual
  const plan = bi.fillPlan(ed.cs[R.value], cur, from)
  modal.push({ key: 'fill', title: `从${langName(ed.cs[L.value])}版填入`, component: markRaw(FillPage), variant: 'sheet', props: {
    from: `${langName(ed.cs[L.value])}版`, to: langName(ed.cs[R.value]), plan, labelOf: labelOf(R.value),
    onPick: (mode: 'onlyEmpty' | 'all') => {
      const before = cur
      ed.setEnt(R.value, bi.fill(ed.cs[R.value], cur, from, mode)); formKey.value++; tab.value = 'other'
      const n = plan[mode].length
      toast.push('success', `已填入 ${n} 项`, { undo: () => { ed.setEnt(R.value, before); formKey.value++ } })
    },
  } })
}

const title = computed(() => String(ed.ents.main.value.name ?? '') || props.session.typeName)
watch(title, (t) => { if (modal.top?.component && modal.top.props?.session === props.session) modal.setTitle(modal.top.key, t) })
const draftText = computed(() => (ed.draftAt.value ? `草稿已自动存 · ${new Date(ed.draftAt.value).toTimeString().slice(0, 5)}` : ed.dirty.value ? '改动会自动存成草稿' : ''))

async function undo(): Promise<void> {
  if (props.session.target.kind !== 'mine') return
  try {
    await app.svc().backend.library.custom.undo(ed.cs.main, props.session.prop, props.session.target.uniqueId)
    const got = props.session.pack ? await app.svc().backend.library.custom.packEntry(ed.cs.main, props.session.pack.id, props.session.prop, { uniqueId: props.session.target.uniqueId }) : null
    if (got?.entity) { ed.ents.main.value = got.entity; formKey.value++ }
    await ed.loadUndo()
    toast.success('已撤销一步')
  } catch (e) { console.error('[trpg-assistant] 撤销失败', e); toast.error(e instanceof Error ? e.message : '撤销没有成功') }
}
async function cancel(): Promise<void> {
  if (ed.dirty.value && !(await askConfirm({ title: '放弃修改？', message: '还有没保存的改动。草稿会留着，之后可以在我的库顶上 [继续]。', confirmLabel: '放弃', cancelLabel: '继续改', danger: true }))) return
  modal.pop()
}
const saving = ref(false)
async function done(): Promise<void> {
  const pack = props.session.pack
  if (!pack) { toast.error('不知道存进哪个包'); return }
  saving.value = true
  try {
    await app.svc().backend.library.bilingual.saveBoth(pack.id, props.session.prop, ed.sides(), lib.campaignLib?.rule ? { rule: lib.campaignLib.rule } : {})
    await ed.dropDraft()
    toast.success(`已保存「${title.value}」`)
    await lib.loadPairs(app.svc())
    modal.popToRoot()
  } catch (e) { console.error('[trpg-assistant] 保存失败', e); toast.error(`保存没有成功：${e instanceof Error ? e.message : String(e)}。编辑器里的内容还在。`) } finally { saving.value = false }
}
</script>

<template>
  <div ref="root" class="lib-mbody lib-editor" data-testid="editor">
    <div class="lib-etop">
      <span class="trpg-badge">{{ session.typeName }}</span>
      <span v-if="session.pack">在 <b>{{ session.pack.name }}</b></span>
      <span class="lib-end">
        <button v-if="session.target.kind === 'mine'" class="trpg-btn trpg-btn--small" type="button" :disabled="!ed.undoLeft.value" data-testid="editor-undo" @click="undo"><Icon name="arrow-counter-clockwise" :size="14" />{{ wide ? `撤销（还剩 ${ed.undoLeft.value} 步）` : `撤销 ${ed.undoLeft.value}` }}</button>
        <button v-if="wide" class="trpg-btn trpg-btn--small" type="button" data-testid="editor-swap" @click="swap">⇄ 左右对调</button>
      </span>
    </div>
    <div v-if="failed" class="lib-pad"><div class="lib-banner lib-banner--err"><span>编辑器没打开：{{ failed }}</span></div></div>
    <div v-else-if="!loaded || !ed.tables.main.value" class="lib-pad"><div class="lib-skel" aria-busy="true"><i /><i style="width:80%" /><i style="width:60%" /></div></div>
    <div v-else :class="wide ? 'lib-split' : 'lib-vsplit'">
      <section v-if="!wide && !topOpen" class="lib-pane__head lib-pane--side lib-pane--bar"><Segmented v-model="tab" label="上半栏" :options="tabs" @update:model-value="topOpen = true" /><button class="trpg-btn trpg-btn--small trpg-btn--quiet lib-end" type="button" @click="topOpen = true">展开</button></section>
      <section :class="['lib-pane', wide ? '' : 'lib-pane--left']" :style="wide ? { order: 0 } : { order: 2 }" data-testid="editor-main">
        <div class="lib-pane__head"><b>{{ langName(ed.cs[L]) }}</b></div>
        <div class="lib-pane__body"><EntryForm :key="`L${formKey}${L}`" :table="ed.tables[L].value ?? ed.tables.main.value" :ent="ed.ents[L].value ?? {}" :detailed="session.detailed" :marks="ed.marks.value" :raw-names="ed.cs[L] === 'en'" @update="(e) => ed.setEnt(L, e)" @json="showJson" /></div>
      </section>
      <div v-if="!wide && topOpen" class="lib-grip" role="separator" aria-label="拖动调上半栏高度" :style="{ order: 1 }" @pointerdown.prevent="drag"><i /></div>
      <section v-if="wide || topOpen" class="lib-pane lib-pane--side" :style="wide ? { order: 1 } : { order: 0, flex: `0 0 ${topH}px` }" data-testid="editor-side">
        <div class="lib-pane__head"><Segmented v-model="tab" label="右栏" :options="tabs" /><span class="lib-end lib-faint">{{ tab === 'other' ? (ed.otherState.value === 'none' ? '还没有这一条：写了就一起存' : '') : tab === 'json' ? `${langName(ed.cs[L])}这一条 · 和表单同步` : '只能看' }}</span><button v-if="!wide" class="trpg-btn trpg-btn--small trpg-btn--quiet" type="button" @click="topOpen = false">收起</button></div>
        <div class="lib-pane__body">
          <template v-if="tab === 'other'">
            <div v-if="ed.otherState.value === 'loading'" class="lib-skel" aria-busy="true"><i /><i style="width:70%" /></div>
            <p v-else-if="ed.otherState.value === 'ambiguous'" class="lib-muted">{{ langName(ed.cs[R]) }}那套里有好几条对得上，没法确定是哪一条；这次先不改另一种语言。</p>
            <p v-else-if="ed.otherState.value === 'error'" class="lib-muted">另一种语言这次没读出来；这次先只改{{ langName(ed.cs[L]) }}。</p>
            <EntryForm v-else-if="ed.tables[R].value && ed.ents[R].value" :key="`R${formKey}${R}`" :table="ed.tables[R].value!" :ent="ed.ents[R].value!" :detailed="session.detailed" :marks="ed.marks.value" :raw-names="ed.cs[R] === 'en'" @update="(e) => ed.setEnt(R, e)" @json="showJson" />
          </template>
          <template v-else-if="tab === 'json'">
            <JsonBox :model-value="ed.jsonText.value" :issues="ed.jsonIssues.value" :keys="ed.tables[L].value?.fields.map((f) => f.name) ?? []" :label="`${langName(ed.cs[L])}这一条的 JSON`" @update:model-value="ed.onJson" />
            <div v-for="(i, n) in ed.jsonIssues.value.slice(0, 3)" :key="n" class="lib-banner lib-banner--err" style="margin-top: 6px"><span>第 {{ i.line }} 行：{{ i.text }}。改好之前表单那边先不跟着变。</span></div>
          </template>
          <EmbeddedEntity v-else :prop="session.prop" :item="previewItem" :code-set="ed.cs[L]" />
        </div>
      </section>
    </div>
    <div class="lib-ebar">
      <span class="lib-src" data-testid="editor-draft">{{ draftText }}</span>
      <span class="lib-end">
        <button v-if="wide" class="trpg-btn trpg-btn--small trpg-btn--quiet" type="button" :disabled="!loaded || ed.otherState.value === 'ambiguous'" data-testid="editor-fill" @click="openFill">从{{ langName(ed.cs[L]) }}版填入空着的…</button>
        <button class="trpg-btn" type="button" @click="cancel">取消</button>
        <button class="trpg-btn trpg-btn--primary" type="button" :disabled="!loaded || saving" data-testid="editor-done" @click="done">{{ saving ? '正在存…' : '完成' }}</button>
      </span>
    </div>
  </div>
</template>
