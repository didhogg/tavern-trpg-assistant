<script setup lang="ts">
import { computed, ref } from 'vue'
import { getCampaignBanner } from '../../core/banner'
import { useAppStore } from '../../stores/app'
import { useCampaignStore } from '../../stores/campaign'
import { useUiStore } from '../../stores/ui'
import { formatClock } from '../format'
import { openSaveDrawer } from '../saves/actions'

const app = useAppStore()
const campaign = useCampaignStore()
const ui = useUiStore()
const failed = ref(false)
const loaded = ref(false)

const rule = computed(() => (campaign.workspace ? app.svc().rules.get(campaign.workspace.ruleId) : undefined))
const banner = computed(() => getCampaignBanner({ rule: rule.value, data: campaign.workspace!.data, narrow: window.innerWidth <= 480 }))
const showImage = computed(() => !!banner.value.src && !failed.value)
const saveName = computed(() => campaign.currentSave?.name ?? '存档')
const stateText = computed(() => (campaign.dirty ? '● 有未保存到存档的改动' : campaign.currentSave ? `存档已保存 ${formatClock(campaign.currentSave.updatedAt)}` : ''))
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
    <h2 class="trpg-group">最近记录</h2>
    <p class="trpg-empty trpg-empty--tight">还没有记录，<button class="trpg-link" type="button" @click="ui.diceOpen = true">掷一次骰子试试</button></p>
  </div>
</template>
