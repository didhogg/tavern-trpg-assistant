import { defineStore } from 'pinia'
import { ref } from 'vue'

// 人物页在 B2-9 旧格式退役时随旧界面删除，P6 再加回来；库页（P5）按新【库】重建
export type PageId = 'home' | 'settings' | 'library'

export const PAGE_TITLES: Record<PageId, string> = { home: '首页', settings: '设置', library: '库' }

/** 外壳状态：主窗口是否打开、当前页面。 */
export const useUiStore = defineStore('ui', () => {
  const windowOpen = ref(false)
  const page = ref<PageId>('home')
  const diceOpen = ref(false)
  /** 主窗口现在的宽度档（MainWindow 量出来写进来）：库页弹窗（编辑器左右 / 上下两栏）按它排。 */
  const layout = ref<'wide' | 'mid' | 'narrow'>('wide')

  function go(next: PageId): void {
    page.value = next
  }

  return { windowOpen, page, diceOpen, layout, go }
})
