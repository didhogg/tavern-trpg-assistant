<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { copyText } from '../../host/clipboard'
import { appendToInput } from '../../host/input'
import { useAppStore } from '../../stores/app'
import Icon from '../kit/Icon.vue'
import InlineText from './InlineText.vue'
import { isRollable, plainOf, resultText, rollComment, rollTable, type TableRollResult } from './table-roll'

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
const rows = computed(() => (Array.isArray(props.table.rows) ? (props.table.rows as unknown[][]) : []))
const labels = computed(() => (Array.isArray(props.table.colLabels) ? (props.table.colLabels as unknown[]) : []))
const name = computed(() => plainOf(props.table.caption) || '随机表')
const hit = computed(() => (result.value?.status === 'complete' ? result.value.rolls.map((c) => c.rowIndex).filter((i): i is number => i !== null) : []))
const cellText = (c: unknown): unknown => (c && typeof c === 'object' && 'entry' in (c as object) ? (c as { entry: unknown }).entry : c)

onMounted(async () => { rollable.value = await isRollable(app.svc(), props.codeSet, props.table) })

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
    <div class="lib-tablewrap">
      <table class="lib-rtable">
        <caption v-if="table.caption" class="lib-faint"><InlineText :text="String(table.caption)" :code-set="codeSet" /></caption>
        <thead v-if="labels.length">
          <tr>
            <th v-for="(c, i) in labels" :key="i">
              <InlineText :text="String(c)" :code-set="codeSet" />
              <button v-if="i === 0 && rollable" class="lib-dice" type="button" data-testid="roll-header" aria-label="掷这张表" @click="roll()"><Icon name="dice-five" :size="12" />掷</button>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, r) in rows" :key="r" :data-hit="hit.includes(r)">
            <td v-for="(cell, c) in row" :key="c"><InlineText :text="typeof cellText(cell) === 'string' ? (cellText(cell) as string) : plainOf(cellText(cell))" :code-set="codeSet" /></td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="result" class="lib-block" data-testid="roll-result">
      <template v-if="result.status === 'choose'"><b>这张表有几种骰法，先选一种</b><div style="display: flex; gap: var(--sp-2); flex-wrap: wrap"><button v-for="(o, i) in result.options" :key="i" class="trpg-btn trpg-btn--small" type="button" @click="roll({ formulaIndex: i })">{{ o.formula }}</button></div></template>
      <template v-else-if="result.status === 'needs-input'">
        <b>这张表的骰子需要你填数</b>
        <label v-for="(p, i) in result.prompts" :key="i" class="lib-numbox"><span>{{ p.title ?? `第 ${i + 1} 个数` }} =</span><input v-model.number="prompts[i]" type="number" :min="p.min" :max="p.max ?? undefined" class="trpg-input" style="width: 80px" /></label>
        <button class="trpg-btn trpg-btn--small trpg-btn--primary" type="button" style="justify-self: start" @click="roll({ promptValues: prompts })">掷</button>
      </template>
      <template v-else-if="result.status === 'complete'">
        <b data-testid="roll-text">{{ resultText(result) }}</b>
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
