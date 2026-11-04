<script setup lang="ts">
import { computed, ref } from 'vue'
import { ABILITY_KEYS, ABILITY_LABELS, type AbilityKey } from '../../../../rules/dnd5e2014/data/enums'
import { STANDARD_ARRAY, poolPlace, poolReturn, poolUsed, poolValue, type PoolState } from '../../../../rules/dnd5e2014/derive'
import { cryptoRng } from '../../../../rules/dice'
import { useModalStore } from '../../../../stores/modal'
import Icon from '../../../kit/Icon.vue'
import Segmented from '../../../kit/Segmented.vue'
import HoverTip from '../../../kit/HoverTip.vue'
import type { CardCtx } from '../cardCtx'
import { BUY_BUDGET, BUY_COST, applyStage, buySpent, buyStep, canBuyUp, clearManual, initStage, manualCounts, roll4d6, stageDirty, type Stage } from '../abilityStage'
import { signed } from '../format'
import { expectedGrants } from '../expected'
import { assignGrants, restorable } from '../../../../rules/dnd5e2014/derive'
import DialogFrame from './DialogFrame.vue'

const props = defineProps<{ ctx: CardCtx }>()
const modal = useModalStore()
const stage = ref<Stage>(initStage(props.ctx.person.block))
const method = ref<'standard' | 'roll' | 'buy'>('standard')
const rolled = ref<Array<{ total: number; dice: number[]; dropped: number }>>([])
const pool = ref<PoolState>({ pool: STANDARD_ARRAY, placed: {} })
const selected = ref<number | null>(null)
const overrideView = ref(false)
const showDetail = ref(false)
const clearedNote = ref(false)
const ro = computed(() => props.ctx.readOnly)
const staged = computed(() => applyStage(props.ctx.person.block, stage.value))
const d = computed(() => props.ctx.derivedWith(staged.value))
const dirty = computed(() => stageDirty(props.ctx.person.block, stage.value) || Object.keys(restored.value).length > 0)
const counts = computed(() => manualCounts(stage.value))
const used = computed(() => poolUsed(pool.value))
const methods = [{ value: 'standard', label: '标准数组' }, { value: 'roll', label: '4d6 去最低' }, { value: 'buy', label: '购点' }]

function setMethod(m: string | undefined): void {
  method.value = m === 'roll' ? 'roll' : m === 'buy' ? 'buy' : 'standard'
  selected.value = null
  pool.value = { pool: method.value === 'roll' ? rolled.value.map((r) => r.total) : STANDARD_ARRAY, placed: {} }
}
function rollAll(): void { rolled.value = Array.from({ length: 6 }, () => roll4d6(cryptoRng)); pool.value = { pool: rolled.value.map((r) => r.total), placed: pool.value.placed }; selected.value = null }
/** 退回：该属性的基础值回到放入前（写入草稿之前的值）。 */
function giveBack(k: AbilityKey): void {
  pool.value = poolReturn(pool.value, k)
  const orig = (props.ctx.person.block.abilities as Partial<Record<AbilityKey, number>> | undefined)?.[k]
  const base = { ...stage.value.base }
  if (orig === undefined) delete base[k]; else base[k] = orig
  stage.value = { ...stage.value, base }
}
function pick(i: number): void {
  if (used.value.has(i)) { const owner = ABILITY_KEYS.find((k) => pool.value.placed[k] === i); if (owner) giveBack(owner); return }
  selected.value = selected.value === i ? null : i
}
function clickRow(k: AbilityKey): void {
  if (ro.value || method.value === 'buy') return
  if (selected.value === null) { if (pool.value.placed[k] !== undefined) giveBack(k); return }
  const index = selected.value
  const prevOwner = ABILITY_KEYS.find((o) => pool.value.placed[o] === index && o !== k)
  if (prevOwner) giveBack(prevOwner)
  pool.value = poolPlace(pool.value, k, index)
  stage.value = { ...stage.value, base: { ...stage.value.base, [k]: poolValue(pool.value, k)! } }
  selected.value = null
}
const isPlaced = (k: AbilityKey): boolean => method.value !== 'buy' && pool.value.placed[k] !== undefined
function typeBase(k: AbilityKey, e: Event): void { const v = (e.target as HTMLInputElement).value; stage.value = { ...stage.value, base: { ...stage.value.base, ...(v.trim() === '' ? {} : { [k]: Math.trunc(Number(v)) }) } }; if (v.trim() === '') delete stage.value.base[k] }
function typeOther(k: AbilityKey, e: Event): void { stage.value = { ...stage.value, other: { ...stage.value.other, [k]: Math.trunc(Number((e.target as HTMLInputElement).value)) || 0 } } }
function typeOverride(k: AbilityKey, e: Event): void { const v = (e.target as HTMLInputElement).value; const o = { ...stage.value.override }; if (v.trim() === '') delete o[k]; else o[k] = Math.trunc(Number(v)); stage.value = { ...stage.value, override: o } }
function step(k: AbilityKey, delta: 1 | -1): void { stage.value = { ...stage.value, base: buyStep(stage.value.base, k, delta) } }
function toggleSave(k: AbilityKey): void { stage.value = { ...stage.value, saves: { ...stage.value.saves, [k]: !stage.value.saves[k] } } }
function clearAll(): void { stage.value = clearManual(stage.value); clearedNote.value = true }
function save(): void {
  let block = applyStage(props.ctx.person.block, stage.value)
  for (const m of expectedGrants(props.ctx.person, props.ctx.data)) if (m.grant.category === 'saves' && restored.value[m.grant.key as AbilityKey]) block = { ...block, proficiencies: assignGrants(block.proficiencies, [m.grant], m.from) }
  props.ctx.commitBlock(block)
  modal.close(true)
}
const buySp = computed(() => buySpent(stage.value.base))
const cellLines = (k: AbilityKey, kind: 'racial' | 'growth' | 'equipment'): string[] => (d.value.abilities[k][kind] ? [`${kind === 'racial' ? '种族/背景' : kind === 'growth' ? '成长/专长' : '装备/魔法物品'} ${signed(d.value.abilities[k][kind])}`] : [])
const restored = ref<Partial<Record<AbilityKey, string>>>({})
const missing = computed(() => {
  const want = expectedGrants(props.ctx.person, props.ctx.data).filter((e) => e.grant.category === 'saves')
  return restorable(staged.value.proficiencies, want.map((e) => e.grant)).filter((g) => !restored.value[g.key as AbilityKey]).map((grant) => ({ grant, from: want.find((e) => e.grant.key === grant.key)?.from ?? '' }))
})
function restoreSave(m: (typeof missing.value)[number]): void { restored.value = { ...restored.value, [m.grant.key]: m.from } }
</script>

