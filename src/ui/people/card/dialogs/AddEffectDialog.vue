<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useCampaignStore } from '../../../../stores/campaign'
import { useModalStore } from '../../../../stores/modal'
import Icon from '../../../kit/Icon.vue'
import EntryDetailPage from '../../../library/EntryDetailPage.vue'
import { loadEffectEntries, type CardEntry } from '../cardData'
import type { CardCtx } from '../cardCtx'
import { EFFECT_TABS, OTHER_SUB, activeRef, concentrationConflict, customEffect, effectFromEntry, tabOf, type EffectTab } from '../effectOps'
import { durationText } from '../effectText'
import DialogFrame from './DialogFrame.vue'

const props = defineProps<{ ctx: CardCtx }>()
const modal = useModalStore()
const campaign = useCampaignStore()
const entries = ref<CardEntry[]>([])
const loading = ref(true)
const query = ref('')
const tab = ref<EffectTab>('condition')
const chosen = ref<string | null>(null)
const custom = ref({ name: '', duration: '', note: '' })
const showDetail = ref(false)
let seq = 0
const ro = computed(() => props.ctx.readOnly)
onMounted(async () => {
  try { entries.value = await loadEffectEntries(campaign.workspace?.ruleId ?? 'dnd5e2014', campaign.workspace?.enabledPacks.map((p) => p.id) ?? []) } finally { loading.value = false }
  const first = list.value[0]; if (first) chosen.value = first.entry.id
})
const needle = computed(() => query.value.trim().toLowerCase())
const list = computed(() => {
  if (tab.value === 'other' && !needle.value) return []
  return entries.value.filter((r) => tabOf(r.entry) === tab.value && (!needle.value || r.entry.name.toLowerCase().includes(needle.value) || (r.entry.nameEn ?? '').toLowerCase().includes(needle.value))).slice(0, 80)
})
const current = computed(() => entries.value.find((r) => r.entry.id === chosen.value))
const active = computed(() => (chosen.value ? activeRef(props.ctx.person.effects, chosen.value) : undefined))
const conflict = computed(() => (current.value ? concentrationConflict(props.ctx.person.effects, effectFromEntry(current.value.entry, 0, 0)) : undefined))
const isCustom = computed(() => tab.value === 'other' && chosen.value === '__custom')
const tabCount = computed(() => Object.fromEntries(EFFECT_TABS.map((t) => [t.key, entries.value.filter((r) => tabOf(r.entry) === t.key).length])))
function setTab(key: EffectTab): void { tab.value = key; chosen.value = list.value[0]?.entry.id ?? (key === 'other' ? '__custom' : null); showDetail.value = false }
function pick(id: string): void { chosen.value = id; showDetail.value = true }
function add(): void {
  if (ro.value) return
  const now = Date.now()
  const fx = isCustom.value ? customEffect(custom.value.name, custom.value.duration, custom.value.note, now, seq++) : current.value ? effectFromEntry(current.value.entry, now, seq++) : null
  if (!fx || !fx.name) return
  props.ctx.commitLive({ effects: [...props.ctx.person.effects, fx] })
  if (isCustom.value) custom.value = { name: '', duration: '', note: '' }
}
function remove(): void { if (active.value && !ro.value) props.ctx.commitLive({ effects: props.ctx.person.effects.filter((e) => e.id !== active.value!.id) }) }
const subOf = (r: CardEntry): string => (tab.value === 'other' ? OTHER_SUB[r.entry.type] ?? '' : '')
</script>

