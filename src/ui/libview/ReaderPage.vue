<script setup lang="ts">
import ErrorBanner from './ErrorBanner.vue'
import { computed, nextTick, onMounted, ref, shallowRef } from 'vue'
import { getSource } from '../../library/sources'
import { useAppStore } from '../../stores/app'
import { useModalStore } from '../../stores/modal'
import Icon from '../kit/Icon.vue'
import EntryBody from './EntryBody.vue'
import ReinstallBlock from './ReinstallBlock.vue'
import { ownerByCorpus, ownerFromOpenPack } from './reinstall'
import { headingKey, headingText, readerChapters } from './reader-content'
import type { ReaderPart, ReaderTarget } from './open'

/** 书 / 冒险阅读器（U9h）：弹窗里的一页。章节目录宽屏在左侧、窄屏是点【目录】展开的列表；正文用和条目同一套渲染器。冒险没下载时先下载。 */
const props = defineProps<ReaderTarget & { readerKey?: string }>()
const app = useAppStore()
const modal = useModalStore()

type State = { kind: 'loading' } | { kind: 'ok'; chapters: ReturnType<typeof readerChapters> } | { kind: 'missing'; message: string | null } | { kind: 'error'; message: string }
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
    // 读不出正文：能找到它属于书架上的哪本书 / 冒险 / 包，就给【下载 / 重新下载】（P5-5 §11.2），不显示错误 + 重试
    if (owner.value) { console.warn('[trpg-assistant] 读不出正文，给重新下载', message); state.value = { kind: 'missing', message } }
    else { console.error('[trpg-assistant] 读取书失败', e); state.value = { kind: 'error', message } }
  }
}
onMounted(() => void load())

// 这本书属于书架上的哪一行（官方按书号；自制按包里带的正文；都没有时看栈底打开的包）
const owner = computed(() => ownerByCorpus(props.set, props.prop, props.id) ?? ownerFromOpenPack(props.readerKey))
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
    <ReinstallBlock v-else-if="state.kind === 'missing' && owner" :owner="owner" :title="owner.downloaded ? '这本的正文读不出来' : `这个${owner.kind === 'adventure' ? '冒险' : ''}的正文还没下载`" :detail="state.message" @done="load" />
    <template v-else-if="state.kind === 'error'">
      <ErrorBanner :text="`这本书没读出来：${state.message}`" what="读取这本书" :actions="[{ label: '重试', run: load }]" />
      <div class="lib-state"><h3>这本书暂时读不出来</h3><p class="lib-muted">点上面的【重试】再读一次。</p></div>
    </template>
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
