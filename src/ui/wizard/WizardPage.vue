<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { FEATURES } from '../../core/features'
import { SAVE_NAME_MAX } from '../../schemas/campaign'
import { useAppStore } from '../../stores/app'
import { useCampaignStore } from '../../stores/campaign'
import { useLibraryStore } from '../../stores/library'
import { useModalStore } from '../../stores/modal'
import { useToastStore } from '../../stores/toast'
import { useUiStore } from '../../stores/ui'
import { errorText } from '../format'
import { buildPackRows } from '../library/rows'
import StepAdventure from './StepAdventure.vue'
import StepName from './StepName.vue'
import StepPacks from './StepPacks.vue'
import StepRule from './StepRule.vue'
import { wizard } from './state'

const app = useAppStore()
const campaign = useCampaignStore()
const library = useLibraryStore()
const modal = useModalStore()
const toast = useToastStore()
const ui = useUiStore()
const working = ref(false)

const STEPS = [{ n: 1, label: '规则' }, { n: 2, label: '资料' }, { n: 3, label: '冒险' }, { n: 4, label: '命名' }] as const
const hasAdventures = computed(() => buildPackRows(library.installed, library.catalog, wizard.ruleId).some((r) => r.category === 'adventure'))
const skipAdventure = computed(() => !FEATURES.adventureImport || !hasAdventures.value)
const skipReason = computed(() => (!FEATURES.adventureImport ? '冒险导入随后续版本提供' : '库里还没有冒险'))
const nameOk = computed(() => wizard.name.trim().length > 0 && wizard.name.trim().length <= SAVE_NAME_MAX)
const canNext = computed(() => (wizard.step === 1 ? !!wizard.ruleId : wizard.step === 4 ? nameOk.value && !working.value : true))
const stepLabel = computed(() => STEPS.find((s) => s.n === wizard.step)?.label)

onMounted(async () => {
  await library.refreshInstalled()
  void library.loadCatalog()
  const installedRules = app.svc().rules.list()
  if (!wizard.ruleId && installedRules.length === 1) wizard.ruleId = installedRules[0].id
})

function goto(n: 1 | 2 | 3 | 4): void {
  if (n < wizard.step && !(n === 3 && skipAdventure.value)) wizard.step = n
}

function next(): void {
  if (wizard.step === 1) wizard.step = 2
  else if (wizard.step === 2) wizard.step = skipAdventure.value ? 4 : 3
  else if (wizard.step === 3) wizard.step = 4
  else void start()
}

function prev(): void {
  if (wizard.step === 4) wizard.step = skipAdventure.value ? 2 : 3
  else if (wizard.step > 1) wizard.step = (wizard.step - 1) as 1 | 2 | 3
}

async function start(): Promise<void> {
  if (!nameOk.value || working.value) return
  working.value = true
  try {
    await library.waitFor(wizard.packIds)
    await library.refreshInstalled()
    const ready = wizard.packIds.filter((id) => library.installedMap.has(id))
    const missing = wizard.packIds.length - ready.length
    const save = await campaign.startNew({ ruleId: wizard.ruleId, packIds: ready, name: wizard.name.trim(), note: wizard.note })
    await app.refreshBackup()
    modal.close(true)
    ui.go('home')
    toast.success(`已开始「${save.name}」`)
    if (missing > 0) toast.info(`${missing} 本资料还没装好，可以稍后在库里补装`)
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
      <li v-for="s in STEPS" :key="s.n" :data-state="s.n === wizard.step ? 'current' : s.n < wizard.step ? 'done' : 'todo'" :data-skipped="s.n === 3 && skipAdventure">
        <button type="button" :aria-current="s.n === wizard.step ? 'step' : undefined" :disabled="s.n >= wizard.step || (s.n === 3 && skipAdventure)" :title="s.n === 3 && skipAdventure ? skipReason : undefined" @click="goto(s.n)">
          <span class="trpg-steps__n">{{ s.n }}</span><span class="trpg-steps__label">{{ s.label }}</span>
        </button>
      </li>
    </ol>
    <p class="trpg-steps__compact" aria-hidden="true">{{ wizard.step }}/4 · {{ stepLabel }}</p>
    <div class="trpg-wizard__body">
      <StepRule v-if="wizard.step === 1" />
      <StepPacks v-else-if="wizard.step === 2" />
      <StepAdventure v-else-if="wizard.step === 3" />
      <StepName v-else @submit="start" />
    </div>
    <footer class="trpg-wizard__foot">
      <button class="trpg-btn" type="button" :disabled="wizard.step === 1 || working" @click="prev">上一步</button>
      <button class="trpg-btn trpg-btn--primary" type="button" :disabled="!canNext" data-testid="wizard-next" @click="next">{{ wizard.step === 4 ? (working ? '正在准备…' : '开始冒险') : '下一步' }}</button>
    </footer>
  </div>
</template>
