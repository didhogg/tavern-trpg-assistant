// P3-3b：把存档里的状态差别叠回重建出来的完整人物/怪物文档。
// 只操作官方文档入口；不手写规则数值。
/* eslint-disable @typescript-eslint/no-explicit-any -- 官方文档对象没有类型声明。 */
import type { KernelActorStateLike } from '../../../core/saves/state'

export async function applyStateToActor(actor: any, state: KernelActorStateLike | undefined): Promise<void> {
  if (!state) return
  if (state.actor && Object.keys(state.actor).length) await actor.update(state.actor)
  for (const [id, diff] of Object.entries(state.items ?? {})) {
    const item = actor.items.get(id)
    if (item) await item.update(diff)
  }
  for (const item of state.itemAdded ?? []) {
    if (!actor.items.get(item._id)) await actor.createEmbeddedDocuments('Item', [item], { keepId: true })
  }
  for (const id of state.itemRemoved ?? []) await actor.deleteEmbeddedDocuments('Item', [id])
  for (const [id, diff] of Object.entries(state.effects ?? {})) {
    const effect = actor.effects.get(id)
    if (effect) await effect.update(diff)
  }
  for (const effect of state.effectAdded ?? []) {
    if (!actor.effects.get(effect._id)) await actor.createEmbeddedDocuments('ActiveEffect', [effect], { keepId: true })
  }
  for (const id of state.effectRemoved ?? []) await actor.deleteEmbeddedDocuments('ActiveEffect', [id])
}
