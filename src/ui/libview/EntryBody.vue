<script setup lang="ts">
import InlineText from './InlineText.vue'
import RollTable from './RollTable.vue'

/**
 * 条目正文渲染（Vue，按块类型 → 渲染方式的登记）：作者的 entries 结构 → 文字 / 小节 / 列表 / 表格 / 引文 / 框；
 * 不认识的块 →「这段内容暂时无法显示」+ 折叠的原文（不丢、不静默跳过）。行内标签交 InlineText。
 */
defineProps<{ block: unknown; codeSet: string }>()

type Block = Record<string, unknown>
const isObj = (v: unknown): v is Block => typeof v === 'object' && v !== null && !Array.isArray(v)
const list = (v: unknown): unknown[] => (Array.isArray(v) ? v : [])
const SECTION = new Set(['entries', 'section', 'item', 'itemSub', 'itemSpell'])
const INSET = new Set(['inset', 'insetReadaloud', 'variant', 'variantInner', 'variantSub'])
const json = (v: unknown): string => JSON.stringify(v, null, 1)
</script>

<template>
  <p v-if="typeof block === 'string'"><InlineText :text="block" :code-set="codeSet" /></p>
  <template v-else-if="Array.isArray(block)">
    <EntryBody v-for="(b, i) in block" :key="i" :block="b" :code-set="codeSet" />
  </template>
  <template v-else-if="isObj(block) && typeof block.type === 'string' && SECTION.has(block.type) || (isObj(block) && block.type === undefined && 'entries' in block)">
    <div class="lib-sec-block">
      <h3 v-if="(block as Block).name"><InlineText :text="String((block as Block).name)" :code-set="codeSet" /></h3>
      <EntryBody :block="(block as Block).entries ?? (block as Block).entry" :code-set="codeSet" />
    </div>
  </template>
  <ul v-else-if="isObj(block) && block.type === 'list'" class="lib-list-ul">
    <li v-for="(it, i) in list(block.items)" :key="i"><EntryBody :block="it" :code-set="codeSet" /></li>
  </ul>
  <RollTable v-else-if="isObj(block) && block.type === 'table'" :table="block" :code-set="codeSet" />
  <div v-else-if="isObj(block) && typeof block.type === 'string' && INSET.has(block.type)" class="lib-inset">
    <h3 v-if="block.name"><InlineText :text="String(block.name)" :code-set="codeSet" /></h3>
    <EntryBody :block="block.entries" :code-set="codeSet" />
  </div>
  <blockquote v-else-if="isObj(block) && block.type === 'quote'" class="lib-quote">
    <EntryBody :block="block.entries" :code-set="codeSet" />
    <footer v-if="block.by" class="lib-faint">—— {{ block.by }}</footer>
  </blockquote>
  <div v-else class="lib-block">
    <span class="lib-muted">这段内容暂时无法显示。</span>
    <details class="lib-fold"><summary>原文</summary><pre class="lib-fold__body">{{ json(block) }}</pre></details>
  </div>
</template>
