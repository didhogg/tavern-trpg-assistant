<script setup lang="ts">
import { CATEGORIES } from '../../stores/roster'
import Icon from '../kit/Icon.vue'
import MoreMenu from '../kit/MoreMenu.vue'

defineProps<{ count: number; total: number; trash: boolean; disabled: boolean }>()
const emit = defineEmits<{ all: []; move: [category: string]; copy: []; remove: []; restore: [] }>()
</script>

<template>
  <div class="pp-selbar" role="toolbar" aria-label="多选操作">
    <span class="pp-selbar__n">已选 {{ count }} 个</span>
    <button class="trpg-btn trpg-btn--small" type="button" :disabled="count === total" @click="emit('all')">全选{{ trash ? '' : '这一类' }}</button>
    <span class="pp-selbar__gap" />
    <template v-if="trash">
      <button class="trpg-btn trpg-btn--small" type="button" :disabled="disabled || !count" @click="emit('restore')">恢复</button>
      <button class="trpg-btn trpg-btn--small trpg-btn--danger" type="button" :disabled="disabled || !count" @click="emit('remove')"><Icon name="trash" :size="14" />彻底删除</button>
    </template>
    <template v-else>
      <MoreMenu label="移到" text="移到" :items="CATEGORIES.map((c) => ({ key: c.id, label: c.label, disabled: disabled || !count }))" @select="(k) => emit('move', k)" />
      <button class="trpg-btn trpg-btn--small" type="button" :disabled="disabled || !count" @click="emit('copy')">复制</button>
      <button class="trpg-btn trpg-btn--small trpg-btn--danger" type="button" :disabled="disabled || !count" @click="emit('remove')"><Icon name="trash" :size="14" />删除</button>
    </template>
  </div>
</template>
