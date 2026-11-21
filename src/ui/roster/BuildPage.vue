<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { useCampaignStore } from '../../stores/campaign'
import { useModalStore } from '../../stores/modal'
import { CATEGORIES, useRosterStore, type CategoryId } from '../../stores/roster'
import Icon from '../kit/Icon.vue'
import Segmented from '../kit/Segmented.vue'

/**
 * 新建人物（P6 第 3 段承载 A：整页接管）。先填名字、放进哪类 → [开始建卡]：作者完整建卡器（套插件主题的建卡专用小窗）铺满下面这块，
 * 玩家在作者界面里一步步选，点作者的「完成建卡」建好 → 收进存档、关掉本页回列表。在作者里关窗 = 取消。
 * 界面只管摆位置和三种状态；建人、存档都在后台（roster.createNative → people.buildNative）。
 */
const props = defineProps<{ category?: CategoryId }>()
const roster = useRosterStore()
const campaign = useCampaignStore()
const modal = useModalStore()

const name = ref('新人物')
const dest = ref<CategoryId>(props.category ?? 'party')
const state = ref<'form' | 'building' | 'failed'>('form')
const slot = ref<HTMLElement | null>(null)

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
      <label class="bp-name"><span>名字</span><input v-model="name" class="trpg-input" type="text" maxlength="60" aria-label="人物名字" data-autofocus data-testid="bp-name" /></label>
      <span class="bp-lbl">放进</span>
      <Segmented v-model="dest" label="放进哪一类" :options="CATEGORIES.map((c) => ({ value: c.id, label: c.label }))" />
      <button class="trpg-btn trpg-btn--primary" type="submit" :disabled="!name.trim() || campaign.readOnly" data-testid="bp-start"><Icon name="plus" :size="14" />开始建卡</button>
      <p v-if="state === 'failed'" class="bp-error" role="alert"><Icon name="warning" :size="16" />这次没建成，原因见提示条。可以改一下再点「开始建卡」。</p>
    </form>
    <p v-else class="bp-doing" data-testid="bp-doing">正在建「{{ name.trim() }}」：在下面一步步选，最后点「完成建卡」。关掉作者的窗口或这个弹窗 = 不建了。</p>
    <div ref="slot" class="bp-slot" :data-active="state === 'building' || undefined" data-testid="bp-slot">
      <p v-if="state !== 'building'" class="bp-hint">点「开始建卡」后，建卡器会出现在这里。</p>
    </div>
  </div>
</template>
