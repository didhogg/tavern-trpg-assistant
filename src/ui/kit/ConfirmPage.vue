<script setup lang="ts">
import type { ConfirmSection } from './confirm'

/** 确认页：说明（固定）→ 明细（自己滚动，长清单也不会把按钮挤出去）→ 按钮（永远钉在底部）。 */
const props = defineProps<{
  message: string
  details?: string[]
  /** 分组明细（如：本次选中 / 必须一起删除 / 仅受影响、保留 / 引用提醒）。 */
  sections?: ConfirmSection[]
  confirmLabel: string
  cancelLabel?: string
  danger?: boolean
  onAnswer: (value: boolean) => void
}>()
</script>

<template>
  <div class="trpg-confirm" data-testid="confirm-page">
    <p class="trpg-confirm__message">{{ props.message }}</p>
    <div v-if="props.details?.length || props.sections?.length" class="trpg-confirm__scroll" data-testid="confirm-details" tabindex="0">
      <ul v-if="props.details?.length" class="trpg-confirm__details">
        <li v-for="line in props.details" :key="line">{{ line }}</li>
      </ul>
      <section v-for="sec in props.sections" :key="sec.title" class="trpg-confirm__section" :data-tone="sec.tone ?? 'info'">
        <h4 class="trpg-confirm__h">{{ sec.title }}<small>{{ sec.items.length }}</small></h4>
        <ul class="trpg-confirm__details">
          <li v-for="(line, i) in sec.items" :key="i">{{ line }}</li>
        </ul>
      </section>
    </div>
    <div class="trpg-confirm__actions">
      <button class="trpg-btn" type="button" :data-autofocus="props.danger ? '' : undefined" @click="props.onAnswer(false)">{{ props.cancelLabel ?? '取消' }}</button>
      <button class="trpg-btn" :class="props.danger ? 'trpg-btn--danger' : 'trpg-btn--primary'" type="button" :data-autofocus="props.danger ? undefined : ''" @click="props.onAnswer(true)">
        {{ props.confirmLabel }}
      </button>
    </div>
  </div>
</template>
