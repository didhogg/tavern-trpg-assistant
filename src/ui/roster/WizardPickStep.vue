<script setup lang="ts">
import { computed, markRaw, onMounted, ref, watch } from 'vue'
import { refKey } from '../../core/saves/split'
import { EXTRA_KINDS } from '../../rules/kernel/build-options'
import { useAppStore } from '../../stores/app'
import { useCampaignStore } from '../../stores/campaign'
import { useLibViewStore } from '../../stores/libview'
import { useUiStore } from '../../stores/ui'
import { useWizardStore, type ExtraGroup, type PickRow } from '../../stores/wizard'
import Segmented from '../kit/Segmented.vue'
import ErrorBanner from '../libview/ErrorBanner.vue'
import EntryPage from '../libview/EntryPage.vue'
import { openEntry } from '../libview/open'
import PickList from './PickList.vue'
import WizardChoices from './WizardChoices.vue'

/** 一个选条目的步骤：左边列表，右边库里同一张资料卡 + 选它 + 它要你做的选择。种族 / 背景 / 职业从库里取；
 *  子职业 / 专长 / 可选特性由后端分组给（组名、来自哪件条目、选几个、候选），有几组就出几个组名标签，点标签切换，每组各选各的。 */
const props = defineProps<{ prop: string }>()
const w = useWizardStore()
const app = useAppStore()
const campaign = useCampaignStore()
const lib = useLibViewStore()
const ui = useUiStore()
const isExtra = (EXTRA_KINDS as readonly string[]).includes(props.prop)
const ex = computed(() => isExtra ? w.extra(props.prop) : null)
const groups = computed<ExtraGroup[]>(() => ex.value?.groups ?? [])
const groupKey = ref<string>('')
// 默认停在第一个还没选满的组；组变了（换职业）就回到它
watch(groups, (gs) => { if (!gs.some((g) => g.key === groupKey.value)) groupKey.value = (gs.find((g) => w.pickedIn(g).length < g.count) ?? gs[0])?.key ?? '' }, { immediate: true })
const group = computed(() => groups.value.find((g) => g.key === groupKey.value) ?? null)
const tabs = computed(() => groups.value.map((g) => ({ value: g.key, label: `${g.title} ${w.pickedIn(g).length}/${g.count}` })))
const count = computed(() => isExtra ? group.value?.count ?? 0 : 1)
const rows = computed<PickRow[] | null>(() => isExtra ? group.value?.candidates ?? [] : w.lists[props.prop] ?? null)
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
const marked = computed(() => isExtra ? (group.value ? w.pickedIn(group.value) : []) : (w.chosen[props.prop] ?? []).map(refKey))
// 默认看已选的那条，没有就看第一条
watch(rows, (list) => { if (list?.length && !list.some((r) => r.key === picked.value)) picked.value = marked.value[0] ?? list[0].key }, { immediate: true })
const current = computed(() => rows.value?.find((r) => r.key === picked.value) ?? null)
const isOn = computed(() => !!current.value && marked.value.includes(current.value.key))
const full = computed(() => count.value > 1 && marked.value.length >= count.value && !isOn.value)
const chosenRefs = computed(() => w.chosen[props.prop] ?? [])
/** 同一条已经在别的组里选了：这里不能再选，写明在哪组。 */
const elsewhere = computed(() => { const owner = isExtra && current.value ? w.takenBy(props.prop, current.value.key) : null; return owner && owner.key !== groupKey.value ? owner : null })
function toggle(): void {
  if (!current.value) return
  if (isExtra) { if (group.value) w.chooseExtra(props.prop, group.value, current.value) } else w.choose(props.prop, current.value, count.value)
}
</script>

<template>
  <div class="wz-pick" :data-bar="(isExtra && !!group) || undefined">
    <div v-if="isExtra && group" class="wz-groups" data-testid="wz-groups">
      <Segmented v-if="groups.length > 1" v-model="groupKey" :options="tabs" :label="`${w.label(prop)}分组`" data-testid="wz-group-tabs" />
      <span v-if="group.from" class="sh-2">来自 {{ group.from }}</span>
    </div>
    <div class="wz-left">
      <ErrorBanner v-if="loadError" :text="`没读出来：${loadError}`" what="读取列表" :actions="[{ label: '重试', run: load }]" />
      <PickList v-else :rows="rows" :picked="picked" :marked="marked" :placeholder="`搜${group?.title ?? w.label(prop)}`" @pick="(r) => (picked = r.key)" />
    </div>
    <div class="wz-right" data-testid="wz-right">
      <div class="wz-sel">
        <span class="wz-sel__t">{{ current?.name ?? '' }}</span>
        <span v-if="count > 1" class="sh-2">已选 {{ marked.length }} / {{ count }}</span>
        <button class="trpg-btn trpg-btn--primary trpg-btn--small" type="button" :disabled="!current || full || !!elsewhere" data-testid="wz-choose" @click="toggle">{{ isOn ? '取消选它' : `选${isExtra ? '它' : `这个${w.label(prop)}`}` }}</button>
        <button v-if="!wide" class="trpg-btn trpg-btn--small" type="button" :disabled="!current" @click="current && openEntry(current.ref, current.name)">看资料卡</button>
      </div>
      <div v-if="w.optError" class="wz-err" role="alert">选项读取失败：{{ w.optError }}<button class="trpg-btn trpg-btn--small" type="button" @click="w.refreshOptions()">重试</button></div>
      <p v-if="elsewhere" class="wz-note" data-testid="wz-elsewhere">已经在「{{ elsewhere.title }}」里选了它。</p>
      <p v-if="current?.requirement" class="wz-note" data-testid="wz-requirement">前置条件：{{ current.requirement }}（还不能自动判断，请自己核对）</p>
      <p v-else-if="group?.unfiltered" class="wz-note">这一组里有的条目带前置条件，还不能自动判断；选中带条件的条目时会写出条件。</p>
      <WizardChoices v-for="r in chosenRefs" :key="refKey(r)" :item-ref="r" />
      <p v-if="!isExtra && !chosenRefs.length" class="wz-note">选好{{ w.label(prop) }}后，这里会列出它要你做的选择。</p>
      <div v-if="wide && current && lib.campaignLib" class="wz-card" data-testid="wz-card"><component :is="CardPane" :key="current.key" :entry-ref="current.ref" :page-key="`wz:${current.key}`" /></div>
    </div>
  </div>
</template>
