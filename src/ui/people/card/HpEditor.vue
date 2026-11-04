<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import type { Person } from '../../../schemas/people'
import type { HpResult } from '../../../rules/dnd5e2014/derive'
import Icon from '../../kit/Icon.vue'
import { signed } from './format'

/** 生命原地编辑态（U5R §4.2）：当前 / 上限 / 临时、上限明细、其他修正、生命骰数量、全部恢复自动。 */
export interface HpEditPayload {
  hp: Partial<Person['hp']>
  /** null = 回到自动；数字 = 覆盖值。 */
  cap: number | null
  hpAdj: NonNullable<Person['hpAdj']>
  hitDiceOverride: Record<string, number>
}
const props = defineProps<{ person: Person; hp: HpResult; auto: HpResult }>()
const emit = defineEmits<{ commit: [payload: HpEditPayload]; done: [] }>()
const form = ref<HTMLElement | null>(null)
const current = ref('')
const cap = ref('')
const temp = ref('')
const adj = ref<NonNullable<Person['hpAdj']>>([])
const diceOverride = ref<Record<string, string>>({})
const adding = ref(false)
const draft = ref({ label: '', flat: '', perLevel: '' })
const adjError = ref('')

const autoMax = computed(() => props.auto.value)
const overridden = computed(() => props.person.block.overrides?.hpMax !== undefined)

function init(): void {
  const cur = props.person.hp.current ?? autoMax.value
  current.value = cur === null ? '' : String(cur)
  cap.value = overridden.value ? String(props.person.block.overrides!.hpMax) : ''
  temp.value = String(props.person.hp.temp)
  adj.value = (props.person.hpAdj ?? []).map((row) => ({ ...row }))
  diceOverride.value = Object.fromEntries(Object.entries(props.person.hitDiceOverride ?? {}).map(([k, v]) => [k, String(v)]))
}
onMounted(() => { init(); void nextTick(() => form.value?.querySelector<HTMLInputElement>('input')?.focus()) })

function num(value: string): number | undefined {
  if (value.trim() === '') return undefined
  const n = Number(value)
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : undefined
}
function commit(): void {
  const entered = num(cap.value)
  const capValue = cap.value.trim() === '' || entered === autoMax.value ? null : (entered ?? null)
  const upper = capValue ?? props.hp.value
  let cur = num(current.value)
  if (cur !== undefined && upper !== null) cur = Math.min(cur, upper)
  const dice: Record<string, number> = {}
  for (const [k, v] of Object.entries(diceOverride.value)) { const n = num(v); if (n !== undefined) dice[k] = n }
  emit('commit', { hp: { current: cur ?? null, temp: num(temp.value) ?? 0 }, cap: capValue, hpAdj: adj.value, hitDiceOverride: dice })
  emit('done')
}
function addAdj(): void {
  const label = draft.value.label.trim()
  const flat = draft.value.flat.trim() === '' ? undefined : Number(draft.value.flat)
  const perLevel = draft.value.perLevel.trim() === '' ? undefined : Number(draft.value.perLevel)
  if (!label) { adjError.value = '写上来源名称'; return }
  if ((flat !== undefined && !Number.isInteger(flat)) || (perLevel !== undefined && !Number.isInteger(perLevel)) || (flat === undefined && perLevel === undefined)) { adjError.value = '固定值或每级值至少填一个整数'; return }
  adj.value = [...adj.value, { label, ...(flat !== undefined ? { flat } : {}), ...(perLevel !== undefined ? { perLevel } : {}), source: '手动' }]
  draft.value = { label: '', flat: '', perLevel: '' }
  adding.value = false
  adjError.value = ''
}
function resetAuto(): void { cap.value = ''; adj.value = []; diceOverride.value = {} }
const canReset = computed(() => cap.value.trim() !== '' || adj.value.length > 0 || Object.values(diceOverride.value).some((v) => v.trim() !== ''))
function blur(event: FocusEvent): void {
  const next = event.relatedTarget as Node | null
  if (next && !form.value?.contains(next)) commit()
}
const adjusted = computed(() => props.hp.parts.filter((p) => p.kind !== 'override'))
defineExpose({ commit })
</script>

