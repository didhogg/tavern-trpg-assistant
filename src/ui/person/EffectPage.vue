<script setup lang="ts">
// 效果页（新建 / 编辑共用；照 Tidy5e 效果行「编辑」打开的官方效果表）：名字 · 改动列表（每行 改哪一项 · 怎么改 · 改多少，可增删）· 持续几轮 · 停用。
// 改哪一项 = 这个人身上官方的数字 / 公式字段（名字取官方）；怎么改 = 官方改法。保存一次写入 = 一条撤销。
import { computed, onMounted, reactive, ref } from 'vue'
import type { ShownField, ShownFieldInfo } from '../../rules/kernel/people'
import type { SheetEdit } from '../../rules/kernel/frame/commands-sheet'
import { usePersonStore } from '../../stores/person'
import { useModalStore } from '../../stores/modal'
import Combobox from '../kit/Combobox.vue'
import Icon from '../kit/Icon.vue'
import SelectField from '../kit/SelectField.vue'
import Switch from '../kit/Switch.vue'

/** effectId 给了 = 编辑这条（itemId = 它挂在哪件物品上）；不给 = 新建（preset = 组头「＋」带的初值：临时 / 停用）。 */
const props = defineProps<{ effectId?: string; itemId?: string | null; preset?: { rounds?: number; disabled?: boolean } }>()
const person = usePersonStore()
const modal = useModalStore()
const info = ref<ShownFieldInfo | null>(null)
/* eslint-disable @typescript-eslint/no-explicit-any -- 人物效果数据没有类型声明 */
const current = computed<any>(() => props.effectId ? ((person.sheet?.effects ?? []) as any[]).find((e) => e.id === props.effectId) ?? null : null)
const form = reactive({
  name: String(current.value?.name ?? ''),
  // Foundry 14：改动写 type 字符串（add / multiply / dnd5e.bonus…）；持续写 { value, units }（旧写法 rounds 也认）
  changes: ((current.value?.changes ?? []) as any[]).map((c) => ({ key: String(c.key ?? ''), mode: String(c.type ?? 'add'), value: String(c.value ?? '') })) as Array<{ key: string; mode: string; value: string }>,
  rounds: String(current.value ? (current.value.durationSource?.value ?? '') : (props.preset?.rounds ?? '')),
  units: String(current.value?.durationSource?.units ?? (props.preset?.rounds ? 'rounds' : 'seconds')),
  disabled: Boolean(current.value?.disabled ?? props.preset?.disabled ?? false),
})
if (!form.changes.length) form.changes.push({ key: '', mode: 'add', value: '' })
const busy = ref(false)
onMounted(async () => { info.value = await person.fields({ path: 'system' }) })

/** 能改的项：官方存的数字 / 公式字段，名字 = 上一层名字 · 本项名字。 */
const targets = computed(() => {
  const out: Array<{ value: string; label: string }> = []
  const tables = person.glossary?.tables ?? {}
  const names: Record<string, string> = { ...(tables.abilities ?? {}), ...(tables.skills ?? {}), ...(tables.tools ?? {}) } as Record<string, string>
  const walk = (n: ShownField, prefix: string): void => {
    const here = n.label ? String(n.label) : names[n.path.split('.').pop() ?? ''] ?? ''
    if (n.children) { n.children.forEach((c) => walk(c, here || prefix)); return }
    if (n.derived || !(n.kind === 'number' || n.kind === 'formula') || !n.label) return
    out.push({ value: n.path, label: prefix && prefix !== here ? `${prefix} · ${here}` : here })
  }
  if (info.value?.tree) walk(info.value.tree, '')
  // 已有改动里的键不在列表里（官方算出的字段、别的写法）也要能显示
  for (const c of form.changes) if (c.key && !out.some((o) => o.value === c.key)) out.push({ value: c.key, label: c.key })
  return out
})
const modes = computed(() => (info.value?.modes ?? []).map((m) => ({ value: String(m.value), label: String(m.label) })))
const units = computed(() => (info.value?.durationUnits ?? []).map((u) => ({ value: String(u.value), label: String(u.label) })))
const filled = computed(() => form.changes.filter((c) => c.key && c.value.trim() !== ''))
const ok = computed(() => !!form.name.trim() && (filled.value.length > 0 || !!props.effectId))
async function save(): Promise<void> {
  if (!ok.value || busy.value) return
  busy.value = true
  try {
    const n = Number(form.rounds)
    const changes = filled.value.map((c) => ({ key: c.key, type: c.mode, value: c.value.trim() }))
    const duration = Number.isFinite(n) && n > 0 ? { value: n, units: form.units } : { value: null, units: form.units }
    if (!props.effectId) {
      const data = { name: form.name.trim(), system: { changes }, disabled: form.disabled, ...(duration.value ? { duration } : {}), flags: { 'tavern-trpg': { manual: true } } }
      if (await person.edit(`加了效果「${data.name}」`, [{ kind: 'effectCreate', data }])) modal.done()
      return
    }
    const at = props.itemId ? { itemId: props.itemId } : {}
    const set = (path: string, value: unknown): SheetEdit => ({ kind: 'effect', effectId: props.effectId!, ...at, path, value })
    const edits = [set('name', form.name.trim()), set('system.changes', changes), set('disabled', form.disabled), set('duration', duration)]
    if (await person.edit(`改了效果「${form.name.trim()}」`, edits)) modal.done()
  } finally { busy.value = false }
}
</script>

