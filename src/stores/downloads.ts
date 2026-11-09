import { defineStore } from 'pinia'
import { computed, ref, shallowRef } from 'vue'
import type { TaskState } from '../library/tasks'
import { useToastStore } from './toast'

/** 作者阶段归并成三段（环 = 到了第几步，不是精确百分比）：下载文件 → 整理资料 → 准备结算。没登记的阶段算"整理资料"。 */
export const STAGE_GROUPS: Array<{ label: string; stages: string[] }> = [
  { label: '下载文件', stages: ['start', 'download', 'mirror'] },
  { label: '整理资料', stages: ['open-frame', 'author-init', 'loaders', 'parse', 'parse-corpus', 'parse-prop', 'index', 'precompute', 'save'] },
  { label: '准备结算', stages: ['open-kernel', 'convert'] },
]
const groupIndex = (stage: string): number => {
  const i = STAGE_GROUPS.findIndex((g) => g.stages.includes(stage))
  return i < 0 ? 1 : i
}

export interface DownloadItem {
  key: string
  label: string
  /** 当前在做什么（下载文件 / 整理资料 / 准备结算）。 */
  stage: string
  status: 'running' | 'failed'
  error: string | null
  /** 0–1，这一项到了第几步；当前阶段没有总数时为 null。 */
  pct: number | null
}

export type RingState = 'none' | 'running' | 'spin' | 'warn' | 'done'

/** 把任务列表归成给用户看的几项：官方资料（中文和结算内核要的英文原件合并成一项）+ 每本冒险。已完成 / 已取消的不列。 */
export function itemsOf(tasks: TaskState[], names: Map<string, string>): DownloadItem[] {
  const out: DownloadItem[] = []
  const official = tasks.filter((t) => t.kind === 'official')
  const running = official.filter((t) => t.status === 'running')
  const failed = official.filter((t) => t.status === 'failed')
  const pctOf = (t: TaskState): number | null => (t.progress.total > 0 ? (groupIndex(t.progress.stage) + Math.min(1, t.progress.done / t.progress.total)) / STAGE_GROUPS.length : groupIndex(t.progress.stage) / STAGE_GROUPS.length || null)
  if (running.length) {
    const lead = running.reduce((a, b) => (groupIndex(b.progress.stage) < groupIndex(a.progress.stage) ? b : a))
    const known = running.map(pctOf).filter((p): p is number => p !== null)
    out.push({ key: 'official', label: '官方资料', stage: STAGE_GROUPS[groupIndex(lead.progress.stage)].label, status: 'running', error: null, pct: known.length ? known.reduce((n, p) => n + p, 0) / known.length : null })
  } else if (failed.length) {
    out.push({ key: 'official', label: '官方资料', stage: '', status: 'failed', error: failed[0].error, pct: null })
  }
  for (const t of tasks.filter((x) => x.kind === 'adventure' && (x.status === 'running' || x.status === 'failed'))) {
    const label = `冒险《${names.get(`${t.set}/${t.item}`) ?? t.item ?? ''}》`
    out.push({ key: t.id, label, stage: t.status === 'running' ? STAGE_GROUPS[groupIndex(t.progress.stage)].label : '', status: t.status === 'failed' ? 'failed' : 'running', error: t.error, pct: t.status === 'running' && t.progress.total > 0 ? Math.min(1, t.progress.done / t.progress.total) : null })
  }
  return out
}

/** 资料下载状态（侧栏库标签的小环、悬停小窗）：界面定时读 library.tasks.list()。 */
export const useDownloadsStore = defineStore('downloads', () => {
  const tasks = shallowRef<TaskState[]>([])
  const names = new Map<string, string>()
  const justDone = ref(false)
  let running_ids = new Set<string>()
  let reader: (() => TaskState[]) | null = null
  let timer: ReturnType<typeof setInterval> | undefined
  let doneTimer: ReturnType<typeof setTimeout> | undefined

  const items = computed(() => itemsOf(tasks.value, names))
  const running = computed(() => items.value.filter((i) => i.status === 'running'))
  const failed = computed(() => items.value.filter((i) => i.status === 'failed'))
  /** 还没完成的项数（环旁边的数字）。 */
  const count = computed(() => items.value.length)
  const pct = computed(() => {
    const known = running.value.map((i) => i.pct).filter((p): p is number => p !== null)
    return known.length ? known.reduce((n, p) => n + p, 0) / known.length : 0
  })
  const ring = computed<RingState>(() => {
    if (running.value.length) return running.value.every((i) => i.pct === null) ? 'spin' : 'running'
    if (failed.value.length) return 'warn'
    return justDone.value ? 'done' : 'none'
  })

  function rememberName(set: string, id: string, name: string): void {
    names.set(`${set}/${id}`, name)
  }

  function refresh(): void {
    if (!reader) return
    tasks.value = reader().filter((t) => t.kind !== 'precompute')
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

  return { tasks, items, running, failed, count, pct, ring, justDone, rememberName, refresh, start }
})
