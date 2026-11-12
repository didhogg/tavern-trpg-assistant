<script setup lang="ts">
import ErrorBanner from './ErrorBanner.vue'
import { computed, nextTick, onMounted, ref, shallowRef } from 'vue'
import { getSource } from '../../library/sources'
import { useAppStore } from '../../stores/app'
import { useModalStore } from '../../stores/modal'
import { useReaderPositionStore } from '../../stores/reader-position'
import Icon from '../kit/Icon.vue'
import EntryBody from './EntryBody.vue'
import ReinstallBlock from './ReinstallBlock.vue'
import { ownerByCorpus, ownerFromOpenPack } from './reinstall'
import { headingKey, headingText, readerChapters, type ReaderHeading } from './reader-content'
import type { ReaderPart, ReaderTarget } from './open'

/** 书 / 冒险阅读器（U9h）：弹窗里的一页。章节目录宽屏在左侧、窄屏是点【目录】展开的列表；正文用和条目同一套渲染器。冒险没下载时先下载。 */
const props = defineProps<ReaderTarget & { readerKey?: string }>()
const app = useAppStore()
const modal = useModalStore()
const readerPos = useReaderPositionStore()

type State = { kind: 'loading' } | { kind: 'ok'; chapters: ReturnType<typeof readerChapters> } | { kind: 'missing'; message: string | null } | { kind: 'error'; message: string }
type GoOptions = { closeToc?: boolean; scrollTop?: number; headingIndex?: number | null }
const state = shallowRef<State>({ kind: 'loading' })
const cur = ref(0)
const tocOpen = ref(false)
const body = ref<HTMLElement | null>(null)
const selected = ref<ReaderPart | null>(null)
const currentHeading = ref<number | null>(null)
const unavailable = ref('')
const codeSet = computed(() => getSource(props.set).codeSet)

/** 窄屏目录是单独一页：点章节后回正文；宽屏目录留在左边。 */
const narrow = (): boolean => window.matchMedia('(max-width: 480px)').matches

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
    // 只有换语言 / 带章节链接时由 part 指定位置；普通重新打开仍从第一章开始（不把上次阅读位置当成本次入口）。
    const start = props.part?.chapter != null ? props.part : undefined
    tocOpen.value = start?.tocOpen ?? false
    await go(start?.chapter ?? 0, start?.section ?? null, start?.ixNamedSection ?? null, { scrollTop: start?.scrollTop, headingIndex: start?.headingIndex, closeToc: false })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    // 读不出正文：能找到它属于书架上的哪本书 / 冒险 / 包，就给【下载 / 重新下载】（P5-5 §11.2），不显示错误 + 重试
    if (owner.value) { console.warn('[trpg-assistant] 读不出正文，给重新下载', message); state.value = { kind: 'missing', message } }
    else { console.error('[trpg-assistant] 读取书失败', e); state.value = { kind: 'error', message } }
  }
}
onMounted(() => void load())

// 这本书属于书架上的哪一行（官方按书号；自制按包里带的正文；都没有时看栈底打开的包）
const owner = computed(() => ownerByCorpus(props.set, props.prop, props.id) ?? ownerFromOpenPack(props.readerKey))
const chapters = computed(() => (state.value.kind === 'ok' ? state.value.chapters : []))

function remember(): void {
  const pane = body.value
  if (!pane || !props.readerKey || state.value.kind !== 'ok') return
  readerPos.save(props.readerKey, {
    chapter: cur.value,
    section: selected.value?.section ?? null,
    ixNamedSection: selected.value?.ixNamedSection ?? null,
    headingIndex: currentHeading.value,
    tocOpen: tocOpen.value,
    scrollTop: pane.scrollTop,
  })
}

