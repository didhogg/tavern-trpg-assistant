<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import type { Person } from '../../../schemas/people'
import type { LivePatch } from '../../../stores/people'
import type { HpResult } from '../../../rules/dnd5e2014/derive'
import Icon from '../../kit/Icon.vue'

const props = defineProps<{ person: Person; hp: HpResult; readOnly: boolean }>()
const emit = defineEmits<{
  live: [patch: LivePatch]
  commit: [payload: { hp: Partial<Person['hp']>; cap: number | null }]
  placeholder: [kind: 'rest']
}>()
const editing = ref(false)
const current = ref('')
const cap = ref('')
const temp = ref('')
const form = ref<HTMLElement | null>(null)
const max = computed(() => props.hp.value)
const currentValue = computed(() => props.person.hp.current ?? max.value)
const bar = computed(() => {
  if (max.value === null || max.value <= 0) return []
  const cur = Math.max(0, Math.min(max.value, currentValue.value ?? 0))
  return [{ kind: 'hp', width: (cur / max.value) * 100 }, { kind: 'temp', width: Math.max(0, props.person.hp.temp) / max.value * 100 }]
})
const death = computed(() => props.person.hp.deathSaves)
const dice = computed(() => props.hp.dice)

function begin(): void {
  if (props.readOnly) return
  editing.value = true
  current.value = currentValue.value === null ? '' : String(currentValue.value)
  cap.value = props.person.block.overrides?.hpMax !== undefined ? String(props.person.block.overrides.hpMax) : (max.value === null ? '' : String(max.value))
  temp.value = String(props.person.hp.temp)
  void nextTick(() => form.value?.querySelector<HTMLInputElement>('input')?.focus())
}
function number(value: string): number | undefined {
  if (value.trim() === '') return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : undefined
}
function commit(): void {
  if (!editing.value) return
  const nextMax = number(cap.value)
  const autoMax = max.value
  const capValue = cap.value.trim() === '' || nextMax === autoMax ? null : (nextMax ?? null)
  const upper = capValue ?? autoMax
  let cur = number(current.value)
  if (cur !== undefined && upper !== null) cur = Math.min(cur, upper)
  emit('commit', { hp: { current: cur ?? null, temp: number(temp.value) ?? 0 }, cap: capValue })
  editing.value = false
}
function cancel(): void {
  editing.value = false
}
function blur(event: FocusEvent): void {
  const next = event.relatedTarget as Node | null
  if (!next || !form.value?.contains(next)) commit()
}
function setDeath(kind: 'success' | 'fail', n: number): void {
  if (props.readOnly) return
  const old = props.person.hp.deathSaves[kind]
  const next: Partial<Person['hp']['deathSaves']> = kind === 'success' ? { success: old === n ? 0 : n } : { fail: old === n ? 0 : n }
  emit('live', { hp: { deathSaves: next } })
}
function setDie(sides: number, n: number): void {
  if (props.readOnly) return
  const row = dice.value.find((item) => item.sides === sides)
  if (!row) return
  const remaining = row.total - row.used
  const used = n <= remaining ? row.total - (n - 1) : row.total - n
  emit('live', { hitDiceUsed: { ...(props.person.hitDiceUsed ?? {}), [String(sides)]: Math.max(0, Math.min(row.total, used)) } })
}
const saved = (kind: 'success' | 'fail', n: number): boolean => death.value[kind] >= n
</script>

