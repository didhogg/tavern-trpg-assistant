<script setup lang="ts">
// 生命区（线框 p6-13）：当前生命点了原地改（−7 伤害 / +5 治疗 / =12 直接设），停顿后小窗先算预览，Enter 生效、Esc 还原；
// 临时生命原地改；「/ 最大」只显示（改它属于来源条目抽屉，E 批）。伤害先扣临时生命、治疗不超上限，都由结算内核算。
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'
import { usePersonStore, type HpPreview } from '../../stores/person'

const person = usePersonStore()
const hp = computed(() => person.sheet?.system.attributes.hp ?? null)
const pct = computed(() => hp.value && hp.value.max ? Math.max(0, Math.min(100, (hp.value.value / hp.value.max) * 100)) : 0)

type Parsed = { kind: 'damage' | 'heal' | 'set'; n: number }
/** 输入宽松认（Postel）：全角数字、各种减号、前后空格。 */
function parse(raw: string): Parsed | null {
  const t = raw.normalize('NFKC').replace(/[−‐-―－]/g, '-').replace(/\s+/g, '')
  const m = /^([-+=]?)(\d+)$/.exec(t)
  if (!m) return null
  const n = Number(m[2])
  return m[1] === '-' ? { kind: 'damage', n } : m[1] === '+' ? { kind: 'heal', n } : { kind: 'set', n }
}

const editing = ref<'value' | 'temp' | null>(null)
const text = ref('')
const composing = ref(false)
const preview = ref<HpPreview | null>(null)
const previewSet = ref<number | null>(null)
const busy = ref(false)
const input = ref<HTMLInputElement | null>(null)
let timer: ReturnType<typeof setTimeout> | undefined

async function start(which: 'value' | 'temp'): Promise<void> {
  if (person.readOnly || !hp.value) return
  editing.value = which
  text.value = which === 'temp' ? String(hp.value.temp ?? 0) : ''
  await nextTick()
  input.value?.focus()
  input.value?.select()
}
async function dropPreview(): Promise<void> {
  if (preview.value) { preview.value = null; await person.cancelHp() }
}
function onInput(): void {
  if (editing.value !== 'value' || composing.value) return
  if (timer) clearTimeout(timer)
  previewSet.value = null
  timer = setTimeout(() => void refresh(), 300)
}
async function refresh(): Promise<void> {
  const p = parse(text.value)
  await dropPreview()
  if (!p) return
  if (p.kind === 'set') { previewSet.value = p.n; return }
  preview.value = await person.previewHp(p.kind === 'damage' ? p.n : -p.n)
}
async function commit(): Promise<void> {
  if (composing.value || busy.value || !editing.value) return
  busy.value = true
  try {
    if (editing.value === 'temp') {
      const p = parse(text.value)
      if (p) await person.edit(`临时生命设为 ${p.n}`, [{ kind: 'set', path: 'system.attributes.hp.temp', value: p.n }])
    } else {
      if (timer) clearTimeout(timer)
      const p = parse(text.value)
      if (p?.kind === 'set') { await dropPreview(); await person.edit(`生命设为 ${p.n}`, [{ kind: 'set', path: 'system.attributes.hp.value', value: p.n }]) }
      else if (p) {
        if (!preview.value) await refresh()
        if (preview.value) { const pv = preview.value; preview.value = null; await person.confirmHp(`生命 ${pv.from} → ${pv.to}`, pv) }
      }
    }
  } finally { busy.value = false; editing.value = null; text.value = '' }
}
async function cancel(): Promise<void> {
  if (timer) clearTimeout(timer)
  await dropPreview()
  previewSet.value = null
  editing.value = null
  text.value = ''
}
onBeforeUnmount(() => { if (timer) clearTimeout(timer); void dropPreview() })
const hint = computed(() => preview.value ? `生命 ${preview.value.from} → ${preview.value.to} / ${preview.value.max}`
  : previewSet.value !== null && hp.value ? `生命 ${hp.value.value} → ${previewSet.value} / ${hp.value.max}` : '输入 −7 扣血、+5 回血、=12 直接设；Enter 生效，Esc 还原')
</script>

<template>
  <div v-if="hp" class="ps-hp" data-testid="ps-hp">
    <div class="ps-hp-line">
      <input
v-if="editing === 'value'" ref="input" v-model="text" class="ps-hp-input" inputmode="text" aria-label="改当前生命" data-testid="ps-hp-input"
        @input="onInput" @compositionstart="composing = true" @compositionend="composing = false; onInput()" @keydown.enter.prevent="commit" @keydown.esc.prevent="cancel" @blur="cancel">
      <button v-else class="ps-hp-now" type="button" :disabled="person.readOnly" data-testid="ps-hp-now" @click="start('value')">{{ hp.value }}</button>
      <span class="ps-hp-max">/ {{ hp.max }}</span>
      <input
v-if="editing === 'temp'" ref="input" v-model="text" class="ps-hp-input ps-hp-input--temp" inputmode="numeric" aria-label="改临时生命"
        @keydown.enter.prevent="commit" @keydown.esc.prevent="cancel" @blur="cancel">
      <button v-else class="ps-hp-temp" type="button" :disabled="person.readOnly" :data-empty="!hp.temp || undefined" data-testid="ps-hp-temp" @click="start('temp')">{{ hp.temp ? `+${hp.temp} 临时` : '+ 临时' }}</button>
    </div>
    <div class="ps-hp-bar" aria-hidden="true"><i :style="{ width: `${pct}%` }" /></div>
    <p v-if="editing === 'value'" class="ps-hp-hint" aria-live="polite" data-testid="ps-hp-hint">{{ hint }}</p>
  </div>
</template>
