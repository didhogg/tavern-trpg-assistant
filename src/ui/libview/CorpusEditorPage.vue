<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, provide, ref, shallowRef } from 'vue'
import type { FieldShape } from '../../library/brew-validate'
import type { CorpusDraft } from '../../library/custom-corpus'
import { useAppStore } from '../../stores/app'
import { useModalStore } from '../../stores/modal'
import { useToastStore } from '../../stores/toast'
import Icon from '../kit/Icon.vue'
import Segmented from '../kit/Segmented.vue'
import { askConfirm } from '../kit/confirm'
import EntryForm, { type FormTable } from './EntryForm.vue'
import FieldInput from './FieldInput.vue'
import { CODESET_KEY } from './entry-blocks'
import type { Ent } from './edit-json'
import type { Defs } from './field-shape'
import { plain } from './use-editor'

/**
 * 自制书 / 冒险的编辑页（驾驶员 2026-11-14）：左边「基本信息」= 目录那一类的作者字段表（目录本身不出现，保存时按章节算）；
 * 右边「章节」= 正文那一类的各章：章名 + 正文块编辑（和条目正文同一套控件）。窄屏上下两个标签切换。
 * 存进包走后端 custom.saveCorpus（编号撞了、章没名字由后端拦下）；有作者结构提示时照样存好，列出来、留在这一页接着改。
 */
export interface CorpusSession {
  codeSet: string
  prop: string
  /** 正文那一类（bookData / adventureData）。 */
  body: string
  typeName: string
  pack: { id: string; name: string }
  draft: CorpusDraft
  onSaved?: () => void
  /** 存好后退几页：从「选类型」进来的新建退 2 页回到包，✎ 进来的退 1 页。 */
  back?: number
}
const props = defineProps<{ session: CorpusSession }>()
const app = useAppStore()
const modal = useModalStore()
const toast = useToastStore()
const lib = () => app.svc().backend.library
provide(CODESET_KEY, computed(() => props.session.codeSet))

const head = ref<Ent>(plain(props.session.draft.head) as Ent)
const body = plain(props.session.draft.body) as Ent
const chapters = ref<Ent[]>((Array.isArray(body.data) ? body.data : []) as Ent[])
const was = ref<string | undefined>(props.session.draft.was)
const saved = ref(!!props.session.draft.was)
const snapshot = () => JSON.stringify([head.value, chapters.value])
let clean = snapshot()

const table = shallowRef<FormTable | null>(null)
const chapterShape = shallowRef<FieldShape | null>(null)
const defs = shallowRef<Defs>({})
const failed = ref<string | null>(null)
async function load(): Promise<void> {
  failed.value = null
  try {
    const c = lib().custom
    const [t, plan, b] = await Promise.all([c.fields(props.session.codeSet, props.session.prop), c.formPlan(props.session.codeSet, props.session.prop).catch((e: unknown) => { console.warn('[trpg-assistant] 表单安排没读到，按字段表画', e); return null }), c.fields(props.session.codeSet, props.session.body)])
    const data = b?.fields.find((f) => f.name === 'data')?.shape
    if (!t || !b || !data) throw new Error(`这套资料不收这一类：${props.session.typeName}`)
    // 目录（contents）保存时按章节算，不在表单里
    table.value = { ...t, fields: t.fields.filter((f) => f.name !== 'contents'), plan }
    defs.value = b.defs
    chapterShape.value = data
  } catch (e) { console.error('[trpg-assistant] 书的编辑页没打开', e); failed.value = e instanceof Error ? e.message : String(e) }
}

const root = ref<HTMLElement | null>(null)
const wide = ref(true)
const view = ref<'info' | 'chapters'>('info')
let ro: ResizeObserver | null = null
onMounted(() => { void load(); if (root.value) { ro = new ResizeObserver(([e]) => { wide.value = e.contentRect.width >= 600 }); ro.observe(root.value) } })
onBeforeUnmount(() => ro?.disconnect())

const setChapter = (i: number, patch: Ent) => { const next = [...chapters.value]; next[i] = { ...next[i], ...patch }; chapters.value = next }
const move = (i: number, by: -1 | 1) => { const next = [...chapters.value]; const [c] = next.splice(i, 1); next.splice(i + by, 0, c); chapters.value = next }
async function removeChapter(i: number): Promise<void> {
  const c = chapters.value[i]
  const hasText = Array.isArray(c.entries) && c.entries.length > 0
  if (hasText && !(await askConfirm({ title: `删掉「${String(c.name ?? '') || `第 ${i + 1} 章`}」？`, message: '这一章的正文会一起删掉。', confirmLabel: '删掉', cancelLabel: '先不了', danger: true }))) return
  chapters.value = chapters.value.filter((_, j) => j !== i)
}
const addChapter = () => { chapters.value = [...chapters.value, { type: 'section', name: '', entries: [] }]; view.value = 'chapters' }

