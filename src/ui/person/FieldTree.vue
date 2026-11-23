<script setup lang="ts">
// 编辑窗口里的一组字段（P6-R）：按官方字段定义一层层摆出来；控件按字段种类选（数 / 开关 / 单选 / 多选 / 标签 / 文字 / 公式 / 正文）。
// 官方算出来、不存的字段不在这里改（编辑窗口顶上的“明细”里显示）。
import { computed, inject, ref } from 'vue'
import type { ShownField } from '../../rules/kernel/people'
import Segmented from '../kit/Segmented.vue'
import SelectField from '../kit/SelectField.vue'
import Switch from '../kit/Switch.vue'
import TagPill from '../kit/TagPill.vue'
import Icon from '../kit/Icon.vue'

defineOptions({ name: 'FieldTree' })
const props = defineProps<{ node: ShownField; depth?: number; readOnly?: boolean; names?: Record<string, string> }>()
/** 编辑窗口的暂存值（FieldEditor 提供，各层共用同一份）。 */
const draft = inject<Record<string, unknown>>('pfDraft', {})
/** 官方没给名字的分组（每个属性、每个技能）：按路径最后一段查调用方给的名字表。 */
const groupName = (n: ShownField): string | null => (n.label ? String(n.label) : props.names?.[n.path.split('.').pop() ?? ''] ?? null)

const hasEditable = (n: ShownField): boolean => n.children ? n.children.some(hasEditable) : !n.derived
const leaves = computed(() => (props.node.children ?? []).filter((c) => !c.children && !c.derived))
const groups = computed(() => (props.node.children ?? []).filter((c) => c.children && hasEditable(c)))
const options = (n: ShownField) => (n.choices ?? []).map((c) => ({ value: String(c.value), label: String(c.label) }))
// 选项少、名字短：分段按钮一眼看完；否则下拉
/** 有名字的分组默认收起（点组名展开）；整个窗口只有这一组时直接展开。属性值 = 六项一行一个、点开再展开（线框 p6-13b）。 */
const openByDefault = computed(() => !(props.depth ?? 0) && groups.value.length === 1 && !leaves.value.length)
const segmented = (n: ShownField): boolean => (n.choices?.length ?? 0) > 0 && (n.choices?.length ?? 0) <= 4 && options(n).every((o) => o.label.length <= 5)
const asList = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : [])
function toggle(path: string, value: string): void {
  const now = asList(draft[path])
  draft[path] = now.includes(value) ? now.filter((x) => x !== value) : [...now, value]
}
const adding = ref<Record<string, string>>({})
function addTag(path: string): void {
  const v = (adding.value[path] ?? '').trim()
  if (!v) return
  const now = asList(draft[path])
  if (!now.includes(v)) draft[path] = [...now, v]
  adding.value[path] = ''
}
const removeTag = (path: string, v: string): void => { draft[path] = asList(draft[path]).filter((x) => x !== v) }
const id = (path: string): string => `pf-${path.replace(/[^\w]/g, '-')}`
</script>

<template>
  <div class="pf-fields">
    <template v-for="n in leaves" :key="n.path">
      <div class="pf-row" :data-kind="n.kind" :data-path="n.path">
        <label class="pf-label" :for="id(n.path)">{{ n.label ?? n.path.split('.').pop() }}<small v-if="n.hint" class="pf-hint">{{ n.hint }}</small></label>
        <div class="pf-control">
          <input v-if="n.kind === 'number'" :id="id(n.path)" v-model="draft[n.path]" class="trpg-input pf-num" type="number" :min="n.min" :max="n.max" :step="n.step ?? (n.integer ? 1 : 'any')" :placeholder="n.nullable ? '不填' : ''" :disabled="readOnly">
          <Switch v-else-if="n.kind === 'boolean'" :id="id(n.path)" v-model="(draft[n.path] as boolean)" :label="String(n.label ?? '')" :disabled="readOnly" />
          <Segmented v-else-if="n.kind === 'select' && segmented(n)" v-model="(draft[n.path] as string)" :label="String(n.label ?? '')" :options="options(n)" />
          <SelectField v-else-if="n.kind === 'select'" v-model="(draft[n.path] as string)" :label="String(n.label ?? '')" :options="options(n)" :disabled="readOnly" />
          <div v-else-if="n.kind === 'multi'" class="pf-chips" role="group" :aria-label="String(n.label ?? '')">
            <button v-for="o in options(n)" :key="o.value" type="button" class="trpg-pill pf-chip" :aria-pressed="asList(draft[n.path]).includes(o.value)" :disabled="readOnly" @click="toggle(n.path, o.value)">{{ o.label }}</button>
          </div>
          <div v-else-if="n.kind === 'tags'" class="pf-tags">
            <TagPill v-for="v in asList(draft[n.path])" :key="v" :label="v" @remove="removeTag(n.path, v)" />
            <input :id="id(n.path)" v-model="adding[n.path]" class="trpg-input pf-tag-input" placeholder="输入后回车添加" :disabled="readOnly" @keydown.enter.prevent="addTag(n.path)">
          </div>
          <textarea v-else-if="n.kind === 'html'" :id="id(n.path)" v-model="(draft[n.path] as string)" class="trpg-input pf-text" rows="5" :disabled="readOnly" />
          <input v-else :id="id(n.path)" v-model="draft[n.path]" class="trpg-input" :class="{ 'pf-formula': n.kind === 'formula' }" :disabled="readOnly">
        </div>
      </div>
    </template>
    <template v-for="grp in groups" :key="grp.path">
      <details v-if="groupName(grp)" class="pf-group" :open="openByDefault" :data-depth="depth ?? 0" :data-path="grp.path">
        <summary class="pf-group-title"><Icon name="caret-right" :size="12" />{{ groupName(grp) }}</summary>
        <FieldTree :node="grp" :depth="(depth ?? 0) + 1" :read-only="readOnly" :names="names" />
      </details>
      <section v-else class="pf-group" data-plain :data-depth="depth ?? 0">
        <FieldTree :node="grp" :depth="(depth ?? 0) + 1" :read-only="readOnly" :names="names" />
      </section>
    </template>
  </div>
</template>
