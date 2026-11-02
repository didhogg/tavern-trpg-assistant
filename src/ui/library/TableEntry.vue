<script setup lang="ts">
import { computed, nextTick, ref, shallowRef, watch } from 'vue'
import type { Entry } from '../../schemas/pack'
import { useAppStore } from '../../stores/app'
import { useLibraryStore } from '../../stores/library'
import Term from '../kit/Term.vue'
import TableCell from './TableCell.vue'
import { useTableRoll } from './tableRoll'

const props = defineProps<{ entry: Entry }>()
const emit = defineEmits<{ ref: [id: string] }>()
const app = useAppStore()
const library = useLibraryStore()
const roller = useTableRoll()
const hit = ref<number | null>(null)
const tableBody = ref<HTMLElement | null>(null)
const owner = shallowRef<{ id: string; name: string } | null>(null)
const also = ref<Array<{ id: string; name: string }>>([])

type Obj = Record<string, unknown>
const data = computed(() => props.entry.data as Obj)
const isRef = computed(() => data.value.kind === 'ref')
const cols = computed(() => Array.isArray(data.value.cols) ? data.value.cols.map(String) : [])
const rows = computed(() => (Array.isArray(data.value.rows) ? data.value.rows : []).filter((r): r is Obj => typeof r === 'object' && r !== null).map((r) => ({
  cells: Array.isArray(r.cells) ? r.cells.map(String) : [],
  min: typeof r.min === 'number' ? r.min : undefined,
  max: typeof r.max === 'number' ? r.max : undefined,
  refs: Array.isArray(r.refs) ? r.refs.map(String) : [],
})))
const formula = computed(() => typeof data.value.dice === 'string' ? data.value.dice : '')
const modifier = computed(() => (typeof data.value.modifier === 'object' && data.value.modifier !== null && 'prompt' in data.value.modifier ? String((data.value.modifier as { prompt: unknown }).prompt) : ''))
const heading = computed(() => {
  const at = data.value.at as { heading?: unknown } | undefined
  return Array.isArray(at?.heading) ? at.heading.map(String).join(' / ') : ''
})
const location = computed(() => {
  const src = data.value.src as { book?: unknown; page?: unknown } | undefined
  const book = typeof src?.book === 'string' ? (library.sourceNames[src.book]?.name.replace(/（[^）]*）$/, '') ?? src.book) : ''
  const page = typeof src?.page === 'number' ? ` p.${src.page}` : ''
  const head = heading.value ? `「${heading.value}」` : ''
  return [book ? `${book}${page}` : '', head].filter(Boolean).join(' ')
})
const rowLabel = (r: { min?: number; max?: number }): string => {
  if (r.min === undefined && r.max === undefined) return ''
  if (r.min === r.max) return String(r.min)
  return `${r.min ?? ''}–${r.max ?? ''}`
}

async function resolveOwner(): Promise<void> {
  const parent = data.value.parent as { id?: unknown; appliesTo?: unknown } | undefined
  const id = typeof parent?.id === 'string' ? parent.id : ''
  const packId = id ? await library.packOfEntry(id) : undefined
  const row = packId ? await app.svc().db.entries.get([packId, id]) : undefined
  owner.value = id ? { id, name: row?.name ?? '未安装的条目' } : null
  const ids = Array.isArray(parent?.appliesTo) ? parent.appliesTo.map(String) : []
  const names: Array<{ id: string; name: string }> = []
  for (const target of ids) {
    const p = await library.packOfEntry(target)
    const r = p ? await app.svc().db.entries.get([p, target]) : undefined
    names.push({ id: target, name: r?.name ?? '未安装的条目' })
  }
  also.value = names
}

watch(() => props.entry, () => { hit.value = null; void resolveOwner() }, { immediate: true })

async function rollWhole(): Promise<void> {
  const r = await roller.rollOne({ id: props.entry.id, name: props.entry.name, data: data.value })
  hit.value = r.rowIndex
  await nextTick()
  tableBody.value?.querySelector(`[data-row-index="${r.rowIndex}"]`)?.scrollIntoView({ block: 'center', behavior: 'smooth' })
}
</script>

<template>
  <div class="trpg-tablepage" data-testid="table-page">
    <p v-if="owner" class="trpg-tablepage__owner" data-testid="table-owner">
      属于：<Term @open="emit('ref', owner.id)">{{ owner.name }}</Term>
      <template v-if="also.length">（也适用：<template v-for="(a, i) in also" :key="a.id"><template v-if="i">、</template><Term @open="emit('ref', a.id)">{{ a.name }}</Term></template>）</template>
      <template v-if="location"> · 位置：{{ location }}</template>
    </p>
    <div class="trpg-tablepage__head">
      <div>
        <p class="trpg-row__meta">{{ isRef ? '参考表' : '随机表' }}<template v-if="formula"> · {{ formula }}<template v-if="modifier">（{{ modifier }}）</template></template></p>
        <p v-if="data.caption" class="trpg-field__hint">{{ data.caption }}</p>
      </div>
      <button v-if="!isRef" class="trpg-btn trpg-btn--small" type="button" data-testid="table-roll-header" :aria-label="`掷整张表 ${entry.name}`" @click="rollWhole">🎲 掷整张表</button>
    </div>
    <div class="trpg-blocks__table">
      <table class="trpg-tablepage__table">
        <thead><tr><th v-if="!isRef">点数</th><th v-for="c in cols" :key="c">{{ c }}</th></tr></thead>
        <tbody ref="tableBody">
          <tr v-for="(r, i) in rows" :key="i" :data-testid="`table-row-${i}`" :data-row-index="i" :class="{ 'is-hit': hit === i }">
            <td v-if="!isRef">{{ rowLabel(r) }}</td>
            <td v-for="(cell, c) in r.cells" :key="c"><TableCell :text="cell" @ref="emit('ref', $event)" @roll="roller.rollCell" /></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.trpg-tablepage__owner { margin: 0 0 10px; color: var(--ink-2); }
.trpg-tablepage__head { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 8px; }
.trpg-tablepage__head p { margin: 0; }
.trpg-tablepage__table tr.is-hit td { background: color-mix(in srgb, var(--gold) 24%, transparent); }
</style>
