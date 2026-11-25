<script setup lang="ts">
// 特质勾选页（照官方 TraitsConfig / DamagesConfig / LanguagesConfig / ToolsConfig，Tidy5e 特质各组的 ⚙ 打开的就是它们）：
//   选项 = 官方 Trait.choices（类别 → 具体项，可选的才有勾），文字过唯一出口；已选从人物字段读（官方 actorKeyPath）。
//   伤害抗性 / 免疫 / 易伤另有“无视条件”；语言另有交流方式（距离）；伤害修正 = 每种伤害一个数；工具 = 勾上加一项熟练、取消删掉。
//   另有自定义文字（官方 custom）。保存一次写入 = 一条撤销。
import { computed, onMounted, reactive, ref } from 'vue'
import type { TraitChoices } from '../../rules/kernel/people'
import type { SheetEdit } from '../../rules/kernel/frame/commands-sheet'
import { usePersonStore } from '../../stores/person'
import { useModalStore } from '../../stores/modal'
import Checkbox from '../kit/Checkbox.vue'
import NumIn from './table/NumIn.vue'

const props = defineProps<{ trait: string }>()
const person = usePersonStore()
const modal = useModalStore()
const info = ref<TraitChoices | null>(null)
const busy = ref(false)
/* eslint-disable @typescript-eslint/no-explicit-any -- 人物字段没有类型声明 */
const at = (path: string): any => path.split('.').slice(1).reduce((o: any, k) => o?.[k], person.sheet?.system)
const form = reactive({ chosen: new Set<string>(), custom: '', bypasses: new Set<string>(), comm: {} as Record<string, number>, amounts: {} as Record<string, number> })
const before = { chosen: new Set<string>(), custom: '', bypasses: new Set<string>(), comm: {} as Record<string, number>, amounts: {} as Record<string, number> }
const isTool = computed(() => props.trait === 'tool')
const isDm = computed(() => props.trait === 'dm')
onMounted(async () => {
  info.value = await person.traitChoices(props.trait)
  if (!info.value) return
  const cur = at(info.value.path) ?? {}
  if (isTool.value) form.chosen = new Set(Object.keys(cur))
  else if (isDm.value) form.amounts = Object.fromEntries(Object.entries(cur.amount ?? {}).map(([k, v]) => [k, Number(v) || 0]))
  else form.chosen = new Set([...(cur.value ?? [])].map(String))
  form.custom = String(cur.custom ?? '')
  form.bypasses = new Set([...(cur.bypasses ?? [])].map(String))
  form.comm = Object.fromEntries(Object.entries(cur.communication ?? {}).map(([k, v]: [string, any]) => [k, Number(v?.value ?? 0) || 0]))
  Object.assign(before, { chosen: new Set(form.chosen), custom: form.custom, bypasses: new Set(form.bypasses), comm: { ...form.comm }, amounts: { ...form.amounts } })
})
const toggle = (set: Set<string>, key: string, on: boolean): void => { if (on) set.add(key); else set.delete(key) }
const same = (a: Set<string>, b: Set<string>): boolean => a.size === b.size && [...a].every((x) => b.has(x))

async function save(): Promise<void> {
  if (!info.value || busy.value) return
  const path = info.value.path
  const edits: SheetEdit[] = []
  if (isTool.value) {
    for (const k of form.chosen) if (!before.chosen.has(k)) edits.push({ kind: 'set', path: `${path}.${k}.value`, value: 1 })
    for (const k of before.chosen) if (!form.chosen.has(k)) edits.push({ kind: 'set', path: `${path}.${k}`, remove: true })
  } else if (isDm.value) {
    for (const [k, v] of Object.entries(form.amounts)) if ((before.amounts[k] ?? 0) !== v) edits.push({ kind: 'set', path: `${path}.amount.${k}`, value: v || null })
  } else if (!same(form.chosen, before.chosen)) edits.push({ kind: 'set', path: `${path}.value`, value: [...form.chosen] })
  if (!isTool.value && form.custom !== before.custom) edits.push({ kind: 'set', path: `${path}.custom`, value: form.custom })
  if (info.value.bypasses.length && !same(form.bypasses, before.bypasses)) edits.push({ kind: 'set', path: `${path}.bypasses`, value: [...form.bypasses] })
  for (const [k, v] of Object.entries(form.comm)) if ((before.comm[k] ?? 0) !== v) edits.push({ kind: 'set', path: `${path}.communication.${k}.value`, value: v || null })
  if (!edits.length) { modal.done(); return }
  busy.value = true
  try { if (await person.edit(`改了${info.value.label}`, edits)) modal.done() } finally { busy.value = false }
}
</script>

<template>
  <form class="pf" data-testid="trait-page" @submit.prevent="save">
    <div v-if="!info" class="pf-body"><div class="lib-skel" aria-busy="true"><i /><i style="width:80%" /><i style="width:60%" /></div></div>
    <div v-else class="pf-body">
      <section class="pf-card">
        <h4>{{ isDm ? '每种伤害减少 / 增加多少' : '选择' }}<small v-if="!isDm">灰字是类别</small></h4>
        <ul class="pf-tree">
          <li v-for="r in info.rows" :key="r.key" :style="{ paddingLeft: `${r.depth * 1.25 + 0.75}rem` }" :data-cat="!r.selectable || undefined">
            <NumIn v-if="isDm && r.selectable" :value="form.amounts[r.key] ?? 0" :min="-999" :label="`${r.label}修正`" :disabled="person.readOnly" @set="(v) => (form.amounts[r.key] = v)" />
            <Checkbox v-else-if="r.selectable" :model-value="form.chosen.has(r.key)" :label="r.label" :disabled="person.readOnly" @update:model-value="(v: boolean) => toggle(form.chosen, r.key, v)">{{ r.label }}</Checkbox>
            <span v-if="!r.selectable || isDm" class="pf-tree-label">{{ r.label }}</span>
          </li>
        </ul>
      </section>
      <section v-if="info.bypasses.length" class="pf-card">
        <h4>无视条件<small>例如“非魔法、非镀银武器的伤害”</small></h4>
        <div class="pf-chips" style="padding: var(--sp-3)"><Checkbox v-for="b in info.bypasses" :key="b.key" :model-value="form.bypasses.has(b.key)" :label="b.label" :disabled="person.readOnly" @update:model-value="(v: boolean) => toggle(form.bypasses, b.key, v)">{{ b.label }}</Checkbox></div>
      </section>
      <section v-if="info.communication.length" class="pf-card">
        <h4>交流方式<small>距离（尺），0 = 没有</small></h4>
        <div v-for="c in info.communication" :key="c.key" class="pf-entry"><span>{{ c.label }}</span><NumIn :value="form.comm[c.key] ?? 0" :label="`${c.label}距离`" :disabled="person.readOnly" @set="(v) => (form.comm[c.key] = v)" /><span /><span /></div>
      </section>
      <section v-if="!isTool" class="pf-card">
        <h4>自定义<small>官方选项里没有的，用分号隔开</small></h4>
        <div style="padding: var(--sp-3)"><input v-model="form.custom" class="trpg-input" :disabled="person.readOnly" aria-label="自定义" data-testid="trait-custom"></div>
      </section>
    </div>
    <div class="pf-foot">
      <span class="pf-gap" />
      <button class="trpg-btn" type="button" @click="modal.done()">取消</button>
      <button class="trpg-btn trpg-btn--primary" type="submit" :disabled="person.readOnly || busy || !info" data-testid="trait-save">保存</button>
    </div>
  </form>
</template>
