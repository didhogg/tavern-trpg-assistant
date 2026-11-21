// 建卡专用小窗给玩家看时的样式（驾驶员 2026-11-21：作者界面的样子不要，套插件自己的主题）。三层，后挂的盖前面的：
//   ① Foundry 核心样式表（manifest 登记，tools/vendor-foundry-css.mjs）：窗口怎么摆——浮动、层叠、排列辅助类、表单结构；
//   ② 系统 / 模块自己声明的样式（作者排版：页签、左右栏、表格的位置），按 module-roots 同一条改道取本机私人完整版的那份；
//   ③ 插件主题：插件的设计变量（tokens / palette，跟随系统亮色、深色）+ ui/styles/build-frame.css（字体、配色、按钮、输入框、窗口外观）。
// 只认 Foundry 窗口和作者界面通用的元素与类名，不按窗口种类写规则；作者可缩放的窗口打开时铺满小窗（fitResizableWindows），其余窗口位置照作者和 Foundry 自己算。
/* eslint-disable @typescript-eslint/no-explicit-any -- 官方全局对象没有类型声明。 */
import tokens from '../../../ui/styles/tokens.css?inline'
import palette from '../../../ui/styles/palette.css?inline'
import theme from '../../../ui/styles/build-frame.css?inline'
import { moduleUrl } from './module-roots'

const g = globalThis as any

/** 插件的设计变量原本写在插件影子层的 :host 上；小窗是整页，换到 :root，去掉只对影子层有意义的两项。 */
export function frameTheme(parts: string[] = [tokens, palette, theme]): string {
  return parts.join('\n')
    .replace(/:host\b/g, ':root')
    .replace(/^\s*all:\s*initial;\s*$/m, '')
    .replace(/^\s*pointer-events:\s*inherit;.*$/m, '')
}

/**
 * 亮色 / 深色：插件配色跟随系统（palette.css 的 prefers-color-scheme）。Foundry 界面设置 core.uiConfig 的配色方案默认是固定深色，
 * 作者（Plutonium StylerTheme）也按这项决定开不开它的夜间模式。改成 Foundry 自己的“默认”（空 = 跟随系统），三方一致；不逐个元素改颜色。
 * 是客户端设置，要在官方启动前放进客户端存储才生效（同 frame/main.ts 的 core.noCanvas）。
 */
export const FOLLOW_SYSTEM_COLOR_SCHEME = JSON.stringify({ colorScheme: { applications: '', interface: '' } })

function link(href: string): Promise<void> {
  return new Promise((resolve) => {
    const el = Object.assign(document.createElement('link'), { rel: 'stylesheet', href })
    // 声明了但没带的样式（例如 dnd5e 的 dnd5e.css）取不到不影响排版：照常往下
    el.onload = el.onerror = () => resolve()
    document.head.append(el)
  })
}

/** 作者样式里的纹理底图（羊皮纸等）统一去掉，露出插件面板底色。按样式属性认，不按类名。 */
function dropBackgroundImages(rules: CSSRuleList): number {
  let dropped = 0
  for (const rule of Array.from(rules)) {
    const style = (rule as CSSStyleRule).style
    if (style?.backgroundImage?.includes('url(')) { style.backgroundImage = 'none'; dropped++ }
    const inner = (rule as CSSGroupingRule).cssRules
    if (inner) dropped += dropBackgroundImages(inner)
  }
  return dropped
}

/**
 * 作者开成“尽量大”的窗口铺满小窗（驾驶员 2026-11-21 选 B）。作者的写法：要尽量大的窗口，高度用 Util.getMaxWindowHeight（视口高 − 160，
 * 给 Foundry 自己的工具栏留位置），宽度用 getMaxWindowWidth（视口宽 − 250，给 Foundry 侧栏留位置）；嵌在插件里没有这些，就用 Foundry 公开的
 * setPosition 铺满。认法照作者的约定：可缩放（Foundry 窗口选项 window.resizable）且第一次画出来时高度已到作者的最大高度；小的选择框、确认框照作者原样。
 * 只在第一次画出来时铺，玩家之后自己拖动、缩放不会被改回；小窗尺寸变了（插件窗口缩放）再把这些窗口铺一次。
 */
const FIT_MARGIN = 8
/** 作者 Util._HEIGHT_MAX_OFFSET（作者模块内部常量，外面读不到；版本更新时对照作者程序）。 */
const AUTHOR_HEIGHT_RESERVE = 160
const fitted = new WeakSet<object>()
function fitWindow(app: any): void {
  app.setPosition({ left: FIT_MARGIN, top: FIT_MARGIN, width: innerWidth - FIT_MARGIN * 2, height: innerHeight - FIT_MARGIN * 2 })
}
function fitResizableWindows(): void {
  g.Hooks.on('renderApplicationV2', (app: any, _element: unknown, _context: unknown, options: any) => {
    if (!options?.isFirstRender || !app?.options?.window?.resizable) return
    if (Number(app.position?.height) < innerHeight - AUTHOR_HEIGHT_RESERVE - 2) return
    fitted.add(app)
    fitWindow(app)
  })
  let timer = 0
  addEventListener('resize', () => {
    clearTimeout(timer)
    timer = setTimeout(() => { for (const app of g.foundry.applications.instances.values()) if (app.rendered && fitted.has(app)) fitWindow(app) }, 150) as unknown as number
  })
}

/** 小窗启动完成后挂样式（frame/main.ts）。按顺序同步插入，三层的先后不受加载快慢影响。 */
export async function applyDisplayStyles(display: { styles: string[] }, roots: Record<string, string> | undefined): Promise<void> {
  fitResizableWindows()
  const packages = [g.game.system, ...g.game.modules.filter((m: any) => m.active)]
  const declared = packages.flatMap((p: any) => [...(p.styles ?? [])].map((s: any) => String(s.src ?? s)))
  const hrefs = [...display.styles, ...declared].map((path) => {
    const url = new URL(path, location.href)
    return (moduleUrl(roots, url) ?? url).href
  })
  const core = new Set(display.styles.map((path) => new URL(path, location.href).href))
  const loading = hrefs.map(async (href) => {
    await link(href)
    if (core.has(href)) return
    const sheet = [...document.styleSheets].find((s) => s.href === href)
    if (sheet) dropBackgroundImages(sheet.cssRules)
  })
  const style = document.createElement('style')
  style.dataset.trpgTheme = 'build'
  style.textContent = frameTheme()
  document.head.append(style)
  // 作者和 Foundry 运行中还会往 head 里加样式：插件主题始终挪到最后，保持“插件主题盖在最上面”
  new MutationObserver(() => { if (document.head.lastElementChild !== style) document.head.append(style) }).observe(document.head, { childList: true })
  await Promise.all(loading)
}
