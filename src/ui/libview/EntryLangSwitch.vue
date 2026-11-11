<script setup lang="ts">
import { computed } from 'vue'
import type { EntryRef, EntrySelection } from '../../library/scopes'
import { getSource } from '../../library/sources'
import { useEntryLangStore } from '../../stores/entrylang'
import { replaceEntry } from './open'

/**
 * 详情弹窗标题栏上的 中 / En 切换（P5 T6）：所有条目详情（官方、自制）都有。
 * 当前语言高亮；另一种语言没有这一条时那一侧灰掉，悬停说明原因。点另一侧 = 原地换成另一种语言（不多一层返回）。
 */
const props = defineProps<{ entryRef: EntryRef; selection?: EntrySelection }>()
const store = useEntryLangStore()
const lang = computed(() => (getSource(props.entryRef.set).lang === 'zh' ? 'zh' : 'en'))
const state = computed(() => store.get(props.entryRef, props.selection))
const otherOk = computed(() => !!state.value?.other)
// 还没查（条目还在读）或正在查：说「正在找」，不提前说「没有」
const hint = computed(() => (!state.value || state.value.loading ? '正在找另一种语言…' : state.value.reason ?? '另一种语言里没有这一条'))
function pick(v: 'en' | 'zh'): void {
  if (v === lang.value || !state.value?.other) return
  const { docIdLocal, ...ref } = state.value.other
  replaceEntry(ref, '', docIdLocal ? { docIdLocal } : props.selection && 'original' in props.selection ? props.selection : undefined)
}
</script>

<template>
  <span class="lib-langsw" role="group" aria-label="语言" data-testid="entry-lang">
    <button
      v-for="o in ([{ v: 'en', t: 'En' }, { v: 'zh', t: '中文' }] as const)" :key="o.v" type="button" class="lib-langsw__btn"
      :aria-pressed="lang === o.v" :disabled="lang !== o.v && !otherOk" :title="lang !== o.v && !otherOk ? hint : lang === o.v ? '当前语言' : `换成${o.t}`"
      @click="pick(o.v)"
    >
      {{ o.t }}
    </button>
  </span>
</template>
