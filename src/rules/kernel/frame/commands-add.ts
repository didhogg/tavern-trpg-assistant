// T4：给已有人物加条目。数据由 T1 作者统一导入器交来；创建走 dnd5e 官方拖放/成长流程。
// 普通物品：ActorSheet5e#_onDropSingleItem 返回 itemData，再按官方调用方 createEmbeddedDocuments。
// 有成长步骤：官方 AdvancementManager.forNewItem + 现有 applyManager（dnd5e 官方成长管理器）。
// 不在本文件手写物品编号、排序、来源字段或状态键。
/* eslint-disable @typescript-eslint/no-explicit-any -- 官方文档对象没有类型声明。 */
import type { ActorGetter, Operate } from './commands-items'
import { importEntry } from './importer'
import { applyManager, actorLevel, cleanItem, Manager } from './commands-level'

function flagsOf(item: any): string | null {
  const f = item?.flags?.plutonium
  return f?.propDroppable && f.source && f.hash ? `${f.propDroppable}|${f.source}|${f.hash}` : null
}

export function createAddCommands(operate: Operate, actor: ActorGetter) {
  return {
    /** 给已有人物加一组条目；兼职、子职业、专长、装备、法术、消耗品都走这里。 */
    addToActor: (actorId: string, rows: Array<{ prop: string; entry: any; refKey?: string; choices?: any[] }>) => operate([], async () => {
      const a = actor(actorId)
      const sheet = a.sheet
      if (!sheet?._onDropSingleItem) throw Error(`人物 ${actorId} 没有官方人物表单实例`)
      const added: any[] = []
      for (const row of rows) {
        const data = cleanItem(await importEntry(row.prop, row.entry))
        const before = new Set(a.items.map((item: any) => item.id))
        const manager = Manager().forNewItem(a, data, { automaticApplication: true })
        if (manager.steps.length) {
          const outcome = await applyManager(manager, row.choices, { strict: false })
          if (!outcome.finished) return { kernelStatus: 'pending', reason: 'add-step-not-complete', step: outcome.step, pending: { step: outcome.step } }
        } else {
          const returned = await sheet._onDropSingleItem(null, data)
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
  }
}
