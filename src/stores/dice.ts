import { defineStore } from 'pinia'
import { computed, ref, shallowRef } from 'vue'
import { appendToInput } from '../host/input'
import { copyText } from '../host/clipboard'
import { authorDice, type DiceBackend } from '../library/runtime/dice'
import {
  EMPTY_BUILDER, addDie, authorFormula, builderText, canUseMode, commentFromLine, diceTotal, lineText, mergeGroups, removeDie, resultOf, stepMod,
  type Builder, type RollMode, type RollResult,
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

/** 作者读骰式的结果：读不了（附原因）、能拆成按钮（builder），或作者其他写法（builder 为 null，照样能掷）。 */
type Read = { ok: true; builder: Builder | null } | { ok: false; error: string }

/**
 * 自由掷骰（基本蓝图 §2.1.1 基础版）：骰式是唯一的真相。
 * 点骰子、加减值、优势劣势都只是在改骰式文字，只有 roll() 会出结果。
 * 骰式读取与掷骰都交给作者骰子程序（上位设计 §3.7），这里不解析、不出随机数。
 * 不改 HP、不扣资源、不写战役日志。
 */
export const useDiceStore = defineStore('dice', () => {
  let owner: string | null = null
  let backend: DiceBackend = authorDice
  /** 测试用：固定的已掷点数（按掷骰顺序消耗）；null 时由作者程序自己掷。 */
  let points: number[] | null = null
  let nextId = 1
  let readSeq = 0
  let reading: Promise<void> = Promise.resolve()
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
  const read = shallowRef<Read>({ ok: true, builder: EMPTY_BUILDER })
  /** 作者还没读完当前骰式。 */
  const pending = ref(false)
  const rollError = ref('')
  const error = computed(() => (read.value.ok ? rollError.value : read.value.error))
  const builder = computed<Builder>(() => (read.value.ok && read.value.builder) || EMPTY_BUILDER)
  const canMode = computed(() => read.value.ok && !!read.value.builder && canUseMode(read.value.builder))
  const canRoll = computed(() => read.value.ok && (read.value.builder ? diceTotal(read.value.builder) > 0 : true))

  /** 骰式文字变了：交给作者读（只认最后一次）。 */
  function refresh(): void {
    const seq = ++readSeq
    const value = text.value
    pending.value = true
    rollError.value = ''
    reading = backend.read(value).then(
      (r) => {
        if (seq !== readSeq) return
        read.value = !r.ok ? { ok: false, error: `骰式看不懂：${r.error}` } : r.simple ? { ok: true, builder: mergeGroups(r.dice, r.mod) } : { ok: true, builder: null }
      },
      (err: unknown) => {
        if (seq !== readSeq) return
        console.error('[trpg-assistant] 作者骰子程序读骰式失败', err)
        read.value = { ok: false, error: `骰子程序没有响应：${err instanceof Error ? err.message : String(err)}` }
      },
    ).finally(() => {
      if (seq === readSeq) pending.value = false
    })
  }

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
    refresh()
  }

  /** 测试用：固定已掷点数；传 null 恢复由作者程序掷。 */
  const setPoints = (next: number[] | null): void => {
    points = next
  }
  /** 测试用：换骰子后端；传 null 恢复作者骰子程序。 */
  const setBackend = (next: DiceBackend | null): void => {
    backend = next ?? authorDice
    refresh()
  }

  /** 改骰式文字。按钮改的骰式是从已知的各组骰子排出来的，先直接用；作者读完再确认。 */
  function edit(next: string, known?: Builder): void {
    text.value = next
    persist()
    refresh()
    if (known) read.value = { ok: true, builder: known }
  }

  /** 按钮改骰式：用作者刚读出的各组骰子；手写的其他写法加骰子时接在后面，减骰子和调加值不动它。 */
  const byButton = (change: (b: Builder) => Builder, other?: () => string): void => {
    const base = read.value.ok ? read.value.builder : EMPTY_BUILDER
    if (base) {
      const next = change(base)
      edit(builderText(next), next)
    } else if (other) edit(other())
  }
  const addOne = (sides: number): void => byButton((b) => addDie(b, sides), () => `${text.value.trim()} + 1d${sides}`)
  const removeOne = (sides: number): void => byButton((b) => removeDie(b, sides))
  const step = (delta: number): void => byButton((b) => stepMod(b, delta))
  const clear = (): void => {
    text.value = ''
    mode.value = 'normal'
    persist()
    refresh()
    read.value = { ok: true, builder: EMPTY_BUILDER }
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

  /** 掷骰：唯一会出结果的动作，交给作者骰子程序掷。骰式不合法、没有骰子或作者掷不了时返回 null（原因在 error）。 */
  async function roll(): Promise<RollRecord | null> {
    await reading
    if (!canRoll.value || !read.value.ok) return null
    const effective: RollMode = canMode.value ? mode.value : 'normal'
    const b = read.value.builder
    const plan = b ? authorFormula(b, effective) : { formula: text.value, groups: null }
    const formulaText = b ? builderText(b) : text.value.trim()
    let rolled
    try {
      rolled = await backend.roll(plan.formula, points ?? undefined)
    } catch (err) {
      console.error('[trpg-assistant] 作者骰子程序掷骰失败', err)
      rollError.value = `骰子程序没有响应：${err instanceof Error ? err.message : String(err)}`
      return null
    }
    if (rolled.status !== 'complete') {
      rollError.value = rolled.status === 'missing' ? `已给的骰点不够，还要一颗 d${rolled.missing.dice.max}` : rolled.status === 'unsupported' ? rolled.reason : `掷骰出错：${rolled.error}`
      return null
    }
    rollError.value = ''
    const result: RollResult = resultOf({ formula: plan.formula, groups: plan.groups, mod: b?.mod ?? 0, mode: effective }, rolled)
    const rec: RollRecord = {
      id: nextId++,
      at: Date.now(),
      note: note.value.trim(),
      expression: result.expression,
      formula: formulaText,
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
    refresh()
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
    text, mode, note, history, last, lastResult, fillState, copied, error, builder, canMode, canRoll, pending,
    setOwner, setPoints, setBackend, addOne, removeOne, step, clear, setText, setMode, setNote, roll, loadRecord, clearHistory, fill, copy, commentOf,
  }
})
