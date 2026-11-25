<script setup lang="ts">
// 特征单元（驾驶员 11-25）：体型 / 生物类型 / 速度 / 感官 / 阵营，一页五节，各用最合适的控件；点了就生效（一条撤销），不设保存按钮
// （取下 / 装回是单独一次写入，统一保存会半写——设置窗口不混两种生效方式）。
//   选项：全部从本战役【库】取（trait-options.ts）；来源和种族那份的取下写法：后端读数 sheet.traits / sheet.off。
//   种族给的项：悬停小注释「来源：种族-半精灵」，× = 取下（虚线留在原位，点它补回）；手改的项：× = 去掉手改（种族的值回来）。
import { computed, ref, shallowRef, watch } from 'vue'
import type { FieldEffect } from '../../rules/kernel/person-views'
import type { SheetTraits, TraitRow } from '../../rules/kernel/frame/sheet-traits'
import type { OffRow } from '../../rules/kernel/frame/off'
import { usePersonStore } from '../../stores/person'
import { useUiStore } from '../../stores/ui'
import Icon from '../kit/Icon.vue'
import SelectField from '../kit/SelectField.vue'
import Switch from '../kit/Switch.vue'
import Term from '../kit/Term.vue'
import { openEntry } from '../libview/open'
import { useTraitOptions, type SenseChoice } from './trait-options'
import { alignment, creatureSubtype, named, species } from './view'

const person = usePersonStore()
const ui = useUiStore()
const ro = computed(() => person.readOnly)
const { options, error } = useTraitOptions()
const t = computed(() => person.sheet?.traits as SheetTraits | undefined)
const off = computed(() => (person.sheet?.off ?? []) as OffRow[])
const g = computed(() => person.glossary)
const narrow = computed(() => ui.layout !== 'wide')
const sp = computed(() => (person.sheet ? species(person.sheet) : null))
const fromSpecies = computed(() => `来源：种族-${sp.value?.name ?? t.value?.species?.name ?? ''}`)
const unit = (u: string): string => named(g.value, 'movementUnits', u) || u
const same = (a: OffRow, b: OffRow): boolean => a.ref === b.ref && (a.part ?? '') === (b.part ?? '') && (a.advancement ?? '') === (b.advancement ?? '')
const isOff = (row: OffRow | null): boolean => !!row && off.value.some((x) => same(x, row))

const edit = (label: string, path: string, value: unknown): void => { void person.edit(label, [{ kind: 'set', path, value }]) }
const takeDown = (label: string, row: OffRow): void => { void person.setOff(`取下${label}`, [...off.value, row]) }
const putBack = (label: string, row: OffRow): void => { void person.setOff(`补回${label}`, off.value.filter((x) => !same(x, row))) }

// —— 体型：库里的体型代号里，作者换算表认得的那些（能写进人物）——
const sizeCode = (v: string | null | undefined): string | null => (v ? Object.entries(t.value?.size.codes ?? {}).find(([, x]) => x === v)?.[0] ?? null : null)
const sizes = computed(() => (options.value?.sizes ?? []).filter((c) => t.value?.size.codes[c.value]))
const sizeNow = computed(() => sizeCode(t.value?.size.value))
const sizeSpecies = computed(() => sizeCode(t.value?.size.species))
const sizeLabel = (code: string | null): string => sizes.value.find((c) => c.value === code)?.label ?? ''
function pickSize(code: string): void { if (code !== sizeNow.value && t.value) edit(`体型改为${sizeLabel(code)}`, 'system.traits.size', t.value.size.codes[code]) }

// —— 生物类型：玩家角色改种族上的类型，怪物改自己的；子类型显示出口给的文字（没改就不写）——
const subtypeShown = computed(() => (person.sheet ? creatureSubtype(person.sheet) : '') || t.value?.type.subtype || '')
function setType(field: 'value' | 'subtype', v: string): void {
  const target = t.value?.type.target
  if (!target || v === t.value?.type[field] || (field === 'subtype' && v === subtypeShown.value)) return
  const label = field === 'value' ? `生物类型改为${options.value?.types.find((c) => c.value === v)?.label ?? v}` : '改了生物子类型'
  if (target.itemId) void person.edit(label, [{ kind: 'item', itemId: target.itemId, path: `${target.path}.${field}`, value: v }])
  else edit(label, `${target.path}.${field}`, v)
}

