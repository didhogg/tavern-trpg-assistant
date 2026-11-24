<script setup lang="ts">
// 从库里加一条到这个人（空白卡建人 / 加职业 / 换种族 …）：作者「导入到人物」整路，作者要问的一题一题在这里答（同一个弹窗里换页，不叠窗口）。
// 一问一答：作者在小窗里停在题上，答一题接着跑一段（person.importStep）；答完先列出「会加上什么」，确认才写进存档（一条撤销），取消 = 什么都不变。
// 已答的题排在上面，点一题 = 回到那题重答（后面的答案丢掉）。题目文字已过唯一显示出口；界面只收选择。
import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import type { EntryRef } from '../../../library/scopes'
import type { AskAnswer } from '../../../rules/kernel/author-ask-types'
import type { ImportQuestion, ImportStep } from '../../../rules/kernel/import-flow'
import { useModalStore } from '../../../stores/modal'
import { usePersonStore } from '../../../stores/person'
import Icon from '../../kit/Icon.vue'
import AskAsi from './AskAsi.vue'
import AskEquipment from './AskEquipment.vue'
import AskForm from './AskForm.vue'
import AskParts from './AskParts.vue'

/** closeOnBack：直接打开的（升级）没有上一页，返回 = 关掉弹窗。 */
/** level：从等级菜单「改到第几级」进来的，等级题预先选好这一级。 */
const props = defineProps<{ entryRef: EntryRef; name: string; replace?: { id: string; name: string }; closeOnBack?: boolean; level?: number }>()
const emit = defineEmits<{ back: [] }>()
const person = usePersonStore()
const modal = useModalStore()

const answers = ref<AskAnswer[]>([])
const asked = ref<Array<{ question: ImportQuestion; answer: AskAnswer }>>([])
const step = shallowRef<ImportStep | null>(null)
const pending = shallowRef<AskAnswer | null>(null)
const busy = ref(false)
const slow = ref(false)
let staged = false // 小窗里有没确认的改动（作者停在题上时已写了一部分；答完那一步是全部）

async function run(): Promise<void> {
  busy.value = true
  const timer = setTimeout(() => { slow.value = true }, 400)
  try {
    const out = await person.importStep(props.entryRef, answers.value, props.replace?.id)
    step.value = out ?? { status: 'error', error: '没有当前人物', ms: 0 }
    staged = out?.status === 'ready' || out?.status === 'question'
    pending.value = null
  } finally { clearTimeout(timer); busy.value = false; slow.value = false }
  // 作者一题都没问（加一瓶药水、没有选项的专长）：不多一步确认，直接写入（和把物品拖上表一样）
  if (step.value?.status === 'ready' && !asked.value.length) await confirm()
}
onMounted(run)

const question = computed(() => (step.value?.status === 'question' ? step.value.question : null))
function next(a: AskAnswer | null = pending.value): void {
  if (!a || !question.value || busy.value) return
  asked.value = [...asked.value, { question: question.value, answer: a }]
  answers.value = [...answers.value, a]
  void run()
}
/** 回到第 i 题重答：它和后面的回答都丢掉。 */
async function redo(i: number): Promise<void> {
  if (busy.value) return
  if (staged) { await person.importCancel(); staged = false }
  asked.value = asked.value.slice(0, i)
  answers.value = answers.value.slice(0, i)
  await run()
}
async function back(): Promise<void> {
  if (asked.value.length) return redo(asked.value.length - 1)
  if (staged) { await person.importCancel(); staged = false }
  if (props.closeOnBack) modal.close()
  else emit('back')
}
async function confirm(): Promise<void> {
  if (step.value?.status !== 'ready' || busy.value) return
  busy.value = true
  try {
    const ok = await person.importConfirm(props.replace ? `把${props.replace.name}换成${props.name}` : `加了${props.name}`, step.value.changes)
    if (ok) { staged = false; modal.close() }
  } finally { busy.value = false }
}
// 关掉弹窗 / 换页：没确认的改动退回
onBeforeUnmount(() => { if (staged) void person.importCancel() })

