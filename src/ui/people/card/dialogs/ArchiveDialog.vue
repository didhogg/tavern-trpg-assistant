<script setup lang="ts">
import { computed, markRaw, onMounted, ref } from 'vue'
import { CONDITION_LABELS, DAMAGE_LABELS, ARMOR_LABELS, TOOL_LABELS } from '../../../../rules/dnd5e2014/data/enums'
import { assignGrants, restorable, type Grant } from '../../../../rules/dnd5e2014/derive'
import { useModalStore } from '../../../../stores/modal'
import { useCampaignStore } from '../../../../stores/campaign'
import Icon from '../../../kit/Icon.vue'
import Segmented from '../../../kit/Segmented.vue'
import HoverTip from '../../../kit/HoverTip.vue'
import type { BrowserTab } from '../../../kit/BrowserTabs.vue'
import { CARD_OF_GROUP, archiveOf, type ArchiveCardKey, type ArchiveGroupKey, type ArchiveItem } from '../archive'
import { addListItem, addProficiency, addSense, removeItem, senseRows, setSenseRange, setToolLevel, type SenseKey } from '../archiveOps'
import { loadArchiveCandidates, type ArchiveCandidates, type Candidate } from '../cardData'
import type { CardCtx } from '../cardCtx'
import { expectedGrants } from '../expected'
import { archiveInfoModel } from '../archiveRefs'
import { senseDefs } from '../senseDefs'
import InfoDialog from './InfoDialog.vue'
import DialogFrame from './DialogFrame.vue'

const props = defineProps<{ ctx: CardCtx; card: ArchiveCardKey; tab?: ArchiveGroupKey }>()
const modal = useModalStore()
const campaign = useCampaignStore()
const GROUPS: Record<ArchiveCardKey, ArchiveGroupKey[]> = { defense: ['resist', 'immune', 'vulnerable', 'condition'], senses: ['senses'], proficiency: ['languages', 'weapons', 'armor', 'tools'] }
const TAB_LABEL: Record<ArchiveGroupKey, string> = { resist: '抗性', immune: '免疫', vulnerable: '易伤', condition: '状态免疫', senses: '感官', languages: '语言', weapons: '武器', armor: '护甲', tools: '工具' }
const tab = ref<ArchiveGroupKey>(props.tab ?? GROUPS[props.card][0]!)
const search = ref('')
const candidates = ref<ArchiveCandidates>({ languages: [], weapons: [], tools: [] })
const folded = ref<Record<string, boolean>>({})
const flash = ref('')
const cards = computed(() => archiveOf(props.ctx.person, props.ctx.data.nameOf))
const groupItems = (key: ArchiveGroupKey): ArchiveItem[] => cards.value.find((c) => c.key === CARD_OF_GROUP[key])?.groups.find((g) => g.key === key)?.items ?? []
const tabs = computed<BrowserTab[]>(() => GROUPS[props.card].map((key) => ({ key, label: TAB_LABEL[key], count: groupItems(key).length })))
const items = computed(() => groupItems(tab.value))
const keyOf = (item: ArchiveItem): string => item.id.slice(item.group.length + 1)
const readOnly = computed(() => props.ctx.readOnly)
const title = computed(() => ({ defense: '防御', senses: '感官', proficiency: '熟练' })[props.card])

onMounted(async () => {
  if (props.card === 'proficiency') candidates.value = await loadArchiveCandidates(campaign.workspace?.ruleId ?? 'dnd5e2014', campaign.workspace?.enabledPacks.map((p) => p.id) ?? [])
})

function pool(): Candidate[] {
  const labels = (map: Record<string, string>, group: string): Candidate[] => Object.entries(map).map(([key, label]) => ({ key, label, group }))
  switch (tab.value) {
    case 'resist': case 'immune': case 'vulnerable': return labels(DAMAGE_LABELS, '伤害类型')
    case 'condition': return labels(CONDITION_LABELS, '状态')
    case 'armor': return labels(ARMOR_LABELS, '护甲')
    case 'languages': return candidates.value.languages
    case 'weapons': return [{ key: 'simple', label: '简易武器', group: '类别' }, { key: 'martial', label: '军用武器', group: '类别' }, ...candidates.value.weapons]
    case 'tools': return candidates.value.tools
    default: return []
  }
}
const have = computed(() => new Set(items.value.map(keyOf)))
const available = computed(() => pool().filter((c) => !have.value.has(c.key) && !(tab.value === 'languages' && have.value.has(c.code ?? c.key))))
const needle = computed(() => search.value.trim().toLowerCase())
const filtered = computed(() => available.value.filter((c) => !needle.value || c.label.toLowerCase().includes(needle.value) || (c.en ?? '').toLowerCase().includes(needle.value)))
const showSearch = computed(() => available.value.length > 8)
const shown = computed(() => filtered.value.slice(0, 50))
const grouped = computed(() => { const m = new Map<string, Candidate[]>(); for (const c of shown.value) m.set(c.group, [...(m.get(c.group) ?? []), c]); return [...m.entries()] })
const sensesRows = computed(() => senseRows(props.ctx.person.block))
const senseOptions = computed(() => senseDefs())

