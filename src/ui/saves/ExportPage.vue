<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { markBackupExported } from '../../core/backup'
import { estimateExport, exportSaves, type ExportScope } from '../../core/transfer/exporter'
import { APP_VERSION } from '../../core/services'
import { useAppStore } from '../../stores/app'
import { useCampaignStore } from '../../stores/campaign'
import { useModalStore } from '../../stores/modal'
import { useToastStore } from '../../stores/toast'
import { downloadBytes } from '../download'
import { errorText, formatBytes } from '../format'
import Checkbox from '../kit/Checkbox.vue'
import Segmented from '../kit/Segmented.vue'

const props = defineProps<{ saveId?: string }>()
const app = useAppStore()
const campaign = useCampaignStore()
const modal = useModalStore()
const toast = useToastStore()

const target = ref(props.saveId ?? campaign.currentSave?.id ?? '')
const mode = ref<'save' | 'backup'>(props.saveId || campaign.currentSave ? 'save' : 'backup')
const includePacks = ref(false)
const saveName = ref('存档')
const estimate = ref<{ saveBytes: number; packs: Array<{ id: string; name: string; byteSize: number }> } | null>(null)
const working = ref(false)

const scope = computed<ExportScope>(() => (mode.value === 'backup' ? { type: 'backup' } : { type: 'save', saveId: target.value }))
const deps = () => ({ db: app.svc().db, packs: app.svc().packs, now: app.svc().now, appVersion: APP_VERSION })
const packBytes = computed(() => (estimate.value?.packs ?? []).reduce((n, p) => n + p.byteSize, 0))
const sizeText = computed(() => formatBytes((estimate.value?.saveBytes ?? 0) + (includePacks.value ? packBytes.value : 0)))
const stamp = computed(() => new Date(app.svc().now()).toISOString().slice(0, 10))
const filename = computed(() => (mode.value === 'backup' ? `TRPG备份_${stamp.value}.trpgsave` : `${saveName.value.replace(/\s+/g, '_')}_${stamp.value}.trpgsave`))

async function refresh(): Promise<void> {
  try {
    if (mode.value === 'save') saveName.value = (await app.svc().campaign.getSave(target.value))?.name ?? '存档'
    estimate.value = await estimateExport(deps(), scope.value)
  } catch (error) {
    console.error('[trpg-assistant] 估算导出大小失败', error)
    estimate.value = null
  }
}
onMounted(refresh)
watch(mode, refresh)

async function doExport(): Promise<void> {
  working.value = true
  try {
    const { bytes, filename: name } = await exportSaves(deps(), scope.value, { includePacks: includePacks.value })
    downloadBytes(bytes, name)
    if (mode.value === 'backup') {
      await markBackupExported(app.svc().db, app.svc().now())
      await app.refreshBackup()
    }
    toast.success(`已导出「${name}」`)
    modal.close(true)
  } catch (error) {
    console.error('[trpg-assistant] 导出失败', error)
    toast.error(`导出失败：${errorText(error)}`)
  } finally {
    working.value = false
  }
}
</script>

<template>
  <div class="page-stack">
    <div class="trpg-field">
      <span class="trpg-field__label">范围</span>
      <Segmented v-model="mode" label="导出范围" :options="[{ value: 'save', label: saveName }, { value: 'backup', label: '全部（完整备份）' }]" />
    </div>
    <Checkbox v-if="estimate?.packs.length" v-model="includePacks">
      附带所用扩展包
      <span class="trpg-row__meta">+ {{ estimate.packs.length }} 个，约 {{ formatBytes(packBytes) }}（内置包不重复打包）</span>
    </Checkbox>
    <p class="trpg-field__hint">文件名 {{ filename }} · 约 {{ sizeText }}</p>
    <div class="trpg-confirm__actions">
      <button class="trpg-btn" type="button" @click="modal.close(true)">取消</button>
      <button class="trpg-btn trpg-btn--primary" type="button" :disabled="working || (mode === 'save' && !target)" @click="doExport">{{ working ? '打包中…' : '导出' }}</button>
    </div>
  </div>
</template>
