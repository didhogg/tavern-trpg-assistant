// 建卡作者窗口桥（驾驶员 2026-11-18 定：作者窗口选择的内容放在我们建卡页右边，全部小窗一个格式接）。
// 作者流程原样跑，作者自己的窗口原样画、原样处理玩家的点击；这里只有一条规则：
//   作者开了一个窗口（任何一种：是 / 否、选熟练、背景特性、个性特征、装备、法术…，都是 ApplicationV2）→ 给它记号，
//   告诉插件「开了窗口」（插件把这个窗口整个搬到建卡页右边）；窗口关了 → 告诉插件「关了」。
//   插件回「取消」（玩家改选了前面的条目）→ 关掉这个窗口，作者按取消处理。
// 不拦作者出口、不读作者组件、不按窗口种类分；只在建卡导入期间（withAuthorWindows）生效。
/* eslint-disable @typescript-eslint/no-explicit-any -- 作者运行时对象没有类型声明。 */
import type { WindowNotice, WindowReply } from '../ask'
import { fromAuthor } from '../shown'
import { authorTextPath } from './author-text'

const g = globalThis as any
const tell = (notice: WindowNotice): Promise<WindowReply> => g.__trpgAsk(notice) as Promise<WindowReply>
let next = 0

/** 系统和启用模块自己声明的样式表（manifest 的 styles）：搬过去的窗口按作者的样式排版。 */
function declaredStyles(): string[] {
  const packages = [g.game.system, ...g.game.modules.filter((m: any) => m.active)]
  return packages.flatMap((p: any) => [...(p.styles ?? [])].map((s: any) => new URL(String(s.src ?? s), location.href).href))
}

/** 建卡导入期间：作者开的每个窗口都交给插件搬到建卡页。 */
export async function withAuthorWindows<T>(run: () => Promise<T>): Promise<T> {
  const tokens = new WeakMap<object, string>()
  const opened = g.Hooks.on('renderApplicationV2', (app: any) => {
    if (tokens.has(app)) return
    const token = `w${++next}`
    tokens.set(app, token)
    const root = app.element as HTMLElement
    root.dataset.trpgWindow = token
    const title = String(app.title ?? app.options?.window?.title ?? '')
    void tell({ open: token, title: fromAuthor(title, authorTextPath(title)), styles: declaredStyles() }).then(
      (reply) => { if (reply?.cancel) void app.close() },
      (e: unknown) => { console.error('[trpg-kernel] 作者窗口交不出去', e); void app.close() },
    )
  })
  const closed = g.Hooks.on('closeApplicationV2', (app: any) => {
    const token = tokens.get(app)
    if (token) void tell({ closed: token }).catch((e: unknown) => console.error('[trpg-kernel] 作者窗口关闭通知失败', e))
  })
  try { return await run() } finally { g.Hooks.off('renderApplicationV2', opened); g.Hooks.off('closeApplicationV2', closed) }
}
