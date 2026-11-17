<script setup lang="ts">
import { computed } from 'vue'
import type { EntryRef } from '../../../library/scopes'
import { useWizardStore, type ChoiceStep } from '../../../stores/wizard'
import Icon from '../../kit/Icon.vue'

/** 「分点数」（属性提升）：每行的名字、固定加值、玩家加的、能不能加 / 减、还剩几点都由后端给，界面只摆和转交点击。 */
type Row = { key: string; label: string; fixed: number; chosen: number; canAdd: boolean; canRemove: boolean }
const props = defineProps<{ itemRef: EntryRef; step: ChoiceStep }>()
const w = useWizardStore()
const rows = computed(() => props.step.options.rows as Row[])
const left = computed(() => w.leftOf(props.itemRef, props.step))
const busy = computed(() => w.optLoading)
</script>

<template>
  <div class="wz-ch" data-testid="wz-ch-asi">
    <b>{{ step.title ?? '属性提升' }}（{{ step.options.points }} 点<template v-if="step.options.cap < step.options.points">，每项最多 +{{ step.options.cap }}</template>）<small :data-done="left === 0 || undefined">{{ left === 0 ? '已分好' : `还剩 ${left} 点` }}</small></b>
    <p v-if="step.hint" class="wz-note wz-hint" data-testid="wz-hint">{{ step.hint }}</p>
    <div class="wz-asi">
      <div v-for="r in rows" :key="r.key" class="wz-asi__row">
        <span>{{ r.label }}<small v-if="r.fixed" class="wz-asi__fix">固定 +{{ r.fixed }}</small></span>
        <button type="button" class="trpg-icon-btn" :aria-label="`${r.label} 少 1`" :disabled="!r.canRemove || busy" @click="w.bumpAsi(itemRef, step, r.key, -1)"><Icon name="minus" :size="14" /></button>
        <b data-testid="wz-asi-n">{{ r.chosen }}</b>
        <button type="button" class="trpg-icon-btn" :aria-label="`${r.label} 多 1`" :disabled="!r.canAdd || busy" @click="w.bumpAsi(itemRef, step, r.key, 1)"><Icon name="plus" :size="14" /></button>
      </div>
    </div>
  </div>
</template>
