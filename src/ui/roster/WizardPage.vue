<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { CATEGORIES, type CategoryId } from '../../stores/roster'
import { useCampaignStore } from '../../stores/campaign'
import { useModalStore } from '../../stores/modal'
import { useWizardStore } from '../../stores/wizard'
import Icon from '../kit/Icon.vue'
import Segmented from '../kit/Segmented.vue'
import WizardAbilities from './WizardAbilities.vue'
import WizardDone from './WizardDone.vue'
import WizardEquipment from './WizardEquipment.vue'
import WizardPickStep from './WizardPickStep.vue'

/** 分步建卡：步骤标签（照规则数据 + 后端「额外必选项」，子职业 / 专长 / 可选特性有才出现）· 每步一页 · 上一步 / 下一步。关掉窗口 = 直接丢掉。 */
const w = useWizardStore()
const modal = useModalStore()
const campaign = useCampaignStore()
const idx = computed(() => w.steps.indexOf(w.cur))
const last = computed(() => w.cur === 'done')
onMounted(() => void w.refreshOptions())
async function create(): Promise<void> { if (await w.create()) modal.close() }
</script>

<template>
  <div class="wz" data-testid="wizard-page">
    <div class="wz-tabs" role="tablist" aria-label="建卡步骤">
      <button v-for="(id, i) in w.steps" :key="id" class="wz-step" type="button" role="tab" :data-s="w.status(id)" :aria-current="id === w.cur ? 'step' : undefined" :data-testid="`wz-step-${id}`" @click="w.go(id)">
        <i><Icon v-if="w.status(id) === 'done' && id !== w.cur" name="check" :size="12" /><template v-else>{{ i + 1 }}</template></i>{{ w.label(id) }}
      </button>
    </div>
    <div class="wz-body">
      <div v-if="w.cur === 'name'" class="wz-form" data-testid="wz-name-step">
        <p class="wz-note">只有名字必填；后面每一步都能跳过，没选的在最后一页的「待填」里。</p>
        <label class="trpg-field"><span class="trpg-field__label">名字 <b class="sh-warn">*</b></span><input v-model="w.name" class="trpg-input" type="text" maxlength="60" placeholder="给人物起个名字" data-testid="wz-name" data-autofocus /></label>
        <div class="trpg-field"><span class="trpg-field__label">放进</span><Segmented :model-value="w.category" label="放进哪一类" :options="CATEGORIES.map((c) => ({ value: c.id, label: c.label }))" @update:model-value="(v) => (w.category = v as CategoryId)" /></div>
      </div>
      <WizardAbilities v-else-if="w.cur === 'abilities'" />
      <WizardEquipment v-else-if="w.cur === 'equipment'" />
      <WizardDone v-else-if="last" />
      <WizardPickStep v-else :key="w.cur" :prop="w.cur" />
    </div>
    <div class="wz-foot">
      <small class="sh-2">关掉窗口 = 丢掉已选的内容</small><span class="wz-foot__sp" />
      <button class="trpg-btn" type="button" :disabled="idx <= 0" @click="w.move(-1)"><Icon name="caret-left" :size="14" />上一步</button>
      <button v-if="!last" class="trpg-btn trpg-btn--primary" type="button" data-testid="wz-next" @click="w.move(1)">下一步</button>
      <button v-else class="trpg-btn trpg-btn--primary" type="button" :disabled="w.creating || campaign.readOnly || !w.name.trim()" data-testid="wz-create" @click="create">{{ w.creating ? '正在创建…' : `创建「${w.name.trim() || '…'}」` }}</button>
    </div>
  </div>
</template>