// —— 速度 / 感官：一行（或一颗药丸）一种；种族给的取下 / 补回，手改的去掉 ——
type Group = 'movement' | 'senses'
const PATH: Record<Group, string> = { movement: 'system.attributes.movement.speeds', senses: 'system.attributes.senses.ranges' }
const libSense = (key: string): SenseChoice | undefined => options.value?.senses.find((s) => s.english.toLowerCase() === key)
const nameOf = (group: Group, key: string): string => (group === 'movement' ? options.value?.speeds.find((c) => c.value === key)?.label : libSense(key)?.name) ?? key
const srcOf = (row: TraitRow): string => (row.own ? '来源：手改' : row.species ? fromSpecies.value : '来源：效果或物品')
function setValue(group: Group, key: string, raw: string): void {
  const n = Math.max(0, Math.round(Number(raw)))
  if (!Number.isFinite(n)) return
  edit(`${nameOf(group, key)}改为 ${n}`, `${PATH[group]}.${key}`, n)
}
function drop(group: Group, row: TraitRow): void {
  if (row.own) edit(`去掉手改的${nameOf(group, row.key)}`, `${PATH[group]}.${row.key}`, group === 'senses' ? null : 0)
  else if (row.off) takeDown(nameOf(group, row.key), row.off)
}
/** 已取下的种族项（安排里有、人物上现在没有的）：虚线留在原位，点它补回。 */
const gone = (group: Group) => off.value.filter((x) => x.part?.startsWith(group === 'movement' ? 'system.movement.speeds.' : 'system.senses.ranges.'))
  .map((x) => ({ key: x.part!.split('.').pop()!, row: x }))
/** 显示哪几种：库里有的种类（速度 = 库里的速度种类；感官 = 人物上的感官种类），dnd5e 自己算的别的数（跳跃距离）不列。 */
const listed = (group: Group, key: string): boolean => (group === 'movement' ? !!options.value?.speeds.some((c) => c.value === key) : !!t.value?.senses.keys.includes(key))
const shownRows = (group: Group) => (t.value?.[group].rows ?? []).filter((r) => (r.value || r.own) && listed(group, r.key))
// 添加一项：速度从库里的速度种类里选，感官从库里的感官条目里选；选好当场填数，回车加上
const adding = ref<{ group: Group; key: string | null; sense?: SenseChoice; value: string } | null>(null)
const speedChoices = computed(() => (options.value?.speeds ?? []).filter((c) => t.value?.movement.keys.includes(c.value) && !shownRows('movement').some((r) => r.key === c.value)))
const senseChoices = computed(() => (options.value?.senses ?? []).map((s, i) => ({ value: String(i), label: s.name })))
function startAdd(group: Group, v: string | undefined): void {
  if (v === undefined) return
  if (group === 'movement') adding.value = { group, key: v, value: '' }
  else { const sense = options.value?.senses[Number(v)]; if (sense) adding.value = { group, key: sense.english.toLowerCase(), sense, value: '' } }
}
function confirmAdd(): void {
  const a = adding.value
  if (!a || !a.key) return
  const n = Math.max(0, Math.round(Number(a.value)))
  adding.value = null
  if (!n) return
  if (a.group === 'movement' || t.value?.senses.keys.includes(a.key)) { setValue(a.group, a.key, String(n)); return }
  // 自制包里的感官人物上没有这一种：写进特殊感官（作者 dnd5e 的写法）
  const special = [t.value?.senses.special, `${a.sense?.name ?? a.key} ${n}`].filter(Boolean).join('；')
  edit(`加了感官${a.sense?.name ?? ''}`, 'system.attributes.senses.special', special)
}

