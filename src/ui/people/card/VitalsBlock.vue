<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Person } from '../../../schemas/people'
import type { LivePatch } from '../../../stores/people'
import type { HpResult } from '../../../rules/dnd5e2014/derive'
import Icon from '../../kit/Icon.vue'
import HoverTip from '../../kit/HoverTip.vue'
import HpEditor, { type HpEditPayload } from './HpEditor.vue'
import { partLines } from './format'

const props = defineProps<{ person: Person; hp: HpResult; auto: HpResult; readOnly: boolean; /** 力竭每级的说明：读库里的力竭表；没安装就是空的（只显示级数）。 */ exhaustionText?: Array<{ level: number; text: string }>; /** 库里力竭条目的编号：有就能点「力竭」看资料；没安装就是灰的。 */ conditionRef?: string }>()
const emit = defineEmits<{ live: [patch: LivePatch]; commit: [payload: HpEditPayload]; placeholder: [kind: 'rest']; hitDie: [sides: number]; exhaustionInfo: [] }>()
const editing = ref(false)
const editor = ref<InstanceType<typeof HpEditor> | null>(null)
const max = computed(() => props.hp.value)
const currentValue = computed(() => props.person.hp.current ?? max.value)
const bar = computed(() => {
  if (max.value === null || max.value <= 0) return { hp: 0, temp: 0, low: false }
  const cur = Math.max(0, Math.min(max.value, currentValue.value ?? 0))
  return { hp: (cur / max.value) * 100, temp: Math.min(100, (Math.max(0, props.person.hp.temp) / max.value) * 100), low: cur / max.value < 0.25 }
})
const death = computed(() => props.person.hp.deathSaves)
// 力竭每一级的说明来自库里的力竭表（只写说明，不自动改任何数字）；库里没有就只显示级数
const level = computed(() => props.person.exhaustion ?? 0)
const textOf = (lv: number): string => props.exhaustionText?.find((row) => row.level === lv)?.text ?? ''
const exhaustionNow = computed(() => (level.value === 0 ? '无影响' : `${level.value} 级${textOf(level.value) ? ` · ${textOf(level.value)}` : ''}`))
const hpLines = computed(() => partLines(props.hp.parts, max.value, '', true))

function setDeath(kind: 'success' | 'fail', n: number): void {
  if (props.readOnly) return
  const old = props.person.hp.deathSaves[kind]
  emit('live', { hp: { deathSaves: kind === 'success' ? { success: old === n ? 0 : n } : { fail: old === n ? 0 : n } } })
}
function setDie(sides: number, n: number): void {
  if (props.readOnly) return
  const row = props.hp.dice.find((item) => item.sides === sides)
  if (!row) return
  const remaining = row.total - row.used
  const used = n <= remaining ? row.total - (n - 1) : row.total - n
  emit('live', { hitDiceUsed: { ...(props.person.hitDiceUsed ?? {}), [String(sides)]: Math.max(0, Math.min(row.total, used)) } })
}
function stepExhaustion(delta: number): void {
  if (props.readOnly) return
  emit('live', { exhaustion: Math.max(0, Math.min(6, level.value + delta)) })
}
const saved = (kind: 'success' | 'fail', n: number): boolean => death.value[kind] >= n
function commit(payload: HpEditPayload): void { emit('commit', payload) }
</script>

<template>
  <section class="trpg-card-vitals" data-testid="person-card-vitals">
    <header class="trpg-card-head trpg-card-head--sub">
      <h3>生命</h3>
      <div class="trpg-card-head__actions">
        <button class="trpg-btn trpg-btn--quiet trpg-btn--small" type="button" data-testid="person-card-rest" @click="emit('placeholder', 'rest')"><Icon name="moon" :size="16" />休息</button>
        <button v-if="!editing" class="trpg-icon-btn" type="button" :disabled="readOnly" aria-label="编辑生命" data-testid="person-card-hp-edit" @click="editing = true"><Icon name="pencil-simple" :size="20" /></button>
        <button v-else class="trpg-btn trpg-btn--small" type="button" data-testid="person-card-hp-done" @click="editor?.commit()">完成</button>
      </div>
    </header>
    <HpEditor v-if="editing" ref="editor" :person="person" :hp="hp" :auto="auto" @commit="commit" @done="editing = false" />
    <template v-else>
      <HoverTip :lines="hpLines">
