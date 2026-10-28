<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useDiceStore, BONUS_MAX, BONUS_MIN } from '../../stores/dice'
import { useUiStore } from '../../stores/ui'
import Icon from '../kit/Icon.vue'
import Segmented from '../kit/Segmented.vue'
import { loadPoint, savePoint } from './storage'
import { useDrag, type Point } from './useDrag'

const ui = useUiStore()
const dice = useDiceStore()
const QUICK = [4, 6, 8, 10, 12, 20, 100]
const MODES = [{ value: 'adv', label: '优势' }, { value: 'normal', label: '普通' }, { value: 'dis', label: '劣势' }]

const el = ref<HTMLElement | null>(null)
const vw = ref(window.innerWidth)
const vh = ref(window.innerHeight)
const narrow = computed(() => vw.value <= 480)
const pos = ref<Point>(loadPoint('trpg-assistant:dice', { x: Math.max(8, window.innerWidth - 384), y: Math.max(8, window.innerHeight - 640) }))
const recentOpen = ref(!narrow.value)

const size = () => ({ w: el.value?.offsetWidth ?? 360, h: el.value?.offsetHeight ?? 480 })
function fit(): void {
  vw.value = window.innerWidth
  vh.value = window.innerHeight
  const { w, h } = size()
  const bottomGap = narrow.value ? 64 : 0 // 窄屏避开底部标签栏
  pos.value = {
    x: narrow.value ? Math.round(vw.value * 0.04) : Math.min(Math.max(pos.value.x, 0), Math.max(0, vw.value - w)),
    y: Math.min(Math.max(pos.value.y, 0), Math.max(0, vh.value - h - bottomGap)),
  }
}
const drag = useDrag({ position: pos, size, lockX: () => narrow.value, onEnd: () => savePoint('trpg-assistant:dice', pos.value) })
const style = computed(() =>
  narrow.value
    ? { left: '4vw', width: '92vw', top: `${pos.value.y}px` }
    : { left: `${pos.value.x}px`, top: `${pos.value.y}px` },
)

onMounted(() => {
  window.addEventListener('resize', fit)
  void nextTick(fit)
})
onBeforeUnmount(() => window.removeEventListener('resize', fit))
watch(() => ui.diceOpen, (open) => open && void nextTick(fit))

const bonusLabel = computed(() => (dice.bonus > 0 ? `+${dice.bonus}` : String(dice.bonus)))
const fillLabel = computed(() => (dice.fillState === 'done' ? '已填入 ✓' : dice.fillState === 'failed' ? '尚未填入，再试一次' : '填入输入框'))
const timeText = (at: number) => new Date(at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })
</script>

