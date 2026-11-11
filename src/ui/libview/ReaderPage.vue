<script setup lang="ts">
import { computed, nextTick, onMounted, ref, shallowRef, watch } from 'vue'
import { getSource } from '../../library/sources'
import { useAppStore } from '../../stores/app'
import { useDownloadsStore } from '../../stores/downloads'
import { useToastStore } from '../../stores/toast'
import { useModalStore } from '../../stores/modal'
import Icon from '../kit/Icon.vue'
import EntryBody from './EntryBody.vue'
import { headingKey, headingText, readerChapters } from './reader-content'
import type { ReaderPart, ReaderTarget } from './open'

/** 书 / 冒险阅读器（U9h）：弹窗里的一页。章节目录宽屏在左侧、窄屏是点【目录】展开的列表；正文用和条目同一套渲染器。冒险没下载时先下载。 */
const props = defineProps<ReaderTarget & { readerKey?: string }>()
const app = useAppStore()
const dl = useDownloadsStore()
const toast = useToastStore()
const modal = useModalStore()

type State = { kind: 'loading' } | { kind: 'ok'; chapters: ReturnType<typeof readerChapters> } | { kind: 'missing' } | { kind: 'error'; message: string }
const state = shallowRef<State>({ kind: 'loading' })
const cur = ref(0)
const tocOpen = ref(false)
const body = ref<HTMLElement | null>(null)
const selected = ref<ReaderPart | null>(null)
const unavailable = ref('')
const codeSet = computed(() => getSource(props.set).codeSet)

async function load(): Promise<void> {
  state.value = { kind: 'loading' }
  try {
    const library = app.svc().backend.library
    // 规则速查等文档（documents）与书同一个阅读页：章节 → 小节
    let data: unknown[] | undefined
    let meta: { name?: string; contents?: Parameters<typeof readerChapters>[1] } | undefined
    if (props.prop === 'document') data = (await library.documents.get(getSource(props.set), props.id)).data
    else {
      const corpus = await library.service.corpus(props.set, props.prop, props.id) as Record<string, { data?: unknown[]; name?: string; contents?: Parameters<typeof readerChapters>[1] } | undefined>
      data = corpus[`${props.prop}Data`]?.data
      meta = corpus[props.prop]
    }
    if (!Array.isArray(data)) { state.value = { kind: 'error', message: '这本书没有正文' }; return }
    if (meta?.name && props.readerKey) modal.setTitle(props.readerKey, meta.name)
    state.value = { kind: 'ok', chapters: readerChapters(data, meta?.contents) }
    await go(props.part?.chapter ?? 0, props.part?.section, props.part?.ixNamedSection)
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    // 冒险正文按本下载：没有全文 = 还没下载
    if (props.prop === 'adventure' && /没有这本的全文/.test(message)) state.value = { kind: 'missing' }
    else { console.error('[trpg-assistant] 读取书失败', e); state.value = { kind: 'error', message }; toast.error('读取这本书失败') }
  }
}
onMounted(() => void load())
watch(() => dl.justDone, (done) => { if (done && state.value.kind === 'missing') void load() })

const task = computed(() => dl.items.find((i) => i.label === `冒险《${props.name}》`) ?? null)
function download(): void {
  dl.rememberName(props.set, props.id, props.name)
  app.svc().backend.library.tasks.startAdventure(props.set, props.id)
  dl.refresh()
}
const chapters = computed(() => (state.value.kind === 'ok' ? state.value.chapters : []))
async function go(i: number, section?: string | null, index?: number | null): Promise<void> {
  if (!chapters.value.length) return
  const validChapter = Number.isInteger(i) && i >= 0 && i < chapters.value.length
  cur.value = validChapter ? i : 0
  selected.value = { chapter: cur.value, section: section ?? null, ixNamedSection: index ?? 0 }
  unavailable.value = validChapter ? '' : '这本资料里找不到链接指向的章节。'
  tocOpen.value = false
  await nextTick()
  const pane = body.value
  if (!pane) return
  pane.querySelector('[data-reader-current]')?.removeAttribute('data-reader-current')
  pane.scrollTop = 0
  if (!validChapter || !section) return
  const headings = [...pane.querySelectorAll<HTMLElement>('[data-reader-heading]')]
  const target = headings.filter((el) => headingKey(el.dataset.readerHeading ?? '') === headingKey(section))[index ?? 0]
  if (!target) { unavailable.value = `这一章里找不到「${section}」。`; return }
  target.setAttribute('data-reader-current', '')
  pane.scrollTop = target.getBoundingClientRect().top - pane.getBoundingClientRect().top
  target.setAttribute('tabindex', '-1')
  target.focus({ preventScroll: true })
}
</script>

<template>
  <div class="lib-mbody" data-testid="reader-page">
    <div v-if="state.kind === 'loading'" class="lib-skel" aria-busy="true"><i /><i style="width:80%" /><i style="width:60%" /></div>
    <div v-else-if="state.kind === 'missing'" class="lib-state">
      <h3>这个冒险的正文还没下载</h3>
      <div v-if="task?.status === 'running'" class="lib-banner" role="status"><span class="trpg-spinner" aria-hidden="true" /><span>正在下载冒险正文…</span></div>
      <p v-else-if="task?.status === 'failed'" class="lib-banner lib-banner--warn">下载没有成功：{{ task.error || '原因未知' }}</p>
      <button v-if="task?.status !== 'running'" class="trpg-btn trpg-btn--primary" type="button" data-testid="reader-download" @click="download">{{ task?.status === 'failed' ? '重试' : '下载此冒险' }}</button>
    </div>
    <div v-else-if="state.kind === 'error'" class="lib-state"><h3>这本书读不出来</h3><p class="lib-muted">{{ state.message }}</p><button class="trpg-btn trpg-btn--primary" type="button" @click="load">重试</button></div>
    <template v-else>
      <div class="lib-rbar">
        <button class="trpg-btn trpg-btn--small" type="button" data-testid="reader-toc" :aria-expanded="tocOpen" @click="tocOpen = !tocOpen"><Icon name="list-bullets" :size="14" />目录</button>
        <b class="lib-name">{{ chapters[cur]?.name }}</b>
        <button class="trpg-btn trpg-btn--small" type="button" :disabled="cur === 0" @click="go(cur - 1)">上一章</button>
        <button class="trpg-btn trpg-btn--small" type="button" :disabled="cur >= chapters.length - 1" @click="go(cur + 1)">下一章</button>
      </div>
      <div class="lib-read" :data-toc="tocOpen">
        <aside v-if="tocOpen" class="lib-toc" data-testid="reader-toc-list">
          <details v-for="(c, i) in chapters" :key="i" :open="i === cur">
            <summary>{{ c.name }}</summary>
            <button type="button" :aria-current="i === cur && !selected?.section" @click="go(i)">读本章</button>
            <button
              v-for="(h, j) in c.headings" :key="j" type="button" class="lib-toc__section" :data-depth="h.depth > 0"
              :aria-current="i === cur && !!selected?.section && headingKey(selected.section) === headingKey(h.name) && selected.ixNamedSection === h.index"
              @click="go(i, h.name, h.index)"
            >
              {{ headingText(h.name) }}
            </button>
          </details>
        </aside>
        <main ref="body" class="lib-mscroll" data-testid="reader-body">
          <div class="lib-dbody">
            <p v-if="unavailable" class="lib-banner lib-banner--warn">{{ unavailable }}</p>
            <EntryBody :key="cur" :block="chapters[cur]?.entry" :code-set="codeSet" />
          </div>
        </main>
      </div>
    </template>
  </div>
</template>
