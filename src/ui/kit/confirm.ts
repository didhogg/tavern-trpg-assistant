import { markRaw } from 'vue'
import { useModalStore } from '../../stores/modal'
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
  const modal = useModalStore()
  return new Promise((resolve) => {
    let settled = false
    const settle = (value: boolean) => {
      if (settled) return
      settled = true
      resolve(value)
    }
    modal.push({
      key: `confirm:${++counter}`,
      title: options.title,
      component: markRaw(ConfirmPage),
      props: {
        message: options.message,
        details: options.details,
        confirmLabel: options.confirmLabel,
        cancelLabel: options.cancelLabel,
        danger: options.danger,
        onAnswer: (value: boolean) => {
          settle(value)
          modal.pop()
        },
      },
      variant: 'confirm',
      onLeave: () => settle(false),
    })
  })
}
