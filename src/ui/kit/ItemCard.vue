<script setup lang="ts">
import HoverTip from './HoverTip.vue'
import Icon from './Icon.vue'

/**
 * 项目卡（U5R §1.3）：名称 + 最终值 →「来源与算法」只读灰字 → 手动调整 / 覆盖（能填的才画框）→ 自动计算。
 * 手动调整、覆盖由父级用插槽放进来；本组件只管排版与「自动计算」按钮。
 */
defineProps<{ title: string; value: string; auto?: string; sources: Array<{ label: string; value: string; note?: string; overridden?: boolean }>; canReset: boolean; readOnly?: boolean; hint?: string }>()
defineEmits<{ reset: [] }>()
</script>

<template>
  <section class="trpg-item" :aria-label="title">
    <header class="trpg-item__head">
      <h3 class="trpg-item__title">{{ title }}</h3>
      <HoverTip v-if="hint" :text="hint"><span class="trpg-item__hint" tabindex="0" role="img" :aria-label="hint"><Icon name="info" :size="16" /></span></HoverTip>
      <span class="trpg-item__value">{{ value }}</span>
    </header>
    <p v-if="auto" class="trpg-item__auto">自动 {{ auto }}</p>
    <ul class="trpg-item__sources">
      <li v-for="(row, i) in sources" :key="i" :class="{ 'is-overridden': row.overridden }">
        <span class="trpg-item__label">{{ row.label }}</span><span class="trpg-item__num">{{ row.value }}</span><span v-if="row.note" class="trpg-item__note">{{ row.note }}</span>
      </li>
    </ul>
    <div v-if="$slots.default" class="trpg-item__edit"><slot /></div>
    <button v-if="!readOnly" class="trpg-btn trpg-btn--quiet trpg-btn--small" type="button" :disabled="!canReset" @click="$emit('reset')"><Icon name="arrow-counter-clockwise" :size="16" />自动计算</button>
  </section>
</template>
