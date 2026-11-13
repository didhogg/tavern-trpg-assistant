<script setup lang="ts">
import { computed, ref } from 'vue'
import type { BrewField } from '../../library/brew-validate'
import Icon from '../kit/Icon.vue'
import FieldInput from './FieldInput.vue'
import { isEmpty, type Defs } from './field-shape'
import type { Ent } from './edit-json'

/**
 * 一条条目的表单（P5.5 编辑器的一栏）：字段、顺序、控件、中文名全按后端字段表（custom.fields）。
 * 必填的在前；可选的已填了的跟着；其余收在「更多选项」里（详细表单一开始就展开）。来源由包决定，不在表单里。
 * marks：要标出来的字段（两边不一样的 ≠ / 房规改过的）。
 */
export interface FormTable { fields: BrewField[]; defs: Defs; labels: Record<string, string> }
/** rawNames：显示作者的原字段名（英文那一栏：作者中文版的叫法是给中文条目的，例如 name 叫「中文名」，放在英文栏会误导）。 */
const props = defineProps<{ table: FormTable; ent: Ent; detailed?: boolean; marks?: Record<string, string>; readonly?: boolean; rawNames?: boolean }>()
const emit = defineEmits<{ update: [ent: Ent]; json: [field: string] }>()
const HIDDEN = new Set(['source'])
const usable = computed(() => props.table.fields.filter((f) => !f.internal && f.shape && !HIDDEN.has(f.name)))
const required = computed(() => usable.value.filter((f) => f.required))
// 打开时就填了的可选项放上面；之后在「更多选项」里新填的留在原处（不然打第一个字就跳走、丢焦点）。整条换掉时父组件重建表单。
const seed = new Set(Object.keys(props.ent).filter((k) => !isEmpty(props.ent[k])))
const filled = computed(() => usable.value.filter((f) => !f.required && seed.has(f.name)))
const rest = computed(() => usable.value.filter((f) => !f.required && !seed.has(f.name)))
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
    <template v-for="[title, list] in ([['必填', required], ['已填的其他项', filled]] as const)" :key="title">
      <div v-if="list.length" class="lib-fsec">{{ title }}</div>
      <div v-for="f in list" :key="f.name" class="lib-tfield" :data-diff="marks?.[f.name] ? 'true' : undefined" :data-field="f.name">
        <label><span class="lib-lname" :data-en="rawNames || !f.label || undefined">{{ nameOf(f) }}<small v-if="f.required">*</small><span v-if="tip(f)" class="lib-tip" :title="tip(f)"><Icon name="info" :size="13" /></span></span><span v-if="marks?.[f.name]" class="lib-mark">{{ marks[f.name] }}</span></label>
        <FieldInput :shape="f.shape!" :value="ent[f.name]" :defs="table.defs" :labels="subLabels" :name="f.name" @update="(v: unknown) => setField(f.name, v)" @json="emit('json', f.name)" />
      </div>
    </template>
    <button v-if="rest.length" class="lib-more" type="button" :aria-expanded="open" data-testid="form-more" @click="open = !open"><Icon :name="open ? 'caret-down' : 'caret-right'" :size="14" />更多选项（共 {{ rest.length }} 项）</button>
    <template v-if="open && rest.length">
      <input v-if="rest.length > 8" v-model="q" class="trpg-input" type="search" placeholder="在更多选项里找" aria-label="在更多选项里找" />
      <div v-for="f in restShown" :key="f.name" class="lib-tfield" :data-field="f.name">
        <label><span class="lib-lname" :data-en="rawNames || !f.label || undefined">{{ nameOf(f) }}<span v-if="tip(f)" class="lib-tip" :title="tip(f)"><Icon name="info" :size="13" /></span></span></label>
        <FieldInput :shape="f.shape!" :value="ent[f.name]" :defs="table.defs" :labels="subLabels" :name="f.name" @update="(v: unknown) => setField(f.name, v)" @json="emit('json', f.name)" />
      </div>
    </template>
  </div>
</template>
