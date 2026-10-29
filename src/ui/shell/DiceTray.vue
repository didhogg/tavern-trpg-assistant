<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { countOf, heroSides, DICE_FACES, type RollMode } from '../../rules/dice'
import { useDiceStore } from '../../stores/dice'
import { useUiStore } from '../../stores/ui'
import DieIcon from '../kit/DieIcon.vue'
import Icon from '../kit/Icon.vue'
import { loadPoint, savePoint } from './storage'
import { useDrag, type Point } from './useDrag'

const ui = useUiStore()
const dice = useDiceStore()
const MODES: Array<{ value: RollMode; label: string }> = [{ value: 'adv', label: '优势' }, { value: 'normal', label: '普通' }, { value: 'dis', label: '劣势' }]
const REDUCE = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

const el = ref<HTMLElement | null>(null)
const vw = ref(window.innerWidth)
const vh = ref(window.innerHeight)
const narrow = computed(() => vw.value <= 480)
const pos = ref<Point>(loadPoint('trpg-assistant:dice', { x: Math.max(8, window.innerWidth - 384), y: Math.max(8, window.innerHeight - 700) }))
const recentOpen = ref(false)

const bottomGap = () => (narrow.value ? 64 : 0) // 窄屏避开底部标签栏
const size = () => ({ w: el.value?.offsetWidth ?? 360, h: el.value?.offsetHeight ?? 480 })
function fit(): void {
  vw.value = window.innerWidth
  vh.value = window.innerHeight
  const { w, h } = size()
  pos.value = {
    x: narrow.value ? Math.round(vw.value * 0.04) : Math.min(Math.max(pos.value.x, 0), Math.max(0, vw.value - w)),
    y: Math.min(Math.max(pos.value.y, 0), Math.max(0, vh.value - h - bottomGap())),
  }
}
const drag = useDrag({ position: pos, size, lockX: () => narrow.value, bottomGap, onEnd: () => savePoint('trpg-assistant:dice', pos.value) })
const style = computed(() => (narrow.value ? { left: '4vw', width: '92vw', top: `${pos.value.y}px` } : { left: `${pos.value.x}px`, top: `${pos.value.y}px` }))

onMounted(() => {
  window.addEventListener('resize', fit)
  void nextTick(fit)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', fit)
  clearInterval(timer)
})
watch(() => ui.diceOpen, (open) => open && void nextTick(fit))
// 结果区高度变化（掷骰后出现小骰子）时，避免窗口被推出屏幕
watch(() => dice.lastResult, () => void nextTick(fit))

// 掷骰：骰子转一下、数字滚动，落定后才显示结果
const rolling = ref(false)
const shownId = ref<number | null>(null)
const tumble = ref(20)
let timer: ReturnType<typeof setInterval> | undefined

function roll(): void {
  if (rolling.value || !dice.canRoll) return
  const rec = dice.roll()
  if (!rec) return
  if (REDUCE) {
    shownId.value = rec.id
    return
  }
  const sides = heroSides(dice.builder)
  rolling.value = true
  shownId.value = null
  tumble.value = Math.ceil(Math.random() * sides)
  timer = setInterval(() => (tumble.value = Math.ceil(Math.random() * sides)), 70)
  setTimeout(() => {
    clearInterval(timer)
    rolling.value = false
    shownId.value = rec.id
  }, 460)
}

