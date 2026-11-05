<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ABILITY_KEYS, ABILITY_LABELS, type AbilityKey } from '../../../../rules/dnd5e2014/data/enums'
import { levelDiff } from '../../../../rules/dnd5e2014/derive'
import { cryptoRng } from '../../../../rules/dice'
import { useModalStore } from '../../../../stores/modal'
import Icon from '../../../kit/Icon.vue'
import SelectField from '../../../kit/SelectField.vue'
import Stepper from '../../../kit/Stepper.vue'
import type { CardCtx } from '../cardCtx'
import { namesOf } from '../cardData'
import { applyLevels } from '../flowOps'
import { signed } from '../format'
import DialogFrame from './DialogFrame.vue'

const props = defineProps<{ ctx: CardCtx; goClass: () => void }>()
const modal = useModalStore()
const row = computed(() => props.ctx.person.block.classes?.[0])
const entry = computed(() => (row.value ? props.ctx.data.classOf(row.value.class) : undefined))
const from = computed(() => row.value?.level ?? 1)
const target = ref(from.value)
const mode = ref<Record<number, 'avg' | 'roll'>>({})
const rolls = ref<Record<number, number>>({})
const asi = ref<Record<number, [AbilityKey | '', AbilityKey | '']>>({})
const removeOnDown = ref(true)
const ro = computed(() => props.ctx.readOnly)
const con = computed(() => props.ctx.derived().abilities.con.modifier ?? 0)
const diff = computed(() => (entry.value ? levelDiff(entry.value, from.value, target.value, con.value, props.ctx.data.tables) : null))
/** 当前等级的熟练加值（读库里的升级表）；读不到就是破折号。 */
const profText = (level: number): string => { const v = props.ctx.data.tables.profByLevel[Math.max(1, Math.min(20, level)) - 1]; return v === undefined ? '—' : signed(v) }
const subclassAt = computed(() => entry.value?.subclassLevel ?? 99)
const abOptions = ABILITY_KEYS.map((k) => ({ value: k, label: ABILITY_LABELS[k] }))
const names = ref<Record<string, string>>({})
watch(() => diff.value?.features.join('|'), async () => { const ids = diff.value?.features ?? []; if (ids.length) names.value = { ...names.value, ...(await namesOf(ids)) } }, { immediate: true })
const featureNames = computed(() => (diff.value?.features ?? []).map((id) => names.value[id] ?? props.ctx.data.nameOf(id)).filter((n) => n && !n.startsWith('feature.')))
const dirty = computed(() => target.value !== from.value)
function step(d: number): void { target.value = Math.max(1, Math.min(20, target.value + d)) }
function rollFor(level: number): void { if (entry.value) { rolls.value = { ...rolls.value, [level]: 1 + Math.floor(cryptoRng() * entry.value.hitDie) }; mode.value = { ...mode.value, [level]: 'roll' } } }
function setRoll(level: number, e: Event): void { const n = Math.trunc(Number((e.target as HTMLInputElement).value)); if (entry.value && n >= 1 && n <= entry.value.hitDie) rolls.value = { ...rolls.value, [level]: n } }
function setAsi(level: number, i: 0 | 1, v: string | undefined): void { const cur = asi.value[level] ?? ['', '']; const next: [AbilityKey | '', AbilityKey | ''] = [...cur] as never; next[i] = (v ?? '') as AbilityKey | ''; asi.value = { ...asi.value, [level]: next } }
function reset(): void { target.value = from.value; mode.value = {}; rolls.value = {}; asi.value = {} }
function apply(): void {
  const e = entry.value
  if (!e || ro.value || !dirty.value) return
  const finals: Partial<Record<AbilityKey, number>> = Object.fromEntries(ABILITY_KEYS.map((k) => [k, props.ctx.derived().abilities[k].value ?? 0]))
  const useRolls = Object.fromEntries(Object.entries(rolls.value).filter(([lv]) => mode.value[Number(lv)] === 'roll').map(([lv, v]) => [Number(lv), v]))
  const pairs = Object.fromEntries(Object.entries(asi.value).filter(([, p]) => p[0] && p[1]).map(([lv, p]) => [Number(lv), p as [AbilityKey, AbilityKey]]))
  const first = applyLevels(props.ctx.person, e, { to: target.value, rolls: useRolls, asi: pairs, removeOnDown: removeOnDown.value, finals })
  const max = props.ctx.derivedWith(first.block, { hpRolls: first.hpRolls }).hp.value
  const res = applyLevels(props.ctx.person, e, { to: target.value, rolls: useRolls, asi: pairs, removeOnDown: removeOnDown.value, finals, newMax: max })
  props.ctx.commitMany({ block: res.block, hpRolls: res.hpRolls, asiLog: res.asiLog }, ['block', 'hpRolls', 'asiLog'], { hitDiceUsed: res.hitDiceUsed ?? {}, ...(res.hpCurrent !== null ? { hp: { current: res.hpCurrent } } : {}) })
  props.ctx.toast.success(res.skipped.length ? `已应用等级变更；${res.skipped.length} 项属性提升因超过 20 未加` : '已应用等级变更')
  modal.close(true)
}
</script>

