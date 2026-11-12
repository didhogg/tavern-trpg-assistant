<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useAppStore } from '../../stores/app'
import { useCampaignStore } from '../../stores/campaign'
import { useLibViewStore } from '../../stores/libview'
import { useDownloadsStore } from '../../stores/downloads'
import { officialSourceOf } from '../../library/sources'
import { useBrewCatalogStore } from '../../stores/brewcatalog'
import Icon from '../kit/Icon.vue'
import Segmented from '../kit/Segmented.vue'
import { openSearch } from './open'
import DownloadTab from './DownloadTab.vue'
import MyLibTab from './MyLibTab.vue'
import ShelfTab from './ShelfTab.vue'

/** 库页（P5）：书架 | 我的库 | 下载；【全库数据搜索】。书架 / 我的库 / 下载。 */
const app = useAppStore()
const campaign = useCampaignStore()
const lib = useLibViewStore()
const tab = ref('shelf')

function reload(): void {
  if (app.booted) void lib.refresh(app.svc())
}
// 中英配对表第一次读很慢（实测约 3.6 秒，读一次才有，之后秒开）：库页一打开就在空闲时先读进内存，点条目详情时就不用等
function warmPairs(): void {
  setTimeout(() => {
    if (!app.booted) return
    app.svc().backend.library.service.englishPairs(officialSourceOf(lib.campaignLib?.codeSet ?? 'cn').id).catch((e: unknown) => console.warn('[trpg-assistant] 预读中英配对表没成功（不影响使用）', e))
  }, 1500)
}
// 自制包目录：有网就先取回来放着（下载页直接用），取不到只在下载页给原因和重试
function prefetchBrewCatalog(): void {
  setTimeout(() => {
    if (!app.booted) return
    useBrewCatalogStore().prefetch(app.svc(), lib.brewSetId(lib.campaignLib?.codeSet ?? 'cn') ?? 'cn-brew')
  }, 800)
}
onMounted(() => { reload(); warmPairs(); prefetchBrewCatalog() })
watch(() => [campaign.owner?.ownerKey, campaign.hasCampaign, campaign.currentSave?.id], reload)
// 下载 / 更新任务结束（完成、失败、取消）才按当前战役重读一次书架；进行中不重读，旧书架一直显示（P5 T6 B4）
const dl = useDownloadsStore()
let active = 0
watch(() => dl.running.length, (n) => { if (n < active) reload(); active = n }, { immediate: true })
</script>

<template>
  <div class="lib-page" data-testid="library-view">
    <div class="lib-top">
      <Segmented
        v-model="tab"
        label="库的分区"
        :options="[{ value: 'shelf', label: '书架' }, { value: 'mine', label: '我的库' }, { value: 'download', label: '下载' }]"
      />
      <span class="lib-end">
        <button class="trpg-btn" type="button" data-testid="open-search" @click="openSearch()"><Icon name="magnifying-glass" :size="16" />全库数据搜索</button>
      </span>
    </div>
    <ShelfTab v-if="tab === 'shelf'" />
    <MyLibTab v-else-if="tab === 'mine'" />
    <DownloadTab v-else-if="tab === 'download'" />
  </div>
</template>
