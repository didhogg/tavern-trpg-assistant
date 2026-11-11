// P5 T1：库修改的唯一生命周期（准备 → 检查 → 发布）。官方、自制、删除、作者存储写入都从这里走。
// 网络 / 作者小窗调用都在事务外；发布只用短事务比较“基线版本 + 操作令牌 + 取消标记”，然后换已发布指针。
import type { BrewSetState, LibraryDatabase, OfficialSetState, OperationRecord } from './db'
import { LibraryRevisionStore, type LibraryView } from './revision'
import { dataVersionOf, mirrorOfficialToSets } from './revision-data'

const LOCK_ID = 'library'
const LOCK_MS = 10 * 60_000
/** 操作记录超过这么久没有心跳，才当成上次遗留的中断；仍活着的窗口会持续更新。 */
const STALE_MS = 60_000
const LOCK_WAIT_MS = 5 * 60_000
const PROGRESS_MS = 400

const uid = (): string => {
  const bytes = crypto.getRandomValues(new Uint8Array(8))
  return [...bytes].map((b) => b.toString(36).padStart(2, '0')).join('')
}

export interface OperationHandle {
  record: OperationRecord
  base: LibraryView
  target: LibraryView
}

export interface PublishChanges {
  official?: Record<string, OfficialSetState>
  brews?: Record<string, BrewSetState>
  sourceIndexes?: Record<string, string[] | null>
  status?: 'done' | 'partial'
  result?: unknown
}

export interface BeginOptions {
  id?: string
  kind: string
  set: string
  item?: string | null
  codeSet: string
  kvCodeSet?: string
  sourceIndexes?: Record<string, string[] | null>
  signal?: AbortSignal
}

export class LibraryOperations {
  private readonly handles = new Map<string, OperationHandle>()
  private lastProgress = new Map<string, number>()

  constructor(private readonly opts: { db: LibraryDatabase; revisions: LibraryRevisionStore; now?: () => number }) {}

  private now(): number { return this.opts.now?.() ?? Date.now() }

  async begin(opts: BeginOptions): Promise<OperationHandle> {
    const { db, revisions } = this.opts
    await revisions.ensureLegacy()
    const token = uid()
    const id = opts.id ?? `op-${this.now().toString(36)}-${token}`
    await this.acquireLock(token, opts.signal)
    try {
      const base = await revisions.published()
      const target = await revisions.createPreparing({
        parent: base,
        kvScope: `op:${id}`,
        kvCodeSet: opts.kvCodeSet ?? opts.codeSet,
        sourceIndexes: opts.sourceIndexes,
      })
      const now = this.now()
      const record: OperationRecord = {
        id, kind: opts.kind, set: opts.set, item: opts.item ?? null, base: base.id, revision: target.id,
        status: 'preparing', stage: 'start', done: 0, total: 0, error: null, token,
        createdAt: now, updatedAt: now,
      }
      await db.ops.put(record)
      const handle = { record, base, target }
      this.handles.set(id, handle)
      return handle
    } catch (e) {
      await this.releaseLock(token).catch(() => undefined)
      throw e
    }
  }

  /** 准备版本先记下这次的目标提交号（更新时不是父版本的提交号）。 */
  async setTargetOfficial(handle: OperationHandle, official: Record<string, import('./db').OfficialSetState>): Promise<void> {
    const rev = await this.opts.db.revisions.get(handle.target.id)
    if (!rev) throw new Error('准备版本不在了')
    await this.opts.db.revisions.put({ ...rev, official: { ...(rev.official ?? {}), ...official }, updatedAt: this.now() })
    handle.target = await this.opts.revisions.refresh(handle.target.id)
  }

  async setTargetIndexes(handle: OperationHandle, sourceIndexes: Record<string, string[] | null>): Promise<void> {
    const rev = await this.opts.db.revisions.get(handle.target.id)
    if (!rev) throw new Error('准备版本不在了')
    await this.opts.db.revisions.put({ ...rev, sourceIndexes, updatedAt: this.now() })
    handle.target = await this.opts.revisions.refresh(handle.target.id)
  }

