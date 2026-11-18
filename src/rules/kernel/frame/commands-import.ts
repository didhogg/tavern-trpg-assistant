// P6 建卡走作者整机：Plutonium「导入到人物」（玩家把 5etools 种族 / 背景 / 职业拖到人物上时跑的那一整套）。
// 作者明说特性不靠 dnd5e 成长、建卡升级应走职业导入器（plutonium-next CHANGELOG v1.50.0）；这里原样调用作者总入口
// importer.pImportEntry(条目, ImportOpts{actor})，条目准备（展开的职业改回原始形状、挂子职业）、特性、授予链接、
// 起始装备、法术都由作者做。作者要问玩家时照常显示作者自己的窗口（前端 A：玩家直接在作者窗口里回答）。
// 不拆作者零件、不在作者出口上动手脚；建好的人整份交回，存档按 B′ 存数据（读档不再重跑作者流程）。
/* eslint-disable @typescript-eslint/no-explicit-any -- 作者条目和 dnd5e 文档没有类型声明。 */
import { BUILD_ACTOR_TYPE } from './actor-types'
import type { Operate } from './commands-items'
import { reseedKernel } from './seed'
import { settled } from './server'

const g = globalThis as any

/** 一件要导入的条目：类别 + 作者条目（中文战役是英文对照）+ 可选的作者导入选项（例如职业的 levels）。 */
export interface ImportRow { prop: string; entry: any; levels?: number[] }

/** 作者导入结果：成功 / 玩家在作者窗口点了取消 / 失败（作者自己在控制台写原因）。 */
const outcomeOf = (summary: any): 'complete' | 'cancelled' | 'failed' => {
  const s = String(summary?.status ?? '')
  return /Cancel/i.test(s) ? 'cancelled' : /Failed|Error/i.test(s) || !summary ? 'failed' : 'complete'
}

export function createImportCommands(operate: Operate) {
  return {
    /** 建一个人：空白人物 → 每件条目依次交作者「导入到人物」→ 交回建好的完整人物数据。任何一件没完成就删掉这个人。 */
    importCharacter: (plan: { name: string; rows: ImportRow[]; seed: string; id?: string }) => operate([], async () => {
      reseedKernel(plan.seed)
      const api = g.game.modules.get('plutonium')?.api
      if (!api?.importer) throw Error('Plutonium importer is not available')
      const ActorClass = g.CONFIG.Actor.documentClass
      const actor = await ActorClass.create({ ...(plan.id ? { _id: plan.id } : {}), name: plan.name, type: BUILD_ACTOR_TYPE }, { keepId: !!plan.id })
      for (const [index, row] of plan.rows.entries()) {
        const importer = await api.importer.pGetImporter({ prop: row.prop })
        if (!importer) throw Error(`No Plutonium importer for ${row.prop}`)
        const opts = new api.importer.ImportOpts({ actor, ...(row.levels ? { levels: row.levels } : {}) })
        const outcome = outcomeOf(await importer.pImportEntry(structuredClone(row.entry), opts))
        await settled()
        if (outcome !== 'complete') {
          await ActorClass.deleteDocuments([actor.id])
          return { kernelStatus: outcome === 'cancelled' ? 'pending' : 'error', reason: outcome, at: index, prop: row.prop, name: row.entry?.name ?? null }
        }
      }
      return { id: actor.id, seed: plan.seed, data: actor.toObject() }
    }, [], { ui: true }),
  }
}
