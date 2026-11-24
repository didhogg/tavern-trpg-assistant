// Tidy5e 对照预览页：用插件的结算小窗（官方 Foundry + dnd5e 原样运行）装上 Tidy5e，打开 dnd5e 自带英雄的 Tidy5e 新版角色卡。
// 样式全用原作者的（Foundry 核心 + dnd5e + Tidy5e），不套插件主题——要看的就是 Tidy5e 本来的样子。
/* eslint-disable @typescript-eslint/no-explicit-any -- 官方全局对象没有类型声明 */
import { startKernel } from '../../src/rules/kernel/host'
import { applyLangPack, readLangPacks } from '../../src/rules/kernel/lang-packs'

const root = new URL('/', location.href)
const params = new URLSearchParams(location.search)
const lang = params.get('lang') === 'en' ? 'en' : 'zh'
const rules = params.get('rules') === 'modern' ? 'modern' : 'legacy'
const status = document.getElementById('status')!
const say = (text: string) => { status.textContent = text; status.hidden = !text }
const json = async (path: string) => { const r = await fetch(new URL(path, root)); if (!r.ok) throw Error(`${r.status} ${path}`); return r.json() }

const pickers = { who: document.getElementById('who') as HTMLSelectElement, lang: document.getElementById('lang') as HTMLSelectElement, rules: document.getElementById('rules') as HTMLSelectElement }
pickers.lang.value = lang; pickers.rules.value = rules
const reloadWith = (key: string, value: string) => { params.set(key, value); location.search = params.toString() }
pickers.lang.onchange = () => reloadWith('lang', pickers.lang.value)
pickers.rules.onchange = () => reloadWith('rules', pickers.rules.value)

async function main(): Promise<void> {
  const [system, libWrapper, tidy, manifest, heroes] = await Promise.all([
    json('vendor/foundry/systems/dnd5e/system.json'), json('vendor/foundry/modules/lib-wrapper/module.json'),
    json('vendor/foundry/modules/tidy5e-sheet/module.json'), json('vendor/foundry/manifest.json'), json('vendor/foundry/packs/dnd5e.heroes.json'),
  ])
  // Tidy5e 的简体中文登记成 cn；Foundry / dnd5e 用 zh，补一条同文件的 zh
  if (lang === 'zh') tidy.languages.push({ lang: 'zh', name: '中文（简体）', path: 'lang/zh_Hans.json' })
  const { language } = lang === 'zh' ? applyLangPack('zh', await readLangPacks(root, fetch), system, [libWrapper, tidy]) : { language: 'en.core' }
  const session = await startKernel({ pluginRoot: root, container: document.getElementById('stage')!, data: async () => null, visible: true, timeoutMs: 120_000 })
  say('正在载入 dnd5e、Tidy5e 和英雄人物…')
  await session.boot({
    system, modules: [libWrapper, tidy], release: manifest.release, world: { id: 'tidy-preview', title: 'Tidy5e 对照' },
    userId: 'kernelGM00000000', worldTime: 0, language,
    settings: { 'dnd5e.rulesVersion': rules, 'dnd5e.firstRun': false },
    documents: { actors: heroes },
  } as any)
  const win = session.frame.frame.contentWindow as any
  const doc = win.document as Document
  // 原作者样式：Foundry 核心（清单登记）→ dnd5e → Tidy5e（各自 module.json / system.json 的 styles）
  const sheets = [...manifest.styles, ...system.styles.map((s: string) => `systems/dnd5e/${s}`), ...tidy.styles.map((s: string) => `modules/tidy5e-sheet/${s.replace(/^\.\//, '')}`)]
  await Promise.all(sheets.map((href: string) => new Promise((done) => { const el = Object.assign(doc.createElement('link'), { rel: 'stylesheet', href }); el.onload = el.onerror = done; doc.head.append(el) })))
  // 图标字体：Foundry 自带的是 Font Awesome 专业版（没带）；换成同一套的免费公开版，名字照 Foundry / Tidy5e 用的登记一遍
  const fa = doc.createElement('style')
  fa.textContent = ['Font Awesome 7 Pro', 'Font Awesome 6 Pro'].flatMap((family) => [
    `@font-face { font-family: '${family}'; font-weight: 900; src: url(/fa/webfonts/fa-solid-900.woff2) format('woff2'); }`,
    `@font-face { font-family: '${family}'; font-weight: 400; src: url(/fa/webfonts/fa-regular-400.woff2) format('woff2'); }`,
  ]).join('\n')
  doc.head.append(fa)
  await new Promise((done) => { const el = Object.assign(doc.createElement('link'), { rel: 'stylesheet', href: '/fa/css/all.min.css' }); el.onload = el.onerror = done; doc.head.append(el) })
  doc.body.classList.add('vtt', 'game', 'system-dnd5e', 'theme-light')
  doc.body.style.background = '#3a3631'
  const actors = win.game.actors.contents.filter((a: any) => a.type === 'character')
  pickers.who.innerHTML = actors.map((a: any) => `<option value="${a.id}">${a.name}</option>`).join('')
  // Tidy5e 登记在 dnd5e 名下（dnd5e.Tidy5eCharacterSheetQuadrone），按类名找，不写死前缀
  const sheetKey = Object.keys(win.CONFIG.Actor.sheetClasses.character).find((k) => k.endsWith('.Tidy5eCharacterSheetQuadrone'))
  let open: any = null
  const show = async (id: string) => {
    await open?.close(win.JSON.parse('{"animate":false}'))
    const actor = win.game.actors.get(id)
    if (!sheetKey) throw Error('Tidy5e 角色卡没有登记上（模块没加载成功）')
    // 让这个人的默认角色卡就是 Tidy5e（Tidy5e 自己会通过 actor.sheet 回头找它）：只改本地数据，不存任何地方
    if (actor.getFlag('core', 'sheetClass') !== sheetKey) actor.updateSource(win.JSON.parse(JSON.stringify({ flags: { core: { sheetClass: sheetKey } } })))
    // 建好后挂到 actor._sheet 上：Tidy5e 会通过 actor.sheet 回头找它自己
    const Sheet = win.CONFIG.Actor.sheetClasses.character[sheetKey].cls
    const options = win.JSON.parse(JSON.stringify({ position: { left: 8, top: 8, width: Math.min(1200, win.innerWidth - 16), height: win.innerHeight - 16 } }))
    options.document = actor
    open = actor._sheet = new Sheet(options)
    await open.render(win.JSON.parse('{"force":true}'))
  }
  pickers.who.onchange = () => { void show(pickers.who.value).catch(fail) }
  await show(actors[0].id)
  say('')
  const blank = await (await fetch('/stand-ins')).json()
  document.getElementById('blank')!.textContent = blank.length ? `空模板代替（Foundry 未公开）：${blank.join('、')}` : ''
}
const fail = (e: unknown) => { console.error(e); say(`出错了：${e instanceof Error ? e.message : String(e)}`) }
main().catch(fail)
