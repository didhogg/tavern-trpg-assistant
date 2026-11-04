<script setup lang="ts">
import BrowserTabs, { type BrowserTab } from '../../../kit/BrowserTabs.vue'

/** 居中弹窗的内页结构（U5R §10.0）：标签栏（可选）→ 滚动内容区 → 固定底栏。 */
defineProps<{ tabs?: BrowserTab[]; tabLabel?: string; note?: string }>()
const tab = defineModel<string>('tab')
</script>

<template>
  <div class="trpg-dlg">
    <BrowserTabs v-if="tabs && tabs.length > 1 && tab !== undefined" v-model="tab" :tabs="tabs" :label="tabLabel ?? '分类'" />
    <div class="trpg-dlg__body"><slot /></div>
    <footer class="trpg-dlg__foot"><p class="trpg-dlg__note">{{ note }}</p><div class="trpg-dlg__actions"><slot name="actions" /></div></footer>
  </div>
</template>
