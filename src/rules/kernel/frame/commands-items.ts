// b 段：物品装备、同调、使用与次数恢复（b-e 执行文档 §2）。
// 只把 dnd5e 官方入口接到结算小窗：不写规则、不写物品数据、不手判次数。
/* eslint-disable @typescript-eslint/no-explicit-any -- 官方文档对象没有类型声明。 */

const g = globalThis as any

export type Operate = (points: number[], run: () => Promise<any>, actors?: string[]) => Promise<any>
export type ActorGetter = (id: string) => any

/** 只把官方 uses 字段的现状交回；max 为空表示这件物品没有次数。 */
function usesState(uses: any): any {
  if (!uses || uses.max === undefined || uses.max === null || uses.max === '') return null
  return { value: uses.value ?? null, max: uses.max ?? null, spent: uses.spent ?? null }
}

export function itemState(item: any): any {
  return {
    id: item.id,
    name: item.name,
    type: item.type,
    equipped: 'equipped' in item.system ? item.system.equipped : null,
    attuned: 'attuned' in item.system ? item.system.attuned : null,
    attunement: item.system.attunement ?? null,
    uses: usesState(item.system.uses),
    activities: item.system.activities
      ? [...item.system.activities].map((a: any) => ({ id: a.id, name: a.name, type: a.type, uses: usesState(a.uses) }))
      : [],
  }
}

/** 只读官方准备后的数值，用来证明装备/同调确实生效。 */
function actorState(actor: any): any {
  const ac = actor.system.attributes?.ac
  const attunement = actor.system.attributes?.attunement
  return {
    ac: ac ? { value: ac.value ?? null, calc: ac.calc ?? null, formula: ac.formula ?? null } : null,
    attunement: attunement ? { value: attunement.value ?? null, max: attunement.max ?? null } : null,
  }
}

function rollsState(rolls: any[]): any[] {
  return rolls.map((roll: any) => ({
    formula: roll.formula ?? null,
    total: roll.total ?? null,
    dice: roll.dice?.map((die: any) => ({ faces: die.faces, results: die.results?.map((r: any) => r.result) })) ?? [],
  }))
}

export function createItemCommands(operate: Operate, actor: ActorGetter) {
  const itemOf = (actorId: string, itemId: string): any => actor(actorId).items.get(itemId, { strict: true })

  return {
    /** 穿上/脱下：官方物品文档更新 system.equipped（与官方物品栏同一入口）。 */
    equip: (actorId: string, itemId: string, on: boolean) => operate([], async () => {
      const a = actor(actorId)
      const item = itemOf(actorId, itemId)
      await item.update({ 'system.equipped': Boolean(on) })
      return { item: itemState(item), actor: actorState(a) }
    }, [actorId]),

    /** 同调/取消同调：官方物品文档更新 system.attuned（与官方物品栏同一入口）。 */
    attune: (actorId: string, itemId: string, on: boolean) => operate([], async () => {
      const a = actor(actorId)
      const item = itemOf(actorId, itemId)
      await item.update({ 'system.attuned': Boolean(on) })
      return { item: itemState(item), actor: actorState(a) }
    }, [actorId]),

    /**
     * 使用物品：官方活动 use，不弹配置窗、不发聊天消息。
     * 不给 activityId 时走 item.use（多个活动会打开官方选择窗 → 结果 pending）；
     * 给了就只调那一个活动。用尽后再用时，官方通知原文收进结果，状态标“缺资源”，不自己判次数。
     */
    useItem: (actorId: string, itemId: string, points: number[] = [], activityId: string | null = null) => {
      const notes: string[] = []
      const notifications = g.ui?.notifications
      const original = notifications?.error
      if (notifications && original) notifications.error = function(message: any, ...args: any[]) {
        notes.push(String(message))
        return original.call(this, message, ...args)
      }
      const restore = (): void => { if (notifications && original) notifications.error = original }
      return operate(points, async () => {
        const item = itemOf(actorId, itemId)
        let result: any
        let activity: any = null
        if (activityId) {
          activity = item.system.activities?.get(activityId)
          if (!activity) throw Error(`Item has no activity: ${activityId}`)
          result = await activity.use({}, { configure: false }, { create: false })
        } else {
          result = await item.use({}, { configure: false }, { create: false })
        }
        return {
          item: itemState(item),
          activity: activity ? { id: activity.id, name: activity.name, type: activity.type } : null,
          effects: (result?.effects ?? []).map((e: any) => ({ id: e.id, name: e.name, uuid: e.uuid })),
          message: result?.message ? { title: result.message.title ?? null, type: result.message.type ?? null } : null,
          notifications: notes,
        }
      }, [actorId]).then((result: any) => {
        // 官方用通知报告“次数不足/未装备/未同调”：没有生成使用消息时，按“缺资源”交回。
        if (result.status === 'complete' && result.result?.notifications?.length && !result.result.message
          && !result.result.effects?.length) {
          return { ...result, status: 'missing', missing: { reason: result.result.notifications } }
        }
        return result
      }).finally(restore)
    },

    /**
     * 次数恢复：dnd5e 物品自己的 recoverUses（短休 sr、长休 lr、黎明 dawn…）。
     * 官方只返回 updates/rolls/destroy，这里照它的结果交给 item.update / 删除；
     * 恢复哪些次数、用什么公式，全在作者转出的物品数据里。
     */
    recover: (actorId: string, period: string, points: number[] = []) => operate(points, async () => {
      const a = actor(actorId)
      const rows: any[] = []
      for (const item of a.items) {
        if (item.isHidden || typeof item.system.recoverUses !== 'function') continue
        const result = await item.system.recoverUses(new Map([[period, 1]]))
        if (!result) continue
        if (result.destroy) {
          await a.deleteEmbeddedDocuments('Item', [item.id])
          rows.push({ id: item.id, name: item.name, destroy: true })
          continue
        }
        if (g.foundry.utils.isEmpty(result.updates)) continue
        await item.update(result.updates)
        rows.push({ id: item.id, name: item.name, updates: result.updates, rolls: rollsState(result.rolls ?? []) })
      }
      return { period, items: rows, actor: actorState(a) }
    }, [actorId]),
  }
}
