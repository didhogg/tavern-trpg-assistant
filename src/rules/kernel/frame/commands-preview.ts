// 降级演练（驾驶员 11-25：降级前在右边先看会收回什么）：官方 forLevelChange 在小窗里真降一次，交回少了哪些物品、生命上限 / 总等级前后。
// 只算不存：主线拿到结果后马上按存档把这个人退回（people.levelPreview）。物品名标好来路交唯一显示出口。
/* eslint-disable @typescript-eslint/no-explicit-any -- 官方文档对象没有类型声明。 */
import type { ActorGetter, Operate } from './commands-items'
import { applyManager, Manager } from './commands-level'
import { itemText } from './sheet-texts'
import { revokeGrants } from './import-grants'

export function createPreviewCommands(operate: Operate, actor: ActorGetter) {
  return {
    levelPreview: (actorId: string, classId: string, delta: number, entries: unknown[] = []) => operate([], async () => {
      const a = actor(actorId)
      const before = [...a.items].map((i: any) => ({ id: i.id, type: i.type, name: itemText(i, entries).name }))
      const hp = Number(a.system.attributes?.hp?.max ?? 0), level = Number(a.system.details?.level ?? 0)
      const cls = a.items.get(classId)
      const identifier = String(cls?.system?.identifier ?? ''), keep = Number(cls?.system?.levels ?? 0) + delta
      const outcome = await applyManager(Manager().forLevelChange(a, classId, delta, { automaticApplication: true }), undefined)
      if (!outcome.finished) return { kernelStatus: 'pending', reason: 'advancement-manager-not-complete' }
      // 和真降级同一步：作者导入那几级记下的也收回（import-grants.ts）
      if (delta < 0 && identifier) await revokeGrants(a, identifier, keep)
      const left = new Set([...a.items].map((i: any) => i.id))
      return {
        removed: before.filter((i) => !left.has(i.id)),
        hp: { from: hp, to: Number(a.system.attributes?.hp?.max ?? 0) },
        level: { from: level, to: Number(a.system.details?.level ?? 0) },
      }
    }, [actorId]),
  }
}
