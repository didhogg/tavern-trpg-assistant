<script setup lang="ts">
// 作者提问的通用题型（问答桥 author-ask-types.ts）：是否 · 选一项 · 填数 · 填字 · 选到第几级 · 几组勾选 · 表里选行或自己写。
// 只画题目、收玩家的选择，交出回答（AskAnswer，只有序号 / 值）；对不对、写进人物都是作者的事。题目文字已过唯一显示出口。
import { computed, reactive, ref, watch } from 'vue'
import type { AskAnswer } from '../../../rules/kernel/author-ask-types'
import type { ImportQuestion } from '../../../rules/kernel/import-flow'
import Checkbox from '../../kit/Checkbox.vue'
import Segmented from '../../kit/Segmented.vue'

/** level：等级题预先选好的等级（从等级菜单「改到第几级」进来）。 */
const props = defineProps<{ question: ImportQuestion; busy: boolean; level?: number }>()
/** answer：当前选择是否答完（null = 还没答完，下一步按钮不亮）；submit：是 / 否这种一点就答完的题直接交。 */
const emit = defineEmits<{ answer: [AskAnswer | null]; submit: [AskAnswer] }>()
const f = computed(() => props.question.form)

const pick = ref<number | null>(null)
const num = ref<number | null>(null)
const text = ref('')
const set = ref('0')
const picks = reactive<Record<string, boolean>>({})
const own = reactive<Record<number, string[]>>({})
/** 候选很长的组（专长、法术）：就地搜索，只藏不删（序号不变）。 */
const find = reactive<Record<number, string>>({})
const LONG = 16
const shownOpt = (g: number, i: number) => { const q = (find[g] ?? '').trim().toLowerCase(); return !q || String(groups.value[g].options[i].label).toLowerCase().includes(q) || !!picks[keyOf(g, i)] }
watch(() => props.question, () => {
  const form = props.question.form
  // 加子职业：默认选好到现在的等级（已有几级就选到第几级）
  pick.value = form.type === 'enum' ? form.selected
    : form.type === 'levels' && props.level && props.level - 1 >= (form.subclass ? 0 : form.from) ? props.level - 1
      : form.type === 'levels' && form.subclass && form.from > 0 ? form.from - 1 : null
  num.value = form.type === 'number' ? form.value : null
  text.value = form.type === 'string' ? form.value : ''
  set.value = form.type === 'choose' ? String(form.set) : '0'
  for (const k of Object.keys(picks)) delete picks[k]
  for (const k of Object.keys(own)) delete own[Number(k)]
  for (const k of Object.keys(find)) delete find[Number(k)]
}, { immediate: true })

const groups = computed(() => f.value.type === 'choose' ? f.value.sets[Number(set.value)]?.groups ?? [] : f.value.type === 'texts' ? f.value.groups : [])
const keyOf = (g: number, o: number) => `${set.value}:${g}:${o}`
const chosen = (g: number) => groups.value[g].options.map((_, o) => o).filter((o) => picks[keyOf(g, o)])
const ownTexts = (g: number) => (own[g] ?? []).map((t) => t.trim()).filter(Boolean)
const filled = (g: number) => chosen(g).length + (f.value.type === 'texts' ? ownTexts(g).length : 0)
/** 这组还能选：没选满，或者这一项本来就选着（可以取消）。 */
const canTick = (g: number, o: number) => !!picks[keyOf(g, o)] || filled(g) < groups.value[g].count

function toggle(g: number, o: number, on: boolean): void {
  if (on && !canTick(g, o)) return
  picks[keyOf(g, o)] = on
}

/** 当前回答（答完才交，没答完 = null）。 */
const answer = computed<AskAnswer | null>(() => {
  const form = f.value
  switch (form.type) {
    case 'enum': return pick.value == null ? null : { value: pick.value }
    case 'number': return num.value == null || !Number.isFinite(num.value) ? null : { value: num.value }
    case 'string': return { value: text.value }
    case 'levels': {
      if (pick.value == null) return null
      // 选「到第 n 级」：作者是单选就交第 n 级（作者自己补前面各级）；多选就交从已有等级到第 n 级的每一级
      // 加子职业交 1 级到第 n 级；升级只交新的那几级（已有的等级之后到第 n 级）
      const start = form.subclass ? 0 : form.from
      if (pick.value < start) return null
      return form.radio ? { value: pick.value } : { value: Array.from({ length: pick.value - start + 1 }, (_, i) => start + i) }
    }
    case 'choose': {
      const all = groups.value.map((_, g) => chosen(g))
      const done = groups.value.every((grp, g) => all[g].length === Math.min(grp.count, grp.options.filter((o) => !o.disabled).length))
      return done ? { set: Number(set.value), picks: all } : null
    }
    case 'texts': {
      const done = groups.value.every((grp, g) => filled(g) === grp.count)
      // 个性特征是玩家自己的文字：选表里的一行 = 把看到的这句（本战役语言）当作自己写的交给作者，人物里存的就是这句
      return done ? { picks: groups.value.map(() => []), texts: groups.value.map((grp, g) => [...chosen(g).map((o) => String(grp.options[o].label)), ...ownTexts(g)]) } : null
    }
    case 'unknown': return { default: true }
    default: return null
  }
})
watch(answer, (a) => emit('answer', a), { immediate: true })
const left = (g: number) => groups.value[g].count - filled(g)
function setOwn(g: number, i: number, value: string): void { const list = [...(own[g] ?? [])]; list[i] = value; own[g] = list }
</script>

