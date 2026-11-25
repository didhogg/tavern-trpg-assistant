import { defineStore } from 'pinia'
import { computed, ref, shallowRef, watch } from 'vue'
import type { Glossary, ShownFieldInfo, SpecialTraits, TraitChoices } from '../rules/kernel/people'
import type { EntryRef } from '../library/scopes'
import type { SheetEdit } from '../rules/kernel/frame/commands-sheet'
import type { OffRow } from '../rules/kernel/frame/off'
import type { KernelChange } from '../schemas/kernel'
import type { AskAnswer } from '../rules/kernel/author-ask-types'
import type { ImportStep } from '../rules/kernel/import-flow'
import { useAppStore } from './app'
import { useCampaignStore } from './campaign'
import { useRosterStore } from './roster'
import { useToastStore } from './toast'

/* eslint-disable @typescript-eslint/no-explicit-any -- 读数是结算小窗交回的官方数据（dnd5e 数据模型 + 官方角色表显示数据），界面只取字段显示 */
/** 人物读数：原始数值 / 编号（改字段用）+ view（dnd5e 官方角色表的显示数据，已过唯一中文出口）。 */
export type PersonSheet = Record<string, any> & { system: any; view: { sheet: string; base: any; parts: Record<string, any> } }
/** 一次伤害 / 治疗的预览：小窗算好的前后对照，确认才写进存档。 */
export interface HpPreview { from: number; to: number; max: number; changes: KernelChange[] }

const message = (e: unknown): string => e instanceof Error ? e.message : String(e)

/**
 * P6 单元 1 人物详情：现在打开的是谁、它的读数、名字表、改动记录。
 * 界面只经这里调 `backend.people`；所有写入都经存档层 backendWrite（写完读回当前数据），写完重读这个人和名单。界面不算数。
 */
