import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CounterpartRef } from '../library/brew-pairing'
import type { EntryRef, EntrySelection } from '../library/scopes'

/**
 * 条目详情的中 / En 切换状态（P5 T6）：详情页问后端「另一种语言是哪一条」后写在这里，弹窗标题栏上的切换按钮读它。
 * 只存界面状态；对不对得上全由后端 counterparts.counterpart 判断。
 */
export interface EntryLang { other: CounterpartRef | null; reason: string | null; loading: boolean }

export function entryPageKey(ref: EntryRef, selection?: EntrySelection): string {
  const key = `entry:${ref.set}:${ref.prop}:${ref.hash}`
  if (!selection) return key
  return `${key}:${'docIdLocal' in selection ? `pack:${selection.docIdLocal}` : 'original'}`
}

export const useEntryLangStore = defineStore('entrylang', () => {
  const byKey = ref<Record<string, EntryLang>>({})
  function set(ref: EntryRef, v: EntryLang, selection?: EntrySelection): void { byKey.value = { ...byKey.value, [entryPageKey(ref, selection)]: v } }
  function get(ref: EntryRef, selection?: EntrySelection): EntryLang | null { return byKey.value[entryPageKey(ref, selection)] ?? null }
  return { byKey, set, get }
})
