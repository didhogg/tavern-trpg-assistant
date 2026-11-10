<script setup lang="ts">
import InlineText from './InlineText.vue'
import ImageBlock from './ImageBlock.vue'
import RenderedBlock from './RenderedBlock.vue'
import RollTable from './RollTable.vue'
import StatblockLink from './StatblockLink.vue'

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
  <ImageBlock v-else-if="isObj(block) && block.type === 'image'" :block="block" :code-set="codeSet" />
  <div v-else-if="isObj(block) && block.type === 'gallery'" class="lib-gallery">
    <ImageBlock v-for="(im, i) in list(block.images)" :key="i" :block="im as Block" :code-set="codeSet" />
  </div>
  <hr v-else-if="isObj(block) && block.type === 'hr'" class="lib-hr" />
  <RollTable v-else-if="isObj(block) && block.type === 'table'" :table="block" :code-set="codeSet" />
  <div v-else-if="isObj(block) && typeof block.type === 'string' && INSET.has(block.type)" class="lib-inset">
    <h3 v-if="block.name"><InlineText :text="String(block.name)" :code-set="codeSet" /></h3>
    <EntryBody :block="block.entries" :code-set="codeSet" />
  </div>
  <blockquote v-else-if="isObj(block) && block.type === 'quote'" class="lib-quote">
    <EntryBody :block="block.entries" :code-set="codeSet" />
    <footer v-if="block.by" class="lib-faint">—— {{ block.by }}</footer>
  </blockquote>
  <ul v-else-if="isObj(block) && block.type === 'options'" class="lib-list-ul">
    <li v-for="(it, i) in list(block.entries)" :key="i"><EntryBody :block="it" :code-set="codeSet" /></li>
  </ul>
  <EntryBody v-else-if="isObj(block) && block.type === 'homebrew' && (block.entries || block.oldEntries)" :block="block.entries ?? block.oldEntries" :code-set="codeSet" />
  <span v-else-if="isObj(block) && (block.type === 'inline' || block.type === 'inlineBlock') && block.entries" class="lib-inline"><EntryBody :block="block.entries" :code-set="codeSet" /></span>
  <EntryBody v-else-if="isObj(block) && block.type === 'tableGroup'" :block="block.tables" :code-set="codeSet" />
  <p v-else-if="isObj(block) && block.type === 'link' && isObj(block.href) && block.href.type === 'external' && typeof block.href.url === 'string'"><a :href="block.href.url" target="_blank" rel="noopener noreferrer">{{ block.text ?? block.href.url }}</a></p>
  <StatblockLink v-else-if="isObj(block) && block.type === 'statblock'" :block="block" :code-set="codeSet" />
  <div v-else-if="isObj(block) && block.type === 'statblockInline'" class="lib-block">
    <p class="lib-statblock">{{ (block.data as Block | undefined)?.name ?? block.name ?? '' }}</p>
    <details class="lib-fold"><summary>内嵌数据</summary><pre class="lib-fold__body">{{ json(block.data ?? block) }}</pre></details>
  </div>
  <RenderedBlock v-else :block="block" :code-set="codeSet" />
</template>
