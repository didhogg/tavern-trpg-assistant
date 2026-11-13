<script setup lang="ts">
import { computed, ref } from 'vue'
import type { FieldShape } from '../../library/brew-validate'
import Checkbox from '../kit/Checkbox.vue'
import Icon from '../kit/Icon.vue'
import SelectField from '../kit/SelectField.vue'
import { branchOf, emptyOf, isEmpty, kindName, resolve, type Defs } from './field-shape'

/**
 * 一个字段的控件（P5.5 编辑器）：按后端字段表的形状画（文字 / 数字 / 开关 / 下拉 / 多选 / 好几项 / 一组 / 名字→值 / 几种写法 / 正文），
 * 一组和好几项里面再套自己。画不了的提示「在 JSON 里改」。显示名：字段名查 labels（作者中文名），值查形状里的 labels；没有就显示原文。
 */
const props = defineProps<{ shape: FieldShape; value: unknown; defs: Defs; labels: Record<string, string>; name: string; depth?: number }>()
const emit = defineEmits<{ update: [v: unknown]; json: [] }>()
const s = computed(() => ((props.depth ?? 0) > 6 ? { c: 'json' as const, why: '套得太深' } : resolve(props.shape, props.defs)))
const d = computed(() => (props.depth ?? 0) + 1)
const set = (v: unknown) => emit('update', v)
const lab = (n: string) => props.labels[n] ?? n

// 文字 + 作者建议值：下拉选建议的，或者「自己填…」
const CUSTOM = '\u0000custom'
const custom = ref(false)
const suggest = computed(() => (s.value.c === 'text' && s.value.suggest?.length ? s.value.suggest.map(String) : null))
const textLabels = computed(() => (s.value.c === 'text' || s.value.c === 'select' || s.value.c === 'multiselect' ? s.value.labels ?? {} : {}))
const pickVal = computed(() => (custom.value || (typeof props.value === 'string' && props.value && !suggest.value?.includes(props.value)) ? CUSTOM : String(props.value ?? '')))
function onPick(v: string | undefined): void {
  if (v === CUSTOM) { custom.value = true; return }
  custom.value = false
  set(v || undefined)
}
// 下拉：值可能是数字，按字符串对回原值
const selOpts = computed(() => (s.value.c === 'select' ? s.value.enum.map((v) => ({ value: String(v), label: textLabels.value[String(v)] ?? String(v) })) : []))
const onSelect = (v: string | undefined) => { const e = s.value.c === 'select' ? s.value.enum.find((x) => String(x) === v) : undefined; set(e) }
const arr = computed(() => (Array.isArray(props.value) ? props.value : []))
const obj = computed(() => (props.value && typeof props.value === 'object' && !Array.isArray(props.value) ? (props.value as Record<string, unknown>) : {}))
function toggleMulti(v: unknown, on: boolean): void {
  const next = on ? [...arr.value, v] : arr.value.filter((x) => x !== v)
  set(next.length ? next : undefined)
}
function setItem(i: number, v: unknown): void { const next = [...arr.value]; next[i] = v; set(next) }
const removeItem = (i: number) => { const next = arr.value.filter((_, j) => j !== i); set(next.length ? next : undefined) }
const addItem = () => { if (s.value.c === 'list') set([...arr.value, emptyOf(s.value.of, props.defs)]) }
function setProp(k: string, v: unknown): void {
  const next = { ...obj.value }
  if (v === undefined || (typeof v === 'string' && v === '')) delete next[k]
  else next[k] = v
  set(isEmpty(next) ? undefined : next)
}
const newKey = ref('')
function addKey(): void { const k = newKey.value.trim(); if (!k || s.value.c !== 'map') return; setProp(k, emptyOf(s.value.of, props.defs)); newKey.value = '' }
const branch = computed(() => (s.value.c === 'pick' ? branchOf(s.value, props.value, props.defs) : 0))
const chooseBranch = (i: number) => { if (s.value.c === 'pick' && i !== branch.value) set(emptyOf(s.value.branches[i].shape, props.defs)) }
const num = (e: Event) => { const t = (e.target as HTMLInputElement).value; set(t === '' ? undefined : Number(t)) }
</script>

