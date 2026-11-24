<script setup lang="ts">
// 模块的来源条目抽屉（线框 p6-13b / u5-slots；P6-R 照 DiceCloud：每个数看来源、改底值）。字段全按 dnd5e 官方字段定义生成：
//   总数卡（调用方给显示的数）→ 组成（官方算出来的部分，只读）→ 条目（改到这一块的效果：值 · 来源 · ×）+ 添加条目（手动效果）
//   → 已移除的自动条目（停用的效果，↺ 重新分配）→ 底值（官方存的字段）。全部先暂存，[保存] 一次写进人物 = 一条可撤销改动。
import { computed, onMounted, provide, reactive, ref } from 'vue'
import type { FieldEffect, ShownField, ShownFieldInfo } from '../../rules/kernel/people'
import type { SheetEdit } from '../../rules/kernel/frame/commands-sheet'
import { usePersonStore } from '../../stores/person'
import { useModalStore } from '../../stores/modal'
import Icon from '../kit/Icon.vue'
import FieldTree from './FieldTree.vue'

const props = defineProps<{
  target: { itemId?: string; path: string }
  title: string
  /** 窗口顶上的一句说明（这一块管什么、不管什么）。 */
  hint?: string
  /** 总数卡：显示的名字和数（调用方已在页面上显示的那个数）。 */
  total?: { label: string; value: string }
  /** “添加条目”加到哪个字段上（数或公式）；不给就不能加条目。 */
  addKey?: string
  /** 官方没给名字的分组按路径最后一段取名（属性、技能名表）。 */
  names?: Record<string, string>
  /** 编辑一件物品时它现在的名字（照 Tidy5e 物品表顶上的名字栏，可改）。 */
  itemName?: string
}>()
const person = usePersonStore()
const modal = useModalStore()
const info = ref<ShownFieldInfo | null>(null)
const loading = ref(true)
const busy = ref(false)
const draft = reactive<Record<string, unknown>>({})
provide('pfDraft', draft)
const original = new Map<string, unknown>()
const kinds = new Map<string, ShownField>()
/** 暂存的效果操作：停用 / 重新启用 / 删除（手动的）。 */
const ops = reactive<Record<string, 'disable' | 'enable' | 'delete'>>({})
const added = ref<Array<{ value: string; note: string }>>([])
const nameDraft = ref(props.itemName ?? '')
const nameChanged = computed(() => props.itemName !== undefined && nameDraft.value.trim() !== '' && nameDraft.value.trim() !== props.itemName)
const adding = ref<{ value: string; note: string } | null>(null)

const htmlToText = (html: string): string => html.replace(/<br\s*\/?>/gi, '\n').replace(/<\/(p|div|li|h\d)>/gi, '\n\n').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/\n{3,}/g, '\n\n').trim()
const textToHtml = (text: string): string => text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean).map((p) => `<p>${p.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}</p>`).join('')

function collect(n: ShownField): void {
  if (n.children) { n.children.forEach(collect); return }
  if (n.derived) return
  kinds.set(n.path, n)
  const v = n.kind === 'html' ? htmlToText(String(n.value ?? '')) : n.kind === 'select' ? String(n.value ?? '') : n.kind === 'number' ? (n.value ?? '') : n.kind === 'multi' || n.kind === 'tags' ? [...((n.value as unknown[]) ?? [])].map(String) : n.value ?? (n.kind === 'boolean' ? false : '')
  original.set(n.path, JSON.stringify(v))
  draft[n.path] = v
}
onMounted(async () => {
  info.value = await person.fields(props.target)
  if (info.value?.tree) collect(info.value.tree)
  loading.value = false
})

