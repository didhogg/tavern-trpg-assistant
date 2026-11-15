import { defineStore } from 'pinia'
import { computed, ref, shallowRef } from 'vue'
import type { EntryRef } from '../library/scopes'
import type { LoadedActor, RosterRow } from '../rules/kernel/people'
import { askConfirm } from '../ui/kit/confirm'
import { useAppStore } from './app'
import { useCampaignStore } from './campaign'
import { useToastStore } from './toast'

/** 人物分类（界面登记表：加一类 = 加一行；存在人物的「个人调整」里，字段 category）。 */
export const CATEGORIES = [
  { id: 'party', label: '队伍' },
  { id: 'npc', label: 'NPC' },
  { id: 'enemy', label: '敌人' },
] as const
export type CategoryId = (typeof CATEGORIES)[number]['id']
export type ListView = CategoryId | 'all' | 'trash'
export type SortId = 'manual' | 'name'
export const SORTS: Array<{ id: SortId; label: string }> = [{ id: 'manual', label: '手动' }, { id: 'name', label: '名字' }]

const isCategory = (v: unknown): v is CategoryId => CATEGORIES.some((c) => c.id === v)
/** 没有分类的人：玩家角色算队伍，其余（怪物 / NPC）算 NPC。只决定放在哪个标签，不改存档。 */
export const categoryOf = (r: RosterRow): CategoryId => isCategory(r.adjustments.category) ? r.adjustments.category : r.type === 'character' || r.type === null ? 'party' : 'npc'
export const isTrashed = (r: RosterRow): boolean => r.adjustments.trashed === true
export const isPinned = (r: RosterRow): boolean => r.adjustments.pinned === true
const tagsOf = (r: RosterRow): string[] => Array.isArray(r.adjustments.tags) ? r.adjustments.tags.map(String) : []