<template>
  <!-- 文字 -->
  <div v-if="s.c === 'text' && suggest" class="lib-inline">
    <SelectField :model-value="pickVal" :label="lab(name)" :options="[...suggest.map((v) => ({ value: v, label: textLabels[v] ?? v })), { value: CUSTOM, label: '自己填…' }]" placeholder="—" @update:model-value="onPick" />
    <input v-if="pickVal === CUSTOM" class="trpg-input" type="text" :value="typeof value === 'string' ? value : ''" :aria-label="lab(name)" @input="set(($event.target as HTMLInputElement).value || undefined)" />
  </div>
  <input v-else-if="s.c === 'text'" class="trpg-input" type="text" :value="value == null ? '' : String(value)" :aria-label="lab(name)" @input="set(($event.target as HTMLInputElement).value)" />
  <!-- 数字 -->
  <input v-else-if="s.c === 'number'" class="trpg-input lib-num" type="number" :step="s.integer ? 1 : 'any'" :value="typeof value === 'number' ? value : ''" :aria-label="lab(name)" @input="num" />
  <!-- 开关 / 固定值 -->
  <Checkbox v-else-if="s.c === 'switch'" :model-value="value === true" :label="lab(name)" @update:model-value="(v: boolean) => set(v ? true : undefined)">是</Checkbox>
  <Checkbox v-else-if="s.c === 'const'" :model-value="value !== undefined" :label="lab(name)" @update:model-value="(v: boolean) => set(v && s.c === 'const' ? s.value : undefined)">是</Checkbox>
  <!-- 下拉 / 多选 -->
  <SelectField v-else-if="s.c === 'select'" :model-value="value == null ? undefined : String(value)" :label="lab(name)" :options="selOpts" placeholder="—" @update:model-value="onSelect" />
  <div v-else-if="s.c === 'multiselect'" class="lib-checks">
    <Checkbox v-for="v in s.enum" :key="String(v)" :model-value="arr.includes(v)" @update:model-value="(on: boolean) => toggleMulti(v, on)">{{ textLabels[String(v)] ?? String(v) }}</Checkbox>
  </div>
  <!-- 好几项 -->
  <div v-else-if="s.c === 'list'" class="lib-rep">
    <div v-for="(item, i) in arr" :key="i" class="lib-rep__row">
      <div class="lib-rep__body"><FieldInput :shape="s.of" :value="item" :defs="defs" :labels="labels" :name="name" :depth="d" @update="(v: unknown) => setItem(i, v)" @json="emit('json')" /></div>
      <button class="trpg-icon-btn" type="button" :aria-label="`删掉第 ${i + 1} 项`" @click="removeItem(i)"><Icon name="x" :size="16" /></button>
    </div>
    <div><button class="trpg-btn trpg-btn--small trpg-btn--quiet" type="button" data-testid="field-add" @click="addItem"><Icon name="plus" :size="14" />{{ arr.length ? '再加一项' : '加一项' }}</button></div>
  </div>
  <!-- 一组 -->
  <div v-else-if="s.c === 'group'" class="lib-grp">
    <div v-for="p in s.props" :key="p.name" class="lib-tfield">
      <label><span class="lib-lname" :data-en="!labels[p.name] || undefined">{{ lab(p.name) }}<small v-if="p.required">*</small></span></label>
      <FieldInput :shape="p.shape" :value="obj[p.name]" :defs="defs" :labels="labels" :name="p.name" :depth="d" @update="(v: unknown) => setProp(p.name, v)" @json="emit('json')" />
    </div>
  </div>
  <!-- 名字 → 值 -->
  <div v-else-if="s.c === 'map'" class="lib-rep">
    <div v-for="(v, k) in obj" :key="k" class="lib-rep__row">
      <b class="lib-mono">{{ k }}</b>
      <div class="lib-rep__body"><FieldInput :shape="s.of" :value="v" :defs="defs" :labels="labels" :name="String(k)" :depth="d" @update="(x: unknown) => setProp(String(k), x)" @json="emit('json')" /></div>
      <button class="trpg-icon-btn" type="button" :aria-label="`删掉 ${k}`" @click="setProp(String(k), undefined)"><Icon name="x" :size="16" /></button>
    </div>
    <div class="lib-inline"><input v-model="newKey" class="trpg-input" type="text" placeholder="名字" aria-label="新加一项的名字" /><button class="trpg-btn trpg-btn--small trpg-btn--quiet" type="button" :disabled="!newKey.trim()" @click="addKey"><Icon name="plus" :size="14" />加</button></div>
  </div>
  <!-- 几种写法任选 -->
  <div v-else-if="s.c === 'pick'" class="lib-grp">
    <span class="trpg-seg lib-seg--small" role="group" :aria-label="`${lab(name)}的写法`"><button v-for="(b, i) in s.branches" :key="i" type="button" :aria-pressed="i === branch" @click="chooseBranch(i)">{{ kindName(b.shape, defs) }}</button></span>
    <FieldInput :shape="s.branches[branch].shape" :value="value" :defs="defs" :labels="labels" :name="name" :depth="d" @update="set" @json="emit('json')" />
  </div>
  <!-- 正文（一段）：文字一段一个框；列表 / 表格等复杂的一段到 JSON 里改 -->
  <textarea v-else-if="s.c === 'entries' && (typeof value === 'string' || value == null)" class="trpg-input lib-para" rows="3" :value="typeof value === 'string' ? value : ''" :aria-label="lab(name)" @input="set(($event.target as HTMLInputElement).value)" />
  <button v-else-if="s.c === 'entries'" class="lib-tojson" type="button" @click="emit('json')"><Icon name="info" :size="14" />这一段是{{ (value as { type?: string })?.type ?? '复杂内容' }}，在 JSON 里改 ›</button>
  <!-- 画不了 -->
  <button v-else class="lib-tojson" type="button" :title="s.c === 'json' ? s.why : undefined" @click="emit('json')"><Icon name="info" :size="14" />这一项比较复杂，在 JSON 里改 ›</button>
</template>
