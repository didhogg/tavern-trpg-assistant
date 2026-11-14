// 「看改了什么」：一行展开后和原件比的字段变化（后端 editChanges）+ 字段中文名（后端 custom.fields）。覆盖列表和单条版本管理共用。
import { ref, shallowRef } from 'vue'
import type { FieldChange } from '../../library/house-diff'
import type { EntryRef } from '../../library/scopes'
import { getSource } from '../../library/sources'
import { useAppStore } from '../../stores/app'
import { useLibViewStore } from '../../stores/libview'

export type DiffState = FieldChange[] | 'loading' | string

export function useEditDiff() {
  const app = useAppStore()
  const lib = useLibViewStore()
  const open = ref<string | null>(null)
  const diffs = shallowRef<Record<string, DiffState>>({})
  const labels = shallowRef<Record<string, Record<string, string>>>({})

  async function toggle(k: string, row: { ref: EntryRef; altId: string }): Promise<void> {
    open.value = open.value === k ? null : k
    if (open.value !== k || diffs.value[k]) return
    diffs.value = { ...diffs.value, [k]: 'loading' }
    const cs = getSource(row.ref.set).codeSet
    try {
      if (!labels.value[`${cs}|${row.ref.prop}`]) {
        const t = await app.svc().backend.library.custom.fields(cs, row.ref.prop)
        labels.value = { ...labels.value, [`${cs}|${row.ref.prop}`]: Object.fromEntries((t?.fields ?? []).map((f) => [f.name, f.label ?? f.name])) }
      }
      const cur = lib.campaignLib
      diffs.value = { ...diffs.value, [k]: cur ? (await app.svc().backend.library.editChanges(cur, row))?.changes ?? [] : [] }
    } catch (e) { diffs.value = { ...diffs.value, [k]: e instanceof Error ? e.message : String(e) } }
  }
  const labelOf = (r: { ref: EntryRef }, f: string): string => labels.value[`${getSource(r.ref.set).codeSet}|${r.ref.prop}`]?.[f] ?? f
  return { open, diffs, toggle, labelOf }
}
