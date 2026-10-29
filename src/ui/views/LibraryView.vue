<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useAppStore } from '../../stores/app'
import { useCampaignStore } from '../../stores/campaign'
import { useLibraryStore } from '../../stores/library'
import { useUiStore, type LibrarySegment } from '../../stores/ui'
import { openImport } from '../imports/openImport'
import Icon from '../kit/Icon.vue'
import Segmented from '../kit/Segmented.vue'
import ExtList from '../library/ExtList.vue'
import HealthSubpage from '../library/HealthSubpage.vue'
import MineSubpage from '../library/MineSubpage.vue'
import MineTab from '../library/MineTab.vue'
import SaveTab from '../library/SaveTab.vue'
import VariantsSubpage from '../library/VariantsSubpage.vue'

const app = useAppStore()
const campaign = useCampaignStore()
const library = useLibraryStore()
const ui = useUiStore()
const picker = ref<HTMLInputElement | null>(null)
const sub = ref<{ kind: 'variants' } | { kind: 'health' } | { kind: 'mine'; packId: string } | null>(null)

onMounted(() => void library.refreshInstalled())

const rules = computed(() => app.svc().rules.list())
const ruleId = computed(() => campaign.workspace?.ruleId ?? rules.value[0]?.id ?? '')
const ruleName = computed(() => app.svc().rules.get(ruleId.value)?.name ?? '')
const hasSave = computed(() => campaign.hasCampaign)
const segments = computed(() => [...(hasSave.value ? [{ value: 'save', label: '本存档' }] : []), { value: 'ext', label: '扩展' }, { value: 'mine', label: '我的' }])
const segment = computed<LibrarySegment>({
  get: () => (ui.librarySegment === 'save' && !hasSave.value ? 'ext' : ui.librarySegment),
  set: (v) => {
    ui.librarySegment = v
    sub.value = null
  },
})
watch(() => ui.librarySegment, () => (sub.value = null))

function onFile(event: Event): void {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (file) openImport(file)
}
</script>

<template>
  <div v-if="!app.booted" class="trpg-skeleton" aria-busy="true" />
  <div v-else class="page-stack" data-testid="library">
    <template v-if="!sub">
      <div class="trpg-toolbar trpg-toolbar--between">
        <Segmented v-model="segment" label="库分段" :options="segments" />
        <span class="trpg-toolbar__end">
          <span class="trpg-row__meta" data-testid="library-rule">{{ ruleName }}</span>
          <button class="trpg-btn trpg-btn--small" type="button" :disabled="campaign.readOnly" @click="picker?.click()"><Icon name="download-simple" :size="14" />导入文件</button>
          <input ref="picker" class="trpg-sr-only" type="file" accept=".trpgpack,.trpgsave,.zip" tabindex="-1" aria-hidden="true" @change="onFile" />
        </span>
      </div>
      <SaveTab v-if="segment === 'save' && hasSave" @sub="(n) => (sub = { kind: n })" />
      <ExtList v-else-if="segment === 'ext'" :rule-id="ruleId" />
      <MineTab v-else-if="segment === 'mine'" :rule-id="ruleId" @edit="(id) => (sub = { kind: 'mine', packId: id })" />
    </template>
    <VariantsSubpage v-else-if="sub.kind === 'variants'" @back="sub = null" />
    <HealthSubpage v-else-if="sub.kind === 'health'" @back="sub = null" />
    <MineSubpage v-else :pack-id="sub.packId" @back="sub = null" />
  </div>
</template>
