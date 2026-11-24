<script setup lang="ts">
// 职业等级的属性提升 / 专长（问答桥 author-ask-forms.ts abilityIncreaseApp）：两点加到属性上（单项结果不超过上限），或改选一个专长。
// 专长在本页里直接搜（和「从库里加」同一份库列表，usePickList），不另开窗口；回答只交加了几点 / 选了哪条（库编号）。
import { computed, reactive, ref, watch } from 'vue'
import type { AskAnswer } from '../../../rules/kernel/author-ask-types'
import type { ImportQuestion } from '../../../rules/kernel/import-flow'
import { addProp } from '../../../rules/kernel/card-types'
import Segmented from '../../kit/Segmented.vue'
import { pickKey, usePickList } from '../../libview/usePickList'

type Form = Extract<ImportQuestion['form'], { type: 'asi' }>
const props = defineProps<{ question: ImportQuestion; busy: boolean }>()
const emit = defineEmits<{ answer: [AskAnswer | null] }>()
const f = computed(() => props.question.form as Form)
const mode = ref<'ability' | 'feat'>('ability')
const bonus = reactive<Record<string, number>>({})
watch(() => props.question, () => { mode.value = 'ability'; for (const k of Object.keys(bonus)) delete bonus[k] }, { immediate: true })
const used = computed(() => Object.values(bonus).reduce((n, v) => n + v, 0))
const left = computed(() => f.value.points - used.value)
const add = (key: string, d: number, value: number) => {
  const next = (bonus[key] ?? 0) + d
  if (next < 0 || (d > 0 && (left.value <= 0 || value + next > f.value.max))) return
  bonus[key] = next
}

const scrollEl = ref<HTMLElement | null>(null)
const { rows, q, picked, shown, current, range, visible, ref_ } = usePickList((library) => {
  const prop = addProp(library.rule, 'feats')
  if (!prop) throw new Error('这个规则没有专长类条目')
  return prop
}, scrollEl, '专长')

const answer = computed<AskAnswer | null>(() => {
  if (mode.value === 'feat') return ref_.value ? { featRef: ref_.value } : null
  return left.value === 0 ? { bonus: { ...bonus } } : null
})
watch(answer, (a) => emit('answer', a), { immediate: true })
</script>

<template>
  <div class="ask-form ask-asi">
    <Segmented v-model="mode" label="属性提升还是专长" :options="[{ value: 'ability', label: `属性提升（共 ${f.points} 点）` }, { value: 'feat', label: '改选一个专长' }]" />
    <div v-if="mode === 'ability'" class="ask-asi-grid">
      <div v-for="a in f.abilities" :key="a.key" class="ask-asi-row" :data-up="bonus[a.key] || undefined">
        <b>{{ a.label }}</b>
        <span class="ask-asi-now">{{ a.value }}</span>
        <span class="ask-asi-ctl">
          <button class="trpg-icon-btn" type="button" :aria-label="`${a.label}减一点`" :disabled="busy || !bonus[a.key]" @click="add(a.key, -1, a.value)">−</button>
          <i>+{{ bonus[a.key] ?? 0 }}</i>
          <button class="trpg-icon-btn" type="button" :aria-label="`${a.label}加一点`" :disabled="busy || left <= 0 || a.value + (bonus[a.key] ?? 0) >= f.max" :data-testid="`ask-asi-${a.key}`" @click="add(a.key, 1, a.value)">＋</button>
        </span>
        <span class="ask-asi-to">→ {{ a.value + (bonus[a.key] ?? 0) }}</span>
      </div>
      <p class="ask-note" :data-done="left === 0 || undefined">{{ left > 0 ? `还剩 ${left} 点` : '点数分配好了' }}（单项不超过 {{ f.max }}）</p>
    </div>
    <div v-else class="ask-feat">
      <input v-model="q" class="trpg-input" type="search" placeholder="搜专长（如 警觉）" aria-label="搜专长" data-testid="ask-feat-search">
      <div v-if="!rows" class="lib-skel" aria-busy="true"><i /><i style="width:80%" /></div>
      <div v-else ref="scrollEl" class="lib-mscroll ask-feat-list">
        <div class="lib-list" role="list" :style="{ paddingTop: `${range.padTop}px`, paddingBottom: `${range.padBottom}px` }">
          <button v-for="r in visible" :key="pickKey(r.row)" class="lib-list__row tp-row" type="button" role="listitem" :data-picked="pickKey(r.row) === picked || undefined" @click="picked = pickKey(r.row)">
            <span class="lib-name">{{ r.name }}</span><span class="lib-src lib-end">{{ r.row.source ?? '' }}</span>
          </button>
        </div>
      </div>
      <small class="ask-note">{{ current ? `选了：${current.name}` : `共 ${shown.length} 个专长` }}</small>
    </div>
  </div>
</template>
