<script setup lang="ts">
import { computed, provide, ref } from 'vue'
import type { BrewField } from '../../library/brew-validate'
import Icon from '../kit/Icon.vue'
import FieldInput from './FieldInput.vue'
import { isEmpty, resolve, type Defs } from './field-shape'
import type { Ent } from './edit-json'
import { CODESET_KEY, PLAN_KEY } from './entry-blocks'
import type { FormPlan } from '../../library/form-plan'

/**
 * 一条条目的表单（P5.5 编辑器的一栏）：字段、控件、中文名按后端字段表（custom.fields），分块和顺序按后端表单安排（custom.formPlan，§16.10 2b）：
 * 必填 → 常用（官方条目里真在用的）→ 已填的其他项 → 更多（收起、可搜；详细表单一开始就展开）。出版信息、自动字段、来源、规则版本不出现。
 * marks：要标出来的字段（两边不一样的 ≠ / 房规改过的）。
 */
export interface FormTable { fields: BrewField[]; defs: Defs; labels: Record<string, string>; plan?: FormPlan | null }
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
const required = computed(() => (plan.value ? pick(plan.value.required) : [...byName.value.values()].filter((f) => f.required && f.name !== 'source')))
const common = computed(() => (plan.value ? pick(plan.value.common) : []))
const others = computed(() => (plan.value ? pick(plan.value.more) : [...byName.value.values()].filter((f) => !f.required && f.name !== 'source')))
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
const nameOf = (f: BrewField) => (props.rawNames ? f.name : f.label ?? f.name)
const subLabels = computed(() => (props.rawNames ? {} : props.table.labels))
const tip = (f: BrewField) => f.description ?? (f.shape && 'description' in f.shape ? f.shape.description : undefined)
</script>

<template>
  <div class="lib-tform" :inert="readonly || undefined" data-testid="entry-form">
    <template v-for="[title, list] in ([['必填', required], ['常用', common], ['已填的其他项', filled]] as const)" :key="title">
      <div v-if="list.length" class="lib-fsec">{{ title }}</div>
      <div v-for="row in rowsOf(list)" :key="row[0].name" :class="row.length > 1 ? 'lib-numrow' : 'lib-row1'">
        <div v-for="f in row" :key="f.name" class="lib-tfield" :data-diff="marks?.[f.name] ? 'true' : undefined" :data-field="f.name">
          <label><span class="lib-lname" :data-en="rawNames || !f.label || undefined">{{ nameOf(f) }}<small v-if="f.required">*</small><span v-if="tip(f)" class="lib-tip" :title="tip(f)"><Icon name="info" :size="13" /></span></span><span v-if="marks?.[f.name]" class="lib-mark">{{ marks[f.name] }}</span></label>
          <FieldInput :shape="f.shape!" :value="ent[f.name]" :defs="table.defs" :labels="subLabels" :name="f.name" :path="f.name" @update="(v: unknown) => setField(f.name, v)" @json="emit('json', f.name)" />
        </div>
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
