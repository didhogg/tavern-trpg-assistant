<script setup lang="ts">
// 作者起始装备窗口（问答桥 author-ask-equipment.ts）：标准起始装备（每组选一个方案，「任选一件」的空位再选物品）或改拿起始金币。
// 只收选择：方案序号、空位选的物品（作者 uid）、金币数；物品怎么展开、钱怎么算都是作者的事。
import { computed, reactive, ref, watch } from 'vue'
import type { AskAnswer } from '../../../rules/kernel/author-ask-types'
import type { ImportQuestion } from '../../../rules/kernel/import-flow'
import Segmented from '../../kit/Segmented.vue'
import SelectField from '../../kit/SelectField.vue'

type Form = Extract<ImportQuestion['form'], { type: 'equipment' }>
type Equip = Form['groups'][number]['choices'][number]['entries'][number]
const props = defineProps<{ question: ImportQuestion; busy: boolean }>()
const emit = defineEmits<{ answer: [AskAnswer | null] }>()
const f = computed(() => props.question.form as Form)

const mode = ref<'std' | 'gold'>('std')
const choice = reactive<Record<number, number>>({})
const slots = reactive<Record<string, string>>({})
const gold = ref<number | null>(null)
watch(() => props.question, () => {
  mode.value = 'std'; gold.value = null
  for (const k of Object.keys(choice)) delete choice[Number(k)]
  for (const k of Object.keys(slots)) delete slots[k]
  f.value.groups.forEach((g, i) => { if (g.choices.length === 1) choice[i] = 0 })
}, { immediate: true })

const letter = (i: number) => String.fromCharCode(97 + i)
/** 「任选一件」的空位：第几组 · 第几个方案 · 第几个（作者的 std__equi__组__方案__第几个）。 */
function slotKeys(g: number, c: number): string[] {
  const n = f.value.groups[g].choices[c].entries.filter((e) => e.kind === 'category').reduce((sum, e) => sum + e.quantity, 0)
  return Array.from({ length: n }, (_, i) => `${g}.${c}.${i}`)
}
/** 同名的物品（不同书各一版）在名字后面标来源（uid = 名字|来源）。 */
function candidateOptions(e: Equip | undefined) {
  const list = e?.candidates ?? []
  const count = new Map<string, number>()
  for (const c of list) count.set(String(c.name), (count.get(String(c.name)) ?? 0) + 1)
  return list.map((c) => ({ value: c.uid, label: (count.get(String(c.name)) ?? 0) > 1 ? `${c.name}（${(c.uid.split('|')[1] ?? '').toUpperCase()}）` : String(c.name) }))
}
/** 「任选一件」是哪一类（作者的类别名，已过显示出口）。 */
const slotKind = (entries: Equip[]): string => { const names = entries.find((e) => e.kind === 'category')?.typeNames ?? []; return names.length ? `（${names.join('或')}）` : '' }
const coins = (cp: number) => (cp % 100 === 0 ? `${cp / 100} 金币` : cp % 10 === 0 ? `${cp / 10} 银币` : `${cp} 铜币`)
function entryText(e: Equip): string {
  const n = e.quantity > 1 ? `${e.quantity}× ` : ''
  if (e.kind === 'value') return coins(e.cp ?? 0)
  return `${n}${e.name ?? e.text ?? ''}${e.cp ? `（内装 ${coins(e.cp)}）` : ''}`
}

const answer = computed<AskAnswer | null>(() => {
  if (mode.value === 'gold') return gold.value != null && gold.value >= 0 ? { gold: gold.value } : null
  const groups = f.value.groups
  if (!groups.every((_, g) => choice[g] != null)) return null
  const need = groups.flatMap((_, g) => slotKeys(g, choice[g]))
  if (!need.every((k) => slots[k])) return null
  return { choice: groups.map((_, g) => choice[g]), slots: Object.fromEntries(need.map((k) => [k, slots[k]])) }
})
watch(answer, (a) => emit('answer', a), { immediate: true })
</script>

<template>
  <div class="ask-form ask-equip">
    <Segmented v-if="f.gold" v-model="mode" label="起始装备还是起始金币" :options="[{ value: 'std', label: '标准起始装备' }, { value: 'gold', label: `改拿起始金币（${f.gold.replace('*', '×')} 金币）` }]" />
    <template v-if="mode === 'std'">
      <section v-for="(grp, g) in f.groups" :key="g" class="ask-group">
        <div class="ask-equip-choices" role="radiogroup" :aria-label="`第 ${g + 1} 组`">
          <label v-for="(ch, c) in grp.choices" :key="c" class="ask-equip-choice" :data-on="choice[g] === c || undefined" :data-testid="`ask-equip-${g}-${c}`">
            <input v-if="grp.choices.length > 1" v-model="choice[g]" type="radio" :value="c" :name="`ask-equip-${g}`" :disabled="busy">
            <b v-if="grp.choices.length > 1" class="ask-letter">（{{ letter(c) }}）</b>
            <span class="ask-equip-items">
              <template v-for="(e, i) in ch.entries" :key="i">
                <span v-if="e.kind !== 'category'" class="ask-equip-item">{{ entryText(e) }}</span>
              </template>
              <template v-for="(k, i) in slotKeys(g, c)" :key="k">
                <SelectField :model-value="slots[k] ?? ''" class="ask-equip-pick" :label="`第 ${g + 1} 组任选一件（第 ${i + 1} 件）`" :placeholder="`任选一件${slotKind(ch.entries)}…`" :options="candidateOptions(ch.entries.filter((e) => e.kind === 'category')[0])" :disabled="busy || choice[g] !== c" @update:model-value="(v?: string) => { if (v) { slots[k] = v; choice[g] = c } }" />
              </template>
            </span>
          </label>
        </div>
      </section>
    </template>
    <div v-else class="ask-gold">
      <label>起始金币<input v-model.number="gold" class="trpg-input ask-num" type="number" min="0" :disabled="busy" aria-label="起始金币数" data-testid="ask-gold"></label>
      <small class="ask-note">按 {{ f.gold?.replace('*', '×') }} 掷骰后填结果；选了金币就不拿上面的起始装备。</small>
    </div>
  </div>
</template>
