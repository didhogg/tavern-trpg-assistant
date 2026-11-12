import { defineStore } from 'pinia'
import { shallowRef } from 'vue'

export interface BannerAction { label: string; run: () => void; testid?: string }

/** 一条错误横幅：页面登记，宿主层（酒馆顶部栏下方，和提示条同一处）统一显示。 */
export interface HostBanner {
  id: number
  text: string
  what?: string
  actions: BannerAction[]
  /** 有它才显示【×】。 */
  dismiss?: () => void
  testid?: string
}

/**
 * 错误横幅（错误一律用横幅）：不画在插件里，全部放到插件外酒馆顶部栏下方，和提示条同一位置、同一样式。
 * 页面里的 ErrorBanner 只负责登记 / 更新 / 撤销；页面关掉、错误消失时横幅跟着消失。
 */
export const useBannerStore = defineStore('banners', () => {
  const banners = shallowRef<HostBanner[]>([])
  let nextId = 1
  function add(): number { return nextId++ }
  function set(b: HostBanner): void {
    const i = banners.value.findIndex((x) => x.id === b.id)
    banners.value = i < 0 ? [...banners.value, b] : banners.value.map((x) => (x.id === b.id ? b : x))
  }
  function remove(id: number): void { banners.value = banners.value.filter((x) => x.id !== id) }
  return { banners, add, set, remove }
})
