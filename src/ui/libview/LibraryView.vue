<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useAppStore } from '../../stores/app'
import { useCampaignStore } from '../../stores/campaign'
import { useLibViewStore } from '../../stores/libview'
import Icon from '../kit/Icon.vue'
import Segmented from '../kit/Segmented.vue'
import ShelfTab from './ShelfTab.vue'

/** 库页（P5）：书架 | 我的库 | 下载；【全库数据搜索】。第 1 批只有书架；其余先灰着并写明原因。 */
const app = useAppStore()
const campaign = useCampaignStore()
const lib = useLibViewStore()
const tab = ref('shelf')

function reload(): void {
  if (app.booted) void lib.load(app.svc(), campaign.hasCampaign ? campaign.owner?.ownerKey ?? null : null)
}
onMounted(reload)
watch(() => [campaign.owner?.ownerKey, campaign.hasCampaign, campaign.currentSave?.id], reload)
</script>

<template>
  <div class="lib-page" data-testid="library-view">
    <div class="lib-top">
      <Segmented
        v-model="tab"
        label="库的分区"
        :options="[{ value: 'shelf', label: '书架' }, { value: 'mine', label: '我的库', disabled: true, hint: '稍后开放' }, { value: 'download', label: '下载', disabled: true, hint: '稍后开放' }]"
      />
      <span class="lib-end">
        <button class="trpg-btn" type="button" disabled title="稍后开放"><Icon name="magnifying-glass" :size="16" />全库数据搜索</button>
      </span>
    </div>
    <ShelfTab v-if="tab === 'shelf'" />
  </div>
</template>
