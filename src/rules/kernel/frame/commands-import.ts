// P6 建卡走作者整机：Plutonium「导入到人物」（玩家把 5etools 种族 / 背景 / 职业拖到人物上时跑的那一整套）。
// 作者明说特性不靠 dnd5e 成长、建卡升级应走职业导入器（plutonium-next CHANGELOG v1.50.0）；这里原样调用作者总入口
// importer.pImportEntry(条目, ImportOpts{actor})，条目准备（展开的职业改回原始形状、挂子职业）、特性、授予链接、
// 起始装备、法术都由作者做。作者要问玩家时开作者自己的窗口，作者窗口桥（ask-bridge.ts）把窗口整个搬到我们的建卡页，玩家直接在作者窗口里答。
// 建人是「草稿人」：开一个空白人物 → 每次导入一件条目、交回导入后的整份数据（运行时记快照）→ 改了前面的条目就退回快照再导。
// 不拆作者零件、不在作者出口上动手脚；建好的人整份交回，存档按 B′ 存数据（读档不再重跑作者流程）。
/* eslint-disable @typescript-eslint/no-explicit-any -- 作者条目和 dnd5e 文档没有类型声明。 */
import { BUILD_ACTOR_TYPE } from './actor-types'
import { withAuthorWindows } from './ask-bridge'
import type { Operate } from './commands-items'
import { reseedKernel } from './seed'
import { settled } from './server'

const g = globalThis as any

/** 一件要导入的条目：类别 + 作者条目（中文战役是英文对照）+ 可选的作者导入选项（例如职业的 levels）。 */
export interface ImportRow { prop: string; entry: any; levels?: number[] }

/** 作者导入结果：成功 / 玩家取消了作者的提问 / 失败（作者自己在控制台写原因）。 */
const outcomeOf = (summary: any): 'complete' | 'cancelled' | 'failed' => {
  const s = String(summary?.status ?? '')
  return /Cancel/i.test(s) ? 'cancelled' : /Failed|Error/i.test(s) || !summary ? 'failed' : 'complete'
}
const ActorClass = () => g.CONFIG.Actor.documentClass

export function createImportCommands(operate: Operate) {
  return {
    /** 开一个草稿人（空白人物），交回编号和空白时的数据（运行时记作第 0 份快照）。 */
    draftStart: (plan: { name: string; seed: string; id?: string }) => operate([], async () => {
      reseedKernel(plan.seed)
      const actor = await ActorClass().create({ ...(plan.id ? { _id: plan.id } : {}), name: plan.name, type: BUILD_ACTOR_TYPE }, { keepId: !!plan.id })
      return { id: actor.id, data: actor.toObject() }
    }),
    /** 把一件条目交作者「导入到人物」，作者开的窗口搬到建卡页给玩家答；交回导入后的整份数据。没完成时人物保持原样由运行时退回快照。 */
    draftImport: (plan: { id: string; row: ImportRow }) => operate([], async () => {
      const api = g.game.modules.get('plutonium')?.api
      if (!api?.importer) throw Error('Plutonium importer is not available')
      const actor = g.game.actors.get(plan.id)
      if (!actor) throw Error(`草稿人不在：${plan.id}`)
      const importer = await api.importer.pGetImporter({ prop: plan.row.prop })
      if (!importer) throw Error(`No Plutonium importer for ${plan.row.prop}`)
      const opts = new api.importer.ImportOpts({ actor, ...(plan.row.levels ? { levels: plan.row.levels } : {}) })
      const outcome = outcomeOf(await withAuthorWindows(() => importer.pImportEntry(structuredClone(plan.row.entry), opts)))
      await settled()
      if (outcome !== 'complete') return { kernelStatus: outcome === 'cancelled' ? 'pending' : 'error', reason: outcome, prop: plan.row.prop, name: plan.row.entry?.name ?? null }
      return { data: actor.toObject() }
    }, [], { ui: true }),
    /** 草稿人退回某份快照（改了前面的条目时）：删掉重建成那份数据，编号不变。 */
    draftReset: (plan: { id: string; data: Record<string, unknown> }) => operate([], async () => {
      await ActorClass().deleteDocuments([plan.id])
      const actor = await ActorClass().create(structuredClone(plan.data), { keepId: true })
      return { id: actor.id }
    }),
    /** 收下草稿人：改成最终的名字，交回整份数据（存档按 B′ 存它）。 */
    draftTake: (plan: { id: string; name: string }) => operate([], async () => {
      const actor = g.game.actors.get(plan.id)
      if (!actor) throw Error(`草稿人不在：${plan.id}`)
      if (actor.name !== plan.name) await actor.update({ name: plan.name, 'prototypeToken.name': plan.name })
      return { id: actor.id, data: actor.toObject() }
    }),
  }
}
