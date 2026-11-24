// P6 完整建卡器的草稿人：开一个空白人物交给作者完整建卡器（commands-native.ts nativeBuild）从头建。
// 只开空人，不替作者建任何东西；建好的人整份交回，存档按 B′ 存数据（读档不再重跑作者流程）。
// （之前这里还有「逐条导入向导」的 draftImport / draftReset / draftTake 和作者窗口桥，驾驶员 2026-11-21 定删掉，主线改用完整建卡器。）
/* eslint-disable @typescript-eslint/no-explicit-any -- dnd5e 文档没有类型声明。 */
import { BUILD_ACTOR_TYPE } from './actor-types'
import type { ActorGetter, Operate } from './commands-items'
import { reseedKernel } from './seed'
import { NeedsAnswer, withAuthorAnswers, type AskAnswer } from './author-ask'
import { removeOfficially } from './commands-add'
import { keyText } from './system-text'
import { itemText } from './sheet-texts'

const g = globalThis as any
const ActorClass = () => g.CONFIG.Actor.documentClass

export function createImportCommands(operate: Operate, actor: ActorGetter) {
  return {
    /** 开一个草稿人（空白人物），交回编号和空白时的数据。 */
    draftStart: (plan: { name: string; seed: string; id?: string }) => operate([], async () => {
      reseedKernel(plan.seed)
      const actor = await ActorClass().create({ ...(plan.id ? { _id: plan.id } : {}), name: plan.name, type: BUILD_ACTOR_TYPE }, { keepId: !!plan.id })
      return { id: actor.id, data: actor.toObject() }
    }),
    /** P6-R：把一个已有人物的完整数据原样放进建卡小窗（保留编号），交作者建卡器接着改（有等级 = 作者的升级模式）。 */
    draftLoad: (plan: { data: Record<string, unknown>; seed: string }) => operate([], async () => {
      reseedKernel(plan.seed)
      const actor = await ActorClass().create(structuredClone(plan.data), { keepId: true })
      return { id: actor.id, data: actor.toObject() }
    }),
    /**
     * P6-R 空白卡建人：作者「导入到人物」整路（作者文档：定制玩家角色首选直接导入到人物——职业等级、子职业特性、选项、物品、法术都带上）。
     * 作者要问玩家时经问答桥（author-ask.ts）按顺序取 answers；问到还没回答的题 = pending + 题目（主线退回这个人，问完玩家带着全部回答重跑）。
     * 答完 = 作者写进人物的全部改动是这次的变更计划（主线先给玩家看，确认才存档）。
     */
    importToActor: (actorId: string, row: { prop: string; entry: any }, answers: AskAnswer[] = [], replaceItemId?: string) => operate([], async () => {
      const a = actor(actorId)
      // 换种族 / 换背景：先官方拿掉旧的（退回它带来的成长），和导入算同一次改动
      if (replaceItemId) { const left = await removeOfficially(a, replaceItemId); if (left) return { kernelStatus: 'pending', reason: 'remove-step-not-complete', step: left } }
      const api = g.game.modules.get('plutonium')?.api
      const importer = await api?.importer?.pGetImporter({ prop: row.prop })
      if (!importer) throw Error(`作者没有「${row.prop}」的导入器`)
      const before = new Set(a.items.map((item: any) => item.id))
      try {
        const summary = await withAuthorAnswers<any>(answers, () => importer.pImportEntry(structuredClone(row.entry), new api.importer.ImportOpts({ actor: a })))
        // 种类名按 dnd5e 自己的种类语言键（CONFIG.Item.typeLabels）交出，主线过显示出口
        // 作者导入时跟着条目来的物品（起始装备等）标记只有 页面 + 来源 + 编号：按作者自己的页面 → 类别登记补上类别（物品页 → item，
        // 和作者单独换算时写的一样），存档里「用了哪些库条目」、取名、删书提示才认得它；不是真页面（raceFeature 等）的不动
        const fill = a.items.filter((item: any) => !before.has(item.id)).flatMap((item: any) => {
          const f = item.flags?.plutonium
          const prop = f && !f.propDroppable && typeof f.page === 'string' && f.page.endsWith('.html') ? g.UrlUtil?.PAGE_TO_PROPS?.[f.page]?.[0] : null
          return prop ? [{ _id: item.id, 'flags.plutonium.propDroppable': prop }] : []
        })
        if (fill.length) await a.updateEmbeddedDocuments('Item', fill)
        // 名字和人物页同一个取名出口（itemText：作者编号 / 在这条条目里的位置）；条目顺序 = 主线 displayFor([这条]) 的顺序
        const added = a.items.filter((item: any) => !before.has(item.id)).map((item: any) => ({ _id: item.id, name: item.name, label: itemText(item, [row.entry]).name, type: item.type, typeLabel: keyText(String(g.CONFIG.Item.typeLabels?.[item.type] ?? '')), flags: { plutonium: item.flags?.plutonium ?? null } }))
        // 作者的结果状态是符号（ConstsTaskRunner.TASK_EXIT_*），交它的描述：taskExitComplete / taskExitCancelled / taskExitCompleteFailed …
        const exit = typeof summary?.status === 'symbol' ? summary.status.description ?? null : null
        return { exit, added }
      } catch (error) {
        if (error instanceof NeedsAnswer) return { kernelStatus: 'pending', pending: { question: error.question }, question: error.question }
        throw error
      }
    }, [actorId]),
  }
}
