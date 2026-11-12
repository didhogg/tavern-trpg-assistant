<script setup lang="ts">
import { computed } from 'vue'
import { buildRuleFamilies, type RuleFamily } from '../../rules/registry'
import { useAppStore } from '../../stores/app'
import Icon from '../kit/Icon.vue'
import { chooseVersion } from './data'
import { wizard } from './state'

/** ① 选规则（体系）：来自规则登记表按体系分组；选了体系就预选它第一个能建战役的版本，②可以直接下一步。 */
const app = useAppStore()
const families = computed(() => buildRuleFamilies(app.svc().rules))

function choose(f: RuleFamily): void {
  if (!f.ready) return
  wizard.family = f.family
  if (f.versions.some((v) => v.id === wizard.ruleId)) return
  const first = f.versions.find((v) => v.status === 'installed')
  if (first) chooseVersion(app.svc(), first.id, first.versionLabel)
}
</script>

<template>
  <div class="page-stack">
    <h3 class="trpg-wizard__title">选择这场战役用的规则</h3>
    <div class="trpg-rulecards" role="radiogroup" aria-label="规则">
      <div
        v-for="f in families"
        :key="f.family"
        class="trpg-rulecard"
        role="radio"
        :aria-checked="wizard.family === f.family"
        :aria-disabled="!f.ready"
        :tabindex="f.ready ? 0 : -1"
        :data-status="f.ready ? 'installed' : 'coming'"
        data-testid="rule-card"
        @click="choose(f)"
        @keydown.enter.prevent="choose(f)"
        @keydown.space.prevent="choose(f)"
      >
        <span class="trpg-rulecard__mark" aria-hidden="true"><Icon :name="wizard.family === f.family ? 'check-circle' : 'info'" :size="20" /></span>
        <span class="trpg-rulecard__body">
          <span class="trpg-term">{{ f.name }}</span>
          <span class="trpg-field__hint">版本：{{ f.versions.map((v) => v.versionLabel).join(' / ') }}，下一步选</span>
          <span v-if="!f.ready" class="trpg-badge">即将推出</span>
        </span>
      </div>
    </div>
  </div>
</template>
