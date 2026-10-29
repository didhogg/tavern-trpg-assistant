import { defineStore } from 'pinia'
import { computed, ref, shallowRef } from 'vue'
import { TrpgError } from '../core/errors'
import type { Resolution } from '../core/packs/installer'
import type { RecognizedPack } from '../core/packs/recognize'
import { checkIntegrity, type Issue } from '../core/library/integrity'
import { featureUpdates } from '../core/library/features'
import { getBuiltinRemoved, getUserRemoved, setUserRemoved } from '../core/packs/builtins'
import { downloadPack, fetchCatalog, findDownloadable, findUpdates, installDownloaded } from '../core/packs/catalog'
import type { Catalog, CatalogPack, InstalledPack } from '../schemas/pack'
import { useAppStore } from './app'
import { useCampaignStore } from './campaign'

export type TaskState = 'waiting' | 'downloading' | 'installing' | 'failed'

export interface PackTask {
  id: string
  state: TaskState
  received: number
  total: number
  error?: string
}

/** 库的状态：已安装的包、数据仓库目录、下载与安装任务。 */
export const useLibraryStore = defineStore('library', () => {
  const app = useAppStore()
  const campaign = useCampaignStore()
  const installed = shallowRef<InstalledPack[]>([])
  const catalog = shallowRef<Catalog | null>(null)
  const catalogState = ref<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const catalogError = ref('')
  const tasks = ref<Record<string, PackTask>>({})
  const issues = shallowRef<Issue[]>([])
  const builtinRemoved = ref<string[]>([])
  let entryIndex: Map<string, string> | null = null

  const installedMap = computed(() => new Map(installed.value.map((p) => [p.id, p])))
  const updates = computed(() => (catalog.value ? findUpdates(installed.value, catalog.value) : []))

  function downloadable(ruleId: string): CatalogPack[] {
    return catalog.value ? findDownloadable(installed.value, catalog.value, ruleId) : []
  }

  async function refreshInstalled(): Promise<void> {
    installed.value = await app.svc().packs.list()
    builtinRemoved.value = await getBuiltinRemoved(app.svc().db)
    entryIndex = null
  }

  /** 本存档的体检：读取存档后、启用或停用扩展后在后台运行。 */
  async function runIntegrity(): Promise<Issue[]> {
    const ws = campaign.workspace
    issues.value = ws ? await checkIntegrity(app.svc().db, ws.data) : []
    return issues.value
  }

  /** 存档里的包有比已复制的更新的功能定义：包 id → 数量。 */
  const featureUpdateCounts = computed(() => (campaign.workspace ? featureUpdates(campaign.workspace.data, installedMap.value) : new Map<string, number>()))

  /** 按条目 id 找它所在的已安装包（条目里的 {{ref:…}} 关联术语用）。 */
  async function packOfEntry(entryId: string): Promise<string | undefined> {
    if (!entryIndex) {
      const keys = (await app.svc().db.entries.toCollection().primaryKeys()) as Array<[string, string]>
      entryIndex = new Map(keys.map(([packId, id]) => [id, packId]))
    }
    return entryIndex.get(entryId)
  }

  async function loadCatalog(force = false): Promise<boolean> {
    catalogState.value = 'loading'
    try {
      const s = app.svc()
      catalog.value = await fetchCatalog({ url: app.catalogUrl(), db: s.db, force })
      catalogState.value = 'ok'
      catalogError.value = ''
      return true
    } catch (error) {
      console.error('[trpg-assistant] 读取数据仓库目录失败', error)
      catalogState.value = 'error'
      catalogError.value = error instanceof Error ? error.message : String(error)
      return false
    }
  }

  function setTask(id: string, patch: Partial<PackTask>): void {
    const base: PackTask = tasks.value[id] ?? { id, state: 'waiting', received: 0, total: 0 }
    tasks.value = { ...tasks.value, [id]: { ...base, ...patch } }
  }

  function clearTask(id: string): void {
    const { [id]: _removed, ...rest } = tasks.value
    tasks.value = rest
  }

  /** 要先装的包：目录里能找到的、尚未安装的 requires（含间接）；顺序为先依赖后本包。 */
  function withRequires(pack: CatalogPack): CatalogPack[] {
    const out: CatalogPack[] = []
    const seen = new Set<string>()
    const visit = (p: CatalogPack): void => {
      if (seen.has(p.id)) return
      seen.add(p.id)
      for (const dep of p.relationships.requires) {
        if (installedMap.value.has(dep.id)) continue
        const found = catalog.value?.packs.find((c) => c.id === dep.id)
        if (found) visit(found)
      }
      out.push(p)
    }
    visit(pack)
    return out
  }

  /** 安装或更新：缺少的必需包会先排队安装。返回本包是否成功。 */
  async function install(pack: CatalogPack): Promise<boolean> {
    const list = withRequires(pack)
    let ok = true
    for (const p of list) await setUserRemoved(app.svc().db, p.id, false)
    for (const p of list) setTask(p.id, { state: 'waiting', received: 0, total: p.byteSize, error: undefined })
    const runs = list.map((p) =>
      app.queue
        .enqueue({
          id: `pack:${p.id}`,
          label: `安装 ${p.name}`,
          run: async (signal) => {
            const s = app.svc()
            setTask(p.id, { state: 'downloading', total: p.byteSize })
            const bytes = await downloadPack(p, {
              catalogUrl: app.catalogUrl(),
              signal,
              onProgress: (received, total) => setTask(p.id, { received, total }),
            })
            setTask(p.id, { state: 'installing' })
            await installDownloaded(s.packs, bytes, p)
          },
        })
        .then(async () => {
          clearTask(p.id)
          await refreshInstalled()
        })
        .catch((error: unknown) => {
          if (p.id === pack.id) ok = false
          if (error instanceof TrpgError && error.code === 'E_CANCELLED') clearTask(p.id)
          else {
            console.error(`[trpg-assistant] 安装失败：${p.id}`, error)
            setTask(p.id, { state: 'failed', error: error instanceof Error ? error.message : String(error) })
          }
        }),
    )
    await Promise.all(runs)
    return ok
  }

  /** 安装导入的文件（走同一个操作队列）。 */
  async function installFile(rec: RecognizedPack, resolution?: Resolution): Promise<InstalledPack> {
    try {
      return await app.queue.enqueue({
        id: `file:${rec.manifest.id}`,
        label: `导入 ${rec.manifest.name}`,
        run: () => app.svc().packs.install(rec, { source: 'import', resolution }),
      })
    } finally {
      await refreshInstalled()
    }
  }

  /** 等这些包的下载与安装都结束（成功或失败）。 */
  function waitFor(ids: string[]): Promise<void> {
    const pending = () => ids.some((id) => app.queue.state(`pack:${id}`) !== undefined)
    if (!pending()) return Promise.resolve()
    return new Promise((resolve) => {
      const off = app.queue.onChange(() => {
        if (pending()) return
        off()
        resolve()
      })
    })
  }

  /**
   * 首次使用某规则：把目录里标为推荐的包加入下载队列（L1 §3.3）。
   * 跳过玩家卸载过的包；全部成功后记为完成，有失败则保留未完成，下次再试。
   */
  async function ensureRecommended(ruleId: string): Promise<void> {
    const s = app.svc()
    const state = (await s.db.getMeta<Record<string, { done: boolean }>>('autoInstall'))?.[ruleId]
    if (state?.done || !catalog.value) return
    const skip = new Set([...(await getUserRemoved(s.db)), ...(await getBuiltinRemoved(s.db))])
    const todo = catalog.value.packs.filter((p) => p.ruleId === ruleId && p.recommended && !installedMap.value.has(p.id) && !skip.has(p.id))
    await Promise.all(todo.map((p) => install(p)))
    const failed = catalog.value.packs.some((p) => p.ruleId === ruleId && p.recommended && !skip.has(p.id) && !installedMap.value.has(p.id))
    const all = { ...((await s.db.getMeta<Record<string, { done: boolean; at?: number }>>('autoInstall')) ?? {}) }
    all[ruleId] = failed ? { done: false } : { done: true, at: s.now() }
    await s.db.setMeta('autoInstall', all)
  }

  function cancel(id: string): void {
    app.queue.cancel(`pack:${id}`)
  }

  function queueState(id: string): 'waiting' | 'running' | undefined {
    return app.queue.state(`pack:${id}`)
  }

  return { installed, issues, builtinRemoved, featureUpdateCounts, runIntegrity, packOfEntry, catalog, catalogState, catalogError, tasks, installedMap, updates, downloadable, refreshInstalled, loadCatalog, install, installFile, waitFor, ensureRecommended, cancel, queueState, clearTask }
})