<template>
  <form ref="form" class="trpg-hpedit" data-testid="person-card-hp-editor" @focusout="blur" @submit.prevent="commit">
    <div class="trpg-hpedit__inputs">
      <label class="trpg-hpedit__field"><span>当前</span><input v-model="current" class="trpg-input" inputmode="numeric" aria-label="当前生命" data-testid="person-card-hp-current-input" @keydown.enter.prevent="commit" /></label>
      <label class="trpg-hpedit__field"><span>上限</span><input v-model="cap" class="trpg-input" inputmode="numeric" :placeholder="autoMax === null ? '' : String(autoMax)" aria-label="生命上限" data-testid="person-card-hp-max-input" @keydown.enter.prevent="commit" /></label>
      <label class="trpg-hpedit__field"><span>临时</span><input v-model="temp" class="trpg-input" inputmode="numeric" aria-label="临时生命" data-testid="person-card-hp-temp-input" @keydown.enter.prevent="commit" /></label>
    </div>
    <p v-if="cap.trim() !== '' && Number(cap) !== autoMax" class="trpg-hpedit__note">现在是手填的 {{ cap }}，自动值 {{ autoMax ?? '算不出' }}。清空上限框即回到自动。</p>
    <h4 class="trpg-hpedit__title">上限明细</h4>
    <ul class="trpg-hpedit__parts">
      <li v-for="(part, i) in auto.parts" :key="`a${i}`"><span>{{ part.label }}</span><b>{{ signed(part.amount) }}</b></li>
      <li v-for="(row, i) in adj" :key="`m${i}`" class="is-manual"><span>{{ row.label }}（手动）<template v-if="row.perLevel"> 每级 {{ signed(row.perLevel) }}</template><template v-if="row.flat"> 固定 {{ signed(row.flat) }}</template></span><button class="trpg-icon-btn" type="button" :aria-label="`删除修正 ${row.label}`" @click="adj = adj.filter((_, j) => j !== i)"><Icon name="x" :size="16" /></button></li>
      <li v-if="!auto.parts.length && !adj.length" class="is-empty">没有职业：上限只能手填。</li>
    </ul>
    <p v-if="adjusted.length === 0 && auto.parts.length === 0" class="trpg-hpedit__note">选了职业后这里会列出每一级怎么算。</p>
    <div v-if="!adding" class="trpg-hpedit__addrow"><button class="trpg-btn trpg-btn--quiet trpg-btn--small" type="button" data-testid="person-card-hp-adj-add" @click="adding = true"><Icon name="plus" :size="16" />添加修正</button></div>
    <div v-else class="trpg-hpedit__adj">
      <input v-model="draft.label" class="trpg-input" placeholder="来源名称，如：强健专长" aria-label="修正来源名称" />
      <input v-model="draft.flat" class="trpg-input" inputmode="numeric" placeholder="固定 +" aria-label="固定值" />
      <input v-model="draft.perLevel" class="trpg-input" inputmode="numeric" placeholder="每级 +" aria-label="每级值" />
      <button class="trpg-btn trpg-btn--small" type="button" data-testid="person-card-hp-adj-ok" @click="addAdj">添加</button>
      <p v-if="adjError" class="trpg-field__error" role="alert">{{ adjError }}</p>
    </div>
    <div v-if="auto.dice.length" class="trpg-hpedit__dice">
      <span class="trpg-hpedit__title">生命骰数量</span>
      <label v-for="row in auto.dice" :key="row.sides" class="trpg-hpedit__die"><span>d{{ row.sides }}</span><input v-model="diceOverride[String(row.sides)]" class="trpg-input trpg-input--sm" inputmode="numeric" :placeholder="String(row.total)" :aria-label="`d${row.sides} 生命骰数量`" /><span class="trpg-hpedit__auto">自动 {{ row.total }}</span></label>
    </div>
    <div class="trpg-hpedit__foot">
      <button class="trpg-btn trpg-btn--quiet trpg-btn--small" type="button" :disabled="!canReset" data-testid="person-card-hp-auto" @click="resetAuto"><Icon name="arrow-counter-clockwise" :size="16" />全部恢复自动</button>
      <span class="trpg-hpedit__hint">手填的是覆盖值，不改原来的值</span>
    </div>
  </form>
</template>
