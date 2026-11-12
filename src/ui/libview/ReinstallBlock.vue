<script setup lang="ts">
import ErrorBanner from './ErrorBanner.vue'
import { computed, ref, watch } from 'vue'
import type { CatalogRow } from '../../library/scoped'
import { getSource } from '../../library/sources'
import { useAppStore } from '../../stores/app'
import { useDownloadsStore } from '../../stores/downloads'
import { reinstall } from './reinstall'

/**
 * 缺数据时（P5-5 §11.2）：不显示「错误 + 重试」，给【重新下载这个包】（没下过的给【下载】），装完通知上层重读、回到原页。
 * 失败 / 没网用横幅说清原因，可再点。detail：原始报错，折叠在下面，只给排查用。
 */
const props = defineProps<{ owner: CatalogRow; title: string; detail?: string | null }>()
const emit = defineEmits<{ done: [] }>()
const app = useAppStore()
const dl = useDownloadsStore()
const busy = ref(false)
const taskId = ref<string | null>(null)
const started = computed(() => !!taskId.value)
const failed = ref<string | null>(null)
/** 失败的完整原文（网址很长）：横幅只放第一句，全文折叠在下面。 */
const raw = ref<string | null>(null)
const official = computed(() => getSource(props.owner.set).kind === 'official')
const what = computed(() => (official.value ? (props.owner.kind === 'adventure' ? '冒险' : '书') : '包'))
const label = computed(() => (props.owner.downloaded ? `重新下载这个${what.value}` : `下载这本${what.value}`))

async function run(): Promise<void> {
  busy.value = true
  failed.value = null
  raw.value = null
  try {
    const r = await reinstall(app.svc(), props.owner, () => emit('done'))
    failed.value = r.error
    raw.value = r.error
    taskId.value = r.taskId ?? null
  } finally { busy.value = false }
}
// 官方是后台任务：按任务编号看结果。完成 → 通知上层重读；失败 / 取消 → 横幅说明，可再点
watch(() => dl.tasks.find((t) => t.id === taskId.value)?.status, (st) => {
  if (!taskId.value || !st || st === 'running') return
  const t = dl.tasks.find((x) => x.id === taskId.value)
  taskId.value = null
  if (st === 'done') emit('done')
  else if (st === 'failed') { failed.value = `下载没有成功：${t?.error || '原因未知'}`; raw.value = t?.error ?? null }
})
</script>

<template>
  <div class="lib-state" data-testid="reinstall">
    <h3>{{ title }}</h3>
    <p class="lib-muted">《{{ owner.name }}》{{ owner.downloaded ? '在本地缺了这部分资料。重新下载一次可以恢复原状。' : '还没下载。' }}</p>
    <ErrorBanner v-if="failed" :text="raw && raw !== failed ? `${failed}：${raw}` : failed" :what="label" />
    <div v-if="started" class="lib-banner" role="status"><span class="trpg-spinner" aria-hidden="true" /><span>正在下载《{{ owner.name }}》，进度见【库】标志；下好后这里自动重新打开。</span></div>
    <button v-else class="trpg-btn trpg-btn--primary" type="button" data-testid="reinstall-btn" :disabled="busy" @click="run">{{ busy ? '下载中…' : failed ? `再试一次：${label}` : label }}</button>
    <details v-if="!failed && detail && owner.downloaded" class="lib-fold"><summary>原始报错</summary><pre class="lib-fold__body lib-errdetail">{{ detail }}</pre></details>
  </div>
</template>
