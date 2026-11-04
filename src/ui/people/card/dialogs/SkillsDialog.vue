<script setup lang="ts">
import { computed, inject, markRaw, ref } from 'vue'
import { PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger } from 'reka-ui'
import { ABILITY_LABELS, SKILL_KEYS, SKILLS, type SkillKey } from '../../../../rules/dnd5e2014/data/enums'
import { assignGrants, restorable } from '../../../../rules/dnd5e2014/derive'
import { useDiceStore } from '../../../../stores/dice'
import { useModalStore } from '../../../../stores/modal'
import Icon from '../../../kit/Icon.vue'
import HoverTip from '../../../kit/HoverTip.vue'
import type { CardCtx } from '../cardCtx'
import { expectedGrants } from '../expected'
import { partLines, signed } from '../format'
import { clearSkillOverrides, cycleSkill, overrideCount, setSkillOverride } from '../skillOps'
import { CATEGORY_NOTE } from '../info'
import InfoDialog from './InfoDialog.vue'
import DialogFrame from './DialogFrame.vue'

const props = defineProps<{ ctx: CardCtx }>()
const modal = useModalStore()
const dice = useDiceStore()
const portalTarget = inject<HTMLElement | undefined>('portalTarget', undefined)
const overrideView = ref(false)
const onlyProf = ref(false)
const order = ref<'default' | 'ability' | 'value'>('default')
const settings = ref(false)
const d = computed(() => props.ctx.derived())
const block = computed(() => props.ctx.person.block)
const ro = computed(() => props.ctx.readOnly)
const rows = computed(() => {
  let list = SKILL_KEYS.map((key) => ({ key, label: SKILLS[key].label, ability: SKILLS[key].ability, res: d.value.skills[key] }))
  if (onlyProf.value) list = list.filter((r) => r.res.level !== 'none')
  if (order.value === 'ability') list = [...list].sort((a, b) => a.ability.localeCompare(b.ability) || a.label.localeCompare(b.label, 'zh'))
  if (order.value === 'value') list = [...list].sort((a, b) => (b.res.value ?? -99) - (a.res.value ?? -99))
  return list
})
const LEGEND = [['ring', '无熟练'], ['half', '半熟练（熟练加值的一半，向下取整）'], ['solid', '熟练（加熟练加值）'], ['diamond', '专精（加熟练加值的 2 倍）']] as const
const mark = (level: string): string => (level === 'none' ? 'ring' : level === 'half' ? 'half' : level === 'proficient' ? 'solid' : 'diamond')
const missing = computed(() => {
  const want = expectedGrants(props.ctx.person, props.ctx.data).filter((e) => e.grant.category === 'skills')
  return restorable(block.value.proficiencies, want.map((e) => e.grant)).map((grant) => ({ grant, from: want.find((e) => e.grant.key === grant.key)?.from ?? '' }))
})
const overrides = computed(() => overrideCount(block.value))
function cycle(k: SkillKey): void { if (!ro.value) props.ctx.commitBlock(cycleSkill(block.value, k)) }
function setOv(k: SkillKey, e: Event): void { const v = (e.target as HTMLInputElement).value; props.ctx.commitBlock(setSkillOverride(block.value, k, v.trim() === '' ? null : Number(v))) }
function clear(): void { if (overrides.value) props.ctx.commitBlock(clearSkillOverrides(block.value)) }
function restore(grant: (typeof missing.value)[number]): void { props.ctx.commitBlock({ ...block.value, proficiencies: assignGrants(block.value.proficiencies, [grant.grant], grant.from) }) }
function restoreAll(): void { let p = block.value.proficiencies; for (const m of missing.value) p = assignGrants(p, [m.grant], m.from); props.ctx.commitBlock({ ...block.value, proficiencies: p }) }
function toDice(k: SkillKey): void { modal.close(true); dice.openRoll({ actorId: props.ctx.person.id, kind: 'check', ability: SKILLS[k].ability, skill: k }) }
function info(k: SkillKey): void {
  const r = d.value.skills[k]
  if (r.level === 'none') return
  const from = (block.value.proficiencies?.skills ?? []).find((s) => s.skill === k)?.sources ?? []
  const source = from.length ? from.map((s) => (s.kind === 'auto' ? `来自 ${props.ctx.data.nameOf((s.from ?? '').split(':').slice(1).join(':')) || '自动分配'}` : s.kind === 'template' ? '模板' : '手动添加')).join('；') : (block.value.skills?.[k] !== undefined ? '模板（写死总值）' : '手动添加')
  modal.push({ key: `info:skill:${k}`, title: SKILLS[k].label, component: markRaw(InfoDialog), variant: 'dialog', width: 520, props: { model: { title: SKILLS[k].label, rows: [{ label: '类别', value: `技能 · ${ABILITY_LABELS[SKILLS[k].ability]}` }, { label: '熟练等级', value: ({ half: '半熟练', proficient: '熟练', expertise: '专精', none: '无' } as Record<string, string>)[r.level]! }, { label: '获得方式', value: source }], body: [CATEGORY_NOTE.tools.replace('工具熟练：做相关检定时加熟练加值，专精加两倍（玩家手册 p154）。', '技能熟练：做该技能的检定时加熟练加值，专精加两倍；半熟练加一半（玩家手册 p174）。')], removable: false } } })
}
</script>

