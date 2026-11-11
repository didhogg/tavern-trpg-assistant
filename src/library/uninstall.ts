// 整套官方资料的删除（P5 B-07 / T4）：先发布“移除后的版本”，成功后再回收这一套的文件 / 解析结果。
// 不删：自制包与房规（kv）、归属与版本选择（manage）、战役与存档（用户数据库，另一个库）。
// P5 T4：中英两套作为同一份计划检查、同一事务发布；第二套忙时第一套也不会先删。
import type { LibraryDatabase } from './db'
import { getSource } from './sources'
import type { TaskState } from './tasks'
import { LibraryOperations } from './operations'
import type { LibraryRevisionStore } from './revision'

export interface UninstallDeps {
  db: LibraryDatabase
  revisions: LibraryRevisionStore
  operations?: LibraryOperations
  /** 看有没有正在跑的下载 / 换算任务（含恢复出来的中断记录）。 */
  tasks: { list: () => TaskState[] }
  /** 删完以后清掉各处的内存缓存、关掉小窗（里面的作者缓存是旧的）。 */
  afterDelete: (setId: string) => void | Promise<void>
}

export interface UninstallReport {
  /** 兼容旧调用：第一套。 */
  set: string
  sets: string[]
  files: number
  bytes: number
  /** 这次物理删掉的派生物条数；新实现为 0（保留旧版本可读）。 */
  derived: number
  /** 逻辑移除后仍保留的文件 / 字节：旧版本 / 读者可能还在用。 */
  retainedFiles: number
  retainedBytes: number
  /** 这套作者程序下有自制内容被保留（它们启动要读官方数据，重装之前用不了）。 */
  brewKept: boolean
}

export async function uninstallOfficial({ db, revisions, operations, tasks, afterDelete }: UninstallDeps, setId: string | string[]): Promise<UninstallReport> {
  const sets = Array.isArray(setId) ? setId : [setId]
  for (const id of sets) if (getSource(id).kind !== 'official') throw new Error(`${id} 不是官方数据集，不能整套删除`)
  // 先看所有目标：任何一套正在跑，就一套都不删
  for (const id of sets) {
    if (tasks.list().some((t) => t.status === 'running' && t.set === id)) throw new Error('这套资料正在下载或换算，先取消任务再删除')
  }
  const ops = operations ?? new LibraryOperations({ db, revisions })
  const source = getSource(sets[0])
  const handle = await ops.begin({ kind: 'uninstall', set: sets.join(','), codeSet: source.codeSet })
  try {
    const official: Record<string, import('./db').OfficialSetState> = {}
    for (const id of sets) {
      const state = await handle.target.officialState(id)
      if (!state) continue
      official[id] = { ...state, status: 'missing', sources: [], books: [], adventures: [] }
    }
    await ops.publish(handle, { official })
    const report: UninstallReport = { set: sets[0], sets, files: 0, bytes: 0, derived: 0, brewKept: false, retainedFiles: 0, retainedBytes: 0 }
    for (const id of sets) {
      const s = getSource(id)
      // 逻辑移除已完成；物理回收要检查所有版本引用，不能在发布后立刻删（P5 核验 4）。
      await db.files.where('source').equals(id).each((rec) => { report.retainedFiles++; report.retainedBytes += rec.size })
      await db.fileContents.where('source').equals(id).each((rec) => { report.retainedFiles++; report.retainedBytes += rec.size })
      report.brewKept = report.brewKept || (await db.kv.where('scope').equals(s.codeSet).count()) > 0
      await afterDelete(id)
    }
    return report
  } catch (e) {
    await ops.abort(handle, e)
    throw e
  }
}

/** 中英两套一起卸载：同一份计划、同一事务发布，避免只删一半。 */
export function uninstallOfficialMany(deps: UninstallDeps, setIds: string[]): Promise<UninstallReport> {
  return uninstallOfficial(deps, setIds)
}
