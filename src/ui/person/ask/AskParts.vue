<script setup lang="ts">
// 组合题（问答桥 form parts：作者一个组件里套着几个小组件——技能、语言、额外法术……）：每道小题照它自己的题型画，
// 全部答完才交（parts[i] = 第 i 道小题的回答）。是 / 否小题点了就算答了。题目文字已过唯一显示出口。
import { computed, reactive, watch } from 'vue'
import type { AskAnswer } from '../../../rules/kernel/author-ask-types'
import type { ImportQuestion } from '../../../rules/kernel/import-flow'
import AskAsi from './AskAsi.vue'
import AskEquipment from './AskEquipment.vue'
import AskForm from './AskForm.vue'

type Parts = Extract<ImportQuestion['form'], { type: 'parts' }>
const props = defineProps<{ question: ImportQuestion; busy: boolean }>()
const emit = defineEmits<{ answer: [AskAnswer | null] }>()
const parts = computed(() => (props.question.form as Parts).parts.map((p, i) => ({ ...p, index: i }) as ImportQuestion))
const answers = reactive<Record<number, AskAnswer | null>>({})
watch(() => props.question, () => { for (const k of Object.keys(answers)) delete answers[Number(k)] }, { immediate: true })
const kindOf = (q: ImportQuestion) => q.form.type === 'equipment' ? AskEquipment : q.form.type === 'asi' ? AskAsi : AskForm
const answer = computed<AskAnswer | null>(() => {
  const list = parts.value.map((_, i) => answers[i] ?? null)
  return list.every(Boolean) ? { parts: list as AskAnswer[] } : null
})
watch(answer, (a) => emit('answer', a), { immediate: true })
</script>

<template>
  <div class="ask-parts">
    <section v-for="(q, i) in parts" :key="i" class="ask-part" :data-testid="`ask-part-${i}`">
      <h4 class="ask-part-title">{{ q.title ?? '选择' }}<small v-if="q.form.type === 'boolean' && answers[i]" class="ask-part-said">{{ answers[i]?.value ? '是' : '否' }}</small></h4>
      <component :is="kindOf(q)" :question="q" :busy="busy" @answer="(a: AskAnswer | null) => { if (q.form.type !== 'boolean') answers[i] = a }" @submit="(a: AskAnswer) => (answers[i] = a)" />
    </section>
  </div>
</template>
