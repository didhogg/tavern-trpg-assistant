// 整套官方资料的删除（P5 B-07 / T4）：先发布“移除后的版本”，成功后再回收这一套的文件 / 解析结果。
// 不删：自制包与房规（kv）、归属与版本选择（manage）、战役与存档（用户数据库，另一个库）。
// P5 T4：中英两套作为同一份计划检查、同一事务发布；第二套忙时第一套也不会先删。
import type { LibraryDatabase } from './db'
import { getSource } from './sources'
import type { TaskState } from './tasks'
import { LibraryOperations, type OperationHandle } from './operations'
import type { LibraryRevisionStore, LibraryView } from './revision'
import { installedAdventureIds } from './install'
import { installedOfficialSources } from './installed-sources'
import type { BookDirectory, DirectoryRecord } from './directory'
import { officialDependencies } from './official-dependencies'

export interface UninstallDeps {
  db: LibraryDatabase
  revisions: LibraryRevisionStore
  operations?: LibraryOperations
  /** 看有没有正在跑的下载 / 换算任务（含恢复出来的中断记录）。 */
  tasks: { list: () => TaskState[] }
  /** 删完以后清掉各处的内存缓存、关掉小窗（里面的作者缓存是旧的）。 */
  afterDelete: (setId: string, previous: string) => void | Promise<void>
  /** 官方单书 / 单冒险删除要读作者书目来算剩余集合。 */
  directory?: BookDirectory
  /** 官方单书删除牵连的自制包：在同一准备视图里删包并重解析，随同一次发布。 */
  brewSetOf?: (codeSet: string) => string
  removeBrews?: (view: import('./revision').LibraryView, setId: string, ids: string[]) => Promise<{ packs: Array<{ docIdLocal: string; stableId: string | null; checksum: string | null }> }>
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

export async function uninstallOfficial({ db, revisions, operations, tasks, afterDelete }: UninstallDeps, setId: string | string[], supplied?: OperationHandle): Promise<UninstallReport> {
  const sets = Array.isArray(setId) ? setId : [setId]
  for (const id of sets) if (getSource(id).kind !== 'official') throw new Error(`${id} 不是官方数据集，不能整套删除`)
  // 先看所有目标：任何一套正在跑，就一套都不删
  for (const id of sets) {
    if (tasks.list().some((t) => t.status === 'running' && t.set === id)) throw new Error('这套资料正在下载或换算，先取消任务再删除')
  }
  const ops = operations ?? new LibraryOperations({ db, revisions })
  const source = getSource(sets[0])
  const own = !supplied
  const handle = supplied ?? await ops.begin({ kind: 'uninstall', set: sets.join(','), codeSet: source.codeSet })
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
      await afterDelete(id, handle.base.id)
    }
    return report
  } catch (e) {
    if (own) await ops.abort(handle, e)
    throw e
  }
}

/** 中英两套一起卸载：同一份计划、同一事务发布，避免只删一半。 */
export function uninstallOfficialMany(deps: UninstallDeps, setIds: string[]): Promise<UninstallReport> {
  return uninstallOfficial(deps, setIds)
}


export interface OfficialPart { setId: string; bookIds?: string[]; bookSources?: string[]; adventureIds?: string[] }

/**
 * 在准备版本里摆好「去掉这些书 / 冒险之后」的官方状态与过滤索引（不发布）。没给书和冒险 = 这一套整套移除。
 * 单本卸载和多选卸载共用（P5-5 §12 B1）。
 */
export async function stageOfficialParts(deps: UninstallDeps, ops: LibraryOperations, handle: OperationHandle, target: OfficialPart): Promise<import('./db').OfficialSetState> {
  const source = getSource(target.setId)
  if (source.kind !== 'official') throw new Error(`${target.setId} 不是官方数据集`)
  if (deps.tasks.list().some((t) => t.status === 'running' && t.set === target.setId)) throw new Error('这套资料正在下载或换算，先取消任务再删除')
  const state = await handle.target.officialState(target.setId)
  if (!state || state.status !== 'installed') throw new Error(`${target.setId} 还没安装，不能卸载`)
  const books = target.bookIds ?? []
  const adventures = target.adventureIds ?? []
  // 只有书号、来源、冒险号全都没给才是整套；只给来源（书架上没有书号的来源行，如 Generic）按来源移除
  if (!books.length && !adventures.length && !target.bookSources?.length) {
    const gone = { ...state, status: 'missing' as const, sources: [], books: [], adventures: [], dependencyFiles: [] }
    await ops.setTargetOfficial(handle, { [target.setId]: gone })
    return gone
  }
  if (!deps.directory) throw new Error('没有接作者书目入口，不能按书删除')
  const rec = await deps.directory.get(source.codeSet, { commit: state.commit })
  const { nextState, indexes } = await officialRemovalPlan(handle.target, target, state, rec)
  await ops.setTargetOfficial(handle, { [target.setId]: nextState })
  await ops.setTargetIndexes(handle, { ...(handle.target.revision.sourceIndexes ?? {}), ...indexes })
  return nextState
}

