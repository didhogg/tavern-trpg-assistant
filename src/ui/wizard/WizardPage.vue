<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { SAVE_NAME_MAX } from '../../schemas/campaign'
import { useAppStore } from '../../stores/app'
import { useCampaignStore } from '../../stores/campaign'
import { useModalStore } from '../../stores/modal'
import { useToastStore } from '../../stores/toast'
import { useUiStore } from '../../stores/ui'
import { errorText } from '../format'
import StepName from './StepName.vue'
import StepRule from './StepRule.vue'
import { wizard } from './state'

const app = useAppStore()
const campaign = useCampaignStore()
const modal = useModalStore()
const toast = useToastStore()
const ui = useUiStore()
const working = ref(false)

const STEPS = [{ n: 1, label: '规则' }, { n: 2, label: '命名' }] as const
const nameOk = computed(() => wizard.name.trim().length > 0 && wizard.name.trim().length <= SAVE_NAME_MAX)
const canNext = computed(() => (wizard.step === 1 ? !!wizard.ruleId : nameOk.value && !working.value))
const stepLabel = computed(() => STEPS.find((s) => s.n === wizard.step)?.label)

onMounted(() => {
  const installedRules = app.svc().rules.list()
  if (!wizard.ruleId && installedRules.length === 1) wizard.ruleId = installedRules[0].id
})

function goto(n: 1 | 2): void {
  if (n < wizard.step) wizard.step = n
}

function next(): void {
  if (wizard.step === 1) wizard.step = 2
  else void start()
}

function prev(): void {
  if (wizard.step > 1) wizard.step = 1
}

async function start(): Promise<void> {
  if (!nameOk.value || working.value) return
  working.value = true
  try {
    const save = await campaign.startNew({ ruleId: wizard.ruleId, name: wizard.name.trim(), note: wizard.note })
    await app.refreshBackup()
    modal.close(true)
    ui.go('home')
    toast.success(`已开始「${save.name}」`)
  } catch (error) {
    console.error('[trpg-assistant] 开始冒险失败', error)
    toast.error(`没能开始：${errorText(error)}`)
  } finally {
    working.value = false
  }
}
</script>

<template>
  <div class="trpg-wizard" data-testid="wizard">
    <ol class="trpg-steps" aria-label="步骤">
      <li v-for="s in STEPS" :key="s.n" :data-state="s.n === wizard.step ? 'current' : s.n < wizard.step ? 'done' : 'todo'">
        <button type="button" :aria-current="s.n === wizard.step ? 'step' : undefined" :disabled="s.n >= wizard.step" @click="goto(s.n)">
          <span class="trpg-steps__n">{{ s.n }}</span><span class="trpg-steps__label">{{ s.label }}</span>
        </button>
      </li>
    </ol>
    <p class="trpg-steps__compact" aria-hidden="true">{{ wizard.step }}/{{ STEPS.length }} · {{ stepLabel }}</p>
    <div class="trpg-wizard__body">
      <StepRule v-if="wizard.step === 1" />
      <StepName v-else @submit="start" />
    </div>
    <footer class="trpg-wizard__foot">
      <button class="trpg-btn" type="button" :disabled="wizard.step === 1 || working" @click="prev">上一步</button>
      <button class="trpg-btn trpg-btn--primary" type="button" :disabled="!canNext" data-testid="wizard-next" @click="next">{{ wizard.step === 2 ? (working ? '正在准备…' : '开始冒险') : '下一步' }}</button>
    </footer>
  </div>
</template>
