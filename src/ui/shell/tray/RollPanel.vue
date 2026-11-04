<script setup lang="ts">
import { computed, markRaw, onMounted, ref, watch } from 'vue'
import { ABILITY_KEYS, ABILITY_LABELS, SKILL_KEYS, SKILLS, type AbilityKey, type SkillKey } from '../../../rules/dnd5e2014/data/enums'
import { passiveValue, randomDc, resolveMode, rollSources } from '../../../rules/dnd5e2014/derive'
import { PEOPLE_CATEGORY_LABELS } from '../../../schemas/people'
import { useDiceStore } from '../../../stores/dice'
import { useModalStore } from '../../../stores/modal'
import Icon from '../../kit/Icon.vue'
import SelectField from '../../kit/SelectField.vue'
import AddEffectDialog from '../../people/card/dialogs/AddEffectDialog.vue'
import { buildFormula, judgeContest, judgeDc, judgePassive, parseCustom, rowKey, type CustomRow, type Verdict } from './rollModel'
import { useTrayData } from './useTrayData'

const props = defineProps<{ kind: 'check' | 'save' }>()
const dice = useDiceStore()
const modal = useModalStore()
const tray = useTrayData()
const actorId = ref('')
const ability = ref<AbilityKey | 'death'>('dex')
const skill = ref<SkillKey | ''>('')
const initiative = ref(false)
const passive = ref(false)
const ignored = ref<Set<string>>(new Set())
const custom = ref<CustomRow[]>([])
const adding = ref(false)
const draft = ref({ label: '', text: '' })
const draftError = ref('')
const manual = ref<'adv' | 'normal' | 'dis'>('normal')
const ignoredSrc = ref<Set<string>>(new Set())
const dcMode = ref<'fixed' | 'contest' | 'none'>('fixed')
const dc = ref(15)
const oppId = ref('')
const oppAbility = ref<AbilityKey>('str')
const oppSkill = ref<SkillKey | ''>('')
const oppBonus = ref(0)
const oppMode = ref<'adv' | 'normal' | 'dis'>('normal')
const outcome = ref<{ total: number; line: string; natural?: 20 | 1; verdict: Verdict | null; hint: string } | null>(null)
const dcInput = ref<HTMLInputElement | null>(null)

onMounted(() => { void tray.ensure(); apply() })
watch(() => dice.requestSeq, apply)
watch(() => tray.data.value, apply)
watch(passive, (on) => { if (on && dcMode.value === 'contest') dcMode.value = 'fixed' })
watch(() => props.kind, () => { if (props.kind === 'save') { skill.value = ''; passive.value = false } })

function apply(): void {
  const r = dice.request
  if (!r) { if (!actorId.value) actorId.value = tray.actors.value[0]?.id ?? ''; return }
  actorId.value = r.actorId && tray.find(r.actorId) ? r.actorId : actorId.value || tray.actors.value[0]?.id || ''
  ignored.value = new Set(); ignoredSrc.value = new Set(); custom.value = []; manual.value = 'normal'; outcome.value = null; adding.value = false
  initiative.value = r.kind === 'initiative'
  passive.value = r.kind === 'passive'
  ability.value = r.kind === 'death-save' ? 'death' : r.kind === 'initiative' ? 'dex' : r.ability ?? ability.value
  skill.value = r.kind === 'check' || r.kind === 'passive' ? r.skill ?? '' : ''
  dcMode.value = 'fixed'
  dc.value = r.kind === 'passive' ? (r.dc ?? randomDc()) : r.kind === 'death-save' ? 10 : dc.value
  setTimeout(() => dcInput.value?.focus(), 60)
}

