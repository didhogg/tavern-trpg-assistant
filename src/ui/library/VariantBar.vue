<script setup lang="ts">
import { computed, inject, markRaw } from 'vue'
import { PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger } from 'reka-ui'
import { ORIGINAL, type VariantSlot } from '../../core/library/types'
import { resolveVariant } from '../../core/library/variants'
import type { Entry } from '../../schemas/pack'
import { useModalStore } from '../../stores/modal'
import ComparePage from './ComparePage.vue'

const props = defineProps<{ variants: VariantSlot; original: Entry | null; readOnly?: boolean; originName: string }>()
const emit = defineEmits<{ switch: [key: string] }>()
const modal = useModalStore()
const portalTarget = inject<HTMLElement | undefined>('portalTarget', undefined)

const active = computed(() => props.variants.candidates.find((c) => c.key === props.variants.active))
const resolved = computed(() => resolveVariant(props.original, props.variants))
const others = computed(() => props.variants.candidates.length - (active.value ? 1 : 0))
const changeCount = (key: string): number => {
  const v = props.variants.candidates.find((c) => c.key === key)
  if (!v || v.mode === 'hide') return 0
  const data = (v.mode === 'patch' ? (v.payload as { data?: Record<string, unknown> })?.data : (v.payload as Entry | null)?.data) ?? {}
  return Object.keys(data).length
}
const modeText = (key: string): string => {
  const v = props.variants.candidates.find((c) => c.key === key)
  return v?.mode === 'hide' ? '隐藏' : v?.mode === 'patch' ? `改了 ${changeCount(key)} 处` : '整条替换'
}

function compare(): void {
  const cur = resolved.value.entry
  if (!props.original || !cur) return
  modal.push({ key: 'compare', title: '与原版对比', component: markRaw(ComparePage), props: { left: props.original, right: cur, leftLabel: '原版', rightLabel: '当前' } })
}
</script>

<template>
  <div class="trpg-variantbar" data-testid="variant-bar">
    <div class="trpg-variantbar__text">
      <template v-if="resolved.hidden">⊘ 本存档中已隐藏（{{ active?.sourceName }}：{{ active?.note || '这个条目不会出现在搜索与新建里' }}）</template>
      <template v-else-if="active">✎ 本存档使用《{{ active.sourceName }}》的修改版<template v-if="others > 0"> · 另有 {{ others }} 个版本</template></template>
      <template v-else>本存档使用原版 · 有 {{ variants.candidates.length }} 个修改版可选</template>
      <span v-if="resolved.broken" class="trpg-field__error"> ⚠ 修改无法显示：原版缺失</span>
    </div>
    <div class="trpg-variantbar__actions">
      <button v-if="active && !resolved.hidden && original" class="trpg-btn trpg-btn--small" type="button" @click="compare">与原版对比</button>
      <PopoverRoot>
        <PopoverTrigger class="trpg-btn trpg-btn--small" :disabled="readOnly">切换版本</PopoverTrigger>
        <PopoverPortal :to="portalTarget">
          <PopoverContent class="trpg-popover" align="end" :side-offset="6" :collision-padding="8">
            <fieldset class="trpg-variantpick">
              <legend class="trpg-field__label">{{ originName }}使用哪个版本</legend>
              <label class="trpg-radio"><input type="radio" name="variant" :checked="variants.active === ORIGINAL" @change="emit('switch', ORIGINAL)" /> 原版</label>
              <label v-for="c in variants.candidates" :key="c.key" class="trpg-radio">
                <input type="radio" name="variant" :checked="variants.active === c.key" @change="emit('switch', c.key)" />
                <span>{{ c.sourceName }}<span class="trpg-row__meta"> · {{ c.note ? `${c.note}（${modeText(c.key)}）` : modeText(c.key) }}</span></span>
              </label>
            </fieldset>
          </PopoverContent>
        </PopoverPortal>
      </PopoverRoot>
    </div>
  </div>
</template>