<template>
  <DialogFrame :tabs="EFFECT_TABS.map((t) => ({ key: t.key, label: t.label, count: tabCount[t.key] }))" :tab="tab" tab-label="效果分类" note="添加、移除立刻生效，不用点保存" @update:tab="setTab($event as EffectTab)">
    <div class="trpg-fx__search"><Icon name="magnifying-glass" :size="16" /><input v-model="query" class="trpg-input" type="search" placeholder="搜状态、疾病、法术效果、其他…" aria-label="搜索效果" data-testid="fx-search" /></div>
    <div class="trpg-fx__split" :class="{ 'is-detail': showDetail }">
      <ul class="trpg-fx__list" aria-label="候选列表">
        <li v-if="loading" class="trpg-card-empty">正在读取资料…</li>
        <li v-for="r in list" :key="r.entry.id"><button class="trpg-fx__item" :class="{ 'is-on': chosen === r.entry.id }" type="button" :data-testid="`fx-item-${r.entry.id}`" @click="pick(r.entry.id)"><span class="trpg-fx__name">{{ r.entry.name }}<small v-if="r.entry.nameEn">{{ r.entry.nameEn }}</small></span><small v-if="subOf(r)" class="trpg-fx__sub">{{ subOf(r) }}</small><span v-if="activeRef(ctx.person.effects, r.entry.id)" class="trpg-fx__on"><Icon name="check" :size="16" />已生效</span></button></li>
        <li v-if="tab === 'other'"><button class="trpg-fx__item" :class="{ 'is-on': chosen === '__custom' }" type="button" data-testid="fx-custom" @click="pick('__custom')"><Icon name="plus" :size="16" />自定义效果</button></li>
        <li v-if="!loading && !list.length && tab !== 'other'" class="trpg-card-empty">没有匹配的。</li>
        <li v-if="tab === 'other' && !needle" class="trpg-card-empty">输入名字搜特性、物品、环境。</li>
      </ul>
      <section class="trpg-fx__sheet" aria-label="资料片">
        <button class="trpg-btn trpg-btn--quiet trpg-btn--small trpg-fx__back" type="button" @click="showDetail = false"><Icon name="caret-left" :size="16" />回到列表</button>
        <div v-if="isCustom" class="trpg-fx__form"><h3>自定义效果</h3>
          <label class="trpg-field"><span class="trpg-field__label">名称</span><input v-model="custom.name" class="trpg-input" maxlength="80" aria-label="效果名称" /></label>
          <label class="trpg-field"><span class="trpg-field__label">时长（写文字，如 1 分钟）</span><input v-model="custom.duration" class="trpg-input" maxlength="40" aria-label="效果时长" /></label>
          <label class="trpg-field"><span class="trpg-field__label">说明</span><textarea v-model="custom.note" class="trpg-input" maxlength="400" aria-label="效果说明" /></label>
        </div>
        <template v-else-if="current">
          <h3>{{ current.entry.name }}<small v-if="current.entry.nameEn"> {{ current.entry.nameEn }}</small></h3>
          <dl class="trpg-info__rows"><div class="trpg-info__row"><dt>类别</dt><dd>{{ EFFECT_TABS.find((t) => t.key === tab)?.label }}</dd></div><div class="trpg-info__row"><dt>来源</dt><dd>{{ current.badge }}</dd></div><div v-if="effectFromEntry(current.entry, 0, 0).duration" class="trpg-info__row"><dt>时长</dt><dd>{{ durationText(effectFromEntry(current.entry, 0, 0).duration) }}{{ effectFromEntry(current.entry, 0, 0).concentration ? ' · 专注' : '' }}</dd></div></dl>
          <EntryDetailPage :pack-id="current.packId" :entry-id="current.entry.id" compact />
        </template>
        <p v-else class="trpg-card-empty">在左边选一个，这里显示资料。</p>
      </section>
    </div>
    <p v-if="conflict && !active" class="trpg-fx__warn" role="status"><Icon name="warning" :size="16" />已在专注「{{ conflict }}」，再加会结束它（不会自动移除，由你决定）</p>
    <template #actions>
      <button v-if="active" class="trpg-btn" type="button" :disabled="ro" data-testid="fx-remove" @click="remove">移除这个效果</button>
      <button v-else class="trpg-btn trpg-btn--primary" type="button" :disabled="ro || (isCustom ? !custom.name.trim() : !current)" data-testid="fx-add" @click="add">添加这个效果</button>
      <button class="trpg-btn" type="button" @click="modal.requestClose()">完成</button>
    </template>
  </DialogFrame>
</template>