const shown = computed(() => (dice.last && dice.lastResult && shownId.value === dice.last.id ? { rec: dice.last, result: dice.lastResult } : null))
const heroKind = computed(() => {
  if (!shown.value || rolling.value) return heroSides(dice.builder)
  const sides = shown.value.result.terms.map((t) => (t.term.kind === 'dice' ? t.term.sides : 0))
  return heroSides({ dice: [{ count: 1, sides: Math.max(0, ...sides), sign: 1 }], mod: 0 })
})
const visibleHistory = computed(() => dice.history.filter((h) => !(rolling.value && h.id === dice.last?.id)))
type Mini = { key: string; kind: 'const'; value: number } | { key: string; kind: 'die'; sides: number; value: number; dim: boolean }
const minis = computed<Mini[]>(() => {
  if (!shown.value) return []
  const out: Mini[] = []
  for (const t of shown.value.result.terms) {
    if (t.term.kind === 'const') out.push({ key: `c${out.length}`, kind: 'const', value: t.subtotal })
    else {
      const sides = t.term.sides
      t.rolls.forEach((v, i) => out.push({ key: `${sides}-${out.length}-${i}`, kind: 'die', sides, value: v, dim: t.kept !== undefined && t.kept !== i }))
    }
  }
  return out
})
const bonusText = (n: number): string => `${n > 0 ? '+' : '−'}${Math.abs(n)}`
const modText = computed(() => (dice.builder.mod > 0 ? `+${dice.builder.mod}` : String(dice.builder.mod)))
const fillLabel = computed(() => (dice.fillState === 'done' ? '已填入 ✓' : dice.fillState === 'failed' ? '尚未填入，再试一次' : '填入输入框'))
const timeText = (at: number) => new Date(at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })
const hint = computed(() => (dice.canMode ? '' : '优势劣势只对单个 1d20 有效'))
const onFormula = (e: Event): void => dice.setText((e.target as HTMLInputElement).value)
</script>

