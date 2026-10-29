import { markRaw } from 'vue'
import { askChoice } from './choice'
import ConfirmPage from './ConfirmPage.vue'

export interface ConfirmOptions {
  title: string
  message: string
  details?: string[]
  confirmLabel: string
  cancelLabel?: string
  danger?: boolean
}

let counter = 0

/**
 * 确认：没有弹窗时打开一个小确认窗；已在某个弹窗内时，作为该弹窗的一页显示，「‹」或 Esc 即取消。
 * 返回 true 表示玩家点了确认；任何其他方式离开都返回 false。
 */
export function askConfirm(options: ConfirmOptions): Promise<boolean> {
  return askChoice<boolean>(
    {
      key: `confirm:${++counter}`,
      title: options.title,
      component: markRaw(ConfirmPage),
      props: (answer) => ({ ...options, onAnswer: answer }),
    },
    false,
  )
}