<template>
  <DialogFrame note="这一步会改等级、生命、属性提升；一次应用算一步撤销">
    <div v-if="!row || !entry" class="trpg-lv__none"><p class="trpg-card-empty">还没有职业。</p><button class="trpg-btn trpg-btn--primary" type="button" data-testid="levels-go-class" @click="goClass()">去选择职业</button></div>
    <template v-else>
      <header class="trpg-lv__head">
        <h3>{{ ctx.data.nameOf(row.class) }} {{ from }} 级 → {{ target }} 级</h3>
        <Stepper class="trpg-lv__step" :value="target" minus-label="目标等级减一" plus-label="目标等级加一" :minus-disabled="ro || target <= 1" :plus-disabled="ro || target >= 20" minus-testid="levels-minus" plus-testid="levels-plus" value-testid="levels-target" @minus="step(-1)" @plus="step(1)" />
      </header>
      <p v-if="diff && diff.direction === 'same'" class="trpg-card-empty">用 [−] [+] 选目标等级。</p>
      <template v-else-if="diff && diff.direction === 'up'">
        <h3>升到 {{ target }} 级会得到</h3>
        <ul class="trpg-lv__steps">
<li v-for="s in diff.steps" :key="s.level" class="trpg-lv__step-row">
          <b>{{ s.level }} 级</b>
          <div class="trpg-lv__col">
            <div class="trpg-lv__hp">
生命
              <label><input v-model="mode[s.level]" type="radio" value="avg" :name="`hp-${s.level}`" :checked="(mode[s.level] ?? 'avg') === 'avg'" />平均 {{ s.average }}</label>
              <label><input v-model="mode[s.level]" type="radio" value="roll" :name="`hp-${s.level}`" />掷骰</label>
              <template v-if="mode[s.level] === 'roll'"><input class="trpg-input trpg-input--sm trpg-adj__num" type="number" min="1" :max="entry.hitDie" :value="rolls[s.level] ?? ''" :aria-label="`${s.level} 级掷骰点数`" @change="setRoll(s.level, $event)" /><button class="trpg-btn trpg-btn--small" type="button" :aria-label="`${s.level} 级掷骰`" :data-testid="`levels-roll-${s.level}`" @click="rollFor(s.level)"><Icon name="dice-five" :size="16" />掷 d{{ entry.hitDie }}</button></template>
              <span>+ 体质 {{ signed(con) }}</span>
            </div>
            <p v-if="s.level === subclassAt" class="trpg-lv__hint"><Icon name="info" :size="16" />到这一级要选择子职业（子职业的选择之后做）</p>
          </div>
          <div v-if="diff.asiLevels.includes(s.level)" class="trpg-lv__asi" :data-testid="`levels-asi-${s.level}`">
属性值提升（同一项 = +2，两项各 +1）
            <SelectField :model-value="asi[s.level]?.[0] || undefined" :options="abOptions" :label="`${s.level} 级属性提升 一`" placeholder="选属性" @update:model-value="(v) => setAsi(s.level, 0, v)" />
            <SelectField :model-value="asi[s.level]?.[1] || undefined" :options="abOptions" :label="`${s.level} 级属性提升 二`" placeholder="再选一项" @update:model-value="(v) => setAsi(s.level, 1, v)" />
          </div>
        </li>
</ul>
        <ul class="trpg-lv__list"><li>熟练加值：{{ profText(from) }} → {{ diff.proficiency === null ? '—' : signed(diff.proficiency) }}</li><li v-if="featureNames.length">新特性：{{ featureNames.join('、') }}</li><li v-if="diff.slots">法术位：{{ diff.slots.map((n, i) => (n ? `${i + 1}环 ${n}` : '')).filter(Boolean).join(' · ') }}</li></ul>
      </template>
      <template v-else-if="diff">
        <h3>降到 {{ target }} 级会失去</h3>
        <ul class="trpg-lv__steps"><li v-for="s in diff.steps" :key="s.level" class="trpg-lv__step-row"><b>{{ s.level }} 级</b><span>生命上限按每级累计重算{{ ctx.person.hpRolls?.[s.level] ? `（记录的掷骰 ${ctx.person.hpRolls[s.level]} 一并去掉）` : '' }}</span></li></ul>
        <ul class="trpg-lv__list"><li>熟练加值：{{ profText(from) }} → {{ diff.proficiency === null ? '—' : signed(diff.proficiency) }}</li><li v-if="featureNames.length">失去特性：{{ featureNames.join('、') }}</li></ul>
        <label v-if="diff.asiLevels.length" class="trpg-flow__row"><input v-model="removeOnDown" type="checkbox" class="trpg-ab__check" data-testid="levels-remove-asi" />移除这些等级带来的属性提升（默认勾选）</label>
        <p class="trpg-dlg__small">生命骰已用数会压到新总数，当前生命会压到新上限。</p>
      </template>
    </template>
    <template #actions><button class="trpg-btn" type="button" :disabled="!dirty" @click="reset">还原</button><button class="trpg-btn trpg-btn--primary" type="button" :disabled="ro || !dirty || !row" data-testid="levels-apply" @click="apply">应用等级变更</button></template>
  </DialogFrame>
</template>
