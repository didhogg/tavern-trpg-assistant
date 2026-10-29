<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import {
  ComboboxAnchor, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxPortal, ComboboxRoot, ComboboxTrigger, ComboboxViewport,
} from 'reka-ui'
import Icon from './Icon.vue'

export interface ComboOption {
  value: string
  /** 中文名 */
  label: string
  /** 英文名 */
  en?: string
  /** 类型或来源徽章 */
  badge?: string
}

/** 可搜索下拉（大量条目）：边输边筛，每行显示中文名、英文名与徽章；↑↓ 移动、Enter 选择、Esc 关闭；显示结果数。 */
const props = defineProps<{ options: ComboOption[]; label: string; placeholder?: string }>()
const model = defineModel<string>()
const portalTarget = inject<HTMLElement | undefined>('portalTarget', undefined)
const query = ref('')
const MAX_SHOWN = 200

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  const list = q ? props.options.filter((o) => o.label.toLowerCase().includes(q) || (o.en ?? '').toLowerCase().includes(q)) : props.options
  return list
})
const shown = computed(() => filtered.value.slice(0, MAX_SHOWN))
const selected = computed(() => props.options.find((o) => o.value === model.value))
</script>

<template>
  <ComboboxRoot v-model="model" ignore-filter open-on-click class="trpg-combo">
    <ComboboxAnchor class="trpg-combo__anchor">
      <ComboboxInput v-model="query" class="trpg-combo__input" :aria-label="label" :placeholder="selected?.label ?? placeholder ?? '搜索…'" />
      <ComboboxTrigger class="trpg-icon-btn trpg-combo__trigger" aria-label="展开列表"><Icon name="caret-down" :size="14" /></ComboboxTrigger>
    </ComboboxAnchor>
    <ComboboxPortal :to="portalTarget">
      <ComboboxContent class="trpg-select-content trpg-combo__content" position="popper" :side-offset="4" :collision-padding="8">
        <div class="trpg-combo__count" role="status">共 {{ filtered.length }} 条<template v-if="filtered.length > MAX_SHOWN">，只显示前 {{ MAX_SHOWN }} 条，继续输入可缩小范围</template></div>
        <ComboboxViewport class="trpg-select-viewport">
          <ComboboxEmpty class="trpg-combo__empty">没有符合的条目</ComboboxEmpty>
          <ComboboxItem v-for="o in shown" :key="o.value" :value="o.value" class="trpg-select-item">
            <span>{{ o.label }}<span v-if="o.en" class="trpg-row__meta"> · {{ o.en }}</span></span>
            <span v-if="o.badge" class="trpg-badge">{{ o.badge }}</span>
          </ComboboxItem>
        </ComboboxViewport>
      </ComboboxContent>
    </ComboboxPortal>
  </ComboboxRoot>
</template>
