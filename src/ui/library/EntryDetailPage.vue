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

const props = defineProps<{ packId: string; entryId: string }>()
const app = useAppStore()
const campaign = useCampaignStore()
const library = useLibraryStore()
const modal = useModalStore()
const toast = useToastStore()
const stored = shallowRef<StoredEntry | null>(null)
const missing = ref(false)

onMounted(async () => {
  stored.value = (await app.svc().db.entries.get([props.packId, props.entryId])) ?? null
  missing.value = !stored.value
  if (stored.value) modal.setTitle(`entry:${props.packId}/${props.entryId}`, stored.value.name)
})

const key = computed(() => entryKey(props.packId, props.entryId))
const original = computed<Entry | null>(() => (stored.value ? toEntry(stored.value) : null))
const slot = computed(() => (campaign.workspace ? libraryOf(campaign.workspace.data).variants[key.value] : undefined))
const resolved = computed(() => (original.value ? resolveVariant(original.value, slot.value) : null))
const shown = computed(() => resolved.value?.entry ?? original.value)
const facts = computed(() => (shown.value ? [...entryFacts(shown.value), ...(shown.value.nameEn ? [{ label: '英文名', parts: [shown.value.nameEn] }] : [])] : []))
const blocks = computed(() => ((shown.value?.data.text as TextBlock[] | undefined) ?? []))

async function onRef(id: string): Promise<void> {
  const packId = await library.packOfEntry(id)
  if (packId) openEntry(packId, id, id)
  else toast.info('这个条目所在的扩展包还没有安装')
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
    <p v-if="sourceLine(shown.data)" class="trpg-field__hint">{{ sourceLine(shown.data) }}</p>
  </div>
  <p v-else-if="missing" class="trpg-empty">没有找到这个条目</p>
  <div v-else class="trpg-skeleton" aria-busy="true" />
</template>