<template>
  <DialogFrame note="点「保存并写入属性点」才写进属性">
    <section class="trpg-ab__gen">
      <h3>生成基础值</h3>
      <Segmented :model-value="method" :options="methods" label="生成方式" @update:model-value="setMethod" />
      <template v-if="method !== 'buy'">
        <button v-if="method === 'roll'" class="trpg-btn trpg-btn--small" type="button" :disabled="ro" data-testid="ab-roll" @click="rollAll"><Icon name="dice-five" :size="16" />一键掷 6 组点数</button>
        <p class="trpg-ab__hint">点池里的数字，再点下面的属性行放入；放入后再点一次退回</p>
        <div class="trpg-ab__pool" role="group" aria-label="点数池"><button v-for="(n, i) in pool.pool" :key="i" class="trpg-ab__num" :class="{ 'is-selected': selected === i, 'is-used': used.has(i) }" type="button" :aria-pressed="selected === i" :aria-label="used.has(i) ? `${n}（已放入，点一下退回）` : `${n}`" :data-testid="`ab-pool-${i}`" @click="pick(i)">{{ n }}</button><span v-if="method === 'roll' && !rolled.length" class="trpg-card-empty">先点「一键掷 6 组点数」</span></div>
        <button v-if="method === 'roll' && rolled.length" class="trpg-linkbtn trpg-ab__detail" type="button" @click="showDetail = !showDetail"><Icon :name="showDetail ? 'caret-down' : 'caret-right'" :size="16" />点数明细</button>
        <p v-if="showDetail" class="trpg-ab__hint">{{ rolled.map((r) => `${r.total}（${r.dice.filter((x, i) => !(x === r.dropped && r.dice.indexOf(x) === i)).join('+')}，弃 ${r.dropped}）`).join(' | ') }}</p>
      </template>
      <template v-else><p class="trpg-ab__hint">剩余 {{ BUY_BUDGET - buySp }} 点 已花 {{ buySp }} / {{ BUY_BUDGET }}</p><p class="trpg-ab__hint">成本 {{ Object.entries(BUY_COST).map(([s, c]) => `${s}=${c}`).join(' ') }}</p></template>
    </section>
    <section class="trpg-ab__table-wrap">
      <h3>计算表</h3>
      <div class="trpg-ab__table" role="table" aria-label="属性计算表">
        <div class="trpg-ab__row trpg-ab__row--head" role="row"><span>属性</span><span>基础</span><span>种族/背景</span><span>成长/专长</span><span>装备/魔法物品</span><span>其他（手动）</span><span>最终</span><span>调整值</span><span>豁免</span></div>
        <div v-for="k in ABILITY_KEYS" :key="k" class="trpg-ab__row" :class="{ 'is-placed': isPlaced(k) }" role="row" :data-testid="`ab-row-${k}`" @click="clickRow(k)">
          <span class="trpg-ab__name" data-label="">{{ ABILITY_LABELS[k] }}</span>
          <span data-label="基础"><template v-if="method === 'buy'"><button class="trpg-icon-btn trpg-ab__step" type="button" :disabled="ro" :aria-label="`${ABILITY_LABELS[k]}基础 减一`" @click.stop="step(k, -1)"><Icon name="minus" :size="16" /></button><b>{{ stage.base[k] ?? 8 }}</b><button class="trpg-icon-btn trpg-ab__step" type="button" :disabled="ro || !canBuyUp(stage.base, k)" :aria-label="`${ABILITY_LABELS[k]}基础 加一`" @click.stop="step(k, 1)"><Icon name="plus" :size="16" /></button></template><input v-else class="trpg-input trpg-input--sm trpg-adj__num" type="number" :value="stage.base[k] ?? ''" :disabled="ro" :aria-label="`${ABILITY_LABELS[k]}基础值`" @click.stop @change="typeBase(k, $event)" /></span>
          <HoverTip :lines="cellLines(k, 'racial')"><span class="trpg-ab__ro" data-label="种族/背景">{{ signed(d.abilities[k].racial) }}</span></HoverTip>
          <span class="trpg-ab__ro" data-label="成长/专长">{{ signed(d.abilities[k].growth) }}</span>
          <span class="trpg-ab__ro" data-label="装备/魔法物品">{{ signed(d.abilities[k].equipment) }}</span>
          <span data-label="其他（手动）"><input class="trpg-input trpg-input--sm trpg-adj__num" type="number" :value="stage.other[k] ?? 0" :disabled="ro" :aria-label="`${ABILITY_LABELS[k]}其他`" @click.stop @change="typeOther(k, $event)" /></span>
          <span data-label="最终"><input v-if="overrideView" class="trpg-input trpg-input--sm trpg-adj__num" type="number" :value="stage.override[k] ?? ''" :placeholder="String(d.abilities[k].value ?? '')" :disabled="ro" :aria-label="`${ABILITY_LABELS[k]}覆盖最终值`" @click.stop @change="typeOverride(k, $event)" /><b v-else class="trpg-ab__final">{{ d.abilities[k].value ?? '' }}<small v-if="d.abilities[k].capped"> 上限 {{ d.abilities[k].cap }}</small></b></span>
          <span class="trpg-ab__ro" data-label="调整值">{{ signed(d.abilities[k].modifier) }}</span>
          <span data-label="豁免"><input type="checkbox" class="trpg-ab__check" :checked="stage.saves[k] || !!restored[k]" :disabled="ro" :aria-label="`${ABILITY_LABELS[k]}豁免熟练`" @click.stop @change="toggleSave(k)" /></span>
        </div>
      </div>
      <p class="trpg-ab__hint">会清空 {{ counts.other }} 项「其他」和 {{ counts.override }} 项覆盖，基础值不动（点「清除手动修正」）</p>
      <p class="trpg-ab__hint">最终 = 基础 + 种族/背景 + 成长/专长 + 装备/魔法物品 + 其他。灰字在别的页面里改，这里只读</p>
      <p v-if="clearedNote" class="trpg-ab__ok" role="status">已清空，点「保存并写入属性点」生效</p>
      <div v-if="missing.length" class="trpg-arch__sec"><h3>可恢复的自动项</h3><div class="trpg-arch__pills"><button v-for="m in missing" :key="m.grant.key" class="trpg-pill trpg-arch__restore" type="button" @click="restoreSave(m)">{{ m.grant.label }}<Icon name="arrow-counter-clockwise" :size="16" /></button></div></div>
    </section>
    <template #actions>
      <button class="trpg-btn" type="button" :aria-pressed="overrideView" data-testid="ab-override" @click="overrideView = !overrideView">覆盖</button>
      <button class="trpg-btn" type="button" :disabled="ro || (counts.other === 0 && counts.override === 0)" data-testid="ab-clear" @click="clearAll">清除手动修正</button>
      <button class="trpg-btn" type="button" @click="modal.requestClose()">取消</button>
      <button class="trpg-btn trpg-btn--primary" type="button" :disabled="ro || !dirty" data-testid="ab-save" @click="save">保存并写入属性点</button>
    </template>
  </DialogFrame>
</template>
