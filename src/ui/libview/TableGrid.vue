<script setup lang="ts">
import { computed } from 'vue'
import Icon from '../kit/Icon.vue'

/** 编辑作者数组里的格子。行、单元格的附加字段和未编辑的格子原样保留。 */
const props = defineProps<{ rows: unknown; headers?: unknown; numeric?: boolean; multiHeader?: boolean; label: string }>()
const emit = defineEmits<{ rows: [value: unknown[]]; headers: [value: unknown[]]; column: [rows: unknown[], headers?: unknown[]]; json: [] }>()
const record = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null
const cellsOf = (row: unknown): unknown[] | null => {
  if (Array.isArray(row)) return row
  const obj = record(row)
  return obj?.type === 'row' && Array.isArray(obj.row) ? obj.row : null
}
const sourceRows = computed(() => Array.isArray(props.rows) ? props.rows : [])
const headers = computed(() => Array.isArray(props.headers) ? props.headers : [])
const headerRows = computed<unknown[][]>(() => props.multiHeader && headers.value.length ? headers.value as unknown[][] : [props.multiHeader ? [] : headers.value])
const span = (cell: unknown): number => {
  const obj = record(cell)
  const width = obj?.type === 'cell' || obj?.type === 'cellHeader' ? obj.width : undefined
  return typeof width === 'number' && Number.isInteger(width) && width > 1 ? width : 1
}
const widthOf = (row: unknown[]) => row.reduce<number>((width, cell) => width + span(cell), 0)
const columns = computed(() => [...sourceRows.value, ...headerRows.value].reduce<number>((width, row) => Math.max(width, widthOf(cellsOf(row) ?? [])), 1))
const writable = computed(() => sourceRows.value.every((row) => cellsOf(row) !== null))
const blank = () => props.numeric ? 0 : ''
const blanks = (count: number) => Array.from({ length: count }, blank)
const displayed = computed(() => sourceRows.value.length ? sourceRows.value : [blanks(columns.value)])
const shownCells = (row: unknown): unknown[] | null => {
  const cells = cellsOf(row)
  return cells ? [...cells, ...blanks(columns.value - widthOf(cells))] : null
}
const withCells = (row: unknown, cells: unknown[]): unknown => Array.isArray(row) ? cells : { ...record(row), row: cells }

function cellValue(cell: unknown): unknown {
  const obj = record(cell)
  if (obj?.type === 'cell' || obj?.type === 'cellHeader') return obj.entry
  return cell
}
function editable(cell: unknown): boolean {
  const value = cellValue(cell)
  return typeof value === 'string' || typeof value === 'number' || (cell === undefined)
}
function changeCell(row: unknown, rowIndex: number, index: number, event: Event): void {
  const input = event.target as HTMLInputElement
  const cells = shownCells(row) ?? []
  const old = cells[index]
  const value = props.numeric || typeof cellValue(old) === 'number' ? input.valueAsNumber : input.value
  if (typeof value === 'number' && !Number.isFinite(value)) return
  cells[index] = record(old) ? { ...record(old), entry: value } : value
  const next = [...sourceRows.value]
  next[rowIndex] = withCells(row, cells)
  emit('rows', next)
}
function changeHeader(row: number, index: number, value: string): void {
  const next = [...headerRows.value[row]]
  while (next.length < index) next.push('')
  next[index] = record(next[index]) ? { ...record(next[index]), entry: value } : value
  emit('headers', props.multiHeader ? headerRows.value.map((cells, i) => i === row ? next : cells) : next)
}
const shownHeaders = computed(() => (headerRows.value.length ? headerRows.value : [[]]).map((row) => [...row, ...Array.from({ length: columns.value - widthOf(row) }, () => '')]))
function addColumn(): void {
  const width = columns.value + 1
  const rows = displayed.value.map((row) => {
    const cells = cellsOf(row) ?? []
    return withCells(row, [...cells, ...blanks(width - widthOf(cells))])
  })
  const head = props.multiHeader ? shownHeaders.value.map((row) => [...row, '']) : [...shownHeaders.value[0], '']
  emit('column', rows, head)
}
function showComplex(cell: unknown): string {
  const obj = record(cell)
  const roll = record(obj?.roll)
  if (roll?.exact != null) return String(roll.exact).padStart(roll.pad ? 2 : 1, '0')
  if (roll?.min != null && roll.max != null) return [roll.min, roll.max].map((n) => String(n).padStart(roll.pad ? 2 : 1, '0')).join('–')
  return typeof obj?.name === 'string' ? obj.name : '结构化内容'
}
function removeRow(index: number): void {
  emit('rows', sourceRows.value.filter((_, i) => i !== index))
}
</script>

<template>
  <div class="lib-editgrid" data-testid="edit-grid">
    <div class="lib-editgrid__scroll" role="region" tabindex="0" :aria-label="label">
      <table :aria-label="label">
        <thead>
          <tr v-for="(row, h) in shownHeaders" :key="h">
            <th v-for="(cell, i) in row" :key="i" scope="col" :colspan="span(cell)">
              <input v-if="editable(cell)" class="trpg-input" :aria-label="`${multiHeader ? `表头第 ${h + 1} 行，` : ''}第 ${i + 1} 列标题`" :value="cellValue(cell)" @input="changeHeader(h, i, ($event.target as HTMLInputElement).value)" />
              <button v-else class="trpg-btn trpg-btn--quiet trpg-btn--small" type="button" @click="emit('json')">{{ showComplex(cell) }} · JSON</button>
            </th>
            <th v-if="sourceRows.length" scope="col" aria-label="行操作" class="lib-editgrid__actions" />
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in displayed" :key="i">
            <template v-if="shownCells(row)">
              <td v-for="(cell, j) in shownCells(row)" :key="j" :colspan="span(cell)">
                <input v-if="editable(cell)" class="trpg-input" :type="numeric || typeof cellValue(cell) === 'number' ? 'number' : 'text'" :aria-label="`第 ${i + 1} 行第 ${j + 1} 格`" :value="cellValue(cell)" @input="changeCell(row, i, j, $event)" />
                <button v-else class="trpg-btn trpg-btn--quiet trpg-btn--small" type="button" :aria-label="`在 JSON 中编辑第 ${i + 1} 行第 ${j + 1} 格`" @click="emit('json')">{{ showComplex(cell) }} · JSON</button>
              </td>
            </template>
            <td v-else :colspan="columns"><button class="lib-tojson" type="button" @click="emit('json')">在 JSON 中编辑这一行</button></td>
            <td v-if="sourceRows.length" class="lib-editgrid__actions">
              <button class="trpg-icon-btn" type="button" :aria-label="`删除第 ${i + 1} 行`" @click="removeRow(i)"><Icon name="x" :size="14" /></button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="lib-inline">
      <button class="trpg-btn trpg-btn--quiet trpg-btn--small" type="button" @click="emit('rows', [...sourceRows, blanks(columns)])"><Icon name="plus" :size="14" />行</button>
      <button class="trpg-btn trpg-btn--quiet trpg-btn--small" type="button" :disabled="!writable" @click="addColumn"><Icon name="plus" :size="14" />列</button>
    </div>
  </div>
</template>
