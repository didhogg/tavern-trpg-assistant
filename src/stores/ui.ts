import { defineStore } from 'pinia'
import { ref } from 'vue'

export type PageId = 'home' | 'library' | 'settings'
export type LibrarySegment = 'save' | 'ext' | 'mine'

export const PAGE_TITLES: Record<PageId, string> = { home: '首页', library: '库', settings: '设置' }

/** 外壳状态：主窗口是否打开、当前页面、库的分段。 */
export const useUiStore = defineStore('ui', () => {
  const windowOpen = ref(false)
  const page = ref<PageId>('home')
  const diceOpen = ref(false)
  const librarySegment = ref<LibrarySegment>('ext')
  /** 库·扩展中需要定位的包 id（例如从「去安装」跳转）。 */
  const libraryFocusPack = ref<string | null>(null)

  function go(next: PageId): void {
    page.value = next
  }

  function openLibrary(segment: LibrarySegment, packId?: string): void {
    librarySegment.value = segment
    libraryFocusPack.value = packId ?? null
    page.value = 'library'
    windowOpen.value = true
  }

  return { windowOpen, page, diceOpen, librarySegment, libraryFocusPack, go, openLibrary }
})
