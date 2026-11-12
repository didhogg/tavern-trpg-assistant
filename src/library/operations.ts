// P5 T1：库修改的唯一生命周期（准备 → 检查 → 发布）。官方、自制、删除、作者存储写入都从这里走。
// 网络 / 作者小窗调用都在事务外；发布只用短事务比较“基线版本 + 操作令牌 + 取消标记”，然后换已发布指针。
import type { BrewSetState, LibraryDatabase, OfficialSetState, OperationRecord } from './db'
import { LibraryRevisionStore, type LibraryView } from './revision'
import { dataVersionOf, mirrorOfficialToSets } from './revision-data'

const LOCK_ID = 'library'
const LOCK_MS = 10 * 60_000
const DOWNLOAD_LEASE_MS = 75_000
const DOWNLOAD_HEARTBEAT_MS = 10_000
const EXIT_KEY = 'trpg-library:exited-downloads'
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
  signal?: AbortSignal
  heartbeat?: ReturnType<typeof setInterval>
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
  private lastProgress = new Map<string, number>()
  private downloadTokens = new Map<string, string>()

  /** onPublished：每发布一个新版本后调一次（下载、更新、自制、卸载都经过这里）；后端用它安排回收空间。 */
  constructor(private readonly opts: { db: LibraryDatabase; revisions: LibraryRevisionStore; now?: () => number; onPublished?: (revisionId: string) => void; onDiscarded?: () => void }) {}

  private now(): number { return this.opts.now?.() ?? Date.now() }

  async begin(opts: BeginOptions): Promise<OperationHandle> {
    const { db, revisions } = this.opts
    await revisions.ensureLegacy()
    const token = uid()
    const id = opts.id ?? `op-${this.now().toString(36)}-${token}`
    const lease = opts.signal ? DOWNLOAD_LEASE_MS : LOCK_MS
    await this.acquireLock(token, opts.signal, lease)
    try {
      const handle: OperationHandle = await db.transaction('rw', [db.state, db.revisions, db.ops, db.locks], async () => {
        opts.signal?.throwIfAborted()
        const lock = await db.locks.get(LOCK_ID)
        const now = this.now()
        if (lock?.token !== token || lock.expiresAt <= now) throw new Error('修改租约已失效')
        const base = await revisions.published()
        const target = await revisions.createPreparing({
          parent: base, kvScope: `op:${id}`, kvCodeSet: opts.kvCodeSet ?? opts.codeSet, sourceIndexes: opts.sourceIndexes,
        })
        const record: OperationRecord = {
          id, kind: opts.kind, set: opts.set, item: opts.item ?? null, base: base.id, revision: target.id,
          status: 'preparing', stage: 'start', done: 0, total: 0, error: null, token, createdAt: now, updatedAt: now,
        }
        await db.ops.put(record)
        return { record, base, target, signal: opts.signal }
      })
      if (opts.signal) handle.heartbeat = setInterval(() => {
        if (!opts.signal?.aborted) void this.renewLock(token, lease).catch((e: unknown) => console.warn('[trpg-library] 下载续租失败', e))
      }, DOWNLOAD_HEARTBEAT_MS)
      if (opts.signal) this.downloadTokens.set(id, token)
      return handle
    } catch (e) {
      await this.releaseLock(token).catch(() => undefined)
      throw e
    }
  }

  /** 准备版本先记下这次的目标提交号（更新时不是父版本的提交号）。 */
  async setTargetOfficial(handle: OperationHandle, official: Record<string, import('./db').OfficialSetState>): Promise<void> {
    const { db } = this.opts
    await db.transaction('rw', db.revisions, async () => {
      const rev = await db.revisions.get(handle.target.id)
      if (rev?.status !== 'preparing') throw new Error('准备版本已经结束')
      await db.revisions.update(rev.id, { official: { ...(rev.official ?? {}), ...official }, updatedAt: this.now() })
    })
    handle.target = await this.opts.revisions.refresh(handle.target.id)
  }

  async setTargetIndexes(handle: OperationHandle, sourceIndexes: Record<string, string[] | null>): Promise<void> {
    const { db } = this.opts
    await db.transaction('rw', db.revisions, async () => {
      const rev = await db.revisions.get(handle.target.id)
      if (rev?.status !== 'preparing') throw new Error('准备版本已经结束')
      await db.revisions.update(rev.id, { sourceIndexes, updatedAt: this.now() })
    })
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
    await this.renewLock(handle.record.token, handle.signal ? DOWNLOAD_LEASE_MS : LOCK_MS)
  }

  async cancel(id: string): Promise<void> {
    const { db } = this.opts
    await db.transaction('rw', [db.ops], async () => {
      const rec = await db.ops.get(id)
      if (rec?.status !== 'preparing' && rec?.status !== 'publishing') return
      await db.ops.put({ ...rec, status: 'cancelled', error: '用户取消', updatedAt: this.now() })
    })
  }

  /** 发布：只有基线仍是当前版本、操作没被取消时才提交。提交后新版本成为所有新读取的 R。 */
  async publish(handle: OperationHandle, changes: PublishChanges): Promise<LibraryView> {
    handle.signal?.throwIfAborted()
    const { db, revisions } = this.opts
    const baseOfficial = await revisions.allOfficialStates(handle.base)
    const baseBrews = await revisions.allBrewStates(handle.base)
    const official = { ...baseOfficial, ...(changes.official ?? {}) }
    const brews = { ...baseBrews, ...(changes.brews ?? {}) }
    const version = dataVersionOf(official, brews)
    const now = this.now()
    await db.transaction('rw', [db.revisions, db.state, db.ops, db.locks, db.sets], async () => {
      handle.signal?.throwIfAborted()
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
      handle.signal?.throwIfAborted()
      await db.ops.put({ ...op, status: changes.status ?? 'done', result: changes.result ?? op.result ?? null, error: null, updatedAt: now })
    })
    clearInterval(handle.heartbeat)
    this.downloadTokens.delete(handle.record.id)
    await this.releaseLock(handle.record.token)
    this.lastProgress.delete(handle.record.id)
    const fresh = await revisions.refresh(handle.target.id)
    try { this.opts.onPublished?.(handle.target.id) } catch (e) { console.warn('[trpg-assistant] 发布后回调出错', e) }
    return fresh
  }

  /** 失败 / 取消：准备版本作废，已发布版本一动不动。 */
  async abort(handle: OperationHandle, error: unknown, status: 'failed' | 'cancelled' | 'interrupted' = 'failed'): Promise<void> {
    const { db } = this.opts
    clearInterval(handle.heartbeat)
    const now = this.now()
    const message = error instanceof Error ? error.message : String(error)
    await db.transaction('rw', [db.revisions, db.ops, db.locks], async () => {
      const revision = await db.revisions.get(handle.target.id)
      if (revision && revision.status === 'preparing') await db.revisions.put({ ...revision, status: 'aborted', updatedAt: now })
      const op = await db.ops.get(handle.record.id)
      if (op && ['preparing', 'publishing', 'cancelled'].includes(op.status)) {
        const next = handle.signal?.reason?.name === 'NetworkError' ? 'failed' : handle.signal?.aborted || op.status === 'cancelled' ? 'cancelled' : status
        await db.ops.put({ ...op, status: next, error: message, updatedAt: now })
      }
      const lock = await db.locks.get(LOCK_ID)
      if (lock?.token === handle.record.token) await db.locks.delete(LOCK_ID)
    })
    this.downloadTokens.delete(handle.record.id)
    this.lastProgress.delete(handle.record.id)
    this.opts.onDiscarded?.()
  }

  /** pagehide 后数据库写入可能来不及完成；同一标签重开时用这份退出凭据立即收尾。 */
  rememberPageExit(): void {
    if (!this.downloadTokens.size) return
    try {
      sessionStorage.setItem(EXIT_KEY, JSON.stringify([...this.downloadTokens]))
    } catch (e) { console.warn('[trpg-library] 无法登记页面退出，等下载租约到期后清理', e) }
  }

  private readPageExit(): Map<string, string> {
    try {
      if (typeof sessionStorage === 'undefined') return new Map()
      const saved = sessionStorage.getItem(EXIT_KEY)
      if (saved) sessionStorage.removeItem(EXIT_KEY)
      return new Map(saved ? JSON.parse(saved) : [])
    } catch (e) {
      console.warn('[trpg-library] 无法读取退出记录，等下载租约到期后清理', e)
      return new Map()
    }
  }

  /** 启动恢复：未发布的准备版本标中断；已经切了指針但通知没发出的，照实际版本算成功。 */
  async restore(): Promise<OperationRecord[]> {
    const { db } = this.opts
    const exited = this.readPageExit()
    const changed = await db.transaction('rw', [db.ops, db.state, db.locks, db.revisions], async () => {
      const open = await db.ops.where('status').anyOf('preparing', 'publishing', 'cancelled', 'interrupted').toArray()
      const state = await db.state.get('published')
      const now = this.now()
      const recovered: OperationRecord[] = []
      for (const op of open) {
        const revision = await db.revisions.get(op.revision)
        if ((op.status === 'cancelled' || op.status === 'interrupted') && revision?.status !== 'preparing') continue
        const lock = await db.locks.get(LOCK_ID)
        const ownsLock = lock?.token === op.token
        if (state?.revision !== op.revision && ownsLock && lock.expiresAt > now && exited.get(op.id) !== op.token) continue
        const next: OperationRecord = state?.revision === op.revision
          ? { ...op, status: 'done', error: null, updatedAt: now }
          : { ...op, status: 'interrupted', error: '上次修改没有完成，已中断；可以重试', updatedAt: now }
        if (next.status === 'interrupted' && revision?.status === 'preparing') await db.revisions.put({ ...revision, status: 'aborted', updatedAt: now })
        await db.ops.put(next)
        if (ownsLock) await db.locks.delete(LOCK_ID)
        recovered.push(next)
      }
      return recovered
    })
    if (changed.some((op) => op.status === 'interrupted')) this.opts.onDiscarded?.()
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
  /** 拿着修改锁做一件不发布版本的事（空间回收，P5-5 §12 B3）：期间没有别的修改能开始。renew 用来给长任务续租。 */
  async withLock<T>(run: (renew: () => Promise<void>) => Promise<T>): Promise<T> {
    const token = uid()
    await this.acquireLock(token)
    try {
      return await run(() => this.renewLock(token))
    } finally {
      await this.releaseLock(token)
    }
  }

  private async acquireLock(token: string, signal?: AbortSignal, lease = LOCK_MS): Promise<void> {
    const started = this.now()
    for (;;) {
      if (signal?.aborted) throw new Error('操作已取消')
      const now = this.now()
      const { db } = this.opts
      const got = await db.transaction('rw', [db.locks, db.ops, db.revisions], async () => {
        const cur = await this.opts.db.locks.get(LOCK_ID)
        if (cur && cur.expiresAt > now && cur.token !== token) return false
        if (cur && cur.expiresAt <= now && cur.token !== token) {
          // 过期租约接管：旧操作失去发布权，标中断；旧回包之后会被 publish 的令牌校验挡住。
          const stale = await db.ops.where('status').anyOf('preparing', 'publishing', 'cancelled').toArray()
          for (const op of stale.filter((o) => o.token === cur.token)) {
            const revision = await db.revisions.get(op.revision)
            if (revision?.status === 'preparing') await db.revisions.put({ ...revision, status: 'aborted', updatedAt: now })
            await db.ops.put({ ...op, status: 'interrupted', error: '修改租约已过期，已由新的操作接管', updatedAt: now })
          }
        }
        await this.opts.db.locks.put({ id: LOCK_ID, token, owner: token, expiresAt: now + lease })
        return true
      })
      if (got) return
      if (this.now() - started > LOCK_WAIT_MS) throw new Error('另一个窗口长时间在修改资料，请等它完成后再试')
      await new Promise((resolve) => setTimeout(resolve, 200))
    }
  }

  private async renewLock(token: string, lease = LOCK_MS): Promise<void> {
    await this.opts.db.transaction('rw', [this.opts.db.locks], async () => {
      const lock = await this.opts.db.locks.get(LOCK_ID)
      if (!lock || lock.token !== token) return
      await this.opts.db.locks.put({ ...lock, expiresAt: this.now() + lease })
    })
  }

  private async releaseLock(token: string): Promise<void> {
    await this.opts.db.transaction('rw', [this.opts.db.locks], async () => {
      const lock = await this.opts.db.locks.get(LOCK_ID)
      if (lock?.token === token) await this.opts.db.locks.delete(LOCK_ID)
    })
  }
}