<template>
  <aside v-if="ui.diceOpen" ref="el" class="trpg-dice" :style="style" :data-narrow="narrow" role="dialog" aria-label="掷骰" aria-modal="false">
    <header class="trpg-dice__head" @pointerdown="drag.onPointerDown">
      <Icon name="dice-five" :size="20" />
      <span class="trpg-dice__title">掷骰</span>
      <button class="trpg-icon-btn" type="button" aria-label="关闭掷骰" @click="ui.diceOpen = false"><Icon name="x" :size="18" /></button>
    </header>
    <div class="trpg-dice__body">
      <div>
        <div class="trpg-dice__lbl"><label for="trpg-dice-formula">骰式</label><span>点下面的骰子加进骰式，也可以直接写</span></div>
        <div class="trpg-dice__row">
          <input id="trpg-dice-formula" :value="dice.text" class="trpg-input trpg-dice__formula" type="text" autocomplete="off" spellcheck="false" placeholder="点骰子，或写 2d6+3" :aria-invalid="!!dice.error" @input="onFormula" @keydown.stop @keydown.enter.prevent="roll" />
          <button class="trpg-btn trpg-btn--quiet" type="button" :disabled="!dice.text" @click="dice.clear()">清空</button>
        </div>
        <div class="trpg-field__error trpg-dice__err" role="alert">{{ dice.error }}</div>
      </div>

      <div class="trpg-dice__faces" role="group" aria-label="骰子">
        <div v-for="f in DICE_FACES" :key="f" class="trpg-dice__face">
          <button class="trpg-dice__die" type="button" :data-n="countOf(dice.builder, f)" :aria-label="`加一颗 d${f}${countOf(dice.builder, f) ? `，现有 ${countOf(dice.builder, f)} 颗` : ''}`" @click="dice.addOne(f)">
            <DieIcon :sides="f" /><span>d{{ f }}</span>
            <span v-if="countOf(dice.builder, f)" class="trpg-dice__cnt">×{{ countOf(dice.builder, f) }}</span>
          </button>
          <button v-if="countOf(dice.builder, f)" class="trpg-dice__minus" type="button" :aria-label="`减一颗 d${f}`" @click="dice.removeOne(f)">−</button>
        </div>
      </div>

      <div class="trpg-dice__adjust">
        <div class="trpg-dice__step" role="group" aria-label="加减值">
          <span class="trpg-dice__small">加减值</span>
          <button type="button" aria-label="减 1" @click="dice.step(-1)">−</button>
          <output data-testid="dice-mod">{{ modText }}</output>
          <button type="button" aria-label="加 1" @click="dice.step(1)">+</button>
        </div>
        <div>
          <div class="trpg-seg" :class="{ 'is-off': !dice.canMode }" role="group" aria-label="d20 掷法">
            <button v-for="m in MODES" :key="m.value" type="button" :disabled="!dice.canMode" :aria-pressed="(dice.canMode ? dice.mode : 'normal') === m.value" @click="dice.setMode(m.value)">{{ m.label }}</button>
          </div>
          <div class="trpg-dice__small" data-testid="dice-hint">{{ hint }}</div>
        </div>
      </div>

      <button class="trpg-btn trpg-btn--primary trpg-dice__roll" type="button" :disabled="!dice.canRoll || rolling" :title="dice.canRoll ? undefined : '先选一个骰子'" data-testid="dice-roll" @click="roll"><Icon name="dice-five" :size="22" />掷骰</button>

      <section class="trpg-dice__result" aria-label="结果" aria-live="polite">
        <div class="trpg-dice__hero" :class="{ 'is-rolling': rolling, 'is-nat20': shown?.rec.natural === 20, 'is-nat1': shown?.rec.natural === 1 }" data-testid="dice-hero">
          <DieIcon :sides="heroKind" :value="rolling ? tumble : shown?.rec.total" />
        </div>
        <div class="trpg-dice__line" data-testid="dice-line">
          <template v-if="shown">{{ shown.rec.line }} <span v-if="shown.rec.natural" class="trpg-badge" :data-tone="shown.rec.natural === 20 ? 'gold' : 'danger'">天然 {{ shown.rec.natural }}</span></template>
          <template v-else-if="!rolling">点「掷骰」，结果会落在这里</template>
        </div>
        <span class="trpg-sr-only" data-testid="dice-total">{{ shown?.rec.total }}</span>
        <div class="trpg-dice__minis">
          <template v-for="m in minis" :key="m.key">
            <span v-if="m.kind === 'const'" class="trpg-dice__const">{{ bonusText(m.value) }}</span>
            <span v-else class="trpg-dice__mini" :class="{ 'is-dim': m.dim }" :title="m.dim ? '没有采用' : undefined"><DieIcon :sides="m.sides" :value="m.value" /></span>
          </template>
        </div>
        <div class="trpg-dice__send">
          <input :value="dice.note" class="trpg-input" type="text" placeholder="说明（可空），如：感知检定" aria-label="说明" autocomplete="off" @input="dice.setNote(($event.target as HTMLInputElement).value)" @keydown.stop />
          <button class="trpg-btn trpg-btn--primary" type="button" :disabled="!shown" @click="dice.fill()">{{ fillLabel }}</button>
          <button class="trpg-btn" type="button" :disabled="!shown" @click="dice.copy()">{{ dice.copied ? '已复制 ✓' : '复制' }}</button>
        </div>
      </section>

      <section aria-label="最近记录">
        <button class="trpg-dice__recent" type="button" :aria-expanded="recentOpen" @click="recentOpen = !recentOpen">
          <span>最近 {{ visibleHistory.length }} 次<template v-if="visibleHistory.length"> · 上一次 <b>{{ visibleHistory[0].total }}</b></template></span>
          <Icon :name="recentOpen ? 'caret-down' : 'caret-right'" :size="14" />
        </button>
        <template v-if="recentOpen">
          <ul v-if="visibleHistory.length" class="trpg-dice__list">
            <li v-for="rec in visibleHistory" :key="rec.id">
              <button type="button" :aria-label="`载入骰式 ${rec.formula}`" @click="dice.loadRecord(rec)">
                <b>{{ rec.total }}</b><span>{{ rec.formula }}<template v-if="rec.note"> · {{ rec.note }}</template></span><time>{{ timeText(rec.at) }}</time>
              </button>
            </li>
          </ul>
          <div v-if="visibleHistory.length" class="trpg-dice__clear"><button class="trpg-btn trpg-btn--quiet trpg-btn--small" type="button" @click="dice.clearHistory()">清空记录</button></div>
        </template>
      </section>
    </div>
  </aside>
</template>
