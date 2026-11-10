<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { HealthItem, HealthReport } from '../../library/health'
import type { LogEntry } from '../../library/logs'
import { useAppStore } from '../../stores/app'
import { useLibViewStore } from '../../stores/libview'
import { useToastStore } from '../../stores/toast'
import Checkbox from '../kit/Checkbox.vue'
import Icon from '../kit/Icon.vue'
import Segmented from '../kit/Segmented.vue'
import Switch from '../kit/Switch.vue'
import { levelText, loadEditRows, restoreRows, type EditRow } from './edit-rows'

/** 设置 → 库：偏好 | 全局编辑 / 覆盖 | 日志（原"体检"）。范围页已删；房规 / 覆盖并入"全局编辑 / 覆盖"。 */
const app = useAppStore()
const lib = useLibViewStore()
const toast = useToastStore()
const tab = ref('prefs')
const settings = computed(() => app.settings?.library)

onMounted(() => void (app.settings ? null : app.refreshSettings().catch((e) => console.error('[trpg-assistant] 读取设置失败', e))))

async function patch(next: Partial<NonNullable<typeof settings.value>>): Promise<void> {
  if (!app.settings) return
  try { await app.updateSettings({ library: { ...app.settings.library, ...next } }) } catch (e) { console.error('[trpg-assistant] 保存设置失败', e); toast.error('没有保存成功，已恢复原来的设置') }
}

// ── 全局编辑 / 覆盖 ──
const edits = ref<EditRow[]>([])
const editsLoading = ref(false)
async function loadEdits(): Promise<void> {
  editsLoading.value = true
  try { edits.value = await loadEditRows(app.svc()) } catch (e) { console.error('[trpg-assistant] 读取编辑 / 覆盖失败', e); toast.error('读取编辑 / 覆盖失败') } finally { editsLoading.value = false }
}
async function restore(): Promise<void> {
  const c = lib.campaignLib
  if (!c) return
  const chosen = edits.value.filter((r) => r.picked)
  try {
    await restoreRows(app.svc(), c, chosen)
    toast.success(`已复原 ${chosen.length} 条`)
    await loadEdits()
  } catch (e) { console.error('[trpg-assistant] 复原失败', e); toast.error('复原没有成功') }
}

// ── 日志 ──
const health = ref<HealthReport | null>(null)
const logs = ref<LogEntry[]>([])
const logCount = ref(0)
const logLoading = ref(false)
const logError = ref<string | null>(null)
async function loadLogs(): Promise<void> {
  logLoading.value = true
  logError.value = null
  try {
    const s = app.svc().backend.library
    health.value = await s.service.health()
    logs.value = await s.logs.list({ limit: 100 })
    logCount.value = await s.logs.count()
  } catch (e) { console.error('[trpg-assistant] 读取日志失败', e); logError.value = e instanceof Error ? e.message : String(e); toast.error('读取日志失败') } finally { logLoading.value = false }
}
const ORDER: Record<string, number> = { error: 0, warn: 1, info: 2, ok: 3 }
const items = computed<HealthItem[]>(() => [...(health.value?.items ?? [])].sort((a, b) => (ORDER[a.level] ?? 9) - (ORDER[b.level] ?? 9)))
async function copyAll(): Promise<void> {
  try { await navigator.clipboard.writeText(await app.svc().backend.library.logs.exportText()); toast.success('已复制全部日志') } catch (e) { console.error('[trpg-assistant] 复制日志失败', e); toast.error('没能复制，请改用导出') }
}
async function exportAll(): Promise<void> {
  const text = await app.svc().backend.library.logs.exportText()
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }))
  a.download = 'trpg-library-log.txt'
  a.click()
  URL.revokeObjectURL(a.href)
}
const json = (v: unknown): string => JSON.stringify(v, null, 1)
const time = (at: number): string => new Date(at).toLocaleString()
function onTab(v: string | undefined): void {
  if (!v) return
  tab.value = v
  if (v === 'edits') void loadEdits()
  if (v === 'logs') void loadLogs()
}
</script>

