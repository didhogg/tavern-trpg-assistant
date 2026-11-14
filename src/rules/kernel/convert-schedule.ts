// 后台换算排队（性能支线 2026-11-14）：哪些语言欠一轮完整换算、什么时候跑。实际排队交给 PrecomputeQueue。
// - 改自制 / 房规后：停手 5 秒补换算（changed，只看自制和带备选的条目，P5.5 查慢）；
// - 装 / 更新官方资料后：完整换算（full）也排在这里。还有下载任务在跑就等，一批装完才跑，跑的时候又开始装就先停；
// - 装的是结算小窗读的那套（sources.ts kernelDataSource，英文）：所有语言的换算钥匙都跟着变，都欠一轮；否则只欠这一种语言；
// - 欠账记进【库】（kc-pending:语言），完整跑完（不是中途停下）才划掉；页面中途关掉，下次打开接着排。
//   只记装资料欠的；结算内核指纹变了（插件更新）照 P3 定的不自动重跑。
import type { LibraryDatabase } from '../../library/db'
import { getSource, kernelDataSource, SOURCES } from '../../library/sources'
import type { KernelPrecompute } from './precompute'
import { PrecomputeQueue } from './precompute-queue'

const OWED = 'kc-pending:'

export interface ConvertSchedule {
  queue: PrecomputeQueue
  /** 一套官方资料刚发布：记下欠哪几种语言的完整换算并排队。 */
  afterInstall: (setId: string) => Promise<void>
  /** 开始装资料了：正在跑的换算先停（已写的缓存保留）。 */
  installStarted: () => void
  /** 打开插件时：上次没换完的接着排。 */
  resume: () => Promise<void>
}

export function convertSchedule(deps: {
  db: LibraryDatabase
  precompute: () => KernelPrecompute | null
  /** 还有没有下载任务在跑（有就先不换）。 */
  installing: () => boolean
  quietMs?: number
}): ConvertSchedule {
  const owedKey = (codeSet: string): string => `${OWED}${codeSet}`
  const queue = new PrecomputeQueue(async (codeSet, mode, signal) => {
    const report = await deps.precompute()?.run({ codeSet, mode, signal }) ?? null
    if (mode === 'full' && report && !report.cancelled) await deps.db.derived.delete(owedKey(codeSet))
    return report
  }, deps.quietMs ?? 5000, deps.installing)
  return {
    queue,
    async afterInstall(setId) {
      const owed = setId === kernelDataSource().id ? SOURCES.filter((s) => s.kind === 'official').map((s) => s.codeSet) : [getSource(setId).codeSet]
      for (const codeSet of new Set(owed)) {
        await deps.db.derived.put({ key: owedKey(codeSet), fingerprint: '', value: { at: Date.now() }, savedAt: Date.now() })
        queue.trigger(codeSet, 'full')
      }
    },
    installStarted: () => queue.interrupt(),
    async resume() {
      await deps.db.derived.where('key').startsWith(OWED).each((rec) => queue.trigger(rec.key.slice(OWED.length), 'full'))
    },
  }
}