<template>
  <div class="ask-form" :data-type="f.type">
    <div v-if="f.type === 'boolean'" class="ask-yesno">
      <button class="trpg-btn trpg-btn--primary" type="button" :disabled="busy" data-testid="ask-yes" @click="emit('submit', { value: true })">{{ f.yes ?? '是' }}</button>
      <button class="trpg-btn" type="button" :disabled="busy" data-testid="ask-no" @click="emit('submit', { value: false })">{{ f.no ?? '否' }}</button>
    </div>

    <div v-else-if="f.type === 'enum'" class="ask-list" role="radiogroup">
      <label v-for="(o, i) in f.options" :key="i" class="ask-row" :data-on="pick === i || undefined" :data-off="o.disabled || undefined">
        <input v-model="pick" type="radio" :value="i" :disabled="o.disabled || busy" name="ask-enum"><span>{{ o.label }}</span>
      </label>
    </div>

    <input v-else-if="f.type === 'number'" v-model.number="num" class="trpg-input ask-num" type="number" :min="f.min ?? undefined" :max="f.max ?? undefined" :disabled="busy" aria-label="填数字">
    <input v-else-if="f.type === 'string'" v-model="text" class="trpg-input" :disabled="busy" aria-label="填文字">

    <div v-else-if="f.type === 'levels'" class="ask-list ask-levels" role="radiogroup" aria-label="导入到第几级">
      <label v-for="(l, i) in f.levels" :key="i" class="ask-row ask-level" :data-on="pick != null && i <= pick && i >= (f.subclass ? 0 : f.from) || undefined" :data-off="l.disabled || undefined" :data-testid="`ask-level-${i + 1}`">
        <input v-model="pick" type="radio" :value="i" :disabled="l.disabled || busy" name="ask-level">
        <b>{{ l.label }}</b><span class="ask-note">{{ l.note ?? '—' }}</span>
      </label>
    </div>

    <template v-else-if="f.type === 'choose' || f.type === 'texts'">
      <Segmented v-if="f.type === 'choose' && f.sets.length > 1" v-model="set" label="选一套方案" :options="f.sets.map((s, i) => ({ value: String(i), label: s.label ?? `方案 ${i + 1}` }))" />
      <p v-else-if="f.type === 'choose' && f.sets[0]?.label" class="ask-fixed">固定：{{ f.sets[0].label }}</p>
      <section v-for="(grp, g) in groups" :key="`${set}:${g}`" class="ask-group">
        <header class="ask-group-head"><b>{{ grp.title ?? '选择' }}</b><small :data-done="left(g) === 0 || undefined">{{ left(g) > 0 ? `还差 ${left(g)} 项` : `已选够 ${grp.count} 项` }}</small></header>
        <input v-if="grp.options.length > LONG" v-model="find[g]" class="trpg-input ask-find" type="search" :placeholder="`在 ${grp.options.length} 项里搜`" :aria-label="`搜${grp.title ?? '选项'}`" :data-testid="`ask-find-${g}`">
        <div class="ask-chips" :data-wide="f.type === 'texts' || undefined">
          <Checkbox v-for="(o, i) in grp.options" v-show="shownOpt(g, i)" :key="i" :model-value="!!picks[keyOf(g, i)]" :disabled="o.disabled || busy || !canTick(g, i)" class="ask-chip" :data-testid="`ask-opt-${g}-${i}`" @update:model-value="(v: boolean) => toggle(g, i, v)">{{ o.label }}</Checkbox>
        </div>
        <div v-if="f.type === 'texts' && 'custom' in grp && grp.custom" class="ask-own">
          <input v-for="n in grp.count" :key="n" :value="own[g]?.[n - 1] ?? ''" class="trpg-input" :placeholder="`或者自己写第 ${n} 条`" :disabled="busy" :aria-label="`${grp.title ?? ''}自己写第 ${n} 条`" @input="setOwn(g, n - 1, ($event.target as HTMLInputElement).value)">
        </div>
      </section>
    </template>

    <p v-else-if="f.type === 'unknown'" class="ask-note">这一步按作者的默认来；也可以跳过。</p>
  </div>
</template>
