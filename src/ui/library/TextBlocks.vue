<script setup lang="ts">
import type { TextBlock } from '../../schemas/text'
import Term from '../kit/Term.vue'
import { parseInline } from './inline'

defineProps<{ blocks: TextBlock[] }>()
const emit = defineEmits<{ ref: [id: string] }>()
/** 只显示文字的位置（小标题、引文、表头…）：把行内标记转成纯文字，不露出 {{…}}。 */
const plain = (text: string): string => parseInline(text).map((s) => s.text).join('')
</script>

<template>
  <div class="trpg-blocks">
    <template v-for="(b, i) in blocks" :key="i">
      <p v-if="'p' in b" class="trpg-blocks__p">
        <template v-for="(s, j) in parseInline(b.p)" :key="j">
          <Term v-if="s.kind === 'ref'" @open="emit('ref', s.id)">{{ s.text }}</Term>
          <strong v-else-if="s.kind === 'mark' && s.mark === 'em'">{{ s.text }}</strong>
          <span v-else-if="s.kind === 'mark'" class="trpg-blocks__mark">{{ s.text }}</span>
          <template v-else>{{ s.text }}</template>
        </template>
      </p>
      <section v-else-if="'h' in b" class="trpg-blocks__h">
        <h4>{{ plain(b.h) }}</h4>
        <TextBlocks :blocks="b.body" @ref="emit('ref', $event)" />
      </section>
      <ul v-else-if="'list' in b" class="trpg-blocks__list">
        <li v-for="(item, k) in b.list" :key="k">
          <template v-for="(s, j) in parseInline(item)" :key="j">
            <Term v-if="s.kind === 'ref'" @open="emit('ref', s.id)">{{ s.text }}</Term>
            <template v-else>{{ s.text }}</template>
          </template>
        </li>
      </ul>
      <p v-else-if="'tableRef' in b" class="trpg-blocks__table-ref">
        <span aria-hidden="true">{{ /（[^）]+）$/.test(b.tableRef.label) ? '🎲' : '📋' }}</span>
        <Term @open="emit('ref', b.tableRef.id)">{{ b.tableRef.label }}</Term>
      </p>
      <div v-else-if="'table' in b" class="trpg-blocks__table">
        <table>
          <caption v-if="b.table.caption">{{ plain(b.table.caption) }}</caption>
          <thead><tr><th v-for="c in b.table.cols" :key="c">{{ plain(c) }}</th></tr></thead>
          <tbody>
<tr v-for="(row, r) in b.table.rows" :key="r">
<td v-for="(cell, c) in row" :key="c">
            <template v-for="(s, j) in parseInline(cell)" :key="j">
              <Term v-if="s.kind === 'ref'" @open="emit('ref', s.id)">{{ s.text }}</Term>
              <template v-else>{{ s.text }}</template>
            </template>
          </td>
</tr>
</tbody>
        </table>
      </div>
      <blockquote v-else-if="'quote' in b" class="trpg-blocks__quote">{{ plain(b.quote) }}<footer v-if="b.by">—— {{ plain(b.by) }}</footer></blockquote>
      <aside v-else-if="'read' in b" class="trpg-blocks__read"><TextBlocks :blocks="b.read" @ref="emit('ref', $event)" /></aside>
    </template>
  </div>
</template>
