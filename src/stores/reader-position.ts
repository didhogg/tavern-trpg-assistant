import { defineStore } from 'pinia'
import { ref } from 'vue'

/** 阅读器当前读到哪里。换语言时按这个位置回到同一章 / 小节，不按新页面的第 0 章重来。 */
export interface ReaderPosition {
  chapter: number
  section: string | null
  ixNamedSection?: number | null
  /** 当前章里第几个标题（按作者标题顺序），供中英章节名不同时定位。 */
  headingIndex?: number | null
  tocOpen?: boolean
  scrollTop?: number
}

export const useReaderPositionStore = defineStore('readerPosition', () => {
  const positions = ref<Record<string, ReaderPosition>>({})

  function save(key: string, position: ReaderPosition): void {
    positions.value = { ...positions.value, [key]: position }
  }

  function get(key: string | undefined): ReaderPosition | null {
    return key ? positions.value[key] ?? null : null
  }

  function drop(key: string): void {
    if (!(key in positions.value)) return
    const next = { ...positions.value }
    delete next[key]
    positions.value = next
  }

  return { positions, save, get, drop }
})
