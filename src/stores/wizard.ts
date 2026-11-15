import { defineStore } from 'pinia'
import { computed, ref, shallowRef } from 'vue'
import { refKey } from '../core/saves/split'
import type { EntryRef } from '../library/scopes'
import { EXTRA_KINDS } from '../rules/kernel/build-options'
import { ruleKernel } from '../rules/kernel/adapters'
import type { BuildOptionsItem, BuildPick } from '../rules/kernel/runtime'
import { nameOf } from '../ui/libview/pack-data'
import { useAppStore } from './app'
import { useCampaignStore } from './campaign'
import { CATEGORIES, useRosterStore, type CategoryId } from './roster'

/** 一条能选的条目（库里取，或后端给的候选）。 */
export interface PickRow { key: string; ref: EntryRef; name: string; source: string | null }
/** 一件条目带来的一步（后端 buildOptions 的 steps 里要玩家选的那些）。 */
export interface ChoiceStep { id: string; level: number | null; type: string; title: string | null; options: Record<string, any> } // eslint-disable-line @typescript-eslint/no-explicit-any -- 后端按进阶类型给的选项，界面按 kind 读
export interface Todo { text: string; go: string }

const stepKey = (s: { id: string; level: number | null }): string => `${s.id}@${s.level ?? ''}`
const rowOf = (ref: EntryRef, name: string, source: string | null): PickRow => ({ key: refKey(ref), ref, name, source })

/**
 * 分步建卡的状态：步骤由规则数据 kernel.build 和后端「额外必选项」决定（子职业 / 专长 / 可选特性按数据才出现）；
 * 每件条目要玩家选的事和候选都来自后端 people.buildOptions；界面只记「选了谁、每一步选了什么」，创建时交给 people.build。
 * 关掉窗口 = 直接丢掉（驾驶员定，半成品不存）。
 */
