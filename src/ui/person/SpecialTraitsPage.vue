<script setup lang="ts">
// 特殊特质（照官方特殊特质页 / Tidy5e 特质卡头「特殊特质」）：官方 characterFlags 按分组列，每项 名字 · 说明 · 开关 / 数字 / 文字 / 可选项；
// 写 flags.dnd5e.<项>，保存一次 = 一条撤销。全局加值（攻击 / 检定 / 豁免 / 法术 DC 加值）在卡头另一个按钮。
import { onMounted, reactive, ref } from 'vue'
import type { SpecialTraits } from '../../rules/kernel/people'
import type { SheetEdit } from '../../rules/kernel/frame/commands-sheet'
import { usePersonStore } from '../../stores/person'
import { useModalStore } from '../../stores/modal'
import SelectField from '../kit/SelectField.vue'
import Switch from '../kit/Switch.vue'

const person = usePersonStore()
const modal = useModalStore()
const info = ref<SpecialTraits | null>(null)
const draft = reactive<Record<string, unknown>>({})
const original: Record<string, unknown> = {}
const busy = ref(false)
onMounted(async () => {
  info.value = await person.specialTraits()
  for (const sec of info.value?.sections ?? []) for (const f of sec.fields) {
    const v = f.type === 'boolean' ? !!f.value : f.value ?? ''
    draft[f.path] = f.type === 'number' || f.choices ? String(v) : v
    original[f.path] = draft[f.path]
  }
})
async function save(): Promise<void> {
  if (!info.value || busy.value) return
  const edits: SheetEdit[] = []
  for (const sec of info.value.sections) for (const f of sec.fields) {
    const v = draft[f.path]
    if (v === original[f.path]) continue
    if (f.type === 'boolean') edits.push(v ? { kind: 'set', path: f.path, value: true } : { kind: 'set', path: f.path, remove: true })
    else if (v === '' || v === null) edits.push({ kind: 'set', path: f.path, remove: true })
    else edits.push({ kind: 'set', path: f.path, value: f.type === 'number' ? Number(v) : v })
  }
  if (!edits.length) { modal.done(); return }
  busy.value = true
  try { if (await person.edit('改了特殊特质', edits)) modal.done() } finally { busy.value = false }
}
</script>

<template>
  <form class="pf" data-testid="special-traits" @submit.prevent="save">
    <div v-if="!info" class="pf-body"><div class="lib-skel" aria-busy="true"><i /><i style="width:80%" /><i style="width:60%" /></div></div>
    <div v-else class="pf-body">
      <section v-for="sec in info.sections" :key="sec.label" class="pf-card">
        <h4>{{ sec.label }}</h4>
        <div class="pf-fields" style="padding: var(--sp-2) var(--sp-3) var(--sp-3)">
          <div v-for="f in sec.fields" :key="f.key" class="pf-row" :data-kind="f.type">
            <span class="pf-label">{{ f.name }}<small v-if="f.hint" class="pf-hint">{{ f.hint }}</small></span>
            <div class="pf-control">
              <Switch v-if="f.type === 'boolean'" v-model="draft[f.path] as boolean" :label="f.name" :disabled="person.readOnly" />
              <SelectField v-else-if="f.choices" v-model="draft[f.path] as string" :label="f.name" :options="[{ value: '', label: '—' }, ...f.choices]" :disabled="person.readOnly" />
              <input v-else-if="f.type === 'number'" v-model="draft[f.path]" class="trpg-input pf-num" inputmode="numeric" :aria-label="f.name" :disabled="person.readOnly">
              <input v-else v-model="draft[f.path]" class="trpg-input" :aria-label="f.name" :disabled="person.readOnly">
            </div>
          </div>
        </div>
      </section>
    </div>
    <div class="pf-foot">
      <span class="pf-gap" />
      <button class="trpg-btn" type="button" @click="modal.done()">取消</button>
      <button class="trpg-btn trpg-btn--primary" type="submit" :disabled="person.readOnly || busy || !info" data-testid="special-save">保存</button>
    </div>
  </form>
</template>
