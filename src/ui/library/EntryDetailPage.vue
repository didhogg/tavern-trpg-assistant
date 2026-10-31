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
import { askConfirm } from '../kit/confirm'
import { installFromCatalog } from './actions'
import { familiesOf, loreOf, type FamilyRef, type LoreSource } from './series'
import { BOOK_NAME } from './typeLabels'

const props = defineProps<{ packId: string; entryId: string }>()
const app = useAppStore()
const campaign = useCampaignStore()
const library = useLibraryStore()
const modal = useModalStore()
const toast = useToastStore()
const stored = shallowRef<StoredEntry | null>(null)
const missing = ref(false)
const families = ref<FamilyRef[]>([])
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
    lore.value = await loreOf(db, stored.value.ruleId, signature.value, stored.value)
  }
})

const key = computed(() => entryKey(props.packId, props.entryId))
const original = computed<Entry | null>(() => (stored.value ? toEntry(stored.value) : null))
const slot = computed(() => (campaign.workspace ? libraryOf(campaign.workspace.data).variants[key.value] : undefined))
const resolved = computed(() => (original.value ? resolveVariant(original.value, slot.value) : null))
const shown = computed(() => resolved.value?.entry ?? original.value)
const seriesFact = computed(() => (families.value.length ? [{ label: '系列', parts: families.value.flatMap((f, i) => [...(i ? ['、'] : []), { ref: f.id, label: f.name }]) }] : []))
const facts = computed(() => (shown.value ? [...entryFacts(shown.value).slice(0, 1), ...seriesFact.value, ...entryFacts(shown.value).slice(1), ...(shown.value.nameEn ? [{ label: '英文名', parts: [shown.value.nameEn] }] : [])] : []))
const blocks = computed(() => ((shown.value?.data.text as TextBlock[] | undefined) ?? []))

const bookName = (packId: string): string => library.catalog?.packs.find((p) => p.id === packId)?.name ?? BOOK_NAME[packId.split('-').pop()?.toUpperCase() ?? ''] ?? packId

/** 点开关联术语：条目在已装的包里就打开；没装时说明在哪本书里，确认后直接安装并打开。 */
async function onRef(id: string, targetPack?: string): Promise<void> {
  const packId = await library.packOfEntry(id)
  if (packId) { openEntry(packId, id, id); return }
  if (!targetPack) { toast.info('这个条目所在的扩展包还没有安装，可在「库 → 扩展」里安装'); return }
  const ok = await askConfirm({ title: '需要安装扩展包', message: `这个条目在《${bookName(targetPack)}》里，要现在安装吗？`, confirmLabel: '安装' })
  if (!ok) return
  await installFromCatalog(targetPack)
  const after = await library.packOfEntry(id)
  if (after) openEntry(after, id, id)
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
    <p class="trpg-row__meta">{{ typeLabel(shown.type) }}</p>
    <p v-if="shown.summary" class="trpg-entry__summary">{{ humanizeTokens(shown.summary) }}</p>
    <EntryFacts v-if="facts.length" :facts="facts" @ref="onRef" />
    <TextBlocks :blocks="blocks" @ref="onRef" />
    <section v-if="lore.length" class="trpg-entry__lore" data-testid="entry-lore">
      <h3 class="trpg-entry__lore-title">背景描述</h3>
      <template v-for="(src, i) in lore" :key="i">
        <TextBlocks :blocks="src.blocks as TextBlock[]" @ref="onRef" />
        <p v-if="src.packId" class="trpg-field__hint">背景描述出自《{{ bookName(src.packId) }}》</p>
      </template>
    </section>
    <p v-if="sourceLine(shown.data)" class="trpg-field__hint">{{ sourceLine(shown.data) }}</p>
  </div>
  <p v-else-if="missing" class="trpg-empty">没有找到这个条目</p>
  <div v-else class="trpg-skeleton" aria-busy="true" />
</template>
