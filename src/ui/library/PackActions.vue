<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '../../stores/app'
import { useCampaignStore } from '../../stores/campaign'
import { useLibraryStore } from '../../stores/library'
import Icon from '../kit/Icon.vue'
import MoreMenu, { type MenuItem } from '../kit/MoreMenu.vue'
import { duplicateFlow, exportPackFile, installFromCatalog, restoreBuiltinFlow, retryInstall, uninstallFlow } from './actions'
import { SOURCE_LABEL, type PackRow } from './rows'

const props = defineProps<{ row: PackRow }>()
const app = useAppStore()
const library = useLibraryStore()
const campaign = useCampaignStore()

const task = computed(() => library.tasks[props.row.id])
const queued = computed(() => library.queueState(props.row.id))
const pct = computed(() => (task.value ? Math.round((task.value.received / Math.max(1, task.value.total)) * 100) : 0))
const core = computed(() => app.services?.rules.list().some((r) => r.corePackIds.includes(props.row.id)) ?? false)
const removedBuiltin = computed(() => !props.row.installed && library.builtinRemoved.includes(props.row.id))
const items = computed<MenuItem[]>(() => [
  ...(props.row.category === 'adventure'
    ? [{ key: 'newsave', label: '用它开新存档', disabled: true, reason: '随后续版本提供' }, { key: 'addsave', label: '加入当前存档', disabled: true, reason: '随后续版本提供' }]
    : []),
  { key: 'dup', label: '复制为我的包', disabled: campaign.readOnly },
  { key: 'export', label: '导出为文件' },
  ...(core.value ? [] : [{ key: 'uninstall', label: '卸载', danger: true, disabled: campaign.readOnly }]),
])

function onMenu(key: string): void {
  if (key === 'dup') void duplicateFlow(props.row)
  else if (key === 'export') void exportPackFile(props.row)
  else if (key === 'uninstall') void uninstallFlow(props.row)
}
</script>

<template>
  <span class="trpg-pack-actions">
    <template v-if="task?.state === 'failed'">
      <span class="trpg-badge" data-tone="danger" :title="task.error">⚠ {{ task.error?.slice(0, 18) }}</span>
      <button class="trpg-btn trpg-btn--small" type="button" @click="retryInstall(row.id)">重试</button>
    </template>
    <template v-else-if="task || queued">
      <span v-if="queued === 'waiting' && (!task || task.state === 'waiting')" class="trpg-badge">等待中</span>
      <span v-else class="trpg-progress" role="progressbar" :aria-valuenow="pct" aria-valuemin="0" aria-valuemax="100" :aria-label="`${row.name} 下载进度`"><span :style="{ width: `${pct}%` }" /></span>
      <span v-if="task?.state === 'downloading'" class="trpg-row__meta">{{ pct }}%</span>
      <span v-if="task?.state === 'installing'" class="trpg-row__meta">安装中</span>
      <button class="trpg-btn trpg-btn--small" type="button" @click="library.cancel(row.id)">取消</button>
    </template>
    <template v-else-if="removedBuiltin"><button class="trpg-btn trpg-btn--small" type="button" @click="restoreBuiltinFlow(row)">恢复内置</button></template>
    <template v-else-if="!row.installed">
      <span v-if="row.recommended" class="trpg-badge" data-tone="gold">推荐</span>
      <button class="trpg-btn trpg-btn--small trpg-btn--primary" type="button" :aria-label="`安装 ${row.name}`" @click="installFromCatalog(row.id)"><Icon name="download-simple" :size="14" />安装</button>
    </template>
    <template v-else>
      <button v-if="row.updateVersion" class="trpg-btn trpg-btn--small trpg-btn--primary" type="button" :title="`更新到 v${row.updateVersion}`" :aria-label="`更新 ${row.name}`" @click="installFromCatalog(row.id)">更新</button>
      <span v-else class="trpg-badge">{{ SOURCE_LABEL[row.source] ? `${SOURCE_LABEL[row.source]} ` : '' }}v{{ row.version }}</span>
    </template>
    <MoreMenu v-if="row.installed" :label="row.name" :items="items" @select="onMenu" />
  </span>
</template>
