<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import { useAppStore } from '../../stores/app'
import type { FieldShape } from '../../library/brew-validate'
import type { PlanAt } from '../../library/form-plan'
import Checkbox from '../kit/Checkbox.vue'
import Icon from '../kit/Icon.vue'
import MoreMenu from '../kit/MoreMenu.vue'
import SelectField from '../kit/SelectField.vue'
import EntryBlock from './EntryBlock.vue'
import { CODESET_KEY, NEW_BLOCKS, PLAN_KEY } from './entry-blocks'
import { branchOf, emptyOf, isEmpty, kindName, resolve, type Defs } from './field-shape'

/**
 * 一个字段的控件（P5.5 编辑器）：按后端字段表的形状画（文字 / 数字 / 开关 / 下拉 / 多选 / 好几项 / 一组 / 名字→值 / 几种写法 / 正文），
 * 一组和好几项里面再套自己。画不了的提示「在 JSON 里改」。显示名：字段名查 labels（作者中文名），值查形状里的 labels；没有就显示原文。
 * 表单安排（后端 custom.formPlan，按路径 path 取，§16.10 2b）：几种写法只显示一种（默认官方最常用的），其余在「换一种写法」里；
 * 套组里用得少的子项收起；选项按官方常见程度排；一串代号给常见组合。
 */
const props = defineProps<{ shape: FieldShape; value: unknown; defs: Defs; labels: Record<string, string>; name: string; depth?: number; path?: string }>()
const emit = defineEmits<{ update: [v: unknown]; json: []; split: [blocks: unknown[]] }>()
const s = computed(() => ((props.depth ?? 0) > 6 ? { c: 'json' as const, why: '套得太深' } : resolve(props.shape, props.defs)))
const d = computed(() => (props.depth ?? 0) + 1)
const set = (v: unknown) => emit('update', v)
const lab = (n: string) => props.labels[n] ?? n
const planAll = inject(PLAN_KEY, ref<Record<string, PlanAt>>({}))
const here = computed(() => planAll.value[props.path ?? props.name] ?? {})
const sub = (step: string) => `${props.path ?? props.name}${step}`
/** 常见的排前面（官方次数），其余照原顺序。 */
function byCommon<T>(list: T[], key: (x: T) => unknown): T[] {
  const vals = (here.value.values ?? []).map((v) => JSON.stringify(v))
  const rank = (x: T) => { const i = vals.indexOf(JSON.stringify(key(x))); return i < 0 ? vals.length : i }
  return [...list].sort((a, b) => rank(a) - rank(b))
}

