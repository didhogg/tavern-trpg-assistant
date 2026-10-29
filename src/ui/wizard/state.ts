import { reactive } from 'vue'

/** 开局向导的选择；模块级状态，向导关闭后重置。 */
export interface WizardState {
  step: 1 | 2 | 3 | 4
  ruleId: string
  packIds: string[]
  adventureId: string
  name: string
  note: string
  nameEdited: boolean
  /** 第 ② 步的默认勾选已经计算过。 */
  packsInit: boolean
  /** 已经选过 / 改过任何内容（关闭时要先确认）。 */
  touched: boolean
}

const fresh = (): WizardState => ({ step: 1, ruleId: '', packIds: [], adventureId: '', name: '', note: '', nameEdited: false, packsInit: false, touched: false })

export const wizard = reactive<WizardState>(fresh())

export function resetWizard(): void {
  Object.assign(wizard, fresh())
}
