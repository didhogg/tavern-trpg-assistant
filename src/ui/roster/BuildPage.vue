<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import type { NativeLabel } from '../../rules/kernel/native-presentation'
import { useCampaignStore } from '../../stores/campaign'
import { useModalStore } from '../../stores/modal'
import { CATEGORIES, useRosterStore, type CategoryId } from '../../stores/roster'
import Segmented from '../kit/Segmented.vue'
import { openEntry } from '../libview/open'

/** 0c 的名字页和建卡位置。后续每步继续使用同一个作者建卡实例。 */
const props = defineProps<{ category?: CategoryId }>()
const roster = useRosterStore()
const campaign = useCampaignStore()
const modal = useModalStore()

const name = ref('新人物')
const dest = ref<CategoryId>(props.category ?? 'party')
const state = ref<'form' | 'building' | 'failed'>('form')
const slot = ref<HTMLElement | null>(null)

function showCard(event: Event): void {
  const label = (event as CustomEvent<NativeLabel>).detail
  if (state.value === 'building' && label?.ref) openEntry(label.ref, label.name, label.selection)
}

async function start(): Promise<void> {
  if (!slot.value || !name.value.trim()) return
  state.value = 'building'
  const outcome = await roster.createNative(name.value.trim(), dest.value, slot.value)
  if (outcome === 'failed') { state.value = 'failed'; return }
  state.value = 'form'
  modal.close(true)
}

/** 建卡中途离开（✕ / Esc / 打开别的弹窗）：关掉建卡专用小窗，存档不变。 */
onBeforeUnmount(() => { if (state.value === 'building') roster.stopNative() })
</script>

<template>
  <div class="bp" data-testid="build-page">
    <form v-if="state !== 'building'" class="bp-form" @submit.prevent="start">
      <nav class="bp-first-step" aria-label="建卡步骤"><span aria-current="step">① 名字</span></nav>
      <label class="bp-name"><span>名字</span><input v-model="name" class="trpg-input" type="text" maxlength="60" aria-label="人物名字" data-autofocus data-testid="bp-name" /></label>
      <span class="bp-lbl">放进</span>
      <Segmented v-model="dest" label="放进哪一类" :options="CATEGORIES.map((c) => ({ value: c.id, label: c.label }))" />
      <p v-if="state === 'failed'" class="bp-error" role="alert">这次没建成，原因见提示条。可以重试。</p>
      <footer class="bp-first-footer"><button class="trpg-btn trpg-btn--primary" type="submit" :disabled="!name.trim() || campaign.readOnly" data-testid="bp-start">下一步</button></footer>
    </form>
    <div v-show="state === 'building'" ref="slot" class="bp-slot" data-testid="bp-slot" @trpg-build-card="showCard">
      <p class="bp-hint" role="status">正在准备建卡资料…</p>
    </div>
  </div>
</template>
