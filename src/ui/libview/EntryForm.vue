<script setup lang="ts">
import { computed, provide, ref } from 'vue'
import type { BrewField, FieldShape, RequiredChoice } from '../../library/brew-validate'
import Icon from '../kit/Icon.vue'
import FieldInput from './FieldInput.vue'
import TableGrid from './TableGrid.vue'
import Segmented from '../kit/Segmented.vue'
import { askConfirm } from '../kit/confirm'
import { gridFields } from '../../library/field-shape-core'
import { isEmpty, resolve, type Defs } from './field-shape'
import type { Ent } from './edit-json'
import { CODESET_KEY, PLAN_KEY } from './entry-blocks'
import type { FormPlan } from '../../library/form-plan'

/**
 * 一条条目的表单（P5.5 编辑器的一栏）：字段、控件、中文名按后端字段表（custom.fields），分块和顺序按后端表单安排（custom.formPlan，§16.10 2b）：
 * 必填 → 常用（官方条目里真在用的）→ 已填的其他项 → 更多（收起、可搜；详细表单一开始就展开）。出版信息、自动字段、来源、规则版本不出现。
 * marks：要标出来的字段（两边不一样的 ≠ / 房规改过的）。
 */
export interface FormTable { fields: BrewField[]; defs: Defs; labels: Record<string, string>; plan?: FormPlan | null; requiredChoices?: RequiredChoice[] }
/** rawNames：显示作者的原字段名（英文那一栏：作者中文版的叫法是给中文条目的，例如 name 叫「中文名」，放在英文栏会误导）。 */
const props = defineProps<{ table: FormTable; ent: Ent; detailed?: boolean; marks?: Record<string, string>; readonly?: boolean; rawNames?: boolean; codeSet?: string }>()
// 正文的段落转换要用这一栏语言的作者程序（EntryBlock）
provide(CODESET_KEY, computed(() => props.codeSet ?? 'cn'))
provide(PLAN_KEY, computed(() => props.table.plan?.at ?? {}))
const emit = defineEmits<{ update: [ent: Ent]; json: [field: string] }>()
// 没有表单安排（读不到）时：只藏来源，必填在前、其余进「更多」
const byName = computed(() => new Map(props.table.fields.filter((f) => !f.internal && f.shape).map((f) => [f.name, f])))
const pick = (names: string[]) => names.map((n) => byName.value.get(n)).filter((f): f is BrewField => !!f)
const plan = computed(() => props.table.plan ?? null)
const grid = computed(() => gridFields(props.table.fields, props.table.defs))
const choices = computed(() => props.table.requiredChoices ?? [])
const mode = computed(() => {
  const byType = choices.value.findIndex((c) => Object.keys(c.fixed).length && Object.entries(c.fixed).every(([k, v]) => props.ent[k] === v))
  return byType >= 0 ? byType : Math.max(0, choices.value.findIndex((c) => c.fields.every((k) => props.ent[k] !== undefined)))
})
const chosen = computed(() => new Set(choices.value[mode.value]?.fields ?? []))
const conditional = computed(() => new Set(choices.value.flatMap((c) => [...c.fields, ...Object.keys(c.fixed)])))
const showField = (f: BrewField) => !conditional.value.has(f.name) && !(grid.value && (!choices.value.length || chosen.value.has(grid.value.rows)) && ['colLabels', 'colLabelRows'].includes(f.name))
const required = computed(() => [...(plan.value ? pick(plan.value.required) : [...byName.value.values()].filter((f) => f.required && f.name !== 'source')).filter(showField), ...pick([...chosen.value])])
const common = computed(() => (plan.value ? pick(plan.value.common).filter(showField) : []))
const others = computed(() => (plan.value ? pick(plan.value.more) : [...byName.value.values()].filter((f) => !f.required && f.name !== 'source')).filter(showField))
const modeOptions = computed(() => choices.value.map((c, i) => ({
  value: String(i),
  label: c.fields.length === 1 && grid.value?.rows === c.fields[0] ? '单个表格' : c.fields.map((f) => f === 'tables' ? '表格组' : props.table.labels[f] ?? f).join('、'),
})))

