// T5：怪物 / NPC / 载具 / 物件统一批量建。调用方给条目，换算走 T1 统一入口；一次 createDocuments。
/* eslint-disable @typescript-eslint/no-explicit-any -- 官方文档对象没有类型声明。 */
import type { Operate } from './commands-items'
import { importEntry } from './importer'

const g = globalThis as any

function actorData(raw: any, name?: string): any {
  const data = structuredClone(raw)
  delete data._id
  for (const item of data.items ?? []) delete item._id
  for (const effect of data.effects ?? []) delete effect._id
  if (name) data.name = name
  return data
}

export function createBatchCommands(operate: Operate) {
  return {
    /** 一组怪物/NPC/载具/物件：读取换算结果后一次建好；单个也走这条。 */
    createActorsBatch: (rows: Array<{ prop: string; entry: any; name?: string; data?: any }>) => operate([], async () => {
      const datas = []
      for (const row of rows) {
        const raw = row.data ?? await importEntry(row.prop, row.entry)
        datas.push(actorData(raw, row.name))
      }
      const ActorClass = g.CONFIG.Actor.documentClass
      const created = await ActorClass.createDocuments(datas)
      return created.map((a: any) => ({ id: a.id, name: a.name, type: a.type, data: a.toObject() }))
    }),
  }
}