<template>
  <section class="trpg-card-vitals" data-testid="person-card-vitals">
    <div class="trpg-card-vitals__head">
      <span class="trpg-card-vitals__label">生命</span>
      <div class="trpg-card-vitals__head-actions">
        <button v-if="!editing" class="trpg-icon-btn" type="button" :disabled="readOnly" aria-label="编辑生命" data-testid="person-card-hp-edit" @click="begin"><Icon name="pencil-simple" :size="18" /></button>
        <button v-else class="trpg-btn trpg-btn--small" type="button" data-testid="person-card-hp-done" @click="commit">完成</button>
        <button class="trpg-btn trpg-btn--small" type="button" data-testid="person-card-rest" @click="emit('placeholder', 'rest')"><Icon name="moon" :size="16" />休息</button>
      </div>
    </div>
    <div v-if="!editing && max !== null" class="trpg-card-vitals__numbers">
      <span class="trpg-card-vitals__current" data-testid="person-card-hp-current" aria-live="polite">{{ currentValue ?? '' }}</span>
      <span class="trpg-card-vitals__slash">/</span>
      <span class="trpg-card-vitals__max">{{ max ?? '' }}</span>
      <span v-if="person.hp.temp > 0" class="trpg-card-vitals__temp">临时 {{ person.hp.temp }}</span>
    </div>
    <form v-if="editing" ref="form" class="trpg-card-vitals__edit" @focusout="blur" @submit.prevent="commit">
      <label class="trpg-card-vitals__field"><span>当前</span><input v-model="current" class="trpg-input" inputmode="numeric" aria-label="当前生命" data-testid="person-card-hp-current-input" @keydown.enter.prevent="commit" @keydown.esc.prevent="cancel" /></label>
      <label class="trpg-card-vitals__field"><span>上限</span><input v-model="cap" class="trpg-input" inputmode="numeric" aria-label="生命上限" data-testid="person-card-hp-max-input" @keydown.enter.prevent="commit" @keydown.esc.prevent="cancel" /></label>
      <label class="trpg-card-vitals__field"><span>临时</span><input v-model="temp" class="trpg-input" inputmode="numeric" aria-label="临时生命" data-testid="person-card-hp-temp-input" @keydown.enter.prevent="commit" @keydown.esc.prevent="cancel" /></label>
      <div class="trpg-card-vitals__edit-actions"><button class="trpg-btn trpg-btn--small trpg-btn--quiet" type="button" data-testid="person-card-hp-auto" @click="cap = ''">自动计算</button></div>
      <p class="trpg-card-vitals__auto">{{ hp.sources.join('；') || '生命上限暂时算不出来。' }}</p>
    </form>
    <div class="trpg-hpbar" :class="{ 'is-empty': max === null }" :aria-hidden="max === null">
      <span v-for="part in bar" :key="part.kind" class="trpg-hpbar__part" :class="`is-${part.kind}`" :style="{ width: `${Math.min(100, part.width)}%` }" />
    </div>
    <div class="trpg-card-vitals__death" aria-live="polite">
      <span class="trpg-card-vitals__death-label">死亡豁免</span>
      <span class="trpg-card-vitals__death-word">成功</span>
      <button v-for="n in 3" :key="`s${n}`" class="trpg-dot trpg-dot--ok" :class="{ 'is-on': saved('success', n) }" type="button" :aria-label="`死亡豁免成功 ${n} 次`" :disabled="readOnly" @click="setDeath('success', n)" />
      <span class="trpg-card-vitals__death-word">失败</span>
      <button v-for="n in 3" :key="`f${n}`" class="trpg-dot trpg-dot--danger" :class="{ 'is-on': saved('fail', n) }" type="button" :aria-label="`死亡豁免失败 ${n} 次`" :disabled="readOnly" @click="setDeath('fail', n)" />
    </div>
    <div v-if="dice.length" class="trpg-card-vitals__dice">
      <div v-for="row in dice" :key="row.sides" class="trpg-card-vitals__dice-row">
        <span class="trpg-card-vitals__death-label">生命骰 d{{ row.sides }}</span>
        <button v-for="n in row.total" :key="n" class="trpg-dot trpg-dot--primary" :class="{ 'is-on': n <= row.total - row.used }" type="button" :aria-label="`生命骰 d${row.sides} 第 ${n} 颗，${n <= row.total - row.used ? '还有' : '已用'}`" :disabled="readOnly" @click="setDie(row.sides, n)" />
      </div>
    </div>
    <p v-if="!editing && max === null" class="trpg-card-vitals__auto">生命上限暂时算不出来。</p>
  </section>
</template>
