<script setup lang="ts">
import EntryForm, { type FormTable } from './EntryForm.vue'
import type { Ent } from './edit-json'

/**
 * 编辑器里这一条的附属部分（书的正文，后端 attached-parts.ts）：表单安排给了 attached 才有。
 * 和主条目同一个表单组件，字段表、表单安排都是附属部分那一类的（跟着主条目走的 id、来源后端已经藏掉）。
 */
defineProps<{ table: FormTable | null; ent: Ent | null; formKey: string; rawNames?: boolean; codeSet: string }>()
const emit = defineEmits<{ update: [ent: Ent] }>()
</script>

<template>
  <section v-if="table && ent" class="lib-attached" data-testid="editor-attached">
    <EntryForm :key="formKey" :table="table" :ent="ent" detailed :raw-names="rawNames" :code-set="codeSet" @update="(e) => emit('update', e)" />
  </section>
</template>
