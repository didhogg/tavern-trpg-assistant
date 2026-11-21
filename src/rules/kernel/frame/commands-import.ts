// P6 完整建卡器的草稿人：开一个空白人物交给作者完整建卡器（commands-native.ts nativeBuild）从头建。
// 只开空人，不替作者建任何东西；建好的人整份交回，存档按 B′ 存数据（读档不再重跑作者流程）。
// （之前这里还有「逐条导入向导」的 draftImport / draftReset / draftTake 和作者窗口桥，驾驶员 2026-11-21 定删掉，主线改用完整建卡器。）
/* eslint-disable @typescript-eslint/no-explicit-any -- dnd5e 文档没有类型声明。 */
import { BUILD_ACTOR_TYPE } from './actor-types'
import type { Operate } from './commands-items'
import { reseedKernel } from './seed'

const g = globalThis as any
const ActorClass = () => g.CONFIG.Actor.documentClass

export function createImportCommands(operate: Operate) {
  return {
    /** 开一个草稿人（空白人物），交回编号和空白时的数据。 */
    draftStart: (plan: { name: string; seed: string; id?: string }) => operate([], async () => {
      reseedKernel(plan.seed)
      const actor = await ActorClass().create({ ...(plan.id ? { _id: plan.id } : {}), name: plan.name, type: BUILD_ACTOR_TYPE }, { keepId: !!plan.id })
      return { id: actor.id, data: actor.toObject() }
    }),
  }
}
