<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useWizardStore } from '../../stores/wizard'
import EquipSection from './EquipSection.vue'
import { currencyText } from './wizard-labels'

/** 装备步骤：每个来源一段；选项、候选、合计都来自后端（已按本战役的书 / 包 / 单条启用停用筛过），界面只记玩家选了什么。 */
const w = useWizardStore()
const eq = w.equip
const sections = computed(() => eq.sections)
const unsupported = computed(() => sections.value.flatMap((s) => s.unsupported))
const count = computed(() => (eq.preview?.sections ?? []).reduce((n, s) => n + s.items.reduce((m, i) => m + i.quantity, 0), 0))
onMounted(() => void eq.refresh())
</script>

<template>
  <div class="wz-eq" data-testid="wz-equipment">
    <p class="wz-note">没选的组创建后留空，不会替你选；最后一页的「待填」里会写明。</p>
    <p v-if="eq.error" class="wz-err" role="alert">读不到起始装备：{{ eq.error }} <button type="button" class="trpg-btn trpg-btn--small" @click="eq.retry()">重试</button></p>
    <div v-else-if="eq.loading && !sections.length" class="lib-skel" aria-busy="true"><i /><i style="width:70%" /></div>
    <p v-if="unsupported.length" class="wz-err" role="alert">有 {{ unsupported.length }} 条起始装备这一版不认识，已跳过：{{ unsupported.join('；') }}</p>
    <EquipSection v-for="s in sections" :key="s.refKey" :section="s" />
    <div v-if="eq.preview" class="wz-eq__sum" data-testid="wz-eq-sum" aria-live="polite">现在选的会给：<b>{{ count }}</b> 件物品，钱 <b>{{ currencyText(eq.preview.currency) }}</b><span v-if="eq.loading" class="wz-note">（更新中…）</span></div>
  </div>
</template>
