<script setup lang="ts">
import { useAppStore } from '../../stores/app'
import { useCampaignStore } from '../../stores/campaign'
import HomeCampaign from '../home/HomeCampaign.vue'
import HomeEmpty from '../home/HomeEmpty.vue'

const app = useAppStore()
const campaign = useCampaignStore()
</script>

<template>
  <p v-if="app.bootError" class="trpg-field__error" role="alert">无法打开本机存储：{{ app.bootError }}</p>
  <div v-else-if="!app.booted || !campaign.ready" class="page-stack" aria-busy="true">
    <div class="trpg-skeleton" style="height: 140px" />
    <div class="trpg-skeleton" style="width: 40%" />
  </div>
  <HomeEmpty v-else-if="!campaign.hasCampaign" />
  <HomeCampaign v-else />
</template>
