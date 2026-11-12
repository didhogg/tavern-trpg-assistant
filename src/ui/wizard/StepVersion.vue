<script setup lang="ts">
import { computed } from 'vue'
import { buildRuleFamilies, type RuleCard } from '../../rules/registry'
import { useAppStore } from '../../stores/app'
import Icon from '../kit/Icon.vue'
import { chooseVersion } from './data'
import { wizard } from './state'

/**
 * ② 选规则版本：这个体系下的版本，来自规则登记表。版本决定资料默认看哪一版、用哪套结算。
 * 结算内核还没接入的版本（status = coming）灰掉不能选，写明原因；它的资料照样能在③里勾选下载。
 */
const app = useAppStore()
const versions = computed(() => buildRuleFamilies(app.svc().rules).find((f) => f.family === wizard.family)?.versions ?? [])

function choose(v: RuleCard): void {
  if (v.status === 'installed') chooseVersion(app.svc(), v.id, v.versionLabel)
}
</script>

<template>
  <div class="page-stack">
    <h3 class="trpg-wizard__title">选择规则版本</h3>
    <div class="trpg-rulecards" role="radiogroup" aria-label="规则版本">
      <div
        v-for="v in versions"
        :key="v.id"
        class="trpg-rulecard"
        role="radio"
        :aria-checked="wizard.ruleId === v.id"
        :aria-disabled="v.status !== 'installed'"
        :tabindex="v.status === 'installed' ? 0 : -1"
        :data-status="v.status"
        data-testid="version-card"
        @click="choose(v)"
        @keydown.enter.prevent="choose(v)"
        @keydown.space.prevent="choose(v)"
      >
        <span class="trpg-rulecard__mark" aria-hidden="true"><Icon :name="wizard.ruleId === v.id ? 'check-circle' : 'info'" :size="20" /></span>
        <span class="trpg-rulecard__body">
          <span class="trpg-term">{{ v.name }}</span>
          <span class="trpg-field__hint">{{ v.description }}</span>
          <template v-if="v.status !== 'installed'">
            <span class="trpg-badge">结算规则还没接入</span>
            <span class="trpg-field__hint">暂时不能用它建战役；这一版的资料可以在下一步切到「{{ v.versionLabel }}」勾选下载。</span>
          </template>
        </span>
      </div>
    </div>
  </div>
</template>