/** 人物列表页的状态与操作：界面只经这里调 `backend.people`（读 / 写 / 撤销），数值全由结算内核给。 */
export const useRosterStore = defineStore('people', () => {
  const app = useAppStore()
  const campaign = useCampaignStore()
  const toast = useToastStore()

  const rows = shallowRef<RosterRow[]>([])
  const loaded = shallowRef<Record<string, LoadedActor>>({})
  const loading = ref(false)
  const error = ref<string | null>(null)
  const loadedFor = ref<string | null>(null)
  const view = ref<ListView>('party')
  const sort = ref<SortId>('manual')
  const query = ref('')
  const selecting = ref(false)
  const selected = ref<string[]>([])
  let inflight: Promise<void> | null = null

  const ownerKey = (): string | null => campaign.owner?.ownerKey ?? null
  const stamp = (): string => `${ownerKey() ?? ''}|${campaign.workspace?.currentSaveId ?? ''}`
  const backend = () => app.svc().backend.people

  /** 装人进结算小窗 + 读列表（进战役 / 读档后调；同时只跑一次）。 */
  function load(): Promise<void> {
    if (inflight) return inflight
    const key = ownerKey()
    if (!key || !campaign.workspace?.data?.kernel) { rows.value = []; loaded.value = {}; loadedFor.value = null; return Promise.resolve() }
    loading.value = true
    inflight = (async () => {
      try {
        const results = await backend().load(key)
        loaded.value = Object.fromEntries(results.map((r) => [r.id, r]))
        rows.value = await backend().roster(key)
        error.value = null
        loadedFor.value = stamp()
      } catch (e) {
        error.value = e instanceof Error ? e.message : String(e)
      } finally {
        loading.value = false
        inflight = null
      }
    })()
    return inflight
  }
  /** 打开人物页时：没装过（或换了聊天 / 存档）就装，装过就只刷新列表。 */
  async function ensure(): Promise<void> {
    if (loadedFor.value !== stamp()) return load()
    await refresh()
  }
  async function refresh(): Promise<void> {
    const key = ownerKey()
    if (!key) return
    try { rows.value = await backend().roster(key); error.value = null } catch (e) { error.value = e instanceof Error ? e.message : String(e) }
  }

  // ---- 显示：分类 / 搜索 / 排序只改显示 ----
  const live = computed(() => rows.value.filter((r) => !isTrashed(r)))
  const trash = computed(() => rows.value.filter(isTrashed))
  const counts = computed(() => ({
    all: live.value.length, trash: trash.value.length,
    ...Object.fromEntries(CATEGORIES.map((c) => [c.id, live.value.filter((r) => categoryOf(r) === c.id).length])),
  }) as Record<ListView, number>)
  const matches = (r: RosterRow, q: string): boolean =>
    !q || [r.name, r.race ?? '', r.background ?? '', ...r.classes.map((c) => c.name), ...tagsOf(r)].some((t) => t.toLowerCase().includes(q))
  const ordered = (list: RosterRow[]): RosterRow[] => {
    const base = sort.value === 'name' ? [...list].sort((a, b) => a.name.localeCompare(b.name, 'zh')) : list
    return [...base.filter(isPinned), ...base.filter((r) => !isPinned(r))]
  }
  const visible = computed<RosterRow[]>(() => {
    const q = query.value.trim().toLowerCase()
    if (view.value === 'trash') return ordered(trash.value.filter((r) => matches(r, q)))
    const pool = live.value.filter((r) => matches(r, q))
    return ordered(view.value === 'all' ? pool : pool.filter((r) => categoryOf(r) === view.value))
  })
  /** 搜不到时：别的分类里有几个（提示「在 NPC 里有，去看」）。 */
  const elsewhere = computed(() => {
    const q = query.value.trim().toLowerCase()
    if (!q || view.value === 'all' || view.value === 'trash' || visible.value.length) return null
    const hit = CATEGORIES.map((c) => ({ ...c, n: live.value.filter((r) => categoryOf(r) === c.id && matches(r, q)).length })).find((c) => c.id !== view.value && c.n > 0)
    return hit ?? null
  })

  function setView(next: ListView): void { view.value = next; selected.value = [] }
  function toggleSelecting(on = !selecting.value): void { selecting.value = on; selected.value = [] }
  function toggle(id: string): void { selected.value = selected.value.includes(id) ? selected.value.filter((x) => x !== id) : [...selected.value, id] }
  const selectAllVisible = (): void => { selected.value = visible.value.map((r) => r.id) }

  // ---- 写：每一步先写存档，再刷新，提示条带 [撤销] ----
  const readOnlyReason = '另一个窗口正在使用助手，这里只能查看'
  async function undoSteps(n: number): Promise<void> {
    const key = ownerKey()
    if (!key) return
    try { for (let i = 0; i < n; i++) await backend().undo(key) } catch (e) { toast.error(`撤销失败：${e instanceof Error ? e.message : String(e)}`) }
    await refresh()
  }
  async function run(message: string, steps: number, action: (key: string) => Promise<void>): Promise<boolean> {
    const key = ownerKey()
    if (!key) return false
    if (campaign.readOnly) { toast.error(readOnlyReason); return false }
    try {
      await action(key)
    } catch (e) {
      toast.error(`${message}失败：${e instanceof Error ? e.message : String(e)}`)
      await refresh()
      return false
    }
    await refresh()
    toast.undoable(message, () => undoSteps(steps))
    return true
  }
  const nameOf = (ids: string[]): string => ids.length === 1 ? `「${rows.value.find((r) => r.id === ids[0])?.name ?? ''}」` : `${ids.length} 个人物`

  const move = (ids: string[], category: CategoryId) => run(`已把${nameOf(ids)}移到${CATEGORIES.find((c) => c.id === category)?.label}`, 1, async (k) => { await backend().adjust(k, ids, { category }) })
  const pin = (ids: string[], on: boolean) => run(`${on ? '已置顶' : '已取消置顶'}${nameOf(ids)}`, 1, async (k) => { await backend().adjust(k, ids, { pinned: on ? true : null }) })
  const trashed = (ids: string[], on: boolean) => run(`${on ? '已删除' : '已恢复'}${nameOf(ids)}${on ? '（可在回收站找回）' : ''}`, 1, async (k) => { await backend().adjust(k, ids, { trashed: on ? true : null }) })

  /** 复制：一人一次（每次都是存档里的一步，撤销就退几步）；名字由后端按取名规则给（「盖尔 2」「地精 4」…）。 */
  async function copy(ids: string[]): Promise<boolean> {
    let failed = ''
    let made = 0
    const ok = await run(`已复制${nameOf(ids)}`, ids.length, async (k) => {
      for (const id of ids) {
        const out = await backend().copy(k, id)
        if (out.kernel) made++
        else failed = (out.result as { error?: string }).error ?? '资料不全，建不出这个人物'
      }
      if (!made) throw new Error(failed)
    })
    if (ok && failed) toast.error(`有人物没复制成功：${failed}`)
    return ok
  }

  /** 从模板（库里的怪物 / NPC）加入 count 个，放进 category；一次加人是存档里的一步。成功后记在 lastAdded，模板窗里显示「本次已加入 + 撤销」。 */
  const lastAdded = shallowRef<{ label: string; count: number } | null>(null)
  async function addFromTemplate(ref: EntryRef, label: string, count: number, category: CategoryId): Promise<boolean> {
    const ok = await run(`已加入 ${label} ×${count}`, 1, async (k) => {
      const out = await backend().fromTemplate(k, ref, count, { category })
      if (!out.kernel) throw new Error((out.made as { error?: string }).error ?? '资料不全，建不出这个人物')
    })
    if (ok) lastAdded.value = { label, count }
    return ok
  }
  async function undoAdded(): Promise<void> { lastAdded.value = null; await undoSteps(1) }

  /** 彻底删除（只在回收站里）：先问，可撤销。 */
  async function purge(ids: string[]): Promise<boolean> {
    const yes = await askConfirm({ title: '彻底删除', message: `彻底删除${nameOf(ids)}？删除后不在回收站里，只能用提示条的「撤销」马上找回。`, confirmLabel: '彻底删除', danger: true })
    return yes ? run(`已彻底删除${nameOf(ids)}`, 1, async (k) => { await backend().purge(k, ids); selected.value = [] }) : false
  }

  return {
    rows, loaded, loading, error, view, sort, query, selecting, selected, visible, counts, elsewhere, trash,
    lastAdded, addFromTemplate, undoAdded, load, ensure, refresh, setView, toggleSelecting, toggle, selectAllVisible, move, pin, trashed, copy, purge,
  }
})
