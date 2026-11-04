<script setup lang="ts">
import { computed, ref } from 'vue'
import { useModalStore } from '../../../../stores/modal'
import { useDiceStore } from '../../../../stores/dice'
import Icon from '../../../kit/Icon.vue'
import ItemCard from '../../../kit/ItemCard.vue'
import SelectField from '../../../kit/SelectField.vue'
import type { BrowserTab } from '../../../kit/BrowserTabs.vue'
import type { Part } from '../../../../rules/dnd5e2014/derive'
import type { CardCtx } from '../cardCtx'
import { signed } from '../format'
import { EXTRA_SPEEDS, addSpeedMode, adjustOf, canReset, overrideOf, removeSpeedMode, resetKey, setAdjust, setHover, setOverride, setSpeedBase, type ReadoutKey } from '../readoutOps'
import RuleLink from '../../../library/RuleLink.vue'
import AdjustRow from './AdjustRow.vue'
import DialogFrame from './DialogFrame.vue'

const props = defineProps<{ ctx: CardCtx; tab?: 'defense' | 'speed' | 'passive' }>()
const modal = useModalStore()
const dice = useDiceStore()
const tab = ref<string>(props.tab ?? 'defense')
const tabs: BrowserTab[] = [{ key: 'defense', label: '防御与先攻与熟练加值' }, { key: 'speed', label: '速度' }, { key: 'passive', label: '被动' }]
const d = computed(() => props.ctx.derived())
const block = computed(() => props.ctx.person.block)
const ro = computed(() => props.ctx.readOnly)
const confirmDel = ref('')
const adding = ref('')
const lines = (parts: Part[], unit = ''): Array<{ label: string; value: string; overridden?: boolean }> => parts.map((p) => ({ label: p.label, value: p.kind === 'override' ? `${p.amount}${unit}` : p.kind === 'base' ? `${p.amount}${unit}` : `${signed(p.amount)}${unit}`, overridden: p.overridden }))
/** 覆盖开着时，灰字显示原来的自动值（覆盖是盖在上面的，原值不丢）。 */
const autoText = (parts: Part[], k: ReadoutKey, unit = ''): string | undefined => (overrideOf(block.value, k) === null ? undefined : `${parts.filter((p) => p.kind !== 'override').reduce((n, p) => n + p.amount, 0)}${unit}`)
function write(next: ReturnType<typeof setAdjust>): void { if (!ro.value) props.ctx.commitBlock(next) }
const acAlts = computed(() => (block.value.cr !== undefined ? (block.value.ac ?? []).slice(1) : []))
const passives = [{ k: 'perception', label: '被动察觉' }, { k: 'insight', label: '被动洞悉' }, { k: 'investigation', label: '被动调查' }] as const
const speedModes = computed(() => (['walk', ...EXTRA_SPEEDS.map((s) => s.mode)] as const).filter((m) => m === 'walk' || typeof block.value.speed?.[m] === 'number'))
const modeLabel = (m: string): string => (m === 'walk' ? '步行' : EXTRA_SPEEDS.find((s) => s.mode === m)?.label ?? m)
const addable = computed(() => EXTRA_SPEEDS.filter((s) => typeof block.value.speed?.[s.mode] !== 'number').map((s) => ({ value: s.mode, label: s.label })))
function addMode(value: string | undefined): void { if (value) { write(addSpeedMode(block.value, value as 'fly')); adding.value = '' } }
const exhaustion = computed(() => props.ctx.person.exhaustion ?? 0)
function toDice(skill: 'perception' | 'insight' | 'investigation'): void { modal.close(true); dice.openRoll({ actorId: props.ctx.person.id, kind: 'passive', skill, ability: skill === 'investigation' ? 'int' : 'wis' }) }
const key = (kind: 'ac' | 'initiative' | 'proficiency'): ReadoutKey => ({ kind })
</script>

