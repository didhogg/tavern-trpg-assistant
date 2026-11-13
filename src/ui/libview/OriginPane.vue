<script setup lang="ts">
import type { Ent } from './edit-json'
import EmbeddedEntity from './EmbeddedEntity.vue'
import { valueText } from './value-text'

/**
 * P5.5 u7-13 房规编辑器右栏「原件」（只能看）：和原件比改过的项列在上面（原件是什么、现在是什么）+［← 用回原件的］，下面是原件的作者渲染。
 */
defineProps<{ base: Ent; current: Ent; changed: string[]; labelOf: (field: string) => string; prop: string; codeSet: string; source: string }>()
const emit = defineEmits<{ restore: [field: string] }>()
</script>

<template>
  <div class="lib-stack" data-testid="origin-pane">
    <p class="lib-faint" style="margin: 0; font-size: 12px">{{ source }} · 只能看 · 改了的标黄</p>
    <p v-if="!changed.length" class="lib-muted" style="margin: 0">还没有改，和原件一样。</p>
    <div v-for="f in changed" :key="f" class="lib-crow" data-diff="true" data-testid="origin-row">
      <b>{{ labelOf(f) }}</b>
      <span>{{ valueText(base[f]) }}<small>现在是 {{ valueText(current[f]) }}</small></span>
      <button class="trpg-btn trpg-btn--small trpg-btn--quiet" type="button" data-testid="origin-restore" @click="emit('restore', f)">← 用回原件的</button>
    </div>
    <EmbeddedEntity :prop="prop" :item="base" :code-set="codeSet" />
  </div>
</template>
