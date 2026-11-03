<script setup lang="ts">
import { computed } from 'vue'
import Term from '../kit/Term.vue'
import TableCell from './TableCell.vue'
import type { RelatedTable } from './tables'
import { useTableRoll } from './tableRoll'

const props = defineProps<{ tables: RelatedTable[]; targetId: string }>()
const emit = defineEmits<{ open: [id: string]; ref: [id: string] }>()
const roller = useTableRoll()

type Obj = Record<string, unknown>
const isRef = (t: RelatedTable): boolean => t.data.kind === 'ref'
const refRows = (t: RelatedTable): Obj[] => {
  const rows = Array.isArray(t.data.rows) ? t.data.rows : []
  return rows.filter((r): r is Obj => typeof r === 'object' && r !== null && Array.isArray((r as Obj).refs) && ((r as Obj).refs as unknown[]).includes(props.targetId))
}
const shown = computed(() => props.tables.filter((t) => !isRef(t) || refRows(t).length > 0))
const groups = computed(() => {
  const map = new Map<string, RelatedTable[]>()
  for (const t of shown.value) {
    const at = t.data.at as { heading?: string[]; order?: number } | undefined
    const key = at?.heading?.length ? at.heading.join(' / ') : '本条目的表'
    map.set(key, [...(map.get(key) ?? []), t])
  }
  for (const list of map.values()) list.sort((a, b) => Number((a.data.at as { order?: number } | undefined)?.order ?? 0) - Number((b.data.at as { order?: number } | undefined)?.order ?? 0) || a.id.localeCompare(b.id, 'en'))
  return [...map]
})
const rollable = (list: RelatedTable[]): RelatedTable[] => list.filter((t) => !isRef(t))
const source = (t: RelatedTable): string => {
  const src = t.data.src as { book?: string; page?: number } | undefined
  return src?.book ? `${src.book}${src.page ? ` p.${src.page}` : ''}` : ''
}
const cellText = (r: Obj): string => (Array.isArray(r.cells) ? r.cells.map(String).join(' ／ ') : '')
</script>

<template>
  <section v-if="groups.length" class="trpg-entry__tables" data-testid="entry-tables">
    <h3 class="trpg-entry__lore-title">相关表格</h3>
    <div v-for="[heading, list] in groups" :key="heading" class="trpg-entry__table-group">
      <h4>{{ heading }} <button v-if="rollable(list).length >= 2" class="trpg-btn trpg-btn--small" type="button" @click="roller.rollGroup(rollable(list))">本节全掷</button></h4>
      <ul class="trpg-list">
        <li v-for="t in list" :key="t.id" class="trpg-row">
          <div class="trpg-row__main">
            <Term @open="emit('open', t.id)">{{ t.name }}</Term>
            <div class="trpg-row__meta">{{ t.data.dice }}<template v-if="source(t)"> · {{ source(t) }}</template><template v-if="isRef(t)"> · 参考表</template></div>
            <div v-if="isRef(t)" class="trpg-tablepage__refrows" data-testid="ref-rows">
              <div v-for="(r, i) in refRows(t)" :key="i" class="trpg-tablepage__refrow"><TableCell :text="cellText(r)" @ref="emit('ref', $event)" @roll="roller.rollCell" /></div>
              <button class="trpg-link" type="button" @click="emit('open', t.id)">看完整表</button>
            </div>
          </div>
          <button v-if="!isRef(t)" class="trpg-btn trpg-btn--small" type="button" :aria-label="`掷 ${t.name}`" @click="roller.rollOne(t)">🎲</button>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.trpg-tablepage__refrows { margin-top: 4px; color: var(--ink-2); }
.trpg-tablepage__refrow { margin: 2px 0; }
.trpg-tablepage__refrow + .trpg-tablepage__refrow { border-top: 1px solid var(--line); padding-top: 2px; }
</style>
