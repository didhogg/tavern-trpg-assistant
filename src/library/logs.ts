// 统一后端日志（P5 B-26）：各处的错误（下载任务失败、自制解析出错、读档检查失败…）按时间记一条，滚动保留，能列出、能导出全文。
// 记在【库】数据库的 derived 表（键 log:<毫秒>:<序号>，按键排序就是按时间排序）。
// 各来源的安装 / 解析报告本来就存在库里（audit:<来源>）并由体检（health.ts）汇总；这里是"发生过什么错"的流水，两者互补，不重复存报告内容。
import type { LibraryDatabase } from './db'

export type LogLevel = 'error' | 'warn' | 'info'

export interface LogEntry {
  id: string
  at: number
  level: LogLevel
  /** 哪个数据集 / 模块（cn-official、cn-brew、kernel-save…）。 */
  source: string
  /** 哪一类事（task:official、brew-parse、load-check…）。 */
  kind: string
  message: string
  /** 原文细节（作者报错原文、报告片段等），点开看。 */
  detail?: unknown
}

export type LogInput = Omit<LogEntry, 'id' | 'at'>
export type LogSink = (entry: LogInput) => void

const PREFIX = 'log:'
const pad = (n: number, w: number): string => String(n).padStart(w, '0')

export interface LogStoreOptions {
  /** 最多保留多少条，多了丢最旧的。 */
  max?: number
  now?: () => number
}

export class LogStore {
  private seq = 0
  private readonly max: number
  private readonly now: () => number

  constructor(private readonly db: LibraryDatabase, opts: LogStoreOptions = {}) {
    this.max = opts.max ?? 500
    this.now = opts.now ?? Date.now
  }

  async add(input: LogInput): Promise<void> {
    const at = this.now()
    const id = `${pad(at, 13)}:${pad(++this.seq % 10000, 4)}`
    await this.db.derived.put({ key: PREFIX + id, fingerprint: 'log', value: { ...input, id, at } satisfies LogEntry, savedAt: at })
    const over = (await this.db.derived.where('key').startsWith(PREFIX).count()) - this.max
    if (over > 0) await this.db.derived.where('key').startsWith(PREFIX).limit(over).delete()
  }

  /** 记日志本身出错不能拖垮调用方：写失败就在控制台留一笔。给各处当 LogSink 用。 */
  sink(): LogSink {
    return (entry) => {
      this.add(entry).catch((e: unknown) => console.error('[trpg-library] 写日志失败', e, entry))
    }
  }

  /** 最近的在前。 */
  async list({ limit = 100, level, source, kind }: { limit?: number; level?: LogLevel; source?: string; kind?: string } = {}): Promise<LogEntry[]> {
    const out: LogEntry[] = []
    await this.db.derived.where('key').startsWith(PREFIX).reverse().until(() => out.length >= limit).each((rec) => {
      const e = rec.value as LogEntry
      if ((level && e.level !== level) || (source && e.source !== source) || (kind && e.kind !== kind)) return
      out.push(e)
    })
    return out
  }

  count(): Promise<number> {
    return this.db.derived.where('key').startsWith(PREFIX).count()
  }

  async clear(): Promise<void> {
    await this.db.derived.where('key').startsWith(PREFIX).delete()
  }

  /** 全量日志的文本（时间正序，一条一段，细节为 JSON）；界面"复制 / 导出"用。 */
  async exportText(): Promise<string> {
    const all: LogEntry[] = []
    await this.db.derived.where('key').startsWith(PREFIX).each((rec) => { all.push(rec.value as LogEntry) })
    return all.map((e) => `${new Date(e.at).toISOString()} [${e.level}] ${e.source} ${e.kind}\n${e.message}${e.detail === undefined ? '' : `\n${JSON.stringify(e.detail, null, 1)}`}`).join('\n\n')
  }
}