// —— 物品 / 专长效果改到速度、感官的（编辑窗口同一份读数 person.fields：名字、来源、改哪项、加多少）：开关 = 作者的「停用」——
type Shown<T> = { [K in keyof T]: T[K] extends unknown ? (T[K] extends object | null ? string | null : T[K]) : never }
const effects = shallowRef<Record<Group, Shown<FieldEffect>[]>>({ movement: [], senses: [] })
async function loadEffects(): Promise<void> {
  const [m, s] = await Promise.all([person.fields({ path: 'system.attributes.movement' }), person.fields({ path: 'system.attributes.senses' })])
  effects.value = { movement: ((m?.effects ?? []) as never as Shown<FieldEffect>[]).filter((e) => !e.manual), senses: ((s?.effects ?? []) as never as Shown<FieldEffect>[]).filter((e) => !e.manual) }
}
watch(() => person.sheet, () => void loadEffects(), { immediate: true })
function toggleEffect(e: Shown<FieldEffect>, on: boolean): void {
  void person.edit(`${on ? '启用' : '停用'}${e.name ?? '效果'}`, [{ kind: 'effect', effectId: e.effect, ...(e.itemId ? { itemId: e.itemId } : {}), path: 'disabled', value: !on }])
}
const effectText = (e: Shown<FieldEffect>): string => `${e.keyLabel ?? e.key} ${e.modeCode === 'add' && /^-?\d/.test(e.value) ? (Number(e.value) >= 0 ? `+${e.value}` : e.value) : `${e.mode ?? ''} ${e.value}`}`

// —— 阵营：库里的阵营代号按两条轴排成九宫格（守序 / 中立 / 混乱 × 善良 / 中立 / 邪恶），外加无阵营；也能自己写 ——
const AXES = { law: ['L', 'NX', 'C'], good: ['G', 'NY', 'E'] } // 作者阵营代号的两条轴（NX / NY = 某一条轴上的中立）
const word = (code: string): string => options.value?.align[code === 'NX' || code === 'NY' ? 'N' : code] ?? ''
const cell = (l: string, m: string): string => (l === 'NX' && m === 'NY' ? word('N') : word(l) + word(m))
/** 现在的阵营：显示出口给的文字（模板英雄存的 Chaotic Good 显示成混乱善良，九宫格跟着选中）。 */
const alignNow = computed(() => (person.sheet ? alignment(person.sheet) : '') || t.value?.alignment || '')
const grid = computed(() => (options.value ? AXES.law.map((l) => AXES.good.map((m) => cell(l, m))) : []))
const extra = computed(() => (options.value?.align.U ? [options.value.align.U] : []))
const writing = ref(false)
const ownText = ref('')
function pickAlign(text: string): void { edit(text === alignNow.value ? '清空了阵营' : `阵营改为${text}`, 'system.details.alignment', text === alignNow.value ? '' : text) }
function saveOwn(): void { writing.value = false; const v = ownText.value.trim(); if (v !== alignNow.value) edit(v ? `阵营改为${v}` : '清空了阵营', 'system.details.alignment', v) }
</script>

