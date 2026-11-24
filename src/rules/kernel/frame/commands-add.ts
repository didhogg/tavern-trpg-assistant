// T4：给已有人物加条目。数据由 T1 作者统一导入器交来；创建走 dnd5e 官方拖放/成长流程。
// 普通物品：ActorSheet5e#_onDropSingleItem 返回 itemData，再按官方调用方 createEmbeddedDocuments。
// 有成长步骤：官方 AdvancementManager.forNewItem + 现有 applyManager（dnd5e 官方成长管理器）。
// 不在本文件手写物品编号、排序、来源字段或状态键。
/* eslint-disable @typescript-eslint/no-explicit-any -- 官方文档对象没有类型声明。 */
import type { ActorGetter, Operate } from './commands-items'
import { importEntry } from './importer'
import { applyManager, actorLevel, cleanItem, Manager, markStandardDragDrop } from './commands-level'

const g = globalThis as any

function flagsOf(item: any): string | null {
  const f = item?.flags?.plutonium
  return f?.propDroppable && f.source && f.hash ? `${f.propDroppable}|${f.source}|${f.hash}` : null
}

/** 官方「删带成长的条目」：把它带来的成长一步步退回再删；没有成长直接删。交回没退完的那一步（null = 删好了）。 */
export async function removeOfficially(a: any, itemId: string): Promise<any> {
  const item = a.items.get(itemId)
  if (!item) throw Error(`人物身上没有这件：${itemId}`)
  const manager = Manager().forDeletedItem(a, itemId, { automaticApplication: true })
  if (manager.steps.length) {
    const outcome = await applyManager(manager, undefined)
    return outcome.finished ? null : outcome.step
  }
  await item.delete()
  return null
}

export function createAddCommands(operate: Operate, actor: ActorGetter) {
  return {
    /** 给已有人物加一组条目；兼职、子职业、专长、装备、法术、消耗品都走这里。 */
    addToActor: (actorId: string, rows: Array<{ prop: string; entry: any; refKey?: string; choices?: any[]; data?: any }>) => operate([], async () => {
      const a = actor(actorId)
      const sheet = a.sheet
      if (!sheet?._onDropSingleItem) throw Error(`人物 ${actorId} 没有官方人物表单实例`)
      const added: any[] = []
      for (const row of rows) {
        // 外层缓存层（cache.ts）通常已给好换算结果；没给才现场换算
        // 打上作者的“普通拖放”标记（作者自己的口子）：不然作者的拖放钩子会拦下这次创建、在看不见的小窗里弹“用导入器吗”，东西悄悄丢掉（11-24 真机）
        const data = markStandardDragDrop(cleanItem(row.data ? structuredClone(row.data) : await importEntry(row.prop, row.entry)))
        const before = new Set(a.items.map((item: any) => item.id))
        const manager = Manager().forNewItem(a, data, { automaticApplication: true })
        if (manager.steps.length) {
          const outcome = await applyManager(manager, row.choices, { strict: false })
          if (!outcome.finished) return { kernelStatus: 'pending', reason: 'add-step-not-complete', step: outcome.step, pending: { step: outcome.step } }
        } else {
          // 官方拖放会看“放在了哪一段”（法术按 event.target 找所在的环 / 施法方式）；给一个不在任何一段里的目标 = 放在表上空白处，走官方默认
          const returned = await sheet._onDropSingleItem({ target: g.document.createElement('div') }, data)
          if (returned === false || returned === undefined) continue
          const created = await a.createEmbeddedDocuments('Item', [returned], { keepId: true })
          added.push(...created.map((item: any) => item.toObject()))
        }
        for (const item of a.items) {
          if (!before.has(item.id) && flagsOf(item)) added.push(item.toObject())
        }
      }
      return { ...actorLevel(a), added }
    }, [actorId]),

    /**
     * 从人物身上拿掉一件条目（P6-R）：走 dnd5e 官方“删除带成长的条目”（AdvancementManager.forDeletedItem：把它带来的成长
     * 一步步退回，最后删掉它；职业 = 全部等级退回）；没有成长的直接删。和官方表上删条目一样，不手写要退回什么。
     */
    removeItem: (actorId: string, itemId: string) => operate([], async () => {
      const a = actor(actorId)
      const step = await removeOfficially(a, itemId)
      if (step) return { kernelStatus: 'pending', reason: 'remove-step-not-complete', step, pending: { step } }
      return { ...actorLevel(a), removed: itemId }
    }, [actorId]),
  }
}
