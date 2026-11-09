<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { SAVE_NAME_MAX, SAVE_NOTE_MAX } from '../../schemas/campaign'
import { useAppStore } from '../../stores/app'
import { useCampaignStore } from '../../stores/campaign'
import { useSavesStore } from '../../stores/saves'
import { sizeOf, wizard, wizardOptions } from './state'

const emit = defineEmits<{ submit: [] }>()
const app = useAppStore()
const campaign = useCampaignStore()
const saves = useSavesStore()
const input = ref<HTMLInputElement | null>(null)
const rule = computed(() => app.svc().rules.get(wizard.ruleId))
const tooLong = computed(() => wizard.name.trim().length > SAVE_NAME_MAX)
const empty = computed(() => wizard.name.trim().length === 0)
const invalid = computed(() => empty.value || tooLong.value)
const data = computed(() => sizeOf('data'))
const adv = computed(() => sizeOf('adv'))
const ruleName = computed(() => wizardOptions.value?.rule.name ?? rule.value?.name ?? '')
const currentCampaign = computed(() => (campaign.hasCampaign ? (saves.view?.name ?? campaign.currentSave?.name ?? null) : null))

onMounted(() => {
  if (!wizard.nameEdited || !wizard.name) {
    const d = new Date(app.svc().now())
    wizard.name = `${rule.value?.nameShort ?? '战役'} · ${d.getMonth() + 1}月${d.getDate()}日`
  }
  input.value?.focus()
  input.value?.select()
})
</script>

<template>
  <form class="page-stack" style="gap: 12px" @submit.prevent="emit('submit')">
    <h3 class="trpg-wizard__title" style="margin: 0">给这场战役起个名字</h3>
    <div class="trpg-field" style="margin: 0">
      <label class="trpg-field__label" for="trpg-wizard-name">战役名称</label>
      <input id="trpg-wizard-name" ref="input" v-model="wizard.name" class="trpg-input" :aria-invalid="invalid" type="text" autocomplete="off" data-testid="wizard-name" @input="wizard.nameEdited = true" />
      <span v-if="invalid" class="trpg-field__err" role="alert">⚠ {{ empty ? '请输入战役名称' : `名称最多 ${SAVE_NAME_MAX} 个字` }}</span>
      <span v-else class="trpg-field__hint">1–{{ SAVE_NAME_MAX }} 字，之后可以在存档里改名</span>
    </div>
    <div class="trpg-field" style="margin: 0">
      <label class="trpg-field__label" for="trpg-wizard-note">备注（可空）</label>
      <textarea id="trpg-wizard-note" v-model="wizard.note" class="trpg-input" rows="2" style="min-height: 56px" :maxlength="SAVE_NOTE_MAX" placeholder="比如：周五晚的跑团" />
    </div>
    <div class="trpg-summary" data-testid="wizard-summary">
      <b>将建立战役：{{ wizard.name.trim() || '（未命名）' }}</b>
      <span>{{ ruleName }} · 资料（{{ data.text }}） · 冒险（{{ adv.text }}）</span>
      <span v-if="currentCampaign" class="trpg-field__hint">当前战役「{{ currentCampaign }}」会先自动存档。</span>
    </div>
  </form>
</template>