async function go(i: number, section?: string | null, index?: number | null, opts: GoOptions = {}): Promise<void> {
  if (!chapters.value.length) return
  const validChapter = Number.isInteger(i) && i >= 0 && i < chapters.value.length
  cur.value = validChapter ? i : 0
  selected.value = { chapter: cur.value, section: section ?? null, ixNamedSection: index ?? 0 }
  unavailable.value = validChapter ? '' : '这本资料里找不到链接指向的章节。'
  if (opts.closeToc) tocOpen.value = false
  await nextTick()
  const pane = body.value
  if (!pane) return
  pane.querySelector('[data-reader-current]')?.removeAttribute('data-reader-current')
  pane.scrollTop = 0
  const headings = [...pane.querySelectorAll<HTMLElement>('[data-reader-heading]')]
  // 点击小节用名字 + 同名序号；换语言时用标题顺序，避免「装备」找不到「Equipment」。
  const target = section
    ? headings.filter((el) => headingKey(el.dataset.readerHeading ?? '') === headingKey(section))[index ?? 0]
    : opts.headingIndex != null ? headings[opts.headingIndex] : undefined
  if (!validChapter || (!section && opts.headingIndex == null)) {
    currentHeading.value = null
    selected.value = { chapter: cur.value, section: null, ixNamedSection: null }
    if (opts.scrollTop != null) pane.scrollTop = opts.scrollTop
    remember()
    return
  }
  if (!target) {
    currentHeading.value = null
    if (section) unavailable.value = `这一章里找不到「${section}」。`
    remember()
    return
  }
  currentHeading.value = headings.indexOf(target)
  const targetName = target.dataset.readerHeading ?? null
  selected.value = { chapter: cur.value, section: targetName, ixNamedSection: section ? index ?? 0 : null }
  target.setAttribute('data-reader-current', '')
  pane.scrollTop = target.getBoundingClientRect().top - pane.getBoundingClientRect().top
  if (opts.scrollTop != null) pane.scrollTop = opts.scrollTop
  target.setAttribute('tabindex', '-1')
  target.focus({ preventScroll: true })
  remember()
}

function toggleToc(): void { tocOpen.value = !tocOpen.value; remember() }
function openChapter(i: number): void { void go(i, null, null, { closeToc: narrow() }) }
function openSection(i: number, j: number, h: ReaderHeading): void { void go(i, h.name, h.index, { headingIndex: j, closeToc: narrow() }) }
</script>

<template>
  <div class="lib-mbody" data-testid="reader-page">
    <div v-if="state.kind === 'loading'" class="lib-skel" aria-busy="true"><i /><i style="width:80%" /><i style="width:60%" /></div>
    <ReinstallBlock v-else-if="state.kind === 'missing' && owner" :owner="owner" :title="owner.downloaded ? '这本的正文读不出来' : `这个${owner.kind === 'adventure' ? '冒险' : ''}的正文还没下载`" :detail="state.message" @done="load" />
    <template v-else-if="state.kind === 'error'">
      <ErrorBanner :text="`这本书没读出来：${state.message}`" what="读取这本书" :actions="[{ label: '重试', run: load }]" />
      <div class="lib-state"><h3>这本书暂时读不出来</h3><p class="lib-muted">点顶部提示里的【重试】再读一次。</p></div>
    </template>
    <template v-else>
      <div class="lib-rbar">
        <button class="trpg-btn trpg-btn--small" type="button" data-testid="reader-toc" :aria-expanded="tocOpen" @click="toggleToc"><Icon name="list-bullets" :size="14" />目录</button>
        <b class="lib-name">{{ chapters[cur]?.name }}</b>
        <button class="trpg-btn trpg-btn--small" type="button" :disabled="cur === 0" @click="go(cur - 1)">上一章</button>
        <button class="trpg-btn trpg-btn--small" type="button" :disabled="cur >= chapters.length - 1" @click="go(cur + 1)">下一章</button>
      </div>
      <div class="lib-read" :data-toc="tocOpen">
        <aside v-if="tocOpen" class="lib-toc" data-testid="reader-toc-list">
          <template v-for="(c, i) in chapters" :key="i">
            <button
              type="button" class="lib-toc__chapter"
              :aria-expanded="i === cur" :aria-current="i === cur && !selected?.section"
              @click="openChapter(i)"
            >
              <Icon v-if="i === cur" name="caret-down" :size="12" />
              <span>{{ c.name }}</span>
            </button>
            <div v-if="i === cur" class="lib-toc__sections">
              <button
                v-for="(h, j) in c.headings" :key="j" type="button" class="lib-toc__section" :data-depth="h.depth > 0"
                :aria-current="!!selected?.section && headingKey(selected.section) === headingKey(h.name) && selected.ixNamedSection === h.index"
                @click="openSection(i, j, h)"
              >
                {{ headingText(h.name) }}
              </button>
            </div>
          </template>
        </aside>
        <main ref="body" class="lib-mscroll" data-testid="reader-body" @scroll="remember">
          <div class="lib-dbody">
            <p v-if="unavailable" class="lib-banner lib-banner--warn">{{ unavailable }}</p>
            <EntryBody :key="cur" :block="chapters[cur]?.entry" :code-set="codeSet" />
          </div>
        </main>
      </div>
    </template>
  </div>
</template>
