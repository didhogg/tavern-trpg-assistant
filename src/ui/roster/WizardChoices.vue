<script setup lang="ts">
import type { EntryRef } from '../../library/scopes'
import { useWizardStore } from '../../stores/wizard'
import Icon from '../kit/Icon.vue'
import { ABILITY_LABELS, abilityLabel, traitLabel } from './wizard-labels'

/** 它要你做的选择：每一步的候选由后端给（官方进阶算好，已排除人物身上已有的），这里只摆放、记选了什么、数还差几个。 */
const props = defineProps<{ itemRef: EntryRef }>()
const w = useWizardStore()
const steps = () => w.choicesOf(props.itemRef)
const auto = () => (w.optionsFor(props.itemRef)?.steps as Array<{ title: string | null; options: unknown; automatic: boolean; unsupported?: boolean }> | undefined ?? []).filter((s) => !s.options)
type Slot = { count: number; options: Array<{ value: string; label: string }> }
const slotsOf = (s: ReturnType<typeof steps>[number]): Slot[] => s.options.slots as Slot[]
const left = (s: ReturnType<typeof steps>[number]): number => w.needOf(s) - w.haveOf(props.itemRef, s)
const slotOn = (s: ReturnType<typeof steps>[number], slot: number, value: string): boolean => (w.sel[props.itemRef ? `${props.itemRef.set}:${props.itemRef.prop}:${props.itemRef.hash}` : '']?.[`${s.id}@${s.level ?? ''}`]?.[slot] as string[] | undefined)?.includes(value) ?? false
const asiN = (s: ReturnType<typeof steps>[number], k: string): number => w.sel[`${props.itemRef.set}:${props.itemRef.prop}:${props.itemRef.hash}`]?.[`${s.id}@${s.level ?? ''}`]?.[k] ?? 0
</script>

<template>
  <div class="wz-choices" data-testid="wz-choices">
    <div v-for="s in steps()" :key="`${s.id}@${s.level}`" class="wz-ch" :data-testid="`wz-ch-${s.options.kind}`">
      <template v-if="s.options.kind === 'trait'">
        <b>{{ traitLabel(s.options.trait, s.title) }}（选 {{ w.needOf(s) }}）<small :data-done="left(s) === 0 || undefined">{{ left(s) === 0 ? '已选好' : `还差 ${left(s)}` }}</small></b>
        <div v-if="s.options.grants.length" class="wz-given">已给：{{ s.options.grants.map((g: { label: string }) => g.label).join('、') }}</div>
        <div v-for="(slot, i) in slotsOf(s)" :key="i" class="wz-opts" role="group" :aria-label="`${traitLabel(s.options.trait, s.title)}候选，选 ${slot.count}，共 ${slot.options.length} 项`">
          <button v-for="o in slot.options" :key="o.value" class="wz-opt" type="button" :data-on="slotOn(s, i, o.value) || undefined" data-testid="wz-opt" @click="w.setSlot(itemRef, s, i, o.value)">
            <Icon v-if="slotOn(s, i, o.value)" name="check" :size="12" />{{ o.label }}
          </button>
        </div>
      </template>
      <template v-else-if="s.options.kind === 'asi'">
        <b>属性提升（{{ s.options.points }} 点<template v-if="s.options.cap">，每项最多 +{{ s.options.cap }}</template>）<small :data-done="left(s) === 0 || undefined">{{ left(s) === 0 ? '已选好' : `还差 ${left(s)}` }}</small></b>
        <div v-if="Object.keys(s.options.fixed).length" class="wz-given">固定：{{ Object.entries(s.options.fixed).map(([k, n]) => `${abilityLabel(k)} +${n}`).join('、') }}</div>
        <div class="wz-asi">
          <div v-for="k in Object.keys(ABILITY_LABELS)" :key="k" class="wz-asi__row">
            <span>{{ abilityLabel(k) }}</span>
            <button type="button" class="trpg-icon-btn" :aria-label="`${abilityLabel(k)} 少 1`" :disabled="asiN(s, k) <= 0" @click="w.bumpAsi(itemRef, s, k, -1)"><Icon name="minus" :size="14" /></button>
            <b data-testid="wz-asi-n">{{ asiN(s, k) }}</b>
            <button type="button" class="trpg-icon-btn" :aria-label="`${abilityLabel(k)} 多 1`" :disabled="left(s) <= 0 || asiN(s, k) >= (s.options.cap || s.options.points)" @click="w.bumpAsi(itemRef, s, k, 1)"><Icon name="plus" :size="14" /></button>
          </div>
        </div>
      </template>
    </div>
    <div v-if="auto().length" class="wz-auto">自动给予：{{ auto().map((a) => a.title).filter(Boolean).join('、') }}</div>
    <div v-for="a in auto().filter((x) => x.unsupported)" :key="a.title ?? ''" class="wz-given">「{{ a.title }}」这一步没法在建卡里选，创建后在人物页处理。</div>
  </div>
</template>
