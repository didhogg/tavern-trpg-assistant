// 整套官方资料的删除（P5 B-07）：释放空间，之后还能在下载页重新下载（重装 = 现有的 tasks.startOfficial）。
// 删的是"可以重新取回、重新算出"的东西：本地原始文件、解析结果、搜索索引、中英配对表、安装记录、结算内核换算缓存。
// 不删：自制包与房规（kv）、归属与版本选择（manage）、书目与文件清单缓存（书架仍能列出、重下不用再取清单）、战役与存档（用户数据库，另一个库）。
// 删了以后存档里的引用读档时得到 not-installed（已有的原因），不是丢数据。
import type { LibraryDatabase } from './db'
import { getSource } from './sources'
import type { TaskState } from './tasks'

export interface UninstallDeps {
  db: LibraryDatabase
  /** 看有没有正在跑的下载 / 换算任务。 */
  tasks: { list: () => TaskState[] }
  /** 删完以后清掉各处的内存缓存、关掉小窗（里面的作者缓存是旧的）。 */
  afterDelete: (setId: string) => void | Promise<void>
}

export interface UninstallReport {
  set: string
  files: number
  bytes: number
  /** 删掉的派生物（解析结果、索引、配对表、报告、换算缓存）条数。 */
  derived: number
  /** 这套作者程序下有自制内容被保留（它们启动要读官方数据，重装之前用不了）。 */
  brewKept: boolean
}

export async function uninstallOfficial({ db, tasks, afterDelete }: UninstallDeps, setId: string): Promise<UninstallReport> {
  const source = getSource(setId)
  if (source.kind !== 'official') throw new Error(`${setId} 不是官方数据集，不能整套删除`)
  if (tasks.list().some((t) => t.status === 'running' && t.set === setId)) throw new Error('这套资料正在下载或换算，先取消任务再删除')
  const report: UninstallReport = { set: setId, files: 0, bytes: 0, derived: 0, brewKept: false }
  // 派生物：这一套自己的，加上两套配对出来的中英对照（任何一套没了配对就作废）和结算内核换算缓存（只是缓存，丢了重算）
  const prefixes = [`parsed:${setId}:`, `pre:${setId}:`, `doc:${setId}:`, 'english:', 'audit:english:', 'kc:']
  const exact = [`audit:${setId}`, `audit:layers34:${setId}`, `sources:${setId}`, `docs:${setId}`]
  await db.transaction('rw', [db.files, db.derived, db.sets], async () => {
    await db.files.where('source').equals(setId).each((rec) => { report.files++; report.bytes += rec.size })
    await db.files.where('source').equals(setId).delete()
    for (const prefix of prefixes) report.derived += await db.derived.where('key').startsWith(prefix).delete()
    await db.derived.bulkDelete(exact)
    report.derived += exact.length
    await db.sets.delete(setId)
  })
  report.brewKept = (await db.kv.where('scope').equals(source.codeSet).count()) > 0
  await afterDelete(setId)
  return report
}
