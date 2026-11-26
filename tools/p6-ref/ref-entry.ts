// 参考实录工具的页面端（打包后在模拟酒馆页里跑）：用插件现有的小窗启动入口，开一个给人看的参考小窗，
// 里面同时跑官方 dnd5e + 作者 Plutonium + Tidy5e（作者自己做好了这一套配合：Tidy5e 新版角色卡页头有作者的升级按钮）。
// 只是开发工具，不进插件包；不改任何产品代码。
/* eslint-disable @typescript-eslint/no-explicit-any -- 官方全局对象没有类型声明 */
import { kernelInput } from '../../src/rules/kernel/input'
import { openKernel, prepareKernelBrews } from '../../src/rules/kernel/open'

const json = (win: any, v: unknown) => win.JSON.parse(JSON.stringify(v))

/** 开参考小窗：和战役同一套资料（同一版库、同一个资料集），多装 Tidy5e。deps = 插件建卡专用小窗用的那一组依赖。 */
export async function openReference(deps: any, ownerKey: string): Promise<{ session: any; win: any; slot: HTMLElement }> {
  const campaign = await deps.campaignOf(ownerKey)
  const view = await deps.revisions.published()
  const input: any = await kernelInput({ pluginRoot: deps.pluginRoot, rule: campaign.rule, codeSet: campaign.library.codeSet, uiLanguage: 'zh', world: { id: 'p6-ref', title: '参考' }, display: true })
  const tidy = await (await fetch('/work/tidy5e/src/dist/module.json')).json()
  input.modules = [...input.modules, tidy]
  // 作者自己的选项：经验不够时升级按钮不灰（参考那边不用改人物的经验也能点升级，两边起点数据保持一样）
  const plut = input.settings?.['plutonium.config'] ?? {}
  input.settings = { ...input.settings, 'plutonium.config': { ...plut, importClass: { ...(plut.importClass ?? {}), isLevelUpButtonDisabledUntilEnoughExperience: false } } }
  const prepared = await prepareKernelBrews(deps.service, view, campaign.library.codeSet)
  const slot = Object.assign(document.createElement('div'), { id: 'p6-ref-slot' })
  Object.assign(slot.style, { position: 'fixed', inset: '0', zIndex: '99999', background: '#3a3631' })
  document.body.append(slot)
  const { session } = await openKernel({ pluginRoot: deps.pluginRoot, files: deps.files, view, input, ...prepared, container: slot, visible: true })
  const win = session.frame.frame.contentWindow
  const doc = win.document as Document
  const css = (href: string) => new Promise((done) => { const el = Object.assign(doc.createElement('link'), { rel: 'stylesheet', href }); el.onload = el.onerror = done; doc.head.append(el) })
  // 原作者样式：dnd5e（work/tidy5e/dnd5e 由 lessc 造）→ Tidy5e（它 module.json 登记的样式）→ 图标字体（免费公开版）
  await css('/work/tidy5e/dnd5e/dnd5e.css')
  for (const s of tidy.styles ?? []) await css(`/work/tidy5e/src/dist/${String(s).replace(/^\.\//, '')}`)
  await css('/work/tidy5e/fa/css/all.min.css')
  doc.body.classList.add('vtt', 'game', 'system-dnd5e', 'theme-light')
  return { session, win, slot }
}

/** 把一份完整人物数据（我们这边导出的）原样放进参考小窗，编号照旧，用 Tidy5e 新版角色卡打开。 */
export async function loadAndOpen(win: any, source: Record<string, unknown>): Promise<string> {
  const actor = await win.Actor.create(json(win, source), json(win, { keepId: true }))
  const sheetKey = Object.keys(win.CONFIG.Actor.sheetClasses.character).find((k) => k.endsWith('.Tidy5eCharacterSheetQuadrone'))
  if (!sheetKey) throw Error('Tidy5e 新版角色卡没有登记上（模块没加载成功）')
  // 不改人物数据（不写 flags.core.sheetClass）：直接用 Tidy5e 的角色卡类开，挂到 actor._sheet 上（Tidy5e 经 actor.sheet 回头找它）
  const Sheet = win.CONFIG.Actor.sheetClasses.character[sheetKey].cls
  const options = json(win, { position: { left: 8, top: 8, width: Math.min(1200, win.innerWidth - 16), height: win.innerHeight - 16 } })
  options.document = actor
  const sheet = actor._sheet = new Sheet(options)
  await sheet.render(json(win, { force: true }))
  return actor.id
}

/** 小窗里现在开着的窗口（作者的旧式窗口 + 官方新式窗口），给步骤记录用。 */
export function windowsOf(win: any): string[] {
  const v1 = Object.values(win.ui?.windows ?? {}).map((a: any) => `${a.constructor?.name}:${a.title ?? ''}`)
  const v2 = [...(win.foundry?.applications?.instances?.values?.() ?? [])].map((a: any) => `${a.constructor?.name}:${a.title ?? ''}`)
  return [...v1, ...v2]
}