/** 保留其他官方资料仍需要的原件与目录键。 */
async function officialRemovalPlan(view: LibraryView, target: OfficialPart, state: import('./db').OfficialSetState, rec: DirectoryRecord) {
  if (rec.errors.books) throw new Error(rec.errors.books)
  const source = getSource(target.setId)
  const books = target.bookIds ?? []
  const adventures = target.adventureIds ?? []
  const allBooks = state.books ?? rec.books.map((b) => String(b.id))
  const allAdventures = state.adventures ?? await installedAdventureIds(view, target.setId)
  const missingBook = books.find((id) => !allBooks.includes(id))
  const missingAdventure = adventures.find((id) => !allAdventures.includes(id))
  if (missingBook) throw new Error(`这本书已经不在已装集合里：${missingBook}`)
  if (missingAdventure) throw new Error(`这本冒险已经不在已装集合里：${missingAdventure}`)
  const removedSources = new Set([
    ...(target.bookSources ?? []),
    ...books.map((id) => rec.books.find((b) => String(b.id) === id)?.source ?? id),
    ...adventures.map((id) => rec.adventures.find((a) => String(a.id) === id)?.source ?? id),
  ].map((s) => String(s).toLowerCase()))
  // 「全部已装」要按本机实际数据展开，不能只用书目里有书号的来源（否则 Generic、基础包等会被一起藏掉，P5 T6 后1）
  const allSources = new Map((state.sources ?? [...Object.keys(rec.sources), ...await installedOfficialSources(view, target.setId)])
    .map((s) => [s.toLowerCase(), s]))
  const selected = new Set<string>()
  const indexes: Record<string, string[] | null> = {}
  for (const [path, allowed] of Object.entries(rec.indexSources)) {
    const map = Object.values(rec.sourceFiles.maps).find((m) => m.indexPath === path)
    const raw = map?.index ?? Object.fromEntries(allowed.map((key) => [key, '']))
    const effective = JSON.parse(await view.filterIndex(path, JSON.stringify(raw), source.codeSet)) as Record<string, string>
    indexes[`${source.codeSet}|${path}`] = Object.keys(effective).filter((key) => {
      const lower = key.toLowerCase()
      const file = map ? `data/${map.dir}/${effective[key]}` : null
      if (removedSources.has(lower) || (state.sources !== null && state.dependencyFiles && !allSources.has(lower))) return false
      allSources.set(lower, allSources.get(lower) ?? key)
      if (file) selected.add(file)
      return true
    })
  }
  const nextBooks = allBooks.filter((id) => !books.includes(id))
  const nextAdventures = allAdventures.filter((id) => !adventures.includes(id))
  const roots = (await view.filePaths(source)).filter((path) => {
    const owner = rec.owners[path]
    if (owner?.kind === 'book') return nextBooks.includes(owner.id)
    if (owner?.kind === 'adventure') return nextAdventures.includes(owner.id)
    return owner?.kind !== 'source' || selected.has(path)
  })
  const needed = await officialDependencies(roots, rec.sourceFiles.maps, async (path) => (await view.fileGet(source, path))?.text ?? null)
  for (const [path, keys] of needed.indexes) {
    const scoped = `${source.codeSet}|${path}`
    indexes[scoped] = [...new Set([...(indexes[scoped] ?? []), ...keys])].sort()
  }
  const nextState = { ...state, status: 'installed' as const, books: nextBooks, adventures: nextAdventures,
    sources: [...allSources].flatMap(([key, value]) => removedSources.has(key) ? [] : [value]), dependencyFiles: needed.files }
  return { nextState, indexes }
}

/** 一次修改里移除一组官方书 / 冒险（可多套）和若干自制包，一起发布（同一种语言的自制存储）。 */
export async function removeParts(
  deps: UninstallDeps,
  parts: { official: OfficialPart[]; brews: Array<{ setId: string; ids: string[] }> },
  supplied?: OperationHandle,
): Promise<UninstallReport> {
  const ops = deps.operations ?? new LibraryOperations({ db: deps.db, revisions: deps.revisions })
  const sets = [...parts.official.map((p) => p.setId), ...parts.brews.map((b) => b.setId)]
  const own = !supplied
  const handle = supplied ?? await ops.begin({ kind: 'remove-parts', set: sets.join(','), codeSet: getSource(sets[0]).codeSet })
  try {
    const official: Record<string, import('./db').OfficialSetState> = {}
    for (const part of parts.official) official[part.setId] = await stageOfficialParts(deps, ops, handle, part)
    const brews: Record<string, { packs: Array<{ docIdLocal: string; stableId: string | null; checksum: string | null }> }> = {}
    for (const b of parts.brews) {
      if (!b.ids.length) continue
      if (!deps.removeBrews) throw new Error('没有接自制包删除入口')
      brews[b.setId] = { packs: (await deps.removeBrews(handle.target, b.setId, b.ids)).packs }
    }
    await ops.publish(handle, { ...(Object.keys(official).length ? { official } : {}), ...(Object.keys(brews).length ? { brews } : {}) })
    const report: UninstallReport = { set: sets[0], sets, files: 0, bytes: 0, derived: 0, brewKept: false, retainedFiles: 0, retainedBytes: 0 }
    for (const id of parts.official.map((p) => p.setId)) {
      await deps.db.files.where('source').equals(id).each((r) => { report.retainedFiles++; report.retainedBytes += r.size })
      await deps.db.fileContents.where('source').equals(id).each((r) => { report.retainedFiles++; report.retainedBytes += r.size })
    }
    for (const id of sets) await deps.afterDelete(id, handle.base.id)
    return report
  } catch (e) {
    if (own) await ops.abort(handle, e)
    throw e
  }
}

/** 官方单本书 / 单本冒险的逻辑移除：只改已装集合和过滤索引，不删共享文件；旧版本仍可读。 */
export async function removeOfficialParts(
  deps: UninstallDeps,
  target: OfficialPart & { removeBrews?: string[] },
  supplied?: OperationHandle,
): Promise<UninstallReport> {
  if (!target.bookIds?.length && !target.bookSources?.length && !target.adventureIds?.length) throw new Error('没有指定要删除的书或冒险')
  const brewSet = deps.brewSetOf?.(getSource(target.setId).codeSet)
  return removeParts(deps, { official: [target], brews: target.removeBrews?.length && brewSet ? [{ setId: brewSet, ids: target.removeBrews }] : [] }, supplied)
}
