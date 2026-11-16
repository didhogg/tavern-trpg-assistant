import { computed, ref, shallowRef, type ComputedRef } from 'vue'
import type { EntryRef } from '../library/scopes'
import { authorDice } from '../library/runtime/dice'
import type { StartingResult, StartingSection, StartingSelection } from '../rules/kernel/starting-options'
import { useAppStore } from './app'
import { equipmentTypeLabel } from '../ui/roster/wizard-labels'

export interface EquipTodo { text: string }

/**
 * 分步建卡的「装备」：选项、类别候选、预演（物品和钱）都来自后端 people.startingEquipment（已按本战役的书 / 包 / 单条启用停用筛过）；
 * 界面只记玩家选了什么（选项、类别槽里的物品、要不要金币），交给后端；金币的骰子走项目的骰子后端。关掉窗口直接丢掉。
 */
export function createEquipment(deps: { items: ComputedRef<EntryRef[]>; owner: () => string; nameOf: (key: string) => string }) {
  const app = useAppStore()
  /** 每个条目（职业 / 背景，按条目键）上玩家的选择。 */
  const sel = ref<Record<string, StartingSelection>>({})
  const result = shallowRef<StartingResult | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const goldNote = ref<Record<string, string>>({})
  let seq = 0
  let lastSent = ''

  const sections = computed<StartingSection[]>(() => result.value?.sections ?? [])
  const preview = computed(() => result.value?.preview ?? null)
  const sectionOf = (key: string): StartingSection | undefined => sections.value.find((s) => s.refKey === key)

  async function refresh(): Promise<void> {
    const body = { items: deps.items.value, starting: JSON.parse(JSON.stringify(sel.value)) as Record<string, StartingSelection> }
    const sent = JSON.stringify(body)
    if (sent === lastSent) return
    lastSent = sent
    const mine = ++seq
    if (!body.items.length) { result.value = null; return }
    loading.value = true
    try {
      const out = await app.svc().backend.people.startingEquipment(deps.owner(), body)
      if (mine !== seq) return
      if (out.status !== 'complete') throw new Error(out.error ?? `读取起始装备失败（${out.status}）`)
      result.value = out
      error.value = null
      // 换了职业 / 背景：丢掉对不上的选择
      const keep = new Set(out.sections?.map((s) => s.refKey))
      for (const k of Object.keys(sel.value)) if (!keep.has(k)) delete sel.value[k]
    } catch (e) {
      if (mine === seq) { error.value = e instanceof Error ? e.message : String(e); lastSent = '' }
    } finally {
      if (mine === seq) loading.value = false
    }
  }
  const retry = (): Promise<void> => { lastSent = ''; return refresh() }
  function reset(): void { seq++; lastSent = ''; sel.value = {}; result.value = null; loading.value = false; error.value = null; goldNote.value = {} }

  const mineOf = (key: string): StartingSelection => (sel.value[key] ??= {})
  const groupKeys = (g: StartingSection['groups'][number]): string[] => g.choices.map((c) => c.key)
  /** 这一组选了哪一项：只有一项的自动算选了。 */
  const chosenKey = (key: string, g: StartingSection['groups'][number]): string | null => g.choices.length === 1 ? g.choices[0].key : sel.value[key]?.choice?.[String(g.index)] ?? null
  const isOption = (key: string, group: number, choice: string): boolean => sel.value[key]?.choice?.[String(group)] === choice
  const slotKey = (g: number, choice: string, entry: number, n: number): string => `${g}.${choice}.${entry}.${n}`
  const pickedAt = (key: string, k: string): string | null => sel.value[key]?.pick?.[k] ?? null
  const goldOf = (key: string): number | null => sel.value[key]?.gold ?? null

  function chooseOption(key: string, group: number, choice: string): void {
    const m = mineOf(key); m.choice = { ...(m.choice ?? {}), [String(group)]: choice }; void refresh()
  }
  function pickSlot(key: string, k: string, uid: string | null): void {
    const m = mineOf(key); const next = { ...(m.pick ?? {}) }
    if (uid) next[k] = uid; else delete next[k]
    m.pick = next; void refresh()
  }
  function setGold(key: string, gp: number | null, note = ''): void {
    const m = mineOf(key)
    if (gp === null || Number.isNaN(gp)) delete m.gold; else m.gold = Math.max(0, Math.round(gp))
    goldNote.value = { ...goldNote.value, [key]: gp === null ? '' : note }
    void refresh()
  }
  /** 掷起始金币：骰式由后端给，掷骰走项目的骰子后端。 */
  async function rollGold(key: string, expression: string): Promise<void> {
    const out = await authorDice.roll(expression)
    if (out.status !== 'complete') { error.value = `掷不出「${expression}」：${out.status === 'error' ? out.error : out.status}`; return }
    setGold(key, out.total, `掷 ${expression} = ${out.total}`)
  }

  const todo = computed<EquipTodo[]>(() => {
    const out: EquipTodo[] = []
    for (const s of sections.value) {
      if (goldOf(s.refKey) !== null) continue
      const who = deps.nameOf(s.refKey)
      for (const g of s.groups) {
        const k = chosenKey(s.refKey, g)
        if (k === null) {
          out.push({ text: `${who}：${g.choices.map((c) => c.entries.map((e) => e.label ?? e.text ?? e.name ?? '').filter(Boolean).join('＋')).join(' 或 ')} 还没选` })
          continue
        }
        for (const e of g.choices.find((c) => c.key === k)?.entries ?? []) {
          if (e.kind !== 'category') continue
          for (let i = 0; i < e.quantity; i++) if (!pickedAt(s.refKey, slotKey(g.index, k, e.index, i))) out.push({ text: `${who}：任选${(e.types ?? []).map(equipmentTypeLabel).join('或')} 还没选` })
        }
      }
    }
    return out
  })

  /** 交给 people.build 的 starting：没碰过也要交（固定给的物品照给，没选的组留空）。 */
  const forBuild = (): Record<string, StartingSelection> | undefined => sections.value.length ? JSON.parse(JSON.stringify(sel.value)) : undefined

  return { nameOf: deps.nameOf, sel, result, sections, preview, loading, error, goldNote, todo, refresh, retry, reset, sectionOf, groupKeys, chosenKey, isOption, slotKey, pickedAt, goldOf, chooseOption, pickSlot, setGold, rollGold, forBuild }
}
