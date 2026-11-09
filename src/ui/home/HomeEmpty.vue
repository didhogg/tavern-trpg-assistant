<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAppStore } from '../../stores/app'
import { useCampaignStore } from '../../stores/campaign'
import { useSavesStore } from '../../stores/saves'
import Icon from '../kit/Icon.vue'
import HeroArt from '../kit/HeroArt.vue'
import { openSaveDrawer, openWizard } from '../saves/actions'

const campaign = useCampaignStore()
const app = useAppStore()
const saves = useSavesStore()
const count = ref(0)
onMounted(async () => {
  count.value = await saves.count()
  await app.refreshBackup()
})
</script>

<template>
  <div class="page-stack">
    <template v-if="campaign.owner">
      <button class="trpg-hero" :class="{ 'trpg-hero--off': campaign.readOnly }" type="button" data-testid="start-banner" :disabled="campaign.readOnly" @click="openWizard()">
        <HeroArt />
        <span class="trpg-hero__title">开始一场新的冒险</span>
        <span class="trpg-hero__sub">为「{{ campaign.owner.ownerLabel }}」建立一个战役：选规则、资料与冒险，再起个名字。</span>
        <span class="trpg-hero__go" aria-hidden="true">开始新冒险<Icon name="caret-right" :size="14" /></span>
      </button>
      <p v-if="campaign.readOnly" class="trpg-field__hint" data-testid="readonly-note">另一个窗口正在使用这份数据，这里只能查看。</p>
      <button v-if="count > 0" class="trpg-linkcard" type="button" data-testid="load-existing" @click="openSaveDrawer">
        <span class="trpg-linkcard__icon" aria-hidden="true"><Icon name="arrow-counter-clockwise" :size="20" /></span>
        <span class="trpg-linkcard__text"><b>读取已有存档</b><small>接着玩以前的战役</small></span>
        <span class="trpg-linkcard__go">{{ count }} 个存档<Icon name="caret-right" :size="14" /></span>
      </button>
    </template>
    <div v-else class="trpg-hero trpg-hero--idle" data-testid="no-chat">
      <span class="trpg-hero__title">请先在酒馆中打开一个聊天</span>
      <span class="trpg-hero__sub">打开任意聊天后，这里会出现「开始一场新的冒险」。</span>
    </div>
  </div>
</template>