// 文字 + 作者建议值：下拉选建议的，或者「自己填…」
const CUSTOM = '\u0000custom'
const custom = ref(false)
const suggest = computed(() => (s.value.c === 'text' && s.value.suggest?.length ? s.value.suggest.map(String) : null))
const textLabels = computed(() => (s.value.c === 'text' || s.value.c === 'select' || s.value.c === 'multiselect' ? s.value.labels ?? {} : {}))
const suggestSorted = computed(() => (suggest.value ? byCommon(suggest.value, (v) => v) : null))
const pickVal = computed(() => (custom.value || (typeof props.value === 'string' && props.value && !suggest.value?.includes(props.value)) ? CUSTOM : String(props.value ?? '')))
function onPick(v: string | undefined): void {
  if (v === CUSTOM) { custom.value = true; return }
  custom.value = false
  set(v || undefined)
}
// 下拉：值可能是数字，按字符串对回原值
const selOpts = computed(() => (s.value.c === 'select' ? byCommon(s.value.enum, (v) => v).map((v) => ({ value: String(v), label: textLabels.value[String(v)] ?? String(v) })) : []))
const onSelect = (v: string | undefined) => { const e = s.value.c === 'select' ? s.value.enum.find((x) => String(x) === v) : undefined; set(e) }
const arr = computed(() => (Array.isArray(props.value) ? props.value : []))
const obj = computed(() => (props.value && typeof props.value === 'object' && !Array.isArray(props.value) ? (props.value as Record<string, unknown>) : {}))
function toggleMulti(v: unknown, on: boolean): void {
  const next = on ? [...arr.value, v] : arr.value.filter((x) => x !== v)
  set(next.length ? next : undefined)
}
// 空列表直接给一行空的让人填（不用先点「加一项」）；这一行填了才成为列表
const rows = computed(() => (arr.value.length ? arr.value : [undefined]))
function setItem(i: number, v: unknown): void {
  if (!arr.value.length && isEmpty(v)) { set(undefined); return }
  const next = [...arr.value]; next[i] = v; set(next)
}
const removeItem = (i: number) => { const next = arr.value.filter((_, j) => j !== i); set(next.length ? next : undefined) }
const addItem = () => { if (s.value.c === 'list') set([...arr.value, emptyOf(s.value.of, props.defs)]) }
/** 正文的一段写成了几段（Markdown 里加了小标题 / 列表）：换成那几段。 */
function splitItem(i: number, blocks: unknown[]): void { const next = [...arr.value]; next.splice(i, 1, ...blocks); set(next) }
// 正文（一串段落）：下面多一排「加一段」——小标题段 / 列表 / 表格，起稿交作者转换器转成正文（custom.markdownBlocks）
const isEntries = computed(() => s.value.c === 'list' && resolve(s.value.of, props.defs).c === 'entries')
const app = useAppStore()
const codeSet = inject(CODESET_KEY, ref('cn'))
const adding = ref(false)
async function addBlock(md: string): Promise<void> {
  adding.value = true
  try { set([...arr.value, ...(await app.svc().backend.library.custom.markdownBlocks(codeSet.value, md))]) } catch (e) { console.error('[trpg-assistant] 加一段没成功', e) } finally { adding.value = false }
}
function setProp(k: string, v: unknown): void {
  const next = { ...obj.value }
  if (v === undefined || (typeof v === 'string' && v === '')) delete next[k]
  else next[k] = v
  set(isEmpty(next) ? undefined : next)
}
const newKey = ref('')
function addKey(): void { const k = newKey.value.trim(); if (!k || s.value.c !== 'map') return; setProp(k, emptyOf(s.value.of, props.defs)); newKey.value = '' }
// 几种写法：没填时用官方最常用的那种；换写法在小菜单里（叫法由后端按这种写法独有的子项起）
const branch = computed(() => (s.value.c !== 'pick' ? 0 : props.value === undefined ? (here.value.order?.[0] ?? 0) : branchOf(s.value, props.value, props.defs)))
const branchName = (i: number) => here.value.names?.[i] ?? (s.value.c === 'pick' ? kindName(s.value.branches[i].shape, props.defs) : '')
const otherBranches = computed(() => (s.value.c !== 'pick' ? [] : (here.value.alt ?? here.value.order ?? s.value.branches.map((_, i) => i)).filter((i) => i !== branch.value).map((i) => ({ key: String(i), label: branchName(i) }))))
const chooseBranch = (k: string) => { const i = Number(k); if (s.value.c === 'pick' && i !== branch.value) set(emptyOf(s.value.branches[i].shape, props.defs)) }
// 套组：用得少的子项收起（填了的照常显示）
const showRare = ref(false)
const rare = computed(() => new Set(here.value.rare ?? []))
const groupProps = computed(() => (s.value.c === 'group' ? s.value.props.filter((p) => showRare.value || !rare.value.has(p.name) || obj.value[p.name] !== undefined) : []))
// 小套组（≤ 3 个子项、都是简单值）摊成一行；和字段同名的子项（AC 的 ac、类型的 type）不再写一遍名字
const SIMPLE = new Set(['text', 'number', 'select', 'switch', 'const'])
// 「几种写法」看默认那种（官方最常用的，表单安排给）
const simpleOf = (sh: FieldShape, path: string): boolean => { const r = resolve(sh, props.defs); return SIMPLE.has(r.c) || (r.c === 'pick' && SIMPLE.has(resolve(r.branches[planAll.value[path]?.order?.[0] ?? 0].shape, props.defs).c)) }
const groupRow = computed(() => groupProps.value.length > 1 && groupProps.value.length <= 3 && groupProps.value.every((p) => simpleOf(p.shape, sub(`.${p.name}`))))
const selfName = computed(() => /([^.[{\]}]+)(?:\[\]|\{\})*$/.exec(props.path ?? props.name)?.[1] ?? props.name)
const hiddenRare = computed(() => (s.value.c === 'group' ? s.value.props.filter((p) => rare.value.has(p.name) && obj.value[p.name] === undefined) : []))
// 一串代号（阵营 ["C","E"]）：官方常见组合给一个下拉，显示名用里面每个代号的显示名；不在常见里的「自己组合」
const COMBO_OWN = '\u0000own'
const itemSelect = computed(() => {
  if (s.value.c !== 'list') return null
  const of = resolve(s.value.of, props.defs)
  const sel = of.c === 'select' ? of : of.c === 'pick' ? of.branches.map((b) => resolve(b.shape, props.defs)).find((b) => b.c === 'select') : undefined
  return sel && sel.c === 'select' ? sel : null
})
const combos = computed(() => (itemSelect.value ? (here.value.values ?? []).filter((v): v is unknown[] => Array.isArray(v)) : []))
const comboLabel = (v: unknown[]) => v.map((x) => itemSelect.value?.labels?.[String(x)] ?? String(x)).join(' ')
const ownCombo = ref(false)
const comboVal = computed(() => { if (ownCombo.value) return COMBO_OWN; const k = JSON.stringify(arr.value); const i = combos.value.findIndex((c) => JSON.stringify(c) === k); return i >= 0 ? String(i) : arr.value.length ? COMBO_OWN : undefined })
function onCombo(v: string | undefined): void {
  if (v === COMBO_OWN) { ownCombo.value = true; return }
  ownCombo.value = false
  set(v === undefined ? undefined : structuredClone(combos.value[Number(v)]))
}
const num = (e: Event) => { const t = (e.target as HTMLInputElement).value; set(t === '' ? undefined : Number(t)) }
</script>