/** 已答的题在上面一行行列出：题目 + 玩家的选择（文字都来自题目本身，已过显示出口）。 */
function said(q: ImportQuestion, a: AskAnswer): string {
  if (a.skip) return '跳过'
  if (a.default) return '按默认'
  const f = q.form
  switch (f.type) {
    case 'boolean': return String(a.value ? f.yes ?? '是' : f.no ?? '否')
    case 'enum': return String(f.options[Number(a.value)]?.label ?? '')
    case 'number': case 'string': return String(a.value ?? '')
    case 'levels': { const top = Array.isArray(a.value) ? Math.max(...(a.value as number[])) : Number(a.value); return `到 ${top + 1} 级` }
    case 'choose': return (a.picks ?? []).flatMap((p, g) => p.map((o) => String(f.sets[a.set ?? 0]?.groups[g]?.options[o]?.label ?? ''))).join('、')
    case 'texts': return [...(a.picks ?? []).flatMap((p, g) => p.map((o) => String(f.groups[g]?.options[o]?.label ?? ''))), ...(a.texts ?? []).flat()].map((t) => (t.length > 12 ? `${t.slice(0, 12)}…` : t)).join('；')
    case 'equipment': return a.gold != null ? `起始金币 ${a.gold}` : `方案 ${(a.choice ?? []).map((c) => String.fromCharCode(97 + c)).join(' ')}`
    case 'parts': return f.parts.map((p, i) => said({ ...p, index: i } as ImportQuestion, a.parts?.[i] ?? {})).filter(Boolean).join('；')
    case 'asi': return a.featRef ? '改选专长' : Object.entries(a.bonus ?? {}).filter(([, n]) => n).map(([k, n]) => `${f.abilities.find((x) => x.key === k)?.label ?? k} +${n}`).join('、')
    default: return ''
  }
}
const groups = computed(() => {
  if (step.value?.status !== 'ready') return []
  const by = new Map<string, string[]>()
  for (const row of step.value.added) by.set(row.typeLabel, [...(by.get(row.typeLabel) ?? []), row.name])
  return [...by.entries()].map(([label, names]) => ({ label, names }))
})
const formKind = computed(() => { const t = question.value?.form.type; return t === 'equipment' ? AskEquipment : t === 'asi' ? AskAsi : t === 'parts' ? AskParts : AskForm })
</script>

<template>
  <div class="ask" data-testid="import-ask" :aria-busy="busy || undefined">
    <header class="ask-head">
      <button class="trpg-btn trpg-btn--small trpg-btn--quiet" type="button" :disabled="busy" data-testid="ask-back" @click="back"><Icon name="caret-left" :size="14" />{{ asked.length ? '上一步' : closeOnBack ? '关掉' : '换一个' }}</button>
      <b class="ask-what">{{ replace ? `${replace.name} → ${name}` : name }}</b>
      <small v-if="asked.length" class="ask-count">已答 {{ asked.length }} 题</small>
    </header>

    <ol v-if="asked.length" class="ask-done" aria-label="已答的题">
      <li v-for="(row, i) in asked" :key="i"><button type="button" :disabled="busy" :title="`回到这一题重答`" @click="redo(i)"><span>{{ row.question.title }}</span><b>{{ said(row.question, row.answer) }}</b></button></li>
    </ol>

    <div class="ask-body">
      <div v-if="!step" class="lib-skel" aria-busy="true"><i /><i style="width:70%" /><i style="width:50%" /></div>
      <template v-else-if="question">
        <h3 class="ask-title" data-testid="ask-title">{{ question.title ?? '请选择' }}</h3>
        <p v-if="question.note" class="ask-note">{{ question.note }}</p>
        <component :is="formKind" :key="answers.length" :question="question" :busy="busy" :level="level" :data-testid="question.form.type === 'parts' ? 'ask-parts' : undefined" @answer="(a: AskAnswer | null) => (pending = a)" @submit="(a: AskAnswer) => next(a)" />
      </template>
      <div v-else-if="step.status === 'ready'" class="ask-ready" data-testid="ask-ready">
        <h3 class="ask-title">{{ replace ? `换成${name}后会加上` : `加上${name}会带来` }}</h3>
        <dl class="ask-added">
          <template v-for="grp in groups" :key="grp.label"><dt>{{ grp.label }}</dt><dd>{{ grp.names.join('、') }}</dd></template>
        </dl>
      </div>
      <p v-else class="pp-error" role="alert" data-testid="ask-error"><Icon name="warning" :size="16" />{{ step.status === 'error' ? step.error : '' }}</p>
      <p v-if="slow" class="ask-slow" role="status">作者正在准备下一步…</p>
    </div>

    <footer class="ask-foot">
      <span class="pf-gap" />
      <template v-if="question">
        <button v-if="question.skippable" class="trpg-btn" type="button" :disabled="busy" data-testid="ask-skip" @click="next({ skip: true })">跳过</button>
        <button v-if="question.form.type !== 'boolean'" class="trpg-btn trpg-btn--primary" type="button" :disabled="busy || !pending" data-testid="ask-next" @click="next()">下一步</button>
      </template>
      <template v-else-if="step?.status === 'ready'">
        <button class="trpg-btn" type="button" :disabled="busy" @click="back">改一改</button>
        <button class="trpg-btn trpg-btn--primary" type="button" :disabled="busy || person.readOnly" data-testid="ask-confirm" @click="confirm"><Icon name="check" :size="14" />{{ busy ? '正在写入…' : '确认加上' }}</button>
      </template>
      <button v-else-if="step?.status === 'error'" class="trpg-btn" type="button" :disabled="busy" @click="run">重试</button>
    </footer>
  </div>
</template>