<template>
  <DialogFrame note="改动进入草稿，点右上「保存」后生效">
    <div class="trpg-sk__head">
      <ul class="trpg-sk__legend"><li v-for="[m, t] in LEGEND" :key="m"><span class="trpg-skill__mark" :class="`is-${m}`" aria-hidden="true" />{{ t }}</li></ul>
      <PopoverRoot v-model:open="settings"><PopoverTrigger class="trpg-icon-btn" aria-label="技能怎么显示" data-testid="skills-settings"><Icon name="gear" :size="20" /></PopoverTrigger>
        <PopoverPortal :to="portalTarget"><PopoverContent class="trpg-sk__pop" align="end" :side-offset="6" :collision-padding="8">
          <strong>技能怎么显示</strong>
          <label class="trpg-sk__opt"><input v-model="onlyProf" type="checkbox" />只看有熟练的</label>
          <fieldset class="trpg-sk__order"><legend>排序</legend><label><input v-model="order" type="radio" value="default" />默认顺序</label><label><input v-model="order" type="radio" value="ability" />按属性分组</label><label><input v-model="order" type="radio" value="value" />按加值从高到低</label></fieldset>
        </PopoverContent></PopoverPortal>
      </PopoverRoot>
    </div>
    <p class="trpg-sk__hint"><Icon name="dice-five" :size="16" />点右边数字去骰盘，点左边图标切换熟练度</p>
    <section v-if="missing.length" class="trpg-arch__sec" data-testid="skills-restorable"><h3>可恢复的自动项</h3><div class="trpg-arch__pills"><button v-for="m in missing" :key="m.grant.key" class="trpg-pill trpg-arch__restore" type="button" :disabled="ro" @click="restore(m)">{{ m.grant.label }}<Icon name="arrow-counter-clockwise" :size="16" /></button><button class="trpg-btn trpg-btn--small" type="button" :disabled="ro" @click="restoreAll">按来源重新分配</button></div></section>
    <ul class="trpg-skills trpg-skills--dlg">
      <li v-for="r in rows" :key="r.key" class="trpg-skdlg">
        <HoverTip :lines="[r.res.level === 'none' ? '无熟练' : '点击切换熟练等级', ...partLines(r.res.parts, r.res.value)]"><button class="trpg-skdlg__mark" type="button" :disabled="ro" :aria-label="`${r.label}：切换熟练等级`" :data-testid="`skill-cycle-${r.key}`" @click="cycle(r.key)"><span class="trpg-skill__mark" :class="`is-${mark(r.res.level)}`" /></button></HoverTip>
        <span class="trpg-skill__name"><button v-if="r.res.level !== 'none'" class="trpg-linkbtn" type="button" @click="info(r.key)"><b>{{ r.label }}</b></button><b v-else class="trpg-skdlg__none">{{ r.label }}</b><small>{{ ABILITY_LABELS[r.ability] }}</small></span>
        <input v-if="overrideView" class="trpg-input trpg-input--sm trpg-adj__num" type="number" step="1" :value="block.overrides?.skills?.[r.key] ?? ''" :placeholder="String(r.res.value ?? '')" :disabled="ro" :aria-label="`${r.label}覆盖总值`" @change="setOv(r.key, $event)" />
        <button v-else class="trpg-skill__value" type="button" :disabled="r.res.value === null" :aria-label="`${r.label}检定 ${signed(r.res.value)}，去骰盘`" @click="toDice(r.key)">{{ signed(r.res.value) }}</button>
      </li>
    </ul>
    <template #actions>
      <span class="trpg-sk__clear">会清空 {{ overrides }} 项覆盖，熟练图标不动</span>
      <button class="trpg-btn" type="button" :aria-pressed="overrideView" data-testid="skills-override" @click="overrideView = !overrideView">覆盖</button>
      <button class="trpg-btn" type="button" :disabled="!overrides || ro" data-testid="skills-clear" @click="clear">清除手动修正</button>
      <button class="trpg-btn trpg-btn--primary" type="button" @click="modal.requestClose()">完成</button>
    </template>
  </DialogFrame>
</template>