const expected = computed(() => expectedGrants(props.ctx.person, props.ctx.data))
const category = computed(() => (tab.value === 'languages' || tab.value === 'weapons' || tab.value === 'armor' || tab.value === 'tools' ? tab.value : null))
const missing = computed(() => {
  const cat = category.value
  if (!cat) return []
  const want = expected.value.filter((e) => e.grant.category === cat)
  const miss = restorable(props.ctx.person.block.proficiencies, want.map((e) => e.grant))
  return miss.map((grant) => ({ grant, from: want.find((e) => e.grant.key === grant.key && e.grant.category === grant.category)?.from ?? '' }))
})

function commit(block: ReturnType<typeof addSense>): void { if (block !== props.ctx.person.block) props.ctx.commitBlock(block) }
function add(c: Candidate): void {
  if (readOnly.value) return
  const block = props.ctx.person.block
  const g = tab.value
  if (g === 'senses') return
  if (g === 'resist' || g === 'immune' || g === 'vulnerable' || g === 'condition') commit(addListItem(block, g, c.key))
  else {
    const grant: Grant = g === 'languages' ? { category: 'languages', key: c.key, label: c.label }
      : g === 'armor' ? { category: 'armor', key: c.key, label: c.label }
        : g === 'weapons' ? (c.ref ? { category: 'weapons', key: c.ref, ref: c.ref, label: c.label } : { category: 'weapons', key: c.key, weaponCategory: c.key as 'simple' | 'martial', label: c.label })
          : (c.ref ? { category: 'tools', key: c.ref, ref: c.ref, label: c.label } : { category: 'tools', key: c.key, name: c.key, label: TOOL_LABELS[c.key] ?? c.label })
    commit(addProficiency(block, grant))
  }
  flash.value = c.key; setTimeout(() => { if (flash.value === c.key) flash.value = '' }, 1200)
}
function addSenseOf(key: SenseKey): void { if (!readOnly.value) commit(addSense(props.ctx.person.block, key)) }
function remove(item: ArchiveItem): void { if (!readOnly.value) commit(removeItem(props.ctx.person.block, item.group, keyOf(item))) }
function removeSense(i: number): void { const r = sensesRows.value[i]; if (r) commit(removeItem(props.ctx.person.block, 'senses', r.key ?? r.label)) }
function range(i: number, event: Event): void { const n = Number((event.target as HTMLInputElement).value); commit(setSenseRange(props.ctx.person.block, i, n)) }
function restore(grant: Grant, from: string): void { commit({ ...props.ctx.person.block, proficiencies: assignGrants(props.ctx.person.block.proficiencies, [grant], from) }) }
function restoreAll(): void {
  let prof = props.ctx.person.block.proficiencies
  for (const m of missing.value) prof = assignGrants(prof, [m.grant], m.from)
  commit({ ...props.ctx.person.block, proficiencies: prof })
}
function level(item: ArchiveItem, value: string | undefined): void { commit(setToolLevel(props.ctx.person.block, keyOf(item), value === 'expertise' ? 'expertise' : 'proficient')) }
const toolLevel = (item: ArchiveItem): string => (props.ctx.person.block.proficiencies?.tools ?? []).find((r) => String(r.ref ?? r.name) === keyOf(item))?.level ?? 'proficient'
async function open(item: ArchiveItem): Promise<void> {
  const model = await archiveInfoModel(item, item.source !== '模板' && !readOnly.value, props.ctx.data)
  modal.push({ key: `info:${item.id}`, title: item.label, component: markRaw(InfoDialog), variant: 'dialog', width: 520, height: 420, props: { model, onRemove: () => remove(item) } })
}
const removable = (item: ArchiveItem): boolean => item.source !== '模板' && !readOnly.value
function more(): void { props.ctx.toast.info('这个面板之后再做。') }
</script>

