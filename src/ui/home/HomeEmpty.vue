<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAppStore } from '../../stores/app'
import { useCampaignStore } from '../../stores/campaign'
import { useSavesStore } from '../../stores/saves'
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
    <button v-if="campaign.owner" class="trpg-hero" type="button" data-testid="start-banner" :disabled="campaign.readOnly" @click="openWizard()">
      <span class="trpg-hero__title">开始一场新的冒险</span>
      <span class="trpg-hero__sub">为「{{ campaign.owner.ownerLabel }}」建立一个战役：选规则、资料与冒险，再起个名字。</span>
      <span class="trpg-hero__go" aria-hidden="true">开始新冒险 →</span>
    </button>
    <div v-else class="trpg-hero trpg-hero--idle" data-testid="no-chat">
      <span class="trpg-hero__title">请先在酒馆中打开一个聊天</span>
    </div>
    <button v-if="campaign.owner && count > 0" class="trpg-link" type="button" data-testid="load-existing" @click="openSaveDrawer">读取已有存档（{{ count }}）</button>
  </div>
</template>