async function chooseMode(value: string | undefined): Promise<void> {
  const before = choices.value[mode.value]
  const after = choices.value[Number(value)]
  if (!before || !after || before === after) return
  const remove = before.fields.filter((f) => !after.fields.includes(f))
  if (remove.some((f) => !isEmpty(props.ent[f])) && !await askConfirm({
    title: '切换表格写法？', message: '切换会清除当前写法的表格内容。', confirmLabel: '切换',
  })) return
  const next = { ...props.ent, ...after.fixed }
  for (const f of remove) delete next[f]
  emit('update', next)
}
// 打开时就填了的「更多」项放上面；之后在「更多」里新填的留在原处（不然打第一个字就跳走、丢焦点）。整条换掉时父组件重建表单。
const seed = new Set(Object.keys(props.ent).filter((k) => !isEmpty(props.ent[k])))
const filled = computed(() => others.value.filter((f) => seed.has(f.name)))
/** 默认显示成数字框的字段（数字，或「几种写法」默认那种是数字）：连着的几个并排放一行。 */
const isNum = (f: BrewField): boolean => {
  const s = resolve(f.shape!, props.table.defs)
  const def = s.c === 'pick' ? resolve(s.branches[props.table.plan?.at[f.name]?.order?.[0] ?? 0]?.shape ?? s, props.table.defs) : s
  return def.c === 'number'
}
/** 一块里的字段按「连着的数字一行 / 其余一项一行」分组。 */
// 背景介绍与图片（作者 fluff，表单安排给 media）：取作者 fluffObject 那种写法的子项，按形状起名（正文 → 介绍，图片 → 图片）
const mediaName = computed(() => plan.value?.media ?? null)
const mediaProps = computed(() => {
  const f = mediaName.value ? props.table.fields.find((x) => x.name === mediaName.value) : null
  const s = f?.shape ? resolve(f.shape, props.table.defs) : null
  const obj = s?.c === 'pick' ? s.branches.map((b) => resolve(b.shape, props.table.defs)).find((b) => b.c === 'group' && b.props.length) : null
  return obj?.c === 'group' ? obj.props : []
})
const mediaVal = computed(() => { const v = mediaName.value ? props.ent[mediaName.value] : undefined; return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {} })
const mediaTitle = (p: { shape: FieldShape }) => { const s = resolve(p.shape, props.table.defs); const of = s.c === 'list' ? resolve(s.of, props.table.defs).c : s.c; return of === 'image' ? '图片（填网址，只存网址不存图）' : of === 'entries' ? '介绍' : p.shape && 'description' in p.shape ? String(p.shape.description ?? '') : '' }
function setMedia(name: string, v: unknown): void {
  const next = { ...mediaVal.value }
  if (isEmpty(v)) delete next[name]
  else next[name] = v
  setField(mediaName.value!, isEmpty(next) ? undefined : next)
}
function rowsOf(list: BrewField[]): BrewField[][] {
  const out: BrewField[][] = []
  for (const f of list) { const last = out[out.length - 1]; if (isNum(f) && last && isNum(last[0])) last.push(f); else out.push([f]) }
  return out
}
const rest = computed(() => others.value.filter((f) => !seed.has(f.name)))
const open = ref(!!props.detailed)
const q = ref('')
const restShown = computed(() => { const n = q.value.trim().toLowerCase(); return rest.value.filter((f) => !n || nameOf(f).toLowerCase().includes(n) || f.name.toLowerCase().includes(n)) })
function setField(name: string, v: unknown): void {
  const next = { ...props.ent }
  if (v === undefined) delete next[name]
  else next[name] = v
  emit('update', next)
}
function setGrid(name: string, rows: unknown[], headers?: unknown[]): void {
  emit('update', { ...props.ent, [name]: rows, ...(headers ? { [Array.isArray(props.ent?.colLabelRows) ? 'colLabelRows' : 'colLabels']: headers } : {}) })
}
const nameOf = (f: BrewField) => (props.rawNames ? f.name : f.label ?? f.name)
const subLabels = computed(() => (props.rawNames ? {} : props.table.labels))
const tip = (f: BrewField) => f.description ?? (f.shape && 'description' in f.shape ? f.shape.description : undefined)
</script>