const person = computed(() => tray.find(actorId.value))
const derived = computed(() => tray.derivedOf(actorId.value))
const isDeath = computed(() => props.kind === 'save' && ability.value === 'death')
const abilityKey = computed<AbilityKey>(() => (ability.value === 'death' ? 'con' : ability.value))
const sourceFx = computed(() => tray.sourcesOf(actorId.value))
const rs = computed(() => (derived.value ? rollSources({ kind: initiative.value ? 'initiative' : props.kind, ability: abilityKey.value, skill: initiative.value ? undefined : skill.value || undefined, derived: derived.value, effects: sourceFx.value }) : null))
const autoRows = computed(() => (isDeath.value ? [] : rs.value?.rows ?? []))
const formula = computed(() => buildFormula(autoRows.value, custom.value, ignored.value))
const modeSources = computed(() => {
  const list: Array<{ id: string; kind: 'adv' | 'dis'; label: string }> = []
  for (const s of rs.value?.adv ?? []) list.push({ id: `adv:${s}`, kind: 'adv', label: s })
  for (const s of rs.value?.dis ?? []) list.push({ id: `dis:${s}`, kind: 'dis', label: s })
  if (props.kind === 'check' && person.value?.inspiration) list.push({ id: 'adv:灵感', kind: 'adv', label: '灵感（用掉）' })
  return list.filter((x) => !ignoredSrc.value.has(x.id))
})
const finalMode = computed(() => {
  if (isDeath.value) return 'normal' as const
  const adv = modeSources.value.filter((x) => x.kind === 'adv').length + (manual.value === 'adv' ? 1 : 0)
  const dis = modeSources.value.filter((x) => x.kind === 'dis').length + (manual.value === 'dis' ? 1 : 0)
  return resolveMode(adv, dis)
})
const modeText = computed(() => {
  const adv = modeSources.value.filter((x) => x.kind === 'adv').length + (manual.value === 'adv' ? 1 : 0)
  const dis = modeSources.value.filter((x) => x.kind === 'dis').length + (manual.value === 'dis' ? 1 : 0)
  return adv > 0 && dis > 0 ? '优势与劣势互相抵消：只掷一颗 d20' : finalMode.value === 'advantage' ? '优势：掷两颗取高' : finalMode.value === 'disadvantage' ? '劣势：掷两颗取低' : '普通'
})
const title = computed(() => {
  const a = ability.value === 'death' ? '死亡豁免' : ABILITY_LABELS[ability.value]
  if (isDeath.value) return '死亡豁免'
  if (initiative.value) return '先攻（敏捷检定）'
  return props.kind === 'save' ? `${a}豁免` : skill.value ? `${a}（${SKILLS[skill.value].label}）检定` : `${a}检定`
})
const bonusTotal = computed(() => formula.value.parts.reduce((n, p) => n + (/d/i.test(p.text) ? 0 : Number(p.text.replace('−', '-'))), 0))
const actorOptions = computed(() => tray.actors.value.map((p) => ({ value: p.id, label: `${PEOPLE_CATEGORY_LABELS[p.categoryId]} · ${p.name}` })))
const oppOptions = computed(() => tray.actors.value.filter((p) => p.id !== actorId.value).map((p) => ({ value: p.id, label: `${PEOPLE_CATEGORY_LABELS[p.categoryId]} · ${p.name}` })))
const abilityOptions = computed(() => [...ABILITY_KEYS.map((k) => ({ value: k as string, label: ABILITY_LABELS[k] })), ...(props.kind === 'save' ? [{ value: 'death', label: '死亡豁免' }] : [])])
const skillOptions = computed(() => [{ value: '__none', label: '不用技能' }, ...SKILL_KEYS.map((k) => ({ value: k as string, label: `${derived.value?.skills[k].level && derived.value.skills[k].level !== 'none' ? '● ' : ''}${SKILLS[k].label}` }))])
const oppDerived = computed(() => tray.derivedOf(oppId.value))
watch([oppId, oppAbility, oppSkill], () => {
  const d = oppDerived.value
  if (!d) return
  oppBonus.value = oppSkill.value ? d.skills[oppSkill.value].value ?? 0 : d.abilities[oppAbility.value].modifier ?? 0
})
function pickSkill(v: string | undefined): void { const k = (v === '__none' || !v ? '' : v) as SkillKey | ''; skill.value = k; if (k) ability.value = SKILLS[k].ability; initiative.value = false }
function pickAbility(v: string | undefined): void { ability.value = (v ?? 'dex') as AbilityKey | 'death'; if (v === 'death') { dc.value = 10; dcMode.value = 'fixed' } initiative.value = false }
function pickOppSkill(v: string | undefined): void { const k = (v === '__none' || !v ? '' : v) as SkillKey | ''; oppSkill.value = k; if (k) oppAbility.value = SKILLS[k].ability }
function addCustom(): void {
  const parsed = parseCustom(draft.value.text)
  if (!parsed.ok) { draftError.value = parsed.error; return }
  custom.value = [...custom.value, { id: `c${Date.now()}${custom.value.length}`, label: draft.value.label.trim() || '自定义', text: parsed.text }]
  draft.value = { label: '', text: '' }; draftError.value = ''; adding.value = false
}
function lookup(): void { modal.open({ key: 'tray-lookup', title: '查资料', component: markRaw(AddEffectDialog), variant: 'dialog', width: 940, props: { lookup: true } }) }
function setDc(n: number): void { dc.value = Math.max(1, Math.min(40, Math.trunc(n) || 1)) }
const canRoll = computed(() => !!derived.value && !!person.value && !(rs.value?.failure && !custom.value.length && !isDeath.value))
const passiveNow = computed(() => passiveValue(bonusTotal.value, finalMode.value))
const expr = computed(() => (isDeath.value ? '1d20' : formula.value.expression))
function go(): void {
  if (!canRoll.value) return
  if (passive.value && props.kind === 'check') {
    const v = judgePassive(passiveNow.value, dc.value)
    outcome.value = { total: passiveNow.value, line: `被动 = 10 ${bonusTotal.value >= 0 ? '+' : '−'} ${Math.abs(bonusTotal.value)}${finalMode.value === 'advantage' ? ' + 5（优势）' : finalMode.value === 'disadvantage' ? ' − 5（劣势）' : ''}`, verdict: v, hint: '' }
    return
  }
  const mode = finalMode.value === 'advantage' ? 'adv' : finalMode.value === 'disadvantage' ? 'dis' : 'normal'
  const res = dice.rollWith(expr.value, mode, `${person.value!.name} ${title.value}`)
  if (!res) return
  let verdict: Verdict | null = null
  let hint = ''
  if (isDeath.value) { verdict = judgeDc(res.rec.total, 10); hint = res.rec.natural === 1 ? '掷出 1：算两次失败' : res.rec.natural === 20 ? '掷出 20：恢复 1 点生命' : '' }
  else if (dcMode.value === 'fixed') verdict = judgeDc(res.rec.total, dc.value)
  else if (dcMode.value === 'contest' && props.kind === 'check') {
    const opp = dice.rollWith(`1d20${oppBonus.value ? `${oppBonus.value > 0 ? '+' : '-'}${Math.abs(oppBonus.value)}` : ''}`, oppMode.value, `${tray.find(oppId.value)?.name ?? '对手'} 对抗`)
    if (opp) { verdict = judgeContest(res.rec.total, opp.rec.total); hint = `对手 ${opp.rec.line}` }
  }
  outcome.value = { total: res.rec.total, line: res.rec.line, natural: res.rec.natural, verdict, hint }
  manual.value = 'normal'
}
const MODES = [{ v: 'adv', t: '优势' }, { v: 'normal', t: '普通' }, { v: 'dis', t: '劣势' }] as const
const chips = [5, 10, 15, 20, 25, 30]
</script>

