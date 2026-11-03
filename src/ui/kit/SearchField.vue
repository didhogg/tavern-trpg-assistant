<script setup lang="ts">
import Icon from './Icon.vue'

/** 搜索框：左放大镜、有字时右侧出 ×；人物列表与模板弹窗的工具行共用。输入法拼字期间由外面决定要不要搜。 */
defineProps<{ label: string; placeholder?: string; clearLabel?: string; testid?: string }>()
const model = defineModel<string>({ default: '' })
const emit = defineEmits<{ compositionstart: []; compositionend: []; enter: [] }>()
</script>

<template>
  <div class="trpg-search">
    <Icon name="magnifying-glass" :size="16" />
    <input
      v-model="model"
      class="trpg-search__input"
      type="search"
      :placeholder="placeholder ?? label"
      :aria-label="label"
      :data-testid="testid"
      @compositionstart="emit('compositionstart')"
      @compositionend="emit('compositionend')"
      @keydown.enter.prevent="emit('enter')"
    />
    <button v-if="model" class="trpg-search__clear" type="button" :aria-label="clearLabel ?? '清除搜索'" @click="model = ''"><Icon name="x" :size="14" /></button>
  </div>
</template>