<template>
  <div class="lib-tform" :inert="readonly || undefined" data-testid="entry-form">
    <div v-if="choices.length > 1"><Segmented :model-value="String(mode)" label="表格写法" :options="modeOptions" @update:model-value="chooseMode" /></div>
    <template v-for="[title, list] in ([['必填', required], ['常用', common], ['已填的其他项', filled]] as const)" :key="title">
      <div v-if="list.length" class="lib-fsec">{{ title }}</div>
      <div v-for="row in rowsOf(list)" :key="row[0].name" :class="row.length > 1 ? 'lib-numrow' : 'lib-row1'">
        <div v-for="f in row" :key="f.name" class="lib-tfield" :data-diff="marks?.[f.name] ? 'true' : undefined" :data-field="f.name">
          <label><span class="lib-lname" :data-en="rawNames || !f.label || undefined">{{ nameOf(f) }}<small v-if="f.required || chosen.has(f.name)">*</small><span v-if="tip(f)" class="lib-tip" :title="tip(f)"><Icon name="info" :size="13" /></span></span><span v-if="marks?.[f.name]" class="lib-mark">{{ marks[f.name] }}</span></label>
          <TableGrid v-if="grid?.rows === f.name" :rows="ent[f.name]" :headers="ent.colLabelRows ?? ent.colLabels" :multi-header="Array.isArray(ent.colLabelRows)" :numeric="grid.numeric" :label="nameOf(f)" @rows="setField(f.name, $event)" @headers="setField(Array.isArray(ent.colLabelRows) ? 'colLabelRows' : 'colLabels', $event)" @column="(rows, headers) => setGrid(f.name, rows, headers)" @json="emit('json', f.name)" />
          <FieldInput v-else :shape="f.shape!" :value="ent[f.name]" :defs="table.defs" :labels="subLabels" :name="f.name" :path="f.name" @update="(v: unknown) => setField(f.name, v)" @json="emit('json', f.name)" />
        </div>
      </div>
    </template>
    <template v-if="mediaName && mediaProps.length">
      <div class="lib-fsec">背景介绍与图片</div>
      <p class="lib-faint lib-fhint">显示在条目详情的「背景」「图片」两个标签里。</p>
      <div v-for="p in mediaProps" :key="p.name" class="lib-tfield" :data-field="`${mediaName}.${p.name}`">
        <label v-if="mediaTitle(p)"><span class="lib-lname">{{ mediaTitle(p) }}</span></label>
        <FieldInput :shape="p.shape" :value="mediaVal[p.name]" :defs="table.defs" :labels="subLabels" :name="p.name" :path="`${mediaName}.${p.name}`" @update="(v: unknown) => setMedia(p.name, v)" @json="emit('json', mediaName!)" />
      </div>
    </template>
    <button v-if="rest.length" class="lib-more" type="button" :aria-expanded="open" data-testid="form-more" @click="open = !open"><Icon :name="open ? 'caret-down' : 'caret-right'" :size="14" />更多（{{ rest.length }} 项，官方条目里很少用）</button>
    <template v-if="open && rest.length">
      <input v-if="rest.length > 8" v-model="q" class="trpg-input" type="search" placeholder="在更多里找" aria-label="在更多里找" />
      <div v-for="f in restShown" :key="f.name" class="lib-tfield" :data-field="f.name">
        <label><span class="lib-lname" :data-en="rawNames || !f.label || undefined">{{ nameOf(f) }}<span v-if="tip(f)" class="lib-tip" :title="tip(f)"><Icon name="info" :size="13" /></span></span></label>
        <FieldInput :shape="f.shape!" :value="ent[f.name]" :defs="table.defs" :labels="subLabels" :name="f.name" :path="f.name" @update="(v: unknown) => setField(f.name, v)" @json="emit('json', f.name)" />
      </div>
    </template>
  </div>
</template>
