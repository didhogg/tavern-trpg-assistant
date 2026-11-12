<script setup lang="ts">
import { computed, nextTick, onMounted, ref, shallowRef, watch } from 'vue'
import type { AuthorMarkup } from '../../library/runtime/frame/author-markup'
import { copyText } from '../../host/clipboard'
import { appendToInput } from '../../host/input'
import { useAppStore } from '../../stores/app'
import Icon from '../kit/Icon.vue'
import InlineText from './InlineText.vue'
import EntryBody from './EntryBody.vue'
import AuthorFragment from './author-fragment'
import { isRollable, resultTitle, rollComment, rollTable, tableName, type TableRollResult } from './table-roll'

/**
 * 条目里的表格（U9g）：表头带骰式的表才有骰子标签（作者判定，参考表不可掷）；点标签 → 命中行高亮 + 表格下面出结果框（表内掷不出横幅）。
 * 骰式有几种写法 → 先选；骰式里有要填的数 → 就地填；结果框里【复制文字】【填入酒馆输入框】。
 */
const props = defineProps<{ table: Record<string, unknown>; codeSet: string }>()
const app = useAppStore()
const rollable = ref(false)
const result = ref<TableRollResult | null>(null)
const prompts = ref<number[]>([])
const sent = ref<'idle' | 'copied' | 'filled' | 'failed'>('idle')
const rows = computed(() => Array.isArray(props.table.rows) ? props.table.rows.map((row) => Array.isArray(row) ? row : Array.isArray(row?.row) ? row.row : []) : [])
const labels = computed(() => (Array.isArray(props.table.colLabels) ? (props.table.colLabels as unknown[]) : []))
const name = computed(() => tableName(props.table))
const hit = computed(() => (result.value?.status === 'complete' ? result.value.rolls.map((c) => c.rowIndex).filter((i): i is number => i !== null) : []))

onMounted(async () => { rollable.value = await isRollable(app.svc(), props.codeSet, props.table) })

// 整张表由作者画（P5-5 §11.5：掷骰范围格子、表头、注释、链接都照作者）；插件只叠【掷】、命中行高亮和结果框。作者画不出来时退回下面自己的表格。
const authored = shallowRef<AuthorMarkup | null>(null)
const authorFailed = ref(false)
const box = ref<HTMLElement | null>(null)
watch(() => [props.table, props.codeSet] as const, async ([table, codeSet]) => {
  authored.value = null
  authorFailed.value = false
  try {
    const m = await (await app.svc().backend.library.service.frameOf(codeSet)).call('renderContent', JSON.parse(JSON.stringify(table)), { tables: false })
    if (m.html.includes('<table')) authored.value = m
    else authorFailed.value = true
  } catch (e) { console.warn('[trpg-assistant] 作者没能画这张表，用插件的表格显示', e); authorFailed.value = true }
}, { immediate: true })
// 命中行：作者表格的 tbody 行和数据行一一对应
watch(() => [hit.value, authored.value] as const, async () => {
  await nextTick()
  const rowsEl = box.value?.querySelectorAll('tbody > tr') ?? []
  rowsEl.forEach((tr, i) => tr.setAttribute('data-hit', String(hit.value.includes(i))))
  box.value?.querySelector('tbody > tr[data-hit="true"]')?.scrollIntoView({ block: 'nearest' })
})
/** 结果框里不重复显示「01–04」这类掷骰范围格子（上面已写「掷出 N」）。 */
const shownCells = (cells: unknown[]): unknown[] => cells.filter((c) => !(c && typeof c === 'object' && (c as { type?: unknown }).type === 'cell' && !('entry' in c)))

async function roll(opts: { formulaIndex?: number; promptValues?: number[] } = {}): Promise<void> {
  sent.value = 'idle'
  result.value = await rollTable(app.svc(), props.codeSet, props.table, opts)
  if (result.value.status === 'needs-input') prompts.value = result.value.prompts.map((p) => p.default)
}
const complete = computed(() => (result.value?.status === 'complete' ? result.value : null))
async function copy(): Promise<void> {
  if (!complete.value) return
  sent.value = (await copyText(rollComment(name.value, complete.value))) ? 'copied' : 'failed'
}
function fill(): void {
  if (!complete.value) return
  sent.value = appendToInput(rollComment(name.value, complete.value)) ? 'filled' : 'failed'
}
</script>

