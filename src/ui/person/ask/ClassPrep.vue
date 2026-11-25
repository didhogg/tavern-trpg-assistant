<script setup lang="ts">
// 加职业 / 升级 / 补选子职业在作者问答之前的两步（驾驶员 11-25 评测：主职业、目标等级、子职业是同一次人物变更）。照作者自己的升级做法：
//   ① 目标等级：空白人物的第一个职业选到几级（升级 = 职业那一行的等级下拉已经定了；兼职 = 作者从 1 级加，都不再问）。
//   ② 子职业：还没有子职业、目标等级到了作者算的门槛（frame/class-import.ts classPlan）→ 只列这个职业的子职业（库里开着的包，统一两栏页），
//      可以「稍后再选」（职业行下面留着「选子职业」）。
//   补选子职业（已有职业）：等级沿用这个职业现在的，不问。
// 定好后交 ready(how, chips)：how 交给作者导入（作者就不再问等级，子职业和职业同一次导入）；chips = 已答一栏里显示的这两步（点了回到这一步）。
import { computed, onMounted, ref, shallowRef } from 'vue'
import type { EntryRef } from '../../../library/scopes'
import type { ClassPlan, ImportHow } from '../../../rules/kernel/import-flow'
import { usePersonStore } from '../../../stores/person'
import Icon from '../../kit/Icon.vue'
import ItemPickPage from '../ItemPickPage.vue'
import { libraryRow, subclassOf } from '../../libview/usePickList'
import { classBuilds } from '../view-tabs'

/** fixed = 只是说明（补选子职业「加到德鲁伊现在的 2 级」），不能回去改。 */
export interface PrepChip { title: string; said: string; stage: 'level' | 'subclass'; fixed?: boolean }
export interface PrepAt { stage: 'level' | 'subclass'; target?: number }

/** level = 等级下拉选的目标等级；at = 从已答一栏回到哪一步（带着当时的目标等级）。 */
const props = defineProps<{ entryRef: EntryRef; name: string; level?: number; at?: PrepAt | null; backText: string }>()
const emit = defineEmits<{ ready: [how: ImportHow, chips: PrepChip[]]; back: [] }>()
const person = usePersonStore()
const plan = shallowRef<Extract<ClassPlan, { kind: 'class' }> | null>(null)
const stage = ref<'loading' | 'level' | 'subclass'>('loading')
const target = ref(1)
const range = (from: number, to: number): number[] => Array.from({ length: Math.max(0, to - from + 1) }, (_, i) => from + i)
/** 这个职业在人物身上显示的名字（中文，人物页同一个取名出口）。 */
const shownClass = (classId: string | null): string | null => (classId && person.sheet ? classBuilds(person.sheet).find((c) => c.id === classId)?.name ?? null : null)

onMounted(async () => {
  const prop = props.entryRef.prop
  if (prop !== 'class' && prop !== 'subclass') { emit('ready', {}, []); return }
  const p = await person.importPlan(props.entryRef)
  // 作者那边读不出（自定义职业等）：照旧让作者自己问
  if ('error' in p) { console.warn('[trpg-assistant] 读职业情况没成功，交作者自己问', p.error); emit('ready', {}, []); return }
  if (p.kind === 'subclass') {
    const cls = shownClass(p.classId)
    emit('ready', p.classId ? { levels: range(1, p.classLevel) } : {}, p.classId ? [{ title: '加到', said: `${cls ?? p.className} 现在的 ${p.classLevel} 级`, stage: 'subclass', fixed: true }] : [])
    return
  }
  plan.value = p
  classItem.value = ((await libraryRow(props.entryRef))?.item ?? null) as Record<string, unknown> | null
  if (p.classId) target.value = props.level ?? p.classLevel + 1
  else if (p.total > 0) target.value = 1
  else target.value = props.at?.target ?? props.level ?? 1
  if (props.at?.stage === 'level' || (!p.classId && !p.total && props.at?.stage !== 'subclass')) { stage.value = 'level'; return }
  afterTarget()
})
const from = computed(() => plan.value?.classLevel ?? 0)
/** 人物总等级上限 20：这个职业最多到 20 减去别的职业的等级。 */
const maxLevel = computed(() => Math.max(1, 20 - ((plan.value?.total ?? 0) - from.value)))
const levels = computed(() => range(1, maxLevel.value))
/** 目标等级定了：到了子职业门槛又还没有子职业 → 选子职业；否则直接交给作者。 */
function afterTarget(): void {
  const p = plan.value!
  if (!p.hasSubclass && p.subclassLevel && target.value >= p.subclassLevel) { stage.value = 'subclass'; return }
  finish(null, false)
}
function finish(sub: { ref: EntryRef; name: string } | null, asked: boolean): void {
  const p = plan.value!
  const chips: PrepChip[] = []
  if (!p.classId && !p.total) chips.push({ title: '目标等级', said: `${target.value} 级`, stage: 'level' })
  if (asked) chips.push({ title: '子职业', said: sub?.name ?? '稍后再选', stage: 'subclass' })
  emit('ready', { levels: range(from.value + 1, target.value), subclass: sub?.ref ?? null }, chips)
}
/** 只列这个职业的子职业（库里这个职业条目的名字 + 来源对上：同名的 PHB / XPHB 职业各列各的）。 */
const classItem = shallowRef<Record<string, unknown> | null>(null)
const keep = (item: Record<string, unknown>): boolean => !!classItem.value && subclassOf(item, classItem.value)
const who = computed(() => shownClass(plan.value?.classId ?? null) ?? props.name)
const subBack = computed(() => (plan.value && !plan.value.classId && !plan.value.total ? '上一步' : props.backText))
function subclassBack(): void { if (subBack.value === '上一步') stage.value = 'level'; else emit('back') }
</script>

<template>
  <div v-if="stage === 'loading'" class="lib-skel" aria-busy="true" data-testid="class-prep-loading"><i /><i style="width:70%" /></div>
  <div v-else-if="stage === 'level'" class="ask" data-testid="class-prep-level">
    <header class="ask-head">
      <button class="trpg-btn trpg-btn--small trpg-btn--quiet" type="button" data-testid="ask-back" @click="emit('back')"><Icon name="caret-left" :size="14" />{{ backText }}</button>
      <b class="ask-what">{{ name }}</b>
    </header>
    <div class="ask-body">
      <h3 class="ask-title">{{ name }}要到几级？</h3>
      <p class="ask-note">一次加到这一级。{{ plan?.subclassLevel ? `到 ${plan.subclassLevel} 级会接着选子职业。` : '' }}以后再升级用职业那一行的等级下拉。</p>
      <div class="ask-list ask-levels" role="radiogroup" aria-label="职业目标等级">
        <label v-for="n in levels" :key="n" class="ask-row ask-level" :data-on="n <= target || undefined" :data-testid="`prep-level-${n}`">
          <input v-model="target" type="radio" :value="n" name="prep-level"><b>{{ n }} 级</b><span class="ask-note">{{ n === plan?.subclassLevel ? '这一级选子职业' : '' }}</span>
        </label>
      </div>
    </div>
    <footer class="ask-foot">
      <span class="pf-gap" />
      <button class="trpg-btn trpg-btn--primary" type="button" data-testid="prep-level-next" @click="afterTarget">下一步</button>
    </footer>
  </div>
  <ItemPickPage
    v-else kind="subclasses" choose :keep="keep" :title="`${who}到 ${target} 级可以选子职业`" later="稍后再选" :back-text="subBack"
    data-testid="class-prep-subclass" @chosen="(ref, n) => finish({ ref, name: n }, true)" @later="finish(null, true)" @back="subclassBack"
  />
</template>
