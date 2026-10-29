import type { Component } from 'vue'
import { useModalStore, type ModalPage } from '../../stores/modal'

export interface ChoicePage<T> {
  key: string
  title: string
  component: Component
  /** 生成页面的 props；answer 由页面里的按钮调用。 */
  props: (answer: (value: T) => void) => Record<string, unknown>
}

/**
 * 在当前弹窗里换到一页让玩家选择（没有弹窗时打开一个小窗），返回选择结果。
 * 选择后自动返回；用「‹」、Esc 或 ✕ 离开，视为 cancelValue。
 */
export function askChoice<T>(page: ChoicePage<T>, cancelValue: T): Promise<T> {
  const modal = useModalStore()
  return new Promise((resolve) => {
    let settled = false
    const answer = (value: T): void => {
      if (settled) return
      settled = true
      resolve(value)
      modal.pop()
    }
    const entry: ModalPage = {
      key: page.key,
      title: page.title,
      component: page.component,
      props: page.props(answer),
      variant: 'confirm',
      onLeave: () => {
        if (settled) return
        settled = true
        resolve(cancelValue)
      },
    }
    modal.push(entry)
  })
}
