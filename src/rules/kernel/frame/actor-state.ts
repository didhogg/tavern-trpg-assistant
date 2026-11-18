// P3-3b：把存档里的状态差别叠回重建出来的完整人物/怪物文档。
// 只操作官方文档入口；不手写规则数值。
/* eslint-disable @typescript-eslint/no-explicit-any -- 官方文档对象没有类型声明。 */
import { itemForStateKey, type KernelActorStateLike } from '../../../core/saves/state'
import { applyOff, type OffResult, type OffRow } from './off'

/**
 * 人物准备的汇合处（重建、读档命中缓存、撤销 / 取消退回都走这里）：完整基准已建好 →
 * 按取下安排处理 → 记下取下后的视图（存档差别相对它算）→ 叠游戏状态。
 * 取下记录有问题（指向不存在 / 还不能取下的项）时不叠状态，原样交回问题。
 */
export async function prepareActor(actor: any, off: OffRow[] | undefined, state: KernelActorStateLike | undefined): Promise<{ view: any; choices: OffResult['choices']; problems: OffResult['problems'] }> {
  const done = await applyOff(actor, off)
  if (done.problems.length) return { view: null, choices: {}, problems: done.problems }
  const view = actor.toObject()
  await applyStateToActor(actor, state)
  return { view, choices: done.choices, problems: [] }
}

export async function applyStateToActor(actor: any, state: KernelActorStateLike | undefined): Promise<void> {
  if (!state) return
  if (state.actor && Object.keys(state.actor).length) await actor.update(state.actor)
  for (const [id, diff] of Object.entries(state.items ?? {})) {
    const item = itemForStateKey([...actor.items], id) as any
    if (!item) throw new Error(`状态差别指向的物品在重建结果里不存在：${id}`)
    await item.update(diff)
  }
  for (const item of state.itemAdded ?? []) {
    if (!actor.items.get(item._id)) await actor.createEmbeddedDocuments('Item', [item], { keepId: true })
  }
  for (const key of state.itemRemoved ?? []) {
    const item = itemForStateKey([...actor.items], key)
    if (item?._id) await actor.deleteEmbeddedDocuments('Item', [item._id])
  }
  for (const [id, diff] of Object.entries(state.effects ?? {})) {
    const effect = actor.effects.get(id)
    if (!effect) throw new Error(`状态差别指向的效果在重建结果里不存在：${id}`)
    await effect.update(diff)
  }
  for (const effect of state.effectAdded ?? []) {
    if (!actor.effects.get(effect._id)) await actor.createEmbeddedDocuments('ActiveEffect', [effect], { keepId: true })
  }
  for (const id of state.effectRemoved ?? []) await actor.deleteEmbeddedDocuments('ActiveEffect', [id])
}
