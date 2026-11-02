<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from 'vue'
import { libraryOf, entryKey } from '../../core/library/types'
import { toEntry } from '../../core/library/pins'
import { resolveVariant } from '../../core/library/variants'
import type { Entry, StoredEntry } from '../../schemas/pack'
import type { TextBlock } from '../../schemas/text'
import { useAppStore } from '../../stores/app'
import { useCampaignStore } from '../../stores/campaign'
import { useLibraryStore } from '../../stores/library'
import { useModalStore } from '../../stores/modal'
import { useToastStore } from '../../stores/toast'
import { openEntry } from './openDetail'
import { sourceLine, typeLabel } from './typeLabels'
import EntryFacts from './EntryFacts.vue'
import { entryFacts } from './facts'
import TextBlocks from './TextBlocks.vue'
import VariantBar from './VariantBar.vue'
import { humanizeTokens } from './tokens'
import { familiesOf, loreOf, type FamilyRef, type LoreSource } from './series'
import { joinersOf, optionalFeaturesFact, type Joiner } from './joins'
import { variantsOf, variantsFact } from './variants'
import { tablesOf, type RelatedTable } from './tables'
import { rollTable, tableCopyText } from '../../rules/dice/table'
import { copyText } from '../../host/clipboard'
import { appendToInput } from '../../host/input'
import { useDiceStore } from '../../stores/dice'
import EntityAvatar from '../kit/EntityAvatar.vue'
import type { MonsterArt } from '../../rules/dnd5e2014/data/entries/art'

const props = defineProps<{ packId: string; entryId: string }>()
const app = useAppStore()
const campaign = useCampaignStore()
const library = useLibraryStore()
const modal = useModalStore()
const toast = useToastStore()
const stored = shallowRef<StoredEntry | null>(null)
const missing = ref(false)
const families = ref<FamilyRef[]>([])
const joiners = ref<Joiner[]>([])
const variants = ref<string[]>([])
const tables = ref<RelatedTable[]>([])
const dice = useDiceStore()
const avatarArt = computed<MonsterArt | undefined>(() => shown.value?.type === 'monster' ? ((shown.value.data.art as MonsterArt | undefined) ?? undefined) : undefined)
const avatarType = computed(() => shown.value?.type === 'monster' ? String((shown.value.data.creatureType as { type?: string } | undefined)?.type ?? '') : '')
const lore = ref<LoreSource[]>([])
/** 已装包的组合：装、卸包后，系列与背景描述的缓存据此失效。 */
const signature = computed(() => library.installed.map((p) => `${p.id}@${p.version}`).join('|'))

onMounted(async () => {
  stored.value = (await app.svc().db.entries.get([props.packId, props.entryId])) ?? null
  missing.value = !stored.value
  if (stored.value) {
    modal.setTitle(`entry:${props.packId}/${props.entryId}`, stored.value.name)
    const db = app.svc().db
    families.value = await familiesOf(db, stored.value.ruleId, signature.value, props.entryId)
    joiners.value = await joinersOf(db, stored.value.ruleId, signature.value, props.entryId)
    variants.value = await variantsOf(db, stored.value.ruleId, signature.value, props.entryId)
    tables.value = await tablesOf(db, stored.value.ruleId, signature.value, props.entryId)
    lore.value = await loreOf(db, stored.value.ruleId, signature.value, stored.value)
  }
})

const key = computed(() => entryKey(props.packId, props.entryId))
const original = computed<Entry | null>(() => (stored.value ? toEntry(stored.value) : null))
const slot = computed(() => (campaign.workspace ? libraryOf(campaign.workspace.data).variants[key.value] : undefined))
const resolved = computed(() => (original.value ? resolveVariant(original.value, slot.value) : null))
const shown = computed(() => resolved.value?.entry ?? original.value)
const seriesFact = computed(() => (families.value.length ? [{ label: '系列', parts: families.value.flatMap((f, i) => [...(i ? ['、'] : []), { ref: f.id, label: f.name }]) }] : []))
const optionalFact = computed(() => optionalFeaturesFact(joiners.value, (packId) => library.installedMap.get(packId)?.name ?? packId))
const variantFact = computed(() => variantsFact(variants.value))
const facts = computed(() => {
  if (!shown.value) return []
  const base = entryFacts(shown.value)
  // 「可选特性」紧跟在「特性」后面；没有「特性」行时放在最后
  const at = base.findIndex((f) => f.label === '特性')
  const withOptional = optionalFact.value ? (at >= 0 ? [...base.slice(0, at + 1), optionalFact.value, ...base.slice(at + 1)] : [...base, optionalFact.value]) : base
  return [...withOptional.slice(0, 1), ...seriesFact.value, ...(variantFact.value ? [variantFact.value] : []), ...withOptional.slice(1), ...(shown.value.nameEn ? [{ label: '英文名', parts: [shown.value.nameEn] }] : [])]
})
const blocks = computed(() => ((shown.value?.data.text as TextBlock[] | undefined) ?? []))
const npcIntro = computed(() => (shown.value?.type === 'npc' ? ((shown.value.data.intro as TextBlock[] | undefined) ?? []) : []))
const tableGroups = computed(() => {
  const map = new Map<string, RelatedTable[]>()
  for (const t of tables.value) {
    const at = t.data.at as { heading?: string[]; order?: number } | undefined
    const key = at?.heading?.length ? at.heading.join(' / ') : '本条目的表'
    map.set(key, [...(map.get(key) ?? []), t])
  }
  for (const list of map.values()) list.sort((a, b) => Number((a.data.at as { order?: number } | undefined)?.order ?? 0) - Number((b.data.at as { order?: number } | undefined)?.order ?? 0) || a.id.localeCompare(b.id, 'en'))
  return [...map]
})
async function rollOne(t: RelatedTable): Promise<void> {
  const data = t.data as never
  const roll = rollTable(data, Math.random)
  const text = tableCopyText([{ label: t.name, roll }])
  const ok = await copyText(text)
  toast.push('info', `🎲 ${t.name} ${roll.formula} = ${roll.total}${ok ? ' 已复制，Ctrl+V 粘贴' : ' 复制失败'}`, { actions: [{ label: '填入输入框', run: () => { appendToInput(text) } }] })
  dice.recordTable(t.id, t.name, `${roll.total}${roll.text ? ` ${roll.text}` : ''}`)
}
async function rollGroup(list: RelatedTable[]): Promise<void> {
  const results = list.filter((t) => (t.data.kind as string | undefined) !== 'ref').map((t) => ({ label: t.name, roll: rollTable(t.data as never, Math.random) }))
  if (!results.length) return
  const text = tableCopyText(results)
  const ok = await copyText(text)
  toast.push('info', `🎲 ${results.length} 张表${ok ? ' 已复制' : ' 复制失败'}`, { actions: [{ label: '填入输入框', run: () => { appendToInput(text) } }] })
  for (const r of results) dice.recordTable('group', r.label, `${r.roll.total}${r.roll.text ? ` ${r.roll.text}` : ''}`)
}

