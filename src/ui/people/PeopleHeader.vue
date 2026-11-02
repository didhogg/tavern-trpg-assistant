<script setup lang="ts">
import MoreMenu from '../kit/MoreMenu.vue'
import Icon from '../kit/Icon.vue'

const props = defineProps<{ total: number; trashCount: number; readOnly: boolean }>()
const emit = defineEmits<{ template: []; create: []; menu: [key: string] }>()
const menu = () => [
  { key: 'tags', label: '标签管理' },
  { key: 'trash', label: props.trashCount ? `回收站（${props.trashCount}）` : '回收站' },
]
</script>

<template>
  <header class="trpg-people__head">
    <div class="trpg-people__head-title">
      <h2>人物</h2>
      <span class="trpg-row__meta">共 {{ total }} 人</span>
    </div>
    <div class="trpg-people__head-actions">
      <button class="trpg-btn trpg-btn--small" type="button" data-testid="people-template" :disabled="readOnly" @click="emit('template')">模板</button>
      <button class="trpg-btn trpg-btn--primary trpg-btn--small" type="button" data-testid="people-new" :disabled="readOnly" @click="emit('create')"><Icon name="plus" :size="14" /><span class="trpg-people__new-label">新建</span></button>
      <span data-testid="people-page-menu"><MoreMenu label="人物页面" :items="menu()" @select="emit('menu', $event)" /></span>
    </div>
  </header>
</template>

<style scoped>
.trpg-people__head { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding-bottom: 12px; }
.trpg-people__head-title { display: flex; align-items: baseline; gap: 10px; }
.trpg-people__head-title h2 { margin: 0; font-family: var(--font-serif); font-size: 18px; font-weight: 600; }
.trpg-people__head-actions { display: flex; align-items: center; gap: 6px; }
@media (max-width: 480px) { .trpg-people__new-label { display: none; } .trpg-people__head-actions { gap: 2px; } }
</style>
