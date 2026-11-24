<script setup lang="ts">
// 表格的一格（照 Tidy5e item/columns/*Column.svelte 每列读的字段）：全取官方数据（物品 system、官方说明标签 labels、官方显示上下文 ctx），不算数。
// 能改的两种：次数（ItemUsesColumn：剩余原地输入）、数量（ItemQuantityColumn：− 输入 ＋）；写入经人物 store，可撤销。
/* eslint-disable @typescript-eslint/no-explicit-any -- 官方显示数据没有类型声明，界面只读字段 */
import { computed } from 'vue'
import { usePersonStore } from '../../../stores/person'
import { named, signed } from '../view'
import { useItemWrites } from '../bag-actions'
import NumIn from './NumIn.vue'
import type { ColKey } from './spec'
import type { DocRow } from './rows'

const props = defineProps<{ col: ColKey; row: DocRow }>()
const person = usePersonStore()
const w = useItemWrites()
const g = computed(() => person.glossary)
const ro = computed(() => person.readOnly)
const sys = computed(() => props.row.item?.system ?? {})
const L = computed(() => props.row.labels ?? {})
const c = computed(() => props.row.ctx ?? {})
/** 未鉴定的物品：价格、次数等藏起来（Tidy5e conceal）。 */
const conceal = computed(() => sys.value.identified === false)
const uses = computed((): { recharge: string; cooldown: boolean } | { value: number; max: number } | null => {
  const u = c.value.uses ?? {}
  const max = Number(u.max)
  if (u.hasRecharge) return { recharge: String(L.value.recharge ?? ''), cooldown: !!u.isOnCooldown }
  return u.hasUses && max > 0 ? { value: Number(u.value ?? 0), max } : null
})
const roll = computed(() => {
  if (conceal.value) return null
  if (c.value.toHit !== null && c.value.toHit !== undefined) return { hit: signed(c.value.toHit) }
  const s = c.value.save
  return s?.ability ? { dc: s.dc?.value ?? '', ability: named(g.value, 'abilities', s.ability) } : null
})
const damages = computed(() => (Array.isArray(L.value.damages) ? L.value.damages : []).map((d: any) => String(d.label ?? d.formula ?? '')).filter(Boolean))
const range = computed(() => {
  const r = c.value.range
  if (r?.distance) return `${r.value} ${r.unit ?? ''}`.trim()
  return String(L.value.range || L.value.reach || '')
})
const price = computed(() => {
  const p = sys.value.price
  if (!p || p.value === null || p.value === undefined || p.value === '' || Number(p.value) === 0) return ''
  return `${p.value} ${named(g.value, 'currencies', p.denomination)}`
})
const weight = computed(() => {
  const t = Number(c.value.totalWeight ?? sys.value.weight?.value)
  if (!Number.isFinite(t) || !t) return ''
  return `${Math.round(t * 100) / 100} ${named(g.value, 'weightUnits', sys.value.weight?.units)}`
})
const capacity = computed(() => {
  const cap = c.value.capacity
  if (!cap || !Number(cap.max)) return null
  return { value: Number(cap.value ?? 0), max: Number(cap.max), units: String(cap.units ?? ''), pct: Math.min(100, Math.round(Number(cap.value ?? 0) / Number(cap.max) * 100)) }
})
const components = computed(() => {
  const comp = L.value.components
  return (Array.isArray(comp?.all) ? comp.all : []).map((x: any) => ({ abbr: String(x.abbr ?? ''), special: !!x.tag }))
})
const school = computed(() => sys.value.school ? named(g.value, 'spellSchools', sys.value.school) : '')
</script>

<template>
  <template v-if="col === 'uses' || col === 'charges'">
    <span v-if="conceal" class="ps-dim">?</span>
    <span v-else-if="uses && 'recharge' in uses" class="ps-recharge" :data-cooldown="uses.cooldown || undefined" :title="uses.cooldown ? '在充能中（掷充能骰在后续版本）' : '已充能'">{{ uses.recharge || '充能' }}</span>
    <span v-else-if="uses && 'max' in uses" class="ps-uses"><NumIn :value="uses.value" :max="uses.max" :label="`${row.name}剩余次数`" :disabled="ro" @set="(v) => w.uses(row.name, row.id, v, (uses as { max: number }).max)" /><small>/ {{ uses.max }}</small></span>
    <span v-else class="ps-dim">—</span>
  </template>
  <template v-else-if="col === 'roll'">
    <b v-if="roll?.hit" class="ps-mod">{{ roll.hit }}</b>
    <span v-else-if="roll" class="ps-stack"><small>{{ roll.ability }}</small><b>{{ roll.dc }}</b></span>
    <span v-else class="ps-dim">—</span>
  </template>
  <template v-else-if="col === 'formula'">
    <span v-if="damages.length" class="ps-formula" :title="damages.join('、')">{{ damages.slice(0, 2).join(' · ') }}<small v-if="damages.length > 2"> +{{ damages.length - 2 }}</small></span>
    <span v-else class="ps-dim">—</span>
  </template>
  <span v-else-if="col === 'range'" :class="{ 'ps-dim': !range }">{{ range || '—' }}</span>
  <span v-else-if="col === 'target'" :class="{ 'ps-dim': !L.target }">{{ L.target || '—' }}</span>
  <span v-else-if="col === 'time'" :class="{ 'ps-dim': !L.activation }">{{ L.activation || '—' }}</span>
  <span v-else-if="col === 'recovery'" :class="{ 'ps-dim': !L.recovery }">{{ L.recovery || '—' }}</span>
  <span v-else-if="col === 'featureSource'" :class="{ 'ps-dim': !sys.requirements }">{{ sys.requirements || '—' }}</span>
  <span v-else-if="col === 'price'" :class="{ 'ps-dim': conceal || !price }">{{ conceal ? '未鉴定' : price || '—' }}</span>
  <NumIn v-else-if="col === 'quantity'" :value="Number(sys.quantity ?? 1)" step :label="`${row.name}数量`" :disabled="ro" @set="(v) => w.quantity(row.name, row.id, v)" />
  <span v-else-if="col === 'weight'" :class="{ 'ps-dim': !weight }">{{ weight || '—' }}</span>
  <template v-else-if="col === 'capacity'">
    <span v-if="capacity" class="ps-cap" :title="`${capacity.value} / ${capacity.max} ${capacity.units}`"><span class="ps-cap-bar"><i :style="{ width: `${capacity.pct}%` }" /></span><small>{{ capacity.value }} / {{ capacity.max }}</small></span>
    <span v-else class="ps-dim">—</span>
  </template>
  <template v-else-if="col === 'components'">
    <span v-if="components.length" class="ps-comps"><span v-for="x in components" :key="x.abbr" class="ps-comp" :data-special="x.special || undefined">{{ x.abbr }}</span></span>
    <span v-else class="ps-dim">—</span>
  </template>
  <span v-else-if="col === 'school'" class="ps-school" :title="school">{{ school ? school.slice(0, 2) : '—' }}</span>
  <span v-else class="ps-dim">—</span>
</template>
