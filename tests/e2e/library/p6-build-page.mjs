// P6 新建人物（第 3 段承载 A：整页接管）：真实插件界面 + 真实库 + 本机私人完整版作者建卡器。
// 人物页 ＋新建 → 新建人物 → 填名字 → 开始建卡 → 作者建卡器（插件主题）铺在弹窗里 → 选牧师 / 生命领域 → 完成建卡 → 回列表看到这个人；
// 再开一次：开始后直接关弹窗 = 不建了，存档不变、建卡小窗关掉。截图 work/p6-ui/shots-build-<引擎>-<宽>/；界面验收只由驾驶员给。
// 本机没有 vendor/private/modules/plutonium/（私人完整版，不进 git）就跳过。用法：ENGINE=chrome|webkit [W=1280 H=900] node tests/e2e/library/p6-build-page.mjs
import { access, mkdir, readFile, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { startStatic, root } from './static.mjs'
import { buildAll, E2E_PORT, engines, freshFromBase } from './chain-common.mjs'
import { check, failures, settle } from '../helpers.mjs'
import { nativeTranslations } from '../../../tools/lib/plutonium-zh.mjs'

try { await access(join(root, 'vendor/private/modules/plutonium/module.json')) } catch {
  console.log('跳过：本机没有私人完整版（vendor/private/modules/plutonium/）'); process.exit(0)
}
const readJson = async (path) => JSON.parse(await readFile(join(root, path), 'utf8'))
const localized = await access(join(root, 'vendor/private/lang/zh/modules/plutonium/js/fingerprints.json')).then(() => true, () => false)
const translations = nativeTranslations(await readJson('tools/plutonium-ui-translations.json'), await readJson('tools/approved-translations.json'))
const label = (text) => localized ? translations.get(text) ?? text : text

const killer = setTimeout(() => { console.error('超时 8 分钟'); process.exit(2) }, 8 * 60_000)
const distDir = join(root, 'work/p6-zh-pack/test-dist')
if (!process.env.SKIP_BUILD) await buildAll({ outDir: distDir })
const engineName = process.env.ENGINE === 'webkit' ? 'webkit' : 'chrome'
const W = Number(process.env.W ?? 1280), H = Number(process.env.H ?? 900)
const [, type, options] = engines.find((e) => e[0] === engineName)
const { server, url } = await startStatic({ port: E2E_PORT, distDir })
const profile = freshFromBase(engineName, 'p6-build-page')
const shots = `${root}/work/p6-ui/shots-build-${engineName}-${W}`
await rm(shots, { recursive: true, force: true }); await mkdir(shots, { recursive: true })
const ctx = await type.launchPersistentContext(profile, { ...options, viewport: { width: W, height: H } })
const page = await ctx.newPage()
page.setDefaultTimeout(120_000)
const errors = []
page.on('pageerror', (e) => errors.push(String(e.message ?? e).slice(0, 300)))
const shot = (name) => page.screenshot({ path: `${shots}/${name}.png` })
const pinia = `(() => { const h = document.querySelector('#trpg-assistant-root'); return [...h.shadowRoot.children].map((c) => c.__vue_app__).find(Boolean).config.globalProperties.$pinia })()`
const saved = () => page.evaluate(async (P) => { const ps = eval(P); const be = ps._s.get('app').svc().backend; return (await be.kernelSave.read(ps._s.get('campaign').owner.ownerKey)).actors.map((a) => a.name) }, pinia)

/** 建卡专用小窗（弹窗里那个）。 */
async function buildFrame() {
  for (let i = 0; i < 600; i++) {
    for (const f of page.frames()) {
      if (!f.url().includes('/vendor/foundry/frame.html')) continue
      if (await f.evaluate(() => String(globalThis.game?.world?.id ?? '').startsWith('trpg-build-')).catch(() => false)) return f
    }
    await page.waitForTimeout(500)
  }
  throw Error('没找到建卡专用小窗')
}
async function startFromMenu(name) {
  await page.getByRole('button', { name: '新建', exact: true }).click()
  await page.getByRole('menuitem', { name: /新建人物/ }).click()
  await page.getByTestId('build-page').waitFor()
  await page.getByTestId('bp-name').fill(name)
  await page.getByTestId('bp-start').click()
  const frame = await buildFrame()
  await frame.getByRole('button', { name: label('Confirm'), exact: true }).click()
  await frame.getByRole('button', { name: label('Finalize'), exact: true }).waitFor()
  return frame
}

try {
  await page.goto(url)
  await page.waitForFunction(`!!(${pinia})._s.get('app')?.booted`)
  await page.locator('.trpg-ball').click(); await settle(page, 500)
  await page.evaluate(async (P) => {
    const h = await import('/work/e2e-lib/harness.js')
    for (const id of ['cn-official', 'en-official']) { const a = await h.offlineAudit(id); if (a.set?.status !== 'installed' || a.ok !== a.planFiles) await h.install(id) }
    const ps = eval(P); const camp = ps._s.get('campaign')
    await camp.startWith((s) => s.backend.starter.startCampaign({ ...camp.owner, ruleId: 'dnd5e2014', name: '新建人物测试', codeSet: 'cn' }))
  }, pinia)
  await page.locator('.trpg-window nav').getByRole('button', { name: '人物', exact: true }).click()
  await page.waitForSelector('[data-testid=people-view]'); await settle(page, 600)
  const before = await saved()

  // ① 新建菜单 → 新建人物：先看表单
  await page.getByRole('button', { name: '新建', exact: true }).click()
  const items = await page.getByRole('menuitem').allTextContents()
  check('新建菜单：新建人物、从模板加入', items.length === 2 && /新建人物/.test(items[0]) && /从模板加入/.test(items[1]), items.join('|'))
  await page.getByRole('menuitem', { name: /新建人物/ }).click()
  await page.getByTestId('build-page').waitFor(); await settle(page, 400)
  await shot('00-form')
  await page.locator('.trpg-modal__close').click(); await settle(page, 400)

  // ② 建一个人：作者建卡器在弹窗里，选牧师 / 生命领域，完成建卡
  const frame = await startFromMenu('界面建卡人')
  await shot('01-builder')
  const pick = async (name, index = 0) => {
    await frame.locator('.ve-ui-sel2__ipt-search:visible').nth(index).fill(name)
    await frame.locator('.ve-ui-sel2__disp-option:visible').filter({ hasText: new RegExp('^' + name + '\\s*$') }).first().click()
  }
  await pick('Cleric'); await pick('Life Domain', 1)
  await shot('02-class')
  await frame.getByRole('button', { name: label('Finalize'), exact: true }).click()
  await frame.getByText(label('OK'), { exact: true }).click()
  await frame.getByText('Build complete.', { exact: true }).waitFor({ state: 'visible', timeout: 90_000 })
  await shot('03-complete')
  // 玩家关掉作者的完成窗 → 建卡结束 → 收进存档、弹窗关上
  for (let i = 0; i < 12 && await page.getByTestId('build-page').count(); i++) {
    await frame.locator('[data-action="close"]').last().click({ force: true, timeout: 3000 }).catch((e) => { if (!/detached|not attached|closed|Timeout|Target/i.test(e.message)) throw e })
    await page.waitForTimeout(800)
  }
  await page.getByTestId('build-page').waitFor({ state: 'detached', timeout: 60_000 })
  await settle(page, 800)
  const afterBuild = await saved()
  check('建好后存档多了这个人', afterBuild.length === before.length + 1 && afterBuild.includes('界面建卡人'), JSON.stringify(afterBuild))
  check('人物列表里出现这个人', await page.locator('.pp-row .pp-name', { hasText: '界面建卡人' }).count() === 1)
  await shot('04-roster')

  // ③ 再开一次：开始后直接关弹窗 = 不建了
  await startFromMenu('不建的人')
  await page.locator('.trpg-modal__close').click()
  await page.getByTestId('build-page').waitFor({ state: 'detached' })
  await settle(page, 1500)
  check('关弹窗 = 不建了：存档不变', JSON.stringify(await saved()) === JSON.stringify(afterBuild))
  check('建卡小窗关掉了（只剩日常结算小窗）', await page.evaluate(() => [...document.querySelector('#trpg-assistant-root').shadowRoot.querySelectorAll('iframe[data-trpg-author-frame="foundry"]')].length) === 0)
  await shot('05-after-cancel')
} catch (e) {
  check('测试流程没中断', false, String(e?.stack ?? e).slice(0, 900))
  await shot('zz-failure').catch(() => {})
} finally {
  const known = (e) => /gendata-nav-adventure-book-index|status of 404|homebrew|unearthed-arcana/.test(e)
  const unexplained = errors.filter((e) => !known(e))
  check('没有未解释的页面报错', unexplained.length === 0, unexplained.join(' | ').slice(0, 500))
  clearTimeout(killer)
  await ctx.close()
  await new Promise((r) => server.close(r))
  console.log(failures.length ? `失败 ${failures.length} 项：${failures.join("；")}` : "全部通过", `截图 ${shots}`)
  process.exit(failures.length ? 1 : 0)
}
