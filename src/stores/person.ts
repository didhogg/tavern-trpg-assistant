import { defineStore } from 'pinia'
import { computed, ref, shallowRef, watch } from 'vue'
import type { Glossary } from '../rules/kernel/people'
import type { EntryRef } from '../library/scopes'
import type { SheetEdit } from '../rules/kernel/frame/commands-sheet'
import type { KernelChange } from '../schemas/kernel'
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

  /** 写一步：经存档层写；成功提示条带撤销（撤销 = 存档退一步），失败写原因、不留半截改动（后端已按存档退回）。 */
  async function write(label: string, action: (ownerKey: string) => Promise<{ outcome?: { status: string; error?: string } } | unknown>): Promise<boolean> {
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
    await Promise.all([reload(), roster.refresh()])
    toast.undoable(label, () => undo())
    return true
  }

  const edit = (label: string, edits: SheetEdit[]) => write(label, (k) => backend().edit(k, id.value!, edits))
  /** 从库里加条目（物品等）：后端加条目的结果改成和改字段同一种 outcome，失败原因照常提示。 */
  const add = (label: string, refs: EntryRef[]) => write(label, async (k) => {
    const r = await backend().add(k, id.value!, refs)
    return { outcome: { status: r.added.status, error: r.added.error } }
  })
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
    await Promise.all([reload(), roster.refresh()])
  }
  async function undoTo(revision: number): Promise<void> {
    try { await serial(() => campaign.backendWrite((k) => backend().undoTo(k, revision))) } catch (e) { toast.error(`撤销失败：${message(e)}`) }
    await Promise.all([reload(), roster.refresh()])
  }
  const history = async () => { const key = ownerKey(); return key ? serial(() => backend().history(key)) : [] }

  return { id, sheet, glossary, loading, error, prevId, nextId, row, readOnly, open, close, reload, edit, add, adjust, previewHp, cancelHp, confirmHp, undo, undoTo, history }
})