  async progress(handle: OperationHandle, p: { stage: string; done: number; total: number; item?: string }): Promise<void> {
    const now = this.now()
    const last = this.lastProgress.get(handle.record.id) ?? 0
    if (now - last < PROGRESS_MS && p.stage === handle.record.stage) return
    this.lastProgress.set(handle.record.id, now)
    // 进度只能改进度字段；不能把状态写回 preparing（别的窗口可能已经取消 / 中断），P5 核验 6。
    let wrote = false
    await this.opts.db.transaction('rw', [this.opts.db.ops], async () => {
      const rec = await this.opts.db.ops.get(handle.record.id)
      if (!rec || (rec.status !== 'preparing' && rec.status !== 'publishing')) return
      await this.opts.db.ops.put({ ...rec, stage: p.stage, done: p.done, total: p.total, ...(p.item ? { progressItem: p.item } : {}), updatedAt: now })
      wrote = true
    })
    if (!wrote) return
    handle.record = { ...handle.record, stage: p.stage, done: p.done, total: p.total, ...(p.item ? { progressItem: p.item } : {}), updatedAt: now }
    await this.renewLock(handle.record.token)
  }

  async cancel(id: string): Promise<void> {
    const rec = await this.opts.db.ops.get(id)
    if (!rec) return
    if (rec.status === 'done' || rec.status === 'partial') return
    await this.opts.db.ops.put({ ...rec, status: 'cancelled', error: '用户取消', updatedAt: this.now() })
    const handle = this.handles.get(id)
    if (handle) handle.record = { ...handle.record, status: 'cancelled' }
  }

  /** 发布：只有基线仍是当前版本、操作没被取消时才提交。提交后新版本成为所有新读取的 R。 */
  async publish(handle: OperationHandle, changes: PublishChanges): Promise<LibraryView> {
    const { db, revisions } = this.opts
    const baseOfficial = await revisions.allOfficialStates(handle.base)
    const baseBrews = await revisions.allBrewStates(handle.base)
    const official = { ...baseOfficial, ...(changes.official ?? {}) }
    const brews = { ...baseBrews, ...(changes.brews ?? {}) }
    const version = dataVersionOf(official, brews)
    const now = this.now()
    await db.transaction('rw', [db.revisions, db.state, db.ops, db.locks, db.sets], async () => {
      const current = await db.state.get('published')
      if ((current?.revision ?? null) !== handle.base.id) throw new Error('资料已经换过版本，这次结果已过期，请重试')
      const lock = await db.locks.get(LOCK_ID)
      if (!lock || lock.token !== handle.record.token || lock.expiresAt <= now) throw new Error('修改租约已失效（可能另一个窗口接手了），这次结果不能发布')
      const op = await db.ops.get(handle.record.id)
      if (!op || op.status !== 'preparing') throw new Error(op?.status === 'cancelled' ? '操作已取消，没有发布' : '操作已经中断或不在可发布状态，没有发布')
      const revision = await db.revisions.get(handle.target.id)
      if (!revision) throw new Error('准备版本不在了，不能发布')
      await db.revisions.put({
        ...revision, status: 'published', official, brews,
        ...(changes.sourceIndexes !== undefined ? { sourceIndexes: changes.sourceIndexes } : {}),
        dataVersion: version, publishedAt: now, updatedAt: now,
      })
      await db.state.put({ id: 'published', revision: revision.id, updatedAt: now })
      const gen = await db.state.get('generation')
      await db.state.put({ id: 'generation', value: Number(gen?.value ?? 0) + 1, updatedAt: now })
      await this.mirrorSets(official)
      await db.ops.put({ ...op, status: changes.status ?? 'done', result: changes.result ?? op.result ?? null, error: null, updatedAt: now })
    })
    await this.releaseLock(handle.record.token)
    this.handles.delete(handle.record.id)
    const fresh = await revisions.refresh(handle.target.id)
    return fresh
  }

