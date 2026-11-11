<script setup lang="ts">
import { computed } from 'vue'

/**
 * 分组标题行右侧的全选框（驾驶员 2026-11-11 定，所有多选都用它）：
 *   [ ]  这一组一个都没选 → 点一下：全选这一组（能选的）
 *   [−]  这一组选了（全部或部分）→ 点一下：取消这一组全部
 * 只管显示和发出「全选 / 全不选」，选哪些由调用方决定。
 */
const props = defineProps<{ selected: number; total: number; label: string; disabled?: boolean }>()
const emit = defineEmits<{ change: [all: boolean] }>()
const any = computed(() => props.selected > 0)
function click(): void { if (!props.disabled && props.total > 0) emit('change', !any.value) }
</script>

<template>
  <button
    type="button" class="trpg-groupcheck" role="checkbox" :aria-checked="any ? (selected >= total ? 'true' : 'mixed') : 'false'"
    :aria-label="any ? `取消「${label}」这一组的全部选择` : `全选「${label}」这一组`" :title="any ? '取消这一组全部' : '全选这一组'"
    :disabled="disabled || total === 0" data-testid="group-check" @click.stop="click"
  >
    <span class="trpg-groupcheck__box" aria-hidden="true">{{ any ? '−' : '' }}</span>
  </button>
</template>