/** 点开关联术语：条目在已装的包里就打开，否则提示。 */
async function onRef(id: string): Promise<void> {
  const packId = await library.packOfEntry(id)
  if (packId) openEntry(packId, id, id)
  else toast.info('这个条目所在的扩展包还没有安装，可在「库 → 扩展」里安装')
}

async function onSwitch(variantKey: string): Promise<void> {
  const before = slot.value?.active
  try {
    await campaign.mutate((s, owner) => s.library.switchVariant(owner, key.value, variantKey).then((workspace) => ({ workspace })))
    toast.undoable('已切换版本', async () => {
      if (before) await campaign.mutate((s, owner) => s.library.switchVariant(owner, key.value, before).then((workspace) => ({ workspace })))
    })
  } catch (error) {
    console.error('[trpg-assistant] 切换版本失败', error)
    toast.error(`切换失败：${error instanceof Error ? error.message : String(error)}`)
  }
}
</script>

<template>
  <div v-if="shown && original" class="page-stack" data-testid="entry-detail">
    <VariantBar v-if="slot && slot.candidates.length" :variants="slot" :original="original" :read-only="campaign.readOnly" :origin-name="original.name" @switch="onSwitch" />
    <div v-if="shown.type === 'monster'" class="trpg-entry__head"><EntityAvatar :art="avatarArt" :creature-type="avatarType" :size="96" :label="shown.name" /><div><p class="trpg-row__meta">{{ typeLabel(shown.type) }}</p><p v-if="shown.summary" class="trpg-entry__summary">{{ humanizeTokens(shown.summary) }}</p></div></div>
    <template v-else><p class="trpg-row__meta">{{ typeLabel(shown.type) }}</p><p v-if="shown.summary" class="trpg-entry__summary">{{ humanizeTokens(shown.summary) }}</p></template>

<style scoped>
.trpg-entry__head { display: flex; align-items: center; gap: 12px; }
.trpg-entry__head .trpg-entry__summary { margin: 4px 0 0; }
@media (max-width: 480px) { .trpg-entry__head { gap: 8px; } }
</style>
    <EntryFacts v-if="facts.length" :facts="facts" @ref="onRef" />
    <TextBlocks v-if="npcIntro.length" :blocks="npcIntro" @ref="onRef" />
    <TextBlocks :blocks="blocks" @ref="onRef" />
    <section v-if="tableGroups.length" class="trpg-entry__tables" data-testid="entry-tables">
      <h3 class="trpg-entry__lore-title">相关表格</h3>
      <div v-for="[heading, list] in tableGroups" :key="heading" class="trpg-entry__table-group">
        <h4>{{ heading }} <button v-if="list.filter((t) => (t.data.kind as string) !== 'ref').length >= 2" class="trpg-btn trpg-btn--small" type="button" @click="rollGroup(list)">本节全掷</button></h4>
        <ul class="trpg-list">
          <li v-for="t in list" :key="t.id" class="trpg-row">
            <div class="trpg-row__main"><Term @open="onRef(t.id)">{{ t.name }}</Term><div class="trpg-row__meta">{{ t.data.dice }}<template v-if="t.data.src"> · {{ (t.data.src as { book?: string }).book }} p.{{ (t.data.src as { page?: number }).page }}</template></div></div>
            <button v-if="(t.data.kind as string) !== 'ref'" class="trpg-btn trpg-btn--small" type="button" :aria-label="`掷 ${t.name}`" @click="rollOne(t)">🎲</button>
          </li>
        </ul>
      </div>
    </section>
    <section v-if="lore.length" class="trpg-entry__lore" data-testid="entry-lore">
      <h3 class="trpg-entry__lore-title">背景描述</h3>
      <template v-for="(src, i) in lore" :key="i">
        <TextBlocks :blocks="src.blocks as TextBlock[]" @ref="onRef" />
        <p v-if="src.packId" class="trpg-field__hint">背景描述出自《{{ library.installedMap.get(src.packId)?.name ?? src.packId }}》</p>
      </template>
    </section>
    <p v-if="sourceLine(shown.data, library.sourceNames)" class="trpg-field__hint">{{ sourceLine(shown.data, library.sourceNames) }}</p>
  </div>
  <p v-else-if="missing" class="trpg-empty">没有找到这个条目</p>
  <div v-else class="trpg-skeleton" aria-busy="true" />
</template>