  /** 失败 / 取消：准备版本作废，已发布版本一动不动。 */
  async abort(handle: OperationHandle, error: unknown, status: 'failed' | 'cancelled' = 'failed'): Promise<void> {
    const { db } = this.opts
    const now = this.now()
    const message = error instanceof Error ? error.message : String(error)
    await db.transaction('rw', [db.revisions, db.ops, db.locks], async () => {
      const revision = await db.revisions.get(handle.target.id)
      if (revision && revision.status === 'preparing') await db.revisions.put({ ...revision, status: 'aborted', updatedAt: now })
      const op = await db.ops.get(handle.record.id)
      if (op && op.status !== 'done' && op.status !== 'partial') await db.ops.put({ ...op, status, error: message, updatedAt: now })
      const lock = await db.locks.get(LOCK_ID)
      if (lock?.token === handle.record.token) await db.locks.delete(LOCK_ID)
    })
    this.handles.delete(handle.record.id)
  }

  /** 启动恢复：未发布的准备版本标中断；已经切了指針但通知没发出的，照实际版本算成功。 */
  async restore(): Promise<OperationRecord[]> {
    const { db } = this.opts
    const open = await db.ops.where('status').anyOf('preparing', 'publishing').toArray()
    const state = await db.state.get('published')
    const now = this.now()
    const changed: OperationRecord[] = []
    for (const op of open) {
      if (state?.revision === op.revision) {
        const done = { ...op, status: 'done' as const, error: null, updatedAt: now }
        await db.ops.put(done)
        const lock = await db.locks.get(LOCK_ID)
        if (lock && lock.token === op.token) await db.locks.delete(LOCK_ID)
        changed.push(done)
        continue
      }
      // 另一个窗口可能还在跑：只有超过心跳窗口、且租约也不是它的（或已过期）才判中断。
      const lock = await db.locks.get(LOCK_ID)
      const liveLock = !!lock && lock.token === op.token && lock.expiresAt > now
      const stale = now - Number(op.updatedAt ?? 0) > STALE_MS
      if (liveLock && !stale) continue
      const interrupted = { ...op, status: 'interrupted' as const, error: '上次修改没有完成，已中断；可以重试', updatedAt: now }
      await db.ops.put(interrupted)
      if (lock && lock.token === op.token) await db.locks.delete(LOCK_ID)
      changed.push(interrupted)
    }
    return changed
  }

  async get(id: string): Promise<OperationRecord | undefined> {
    return this.opts.db.ops.get(id)
  }

  async list(): Promise<OperationRecord[]> {
    return this.opts.db.ops.orderBy('updatedAt').reverse().toArray()
  }

  private async mirrorSets(official: Record<string, OfficialSetState>): Promise<void> {
    await mirrorOfficialToSets(this.opts.db, official)
  }

  /** 正常入口（开战役会连续启动中英两套）在这里排队，不直接拒绝第二个操作。 */
  private async acquireLock(token: string, signal?: AbortSignal): Promise<void> {
    const started = this.now()
    for (;;) {
      if (signal?.aborted) throw new Error('操作已取消')
      const now = this.now()
      const got = await this.opts.db.transaction('rw', [this.opts.db.locks], async () => {
        const cur = await this.opts.db.locks.get(LOCK_ID)
        if (cur && cur.expiresAt > now && cur.token !== token) return false
        await this.opts.db.locks.put({ id: LOCK_ID, token, owner: token, expiresAt: now + LOCK_MS })
        return true
      })
      if (got) return
      if (this.now() - started > LOCK_WAIT_MS) throw new Error('另一个窗口长时间在修改资料，请等它完成后再试')
      await new Promise((resolve) => setTimeout(resolve, 200))
    }
  }

  private async renewLock(token: string): Promise<void> {
    await this.opts.db.transaction('rw', [this.opts.db.locks], async () => {
      const lock = await this.opts.db.locks.get(LOCK_ID)
      if (!lock || lock.token !== token) return
      await this.opts.db.locks.put({ ...lock, expiresAt: this.now() + LOCK_MS })
    })
  }

  private async releaseLock(token: string): Promise<void> {
    await this.opts.db.transaction('rw', [this.opts.db.locks], async () => {
      const lock = await this.opts.db.locks.get(LOCK_ID)
      if (lock?.token === token) await this.opts.db.locks.delete(LOCK_ID)
    })
  }
}
