import { defineStore } from 'pinia'
import { computed, ref, shallowRef } from 'vue'
import type { DownloadTasks, TaskState } from '../library/tasks'
import type { InstallReport } from '../library/install'
import { SOURCES } from '../library/sources'
import { useToastStore } from './toast'
import { useUpdatesStore } from './updates'

/** 作者阶段归并成三段（环 = 到了第几步，不是精确百分比）：下载文件 → 整理资料 → 准备结算。没登记的阶段算"整理资料"。 */
export const STAGE_GROUPS: Array<{ label: string; stages: string[] }> = [
  { label: '下载文件', stages: ['start', 'download', 'mirror'] },
  { label: '整理资料', stages: ['open-frame', 'author-init', 'loaders', 'parse', 'parse-corpus', 'parse-prop', 'documents', 'index', 'precompute', 'save'] },
  { label: '准备结算', stages: ['open-kernel', 'convert'] },
]
const groupIndex = (stage: string): number => {
  const i = STAGE_GROUPS.findIndex((g) => g.stages.includes(stage))
  return i < 0 ? 1 : i
}

export interface DownloadItem {
  /** 同一数据集、同一请求的任务共享列表身份。 */
  key: string
  kind: 'official' | 'adventure' | 'brew'
  label: string
  /** 当前在做什么（下载文件 / 整理资料 / 准备结算）。 */
  stage: string
  status: 'running' | 'failed'
  error: string | null
  /** 0–1，这一项到了第几步；当前阶段没有总数时为 null。 */
  pct: number | null
  set?: string
  item?: string
  /** 取消与重试按后端任务号处理。 */
  taskId: string
}

export type RingState = 'none' | 'running' | 'spin' | 'done'

export function officialTaskLabel(set: string, names: readonly string[] = []): string {
  const language = SOURCES.find((source) => source.id === set)?.lang
  const suffix = language === 'zh' ? '（中文）' : language === 'en' ? '（英文）' : ''
  if (!names.length) return `整套官方资料${suffix}`
  return `${names[0]}${names.length > 1 ? `等 ${names.length} 本` : ''}${suffix}`
}

function officialNames(t: TaskState, names: Map<string, string>): string[] {
  const parts = new Map(t.item?.split(';').map((pair) => pair.split('=', 2) as [string, string]) ?? [])
  const ids = ['updateBooks', 'updateAdventures', 'books', 'sources'].map((key) => parts.get(key)).find((value) => value && value !== 'all')?.split(',') ?? []
  return ids.map((id) => names.get(`${t.set}/${id.toLowerCase()}`) ?? id)
}

/** 每个真实任务一行。刷新后的旧中断记录与原来的暂停记录不进入界面。 */
export function itemsOf(tasks: TaskState[], names: Map<string, string>): DownloadItem[] {
  const latest = new Map<string, TaskState>()
  for (const t of tasks) {
    if (t.kind === 'precompute') continue
    latest.set(`${t.kind}:${t.set}/${t.item ?? 'all'}`, t)
  }
  const out: DownloadItem[] = []
  for (const [key, t] of latest) {
    if (t.kind === 'precompute' || (t.status !== 'running' && t.status !== 'failed')) continue
    const { stage, done, total } = t.progress
    const label = names.get(`task:${t.id}`) ?? (t.kind === 'official'
      ? officialTaskLabel(t.set, officialNames(t, names))
      : t.kind === 'brew' ? '自制包' : `冒险《${names.get(`${t.set}/${t.item?.toLowerCase()}`) ?? t.item ?? ''}》`)
    const phase = groupIndex(stage)
    const ratio = total > 0 ? Math.min(1, done / total) : null
    const pct = t.status === 'running' && ratio !== null ? (t.kind === 'brew' ? ratio : (phase + ratio) / STAGE_GROUPS.length) : null
    out.push({ key, kind: t.kind, label, stage: t.kind === 'brew' && stage !== 'start' ? stage : STAGE_GROUPS[phase].label, status: t.status, error: t.error, pct, set: t.set, item: t.item ?? undefined, taskId: t.id })
  }
  return out
}

