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
  /** 删掉的派生物（解析结果、索引、配对表、报告、换算缓存）条数。 */
  derived: number
  /** 这套作者程序下有自制内容被保留（它们启动要读官方数据，重装之前用不了）。 */
  brewKept: boolean
}

const matches = (key: string, setId: string): boolean => {
  let k = key
  if (k.startsWith('rev:')) {
    const at = k.indexOf(':', 4)
    if (at > 0) k = k.slice(at + 1)
  }
  return k === `audit:${setId}` || k === `audit:layers34:${setId}` || k === `sources:${setId}` || k === `docs:${setId}`
    || k.startsWith(`parsed:${setId}:`) || k.startsWith(`pre:${setId}:`) || k.startsWith(`doc:${setId}:`)
    || k.startsWith(`audit:english:${setId}`) || k === `english:${setId}`
    || k.startsWith(`corpus:${setId}:`)
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
    const report: UninstallReport = { set: sets[0], sets, files: 0, bytes: 0, derived: 0, brewKept: false }
    for (const id of sets) {
      const s = getSource(id)
      await db.files.where('source').equals(id).each((rec) => { report.files++; report.bytes += rec.size })
      await db.files.where('source').equals(id).delete()
      await db.fileContents.where('source').equals(id).delete()
      await db.fileVersions.where('source').equals(id).delete()
      const all = await db.derived.toArray()
      const doomed = all.filter((r) => matches(r.key, id)).map((r) => r.key)
      await db.derived.bulkDelete(doomed)
      report.derived += doomed.length
      report.brewKept = report.brewKept || (await db.kv.where('scope').equals(s.codeSet).count()) > 0
      await db.derived.where('key').startsWith('kc:').delete()
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
