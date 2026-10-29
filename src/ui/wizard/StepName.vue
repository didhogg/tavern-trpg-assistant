<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { SAVE_NAME_MAX } from '../../schemas/campaign'
import { useAppStore } from '../../stores/app'
import { useLibraryStore } from '../../stores/library'
import { wizard } from './state'

const emit = defineEmits<{ submit: [] }>()
const app = useAppStore()
const library = useLibraryStore()
const input = ref<HTMLInputElement | null>(null)
const rule = computed(() => app.svc().rules.get(wizard.ruleId))
const tooLong = computed(() => wizard.name.trim().length > SAVE_NAME_MAX)
const empty = computed(() => wizard.name.trim().length === 0)
const summary = computed(() => {
  const n = wizard.packIds.length
  const adventure = wizard.adventureId ? `《${library.installedMap.get(wizard.adventureId)?.name ?? wizard.adventureId}》` : '不带冒险'
  return `将建立：${rule.value?.name ?? ''} · 资料 ${n} 本 · ${adventure}`
})

onMounted(() => {
  if (!wizard.nameEdited || !wizard.name) {
    const d = new Date(app.svc().now())
    wizard.name = `${rule.value?.nameShort ?? '战役'} · ${d.getMonth() + 1}月${d.getDate()}日`
  }
  input.value?.focus()
  input.value?.select()
})
</script>

<template>
  <form class="page-stack" @submit.prevent="emit('submit')">
    <h3 class="trpg-step-title">给战役起个名字</h3>
    <label class="trpg-field">
      <span class="trpg-field__label">战役名称</span>
      <input ref="input" v-model="wizard.name" class="trpg-input" type="text" autocomplete="off" aria-label="战役名称" @input="wizard.nameEdited = true; wizard.touched = true" />
      <span v-if="empty" class="trpg-field__error" role="alert">请输入战役名称</span>
      <span v-else-if="tooLong" class="trpg-field__error" role="alert">名称最多 {{ SAVE_NAME_MAX }} 个字</span>
    </label>
    <label class="trpg-field">
      <span class="trpg-field__label">备注（可空）</span>
      <textarea v-model="wizard.note" class="trpg-input" rows="2" maxlength="200" aria-label="备注" @input="wizard.touched = true" />
    </label>
    <p class="trpg-field__hint" data-testid="wizard-summary">{{ summary }}</p>
  </form>
</template>
