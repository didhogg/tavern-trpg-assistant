<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getCampaignBanner } from '../../core/banner'
import { useAppStore } from '../../stores/app'
import { useCampaignStore } from '../../stores/campaign'
import { useLibraryStore } from '../../stores/library'
import { useUiStore } from '../../stores/ui'
import { formatClock } from '../format'
import Icon from '../kit/Icon.vue'
import { openSaveDrawer } from '../saves/actions'

const app = useAppStore()
const campaign = useCampaignStore()
const library = useLibraryStore()
const ui = useUiStore()
const failed = ref(false)
const loaded = ref(false)

const rule = computed(() => (campaign.workspace ? app.svc().rules.get(campaign.workspace.ruleId) : undefined))
const banner = computed(() => getCampaignBanner({ rule: rule.value, data: campaign.workspace!.data, narrow: window.innerWidth <= 480 }))
const showImage = computed(() => !!banner.value.src && !failed.value)
const saveName = computed(() => campaign.currentSave?.name ?? '存档')
const stateText = computed(() => (campaign.dirty ? '● 有未保存到存档的改动' : campaign.currentSave ? `存档已保存 ${formatClock(campaign.currentSave.updatedAt)}` : ''))
const enabledCount = computed(() => campaign.workspace?.enabledPacks.length ?? 0)
const updateText = computed(() => (library.catalogState !== 'ok' ? '' : library.updates.length ? `${library.updates.length} 个可更新` : '已是最新'))

onMounted(() => void library.loadCatalog())
</script>

<template>
  <div class="page-stack">
    <section class="trpg-banner" :class="{ 'trpg-banner--pattern': !showImage }" aria-label="战役横幅">
      <img v-if="showImage" class="trpg-banner__img" :class="{ 'is-loaded': loaded }" :src="banner.src!" :alt="banner.alt" @load="loaded = true" @error="failed = true" />
      <div class="trpg-banner__text">
        <button class="trpg-banner__title" type="button" data-testid="banner-title" @click="openSaveDrawer">{{ saveName }}</button>
        <div class="trpg-banner__line">
          <span>{{ rule?.name }}</span>
          <button class="trpg-banner__state" type="button" :data-dirty="campaign.dirty" @click="openSaveDrawer">{{ stateText }}</button>
        </div>
      </div>
    </section>
    <h2 class="trpg-group">概览</h2>
    <div class="trpg-overview">
      <button class="trpg-cell" type="button" data-testid="cell-library" @click="ui.openLibrary('save')">
        <span class="trpg-cell__title"><Icon name="books" :size="18" />库</span>
        <span class="trpg-cell__line">已启用 {{ enabledCount }} 个扩展包</span>
        <span v-if="updateText" class="trpg-cell__line">{{ updateText }}</span>
      </button>
    </div>
    <h2 class="trpg-group">最近记录</h2>
    <p class="trpg-empty trpg-empty--tight">还没有记录，<button class="trpg-link" type="button" @click="ui.diceOpen = true">掷一次骰子试试</button></p>
  </div>
</template>
