<script setup lang="ts">
import { reactive } from 'vue'
import type { VariantPlanItem } from '../../core/library/variants'
import Checkbox from '../kit/Checkbox.vue'

const props = defineProps<{ packName: string; items: VariantPlanItem[]; names: Record<string, string>; sourceOf: (current: string) => string; onAnswer: (use: Record<string, boolean> | null) => void }>()
const use = reactive<Record<string, boolean>>(Object.fromEntries(props.items.map((i) => [i.variant.key, i.defaultUse])))
const all = (value: boolean): void => props.items.forEach((i) => (use[i.variant.key] = value))
const modeText = (i: VariantPlanItem): string => (i.variant.mode === 'hide' ? '隐藏' : i.variant.mode === 'patch' ? '局部修改' : '整条替换')
const conflicts = props.items.filter((i) => i.conflict).length
</script>

<template>
  <div class="page-stack" data-testid="apply-variants">
    <p class="trpg-confirm__message">「{{ packName }}」修改了 {{ items.length }} 个官方条目（只在本存档生效）。</p>
    <div class="trpg-drawer__buttons">
      <button class="trpg-btn trpg-btn--small" type="button" @click="all(true)">全部应用</button>
      <button class="trpg-btn trpg-btn--small" type="button" @click="all(false)">全部不用</button>
    </div>
    <ul class="trpg-list">
      <li v-for="i in items" :key="i.variant.key" class="trpg-row">
        <Checkbox v-model="use[i.variant.key]" :label="names[i.entryKey] ?? i.entryKey">
          <span class="trpg-row__title">{{ names[i.entryKey] ?? i.entryKey }}</span>
        </Checkbox>
        <span class="trpg-row__meta">{{ modeText(i) }}<template v-if="i.variant.note"> · {{ i.variant.note }}</template></span>
        <span v-if="i.conflict" class="trpg-badge" data-tone="warn">冲突 · 正在用：{{ sourceOf(i.current) }}</span>
      </li>
    </ul>
    <p v-if="conflicts" class="trpg-field__hint">冲突的条目默认保持现状；不勾选的修改版也会加入候选，之后随时可以在版本条里改用。</p>
    <div class="trpg-confirm__actions">
      <button class="trpg-btn" type="button" @click="onAnswer(null)">取消</button>
      <button class="trpg-btn trpg-btn--primary" type="button" data-autofocus @click="onAnswer({ ...use })">启用</button>
    </div>
  </div>
</template>