<template>
  <!-- 文字 -->
  <div v-if="s.c === 'text' && suggest" class="lib-inline">
    <SelectField :model-value="pickVal" :label="lab(name)" :options="[...(suggestSorted ?? []).map((v) => ({ value: v, label: textLabels[v] ?? v })), { value: CUSTOM, label: '自己填…' }]" placeholder="—" @update:model-value="onPick" />
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
  <div v-else-if="s.c === 'list' && combos.length && comboVal !== COMBO_OWN" class="lib-inline" data-testid="field-combo">
    <SelectField :model-value="comboVal" :label="lab(name)" :options="[...combos.map((c, i) => ({ value: String(i), label: comboLabel(c) })), { value: COMBO_OWN, label: '自己组合…' }]" placeholder="—" @update:model-value="onCombo" />
  </div>
  <div v-else-if="s.c === 'list'" class="lib-rep">
    <div v-for="(item, i) in rows" :key="i" class="lib-rep__row">
      <div class="lib-rep__body"><FieldInput :shape="s.of" :value="item" :defs="defs" :labels="labels" :name="name" :path="sub('[]')" :depth="d" @update="(v: unknown) => setItem(i, v)" @split="(bs: unknown[]) => splitItem(i, bs)" @json="emit('json')" /></div>
      <button v-if="arr.length" class="trpg-icon-btn" type="button" :aria-label="`删掉第 ${i + 1} 项`" @click="removeItem(i)"><Icon name="x" :size="16" /></button>
    </div>
    <div v-if="isEntries" class="lib-inline" role="toolbar" :aria-label="`${lab(name)}：加一段`" data-testid="block-add">
      <button class="trpg-btn trpg-btn--small trpg-btn--quiet" type="button" data-testid="field-add" @click="addItem"><Icon name="plus" :size="14" />文字段</button>
      <button v-for="b in NEW_BLOCKS" :key="b.key" class="trpg-btn trpg-btn--small trpg-btn--quiet" type="button" :disabled="adding" :data-testid="`block-add-${b.key}`" @click="addBlock(b.md)"><Icon :name="b.icon" :size="14" />{{ b.label }}</button>
    </div>
    <div v-else class="lib-inline"><button class="trpg-btn trpg-btn--small trpg-btn--quiet" type="button" data-testid="field-add" @click="addItem"><Icon name="plus" :size="14" />再加一项</button><button v-if="combos.length" class="trpg-btn trpg-btn--small trpg-btn--quiet" type="button" @click="ownCombo = false; set(undefined)">从常见的里选</button></div>
  </div>
  <!-- 一组 -->
  <div v-else-if="s.c === 'group'" :class="['lib-grp', groupRow && 'lib-grp--row']">
    <div v-for="p in groupProps" :key="p.name" class="lib-tfield">
      <label v-if="p.name !== selfName"><span class="lib-lname" :data-en="!labels[p.name] || undefined">{{ lab(p.name) }}<small v-if="p.required">*</small></span></label>
      <FieldInput :shape="p.shape" :value="obj[p.name]" :defs="defs" :labels="labels" :name="p.name" :path="sub(`.${p.name}`)" :depth="d" @update="(v: unknown) => setProp(p.name, v)" @json="emit('json')" />
    </div>
    <button v-if="hiddenRare.length && !showRare" class="trpg-btn trpg-btn--small trpg-btn--quiet lib-subs" type="button" data-testid="field-rare" @click="showRare = true"><Icon name="plus" :size="14" />{{ hiddenRare.slice(0, 3).map((p) => lab(p.name)).join('、') }}{{ hiddenRare.length > 3 ? ` 等 ${hiddenRare.length} 项` : '' }}</button>
  </div>
  <!-- 名字 → 值 -->
  <div v-else-if="s.c === 'map'" class="lib-rep">
    <div v-for="(v, k) in obj" :key="k" class="lib-rep__row">
      <b class="lib-mono">{{ k }}</b>
      <div class="lib-rep__body"><FieldInput :shape="s.of" :value="v" :defs="defs" :labels="labels" :name="String(k)" :path="sub('{}')" :depth="d" @update="(x: unknown) => setProp(String(k), x)" @json="emit('json')" /></div>
      <button class="trpg-icon-btn" type="button" :aria-label="`删掉 ${k}`" @click="setProp(String(k), undefined)"><Icon name="x" :size="16" /></button>
    </div>
    <div class="lib-inline"><input v-model="newKey" class="trpg-input" type="text" placeholder="名字" aria-label="新加一项的名字" /><button class="trpg-btn trpg-btn--small trpg-btn--quiet" type="button" :disabled="!newKey.trim()" @click="addKey"><Icon name="plus" :size="14" />加</button></div>
  </div>
  <!-- 几种写法任选 -->
  <div v-else-if="s.c === 'pick'" class="lib-pick" data-testid="field-pick">
    <FieldInput :shape="s.branches[branch].shape" :value="value" :defs="defs" :labels="labels" :name="name" :path="path ?? name" :depth="d" @update="set" @json="emit('json')" />
    <MoreMenu v-if="otherBranches.length" :label="`${lab(name)}：换一种写法`" text="换一种写法" :items="otherBranches" @select="chooseBranch" />
  </div>
  <!-- 正文（一段）：文字 + 小工具栏；其他段能无损转的用 Markdown 写，不能的到 JSON 里改（EntryBlock） -->
  <EntryBlock v-else-if="s.c === 'entries'" :value="value" :label="lab(name)" @update="set" @split="(bs: unknown[]) => emit('split', bs)" @json="emit('json')" />
  <!-- 画不了 -->
  <button v-else class="lib-tojson" type="button" :title="s.c === 'json' ? s.why : undefined" @click="emit('json')"><Icon name="info" :size="14" />这一项比较复杂，在 JSON 里改 ›</button>
</template>