<template>
  <div class="tr" :data-narrow="narrow || undefined" data-testid="traits-dialog">
    <p v-if="error" class="tr-note" role="alert">库里的选项没读出来：{{ error }}</p>
    <template v-if="t && options">
      <section class="tr-sec" data-testid="traits-size">
        <h4>体型</h4>
        <div class="tr-pills" role="radiogroup" aria-label="体型">
          <button v-for="c in sizes" :key="c.value" type="button" class="tr-pill" role="radio" :aria-checked="c.value === sizeNow" :data-species="c.value === sizeSpecies || undefined" :data-src="c.value === sizeSpecies ? fromSpecies : undefined" :disabled="ro" @click="pickSize(c.value)">{{ c.label }}</button>
        </div>
        <p v-if="sizeSpecies && sizeNow !== sizeSpecies && !isOff(t.size.off)" class="tr-line"><button type="button" class="trpg-btn trpg-btn--small trpg-btn--quiet" :disabled="ro" @click="pickSize(sizeSpecies)">用回种族给的（{{ sizeLabel(sizeSpecies) }}）</button></p>
        <p v-if="t.size.off && isOff(t.size.off)" class="tr-line tr-gone">种族给的体型已取下 <button type="button" class="trpg-btn trpg-btn--small" :disabled="ro" @click="putBack('种族体型', t.size.off)">补回</button></p>
        <small v-if="narrow && sizeSpecies" class="tr-src-inline">{{ fromSpecies }}（{{ sizeLabel(sizeSpecies) }}）</small>
      </section>

      <section class="tr-sec" data-testid="traits-type">
        <h4>生物类型</h4>
        <div class="tr-row">
          <span class="tr-src-wrap" :data-src="t.type.target?.itemId ? fromSpecies : undefined"><SelectField :model-value="t.type.value" :options="options.types" label="生物类型" :disabled="ro || !t.type.target" data-testid="traits-type-select" @update:model-value="(v) => v && setType('value', v)" /></span>
          <label class="tr-sub">子类型 <input class="trpg-input" :value="subtypeShown" :disabled="ro || !t.type.target" maxlength="60" data-testid="traits-subtype" @change="setType('subtype', ($event.target as HTMLInputElement).value.trim())"></label>
        </div>
        <small v-if="!t.type.target" class="tr-note">玩家角色的生物类型跟着种族走：先在「职业与出身」里选种族才能改。</small>
        <small v-else-if="t.type.target.itemId" class="tr-note">玩家角色的类型跟着种族走，这里改的就是种族上的类型。</small>
      </section>

      <section class="tr-sec" data-testid="traits-movement">
        <h4>速度<small>{{ unit(t.movement.units) }}</small></h4>
        <div v-for="r in shownRows('movement')" :key="r.key" class="tr-line tr-item" :data-species="!r.own && !!r.species || undefined" :data-src="srcOf(r)" :data-testid="`traits-speed-${r.key}`">
          <span class="tr-name">{{ nameOf('movement', r.key) }}</span>
          <input class="trpg-input tr-num" type="number" min="0" step="5" :value="r.value" :disabled="ro" :aria-label="`${nameOf('movement', r.key)}（${unit(t.movement.units)}）`" @change="setValue('movement', r.key, ($event.target as HTMLInputElement).value)">
          <small v-if="narrow" class="tr-src-inline">{{ srcOf(r) }}</small>
          <button type="button" class="trpg-icon-btn tr-x" :aria-label="r.own ? `去掉手改的${nameOf('movement', r.key)}` : `取下${nameOf('movement', r.key)}`" :disabled="ro || (!r.own && !r.off)" @click="drop('movement', r)"><Icon name="x" :size="14" /></button>
        </div>
        <div v-for="x in gone('movement')" :key="x.key" class="tr-line tr-gone" :data-testid="`traits-speed-gone-${x.key}`">
          <s>{{ nameOf('movement', x.key) }}</s><small>{{ fromSpecies }}，已取下</small>
          <button type="button" class="trpg-btn trpg-btn--small" :disabled="ro" @click="putBack(nameOf('movement', x.key), x.row)">补回</button>
        </div>
        <div v-for="e in effects.movement" :key="e.effect + e.key" class="tr-line tr-item tr-effect" :data-src="`来源：${e.origin ?? e.name ?? '效果'}`" data-testid="traits-effect"><span class="tr-name">{{ e.name }}</span><span class="tr-quiet">{{ effectText(e) }}</span><Switch :model-value="!e.disabled" :label="`${e.name}的效果`" :disabled="ro" @update:model-value="(on: boolean) => toggleEffect(e, on)" /></div>
        <label v-if="shownRows('movement').some((r) => r.key === 'fly')" class="tr-check"><input type="checkbox" :checked="t.movement.hover" :disabled="ro" @change="edit(($event.target as HTMLInputElement).checked ? '能悬浮' : '不能悬浮', 'system.attributes.movement.hover', ($event.target as HTMLInputElement).checked)">能悬浮</label>
        <div v-if="adding?.group === 'movement'" class="tr-line tr-adding"><span class="tr-name">{{ nameOf('movement', adding.key!) }}</span><input v-model="adding.value" class="trpg-input tr-num" type="number" min="0" step="5" placeholder="30" aria-label="多少" data-autofocus data-testid="traits-add-value" @keydown.enter.prevent="confirmAdd" @blur="confirmAdd"></div>
        <SelectField v-else-if="speedChoices.length" :model-value="undefined" :options="speedChoices" placeholder="＋ 添加一项" label="添加速度" :disabled="ro" data-testid="traits-add-speed" @update:model-value="(v) => startAdd('movement', v)" />
      </section>

      <section class="tr-sec" data-testid="traits-senses">
        <h4>感官<small>{{ unit(t.senses.units) }}</small></h4>
        <div class="tr-pills">
          <span v-for="r in shownRows('senses')" :key="r.key" class="tr-chip" :data-species="!r.own && !!r.species || undefined" :data-src="srcOf(r)" :data-testid="`traits-sense-${r.key}`">
            <Term v-if="libSense(r.key)" :label="`查看${nameOf('senses', r.key)}`" @open="openEntry(libSense(r.key)!.ref, libSense(r.key)!.name)">{{ nameOf('senses', r.key) }}</Term><span v-else>{{ nameOf('senses', r.key) }}</span>
            <input class="tr-chip-num" type="number" min="0" step="5" :value="r.value" :disabled="ro" :aria-label="`${nameOf('senses', r.key)}距离`" @change="setValue('senses', r.key, ($event.target as HTMLInputElement).value)">
            <button type="button" class="tr-chip-x" :aria-label="r.own ? `去掉手改的${nameOf('senses', r.key)}` : `取下${nameOf('senses', r.key)}`" :disabled="ro || (!r.own && !r.off)" @click="drop('senses', r)"><Icon name="x" :size="12" /></button>
          </span>
          <button v-for="x in gone('senses')" :key="x.key" type="button" class="tr-chip tr-chip--gone" :data-src="`${fromSpecies}，已取下，点了补回`" :disabled="ro" :data-testid="`traits-sense-gone-${x.key}`" @click="putBack(nameOf('senses', x.key), x.row)">{{ nameOf('senses', x.key) }}<Icon name="arrow-counter-clockwise" :size="12" /></button>
        </div>
        <div v-if="adding?.group === 'senses'" class="tr-line tr-adding"><span class="tr-name">{{ adding.sense?.name }}</span><input v-model="adding.value" class="trpg-input tr-num" type="number" min="0" step="5" placeholder="60" aria-label="距离" data-autofocus data-testid="traits-add-value" @keydown.enter.prevent="confirmAdd" @blur="confirmAdd"></div>
        <SelectField v-else-if="senseChoices.length" :model-value="undefined" :options="senseChoices" placeholder="＋ 添加" label="添加感官" :disabled="ro" data-testid="traits-add-sense" @update:model-value="(v) => startAdd('senses', v)" />
        <div v-for="e in effects.senses" :key="e.effect + e.key" class="tr-line tr-item tr-effect" :data-src="`来源：${e.origin ?? e.name ?? '效果'}`" data-testid="traits-effect"><span class="tr-name">{{ e.name }}</span><span class="tr-quiet">{{ effectText(e) }}</span><Switch :model-value="!e.disabled" :label="`${e.name}的效果`" :disabled="ro" @update:model-value="(on: boolean) => toggleEffect(e, on)" /></div>
        <label class="tr-sub tr-wide">特殊感官 <input class="trpg-input" :value="t.senses.special" :disabled="ro" maxlength="200" data-testid="traits-special" @change="edit('改了特殊感官', 'system.attributes.senses.special', ($event.target as HTMLInputElement).value.trim())"></label>
      </section>

      <section class="tr-sec" data-testid="traits-alignment">
        <h4>阵营</h4>
        <div class="tr-grid" role="radiogroup" aria-label="阵营">
          <template v-for="(line, i) in grid" :key="i"><button v-for="text in line" :key="text" type="button" class="tr-pill" role="radio" :aria-checked="text === alignNow" :disabled="ro" @click="pickAlign(text)">{{ text }}</button></template>
        </div>
        <div class="tr-pills">
          <button v-for="text in extra" :key="text" type="button" class="tr-pill" role="radio" :aria-checked="text === alignNow" :disabled="ro" @click="pickAlign(text)">{{ text }}</button>
          <input v-if="writing" v-model="ownText" class="trpg-input tr-own" maxlength="60" aria-label="自己写阵营" data-autofocus @keydown.enter.prevent="saveOwn" @blur="saveOwn">
          <button v-else type="button" class="tr-pill" :aria-checked="!!alignNow && !grid.flat().includes(alignNow) && !extra.includes(alignNow)" :disabled="ro" @click="ownText = alignNow; writing = true">{{ alignNow && !grid.flat().includes(alignNow) && !extra.includes(alignNow) ? alignNow : '自己写…' }}</button>
        </div>
      </section>
    </template>
    <div v-else-if="!error" class="lib-skel" aria-busy="true"><i /><i style="width:80%" /><i style="width:60%" /></div>
  </div>
</template>
