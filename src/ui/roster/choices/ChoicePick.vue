<script setup lang="ts">
import { computed, ref } from 'vue'
import type { EntryRef } from '../../../library/scopes'
import { useWizardStore, type ChoiceStep } from '../../../stores/wizard'
import Icon from '../../kit/Icon.vue'

/**
 * 「从候选里选几个」：候选、分组路径、标题都由后端给（dnd5e 自己的类别树）。界面只按路径摆：
 * 第一层分组 = 小标题（只有一组时不重复标题），第二层 = 可收起的小组（超过 FOLD 项默认收起，里面有已选的就展开）；候选多于 FILTER 项时出现筛选框。
 */
const FOLD = 12
const FILTER = 20
type Option = { value: string; label: string; path?: string[] }
type Slot = { count: number; options: Option[] }
const props = defineProps<{ itemRef: EntryRef; step: ChoiceStep }>()
const w = useWizardStore()
const slots = computed(() => props.step.options.slots as Slot[])
const total = computed(() => slots.value.reduce((n, s) => n + s.options.length, 0))
const query = ref('')
const left = computed(() => w.leftOf(props.itemRef, props.step))
const picked = (slot: number): string[] => (w.selOf(props.itemRef, props.step)?.[slot] as string[] | undefined) ?? []
const isOn = (slot: number, value: string): boolean => picked(slot).includes(value)
const full = (slot: number): boolean => picked(slot).length >= slots.value[slot].count
const toggle = (slot: number, value: string): void => w.setSlot(props.itemRef, props.step, slot, value)

interface Sub { label: string; options: Option[] }
interface Top { label: string | null; options: Option[]; subs: Sub[] }
/** 按后端给的路径摆成两层；筛选只是看得见哪些，不改候选。 */
function layout(options: Option[]): Top[] {
  const q = query.value.trim()
  const shown = q ? options.filter((o) => o.label.includes(q)) : options
  const tops = new Map<string, Top>()
  for (const o of shown) {
    const [head = '', sub, ...rest] = o.path ?? []
    const top = tops.get(head) ?? { label: head || null, options: [], subs: [] }
    tops.set(head, top)
    const subLabel = rest.length ? rest[rest.length - 1] : sub
    if (!subLabel) { top.options.push(o); continue }
    const found = top.subs.find((s) => s.label === subLabel)
    if (found) found.options.push(o); else top.subs.push({ label: subLabel, options: [o] })
  }
  const list = [...tops.values()]
  if (list.length === 1 && !list[0].subs.length) list[0].label = null
  return list
}
const openSub = (slot: number, sub: Sub): boolean => !!query.value.trim() || sub.options.length <= FOLD || sub.options.some((o) => isOn(slot, o.value))
const labelOf = (slot: number, value: string): string => slots.value[slot].options.find((o) => o.value === value)?.label ?? value
</script>

<template>
  <div class="wz-ch" data-testid="wz-ch-trait">
    <b>{{ step.title ?? '选择' }}（选 {{ w.needOf(step) }}）<small :data-done="left === 0 || undefined">{{ left === 0 ? '已选好' : `还差 ${left}` }}</small></b>
    <div v-if="step.options.grants.length" class="wz-given">已给：{{ step.options.grants.map((g: Option) => g.label).join('、') }}</div>
    <input v-if="total > FILTER" v-model="query" class="trpg-input wz-pk__q" type="search" :placeholder="`在 ${total} 项里筛选`" :aria-label="`筛选${step.title ?? ''}候选`" data-testid="wz-pk-filter" />
    <section v-for="(slot, i) in slots" :key="i" class="wz-pk" role="group" :aria-label="`${step.title ?? ''}候选，选 ${slot.count}，共 ${slot.options.length} 项`">
      <div v-if="slots.length > 1" class="wz-pk__slot">第 {{ i + 1 }} 组：选 {{ slot.count }}</div>
      <div v-if="picked(i).length" class="wz-pk__on" data-testid="wz-pk-on">
        <span class="wz-note">已选</span>
        <button v-for="v in picked(i)" :key="v" type="button" class="wz-opt" data-on :aria-label="`取消 ${labelOf(i, v)}`" @click="toggle(i, v)">{{ labelOf(i, v) }}<Icon name="x" :size="12" /></button>
      </div>
      <div v-for="top in layout(slot.options)" :key="top.label ?? ''" class="wz-pk__top">
        <h5 v-if="top.label" class="wz-pk__h">{{ top.label }}</h5>
        <div v-if="top.options.length" class="wz-opts" role="group" :aria-label="top.label ?? step.title ?? ''">
          <button v-for="o in top.options" :key="o.value" class="wz-opt" type="button" :data-on="isOn(i, o.value) || undefined" :aria-pressed="isOn(i, o.value)" :disabled="!isOn(i, o.value) && full(i)" data-testid="wz-opt" @click="toggle(i, o.value)">
            <Icon v-if="isOn(i, o.value)" name="check" :size="12" />{{ o.label }}
          </button>
        </div>
        <details v-for="sub in top.subs" :key="sub.label" class="wz-pk__sub" :open="openSub(i, sub)" data-testid="wz-pk-sub">
          <summary>{{ sub.label }}<span class="wz-note">{{ sub.options.length }}</span></summary>
          <div class="wz-opts" role="group" :aria-label="sub.label">
            <button v-for="o in sub.options" :key="o.value" class="wz-opt" type="button" :data-on="isOn(i, o.value) || undefined" :aria-pressed="isOn(i, o.value)" :disabled="!isOn(i, o.value) && full(i)" data-testid="wz-opt" @click="toggle(i, o.value)">
              <Icon v-if="isOn(i, o.value)" name="check" :size="12" />{{ o.label }}
            </button>
          </div>
        </details>
      </div>
      <p v-if="query.trim() && !layout(slot.options).length" class="wz-note">没有叫「{{ query.trim() }}」的候选。</p>
    </section>
  </div>
</template>
