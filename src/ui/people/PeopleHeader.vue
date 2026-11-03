<script setup lang="ts">
import MoreMenu from '../kit/MoreMenu.vue'
import Icon from '../kit/Icon.vue'

const props = defineProps<{ trashCount: number; readOnly: boolean }>()
const emit = defineEmits<{ template: []; create: []; menu: [key: string] }>()
const menu = () => [
  { key: 'tags', label: '标签管理' },
  { key: 'trash', label: props.trashCount ? `回收站（${props.trashCount}）` : '回收站' },
]
</script>

<template>
  <header class="trpg-people__head">
    <button class="trpg-btn" type="button" data-testid="people-template" :disabled="readOnly" @click="emit('template')">模板</button>
    <button class="trpg-btn trpg-btn--primary" type="button" data-testid="people-new" aria-label="新建" :disabled="readOnly" @click="emit('create')"><Icon name="plus" :size="16" /><span class="trpg-people__new-label">新建</span></button>
    <span data-testid="people-page-menu"><MoreMenu label="人物页面" :items="menu()" @select="emit('menu', $event)" /></span>
  </header>
</template>
