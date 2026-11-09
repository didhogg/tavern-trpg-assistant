<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '../../stores/app'
import { useCampaignStore } from '../../stores/campaign'
import { useSavesStore } from '../../stores/saves'
import { useUiStore } from '../../stores/ui'
import { formatClock } from '../format'
import HeroArt from '../kit/HeroArt.vue'
import Icon from '../kit/Icon.vue'
import { openSaveDrawer, openWizard } from '../saves/actions'

const app = useAppStore()
const campaign = useCampaignStore()
const saves = useSavesStore()
const ui = useUiStore()

const rule = computed(() => (campaign.workspace ? app.svc().rules.get(campaign.workspace.ruleId) : undefined))
const campName = computed(() => saves.view?.name ?? campaign.currentSave?.name ?? '战役')
const saveName = computed(() => campaign.currentSave?.name ?? '存档')
const stateText = computed(() => (campaign.dirty ? '● 有未保存到存档的改动' : campaign.currentSave ? `存档已保存 ${formatClock(campaign.currentSave.updatedAt)}` : ''))
</script>

<template>
  <div class="page-stack">
    <section class="trpg-banner" aria-label="当前战役">
      <HeroArt />
      <button class="trpg-banner__main" type="button" data-testid="banner" aria-label="打开存档" @click="openSaveDrawer">
        <span class="trpg-banner__title" data-testid="banner-title">{{ campName }}</span>
        <span class="trpg-banner__line">
          <span>{{ saveName }}</span><span>{{ rule?.name }}</span>
          <span class="trpg-banner__state" data-testid="banner-state" :data-dirty="campaign.dirty">{{ stateText }}</span>
        </span>
      </button>
      <div class="trpg-banner__foot">
        <button class="trpg-banner__new" type="button" data-testid="banner-new" :disabled="campaign.readOnly" @click="openWizard()"><Icon name="plus" :size="14" />创建新战役</button>
        <button class="trpg-banner__go" type="button" tabindex="-1" aria-hidden="true" @click="openSaveDrawer">打开存档<Icon name="caret-right" :size="14" /></button>
      </div>
    </section>
    <div>
      <h2 class="trpg-group trpg-group--first">最近记录</h2>
      <div class="trpg-empty">
        <span>还没有记录。点击右下角的骰子圆球，随时可以掷骰。</span>
        <button class="trpg-link trpg-link--hl" type="button" data-testid="dice-hint" @click="ui.diceOpen = true"><Icon name="dice-five" :size="16" />掷一次骰子试试</button>
      </div>
    </div>
  </div>
</template>
