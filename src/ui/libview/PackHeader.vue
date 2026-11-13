<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '../../stores/app'
import { useCampaignStore } from '../../stores/campaign'
import { useLibViewStore } from '../../stores/libview'
import { useToastStore } from '../../stores/toast'
import MoreMenu from '../kit/MoreMenu.vue'
import { saveToMine } from './actions'
import { openMineById } from './mine-actions'
import { openManage } from './open'
import Switch from '../kit/Switch.vue'

/** 包弹窗标题栏右侧：本战役开关 + ⋯。开关与书架同一状态；无战役时不可用（R60）。 */
const props = defineProps<{ set: string; source: string; name: string; docIdLocal?: string }>()
const app = useAppStore()
const lib = useLibViewStore()
const campaign = useCampaignStore()
const toast = useToastStore()
const row = computed(() => lib.shelf?.groups.flatMap((g) => [...g.books, ...g.adventures]).find((r) => r.set === props.set && (props.docIdLocal ? r.pack?.docIdLocal === props.docIdLocal : r.source === props.source)))
const on = computed(() => row.value?.view.visible ?? false)

async function onMenu(key: string): Promise<void> {
  if (key === 'manage') openManage({ set: props.set, source: props.source, name: props.name, ...(props.docIdLocal ? { docIdLocal: props.docIdLocal } : {}) })
  else if (key === 'save' && row.value) await saveToMine(app.svc(), row.value, toast, (id) => void openMineById(app.svc(), id, lib.campaignLib?.codeSet ?? 'cn'))
}

async function toggle(next: boolean): Promise<void> {
  const owner = campaign.owner?.ownerKey
  if (!owner || !lib.bound) return
  try { await lib.toggleSource(app.svc(), owner, props.source, next) } catch (e) { console.error('[trpg-assistant] 开关失败', e); toast.error('没有保存成功') }
}
</script>

<template>
  <span class="lib-headsw">
    <Switch :model-value="on" :label="`在本战役里使用《${name}》`" :disabled="!lib.bound" @update:model-value="toggle" />
    <MoreMenu :label="name" :items="[{ key: 'manage', label: '管理' }, { key: 'save', label: '复制成我的' }]" @select="onMenu" />
  </span>
</template>
