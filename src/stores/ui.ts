import { defineStore } from 'pinia'
import { ref } from 'vue'

// 人物、库两页在 B2-9 旧格式退役时随旧界面删除，P4、P5 按新【库】重建后再加回来
export type PageId = 'home' | 'settings'

export const PAGE_TITLES: Record<PageId, string> = { home: '首页', settings: '设置' }

/** 外壳状态：主窗口是否打开、当前页面。 */
export const useUiStore = defineStore('ui', () => {
  const windowOpen = ref(false)
  const page = ref<PageId>('home')
  const diceOpen = ref(false)

  function go(next: PageId): void {
    page.value = next
  }

  return { windowOpen, page, diceOpen, go }
})
