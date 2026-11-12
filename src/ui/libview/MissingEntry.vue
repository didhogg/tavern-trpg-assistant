<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { DownloadSuggestion } from '../../library/missing-refs'
import type { EntryRef } from '../../library/scopes'
import { useAppStore } from '../../stores/app'
import { useLibViewStore } from '../../stores/libview'
import { useToastStore } from '../../stores/toast'
import Icon from '../kit/Icon.vue'
import { SOURCES, getSource } from '../../library/sources'
import { downloadOfficialBook, installBrewSources } from './deps-flow'

/**
 * 条目读不到时（P5 T6）：问后端它该补哪本书 / 哪个包。所在自制包缺依赖 → 联网时自动拉依赖，成功后让上层重读；
 * 失败或断网 → 说清需要哪个依赖包，带【重试拉取】。官方书没下 / 包没装 → 给下载按钮。都补不回来 → 如实说。
 */
const props = defineProps<{ entryRef: EntryRef }>()
const emit = defineEmits<{ retry: [] }>()
const app = useAppStore()
const lib = useLibViewStore()
const toast = useToastStore()
const loading = ref(true)
const sug = ref<DownloadSuggestion | null>(null)
const pulling = ref(false)
const failed = ref<string | null>(null)
const checkError = ref<string | null>(null)
// 自动拉取每次打开只做一次；失败后等用户点【重试拉取】，不自动循环
let autoTried = false

async function pull(): Promise<void> {
  const s = sug.value
  if (!s?.sources?.length) return
  if (!navigator.onLine) { failed.value = '现在没有网络'; return }
  pulling.value = true
  failed.value = null
  try {
    const err = await installBrewSources(app.svc(), s.set, s.sources, `依赖包 ${s.sources.join('、')}`, toast, () => lib.refresh(app.svc()))
    if (err) failed.value = err
    else emit('retry')
  } finally { pulling.value = false }
}
async function check(): Promise<void> {
  loading.value = true
  checkError.value = null
  try {
    const backend = app.svc().backend.library
    const r = await backend.suggestDownloads([props.entryRef])
    sug.value = r.suggestions[0] ?? null
    // 官方书里推不出来（来源不是官方书）：同一种语言的自制库里再问一次——可能是某个自制包的条目（P5-5 §11.2 找不到的链接）
    const brewSet = SOURCES.find((x) => x.kind === 'brew' && x.codeSet === getSource(props.entryRef.set).codeSet)
    if (sug.value?.kind === 'official' && !sug.value.book && brewSet && getSource(props.entryRef.set).kind === 'official') {
      const b = await backend.suggestDownloads([{ ...props.entryRef, set: brewSet.id }])
      if (b.suggestions[0]?.sources?.length) sug.value = b.suggestions[0]
    }
  } catch (e) {
    console.error('[trpg-assistant] 查找缺的资料失败', e)
    checkError.value = e instanceof Error ? e.message : String(e)
  } finally { loading.value = false }
  // 所在的包只是缺依赖：按驾驶员要求联网时自动拉一次
  if (!autoTried && sug.value?.kind === 'brew' && sug.value.via && sug.value.sources?.length) { autoTried = true; await pull() }
}
onMounted(() => void check())
function getBook(): void {
  const b = sug.value?.book
  if (!b || !sug.value) return
  if (!navigator.onLine) { failed.value = '现在没有网络，连上后再试'; return }
  failed.value = null
  downloadOfficialBook(app.svc(), { set: sug.value.set, id: b.id, name: b.name })
  toast.success(`已开始下载《${b.name}》，下好后再打开这一条`)
}
</script>

<template>
  <div class="lib-state" data-testid="entry-missing">
    <div v-if="loading" class="lib-skel" aria-busy="true"><i style="width:60%" /><i style="width:40%" /></div>
    <template v-else-if="checkError">
      <h3>库里没有这一条</h3>
      <div class="lib-banner lib-banner--warn"><Icon name="warning" :size="16" /><span>查不出它该从哪里补：{{ checkError }}</span><button class="trpg-btn trpg-btn--small lib-end" type="button" @click="check">重试</button></div>
    </template>
    <template v-else-if="sug?.kind === 'brew' && sug.via">
      <h3>{{ pulling ? '正在拉取依赖包…' : '这一条需要依赖包' }}</h3>
      <p class="lib-muted">所在的包「{{ sug.via.replace(/\.json$/, '') }}」缺依赖包：{{ sug.sources?.join('、') }}。缺了它，这个包读不出来。</p>
      <div v-if="failed && !pulling" class="lib-banner lib-banner--warn" data-testid="entry-dep-failed"><Icon name="warning" :size="16" /><span>没拉到依赖包：{{ failed }}</span><button class="trpg-btn trpg-btn--small lib-end" type="button" @click="pull">重试拉取</button></div>
      <div v-else-if="pulling" class="lib-skel" aria-busy="true"><i style="width:50%" /></div>
    </template>
    <template v-else-if="sug?.kind === 'brew'">
      <h3>这一条来自没装的自制包</h3>
      <p class="lib-muted">来源：{{ sug.sources?.join('、') || '未知' }}</p>
      <div v-if="failed" class="lib-banner lib-banner--warn"><Icon name="warning" :size="16" /><span>{{ failed }}</span></div>
      <button class="trpg-btn trpg-btn--primary" type="button" :disabled="pulling || !sug.sources?.length" @click="pull">{{ pulling ? '下载中…' : failed ? '重试下载' : '下载这个包' }}</button>
    </template>
    <template v-else-if="sug?.kind === 'official' && sug.book">
      <h3>这一条在《{{ sug.book.name }}》里</h3>
      <p class="lib-muted">这本{{ sug.book.kind === 'adventure' ? '冒险' : '书' }}还没下载。</p>
      <div v-if="failed" class="lib-banner lib-banner--warn" role="alert"><Icon name="warning" :size="16" /><span>{{ failed }}</span></div>
      <button class="trpg-btn trpg-btn--primary" type="button" @click="getBook">下载这本{{ sug.book.kind === 'adventure' ? '冒险' : '书' }}</button>
    </template>
    <template v-else>
      <h3>库里没有这一条</h3>
      <div class="lib-banner lib-banner--warn" role="alert"><Icon name="warning" :size="16" /><span>{{ sug?.kind === 'official' ? '查不出它在哪本书或哪个包里，可到【下载】页找找。' : '它所在的书或包已经装着，可能是上游删掉或改了编号，重新下载也补不回来。' }}</span></div>
    </template>
  </div>
</template>