/** 资料下载状态（侧栏库标签的小环、悬停小窗）：界面定时读 library.tasks.list()。 */
export const useDownloadsStore = defineStore('downloads', () => {
  const tasks = shallowRef<TaskState[]>([])
  const names = new Map<string, string>()
  const justDone = ref(false)
  let running_ids = new Set<string>()
  const reportedUpdates = new Set<string>()
  let reader: (() => TaskState[]) | null = null
  let timer: ReturnType<typeof setInterval> | undefined
  let doneTimer: ReturnType<typeof setTimeout> | undefined

  const dismissed = shallowRef<Set<string>>(new Set())

  /**
   * 登记名称与重试动作，进度和取消交给与官方资料相同的任务队列。
   * run 返回 null = 成功；文字 = 失败（出下载失败横幅）；{ reported } = 失败，但界面已出过更具体的横幅（如缺依赖带【下载依赖包】），不再重复。
   */
  async function trackBrew(queue: Pick<DownloadTasks, 'startBrew' | 'wait'>, set: string, key: string, label: string,
    run: (report: (stage: string, pct: number | null) => void, signal: AbortSignal) => Promise<string | null | { reported: string }>, retry?: () => void,
  ): Promise<TaskState> {
    let id = ''
    id = queue.startBrew(set, key, async (signal, report) => {
      const outcome = await run(report, signal)
      if (outcome === null || typeof outcome === 'string') return outcome
      dismissed.value = new Set([...dismissed.value, id])
      return outcome.reported
    })
    rememberTask(id, label, retry)
    const result = await queue.wait(id)
    refresh()
    return result
  }
  const items = computed(() => itemsOf(tasks.value, names))
  const running = computed(() => items.value.filter((i) => i.status === 'running'))
  /** 失败只在横幅里提示。悬浮窗只显示当前在跑的任务。 */
  const failedAll = computed(() => items.value.filter((i) => i.status === 'failed' && !dismissed.value.has(i.taskId)))
  const count = computed(() => running.value.length)
  const pct = computed(() => {
    const known = running.value.map((i) => i.pct).filter((p): p is number => p !== null)
    return known.length ? known.reduce((n, p) => n + p, 0) / known.length : 0
  })
  const ring = computed<RingState>(() => {
    if (running.value.length) return running.value.every((i) => i.pct === null) ? 'spin' : 'running'
    return justDone.value ? 'done' : 'none'
  })

  function dismiss(i: DownloadItem): void { dismissed.value = new Set([...dismissed.value, i.taskId]) }

  function rememberName(set: string, id: string, name: string): void {
    names.set(`${set}/${id.toLowerCase()}`, name)
  }
  /** 按书下载：登记任务号对应的显示名（只是名字，不是数据），悬浮窗里每个任务一行。 */
  function rememberTask(taskId: string, label: string, retry?: () => void): void {
    names.set(`task:${taskId}`, label)
    if (retry) taskRetry.set(taskId, retry)
    refresh()
  }
  const taskRetry = new Map<string, () => void>()
  function retryOf(i: DownloadItem): (() => void) | undefined {
    return taskRetry.get(i.taskId)
  }

  function refresh(): void {
    if (!reader) return
    tasks.value = reader().filter((t) => t.kind !== 'precompute')
    for (const task of tasks.value) {
      if (task.kind !== 'official' || reportedUpdates.has(task.id)) continue
      const update = (task.result as InstallReport | null)?.update
      if (!update) continue
      useUpdatesStore().published(task.set, update.target, update.selection)
      reportedUpdates.add(task.id)
    }
    const nowRunning = new Set(tasks.value.filter((t) => t.status === 'running').map((t) => t.id))
    // 刚才在跑的任务现在全部是"完成"才算资料已就绪；被取消 / 失败不报"已就绪"
    const finished = [...running_ids].filter((id) => !nowRunning.has(id)).map((id) => tasks.value.find((t) => t.id === id))
    if (running_ids.size && !nowRunning.size && finished.length && finished.every((t) => t?.status === 'done')) {
      justDone.value = true
      useToastStore().success('资料已就绪')
      clearTimeout(doneTimer)
      doneTimer = setTimeout(() => { justDone.value = false }, 2000)
    }
    running_ids = nowRunning
  }

  /** 开始定时读取；返回停止函数。 */
  function start(read: () => TaskState[], intervalMs = 1000): () => void {
    reader = read
    refresh()
    timer = setInterval(refresh, intervalMs)
    return () => {
      clearInterval(timer)
      clearTimeout(doneTimer)
      reader = null
    }
  }

  return { tasks, items, running, failedAll, count, pct, ring, justDone, rememberName, rememberTask, retryOf, refresh, start, trackBrew, dismiss }
})
