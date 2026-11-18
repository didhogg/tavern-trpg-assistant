// 建卡作者窗口桥的通知格式（结算小窗 frame/ask-bridge.ts ⇄ 主线 drafts.ts）。
// 不翻译作者的问题：作者开了窗口就把窗口整个搬到建卡页（同一个格式接全部小窗），这里只传「开了 / 关了 / 取消」。
import type { FrameText } from './shown'

/** 小窗 → 插件：作者开了一个窗口（记号、标题、作者声明的样式表地址）/ 这个窗口关了。 */
export type WindowNotice = { open: string; title: FrameText; styles: string[] } | { closed: string }
/** 插件 → 小窗：cancel = 关掉这个窗口（作者按取消处理）。 */
export type WindowReply = { cancel?: true }
