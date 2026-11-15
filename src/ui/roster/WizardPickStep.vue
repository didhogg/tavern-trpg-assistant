<script setup lang="ts">
import { computed, markRaw, onMounted, ref, watch } from 'vue'
import { refKey } from '../../core/saves/split'
import { EXTRA_KINDS } from '../../rules/kernel/build-options'
import { useAppStore } from '../../stores/app'
import { useCampaignStore } from '../../stores/campaign'
import { useLibViewStore } from '../../stores/libview'
import { useUiStore } from '../../stores/ui'
import { useWizardStore, type PickRow } from '../../stores/wizard'
import ErrorBanner from '../libview/ErrorBanner.vue'
import EntryPage from '../libview/EntryPage.vue'
import { openEntry } from '../libview/open'
import PickList from './PickList.vue'
import WizardChoices from './WizardChoices.vue'

/** 一个选条目的步骤：左边列表，右边库里同一张资料卡 + 选它 + 它要你做的选择。种族 / 背景 / 职业从库里取；子职业 / 专长 / 可选特性的候选由后端给。 */
const props = defineProps<{ prop: string }>()
const w = useWizardStore()
const app = useAppStore()
const campaign = useCampaignStore()
const lib = useLibViewStore()
const ui = useUiStore()
const isExtra = (EXTRA_KINDS as readonly string[]).includes(props.prop)
const ex = computed(() => isExtra ? w.extra(props.prop) : null)
const count = computed(() => ex.value?.count ?? 1)
const rows = computed<PickRow[] | null>(() => isExtra ? ex.value?.candidates ?? [] : w.lists[props.prop] ?? null)
const loadError = ref<string | null>(null)
const picked = ref<string | null>(null)
const wide = computed(() => ui.layout === 'wide')
const CardPane = markRaw(EntryPage)

async function load(): Promise<void> {
  loadError.value = null
  try { if (!isExtra) await w.loadList(props.prop) } catch (e) { console.error('[trpg-assistant] 读取列表失败', e); loadError.value = e instanceof Error ? e.message : String(e) }
}
onMounted(() => {
  void load()
  if (!lib.campaignLib || !lib.bound) void lib.load(app.svc(), campaign.owner?.ownerKey ?? null)
})
const marked = computed(() => (w.chosen[props.prop] ?? []).map(refKey))
// 默认看已选的那条，没有就看第一条
watch(rows, (list) => { if (list?.length && !list.some((r) => r.key === picked.value)) picked.value = marked.value[0] ?? list[0].key }, { immediate: true })
const current = computed(() => rows.value?.find((r) => r.key === picked.value) ?? null)
const isOn = computed(() => !!current.value && marked.value.includes(current.value.key))
const full = computed(() => count.value > 1 && marked.value.length >= count.value && !isOn.value)
const chosenRefs = computed(() => w.chosen[props.prop] ?? [])
</script>

<template>
  <div class="wz-pick">
    <div class="wz-left">
      <ErrorBanner v-if="loadError" :text="`没读出来：${loadError}`" what="读取列表" :actions="[{ label: '重试', run: load }]" />
      <PickList v-else :rows="rows" :picked="picked" :marked="marked" :placeholder="`搜${w.label(prop)}`" @pick="(r) => (picked = r.key)" />
    </div>
    <div class="wz-right" data-testid="wz-right">
      <div class="wz-sel">
        <span class="wz-sel__t">{{ current?.name ?? '' }}</span>
        <span v-if="count > 1" class="sh-2">已选 {{ marked.length }} / {{ count }}</span>
        <button class="trpg-btn trpg-btn--primary trpg-btn--small" type="button" :disabled="!current || full" data-testid="wz-choose" @click="current && w.choose(prop, current, count)">{{ isOn ? '取消选它' : `选${isExtra ? '它' : `这个${w.label(prop)}`}` }}</button>
        <button v-if="!wide" class="trpg-btn trpg-btn--small" type="button" :disabled="!current" @click="current && openEntry(current.ref, current.name)">看资料卡</button>
      </div>
      <div v-if="w.optError" class="wz-err" role="alert">选项读取失败：{{ w.optError }}<button class="trpg-btn trpg-btn--small" type="button" @click="w.refreshOptions()">重试</button></div>
      <p v-if="isExtra && ex?.candidates.length && prop === 'feat'" class="wz-note">列表是全部专长；带前置条件的只是标出来，还不能自动判断你满不满足，请自己看一眼。</p>
      <WizardChoices v-for="r in chosenRefs" :key="refKey(r)" :item-ref="r" />
      <p v-if="!isExtra && !chosenRefs.length" class="wz-note">选好{{ w.label(prop) }}后，这里会列出它要你做的选择。</p>
      <div v-if="wide && current && lib.campaignLib" class="wz-card" data-testid="wz-card"><component :is="CardPane" :key="current.key" :entry-ref="current.ref" :page-key="`wz:${current.key}`" /></div>
    </div>
  </div>
</template>
