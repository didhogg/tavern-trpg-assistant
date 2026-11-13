<script setup lang="ts">
import ErrorBanner from './ErrorBanner.vue'
import { onMounted, ref, watch } from 'vue'
import type { PackHealth } from '../../library/pack-health'
import { useAppStore } from '../../stores/app'
import { useLibViewStore } from '../../stores/libview'
import { useToastStore } from '../../stores/toast'
import { downloadOfficialBook, installBrewSources } from './deps-flow'
import { categoryLabel } from './registry'

/** 自制包的依赖（按作者程序：缺了这个包读不出）。只排版后端 packHealth 的结果；管理页（书架的包、我的库的包）共用。 */
const props = defineProps<{ set: string; docIdLocal: string }>()
const emit = defineEmits<{ missing: [n: number] }>()
const app = useAppStore()
const lib = useLibViewStore()
const toast = useToastStore()
const health = ref<PackHealth | null>(null)
const error = ref<string | null>(null)
const loading = ref(true)
const busy = ref<string | null>(null)

async function load(): Promise<void> {
  error.value = null
  try { health.value = (await app.svc().backend.library.packHealth(props.set, props.docIdLocal))[0] ?? null } catch (e) { console.error('[trpg-assistant] 读取依赖失败', e); error.value = e instanceof Error ? e.message : String(e) } finally { loading.value = false }
}
onMounted(() => void load())
watch(() => health.value?.missing.length ?? 0, (n) => emit('missing', n), { immediate: true })
async function getDep(d: PackHealth['requires'][number]): Promise<void> {
  const s = app.svc()
  if (d.kind === 'official' && d.book) { void downloadOfficialBook(s, d.book).catch((e: unknown) => console.error('[trpg-assistant] 开始下载失败', e)); toast.success(`已开始下载《${d.book.name}》，进度见【库】标志`); return }
  busy.value = d.source
  try { await installBrewSources(s, props.set, [d.source], `依赖包 ${d.source}`, toast, async () => { await lib.refresh(s); await load() }) } finally { busy.value = null }
}
const depName = (d: PackHealth['requires'][number]): string => (d.kind === 'official' ? `《${d.book?.name ?? d.source}》（官方书）` : d.provider?.replace(/\.json$/, '') ?? d.source)
defineExpose({ load })
</script>

<template>
  <div v-if="loading" class="lib-skel" aria-busy="true"><i /><i style="width:70%" /></div>
  <template v-else-if="error"><ErrorBanner :text="`依赖读不出来：${error}`" what="读取依赖" :actions="[{ label: '重试', run: load }]" /><p class="lib-muted">依赖这次没读出来。</p></template>
  <p v-else-if="!health?.requires.length" class="lib-muted">这个包不依赖别的包。</p>
  <ul v-else class="trpg-list" data-testid="manage-deps">
    <li v-for="d in health.requires" :key="d.source" class="trpg-row">
      <div class="trpg-row__main"><div class="trpg-row__title lib-name">{{ depName(d) }}</div><div class="trpg-row__meta">提供：{{ d.props.map((p) => categoryLabel(p) ?? p).join('、') }}</div></div>
      <div class="trpg-row__end">
        <span v-if="d.ok" class="trpg-badge" data-tone="success">已装</span>
        <template v-else>
          <span class="trpg-badge" data-tone="warn">缺</span>
          <button class="trpg-btn trpg-btn--small trpg-btn--primary" type="button" :disabled="busy === d.source || (d.kind === 'official' && !d.book)" :title="d.kind === 'official' && !d.book ? '书目里找不到这本书' : undefined" @click="getDep(d)">{{ busy === d.source ? '下载中…' : d.kind === 'official' ? '下载这本书' : '下载' }}</button>
        </template>
      </div>
    </li>
  </ul>
</template>
