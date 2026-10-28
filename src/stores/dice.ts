import { defineStore } from 'pinia'
import { ref } from 'vue'
import { appendToInput } from '../host/input'
import { copyText } from '../host/clipboard'
import { commentFromLine, cryptoRng, lineText, rollDice, type Rng, type RollMode, type RollResult } from '../rules/dice'

export interface RollRecord {
  id: number
  at: number
  note: string
  expression: string
  mode: RollMode
  total: number
  line: string
  natural?: 20 | 1
}

export const HISTORY_MAX = 20
export const BONUS_MIN = -20
export const BONUS_MAX = 30
const KEY = 'trpg-assistant:dice'

interface Saved { history: RollRecord[]; bonus: number; mode: RollMode; note: string }

function storageKey(owner: string | null): string {
  return owner ? `${KEY}:${owner}` : KEY
}

function load(owner: string | null): Saved {
  const empty: Saved = { history: [], bonus: 0, mode: 'normal', note: '' }
  try {
    const raw = localStorage.getItem(storageKey(owner))
    if (!raw) return empty
    const data = JSON.parse(raw) as Partial<Saved>
    return {
      history: Array.isArray(data.history) ? data.history.slice(0, HISTORY_MAX) : [],
      bonus: Number.isFinite(data.bonus) ? Math.min(BONUS_MAX, Math.max(BONUS_MIN, data.bonus as number)) : 0,
      mode: data.mode === 'adv' || data.mode === 'dis' ? data.mode : 'normal',
      note: typeof data.note === 'string' ? data.note : '',
    }
  } catch (error) {
    console.warn('[trpg-assistant] 读取掷骰记录失败', error)
    return empty
  }
}

/** 自由掷骰（基本蓝图 §2.1.1 基础版）：不改 HP、不扣资源、不写战役日志。 */
export const useDiceStore = defineStore('dice', () => {
  let owner: string | null = null
  let rng: Rng = cryptoRng
  let nextId = 1
  let fillTimer: ReturnType<typeof setTimeout> | undefined

  const initial = load(null)
  const history = ref<RollRecord[]>(initial.history)
  const bonus = ref(initial.bonus)
  const mode = ref<RollMode>(initial.mode)
  const note = ref(initial.note)
  const expression = ref('')
  const last = ref<RollRecord | null>(null)
  const error = ref('')
  const fillState = ref<'idle' | 'done' | 'failed'>('idle')
  const copied = ref(false)

  function persist(): void {
    try {
      localStorage.setItem(storageKey(owner), JSON.stringify({ history: history.value, bonus: bonus.value, mode: mode.value, note: note.value }))
    } catch (err) {
      console.warn('[trpg-assistant] 保存掷骰记录失败', err)
    }
  }

  /** 记录按角色卡 / 群组分开保存；切换聊天时重新载入。 */
  function setOwner(key: string | null): void {
    owner = key
    const saved = load(key)
    history.value = saved.history
    bonus.value = saved.bonus
    mode.value = saved.mode
    note.value = saved.note
    last.value = null
    error.value = ''
  }

  function setRng(next: Rng): void {
    rng = next
  }

  function record(result: RollResult): RollRecord {
    const rec: RollRecord = {
      id: nextId++,
      at: Date.now(),
      note: note.value.trim(),
      expression: result.expression,
      mode: result.mode,
      total: result.total,
      line: lineText(result),
      ...(result.natural ? { natural: result.natural } : {}),
    }
    last.value = rec
    history.value = [rec, ...history.value].slice(0, HISTORY_MAX)
    fillState.value = 'idle'
    copied.value = false
    error.value = ''
    persist()
    return rec
  }

  function rollQuick(sides: number): RollRecord {
    const isD20 = sides === 20
    return record(rollDice(`1d${sides}`, { rng, mode: isD20 ? mode.value : 'normal', bonus: isD20 ? bonus.value : 0 }))
  }

  /** 按输入框里的骰式掷；骰式不合法时返回 null，原因写在 error。 */
  function rollExpression(): RollRecord | null {
    try {
      return record(rollDice(expression.value, { rng, mode: mode.value }))
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err)
      return null
    }
  }

  function reroll(rec: RollRecord): RollRecord {
    return record(rollDice(rec.expression, { rng, mode: rec.mode }))
  }

  function setBonus(value: number): void {
    bonus.value = Math.min(BONUS_MAX, Math.max(BONUS_MIN, Math.round(value)))
    persist()
  }

  function setMode(value: RollMode): void {
    mode.value = value
    persist()
  }

  function setNote(value: string): void {
    note.value = value
    persist()
  }

  function clearHistory(): void {
    history.value = []
    persist()
  }

  const commentOf = (rec: RollRecord): string => commentFromLine(rec.line, rec.note)

  /** 把最近一次结果以注释追加到酒馆输入框；失败时保留结果，可再试或复制。 */
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
    history, bonus, mode, note, expression, last, error, fillState, copied,
    setOwner, setRng, rollQuick, rollExpression, reroll, setBonus, setMode, setNote, clearHistory, fill, copy, commentOf,
  }
})
