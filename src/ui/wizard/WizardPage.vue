<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { SAVE_NAME_MAX } from '../../schemas/campaign'
import { useAppStore } from '../../stores/app'
import { useCampaignStore } from '../../stores/campaign'
import { useDownloadsStore } from '../../stores/downloads'
import { useModalStore } from '../../stores/modal'
import { useToastStore } from '../../stores/toast'
import { useUiStore } from '../../stores/ui'
import { errorText } from '../format'
import Icon from '../kit/Icon.vue'
import { buildRuleFamilies } from '../../rules/registry'
import { chooseVersion, picksInput } from './data'
import StepData from './StepData.vue'
import StepName from './StepName.vue'
import StepRule from './StepRule.vue'
import StepVersion from './StepVersion.vue'
import { WIZARD_CODE_SET, pickedOf, wizard, wizardOptions } from './state'

const app = useAppStore()
const campaign = useCampaignStore()
const downloads = useDownloadsStore()
const modal = useModalStore()
const toast = useToastStore()
const ui = useUiStore()
const working = ref(false)

const STEPS = [{ n: 1, label: '规则' }, { n: 2, label: '版本' }, { n: 3, label: '资料' }, { n: 4, label: '命名' }] as const
const nameOk = computed(() => wizard.name.trim().length > 0 && wizard.name.trim().length <= SAVE_NAME_MAX)
const blocked = computed(() => !!wizardOptions.value?.blockingError)
const ready = computed(() => app.svc().rules.ready(wizard.ruleId))
const canNext = computed(() => {
  if (wizard.step === 1) return !!wizard.family
  if (wizard.step === 2) return !!wizard.ruleId && ready.value
  if (wizard.step === 3) return !blocked.value
  if (wizard.step === 4) return nameOk.value && !working.value
  return true
})
const stepLabel = computed(() => STEPS.find((s) => s.n === wizard.step)?.label)

onMounted(() => {
  // 只有一个能用的体系就自动选中，并预选它第一个能建战役的版本；弹窗一打开就在后台取这个版本的书架，到第③步时通常已经好了
  const families = buildRuleFamilies(app.svc().rules).filter((f) => f.ready)
  if (!wizard.family && families.length === 1) {
    wizard.family = families[0].family
    const first = families[0].versions.find((v) => v.status === 'installed')
    if (first) chooseVersion(app.svc(), first.id, first.versionLabel)
  }
})

function goto(n: 1 | 2 | 3 | 4): void {
  if (n < wizard.step) wizard.step = n
}
function next(): void {
  if (wizard.step < 4) wizard.step = (wizard.step + 1) as 2 | 3 | 4
  else void start()
}
function prev(): void {
  if (wizard.step > 1) wizard.step = (wizard.step - 1) as 1 | 2 | 3
}

async function start(): Promise<void> {
  if (!nameOk.value || working.value || blocked.value) return
  working.value = true
  try {
    const name = wizard.name.trim()
    const owner = campaign.owner
    if (!owner) throw new Error('请先在酒馆中打开一个聊天')
    // 已下载的书默认在战役里看得见（B-32），勾选的下载完也看得见，所以不用再记加入 / 排除
    const result = await campaign.startWith((s) => s.backend.starter.startCampaign({
      ...owner, ruleId: wizard.ruleId, name, note: wizard.note, codeSet: WIZARD_CODE_SET, ...picksInput(),
    }))
    for (const a of pickedOf('adventure')) if (a.id) downloads.rememberName(a.set, a.id, a.name)
    downloads.refresh()
    void result.finished.then(({ errors }) => { if (errors.length) console.error('[trpg-assistant] 后台下载有问题', errors) })
    await app.refreshBackup()
    modal.close(true)
    ui.go('home')
    toast.success(`已开始「${result.save.name}」`)
  } catch (error) {
    // 罕见（规则没装好等）：弹窗不关，已填内容全保留，提示条写原因
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
          <span class="trpg-steps__n"><Icon v-if="s.n < wizard.step" name="check" :size="12" /><template v-else>{{ s.n }}</template></span><span>{{ s.label }}</span>
        </button>
      </li>
    </ol>
    <p class="trpg-steps__compact" aria-hidden="true">{{ wizard.step }}/{{ STEPS.length }} · {{ stepLabel }}</p>
    <div class="trpg-wizard__body">
      <StepRule v-if="wizard.step === 1" />
      <StepVersion v-else-if="wizard.step === 2" />
      <StepData v-else-if="wizard.step === 3" />
      <StepName v-else @submit="start" />
    </div>
    <footer class="trpg-wizard__foot">
      <button v-if="wizard.step > 1" class="trpg-btn" type="button" :disabled="working" @click="prev">上一步</button>
      <button class="trpg-btn trpg-btn--primary" type="button" :disabled="!canNext" data-testid="wizard-next" @click="next">{{ wizard.step === 4 ? (working ? '正在准备…' : '开始冒险') : '下一步' }}</button>
    </footer>
  </div>
</template>
