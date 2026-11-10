import { defineStore } from 'pinia'
import { computed, ref, shallowRef } from 'vue'
import type { TaskState } from '../library/tasks'
import { useToastStore } from './toast'

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
  /** 稳定编号：同一件事重试前后一样（官方 = official、冒险 = adventure:数据集/编号、自制 = brew:…），用来认出"这是重试"。 */
  key: string
  kind: 'official' | 'adventure' | 'brew'
  label: string
  /** 当前在做什么（下载文件 / 整理资料 / 准备结算）。 */
  stage: string
  status: 'running' | 'failed'
  error: string | null
  /** 0–1，这一项到了第几步；当前阶段没有总数时为 null。 */
  pct: number | null
  /** 重试用：官方 = 失败的数据集编号；冒险 = 数据集与冒险编号。 */
  sets?: string[]
  set?: string
  item?: string
}

export type RingState = 'none' | 'running' | 'spin' | 'warn' | 'done'

/** 同一件事（官方的某一套 / 某一本冒险）只看最新的一次任务：重试以后旧的失败记录不再出现，也不会出现两条一样的失败。 */
function latestOf(tasks: TaskState[]): TaskState[] {
  const last = new Map<string, TaskState>()
  for (const t of tasks) last.set(`${t.kind}:${t.set}:${t.item ?? ''}`, t)
  return [...last.values()]
}

/** 把任务列表归成给用户看的几项：官方资料（中文和结算内核要的英文原件合并成一项）+ 每本冒险。已完成 / 已取消的不列。 */
export function itemsOf(tasks: TaskState[], names: Map<string, string>): DownloadItem[] {
  const out: DownloadItem[] = []
  const latest = latestOf(tasks)
  const official = latest.filter((t) => t.kind === 'official')
  const running = official.filter((t) => t.status === 'running')
  const failed = official.filter((t) => t.status === 'failed')
  const pctOf = (t: TaskState): number | null => (t.progress.total > 0 ? (groupIndex(t.progress.stage) + Math.min(1, t.progress.done / t.progress.total)) / STAGE_GROUPS.length : groupIndex(t.progress.stage) / STAGE_GROUPS.length || null)
  if (running.length) {
    const lead = running.reduce((a, b) => (groupIndex(b.progress.stage) < groupIndex(a.progress.stage) ? b : a))
    const known = running.map(pctOf).filter((p): p is number => p !== null)
    out.push({ key: 'official', kind: 'official', label: '官方资料', stage: STAGE_GROUPS[groupIndex(lead.progress.stage)].label, status: 'running', error: null, pct: known.length ? known.reduce((n, p) => n + p, 0) / known.length : null })
  } else if (failed.length) {
    out.push({ key: 'official', kind: 'official', label: '官方资料', stage: '', status: 'failed', error: failed[0].error, pct: null, sets: [...new Set(failed.map((t) => t.set))] })
  }
  for (const t of latest.filter((x) => x.kind === 'adventure' && (x.status === 'running' || x.status === 'failed'))) {
    const label = `冒险《${names.get(`${t.set}/${t.item}`) ?? t.item ?? ''}》`
    out.push({ key: `adventure:${t.set}/${t.item}`, kind: 'adventure', label, stage: t.status === 'running' ? STAGE_GROUPS[groupIndex(t.progress.stage)].label : '', status: t.status === 'failed' ? 'failed' : 'running', error: t.error, pct: t.status === 'running' && t.progress.total > 0 ? Math.min(1, t.progress.done / t.progress.total) : null, set: t.set, item: t.item ?? undefined })
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

  /** 自制包的下载（不走后台任务队列，界面自己登记）：也列在库标签的小窗里。 */
  const brew = ref<DownloadItem[]>([])
  const brewRetry = new Map<string, () => void>()
  /** 用户点过【重试】的项：再失败时不再亮警告环 / 弹提示，只在页面里出横幅（带重试按钮），不自动再拉。 */
  const retried = shallowRef<Set<string>>(new Set())
  /** 用户关掉横幅的失败项（再次失败会重新出现）。 */
  const dismissed = shallowRef<Set<string>>(new Set())
  const mark = (set: typeof retried, key: string): void => { set.value = new Set([...set.value, key]) }

  /**
   * 登记一次自制包下载：开始时列为「正在下载」，结束时去掉；run 返回错误文字表示失败（留作横幅，带重试），返回 null 表示成功。
   * 同一件事上一次失败了又来一次 = 用户点了重试，再失败就只出横幅。
   */
  async function trackBrew(key: string, label: string, run: () => Promise<string | null>, retry?: () => void): Promise<void> {
    if (brew.value.some((i) => i.key === key && i.status === 'failed')) mark(retried, key)
    if (retry) brewRetry.set(key, retry)
    const rest = brew.value.filter((i) => i.key !== key)
    brew.value = [...rest, { key, kind: 'brew', label, stage: '下载文件', status: 'running', error: null, pct: null }]
    let error: string | null
    try { error = await run() } catch (e) { error = e instanceof Error ? e.message : String(e) }
    brew.value = error ? [...rest, { key, kind: 'brew', label, stage: '', status: 'failed', error, pct: null }] : rest
    if (!error) brewRetry.delete(key)
  }
  const items = computed(() => [...itemsOf(tasks.value, names), ...brew.value])
  const running = computed(() => items.value.filter((i) => i.status === 'running'))
  /** 横幅里列的失败项：全部失败的（关掉的除外），每条带重试。 */
  const failedAll = computed(() => items.value.filter((i) => i.status === 'failed' && !dismissed.value.has(i.key)))
  /** 警告环 / 悬停小窗里列的失败项：只列第一次失败的，点过重试以后再失败就不列了。 */
  const failed = computed(() => items.value.filter((i) => i.status === 'failed' && !retried.value.has(i.key) && !dismissed.value.has(i.key)))
  /** 环旁边的数字：正在下载的 + 亮着警告的。 */
  const count = computed(() => running.value.length + failed.value.length)
  const pct = computed(() => {
    const known = running.value.map((i) => i.pct).filter((p): p is number => p !== null)
    return known.length ? known.reduce((n, p) => n + p, 0) / known.length : 0
  })
  const ring = computed<RingState>(() => {
    if (running.value.length) return running.value.every((i) => i.pct === null) ? 'spin' : 'running'
    if (failed.value.length) return 'warn'
    return justDone.value ? 'done' : 'none'
  })

  /** 用户点了某一项的【重试】（官方 / 冒险由调用方重新开任务；自制用登记时给的重试函数）。 */
  function markRetried(key: string): void { mark(retried, key) }
  function dismiss(key: string): void { mark(dismissed, key) }
  function retryBrew(key: string): boolean {
    const fn = brewRetry.get(key)
    if (!fn) return false
    mark(retried, key)
    fn()
    return true
  }
  /** 项目已经不在列表里（成功了）就把重试 / 关闭的记号清掉，下次失败重新算第一次。 */
  function tidy(): void {
    const live = new Set(items.value.map((i) => i.key))
    for (const set of [retried, dismissed]) if ([...set.value].some((k) => !live.has(k))) set.value = new Set([...set.value].filter((k) => live.has(k)))
  }

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
    tidy()
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

  return { tasks, items, running, failed, failedAll, count, pct, ring, justDone, rememberName, refresh, start, trackBrew, markRetried, dismiss, retryBrew }
})
