<script setup lang="ts">
import { computed } from 'vue'
import { buildRuleCards } from '../../rules/registry'
import { useAppStore } from '../../stores/app'
import HoverTip from '../kit/HoverTip.vue'
import Icon from '../kit/Icon.vue'
import { wizard } from './state'

const app = useAppStore()
const cards = computed(() => buildRuleCards(app.svc().rules))

function choose(id: string, status: string): void {
  if (status === 'installed') wizard.ruleId = id
}
</script>

<template>
  <div class="page-stack">
    <h3 class="trpg-wizard__title">选择这场战役用的规则</h3>
    <div class="trpg-rulecards" role="radiogroup" aria-label="规则">
      <div
        v-for="c in cards"
        :key="c.id"
        class="trpg-rulecard"
        role="radio"
        :aria-checked="wizard.ruleId === c.id"
        :aria-disabled="c.status !== 'installed'"
        :tabindex="c.status === 'installed' ? 0 : -1"
        :data-status="c.status"
        data-testid="rule-card"
        @click="choose(c.id, c.status)"
        @keydown.enter.prevent="choose(c.id, c.status)"
        @keydown.space.prevent="choose(c.id, c.status)"
      >
        <span class="trpg-rulecard__mark" aria-hidden="true"><Icon :name="wizard.ruleId === c.id ? 'check-circle' : 'info'" :size="20" /></span>
        <span class="trpg-rulecard__body">
          <HoverTip :text="c.description" inline><span class="trpg-term">{{ c.name }}</span></HoverTip>
          <span class="trpg-field__hint">{{ c.description }}</span>
          <span v-if="c.status === 'coming'" class="trpg-badge">即将推出</span>
          <span v-else-if="c.status === 'installable'" class="trpg-badge" data-tone="warn">可安装</span>
        </span>
      </div>
    </div>
  </div>
</template>