/** 组成：官方算出来、不存的数（有值的才列）。 */
const parts = computed(() => {
  const out: Array<{ label: string; value: string }> = []
  const walk = (n: ShownField): void => {
    if (n.children) { n.children.forEach(walk); return }
    // 只列有官方名字的（没名字的是官方内部用的数）
    if (!n.derived || !n.label || n.value === null || n.value === undefined || n.value === '' || n.value === 0) return
    const choice = n.choices?.find((c) => String(c.value) === String(n.value))
    out.push({ label: String(n.label ?? n.path.split('.').pop()), value: choice ? String(choice.label) : Array.isArray(n.value) ? n.value.join('、') : String(n.value) })
  }
  if (info.value?.tree) walk(info.value.tree)
  return out
})
const effects = computed(() => (info.value?.effects ?? []) as unknown as FieldEffect[])
const stateOf = (e: FieldEffect): 'on' | 'off' | 'gone' => ops[e.effect] === 'delete' ? 'gone' : ops[e.effect] === 'disable' ? 'off' : ops[e.effect] === 'enable' ? 'on' : e.disabled ? 'off' : 'on'
const activeRows = computed(() => effects.value.filter((e) => stateOf(e) === 'on'))
const removedRows = computed(() => effects.value.filter((e) => stateOf(e) === 'off' && !e.manual))
const signed = (raw: unknown): string => { const v = String(raw ?? '').trim(); return /^-?\d+(\.\d+)?$/.test(v) ? (Number(v) >= 0 ? `+${Number(v)}` : `−${Math.abs(Number(v))}`) : v }
function remove(e: FieldEffect): void { ops[e.effect] = e.manual ? 'delete' : 'disable' }
function restore(e: FieldEffect): void { if (e.disabled) ops[e.effect] = 'enable'; else delete ops[e.effect] }
function restoreAll(): void { for (const e of effects.value) if (!e.manual && stateOf(e) === 'off') restore(e) }
function confirmAdd(): void {
  if (!adding.value || !adding.value.value.trim()) return
  added.value.push({ value: adding.value.value.trim(), note: adding.value.note.trim() })
  adding.value = null
}

function valueOf(path: string): { ok: boolean; value?: unknown } {
  const n = kinds.get(path)!
  const v = draft[path]
  if (n.kind === 'number') {
    if (v === '' || v === null || v === undefined) return n.nullable ? { ok: true, value: null } : { ok: false }
    const num = Number(v)
    return Number.isFinite(num) ? { ok: true, value: n.integer ? Math.round(num) : num } : { ok: false }
  }
  if (n.kind === 'select') return { ok: true, value: n.numeric ? Number(v) : v === '' && n.value === null ? null : v }
  if (n.kind === 'html') return { ok: true, value: textToHtml(String(v ?? '')) }
  return { ok: true, value: v }
}
const changedPaths = computed(() => [...kinds.keys()].filter((p) => JSON.stringify(draft[p]) !== original.get(p)))
const pending = computed(() => changedPaths.value.length + Object.keys(ops).length + added.value.length + (nameChanged.value ? 1 : 0))
async function save(): Promise<void> {
  if (busy.value) return
  if (!pending.value) { modal.close(); return }
  busy.value = true
  try {
    const edits: SheetEdit[] = []
    if (nameChanged.value && props.target.itemId) edits.push({ kind: 'item', itemId: props.target.itemId, path: 'name', value: nameDraft.value.trim() }, { kind: 'item', itemId: props.target.itemId, path: 'flags.tavern-trpg.named', value: true })
    for (const path of changedPaths.value) {
      const got = valueOf(path)
      if (got.ok) edits.push(props.target.itemId ? { kind: 'item', itemId: props.target.itemId, path, value: got.value } : { kind: 'set', path, value: got.value })
    }
    for (const [effectId, op] of Object.entries(ops)) {
      const e = effects.value.find((x) => x.effect === effectId)
      if (!e) continue
      const at = e.itemId ? { itemId: e.itemId } : {}
      edits.push(op === 'delete' ? { kind: 'effectDelete', effectId, ...at } : { kind: 'effect', effectId, ...at, path: 'disabled', value: op === 'disable' })
    }
    for (const a of added.value) {
      edits.push({ kind: 'effectCreate', data: { name: a.note || '手动', changes: [{ key: props.addKey!, mode: 2, value: a.value }], flags: { 'tavern-trpg': { manual: true } } } })
    }
    if (!edits.length || await person.edit(`改了${props.title}`, edits)) modal.close()
  } finally { busy.value = false }
}
</script>

