<script setup lang="ts">
import { computed } from 'vue'
import type { EntryRef } from '../../library/scopes'
import { useWizardStore } from '../../stores/wizard'
import { CHOICE_COMPONENTS } from './choices/registry'

/**
 * 它要你做的选择：一件条目的每一步都由后端给（种类、标题、候选、数量）；这里按种类从登记表挑组件摆出来。
 * 后端说「建卡里还选不了」的（条目整体的 unsupported、单步的 unsupported、界面没登记的种类）统一列在最后一块，不静默丢。
 */
const props = defineProps<{ itemRef: EntryRef }>()
const w = useWizardStore()
const item = computed(() => w.optionsFor(props.itemRef))
const steps = computed(() => w.choicesOf(props.itemRef))
const known = computed(() => steps.value.filter((s) => CHOICE_COMPONENTS[s.options.kind]))
type Plain = { title: string | null; options: unknown; unsupported?: boolean }
const plain = computed(() => ((item.value?.steps ?? []) as Plain[]).filter((s) => !s.options))
const notYet = computed(() => [
  ...(item.value?.unsupported ?? []),
  ...plain.value.filter((s) => s.unsupported).map((s) => s.title ?? ''),
  ...steps.value.filter((s) => !CHOICE_COMPONENTS[s.options.kind]).map((s) => s.title ?? ''),
].filter(Boolean))
const auto = computed(() => plain.value.filter((s) => !s.unsupported).map((s) => s.title).filter(Boolean))
</script>

<template>
  <div class="wz-choices" data-testid="wz-choices">
    <component :is="CHOICE_COMPONENTS[s.options.kind]" v-for="s in known" :key="`${s.id}@${s.level}`" :item-ref="itemRef" :step="s" />
    <div v-if="auto.length" class="wz-auto">自动给予：{{ auto.join('、') }}</div>
    <div v-if="notYet.length" class="wz-notyet" role="note" data-testid="wz-notyet">
      <b>建卡里还选不了，创建后在人物页处理</b>
      <ul><li v-for="t in notYet" :key="t">{{ t }}</li></ul>
    </div>
  </div>
</template>