<template>
  <div data-testid="lib-settings">
    <div class="lib-top" style="padding-left: 0; padding-right: 0">
      <Segmented :model-value="tab" label="库设置分区" :options="[{ value: 'prefs', label: '偏好' }, { value: 'edits', label: '全局编辑 / 覆盖' }, { value: 'logs', label: '日志' }]" @update:model-value="onTab" />
    </div>

    <div v-if="tab === 'prefs' && settings" class="trpg-settings" data-testid="lib-prefs">
      <div class="trpg-settings__row"><b>分类方式</b><Segmented :model-value="settings.groupBy" label="书架分类方式" :options="[{ value: 'group', label: '作者分组' }, { value: 'kind', label: '书或冒险' }]" @update:model-value="(v) => patch({ groupBy: v ?? 'group' })" /><span class="trpg-field__hint">书架里的书怎么分组</span></div>
      <div class="trpg-settings__row"><b>编辑 / 覆盖默认作用于</b><Segmented :model-value="settings.overrideLevel" label="编辑覆盖默认层级" :options="[{ value: 'campaign', label: '本战役' }, { value: 'rule', label: '当前规则' }, { value: 'global', label: '全局' }]" @update:model-value="(v) => patch({ overrideLevel: (v ?? 'campaign') as 'campaign' | 'rule' | 'global' })" /><span class="trpg-field__hint">新做的编辑和覆盖默认生效在哪一层；本战役 = 这个战役的所有存档和分支</span></div>
      <div class="trpg-settings__row"><b>导入时总是不预览</b><Switch :model-value="settings.skipImportPreview" label="导入时总是不预览" @update:model-value="(v) => patch({ skipImportPreview: v })" /><span class="trpg-field__hint">开着：选好文件直接导入，不再显示检查结果</span></div>
      <div class="trpg-settings__row"><b>删除时总是不提示</b><Switch :model-value="settings.skipRemovePrompt" label="删除时总是不提示" @update:model-value="(v) => patch({ skipRemovePrompt: v })" /><span class="trpg-field__hint">开着：删除或卸载前不再显示"会影响谁"。建议保持关闭</span></div>
      <p class="trpg-hint">读取存档不会改变这里的任何设置。</p>
    </div>

    <div v-else-if="tab === 'edits'" class="lib-pad" data-testid="lib-edits">
      <div v-if="editsLoading" class="lib-skel" aria-busy="true"><i /><i style="width:70%" /></div>
      <div v-else-if="!edits.length" class="lib-state"><p class="lib-muted">还没有编辑或覆盖。</p></div>
      <template v-else>
        <div style="display: flex; gap: var(--sp-2)"><button class="trpg-btn trpg-btn--small trpg-btn--primary" type="button" :disabled="!edits.some((r) => r.picked)" @click="restore">复原所选（{{ edits.filter((r) => r.picked).length }}）</button></div>
        <Checkbox v-for="r in edits" :key="`${r.level}|${r.target}`" v-model="r.picked"><b class="lib-name">{{ r.name }}</b><span class="lib-src">（{{ levelText(r.level) }}）</span></Checkbox>
      </template>
    </div>

    <div v-else-if="tab === 'logs'" class="lib-pad" data-testid="lib-logs">
      <div v-if="logLoading" class="lib-skel" aria-busy="true"><i /><i style="width:70%" /></div>
      <div v-else-if="logError" class="lib-state"><h3>日志读不出来</h3><p class="lib-muted">{{ logError }}</p><button class="trpg-btn trpg-btn--primary" type="button" @click="loadLogs">重试</button></div>
      <template v-else>
        <div v-if="health" class="lib-sumline"><span>ok <b>{{ health.summary.ok }}</b></span><span>info <b>{{ health.summary.info }}</b></span><span>warn <b>{{ health.summary.warn }}</b></span><span>error <b>{{ health.summary.error }}</b></span></div>
        <div style="display: flex; gap: var(--sp-2); flex-wrap: wrap">
          <button class="trpg-btn trpg-btn--small" type="button" @click="copyAll"><Icon name="copy" :size="14" />复制全部日志</button>
          <button class="trpg-btn trpg-btn--small" type="button" @click="exportAll"><Icon name="download-simple" :size="14" />导出</button>
          <button class="trpg-btn trpg-btn--small" type="button" @click="loadLogs"><Icon name="arrow-clockwise" :size="14" />重新读取</button>
        </div>
        <p v-if="health && !health.summary.warn && !health.summary.error" class="lib-muted">一切正常。</p>
        <details v-for="(it, i) in items" :key="`h${i}`" class="lib-fold"><summary><span class="trpg-badge" :data-tone="it.level === 'error' ? undefined : it.level === 'warn' ? 'warn' : it.level === 'ok' ? 'success' : undefined">{{ it.level }}</span><b>{{ it.title }}</b><span class="lib-end lib-muted">{{ it.count }} 条</span></summary><pre class="lib-fold__body">{{ it.stale ? '旧数据的报告，仅供参考\n' : '' }}{{ json(it.details) }}</pre></details>
        <div class="lib-sec" style="padding-bottom: 0">后端日志（最近 {{ logs.length }} / 共 {{ logCount }} 条）</div>
        <p v-if="!logs.length" class="lib-muted">还没有日志。</p>
        <details v-for="l in logs" :key="l.id" class="lib-fold"><summary><span class="trpg-badge">{{ l.level }}</span><b>{{ l.message }}</b><span class="lib-end lib-src">{{ time(l.at) }} · {{ l.source }}</span></summary><pre class="lib-fold__body">{{ l.kind }}{{ l.detail ? `\n${json(l.detail)}` : '' }}</pre></details>
      </template>
    </div>
  </div>
</template>
