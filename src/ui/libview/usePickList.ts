// 从库里选一条的列表（从模板加入、人物加物品共用）：本战役能看到的某一类条目（和库同一份数据）+ 搜名字 + 当前选中 + 虚拟滚动。
import { computed, onMounted, ref, shallowRef, watch, type Ref } from 'vue'
import type { CampaignLibrary, EntryRef } from '../../library/scopes'
import type { ScopedRow } from '../../library/scoped'
import { useAppStore } from '../../stores/app'
import { useCampaignStore } from '../../stores/campaign'
import { useLibViewStore } from '../../stores/libview'
import { nameOf } from './pack-data'
import { useVirtual } from './useVirtual'

export interface PickItem { row: ScopedRow; name: string }
export const pickKey = (r: ScopedRow): string => `${r.ref.set}:${r.ref.prop}:${r.ref.hash}:${r.pack?.docIdLocal ?? ''}`

/** propOf：按本战役的库定是哪一类（规则数据里写着）；没有就抛错说明。 */
/** keep：只留哪些行（例：选子职业只留这个人职业的子职业），不给 = 全部。 */
export function usePickList(propOf: (lib: CampaignLibrary) => string, scrollEl: Ref<HTMLElement | null>, what: string, keep?: (item: Record<string, unknown>) => boolean) {
  const app = useAppStore()
  const campaign = useCampaignStore()
  const lib = useLibViewStore()
  const rows = shallowRef<PickItem[] | null>(null)
  const error = ref<string | null>(null)
  const q = ref('')
  const picked = ref<string | null>(null)
  async function load(): Promise<void> {
    error.value = null
    try {
      const key = campaign.owner?.ownerKey
      if (!key) throw new Error('还没有当前战役')
      const library = await app.svc().backend.kernelSave.libraryOf(key)
      const list = await app.svc().backend.library.scoped.query(library, propOf(library))
      rows.value = list.filter((row) => !keep || keep(row.item as Record<string, unknown>)).map((row) => ({ row, name: nameOf(row.item) })).sort((a, b) => a.name.localeCompare(b.name, 'zh'))
    } catch (e) { console.error(`[trpg-assistant] 读取${what}失败`, e); error.value = e instanceof Error ? e.message : String(e) }
  }
  // 资料卡（库的条目页）要读「本战役选书设置」：没读过就先读
  onMounted(() => { void load(); if (!lib.campaignLib || !lib.bound) void lib.load(app.svc(), campaign.owner?.ownerKey ?? null) })
  const shown = computed(() => { const n = q.value.trim().toLowerCase(); return (rows.value ?? []).filter((r) => !n || r.name.toLowerCase().includes(n)) })
  const current = computed(() => shown.value.find((r) => pickKey(r.row) === picked.value) ?? null)
  // 搜索后当前这条不在结果里：自动换成结果里的第一条
  watch(shown, (list) => { if (!list.some((r) => pickKey(r.row) === picked.value)) picked.value = list[0] ? pickKey(list[0].row) : null }, { immediate: true })
  const { range } = useVirtual(scrollEl, computed(() => shown.value.length))
  const visible = computed(() => shown.value.slice(range.value.start, range.value.end))
  const ref_ = computed<EntryRef | null>(() => current.value?.row.ref ?? null)
  return { rows, error, q, picked, load, shown, current, range, visible, ref_, lib }
}