<div class="trpg-card-vitals__numbers">
        <span class="trpg-card-vitals__current" data-testid="person-card-hp-current" aria-live="polite">{{ max === null ? '' : currentValue }}</span>
        <span v-if="max !== null" class="trpg-card-vitals__slash">/</span>
        <span class="trpg-card-vitals__max">{{ max ?? '' }}</span>
        <span v-if="person.hp.temp > 0" class="trpg-badge-gold trpg-badge-gold--sm">临时 {{ person.hp.temp }}</span>
      </div>
</HoverTip>
      <p v-if="max === null" class="trpg-card-vitals__auto">选了职业后自动算上限，也可以点 ✎ 手填。</p>
    </template>
    <div class="trpg-hpbar" :class="{ 'is-empty': max === null, 'is-low': bar.low }" aria-hidden="true"><span class="trpg-hpbar__part is-hp" :style="{ width: `${bar.hp}%` }" /><span class="trpg-hpbar__part is-temp" :style="{ width: `${bar.temp}%` }" /></div>
    <div class="trpg-card-vitals__line" aria-live="polite">
      <span class="trpg-card-vitals__label">死亡豁免</span>
      <span class="trpg-card-vitals__grp"><span class="trpg-card-vitals__word">成功</span>
      <button v-for="n in 3" :key="`s${n}`" class="trpg-dot trpg-dot--ok" :class="{ 'is-on': saved('success', n) }" type="button" :aria-label="`死亡豁免成功 ${n} 次`" :aria-pressed="saved('success', n)" :disabled="readOnly" @click="setDeath('success', n)" /></span>
      <span class="trpg-card-vitals__grp"><span class="trpg-card-vitals__word">失败</span>
      <button v-for="n in 3" :key="`f${n}`" class="trpg-dot trpg-dot--fail" :class="{ 'is-on': saved('fail', n) }" type="button" :aria-label="`死亡豁免失败 ${n} 次`" :aria-pressed="saved('fail', n)" :disabled="readOnly" @click="setDeath('fail', n)" /></span>
    </div>
    <div class="trpg-card-vitals__line trpg-card-vitals__dice">
      <button class="trpg-card-vitals__label trpg-linkbtn" type="button" :disabled="readOnly || !hp.dice.length" data-testid="person-card-hitdie-roll" @click="emit('hitDie', hp.dice[0]!.sides)">生命骰</button>
      <template v-if="hp.dice.length">
        <span v-for="row in hp.dice" :key="row.sides" class="trpg-diecap"><span class="trpg-diecap__name">d{{ row.sides }}</span><button v-for="n in row.total" :key="n" class="trpg-dot trpg-dot--primary trpg-dot--sm" :class="{ 'is-on': n <= row.total - row.used }" type="button" :aria-label="`生命骰 d${row.sides} 第 ${n} 颗，${n <= row.total - row.used ? '还有' : '已用'}`" :disabled="readOnly" @click="setDie(row.sides, n)" /></span>
      </template>
      <span v-else class="trpg-card-vitals__hint">选职业后出现</span>
    </div>
    <div class="trpg-card-vitals__line trpg-exhaustion">
      <button class="trpg-card-vitals__label trpg-linkbtn trpg-exhaustion__link" type="button" :disabled="!conditionRef" data-testid="person-card-exhaustion-info" @click="emit('exhaustionInfo')">力竭</button>
      <button class="trpg-icon-btn trpg-exhaustion__step" type="button" aria-label="减少一级力竭" :disabled="readOnly || level <= 0" @click="stepExhaustion(-1)"><Icon name="minus" :size="16" /></button>
      <span class="trpg-exhaustion__value" data-testid="person-card-exhaustion">{{ level }} / 6</span>
      <button class="trpg-icon-btn trpg-exhaustion__step" type="button" aria-label="增加一级力竭" :disabled="readOnly || level >= 6" @click="stepExhaustion(1)"><Icon name="plus" :size="16" /></button>
      <span class="trpg-exhaustion__text">{{ exhaustionNow }}</span>
    </div>
  </section>
</template>
