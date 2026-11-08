// T4：给已有人物加条目。照 dnd5e ActorSheet5e#_onDropSingleItem 的官方顺序（dnd5e.js:55221）：
//   清装备/同调状态（_onDropResetData:55266）→ 叠消耗品（_onDropStackConsumables:55279）
//   → 有成长步骤的交 AdvancementManager.forNewItem（:21090，内部走官方成长流程）→ 否则官方 onDropCreate + 创建。
// 这里不渲染人物表单；需要界面时用同一批官方函数，代码位置在上面的行号。
/* eslint-disable @typescript-eslint/no-explicit-any -- 官方文档对象没有类型声明。 */
import type { ActorGetter, Operate } from './commands-items'
import { importEntry, stampConsumableSource } from './importer'
import { applyManager, actorLevel, cleanItem, Manager, markStandardDragDrop } from './commands-level'

const g = globalThis as any

function refOf(item: any): string | null {
  const f = item?.flags?.plutonium
  return f?.propDroppable && f.source && f.hash ? `${f.propDroppable}|${f.source}|${f.hash}` : null
}

export function createAddCommands(operate: Operate, actor: ActorGetter) {
  return {
    /** 给已有人物加一组条目（兼职/子职业/专长/装备/法术/消耗品都走这里）。 */
    addToActor: (actorId: string, rows: Array<{ prop: string; entry: any; refKey?: string; data?: any; choices?: any[] }>) => operate([], async () => {
      const a = actor(actorId)
      const sheet = a.sheet
      if (!sheet?._onDropSingleItem) throw Error(`人物 ${actorId} 没有官方人物表单实例`)
      const added: any[] = []
      let stacked = 0
      for (const row of rows) {
        const itemData = cleanItem(row.data ?? await importEntry(row.prop, row.entry))
        // 官方 _onDropSingleItem 第一步的同一批函数。
        // 官方人物表单的拖放数据来自 compendium 时靠 sourceId 叠消耗品；这里用作者条目编号补上同一身份。
        stampConsumableSource(itemData)
        sheet._onDropResetData(null, itemData)
        if (await sheet._onDropStackConsumables(null, itemData, { container: null })) { stacked++; continue }
        if (sheet.constructor.unsupportedItemTypes?.has(itemData.type)) throw Error(`人物不接受这一类物品：${itemData.type}`)
        const before = new Set(a.items.map((i: any) => i.id))
        const dataModel = g.CONFIG.Item.dataModels[itemData.type]
        const singleton = dataModel?.metadata?.singleton ?? false
        const hasAdvancement = a.system.metadata?.supportsAdvancement
          && itemData.system?.advancement && Object.keys(itemData.system.advancement).length
          && !g.game.settings.get('dnd5e', 'disableAdvancements')
        if (hasAdvancement) {
          if (singleton && a.itemTypes[itemData.type].length) throw Error(`人物已经有这一类单项：${itemData.type}`)
          const manager = Manager().forNewItem(a, itemData, { automaticApplication: true })
          if (manager.steps.length) {
            const outcome = await applyManager(manager, row.choices, { strict: false })
            if (!outcome.finished) return { kernelStatus: 'pending', reason: 'add-step-not-complete', step: outcome.step, pending: { step: outcome.step } }
          }
        }
        // 成长流程没有自己创建时，按官方 onDropCreate + 创建；已有则不再重复。
        const fresh = a.items.filter((i: any) => !before.has(i.id) && refOf(i) === refOf(itemData))
        if (!fresh.length) {
          dataModel?.onDropCreate?.(null, a, itemData)
          const created = await a.createEmbeddedDocuments('Item', [markStandardDragDrop(itemData)])
          added.push(...created.map((i: any) => i.toObject()))
        } else added.push(...fresh.map((i: any) => i.toObject()))
      }
      return { ...actorLevel(a), added, stacked }
    }, [actorId]),
  }
}
