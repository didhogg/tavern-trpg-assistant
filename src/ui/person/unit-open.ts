// 页头三个单元的编辑弹窗（驾驶员 11-25：页头每个框右上小铅笔 / 点框 → 这个单元的编辑弹窗）。
// 已有弹窗时同一个入口会在弹窗里翻页（stores/modal.ts open）。
import { markRaw } from 'vue'
import { useModalStore } from '../../stores/modal'
import NameDialog from './NameDialog.vue'
import OriginsDialog from './OriginsDialog.vue'
import TraitsDialog from './TraitsDialog.vue'

export function openName(): void {
  useModalStore().open({ key: 'person-name', title: '名字', component: markRaw(NameDialog), variant: 'dialog', width: 440, height: 260 })
}

/** 特征：体型 / 生物类型 / 速度 / 感官 / 阵营（选项从库里取，点了就生效）。 */
export function openTraits(): void {
  useModalStore().open({ key: 'person-traits', title: '特征', component: markRaw(TraitsDialog), variant: 'dialog', width: 560, height: 720 })
}

/** 职业与出身：start = 打开时选中哪一行（class:编号 / sub:编号 / race / background）；level = 直接进某个职业的改等级流程。 */
export function openOrigins(opts: { start?: string; level?: { classId: string; delta: number } } = {}): void {
  useModalStore().open({ key: 'person-origins', title: '职业与出身', component: markRaw(OriginsDialog), props: opts, variant: 'dialog', width: 920, height: 720 })
}
