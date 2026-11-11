import { defineStore } from 'pinia'
import { shallowRef } from 'vue'

/** 库页顶部的提示横幅（错误类一律用横幅，P5 T6）：每条可带几个动作按钮；用户关掉或动作成功后消失。 */
export interface LibNotice {
  key: string
  text: string
  actions: Array<{ label: string; run: () => void }>
}

export const useLibNoticeStore = defineStore('libnotice', () => {
  const notices = shallowRef<LibNotice[]>([])
  function show(n: LibNotice): void { notices.value = [...notices.value.filter((x) => x.key !== n.key), n] }
  function dismiss(key: string): void { notices.value = notices.value.filter((x) => x.key !== key) }
  return { notices, show, dismiss }
})
