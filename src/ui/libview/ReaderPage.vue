<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { getSource } from '../../library/sources'
import { useAppStore } from '../../stores/app'
import { useDownloadsStore } from '../../stores/downloads'
import { useToastStore } from '../../stores/toast'
import Icon from '../kit/Icon.vue'
import EntryBody from './EntryBody.vue'

/** 书 / 冒险阅读器（U9h）：弹窗里的一页。章节目录宽屏在左侧、窄屏是点【目录】展开的列表；正文用和条目同一套渲染器。冒险没下载时先下载。 */
const props = defineProps<{ set: string; prop: string; id: string; name: string }>()
const app = useAppStore()
const dl = useDownloadsStore()
const toast = useToastStore()

interface Chapter { name: string; entry: unknown }
type State = { kind: 'loading' } | { kind: 'ok'; chapters: Chapter[] } | { kind: 'missing' } | { kind: 'error'; message: string }
const state = ref<State>({ kind: 'loading' })
const cur = ref(0)
const tocOpen = ref(false)
const codeSet = computed(() => getSource(props.set).codeSet)

async function load(): Promise<void> {
  state.value = { kind: 'loading' }
  try {
    const v = (await app.svc().backend.library.service.corpus(props.set, props.prop, props.id)) as Record<string, { data?: unknown[] } | undefined>
    const data = v[`${props.prop}Data`]?.data
    if (!Array.isArray(data)) { state.value = { kind: 'error', message: '这本书没有正文' }; return }
    state.value = { kind: 'ok', chapters: data.map((c, i) => ({ name: String((c as { name?: unknown })?.name ?? `第 ${i + 1} 节`), entry: c })) }
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
function go(i: number): void { cur.value = Math.min(Math.max(i, 0), chapters.value.length - 1); tocOpen.value = false }
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
        <aside v-if="tocOpen" class="lib-toc" data-testid="reader-toc-list"><button v-for="(c, i) in chapters" :key="i" type="button" :aria-current="i === cur" @click="go(i)">{{ c.name }}</button></aside>
        <main class="lib-mscroll" data-testid="reader-body"><div class="lib-dbody"><EntryBody :block="chapters[cur]?.entry" :code-set="codeSet" /></div></main>
      </div>
    </template>
  </div>
</template>