<template>
  <div class="lib-rolltable" data-testid="roll-table">
    <template v-if="authored">
      <div v-if="rollable" class="lib-rolltable__bar"><button class="lib-dice" type="button" data-testid="roll-header" aria-label="掷这张表" @click="roll()"><Icon name="dice-five" :size="12" />掷</button></div>
      <div ref="box" class="lib-tablewrap lib-author-table" data-testid="author-table"><AuthorFragment :markup="authored" :code-set="codeSet" /></div>
    </template>
    <div v-else-if="!authorFailed" class="lib-skel" aria-busy="true"><i style="width:70%" /><i style="width:50%" /></div>
    <template v-else>
      <EntryBody v-if="table.intro" :block="table.intro" :code-set="codeSet" />
      <div class="lib-tablewrap">
        <table class="lib-rtable">
          <caption v-if="name" class="lib-faint"><InlineText :text="String(table.caption ?? table.name)" :code-set="codeSet" /></caption>
          <thead v-if="labels.length">
            <tr>
              <th v-for="(c, i) in labels" :key="i">
                <InlineText v-if="typeof c === 'string'" :text="c" :code-set="codeSet" /><EntryBody v-else :block="c" :code-set="codeSet" />
                <button v-if="i === 0 && rollable" class="lib-dice" type="button" data-testid="roll-header" aria-label="掷这张表" @click="roll()"><Icon name="dice-five" :size="12" />掷</button>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, r) in rows" :key="r" :data-hit="hit.includes(r)">
              <td v-for="(cell, c) in row" :key="c"><InlineText v-if="typeof cell === 'string'" :text="cell" :code-set="codeSet" /><EntryBody v-else :block="cell" :code-set="codeSet" /></td>
            </tr>
          </tbody>
        </table>
      </div>
      <EntryBody v-if="table.footnotes" :block="table.footnotes" :code-set="codeSet" />
      <EntryBody v-if="table.outro" :block="table.outro" :code-set="codeSet" />
    </template>
    <div v-if="result" class="lib-block" data-testid="roll-result">
      <template v-if="result.status === 'choose'"><b>这张表有几种骰法，先选一种</b><div style="display: flex; gap: var(--sp-2); flex-wrap: wrap"><button v-for="(o, i) in result.options" :key="i" class="trpg-btn trpg-btn--small" type="button" @click="roll({ formulaIndex: i })">{{ o.formula }}</button></div></template>
      <template v-else-if="result.status === 'needs-input'">
        <b>这张表的骰子需要你填数</b>
        <label v-for="(p, i) in result.prompts" :key="i" class="lib-numbox"><span>{{ p.title ?? `第 ${i + 1} 个数` }} =</span><input v-model.number="prompts[i]" type="number" :min="p.min" :max="p.max ?? undefined" class="trpg-input" style="width: 80px" /></label>
        <button class="trpg-btn trpg-btn--small trpg-btn--primary" type="button" style="justify-self: start" @click="roll({ promptValues: prompts })">掷</button>
      </template>
      <template v-else-if="result.status === 'complete'">
        <div data-testid="roll-text">
          <b>{{ resultTitle(name) }}</b>
          <div v-for="(r, i) in result.rolls" :key="i" class="lib-roll-outcome">
            <b>{{ r.label ? `${r.label} · ` : '' }}掷出 {{ r.total }}</b>
            <template v-if="r.rowIndex !== null">
              <EntryBody v-for="(cell, j) in shownCells(r.cells)" :key="j" :block="cell" :code-set="codeSet" />
            </template>
            <span v-else>没有对应的行</span>
          </div>
          <div v-for="(r, i) in result.inline" :key="i">{{ r.text }} = {{ r.total }}</div>
        </div>
        <div style="display: flex; gap: var(--sp-2); flex-wrap: wrap">
          <button class="trpg-btn trpg-btn--small" type="button" data-testid="roll-copy" @click="copy"><Icon name="copy" :size="14" />{{ sent === 'copied' ? '已复制' : '复制文字' }}</button>
          <button class="trpg-btn trpg-btn--small" type="button" data-testid="roll-fill" @click="fill">{{ sent === 'filled' ? '已填入' : '填入酒馆输入框' }}</button>
        </div>
        <span v-if="sent === 'failed'" class="lib-muted" style="color: var(--danger-text)">没能完成，结果文字还在，可以再试一次或手动复制。</span>
      </template>
      <span v-else class="lib-muted">这张表掷不了：{{ result.status === 'not-rollable' ? '没有骰式' : result.status === 'missing' ? result.reason : result.status === 'error' ? result.error : '' }}</span>
    </div>
  </div>
</template>
