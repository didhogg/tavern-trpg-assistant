// P6 第 2 段：建卡专用小窗里原样跑作者完整建卡器（本机私人完整版 Plutonium 的公开入口 charactermancer.pOpen）。
// 作者自己组织全部步骤（来源窗口 → 职业 / 种族 / 背景 / 属性 / 装备 / 法术 / 专长 → Finalize）、自己校验、自己开子窗口。
// 我们只做三件事：
//   ① 本战役选不到的书和条目写进作者自己的屏蔽名单（ExcludeUtil，作者合并候选资料时统一按它过滤）——范围只在这一处；
//   ② 作者收下的本战役自制包（宿主按 brews/… 地址供应，open.ts）登记进作者设置「额外自制文件」（dataSources.localHomebrew）：
//      作者来源窗口才列得出、勾选后作者自己按地址读进候选（作者的「自制」来源只认这份清单，不看内存仓库）；
//   ③ 0c 的画面使用同一个作者建卡实例。锁定版本以作者最终完成回调判成功。
/* eslint-disable @typescript-eslint/no-explicit-any -- 作者运行时对象没有类型声明。 */
import type { Operate } from './commands-items'
import { settled } from './server'
import { installNativeBuilderUi } from './native-builder-ui'
import { nativeBuilderAuthor } from './plutonium-build'
import type { NativePresentation } from '../native-presentation'

const g = globalThis as any
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** 作者屏蔽名单的一行（作者自己的格式：hash / category / source 可为 * 表示整类 / 整本）。 */
export interface ExcludeRow { displayName: string; hash: string; category: string; source: string }

export function createNativeCommands(operate: Operate) {
  return {
    /** 跑作者完整建卡器建这个草稿人；交回 built + 整份人物（没建 = 玩家取消）。 */
    nativeBuild: (plan: { id: string; excludes: ExcludeRow[]; brewFiles: string[]; presentation?: NativePresentation }) => operate([], async () => {
      const api = g.game.modules.get('plutonium')?.api
      if (typeof api?.charactermancer?.pOpen !== 'function') throw Error('这份 Plutonium 没有完整建卡器（需要本机私人完整版，放在 vendor/private/modules/plutonium/）')
      const actor = g.game.actors.get(plan.id)
      if (!actor) throw Error(`草稿人不在：${plan.id}`)
      if (plan.presentation && !nativeBuilderAuthor) throw Error('当前私人完整版和分步建卡支持的版本不一致')
      // 作者自己的默认名单保留，本战役的行追加在后面（作者公开的取名单 / 设名单入口；
      // 作者的 pExtendList 要先有它内部的查询缓存，启动后那份缓存可能还没建，所以不用它）
      await g.ExcludeUtil.pInitialise()
      await g.ExcludeUtil.pSetList([...g.ExcludeUtil.getList(), ...structuredClone(plan.excludes)])
      // 地址按小窗目录拼原文（不转义）：作者拿地址最后一段当来源窗口里显示的包名
      const frameDir = new URL('.', location.href).href
      if (await api.config.setValue('dataSources', 'localHomebrew', plan.brewFiles.map((path) => frameDir + path)) === false) throw Error('作者不让登记本战役自制包（dataSources.localHomebrew）')
      const before = JSON.stringify(actor.toObject())
      const builder = nativeBuilderAuthor && installNativeBuilderUi(nativeBuilderAuthor, plan.presentation)
      const open = new Set<any>()
      let wake: () => void = () => undefined
      const rendered = g.Hooks.on('renderApplicationV2', (app: any) => { open.add(app) })
      const closed = g.Hooks.on('closeApplicationV2', (app: any) => { open.delete(app); if (!open.size) wake() })
      try {
        await api.charactermancer.pOpen({ actor })
        // 作者入口在来源窗口确认后就返回（建卡器随后才画出来）；之后作者还会开确认窗、子窗口。
        // 稳定半秒都没有作者窗口开着，才算作者这一轮结束。
        for (;;) {
          await sleep(500)
          if (!open.size) break
          await new Promise<void>((resolve) => { wake = resolve; if (!open.size) resolve() })
        }
      } finally {
        g.Hooks.off('renderApplicationV2', rendered)
        g.Hooks.off('closeApplicationV2', closed)
        builder?.close()
      }
      await settled()
      const data = actor.toObject()
      const error = builder?.error()
      if (error) throw error
      const built = builder ? builder.completed() : JSON.stringify(data) !== before
      return built ? { built: true, data } : { built: false }
    }, [], { ui: true }),
  }
}
