<script setup lang="ts">
import { computed, markRaw } from 'vue'
import { buildRuleCards } from '../../rules/registry'
import { useAppStore } from '../../stores/app'
import { useLibraryStore } from '../../stores/library'
import { useModalStore } from '../../stores/modal'
import InfoPage from '../kit/InfoPage.vue'
import Term from '../kit/Term.vue'
import { wizard } from './state'

const app = useAppStore()
const library = useLibraryStore()
const modal = useModalStore()
const cards = computed(() => buildRuleCards(app.svc().rules, library.catalog?.rules ?? []))

function choose(id: string, status: string): void {
  if (status !== 'installed') return
  wizard.ruleId = id
  wizard.touched = true
}

function detail(id: string, name: string, description: string): void {
  modal.push({ key: `rule:${id}`, title: name, component: markRaw(InfoPage), props: { lines: [description] } })
}
</script>

<template>
  <div class="page-stack">
    <h3 class="trpg-step-title">选择这场战役用的规则</h3>
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
        @click="choose(c.id, c.status)"
        @keydown.enter.prevent="choose(c.id, c.status)"
        @keydown.space.prevent="choose(c.id, c.status)"
      >
        <span class="trpg-rulecard__mark" aria-hidden="true">{{ wizard.ruleId === c.id ? '◉' : '○' }}</span>
        <span class="trpg-rulecard__body">
          <Term @open="detail(c.id, c.name, c.description)">{{ c.name }}</Term>
          <span class="trpg-row__meta">{{ c.description }}</span>
          <span v-if="c.status === 'coming'" class="trpg-badge">即将推出</span>
          <span v-else-if="c.status === 'installable'" class="trpg-badge" data-tone="warn">可安装</span>
        </span>
      </div>
    </div>
  </div>
</template>
