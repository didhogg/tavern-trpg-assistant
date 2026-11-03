<script setup lang="ts">
import { computed } from 'vue'
import Icon from '../../kit/Icon.vue'
import MoreMenu, { type MenuItem } from '../../kit/MoreMenu.vue'
import HelpPopover from './HelpPopover.vue'

const props = defineProps<{
  name: string
  context?: string
  contextHint?: string
  contextShort?: string
  backLabel: string
  dirtyCount: number
  canUndo: boolean
  canSave: boolean
  readOnly: boolean
  libraryMode: boolean
  showName: boolean
  menuItems: MenuItem[]
}>()
const emit = defineEmits<{ back: []; undo: []; save: []; menu: [key: string] }>()
const saveLabel = computed(() => (props.libraryMode ? '保存到库' : '保存'))
const menuDisabled = computed(() => props.readOnly)
const items = computed<MenuItem[]>(() => props.menuItems.map((item) => ({ ...item, disabled: item.disabled || (menuDisabled.value && item.danger) })))
</script>

<template>
  <header class="trpg-card-top" :class="{ 'has-context': !!context }" data-testid="person-card-topbar">
    <button class="trpg-btn trpg-btn--quiet trpg-card-top__back" type="button" :aria-label="`返回${backLabel}`" data-testid="person-card-back" @click="emit('back')">
      <Icon name="caret-left" :size="16" /><span>{{ backLabel }}</span>
    </button>
    <span class="trpg-card-top__name" :class="{ 'is-visible': showName || !!context }" :title="context ? `${context}${contextHint ? ` · ${contextHint}` : ''}` : name"><span v-if="context" class="trpg-card-top__context-full">{{ context }}<span v-if="contextHint" class="trpg-card-top__context-hint"> · {{ contextHint }}</span></span><span v-else>{{ name }}</span><span v-if="contextShort" class="trpg-card-top__context-short">{{ contextShort }}</span></span>
    <span class="trpg-card-top__status" :class="{ 'is-dirty': dirtyCount > 0 }" :aria-label="dirtyCount > 0 ? `未保存 ${dirtyCount}` : '已保存'" data-testid="person-card-status">
      <template v-if="dirtyCount > 0"><span class="trpg-card-top__dot" /><span class="trpg-card-top__status-text">未保存 {{ dirtyCount }}</span></template>
      <template v-else><Icon name="check" :size="14" /><span class="trpg-card-top__status-text">已保存</span></template>
    </span>
    <div class="trpg-card-top__actions">
      <button class="trpg-btn trpg-btn--quiet trpg-btn--small trpg-card-top__undo" type="button" :disabled="!canUndo" data-testid="person-card-undo" @click="emit('undo')"><Icon name="arrow-counter-clockwise" :size="16" /><span class="trpg-card-top__action-text">撤销</span></button>
      <button class="trpg-btn trpg-btn--primary trpg-card-top__save" type="button" :disabled="!canSave" data-testid="person-card-save" @click="emit('save')">{{ saveLabel }}</button>
      <MoreMenu label="人物卡" :items="items" @select="emit('menu', $event)" />
      <HelpPopover kind="page" />
    </div>
  </header>
</template>
