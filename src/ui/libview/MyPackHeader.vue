<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '../../stores/app'
import { useCampaignStore } from '../../stores/campaign'
import { useLibViewStore } from '../../stores/libview'
import { useToastStore } from '../../stores/toast'
import MoreMenu from '../kit/MoreMenu.vue'
import Switch from '../kit/Switch.vue'
import { packMenu, runPackMenu } from './mine-actions'

/** 我的库的包弹窗标题栏右侧（u7-3）：本战役开关 + ⋯（管理 / 再复制一份 / 加另一语言版 / 导出 / 删除）。 */
const props = defineProps<{ set: string; source: string; name: string; docIdLocal?: string; mine: { id: string; codeSet: string } }>()
const app = useAppStore()
const lib = useLibViewStore()
const campaign = useCampaignStore()
const toast = useToastStore()
const pair = computed(() => lib.pairs?.find((p) => p.id === props.mine.id) ?? null)
const pack = computed(() => (props.mine.codeSet === 'en' ? pair.value?.en : pair.value?.zh) ?? null)
const on = computed(() => !!pack.value && lib.bound && pack.value.sources.some((s) => lib.shelf?.groups.some((g) => [...g.books, ...g.adventures].some((r) => r.source === s && r.view.visible))))

async function toggle(next: boolean): Promise<void> {
  const owner = campaign.owner?.ownerKey
  if (!owner || !lib.bound || !pack.value) return
  try { for (const s of pack.value.sources) await lib.toggleSource(app.svc(), owner, s, next) } catch (e) { console.error('[trpg-assistant] 开关失败', e); toast.error('没有保存成功') }
}
function onMenu(key: string): void {
  if (pair.value) void runPackMenu(app.svc(), key, pair.value, props.mine.codeSet, toast, app.settings?.library.skipRemovePrompt ?? false)
}
</script>

<template>
  <span class="lib-headsw">
    <Switch :model-value="on" :label="`在本战役里使用《${name}》`" :disabled="!lib.bound" @update:model-value="toggle" />
    <MoreMenu v-if="pair" :label="name" :items="packMenu(pair, { withExport: true })" @select="onMenu" />
  </span>
</template>
