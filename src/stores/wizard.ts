import { defineStore } from 'pinia'
import { computed, ref, shallowRef } from 'vue'
import { refKey } from '../core/saves/split'
import type { EntryRef } from '../library/scopes'
import { EXTRA_KINDS } from '../rules/kernel/build-options'
import { ruleKernel } from '../rules/kernel/adapters'
import type { AbilityMethod } from '../rules/kernel/ability-rules'
import type { BuildAbilities, BuildOptionsItem, BuildPick } from '../rules/kernel/runtime'
import { askConfirm } from '../ui/kit/confirm'
import { createEquipment } from './wizard-equipment'
import { nameOf } from '../ui/libview/pack-data'
import { useAppStore } from './app'
import { useCampaignStore } from './campaign'
import { CATEGORIES, useRosterStore, type CategoryId } from './roster'

/** 一条能选的条目（库里取，或后端给的候选）。 */
export interface PickRow { key: string; ref: EntryRef; name: string; source: string | null; requirement?: string }
/** 额外必选项的一组（后端给组名、来自哪件条目、选几个、候选）：同一类可以有几组（起源专长 / 战斗风格），每组各选各的。 */
export interface ExtraGroup { key: string; title: string; from: string | null; count: number; candidates: PickRow[]; unfiltered: boolean }
/** 一件条目带来的一步（后端 buildOptions 的 steps 里要玩家选的那些）。 */
export interface ChoiceStep { id: string; level: number | null; type: string; title: string | null; hint?: string; options: Record<string, any> } // eslint-disable-line @typescript-eslint/no-explicit-any -- 后端按进阶类型给的选项，界面按 kind 读
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
  /** 额外必选项每组选了谁：组键 → 条目键；chosen 里这一类 = 各组合起来（创建时一起交，后端按组复核）。 */
  const extraSel = ref<Record<string, string[]>>({})
  /** 玩家在每一步里的选择：条目键 → 步骤键 → 界面状态（Trait = 每个位置选了哪些值；能力值 = 每项加几点）。 */
  const traitPlan = ref<Record<string, string>>({})
  const sel = ref<Record<string, Record<string, any>>>({}) // eslint-disable-line @typescript-eslint/no-explicit-any -- 两种形状按 kind 区分
  const options = shallowRef<BuildOptionsItem[] | null>(null)
  /** 属性值：方式 + 每项放了几（没放 = 没有这个键）；「基础 + 加成 = 合计」和检查结果都由后端按这两样给。 */
  const abilMethod = ref<AbilityMethod>('standardArray')
  const abilBase = ref<Record<string, number>>({})
  const abil = shallowRef<BuildAbilities | null>(null)
  /** 标准数组：手里拿着的那个数（点一项属性放进去）。 */
  const holding = ref<number | null>(null)
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
  const equip = createEquipment({ items, owner, nameOf: (key) => { const ref = items.value.find((r) => refKey(r) === key); return (ref && optionsFor(ref)?.name) || key } })

  /** 某种额外必选项（按数据）：分几组、每组选几个、候选是谁，全按后端给；没有 = 这一步不出现。 */
  function extra(prop: string): { count: number; groups: ExtraGroup[] } | null {
    const groups = (options.value ?? []).flatMap((i) => i.extras.filter((x) => x.kind === prop).map((x): ExtraGroup => ({
      key: `${refKey(i.ref)}|${x.id}`, title: x.title, from: i.name, count: x.count, unfiltered: !!x.unfiltered,
      candidates: x.candidates.map((c) => ({ ...rowOf(c.ref, c.name, c.source), ...(c.requirement ? { requirement: c.requirement } : {}) })),
    })))
    return groups.length ? { count: groups.reduce((n, g) => n + g.count, 0), groups } : null
  }
  const pickedIn = (group: ExtraGroup): string[] => extraSel.value[group.key] ?? []
  /** 这一条已经在同一类的哪一组里选了（同一条不能占两组）。 */
  const takenBy = (prop: string, key: string): ExtraGroup | null => extra(prop)?.groups.find((g) => pickedIn(g).includes(key)) ?? null
  /** 按后端现在给的组整理：组没了、候选没了（关掉 / 换了职业）的选择丢掉；再合成 chosen。改了就返回 true。 */
  function syncExtras(): boolean {
    let changed = false
    for (const p of build.value) {
      if (!(EXTRA_KINDS as readonly string[]).includes(p)) continue
      const groups = extra(p)?.groups ?? []
      const refs: EntryRef[] = []
      for (const g of groups) for (const k of pickedIn(g)) { const row = g.candidates.find((c) => c.key === k); if (row) refs.push(row.ref) }
      const before = (chosen.value[p] ?? []).map(refKey).join()
      if (refs.map(refKey).join() !== before) changed = true
      if (refs.length) chosen.value = { ...chosen.value, [p]: refs }; else if (chosen.value[p]) { const next = { ...chosen.value }; delete next[p]; chosen.value = next }
    }
    const live = new Set(build.value.flatMap((p) => extra(p)?.groups.map((g) => g.key) ?? []))
    for (const k of Object.keys(extraSel.value)) if (!live.has(k)) { delete extraSel.value[k]; changed = true }
    return changed
  }
  const steps = computed(() => ['name', ...mainProps.value, ...build.value.filter((p) => (EXTRA_KINDS as readonly string[]).includes(p) && extra(p)), ...(abil.value ? ['abilities'] : []), ...(equip.sections.value.length ? ['equipment'] : []), 'done'])
  const label = (id: string): string => id === 'name' ? '名字' : id === 'done' ? '完成' : id === 'abilities' ? '属性值' : id === 'equipment' ? '装备' : names.value[id] ?? id
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
  /** 玩家在这一步的选择（界面读它，不自己拼键）：候选类 = 每个位置选了哪些；属性提升 = 每项加几点。 */
  const selOf = (ref: EntryRef, step: ChoiceStep): any => sel.value[refKey(ref)]?.[stepKey(step)] // eslint-disable-line @typescript-eslint/no-explicit-any -- 两种形状按 kind 区分
  /** 还差几个：属性提升按后端算好的剩余点数；候选类按玩家点了几个。 */
  const leftOf = (ref: EntryRef, step: ChoiceStep): number => step.options.kind === 'asi' ? Number(step.options.left) : needOf(step) - haveOf(ref, step)
  /** 这一步玩家已选的（选了几个交几个）；一个都没选 = 不交，后端留空。属性提升只交玩家加的点，固定加值由后端合并。 */
  function pickOf(ref: EntryRef, step: ChoiceStep): BuildPick | null {
    const plan = step.options.plans?.[0]?.id
    const preferred = plan && traitPlan.value[`${refKey(ref)}|${plan}`]
    if (preferred && preferred !== step.id) return { id: preferred, level: step.level, value: { chosen: [] } }
    if (haveOf(ref, step) === 0) return preferred ? { id: step.id, level: step.level, value: { chosen: [] } } : null
    const v = sel.value[refKey(ref)][stepKey(step)]
    if (step.options.kind === 'asi') return { id: step.id, level: step.level, value: { type: 'asi', chosen: { ...(v as Record<string, number>) } } }
    const grants = (step.options.grants as Array<{ value: string }>).map((g) => g.value)
    return { id: step.id, level: step.level, value: { chosen: [...grants, ...(v as string[][]).flat()] } }
  }
  const picks = computed<BuildPick[][]>(() => items.value.map((ref) => choicesOf(ref).map((s) => pickOf(ref, s)).filter((p): p is BuildPick => !!p)))

  const abilPlan = () => ({ method: abilMethod.value, base: { ...abilBase.value } })

  async function refreshOptions(): Promise<void> {
    const body = { items: items.value, picks: picks.value, blank: true, abilities: abilPlan() }
    const sent = JSON.stringify(body)
    if (sent === lastSent) return
    lastSent = sent
    const mine = ++seq
    if (!items.value.length) { options.value = null; abil.value = null; return }
    optLoading.value = true
    try {
      const out = await app.svc().backend.people.buildOptions(owner(), body)
      if (mine !== seq) return
      if (out.status !== 'complete' || !out.items) throw new Error(out.error ?? `读取选项失败（${out.status}）`)
      options.value = out.items
      abil.value = out.abilities ?? null
      optError.value = null
      // 条目换了、步骤没了：丢掉对不上的选择
      for (const ref of items.value) {
        const keep = new Set(choicesOf(ref).map(stepKey))
        const mineSel = sel.value[refKey(ref)] ?? {}
        for (const k of Object.keys(mineSel)) if (!keep.has(k)) delete mineSel[k]
      }
      // 额外必选项的组或候选没了（换了职业 / 关掉了）：丢掉对不上的选择，再按新选择重算一次
      if (syncExtras()) void refreshOptions()
    } catch (e) {
      if (mine === seq) { optError.value = e instanceof Error ? e.message : String(e); lastSent = '' }
    } finally {
      if (mine === seq) optLoading.value = false
    }
  }

  async function open(startView: string): Promise<void> {
    seq++; lastSent = ''
    lists.value = {} // 候选列表每次打开重读：本战役开关、换战役后要跟全局搜索一致
    name.value = ''; cur.value = 'name'; chosen.value = {}; extraSel.value = {}; sel.value = {}; traitPlan.value = {}; abilMethod.value = 'standardArray'; abilBase.value = {}; abil.value = null; holding.value = null; equip.reset(); options.value = null; optError.value = null; createError.value = null; creating.value = false
    category.value = CATEGORIES.some((c) => c.id === startView) ? startView as CategoryId : 'party'
    const lib = await app.svc().backend.kernelSave.libraryOf(owner())
    build.value = [...(ruleKernel(lib.rule)?.build ?? [])]
    try {
      const types = await app.svc().backend.library.custom.entryTypes(lib.codeSet)
      names.value = Object.fromEntries(types.map((t) => [t.prop, t.name]))
    } catch (e) { console.error('[trpg-assistant] 读取类别名失败', e); names.value = {} }
  }

  /** 本战役能选的这一类条目（种族 / 背景 / 职业）：和全局搜索同一个查询，关着的不出现；读过就缓存。 */
  async function loadList(prop: string): Promise<PickRow[]> {
    if (lists.value[prop]) return lists.value[prop]
    const lib = await app.svc().backend.kernelSave.libraryOf(owner())
    const rows = await app.svc().backend.library.scoped.query(lib, prop)
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
    void refreshOptions(); void equip.refresh()
  }
  /** 额外必选项：在某一组里选 / 取消选一条（这一组选 1 个时换掉原来的；同一条已在别的组里选了就不动）。 */
  function chooseExtra(prop: string, group: ExtraGroup, row: PickRow): void {
    const now = pickedIn(group)
    const owner = takenBy(prop, row.key)
    if (owner && owner.key !== group.key) return
    extraSel.value = { ...extraSel.value, [group.key]: now.includes(row.key) ? now.filter((k) => k !== row.key) : group.count === 1 ? [row.key] : now.length < group.count ? [...now, row.key] : now }
    syncExtras()
    for (const k of Object.keys(sel.value)) if (!items.value.some((r) => refKey(r) === k)) delete sel.value[k]
    void refreshOptions(); void equip.refresh()
  }
  const isChosen = (prop: string, key: string): boolean => (chosen.value[prop] ?? []).some((r) => refKey(r) === key)

  function setTraitPlan(ref: EntryRef, step: ChoiceStep, id: string): void {
    if (!step.options.plans?.some((plan: { id: string }) => plan.id === id)) return
    const key = refKey(ref)
    traitPlan.value = { ...traitPlan.value, [`${key}|${step.options.plans[0].id}`]: id }
    if (sel.value[key]) delete sel.value[key][stepKey(step)]
    void refreshOptions()
  }

  function setSlot(ref: EntryRef, step: ChoiceStep, slot: number, value: string): void {
    const k = refKey(ref); const sk = stepKey(step)
    const slots = (step.options.slots as Array<{ count: number }>)
    const cur0: string[][] = sel.value[k]?.[sk] ?? slots.map(() => [])
    const mine = cur0[slot] ?? []
    cur0[slot] = mine.includes(value) ? mine.filter((v) => v !== value) : mine.length < slots[slot].count ? [...mine, value] : mine
    sel.value = { ...sel.value, [k]: { ...(sel.value[k] ?? {}), [sk]: cur0 } }
    void refreshOptions()
  }
  /** 属性提升加 / 减一点；能不能加由后端每行的 canAdd / canRemove 定（界面按它停用按钮）。 */
  function bumpAsi(ref: EntryRef, step: ChoiceStep, ability: string, delta: number): void {
    const k = refKey(ref); const sk = stepKey(step)
    const now: Record<string, number> = { ...(sel.value[k]?.[sk] ?? {}) }
    const row = (step.options.rows as Array<{ key: string; canAdd: boolean; canRemove: boolean }>).find((r) => r.key === ability)
    if (!row || (delta > 0 ? !row.canAdd : !row.canRemove)) return
    now[ability] = (now[ability] ?? 0) + delta
    sel.value = { ...sel.value, [k]: { ...(sel.value[k] ?? {}), [sk]: now } }
    void refreshOptions()
  }

  const unsetAbilities = computed(() => abil.value?.rows.filter((r) => !r.set) ?? [])
  /** 切换方式：已放的数会清掉，先问；购点从起点开始（起点由后端按规则表给）。 */
  async function setMethod(m: AbilityMethod): Promise<void> {
    if (m === abilMethod.value) return
    if (Object.keys(abilBase.value).length && !(await askConfirm({ title: '换一种方式', message: '换方式会清掉已经放好的数，重新来。', confirmLabel: '换' }))) return
    abilMethod.value = m; abilBase.value = {}; holding.value = null
    lastSent = ''; await refreshOptions()
    const start = abil.value?.check?.start
    if (m === 'pointBuy' && start !== undefined) { abilBase.value = Object.fromEntries((abil.value?.rows ?? []).map((r) => [r.key, start])); await refreshOptions() }
  }
  /** 标准数组：拿起 / 放下一个数；点已放的属性 = 收回。 */
  function hold(n: number): void { holding.value = holding.value === n ? null : n }
  function place(key: string): void {
    const next = { ...abilBase.value }
    if (holding.value !== null) { next[key] = holding.value; holding.value = null } else if (key in next) delete next[key]; else return
    abilBase.value = next; void refreshOptions()
  }
  /** 购点：到后端说的下一档 / 上一档。手填：直接写；空 = 清掉这一项。 */
  function setBase(key: string, value: number | null): void {
    const next = { ...abilBase.value }
    if (value === null || Number.isNaN(value)) delete next[key]; else next[key] = value
    abilBase.value = next; void refreshOptions()
  }

  const todo = computed<Todo[]>(() => {
    const out: Todo[] = []
    for (const p of mainProps.value) if (!(chosen.value[p] ?? []).length) out.push({ text: `还没选${label(p)}`, go: p })
    for (const p of build.value) {
      const groups = (EXTRA_KINDS as readonly string[]).includes(p) ? extra(p)?.groups ?? [] : []
      for (const g of groups) if (pickedIn(g).length < g.count) out.push({ text: `${g.title}还差 ${g.count - pickedIn(g).length} 个`, go: p })
    }
    for (const p of build.value) for (const ref of chosen.value[p] ?? []) for (const s of choicesOf(ref)) {
      const left = leftOf(ref, s)
      if (left > 0) out.push({ text: `${optionsFor(ref)?.name ?? ''}：${s.title ?? ''} 还差 ${left}`, go: p })
    }
    if (abil.value && unsetAbilities.value.length) out.push({ text: `属性值：还有 ${unsetAbilities.value.length} 项没放（${unsetAbilities.value.map((r) => r.label).join('、')}）`, go: 'abilities' })
    for (const t of equip.todo.value) out.push({ text: t.text, go: 'equipment' })
    return out
  })
  const status = (id: string): 'done' | 'todo' => id === 'name' ? (name.value.trim() ? 'done' : 'todo') : id === 'done' ? 'todo' : id === 'abilities' ? (abil.value?.check?.complete && abil.value.check.ok ? 'done' : 'todo') : id === 'equipment' ? (!equip.todo.value.length ? 'done' : 'todo') : (EXTRA_KINDS as readonly string[]).includes(id) ? ((extra(id)?.groups ?? []).every((g) => pickedIn(g).length >= g.count) ? 'done' : 'todo') : (chosen.value[id] ?? []).length >= need(id) ? 'done' : 'todo'

  async function create(): Promise<boolean> {
    if (!name.value.trim()) { createError.value = '先给人物起个名字'; return false }
    creating.value = true; createError.value = null
    try {
      const ok = await roster.createFromWizard({ name: name.value.trim(), items: items.value, picks: picks.value, blank: true, starting: equip.forBuild(), ...(Object.keys(abilBase.value).length ? { abilities: abilPlan() } : {}) }, category.value)
      if (!ok) createError.value = '没建成，原因见提示条'
      return ok
    } finally { creating.value = false }
  }
  const go = (id: string): void => { cur.value = id }
  const move = (delta: number): void => { const i = steps.value.indexOf(cur.value); cur.value = steps.value[Math.max(0, Math.min(steps.value.length - 1, i + delta))] }

  return { build, names, name, category, cur, chosen, sel, options, optLoading, optError, lists, equip, abilMethod, abilBase, abil, holding, unsetAbilities, creating, createError, mainProps, items, steps, picks, todo,
    open, loadList, choose, chooseExtra, pickedIn, takenBy, isChosen, extra, label, status, choicesOf, needOf, haveOf, leftOf, selOf, optionsFor, setSlot, setTraitPlan, bumpAsi, setMethod, hold, place, setBase, refreshOptions, create, go, move }
})