<template>
  <DialogFrame v-model:tab="tab" :tabs="tabs" tab-label="读数分类" note="改动进入草稿，点右上「保存」后生效">
    <template v-if="tab === 'defense'">
      <ItemCard title="AC" :value="String(d.ac.value ?? '')" :auto="autoText(d.ac.parts, key('ac'))" :sources="lines(d.ac.parts)" :can-reset="canReset(block, key('ac'))" :read-only="ro" @reset="write(resetKey(block, key('ac')))">
        <AdjustRow label="AC" :adjust="adjustOf(block, key('ac'))" :override="overrideOf(block, key('ac'))" :read-only="ro" @adjust="write(setAdjust(block, key('ac'), $event))" @override="write(setOverride(block, key('ac'), $event))" />
      </ItemCard>
      <ul v-if="acAlts.length" class="trpg-rd__alts"><li v-for="(a, i) in acAlts" :key="i">备选 AC {{ a.value }}<template v-if="a.from">（{{ a.from }}）</template><template v-if="a.condition"> · {{ a.condition }}</template></li></ul>
      <ItemCard title="先攻" :value="signed(d.initiative.value)" :auto="autoText(d.initiative.parts, key('initiative'))" rule="The Order of Combat" :sources="lines(d.initiative.parts)" :can-reset="canReset(block, key('initiative'))" :read-only="ro" @reset="write(resetKey(block, key('initiative')))">
        <AdjustRow label="先攻" :adjust="adjustOf(block, key('initiative'))" :override="overrideOf(block, key('initiative'))" :read-only="ro" @adjust="write(setAdjust(block, key('initiative'), $event))" @override="write(setOverride(block, key('initiative'), $event))" />
      </ItemCard>
      <ItemCard title="熟练加值" :value="signed(d.proficiency.value)" :auto="autoText(d.proficiency.parts, key('proficiency'))" rule="Proficiency Bonus" :sources="lines(d.proficiency.parts)" :can-reset="canReset(block, key('proficiency'))" :read-only="ro" @reset="write(resetKey(block, key('proficiency')))">
        <AdjustRow label="熟练加值" :adjust="adjustOf(block, key('proficiency'))" :override="overrideOf(block, key('proficiency'))" :read-only="ro" @adjust="write(setAdjust(block, key('proficiency'), $event))" @override="write(setOverride(block, key('proficiency'), $event))" />
      </ItemCard>
    </template>
    <template v-else-if="tab === 'speed'">
      <ItemCard v-for="m in speedModes" :key="m" :title="modeLabel(m) + (m === 'walk' ? '' : '（手填）')" :value="`${(m === 'walk' ? d.speed.walk : d.speed.others[m as 'fly']) ?? 0} 尺`" :auto="autoText(d.speed.parts[m] ?? [], { kind: 'speed', mode: m as 'fly' }, ' 尺')" :sources="lines(d.speed.parts[m] ?? [], ' 尺')" :can-reset="m === 'walk' ? canReset(block, { kind: 'speed', mode: 'walk' }) : canReset(block, { kind: 'speed', mode: m as 'fly' })" :read-only="ro" @reset="write(resetKey(block, { kind: 'speed', mode: m as 'fly' }))">
        <label v-if="m !== 'walk'" class="trpg-adj"><span>基础</span><input class="trpg-input trpg-input--sm trpg-adj__num" type="number" min="0" step="5" :value="block.speed?.[m] as number" :disabled="ro" :aria-label="`${modeLabel(m)}基础速度`" @change="write(setSpeedBase(block, m, Number(($event.target as HTMLInputElement).value)))" /><span>尺</span></label>
        <AdjustRow :label="`${modeLabel(m)}速度`" unit="尺" :adjust="adjustOf(block, { kind: 'speed', mode: m as 'fly' })" :override="overrideOf(block, { kind: 'speed', mode: m as 'fly' })" :read-only="ro" @adjust="write(setAdjust(block, { kind: 'speed', mode: m as 'fly' }, $event))" @override="write(setOverride(block, { kind: 'speed', mode: m as 'fly' }, $event))" />
        <label v-if="m === 'fly'" class="trpg-adj"><input type="checkbox" :checked="block.speed?.canHover === true" :disabled="ro" @change="write(setHover(block, ($event.target as HTMLInputElement).checked))" /><span>悬浮</span></label>
        <span v-if="m !== 'walk'" class="trpg-rd__del">
          <button v-if="confirmDel !== m" class="trpg-btn trpg-btn--quiet trpg-btn--small" type="button" :disabled="ro" @click="confirmDel = m"><Icon name="x" :size="16" />删除</button>
          <template v-else><span>删除「{{ modeLabel(m) }}」速度？</span><button class="trpg-btn trpg-btn--small" type="button" :data-testid="`speed-del-${m}`" @click="write(removeSpeedMode(block, m)); confirmDel = ''">删除</button><button class="trpg-btn trpg-btn--quiet trpg-btn--small" type="button" @click="confirmDel = ''">取消</button></template>
        </span>
      </ItemCard>
      <div v-if="addable.length" class="trpg-rd__add"><SelectField v-model="adding" :options="addable" label="添加移动方式" placeholder="＋ 移动方式" :disabled="ro" @update:model-value="addMode" /></div>
      <p v-if="exhaustion >= 2" class="trpg-rd__note"><Icon name="info" :size="16" />力竭 {{ exhaustion }} 级：{{ exhaustion >= 5 ? '速度降为 0' : '速度减半' }}（只写说明，不改速度）</p>
    </template>
    <template v-else>
      <ItemCard v-for="p in passives" :key="p.k" :title="p.label" :value="String(d.passives[p.k].value ?? '')" :auto="autoText(d.passives[p.k].parts, { kind: 'passive', skill: p.k })" :sources="lines(d.passives[p.k].parts)" :can-reset="canReset(block, { kind: 'passive', skill: p.k })" :read-only="ro" @reset="write(resetKey(block, { kind: 'passive', skill: p.k }))">
        <AdjustRow :label="p.label" :adjust="adjustOf(block, { kind: 'passive', skill: p.k })" :override="overrideOf(block, { kind: 'passive', skill: p.k })" :read-only="ro" @adjust="write(setAdjust(block, { kind: 'passive', skill: p.k }, $event))" @override="write(setOverride(block, { kind: 'passive', skill: p.k }, $event))" />
        <button class="trpg-btn trpg-btn--small" type="button" :data-testid="`passive-dice-${p.k}`" @click="toDice(p.k)"><Icon name="dice-five" :size="16" />去骰盘比一比</button>
      </ItemCard>
      <p class="trpg-rd__note"><Icon name="info" :size="16" />被动值只在骰盘比对时用，不写进这里。<RuleLink name-en="Ability Checks" /></p>
    </template>
    <template #actions><button class="trpg-btn trpg-btn--primary" type="button" @click="modal.requestClose()">完成</button></template>
  </DialogFrame>
</template>