<template>
  <form class="pf" data-testid="effect-page" @submit.prevent="save">
    <div v-if="!info" class="pf-body"><div class="lib-skel" aria-busy="true"><i /><i style="width:80%" /><i style="width:60%" /></div></div>
    <div v-else class="pf-body">
      <p v-if="!effectId" class="pf-intro">给这个人加一条效果，比如法术带来的加值、主持人的临时奖励。改的是哪一项、怎么改，都用官方的写法。</p>
      <section class="pf-card">
        <div class="pf-fields" style="padding: var(--sp-3)">
          <div class="pf-row"><label class="pf-label" for="ae-name">名字</label><div class="pf-control"><input id="ae-name" v-model="form.name" class="trpg-input" placeholder="如：祝福术" data-testid="ae-name"></div></div>
          <div class="pf-row"><label class="pf-label" for="ae-rounds">持续<small class="pf-hint">不填 = 一直有效</small></label><div class="pf-control pf-dur"><input id="ae-rounds" v-model="form.rounds" class="trpg-input pf-num" type="number" min="1" data-testid="ae-dur"><SelectField v-if="units.length" v-model="form.units" label="持续单位" :options="units" /></div></div>
          <div class="pf-row"><span class="pf-label">停用</span><div class="pf-control"><Switch v-model="form.disabled" label="停用这条效果" /></div></div>
        </div>
      </section>
      <section class="pf-card" data-testid="ae-changes">
        <h4>改动<small>一条效果可以同时改好几项</small></h4>
        <div v-for="(c, i) in form.changes" :key="i" class="pf-change">
          <Combobox v-model="c.key" label="改哪一项" :options="targets" placeholder="搜：护甲、力量、速度…" />
          <SelectField v-model="c.mode" label="怎么改" :options="modes" />
          <input v-model="c.value" class="trpg-input pf-num" placeholder="1 或 1d4" aria-label="改多少" :data-testid="i ? undefined : 'ae-value'">
          <button class="trpg-icon-btn pf-x" type="button" :aria-label="`去掉第 ${i + 1} 条改动`" :disabled="form.changes.length < 2" @click="form.changes.splice(i, 1)"><Icon name="x" :size="14" /></button>
        </div>
        <button class="trpg-btn trpg-btn--small pf-add" type="button" @click="form.changes.push({ key: '', mode: 'add', value: '' })"><Icon name="plus" :size="14" />再加一条改动</button>
      </section>
    </div>
    <div class="pf-foot">
      <span class="pf-gap" />
      <button class="trpg-btn" type="button" @click="modal.done()">取消</button>
      <button class="trpg-btn trpg-btn--primary" type="submit" :disabled="!ok || busy || person.readOnly" data-testid="ae-save">{{ effectId ? '保存' : '加上' }}</button>
    </div>
  </form>
</template>