const saving = ref(false)
const error = ref<string | null>(null)
const issues = ref<string[]>([])
const title = computed(() => String(head.value.name ?? '') || `新${props.session.typeName}`)
async function done(): Promise<void> {
  saving.value = true
  error.value = null
  try {
    const draft: CorpusDraft = { head: plain(head.value) as Ent, body: { ...body, data: plain(chapters.value) }, ...(was.value ? { was: was.value } : {}) }
    const r = await lib().custom.saveCorpus(props.session.codeSet, props.session.prop, draft, { pack: props.session.pack.id })
    // 存好了：之后再存就是改这一本
    head.value = { ...head.value, uniqueId: r.head.uniqueId }
    body.uniqueId = r.body.uniqueId
    was.value = String(head.value.id)
    saved.value = true
    clean = snapshot()
    props.session.onSaved?.()
    issues.value = [...r.head.issues, ...r.body.issues].map((i) => `${i.path || '整条'}：${i.text}`)
    if (issues.value.length) return
    toast.success(`已保存「${title.value}」，整理完就出现在包的「书」里`)
    for (let i = 0; i < (props.session.back ?? 1); i++) modal.pop()
  } catch (e) { console.error('[trpg-assistant] 书没存上', e); error.value = e instanceof Error ? e.message : String(e) } finally { saving.value = false }
}
async function cancel(): Promise<void> {
  if (snapshot() !== clean && !(await askConfirm({ title: '不保存就关掉？', message: '这次的改动会丢掉。', confirmLabel: '丢掉改动', cancelLabel: '接着改', danger: true }))) return
  modal.pop()
}
</script>

<template>
  <div ref="root" class="lib-mbody lib-editor" data-testid="corpus-editor">
    <div class="lib-etop">
      <span class="trpg-badge">{{ session.typeName }}</span>
      <span>在 <b>{{ session.pack.name }}</b></span>
      <span class="lib-end lib-faint">目录按章节自动生成</span>
    </div>
    <div v-if="failed" class="lib-pad"><div class="lib-banner lib-banner--err"><span>编辑页没打开：{{ failed }}</span><button class="trpg-btn trpg-btn--small lib-end" type="button" @click="load">重试</button></div></div>
    <div v-else-if="!table || !chapterShape" class="lib-pad"><div class="lib-skel" aria-busy="true"><i /><i style="width:80%" /><i style="width:60%" /></div></div>
    <div v-else :class="wide ? 'lib-split' : 'lib-vsplit'">
      <div v-if="!wide" class="lib-pane__head"><Segmented v-model="view" label="看哪一栏" :options="[{ value: 'info', label: '基本信息' }, { value: 'chapters', label: `章节（${chapters.length}）` }]" /></div>
      <section v-show="wide || view === 'info'" class="lib-pane" data-testid="corpus-info">
        <div v-if="wide" class="lib-pane__head"><b>基本信息</b></div>
        <div class="lib-pane__body"><EntryForm :table="table" :ent="head" :code-set="session.codeSet" @update="(e) => (head = e)" /></div>
      </section>
      <section v-show="wide || view === 'chapters'" class="lib-pane lib-pane--side" data-testid="corpus-chapters">
        <div v-if="wide" class="lib-pane__head"><b>章节（{{ chapters.length }}）</b></div>
        <div class="lib-pane__body">
          <p v-if="!chapters.length" class="lib-muted">还没有章节。每一章有一个章名和自己的正文；章里有名字的小节会自动列进目录。</p>
          <div v-for="(c, i) in chapters" :key="i" class="lib-chapter" data-testid="corpus-chapter">
            <div class="lib-chapter__head">
              <input class="trpg-input" type="text" :value="String(c.name ?? '')" :placeholder="`第 ${i + 1} 章的章名`" :aria-label="`第 ${i + 1} 章的章名`" data-testid="chapter-name" @input="setChapter(i, { name: ($event.target as HTMLInputElement).value })" />
              <button class="trpg-icon-btn" type="button" :disabled="i === 0" :aria-label="`第 ${i + 1} 章上移`" @click="move(i, -1)"><Icon name="arrow-up" :size="16" /></button>
              <button class="trpg-icon-btn" type="button" :disabled="i === chapters.length - 1" :aria-label="`第 ${i + 1} 章下移`" @click="move(i, 1)"><Icon name="arrow-down" :size="16" /></button>
              <button class="trpg-icon-btn" type="button" :aria-label="`删掉第 ${i + 1} 章`" data-testid="chapter-remove" @click="removeChapter(i)"><Icon name="x" :size="16" /></button>
            </div>
            <FieldInput :shape="chapterShape" :value="c.entries ?? []" :defs="defs" :labels="{ entries: '正文' }" name="entries" :path="`data[].entries`" @update="(v: unknown) => setChapter(i, { entries: v ?? [] })" />
          </div>
          <button class="trpg-btn trpg-btn--small" type="button" data-testid="chapter-add" @click="addChapter"><Icon name="plus" :size="14" />加一章</button>
        </div>
      </section>
    </div>
    <div v-if="error" class="lib-pad"><div class="lib-banner lib-banner--err" role="alert" data-testid="corpus-error"><span>没存上：{{ error }}</span></div></div>
    <div v-if="issues.length" class="lib-pad"><div class="lib-banner lib-banner--warn" data-testid="corpus-issues"><span>已经存好，作者结构检查有 {{ issues.length }} 处提示，改好再点［完成］：{{ issues.slice(0, 3).join('；') }}</span></div></div>
    <div class="lib-ebar">
      <span class="lib-src">{{ saved ? '已存进包' : '还没存' }}</span>
      <span class="lib-end">
        <button class="trpg-btn" type="button" @click="cancel">{{ saved && snapshot() === clean ? '关闭' : '取消' }}</button>
        <button class="trpg-btn trpg-btn--primary" type="button" :disabled="!table || saving" data-testid="corpus-done" @click="done">{{ saving ? '正在存…' : '完成' }}</button>
      </span>
    </div>
  </div>
</template>
