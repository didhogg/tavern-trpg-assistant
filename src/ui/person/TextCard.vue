<script setup lang="ts">
// 背景 / 日志页的文字卡（线框 p6-12 原地编辑）：卡头名字 + ✎；点 ✎ 卡里变输入区，[取消][保存]；没写的卡可以收起成「＋ 名字」。
import { nextTick, ref } from 'vue'
import Icon from '../kit/Icon.vue'

const props = defineProps<{ title: string; text: string; readOnly?: boolean; single?: boolean; placeholder?: string; testid?: string }>()
const emit = defineEmits<{ save: [text: string] }>()
const editing = ref(false)
const draft = ref('')
const box = ref<HTMLTextAreaElement | HTMLInputElement | null>(null)
async function start(): Promise<void> { draft.value = props.text; editing.value = true; await nextTick(); box.value?.focus() }
function save(): void { if (draft.value !== props.text) emit('save', draft.value); editing.value = false }
defineExpose({ start })
</script>

<template>
  <section class="ps-text-card" :data-editing="editing || undefined" :data-testid="testid">
    <header class="ps-grp-head"><b>{{ title }}</b><button class="trpg-icon-btn ps-text-pen" type="button" :aria-label="`改${title}`" :disabled="readOnly || editing" @click="start"><Icon name="pencil-simple" :size="14" /></button></header>
    <form v-if="editing" class="ps-text-edit" @submit.prevent="save">
      <textarea v-if="!single" ref="box" v-model="draft" class="trpg-input" rows="5" :placeholder="placeholder" @keydown.esc.prevent="editing = false" />
      <input v-else ref="box" v-model="draft" class="trpg-input" :placeholder="placeholder" @keydown.esc.prevent="editing = false">
      <div class="ps-text-actions"><button class="trpg-btn trpg-btn--small" type="button" @click="editing = false">取消</button><button class="trpg-btn trpg-btn--small trpg-btn--primary" type="submit">保存</button></div>
    </form>
    <div v-else class="ps-text-body"><slot>{{ text }}</slot></div>
  </section>
</template>