export const useWizardStore = defineStore('wizard', () => {
  const app = useAppStore()
  const campaign = useCampaignStore()
  const roster = useRosterStore()

  const build = ref<string[]>([])
  const names = ref<Record<string, string>>({})
  const name = ref('')
  const category = ref<CategoryId>('party')
  const cur = ref('name')
  const chosen = ref<Record<string, EntryRef[]>>({})
  /** 玩家在每一步里的选择：条目键 → 步骤键 → 界面状态（Trait = 每个位置选了哪些值；能力值 = 每项加几点）。 */
  const sel = ref<Record<string, Record<string, any>>>({}) // eslint-disable-line @typescript-eslint/no-explicit-any -- 两种形状按 kind 区分
  const options = shallowRef<BuildOptionsItem[] | null>(null)
  const optLoading = ref(false)
  const optError = ref<string | null>(null)
  const lists = shallowRef<Record<string, PickRow[]>>({})
  const creating = ref(false)
  const createError = ref<string | null>(null)
  let seq = 0
  let lastSent = ''

  const owner = (): string => campaign.owner?.ownerKey ?? ''
  const mainProps = computed(() => build.value.filter((p) => !(EXTRA_KINDS as readonly string[]).includes(p)))
  const items = computed<EntryRef[]>(() => build.value.flatMap((p) => chosen.value[p] ?? []))
  const optionsFor = (ref: EntryRef): BuildOptionsItem | null => options.value?.find((i) => refKey(i.ref) === refKey(ref)) ?? null

  /** 某种额外必选项（按数据）：要选几个、候选是谁；没有 = 这一步不出现。 */
  function extra(prop: string): { title: string; count: number; candidates: PickRow[] } | null {
    const all = (options.value ?? []).flatMap((i) => i.extras.filter((x) => x.kind === prop))
    if (!all.length) return null
    const seen = new Set<string>()
    const candidates = all.flatMap((x) => x.candidates).map((c) => rowOf(c.ref, c.name, c.source)).filter((r) => !seen.has(r.key) && !!seen.add(r.key))
    return { title: all[0].title, count: all.reduce((n, x) => n + x.count, 0), candidates }
  }
  const steps = computed(() => ['name', ...mainProps.value, ...build.value.filter((p) => (EXTRA_KINDS as readonly string[]).includes(p) && extra(p)), 'done'])
  const label = (id: string): string => id === 'name' ? '名字' : id === 'done' ? '完成' : names.value[id] ?? id
  const need = (id: string): number => (EXTRA_KINDS as readonly string[]).includes(id) ? extra(id)?.count ?? 0 : 1

  /** 一件条目里要玩家选的步骤（不用选的、自动的不在这里）。 */
  function choicesOf(ref: EntryRef): ChoiceStep[] {
    return (optionsFor(ref)?.steps as ChoiceStep[] | undefined ?? []).filter((s) => s.options)
  }
  const needOf = (step: ChoiceStep): number => step.options.kind === 'asi' ? Number(step.options.points) : (step.options.slots as Array<{ count: number }>).reduce((n, s) => n + s.count, 0)
  const haveOf = (ref: EntryRef, step: ChoiceStep): number => {
    const v = sel.value[refKey(ref)]?.[stepKey(step)]
    if (!v) return 0
    return step.options.kind === 'asi' ? Object.values(v as Record<string, number>).reduce((n, x) => n + x, 0) : (v as string[][]).reduce((n, s) => n + s.length, 0)
  }
  /** 这一步选满了就交给后端的选择（官方进阶要的样子）；没选满 = 不交，后端取第一个可选项。 */
  function pickOf(ref: EntryRef, step: ChoiceStep): BuildPick | null {
    if (haveOf(ref, step) < needOf(step)) return null
    const v = sel.value[refKey(ref)][stepKey(step)]
    if (step.options.kind === 'asi') {
      const assignments: Record<string, number> = { ...(step.options.fixed as Record<string, number>) }
      for (const [k, n] of Object.entries(v as Record<string, number>)) if (n) assignments[k] = (assignments[k] ?? 0) + n
      return { id: step.id, level: step.level, value: { type: 'asi', assignments } }
    }
    const grants = (step.options.grants as Array<{ value: string }>).map((g) => g.value)
    return { id: step.id, level: step.level, value: { chosen: [...grants, ...(v as string[][]).flat()] } }
  }
  const picks = computed<BuildPick[][]>(() => items.value.map((ref) => choicesOf(ref).map((s) => pickOf(ref, s)).filter((p): p is BuildPick => !!p)))

  async function refreshOptions(): Promise<void> {
    const body = { items: items.value, picks: picks.value }
    const sent = JSON.stringify(body)
    if (sent === lastSent) return
    lastSent = sent
    const mine = ++seq
    if (!items.value.length) { options.value = null; return }
    optLoading.value = true
    try {
      const out = await app.svc().backend.people.buildOptions(owner(), body)
      if (mine !== seq) return
      if (out.status !== 'complete' || !out.items) throw new Error(out.error ?? `读取选项失败（${out.status}）`)
      options.value = out.items
      optError.value = null
      // 条目换了、步骤没了：丢掉对不上的选择
      for (const ref of items.value) {
        const keep = new Set(choicesOf(ref).map(stepKey))
        const mineSel = sel.value[refKey(ref)] ?? {}
        for (const k of Object.keys(mineSel)) if (!keep.has(k)) delete mineSel[k]
      }
      // 额外必选项没了（换了职业）：丢掉已选的子职业 / 专长 / 可选特性
      for (const p of build.value) if ((EXTRA_KINDS as readonly string[]).includes(p) && !extra(p)) delete chosen.value[p]
    } catch (e) {
      if (mine === seq) { optError.value = e instanceof Error ? e.message : String(e); lastSent = '' }
    } finally {
      if (mine === seq) optLoading.value = false
    }
  }

  async function open(startView: string): Promise<void> {
    seq++; lastSent = ''
    name.value = ''; cur.value = 'name'; chosen.value = {}; sel.value = {}; options.value = null; optError.value = null; createError.value = null; creating.value = false
    category.value = CATEGORIES.some((c) => c.id === startView) ? startView as CategoryId : 'party'
    const lib = await app.svc().backend.kernelSave.libraryOf(owner())
    build.value = [...(ruleKernel(lib.rule)?.build ?? [])]
    try {
      const types = await app.svc().backend.library.custom.entryTypes(lib.codeSet)
      names.value = Object.fromEntries(types.map((t) => [t.prop, t.name]))
    } catch (e) { console.error('[trpg-assistant] 读取类别名失败', e); names.value = {} }
  }

  /** 库里这一类的全部条目（种族 / 背景 / 职业）；读过就缓存。 */
  async function loadList(prop: string): Promise<PickRow[]> {
    if (lists.value[prop]) return lists.value[prop]
    const lib = await app.svc().backend.kernelSave.libraryOf(owner())
    const rows = await app.svc().backend.library.scoped.query(lib, prop, { mode: 'browse' })
    const out = rows.map((r) => rowOf(r.ref, nameOf(r.item), (r.source as string | null) ?? null)).sort((a, b) => a.name.localeCompare(b.name, 'zh'))
    lists.value = { ...lists.value, [prop]: out }
    return out
  }

  /** 选 / 取消选一条（单选的会换掉原来的）。 */
  function choose(prop: string, row: PickRow, count: number): void {
    const now = chosen.value[prop] ?? []
    const has = now.some((r) => refKey(r) === row.key)
    chosen.value = { ...chosen.value, [prop]: has ? now.filter((r) => refKey(r) !== row.key) : count === 1 ? [row.ref] : now.length < count ? [...now, row.ref] : now }
    // 换了人：他的旧选择不要
    for (const k of Object.keys(sel.value)) if (!items.value.some((r) => refKey(r) === k)) delete sel.value[k]
    void refreshOptions()
  }
  const isChosen = (prop: string, key: string): boolean => (chosen.value[prop] ?? []).some((r) => refKey(r) === key)

  function setSlot(ref: EntryRef, step: ChoiceStep, slot: number, value: string): void {
    const k = refKey(ref); const sk = stepKey(step)
    const slots = (step.options.slots as Array<{ count: number }>)
    const cur0: string[][] = sel.value[k]?.[sk] ?? slots.map(() => [])
    const mine = cur0[slot] ?? []
    cur0[slot] = mine.includes(value) ? mine.filter((v) => v !== value) : mine.length < slots[slot].count ? [...mine, value] : mine
    sel.value = { ...sel.value, [k]: { ...(sel.value[k] ?? {}), [sk]: cur0 } }
    void refreshOptions()
  }
  function bumpAsi(ref: EntryRef, step: ChoiceStep, ability: string, delta: number): void {
    const k = refKey(ref); const sk = stepKey(step)
    const now: Record<string, number> = { ...(sel.value[k]?.[sk] ?? {}) }
    const cap = Number(step.options.cap) || Number(step.options.points)
    const next = (now[ability] ?? 0) + delta
    if (next < 0 || next > cap || haveOf(ref, step) + delta > Number(step.options.points)) return
    now[ability] = next
    sel.value = { ...sel.value, [k]: { ...(sel.value[k] ?? {}), [sk]: now } }
    void refreshOptions()
  }

  const todo = computed<Todo[]>(() => {
    const out: Todo[] = []
    for (const p of mainProps.value) if (!(chosen.value[p] ?? []).length) out.push({ text: `还没选${label(p)}`, go: p })
    for (const p of build.value) {
      const e = (EXTRA_KINDS as readonly string[]).includes(p) ? extra(p) : null
      if (e && (chosen.value[p] ?? []).length < e.count) out.push({ text: `${label(p)}还差 ${e.count - (chosen.value[p] ?? []).length} 个`, go: p })
    }
    for (const p of build.value) for (const ref of chosen.value[p] ?? []) for (const s of choicesOf(ref)) {
      const left = needOf(s) - haveOf(ref, s)
      if (left > 0) out.push({ text: `${optionsFor(ref)?.name ?? ''}：${s.title ?? ''} 还差 ${left}`, go: p })
    }
    return out
  })
  const status = (id: string): 'done' | 'todo' => id === 'name' ? (name.value.trim() ? 'done' : 'todo') : id === 'done' ? 'todo' : (chosen.value[id] ?? []).length >= need(id) ? 'done' : 'todo'

  async function create(): Promise<boolean> {
    if (!name.value.trim()) { createError.value = '先给人物起个名字'; return false }
    creating.value = true; createError.value = null
    try {
      const ok = await roster.createFromWizard({ name: name.value.trim(), items: items.value, picks: picks.value }, category.value)
      if (!ok) createError.value = '没建成，原因见提示条'
      return ok
    } finally { creating.value = false }
  }
  const go = (id: string): void => { cur.value = id }
  const move = (delta: number): void => { const i = steps.value.indexOf(cur.value); cur.value = steps.value[Math.max(0, Math.min(steps.value.length - 1, i + delta))] }

  return { build, names, name, category, cur, chosen, sel, options, optLoading, optError, lists, creating, createError, mainProps, items, steps, picks, todo,
    open, loadList, choose, isChosen, extra, label, status, choicesOf, needOf, haveOf, optionsFor, setSlot, bumpAsi, refreshOptions, create, go, move }
})