<template>
  <aside v-if="ui.diceOpen" ref="el" class="trpg-dice" :style="style" :data-narrow="narrow" role="dialog" aria-label="掷骰" aria-modal="false">
    <header class="trpg-dice__head" @pointerdown="drag.onPointerDown">
      <Icon name="dice-five" :size="20" />
      <span class="trpg-dice__title">掷骰</span>
      <button class="trpg-icon-btn" type="button" aria-label="关闭掷骰" @click="ui.diceOpen = false"><Icon name="x" :size="18" /></button>
    </header>
    <div class="trpg-dice__body">
      <div class="trpg-dice__result" aria-live="polite" :data-natural="dice.last?.natural">
        <template v-if="dice.last">
          <div :key="dice.last.id" class="trpg-dice__total" data-testid="dice-total">{{ dice.last.total }}</div>
          <div class="trpg-dice__line" data-testid="dice-line">{{ dice.last.line }}</div>
          <span v-if="dice.last.natural" class="trpg-badge" :data-tone="dice.last.natural === 20 ? 'gold' : 'danger'">天然 {{ dice.last.natural }}</span>
        </template>
        <p v-else class="trpg-dice__placeholder">点一个骰子开始掷</p>
      </div>

      <div class="trpg-dice__quick" role="group" aria-label="快捷骰">
        <button
          v-for="s in QUICK"
          :key="s"
          class="trpg-btn"
          :class="{ 'trpg-btn--primary': s === 20 }"
          type="button"
          @click="dice.rollQuick(s)"
        >
          d{{ s }}
        </button>
      </div>

      <div class="trpg-dice__mods">
        <Segmented :model-value="dice.mode" label="优势或劣势（d20）" :options="MODES" @update:model-value="dice.setMode($event as 'adv' | 'normal' | 'dis')" />
        <div class="trpg-dice__bonus" role="group" aria-label="d20 加值">
          <span class="trpg-field__label">加值</span>
          <button class="trpg-icon-btn" type="button" aria-label="加值减 1" :disabled="dice.bonus <= BONUS_MIN" @click="dice.setBonus(dice.bonus - 1)">–</button>
          <output class="trpg-dice__bonus-value" data-testid="dice-bonus">{{ bonusLabel }}</output>
          <button class="trpg-icon-btn" type="button" aria-label="加值加 1" :disabled="dice.bonus >= BONUS_MAX" @click="dice.setBonus(dice.bonus + 1)">+</button>
        </div>
      </div>

      <form class="trpg-dice__expr" @submit.prevent="dice.rollExpression()">
        <label class="trpg-field">
          <span class="trpg-field__label">骰式</span>
          <span class="trpg-dice__expr-row">
            <input v-model="dice.expression" class="trpg-input" type="text" inputmode="text" placeholder="2d6+3" aria-label="骰式" autocomplete="off" @keydown.stop />
            <button class="trpg-btn trpg-btn--primary" type="submit">掷</button>
          </span>
          <span v-if="dice.error" class="trpg-field__error" role="alert">{{ dice.error }}</span>
        </label>
      </form>

      <label class="trpg-field">
        <span class="trpg-field__label">说明（可空）</span>
        <input :value="dice.note" class="trpg-input" type="text" placeholder="感知检定" aria-label="说明" autocomplete="off" @input="dice.setNote(($event.target as HTMLInputElement).value)" @keydown.stop />
      </label>

      <div class="trpg-dice__out">
        <button class="trpg-btn trpg-btn--primary" type="button" :disabled="!dice.last" @click="dice.fill()">{{ fillLabel }}</button>
        <button class="trpg-btn" type="button" :disabled="!dice.last" @click="dice.copy()">{{ dice.copied ? '已复制 ✓' : '复制' }}</button>
      </div>

      <section class="trpg-dice__recent" aria-label="最近记录">
        <div class="trpg-dice__recent-head">
          <button v-if="narrow" class="trpg-btn trpg-btn--quiet trpg-btn--small" type="button" :aria-expanded="recentOpen" @click="recentOpen = !recentOpen">
            最近 {{ dice.history.length }} 次<Icon :name="recentOpen ? 'caret-down' : 'caret-right'" :size="14" />
          </button>
          <span v-else class="trpg-field__label">最近</span>
          <button v-if="dice.history.length" class="trpg-btn trpg-btn--quiet trpg-btn--small" type="button" @click="dice.clearHistory()">清空</button>
        </div>
        <ul v-if="recentOpen && dice.history.length" class="trpg-dice__list">
          <li v-for="rec in dice.history" :key="rec.id" class="trpg-dice__item">
            <b class="trpg-dice__item-total">{{ rec.total }}</b>
            <span class="trpg-dice__item-main">{{ rec.line }}<template v-if="rec.note"> · {{ rec.note }}</template></span>
            <time class="trpg-row__meta">{{ timeText(rec.at) }}</time>
            <button class="trpg-icon-btn" type="button" :aria-label="`再掷一次 ${rec.expression}`" @click="dice.reroll(rec)"><Icon name="arrow-clockwise" :size="16" /></button>
          </li>
        </ul>
      </section>
    </div>
  </aside>
</template>
