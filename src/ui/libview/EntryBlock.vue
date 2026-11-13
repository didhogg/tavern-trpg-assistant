<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import Icon from '../kit/Icon.vue'
import RenderedBlock from './RenderedBlock.vue'
import TableGrid from './TableGrid.vue'
import { CODESET_KEY } from './entry-blocks'

/** 直接编辑作者正文块的对应属性。保留段落的标题译名、样式、出处等附加字段。 */
const props = defineProps<{ value: unknown; label: string }>()
const emit = defineEmits<{ update: [v: unknown]; json: [] }>()
const codeSet = inject(CODESET_KEY, ref('cn'))
const obj = computed(() => props.value && typeof props.value === 'object' && !Array.isArray(props.value) ? props.value as Record<string, unknown> : null)
const entries = computed(() => obj.value?.entries)
const items = computed(() => Array.isArray(obj.value?.items) ? obj.value.items : null)
const tables = computed(() => Array.isArray(obj.value?.tables) ? obj.value.tables : null)
const heading = computed(() => Array.isArray(entries.value) && (obj.value?.type == null || ['entries', 'section', 'item', 'itemSub', 'itemSpell'].includes(String(obj.value.type))))
const set = (name: string, value: unknown) => emit('update', { ...obj.value, [name]: value })
const input = (e: Event): string => (e.target as HTMLInputElement | HTMLTextAreaElement).value
const box = ref<HTMLTextAreaElement | null>(null)
function wrap(tag: string, placeholder: string): void {
  const el = box.value
  const text = typeof props.value === 'string' ? props.value : ''
  const a = el?.selectionStart ?? text.length, b = el?.selectionEnd ?? text.length
  const inner = text.slice(a, b) || placeholder
  const ins = `{@${tag} ${inner}}`
  emit('update', text.slice(0, a) + ins + text.slice(b))
  requestAnimationFrame(() => { el?.focus(); el?.setSelectionRange(a + tag.length + 3, a + tag.length + 3 + inner.length) })
}
function changeChild(key: 'items' | 'entries' | 'tables', index: number, value: unknown): void {
  const before = obj.value?.[key]
  if (!Array.isArray(before)) return
  const next = [...before]
  next[index] = value
  set(key, next)
}
function setGrid(rows: unknown[], headers?: unknown[]): void {
  emit('update', { ...obj.value, rows, ...(headers ? { [Array.isArray(obj.value?.colLabelRows) ? 'colLabelRows' : 'colLabels']: headers } : {}) })
}
</script>

<template>
  <div v-if="typeof value === 'string' || value == null" class="lib-edittext">
    <div class="lib-block__bar" role="toolbar" :aria-label="`${label}的格式`">
      <button class="trpg-btn trpg-btn--small trpg-btn--quiet" type="button" title="插入骰子，例如 2d6" data-testid="block-dice" @click="wrap('dice', '1d6')"><Icon name="dice-five" :size="14" />骰子</button>
      <button class="trpg-btn trpg-btn--small trpg-btn--quiet" type="button" aria-label="加粗" @click="wrap('b', '加粗的字')"><b>B</b></button>
      <button class="trpg-btn trpg-btn--small trpg-btn--quiet" type="button" aria-label="斜体" @click="wrap('i', '斜体的字')"><i>I</i></button>
    </div>
    <textarea ref="box" class="trpg-input lib-para" rows="3" :value="value ?? ''" :aria-label="label" @input="emit('update', input($event))" />
  </div>
  <div v-else-if="heading && Array.isArray(entries)" class="lib-edittext" data-testid="block-heading">
    <input class="trpg-input" type="text" :value="obj?.name" :aria-label="`${label}的小标题`" placeholder="小标题" @input="set('name', input($event))" />
    <div v-for="(entry, i) in entries" :key="i" class="lib-edittext__item">
      <EntryBlock :value="entry" :label="`${label}，第 ${i + 1} 段`" @update="changeChild('entries', i, $event)" @json="emit('json')" />
      <button class="trpg-icon-btn" type="button" :aria-label="`删除第 ${i + 1} 段正文`" @click="set('entries', entries.filter((_, index) => index !== i))"><Icon name="x" :size="14" /></button>
    </div>
    <button class="trpg-btn trpg-btn--small trpg-btn--quiet lib-edittext__add" type="button" @click="set('entries', [...entries, ''])"><Icon name="plus" :size="14" />文字段</button>
  </div>
  <div v-else-if="obj?.type === 'list' && items" class="lib-edittext" data-testid="block-list">
    <input v-if="obj.name !== undefined" class="trpg-input" type="text" :value="obj.name" :aria-label="`${label}的列表标题`" @input="set('name', input($event))" />
    <div v-for="(item, i) in items" :key="i" class="lib-edittext__item">
      <input v-if="typeof item === 'string'" class="trpg-input" type="text" :value="item" :aria-label="`${label}，第 ${i + 1} 项`" @input="changeChild('items', i, input($event))" />
      <EntryBlock v-else :value="item" :label="`${label}，第 ${i + 1} 项`" @update="changeChild('items', i, $event)" @json="emit('json')" />
      <button class="trpg-icon-btn" type="button" :aria-label="`删掉第 ${i + 1} 条列表项`" @click="set('items', items.filter((_, index) => index !== i))"><Icon name="x" :size="14" /></button>
    </div>
    <button class="trpg-btn trpg-btn--small trpg-btn--quiet lib-edittext__add" type="button" @click="set('items', [...items, ''])"><Icon name="plus" :size="14" />列表项</button>
  </div>
  <div v-else-if="obj?.type === 'table'" class="lib-edittext">
    <input class="trpg-input" type="text" :value="obj.caption" :aria-label="`${label}的表名`" placeholder="表名" @input="set('caption', input($event))" />
    <TableGrid :rows="obj.rows" :headers="obj.colLabelRows ?? obj.colLabels" :multi-header="Array.isArray(obj.colLabelRows)" :label="label" @rows="set('rows', $event)" @headers="set(Array.isArray(obj.colLabelRows) ? 'colLabelRows' : 'colLabels', $event)" @column="setGrid" @json="emit('json')" />
  </div>
  <div v-else-if="obj?.type === 'tableGroup' && tables" class="lib-edittext" data-testid="block-table-group">
    <EntryBlock v-for="(table, i) in tables" :key="i" :value="table" :label="`${label}，第 ${i + 1} 张表`" @update="changeChild('tables', i, $event)" @json="emit('json')" />
  </div>
  <div v-else class="lib-edittext">
    <RenderedBlock :block="value" :code-set="codeSet" />
    <button class="lib-tojson" type="button" @click="emit('json')"><Icon name="info" :size="14" />在 JSON 里编辑这一段 ›</button>
  </div>
</template>