export const usePersonStore = defineStore('person', () => {
  const app = useAppStore()
  const campaign = useCampaignStore()
  const roster = useRosterStore()
  const toast = useToastStore()

  const id = ref<string | null>(null)
  const sheet = shallowRef<PersonSheet | null>(null)
  const glossary = shallowRef<Glossary | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  let seq = 0
  /**
   * 这一页对后端的操作排成一队，一个做完再做下一个：预览后取消会让后端在结算小窗里把这个人删掉再按存档建回，
   * 建回之前又发下一个操作，人就找不到了（2026-11-23 e2e 复现）。
   */
  let queue: Promise<unknown> = Promise.resolve()
  const serial = <T>(task: () => Promise<T>): Promise<T> => { const run = queue.then(task, task); queue = run.then(() => undefined, () => undefined); return run }

  const backend = () => app.svc().backend.people
  const ownerKey = (): string | null => campaign.owner?.ownerKey ?? null
  /** 上一位 / 下一位 = 当前列表（分类与搜索结果）里的顺序。 */
  const order = computed(() => roster.visible.map((r) => r.id))
  const prevId = computed(() => { const i = id.value ? order.value.indexOf(id.value) : -1; return i > 0 ? order.value[i - 1] : null })
  const nextId = computed(() => { const i = id.value ? order.value.indexOf(id.value) : -1; return i >= 0 && i < order.value.length - 1 ? order.value[i + 1] : null })
  const row = computed(() => roster.rows.find((r) => r.id === id.value) ?? null)
  const readOnly = computed(() => campaign.readOnly)

  const reload = (): Promise<void> => serial(readNow)
  async function readNow(): Promise<void> {
    const key = ownerKey()
    const who = id.value
    if (!key || !who) return
    const n = ++seq
    loading.value = true
    error.value = null
    try {
      const [got, names] = await Promise.all([backend().sheet(key, who), glossary.value ?? backend().glossary(key)])
      if (n !== seq) return
      glossary.value = names
      if (got.status === 'complete') sheet.value = got.result as PersonSheet
      else { sheet.value = null; error.value = got.error ?? `读取人物失败（${got.status}）` }
    } catch (e) {
      if (n === seq) error.value = message(e)
    } finally {
      if (n === seq) loading.value = false
    }
  }

  function open(who: string): void { id.value = who; sheet.value = null; void reload() }
  function close(): void { seq++; id.value = null; sheet.value = null; error.value = null }
  // 换了聊天 / 读了别的存档：这个人可能不在了，详情页关掉回列表；名字表按战役重取
  watch(() => `${campaign.owner?.ownerKey ?? ''}|${campaign.workspace?.currentSaveId ?? ''}`, (now, was) => { if (now !== was) { close(); glossary.value = null } })

  /**
   * 写一步：经存档层写；成功提示条带撤销（撤销 = 存档退一步），失败写原因、不留半截改动（后端已按存档退回）。
   * soon = 写进存档就算完成（关窗口、出提示条），人物页在后台重读——大改动（从库里加一整条）后重读整张人物要大半秒，不让玩家干等。
   */
  async function write(label: string, action: (ownerKey: string) => Promise<{ outcome?: { status: string; error?: string } } | unknown>, soon = false): Promise<boolean> {
    if (!ownerKey() || !id.value) return false
    if (campaign.readOnly) { toast.error('另一个窗口正在使用助手，这里只能查看'); return false }
    try {
      const done = await serial(() => campaign.backendWrite(action)) as { outcome?: { status: string; error?: string } } | undefined
      const status = done?.outcome?.status
      if (status && status !== 'complete' && status !== 'unsupported') { toast.error(`${label}没有完成：${done?.outcome?.error ?? status}`); await reload(); return false }
    } catch (e) {
      toast.error(`${label}失败：${message(e)}`)
      await reload()
      return false
    }
    const refreshed = Promise.all([reload(), roster.refresh()])
    if (!soon) await refreshed
    else void refreshed.catch((e: unknown) => toast.error(`${label}已保存，但人物页没刷新出来：${message(e)}`))
    toast.undoable(label, () => undo())
    return true
  }

  const edit = (label: string, edits: SheetEdit[]) => write(label, (k) => backend().edit(k, id.value!, edits))
  /** 短休 / 长休（官方休息，不弹官方窗口；需要掷骰的部分等 P7）。 */
  const rest = (type: 'short' | 'long') => write(type === 'short' ? '短休' : '长休', (k) => backend().act(k, id.value!, 'rest', id.value!, type, [], {}))
  /** 某个职业改几级（官方 forLevelChange，和官方 / Tidy5e 等级下拉同一条路）；要玩家做选择的成长会报“没有完成”。 */
  const level = (label: string, classId: string, delta: number) => write(label, (k) => backend().act(k, id.value!, 'levelUpApply', id.value!, classId, delta))
  /**
   * 取下 / 装回自动项目：off = 这个人新的完整取下安排（取下 = 加一行，装回 = 去掉那一行；行的写法由读数给，sheet.traits / sheet.off）。
   * 后端先在小窗按新安排准备，成功才连人物一起写进存档（一条撤销）；不成写原因、人物按存档退回。
   */
  const setOff = (label: string, off: OffRow[]) => write(label, async (k) => {
    const r = await backend().setOff(k, id.value!, off)
    return { outcome: r.ok ? { status: 'complete' } : { status: 'error', error: r.problems?.[0]?.reason ?? r.error } }
  })
  /** 按一份物品数据新建条目（复制 / 新建空白条目，照 Tidy5e item.clone、createItem）：小窗现成的加条目命令收数据，走官方成长；一条撤销。 */
  const create = (label: string, data: Array<Record<string, unknown>>) => write(label, (k) => backend().act(k, id.value!, 'addToActor', id.value!, data.map((d) => ({ prop: String(d.type ?? 'item'), entry: null, data: d }))))
  /** 官方物品小操作（拆分堆叠 / 法术做成卷轴 / 钱币换算）：小窗现成命令，一条撤销。 */
  const splitStack = (label: string, itemId: string, n: number) => write(label, (k) => backend().act(k, id.value!, 'splitStack', id.value!, itemId, n))
  const createScroll = (label: string, itemId: string, name: string) => write(label, (k) => backend().act(k, id.value!, 'createScroll', id.value!, itemId, name))
  const duplicate = (label: string, itemId: string, name: string) => write(label, (k) => backend().act(k, id.value!, 'duplicateItem', id.value!, itemId, name))
  const convertCurrency = () => write('钱币换算成最少枚数', (k) => backend().act(k, id.value!, 'convertCurrency', id.value!))
  /** 拿掉一件条目（官方退回它带来的成长再删）。 */
  const remove = (label: string, itemId: string) => write(label, (k) => backend().remove(k, id.value!, itemId))
  /**
   * 空白卡建人 / 从库里加（作者「导入到人物」+ 问答桥）：带着玩家已答的题目问一步；
   * 交回下一题（作者停在题上，已写的一部分留在小窗）或「会加上什么」（改动留在小窗等 importConfirm / importCancel）。
   */
  async function importStep(ref: EntryRef, answers: AskAnswer[], replaceItemId?: string, before?: { classId: string; delta: number }): Promise<ImportStep | null> {
    const key = ownerKey(); const who = id.value
    if (!key || !who) return null
    // 界面给的是响应式对象，跨窗口传不过去：回答和条目编号都是纯数据，先转成普通对象
    const plain = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T
    try { return await serial(() => app.svc().backend.importFlow.step(key, who, plain(ref), plain(answers), replaceItemId, before && plain(before))) } catch (e) { return { status: 'error', error: message(e), ms: 0 } }
  }
  /** 降级预览：会收回的物品（已过显示出口）、生命上限 / 总等级前后；只算不存（后端算完按存档退回），没算成 = null。 */
  async function levelPreview(classId: string, delta: number): Promise<{ removed: Array<{ id: string; type: string; name: string }>; hp: { from: number; to: number }; level: { from: number; to: number } } | null> {
    const key = ownerKey(); const who = id.value
    if (!key || !who) return null
    try {
      const out = await serial(() => backend().levelPreview(key, who, classId, delta))
      return out.status === 'complete' ? out.result as never : null
    } catch (e) { console.warn('[trpg-assistant] 降级预览没算出来', e); return null }
  }
  /** 确认：留在小窗里的改动写进存档（一条撤销，提示条可撤）。 */
  const importConfirm = (label: string, changes: KernelChange[]) => write(label, (k) => app.svc().backend.importFlow.confirm(k, changes), true)
  /** 取消：这个人按存档退回（小窗里没确认的改动丢掉）。 */
  async function importCancel(): Promise<void> {
    const key = ownerKey(); const who = id.value
    if (key && who) await serial(() => app.svc().backend.importFlow.cancel(key, who))
  }
  /** 用作者完整建卡器改这个人（升级、兼职、带选择的成长；空白人物 = 从头建）：完成 = 一条撤销，取消 = 不变。 */
  async function levelNative(slot: HTMLElement): Promise<'done' | 'cancelled' | 'failed'> {
    const key = ownerKey()
    const who = id.value
    if (!key || !who) return 'failed'
    if (campaign.readOnly) { toast.error('另一个窗口正在使用助手，这里只能查看'); return 'failed' }
    try {
      const out = await serial(() => campaign.backendWrite((k) => backend().levelNative(k, who, slot)))
      if (out.built.status === 'cancelled') return 'cancelled'
      if (!out.kernel) throw new Error(('error' in out.built && out.built.error) || '没有改成')
    } catch (e) {
      toast.error(`建卡器没改成：${message(e)}`)
      await reload()
      return 'failed'
    }
    await Promise.all([reload(), roster.refresh()])
    toast.undoable('用建卡器改了这个人', () => undo())
    return 'done'
  }
  const stopNative = (): void => { const key = ownerKey(); if (key) backend().stopNative(key) }
  /** 个人调整（英文名、分类……）。 */
  const adjust = (label: string, patch: Record<string, unknown>) => write(label, (k) => backend().adjust(k, [id.value!], patch))

  /** 伤害（正数，先扣临时生命）/ 治疗（负数）：小窗先算，交回前后对照；不写存档，确认或取消前小窗留着预演。 */
  async function previewHp(amount: number): Promise<HpPreview | null> {
    const key = ownerKey()
    if (!key || !id.value) return null
    const who = id.value
    const tried = await serial(() => backend().attempt(key, who, 'damage', who, amount, [], {}))
    // 小窗执行后交回的生命（存档对照只记和基准不同的部分，回满血时没有这一项，不能从那里取）
    const after = (tried.outcome as { result?: { hp?: { value?: number; max?: number } } }).result?.hp
    const before = sheet.value?.system.attributes.hp
    if (!tried.changes.length || !after || typeof after.value !== 'number' || !before) { await serial(() => backend().cancel(key, [who])); return null }
    return { from: before.value, to: after.value, max: after.max ?? before.max, changes: tried.changes }
  }
  const cancelHp = async (): Promise<void> => { const key = ownerKey(); const who = id.value; if (key && who) await serial(() => backend().cancel(key, [who])) }
  const confirmHp = (label: string, p: HpPreview) => write(label, (k) => backend().confirm(k, p.changes))

  async function undo(): Promise<void> {
    try { await serial(() => campaign.backendWrite((k) => backend().undo(k))) } catch (e) { toast.error(`撤销失败：${message(e)}`) }
    await afterUndo()
  }
  async function undoTo(revision: number): Promise<void> {
    try { await serial(() => campaign.backendWrite((k) => backend().undoTo(k, revision))) } catch (e) { toast.error(`撤销失败：${message(e)}`) }
    await afterUndo()
  }
  /** 撤销后先刷名单：撤到加人之前，这个人已不在名单里 → 关掉详情回列表（不去读一个不存在的人）。 */
  async function afterUndo(): Promise<void> {
    await roster.refresh()
    if (id.value && !roster.rows.some((r) => r.id === id.value)) { close(); return }
    await reload()
  }
  const history = async () => { const key = ownerKey(); return key ? serial(() => backend().history(key)) : [] }
  /** 编辑窗口：一块字段的官方定义 + 改到它的效果（P6-R）；读不出来交回 null 并提示原因。 */
  /** 官方筛选：哪些物品通过这组筛选条件（只读）；读不出 = null（界面就不筛）。 */
  async function filterIds(filters: string[]): Promise<Set<string> | null> {
    const key = ownerKey(); const who = id.value
    if (!key || !who || !filters.length) return null
    const ids = await serial(() => backend().filterItems(key, who, [...filters].map(String)))
    return ids ? new Set(ids) : null
  }
  /** 特殊特质页的官方各项与现值（只读）。 */
  async function specialTraits() {
    const key = ownerKey(); const who = id.value
    return key && who ? serial(() => backend().shown<SpecialTraits>(key, 'specialTraits', who)) : null
  }
  /** 特质勾选页的官方选项（只读）。 */
  async function traitChoices(trait: string) {
    const key = ownerKey()
    return key ? serial(() => backend().shown<TraitChoices>(key, 'traitChoices', trait)) : null
  }
  async function fields(target: { itemId?: string; path: string }): Promise<ShownFieldInfo | null> {
    const key = ownerKey()
    if (!key || !id.value) return null
    const who = id.value
    const out = await serial(() => backend().fields(key, who, target))
    if (out.status !== 'complete') { toast.error(`读不出这一块：${out.error ?? out.status}`); return null }
    return out.result as ShownFieldInfo
  }

  return { id, sheet, glossary, loading, error, prevId, nextId, row, readOnly, open, close, reload, edit, importStep, importConfirm, importCancel, create, splitStack, createScroll, convertCurrency, duplicate, remove, adjust, fields, traitChoices, specialTraits, filterIds, rest, level, levelPreview, setOff, levelNative, stopNative, previewHp, cancelHp, confirmHp, undo, undoTo, history }
})
