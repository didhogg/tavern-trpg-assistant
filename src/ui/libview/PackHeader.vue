<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '../../stores/app'
import { useCampaignStore } from '../../stores/campaign'
import { useLibViewStore } from '../../stores/libview'
import { useToastStore } from '../../stores/toast'
import MoreMenu from '../kit/MoreMenu.vue'
import Switch from '../kit/Switch.vue'

/** 包弹窗标题栏右侧：本战役开关 + ⋯。开关与书架同一状态；无战役时不可用（R60）。 */
const props = defineProps<{ set: string; source: string; name: string }>()
const app = useAppStore()
const lib = useLibViewStore()
const campaign = useCampaignStore()
const toast = useToastStore()
const row = computed(() => lib.shelf?.groups.flatMap((g) => [...g.books, ...g.adventures]).find((r) => r.source === props.source && r.set === props.set))
const on = computed(() => row.value?.view.visible ?? false)

async function toggle(next: boolean): Promise<void> {
  const owner = campaign.owner?.ownerKey
  if (!owner || !lib.bound) return
  try { await lib.toggleSource(app.svc(), owner, props.source, next) } catch (e) { console.error('[trpg-assistant] 开关失败', e); toast.error('没有保存成功') }
}
</script>

<template>
  <span class="lib-headsw">
    <Switch :model-value="on" :label="`在本战役里使用《${name}》`" :disabled="!lib.bound" @update:model-value="toggle" />
    <MoreMenu :label="name" :items="[{ key: 'manage', label: '管理', disabled: true, reason: '稍后开放' }, { key: 'save', label: '存入我的库', disabled: true, reason: '稍后开放' }]" />
  </span>
</template>