<template>
  <div class="trpg-rp" :data-testid="`roll-panel-${kind}`">
    <div class="trpg-rp__body">
      <section class="trpg-rp__sec"><h4>谁掷</h4>
        <SelectField :model-value="actorId || undefined" :options="actorOptions" label="行动者" placeholder="选一个人物" @update:model-value="(v) => { actorId = v ?? ''; ignored = new Set(); custom = []; outcome = null }" />
        <p v-if="!actorOptions.length" class="trpg-rp__hint">还没有人物。先到「人物」页新建一个。</p>
      </section>
      <section class="trpg-rp__sec"><h4>掷什么</h4>
        <p class="trpg-rp__title">{{ title }}</p>
        <div class="trpg-rp__pair">
          <SelectField :model-value="ability" :options="abilityOptions" label="属性" @update:model-value="pickAbility" />
          <SelectField v-if="kind === 'check'" :model-value="skill || '__none'" :options="skillOptions" label="技能" @update:model-value="pickSkill" />
        </div>
      </section>
      <section class="trpg-rp__sec"><h4>加值与骰式</h4>
        <ul class="trpg-rp__rows">
          <li class="trpg-rp__row"><span>d20</span></li>
          <li v-for="r in (isDeath ? [] : autoRows)" :key="rowKey(r)" class="trpg-rp__row" :class="{ 'is-off': ignored.has(rowKey(r)) }" :title="`来源：${r.source}`"><span>{{ r.label }}</span><b>{{ r.dice ? `+${r.dice}` : (r.amount ?? 0) >= 0 ? `+${r.amount}` : `−${Math.abs(r.amount ?? 0)}` }}</b><button v-if="r.dice || r.source !== r.label" class="trpg-icon-btn" type="button" :aria-label="`忽略 ${r.label}`" @click="ignored = new Set(ignored.has(rowKey(r)) ? [...ignored].filter((k) => k !== rowKey(r)) : [...ignored, rowKey(r)])"><Icon name="x" :size="16" /></button></li>
          <li v-for="c in custom" :key="c.id" class="trpg-rp__row"><span>{{ c.label }}</span><b>{{ c.text.replace('-', '−') }}</b><button class="trpg-icon-btn" type="button" :aria-label="`删除 ${c.label}`" @click="custom = custom.filter((x) => x.id !== c.id)"><Icon name="x" :size="16" /></button></li>
          <li v-if="isDeath" class="trpg-rp__row"><span class="trpg-rp__hint">死亡豁免不加任何加值，也不受优势劣势影响，DC 固定 10（p197）</span></li>
        </ul>
        <p v-if="rs?.failure && !isDeath" class="trpg-rp__warn">{{ rs.failure }}</p>
        <p v-for="n in rs?.notes ?? []" :key="n" class="trpg-rp__warn" role="status">{{ n }}</p>
        <div v-if="!isDeath" class="trpg-rp__addrow"><button class="trpg-btn trpg-btn--quiet trpg-btn--small" type="button" data-testid="roll-add-custom" @click="adding = !adding"><Icon name="plus" :size="16" />自定义加值</button><button class="trpg-btn trpg-btn--quiet trpg-btn--small" type="button" data-testid="roll-lookup" @click="lookup"><Icon name="book-open" :size="16" />查资料</button></div>
        <form v-if="adding" class="trpg-rp__form" @submit.prevent="addCustom"><input v-model="draft.label" class="trpg-input trpg-input--sm" placeholder="名称" aria-label="加值名称" /><input v-model="draft.text" class="trpg-input trpg-input--sm" placeholder="+2 / −1 / 1d4 / 2d6" aria-label="加值内容" data-testid="roll-custom-text" /><button class="trpg-btn trpg-btn--small" type="submit">添加</button><span v-if="draftError" class="trpg-field__error" role="alert">{{ draftError }}</span></form>
      </section>
      <section class="trpg-rp__sec"><h4>难度 / 对手</h4>
        <div class="trpg-seg" role="group" aria-label="难度类型"><button type="button" :aria-pressed="dcMode === 'fixed'" @click="dcMode = 'fixed'">固定 DC</button><button v-if="kind === 'check' && !passive" type="button" :aria-pressed="dcMode === 'contest'" data-testid="dc-contest" @click="dcMode = 'contest'">对抗</button><button type="button" :aria-pressed="dcMode === 'none'" @click="dcMode = 'none'">不设</button></div>
        <label v-if="kind === 'check'" class="trpg-rp__passive"><input v-model="passive" type="checkbox" data-testid="roll-passive" />被动（10 + 加值，不掷骰）</label>
        <div v-if="dcMode === 'fixed'" class="trpg-rp__dc">
          <button class="trpg-rp__round" type="button" aria-label="DC 减一" @click="setDc(dc - 1)"><Icon name="minus" :size="16" /></button>
          <input ref="dcInput" :value="dc" class="trpg-input trpg-rp__dcnum" type="number" min="1" max="40" aria-label="DC" data-testid="roll-dc" @input="setDc(Number(($event.target as HTMLInputElement).value))" />
          <button class="trpg-rp__round" type="button" aria-label="DC 加一" @click="setDc(dc + 1)"><Icon name="plus" :size="16" /></button>
          <button class="trpg-icon-btn" type="button" aria-label="随机一个 DC（1 到 25）" data-testid="roll-random-dc" @click="setDc(randomDc())"><Icon name="dice-five" :size="20" /></button>
          <div class="trpg-rp__chips"><button v-for="n in chips" :key="n" type="button" class="trpg-rp__chip" :aria-pressed="dc === n" @click="setDc(n)">{{ n }}</button></div>
        </div>
        <div v-else-if="dcMode === 'contest'" class="trpg-rp__contest">
          <SelectField :model-value="oppId || undefined" :options="oppOptions" label="对手" placeholder="选对手" @update:model-value="(v) => (oppId = v ?? '')" />
          <div class="trpg-rp__pair"><SelectField :model-value="oppAbility" :options="abilityOptions.filter((o) => o.value !== 'death')" label="对手属性" @update:model-value="(v) => (oppAbility = (v ?? 'str') as AbilityKey)" /><SelectField :model-value="oppSkill || '__none'" :options="skillOptions" label="对手技能" @update:model-value="pickOppSkill" /></div>
          <label class="trpg-adj"><span>对手加值</span><input v-model.number="oppBonus" class="trpg-input trpg-input--sm trpg-adj__num" type="number" aria-label="对手加值" /></label>
          <div class="trpg-seg" role="group" aria-label="对手掷法"><button v-for="m in MODES" :key="m.v" type="button" :aria-pressed="oppMode === m.v" @click="oppMode = m.v">{{ m.t }}</button></div>
        </div>
      </section>
      <section v-if="!isDeath" class="trpg-rp__sec"><h4>掷法</h4>
        <div class="trpg-seg" role="group" aria-label="手动掷法"><button v-for="m in MODES" :key="m.v" type="button" :aria-pressed="manual === m.v" :data-testid="`roll-mode-${m.v}`" @click="manual = m.v">{{ m.t }}</button></div>
        <ul class="trpg-rp__rows"><li v-for="s in modeSources" :key="s.id" class="trpg-rp__row"><Icon :name="s.kind === 'adv' ? 'arrow-right' : 'arrow-counter-clockwise'" :size="16" /><span>{{ s.kind === 'adv' ? '优势' : '劣势' }}：{{ s.label }}</span><button class="trpg-icon-btn" type="button" :aria-label="`忽略 ${s.label}`" @click="ignoredSrc = new Set([...ignoredSrc, s.id])"><Icon name="x" :size="16" /></button></li></ul>
        <p class="trpg-rp__final" data-testid="roll-final-mode">最终：{{ modeText }}<span class="trpg-rp__hint">（优势与劣势同时有，不论各有几个都互相抵消，p173）</span></p>
      </section>
    </div>
    <footer class="trpg-rp__foot">
      <p class="trpg-rp__formula" data-testid="roll-formula">{{ passive && kind === 'check' ? `被动 ${passiveNow}` : expr }}</p>
      <div class="trpg-rp__result" aria-live="polite" data-testid="roll-result">
        <template v-if="outcome"><b class="trpg-rp__total" data-testid="roll-total">{{ outcome.total }}</b><div class="trpg-rp__verdict"><span v-if="outcome.verdict" :class="`is-${outcome.verdict.kind}`" data-testid="roll-verdict">{{ outcome.verdict.text }}</span><small>{{ outcome.line }}<template v-if="outcome.natural"> · 天然 {{ outcome.natural }}</template></small><small v-if="outcome.hint">{{ outcome.hint }}</small></div></template>
        <span v-else class="trpg-rp__hint">掷出后，结果显示在这里</span>
      </div>
      <button class="trpg-btn trpg-btn--primary trpg-rp__roll" type="button" :disabled="!canRoll" data-testid="roll-go" @click="go"><Icon name="dice-five" :size="24" />{{ passive && kind === 'check' ? '对比 DC' : '掷骰' }}</button>
    </footer>
  </div>
</template>
