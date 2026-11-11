import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { EntryRef } from '../library/scopes'

/**
 * 条目详情的中 / En 切换状态（P5 T6）：详情页问后端「另一种语言是哪一条」后写在这里，弹窗标题栏上的切换按钮读它。
 * 只存界面状态；对不对得上全由后端 counterparts.counterpart 判断。
 */
export interface EntryLang { other: EntryRef | null; reason: string | null; loading: boolean }

export const useEntryLangStore = defineStore('entrylang', () => {
  const byKey = ref<Record<string, EntryLang>>({})
  const keyOf = (ref: EntryRef): string => `${ref.set}|${ref.prop}|${ref.hash}`
  function set(ref: EntryRef, v: EntryLang): void { byKey.value = { ...byKey.value, [keyOf(ref)]: v } }
  function get(ref: EntryRef): EntryLang | null { return byKey.value[keyOf(ref)] ?? null }
  return { byKey, set, get }
})