<template>
  <form class="pf" data-testid="field-editor" @submit.prevent="save">
    <div v-if="loading" class="pf-body"><div class="lib-skel" aria-busy="true"><i /><i style="width:80%" /><i style="width:60%" /></div></div>
    <template v-else-if="info?.tree">
      <div class="pf-body">
        <p v-if="hint" class="pf-intro">{{ hint }}</p>
        <label v-if="itemName !== undefined" class="pf-name"><span>名字</span><input v-model="nameDraft" class="trpg-input" maxlength="120" :disabled="person.readOnly" data-testid="pf-item-name"></label>
        <div v-if="total" class="pf-total" data-testid="pf-total">
          <span>{{ total.label }}</span><b>{{ total.value }}</b>
        </div>
        <section v-if="parts.length" class="pf-card" data-testid="pf-parts">
          <h4>组成<small>官方算出来的，改下面的条目和底值就会变</small></h4>
          <div v-for="p in parts" :key="p.label" class="pf-entry"><span>{{ p.label }}</span><b>{{ p.value }}</b><em class="pf-src">算出</em></div>
        </section>

        <section v-if="activeRows.length || addKey || added.length" class="pf-card" data-testid="pf-effects">
          <h4>条目</h4>
          <div v-for="e in activeRows" :key="`${e.effect}:${e.key}`" class="pf-entry" :data-manual="e.manual || undefined">
            <span>{{ e.name }}<small v-if="e.keyLabel"> · {{ e.keyLabel }}</small></span>
            <b>{{ e.modeCode === 2 ? signed(e.value) : `${e.mode} ${e.value}` }}</b>
            <em class="pf-src" :data-kind="e.manual ? 'manual' : 'auto'">{{ e.manual ? '手动' : e.origin ?? '效果' }}</em>
            <button class="trpg-icon-btn pf-x" type="button" :aria-label="`移除${e.name}`" :disabled="person.readOnly" @click="remove(e)"><Icon name="x" :size="14" /></button>
          </div>
          <div v-for="(a, i) in added" :key="`new-${i}`" class="pf-entry" data-manual>
            <span>{{ a.note || '手动' }}</span><b>{{ signed(a.value) }}</b><em class="pf-src" data-kind="manual">手动</em>
            <button class="trpg-icon-btn pf-x" type="button" aria-label="去掉这一条" @click="added.splice(i, 1)"><Icon name="x" :size="14" /></button>
          </div>
          <div v-if="adding" class="pf-add-row">
            <input v-model="adding.note" class="trpg-input" placeholder="说明（如：主持人奖励）" aria-label="条目说明">
            <input v-model="adding.value" class="trpg-input pf-num" placeholder="+1" aria-label="加多少" data-testid="pf-add-value" @keydown.enter.prevent="confirmAdd">
            <button class="trpg-btn trpg-btn--small" type="button" @click="confirmAdd">加上</button>
          </div>
          <button v-else-if="addKey" class="trpg-btn trpg-btn--small pf-add" type="button" :disabled="person.readOnly" data-testid="pf-add" @click="adding = { value: '', note: '' }"><Icon name="plus" :size="14" />添加条目</button>
        </section>

        <section v-if="removedRows.length" class="pf-card pf-removed" data-testid="pf-removed">
          <h4>已移除的自动条目<small>点「重新分配」放回去</small></h4>
          <div v-for="e in removedRows" :key="`${e.effect}:${e.key}`" class="pf-entry">
            <span><s>{{ e.name }}</s></span><b>{{ signed(e.value) }}</b><em class="pf-src">{{ e.origin ?? '效果' }}</em>
            <button class="trpg-btn trpg-btn--small" type="button" :disabled="person.readOnly" @click="restore(e)"><Icon name="arrow-counter-clockwise" :size="12" />重新分配</button>
          </div>
        </section>

        <section v-if="kinds.size" class="pf-card pf-base">
          <h4>底值</h4>
          <FieldTree :node="info.tree" :read-only="person.readOnly" :names="names" />
        </section>
      </div>
      <div class="pf-foot">
        <button v-if="removedRows.length" class="trpg-btn" type="button" :disabled="person.readOnly" @click="restoreAll">全部重新分配</button>
        <span class="pf-gap" />
        <small v-if="pending" class="pf-count">改了 {{ pending }} 处</small>
        <button class="trpg-btn" type="button" @click="modal.close()">取消</button>
        <button class="trpg-btn trpg-btn--primary" type="submit" :disabled="person.readOnly || busy || !pending" data-testid="pf-save">{{ busy ? '正在保存…' : '保存' }}</button>
      </div>
    </template>
    <div v-else class="pf-body"><p class="ps-drawer-note">这一块读不出来。</p></div>
  </form>
</template>