<template>
  <DialogFrame v-model:tab="tab" :tabs="tabs" :tab-label="`${title}分类`" note="改动进入草稿，点右上「保存」后生效">
    <section class="trpg-arch__sec">
      <h3>已有</h3>
      <template v-if="tab === 'senses'">
        <ul v-if="sensesRows.length" class="trpg-arch__rows"><li v-for="r in sensesRows" :key="r.index" class="trpg-arch__row"><span class="trpg-arch__name">{{ r.label }}</span><template v-if="r.key"><input class="trpg-input trpg-input--sm trpg-arch__num" type="number" min="0" step="5" :value="r.range ?? 0" :disabled="readOnly" :aria-label="`${r.label}距离（尺）`" @change="range(r.index, $event)" /><span>尺</span></template><button class="trpg-icon-btn" type="button" :disabled="readOnly" :aria-label="`移除${r.label}`" @click="removeSense(r.index)"><Icon name="x" :size="16" /></button></li></ul>
        <p v-else class="trpg-card-empty">还没有感官。</p>
      </template>
      <template v-else-if="tab === 'tools'">
        <ul v-if="items.length" class="trpg-arch__rows"><li v-for="item in items" :key="item.id" class="trpg-arch__row"><button class="trpg-linkbtn trpg-arch__name" type="button" @click="open(item)">{{ item.label }}</button><Segmented :model-value="toolLevel(item)" :options="[{ value: 'proficient', label: '熟练' }, { value: 'expertise', label: '专精' }]" label="工具熟练等级" @update:model-value="level(item, $event)" /><button v-if="removable(item)" class="trpg-icon-btn" type="button" :aria-label="`移除${item.label}`" @click="remove(item)"><Icon name="x" :size="16" /></button></li></ul>
        <p v-else class="trpg-card-empty">还没有工具熟练。</p>
      </template>
      <div v-else-if="items.length" class="trpg-arch__pills"><span v-for="item in items" :key="item.id" class="trpg-pill trpg-arch__pill" :class="{ 'is-flash': flash === keyOf(item) }"><HoverTip :lines="[item.label, `获得方式：${item.source}`]"><button class="trpg-arch__pillname" type="button" @click="open(item)">{{ item.label }}</button></HoverTip><button v-if="removable(item)" class="trpg-effect-pill__x" type="button" :aria-label="`移除${item.label}`" @click="remove(item)"><Icon name="x" :size="16" /></button></span></div>
      <p v-else class="trpg-card-empty">还没有{{ TAB_LABEL[tab] }}。</p>
    </section>
    <section v-if="missing.length" class="trpg-arch__sec" data-testid="archive-restorable">
      <h3>可恢复的自动项</h3>
      <div class="trpg-arch__pills"><button v-for="m in missing" :key="`${m.grant.category}:${m.grant.key}`" class="trpg-pill trpg-arch__restore" type="button" :disabled="readOnly" :aria-label="`恢复${m.grant.label}`" @click="restore(m.grant, m.from)">{{ m.grant.label }}<Icon name="arrow-counter-clockwise" :size="16" /></button></div>
    </section>
    <section class="trpg-arch__sec">
      <div class="trpg-arch__addhead"><h3>可添加</h3><button v-if="category" class="trpg-btn trpg-btn--small" type="button" :disabled="readOnly || !missing.length" data-testid="archive-reassign" @click="restoreAll"><Icon name="arrow-counter-clockwise" :size="16" />{{ missing.length ? '按来源重新分配' : '没有缺的' }}</button></div>
      <template v-if="tab === 'senses'">
        <ul class="trpg-arch__senses"><li v-for="s in senseOptions.filter((x) => !sensesRows.some((r) => r.key === x.key))" :key="s.key"><button class="trpg-pill" type="button" :disabled="readOnly" @click="addSenseOf(s.key)">{{ s.label }}</button><span class="trpg-arch__note">{{ s.note }}</span></li></ul>
        <p v-if="senseOptions.length > 0 && senseOptions.every((x) => sensesRows.some((r) => r.key === x.key))" class="trpg-card-empty">感官都已添加。</p>
      </template>
      <template v-else>
        <div v-if="showSearch" class="trpg-arch__search"><input v-model="search" class="trpg-input" type="search" :placeholder="`搜${TAB_LABEL[tab]}…`" :aria-label="`搜索${TAB_LABEL[tab]}`" /><span class="trpg-arch__count">共 {{ filtered.length }} 条</span><button v-if="search" class="trpg-btn trpg-btn--quiet trpg-btn--small" type="button" @click="search = ''">清除</button></div>
        <div v-for="[group, list] in grouped" :key="group" class="trpg-arch__group">
          <button v-if="group.startsWith('其他书籍')" class="trpg-arch__fold" type="button" :aria-expanded="folded[group] === true || !!needle" @click="folded[group] = !folded[group]"><Icon :name="folded[group] || needle ? 'caret-down' : 'caret-right'" :size="16" />{{ group }}（{{ list.length }}）</button>
          <p v-else class="trpg-dlg__small">{{ group }}</p>
          <div v-if="!group.startsWith('其他书籍') || folded[group] || needle" class="trpg-arch__pills"><button v-for="c in list" :key="c.key" class="trpg-pill" type="button" :disabled="readOnly" :data-testid="`archive-add-${c.key}`" @click="add(c)">{{ c.label }}<span v-if="c.en" class="trpg-arch__en">{{ c.en }}</span></button></div>
        </div>
        <p v-if="!shown.length" class="trpg-card-empty">{{ needle ? '没有匹配的。' : '都已添加。' }}</p>
        <p v-if="filtered.length > 50" class="trpg-card-empty">只显示前 50 条，请搜索。</p>
      </template>
      <button class="trpg-btn trpg-btn--quiet trpg-btn--small trpg-arch__custom" type="button" @click="more"><Icon name="plus" :size="16" />自定义…</button>
    </section>
    <template #actions><button class="trpg-btn trpg-btn--primary" type="button" @click="modal.requestClose()">完成</button></template>
  </DialogFrame>
</template>
