import { defineStore } from 'pinia'
import { computed, ref, shallowRef } from 'vue'
import { appendToInput } from '../host/input'
import { copyText } from '../host/clipboard'
import {
  addDie, builderText, canUseMode, commentFromLine, cryptoRng, diceTotal, lineText, readBuilder, removeDie, rollDice, stepMod,
  type Builder, type Rng, type RollMode, type RollResult,
} from '../rules/dice'

export interface RollRecord {
  id: number
  at: number
  note: string
  /** 规范写法（`1d20+5`）。 */
  expression: string
  /** 掷骰窗里的骰式文字（`1d20 + 5`），点「最近」里的一行时载入它。 */
  formula: string
  mode: RollMode
  total: number
  line: string
  natural?: 20 | 1
}

export const HISTORY_MAX = 20
const KEY = 'trpg-assistant:dice'
const EMPTY: Builder = { dice: [], mod: 0 }

interface Saved { history: RollRecord[]; text: string; mode: RollMode; note: string }

const storageKey = (owner: string | null): string => (owner ? `${KEY}:${owner}` : KEY)

function load(owner: string | null): Saved {
  const empty: Saved = { history: [], text: '', mode: 'normal', note: '' }
  try {
    const raw = localStorage.getItem(storageKey(owner))
    if (!raw) return empty
    const data = JSON.parse(raw) as Partial<Saved>
    return {
      history: Array.isArray(data.history) ? data.history.filter((h) => typeof h?.formula === 'string').slice(0, HISTORY_MAX) : [],
      text: typeof data.text === 'string' ? data.text : '',
      mode: data.mode === 'adv' || data.mode === 'dis' ? data.mode : 'normal',
      note: typeof data.note === 'string' ? data.note : '',
    }
  } catch (error) {
    console.warn('[trpg-assistant] 读取掷骰记录失败', error)
    return empty
  }
}

/**
 * 自由掷骰（基本蓝图 §2.1.1 基础版）：骰式是唯一的真相。
 * 点骰子、加减值、优势劣势都只是在改骰式文字，只有 roll() 会出结果。
 * 不改 HP、不扣资源、不写战役日志。
 */
export const useDiceStore = defineStore('dice', () => {
  let owner: string | null = null
  let rng: Rng = cryptoRng
  let nextId = 1
  let fillTimer: ReturnType<typeof setTimeout> | undefined

  const saved = load(null)
  const text = ref(saved.text)
  const mode = ref<RollMode>(saved.mode)
  const note = ref(saved.note)
  const history = ref<RollRecord[]>(saved.history)
  const last = ref<RollRecord | null>(null)
  const lastResult = shallowRef<RollResult | null>(null)
  const fillState = ref<'idle' | 'done' | 'failed'>('idle')
  const copied = ref(false)

  const read = computed(() => readBuilder(text.value))
  const error = computed(() => (read.value.ok ? '' : read.value.error))
  const builder = computed<Builder>(() => (read.value.ok ? read.value.builder : EMPTY))
  const canMode = computed(() => canUseMode(builder.value))
  const canRoll = computed(() => read.value.ok && diceTotal(builder.value) > 0)

  function persist(): void {
    try {
      localStorage.setItem(storageKey(owner), JSON.stringify({ history: history.value, text: text.value, mode: mode.value, note: note.value }))
    } catch (err) {
      console.warn('[trpg-assistant] 保存掷骰记录失败', err)
    }
  }

  /** 记录与骰式按角色卡 / 群组分开保存；切换聊天时重新载入。 */
  function setOwner(key: string | null): void {
    owner = key
    const s = load(key)
    history.value = s.history
    text.value = s.text
    mode.value = s.mode
    note.value = s.note
    last.value = null
    lastResult.value = null
  }

  /** 测试用：注入固定随机数；传 null 恢复真随机。 */
  const setRng = (next: Rng | null): void => {
    rng = next ?? cryptoRng
  }

  function edit(next: string): void {
    text.value = next
    persist()
  }

  const addOne = (sides: number): void => edit(addDie(text.value, sides))
  const removeOne = (sides: number): void => edit(removeDie(text.value, sides))
  const step = (delta: number): void => edit(stepMod(text.value, delta))
  const clear = (): void => {
    text.value = ''
    mode.value = 'normal'
    persist()
  }
  /** 直接改骰式文字（打字）：不改写文字本身，读不出来时显示原因。 */
  const setText = (value: string): void => edit(value)

  function setMode(value: RollMode): void {
    mode.value = value
    persist()
  }

  function setNote(value: string): void {
    note.value = value
    persist()
  }

  /** 掷骰：唯一会出结果的动作。骰式不合法或没有骰子时返回 null。 */
  function roll(): RollRecord | null {
    if (!canRoll.value) return null
    const effective: RollMode = canMode.value ? mode.value : 'normal'
    const result = rollDice(text.value, { rng, mode: effective })
    const rec: RollRecord = {
      id: nextId++,
      at: Date.now(),
      note: note.value.trim(),
      expression: result.expression,
      formula: builderText(builder.value),
      mode: effective,
      total: result.total,
      line: lineText(result),
      ...(result.natural ? { natural: result.natural } : {}),
    }
    last.value = rec
    lastResult.value = result
    history.value = [rec, ...history.value].slice(0, HISTORY_MAX)
    fillState.value = 'idle'
    copied.value = false
    persist()
    return rec
  }

  /** 点「最近」里的一行：把那次的骰式与掷法载入回来，不掷骰。 */
  function loadRecord(rec: RollRecord): void {
    text.value = rec.formula
    mode.value = rec.mode
    persist()
  }

  function clearHistory(): void {
    history.value = []
    persist()
  }

  const commentOf = (rec: RollRecord): string => commentFromLine(rec.line, note.value.trim() || rec.note)

  /** 把最近一次结果以注释追加到酒馆输入框；失败时结果还在，可再试或复制。 */
  function fill(): boolean {
    if (!last.value) return false
    const ok = appendToInput(commentOf(last.value))
    fillState.value = ok ? 'done' : 'failed'
    if (fillTimer !== undefined) clearTimeout(fillTimer)
    if (ok) fillTimer = setTimeout(() => (fillState.value = 'idle'), 2000)
    return ok
  }

  async function copy(): Promise<boolean> {
    if (!last.value) return false
    copied.value = await copyText(commentOf(last.value))
    return copied.value
  }

  return {
    text, mode, note, history, last, lastResult, fillState, copied, error, builder, canMode, canRoll,
    setOwner, setRng, addOne, removeOne, step, clear, setText, setMode, setNote, roll, loadRecord, clearHistory, fill, copy, commentOf,
  }
})
