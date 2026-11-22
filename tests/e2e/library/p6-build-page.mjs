// P6 0c：从人物菜单按玩家方式建完整角色、保存、取消、连续新建和冷读。
// BUILD_CASE=brew 改用本战役自制种族与子职；BUILD_DATA=en 使资料集改为英文；BUILD_THEME=dark 看深色。
// 本机没有 vendor/private/modules/plutonium/（私人完整版，不进 git）就跳过。用法：ENGINE=chrome|webkit [W=1280 H=900] node tests/e2e/library/p6-build-page.mjs
import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
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
const distDir = join(root, 'work/p6-0c-restore/dist')
if (!process.env.SKIP_BUILD) await buildAll({ outDir: distDir })
const engineName = process.env.ENGINE === 'webkit' ? 'webkit' : 'chrome'
const variant = process.env.BUILD_CASE ?? 'classic'
const dataSet = process.env.BUILD_DATA ?? 'cn'
const theme = process.env.BUILD_THEME === 'dark' ? 'dark' : 'light'
const W = Number(process.env.W ?? 1280), H = Number(process.env.H ?? 900)
const [, type, options] = engines.find((e) => e[0] === engineName)
const { server, url } = await startStatic({ port: E2E_PORT, distDir })
const profile = freshFromBase(engineName, 'p6-build-page')
const shots = join(root, `work/p6-0c-restore/${engineName}-${W}${variant === 'classic' ? '' : `-${variant}`}${dataSet === 'cn' ? '' : `-${dataSet}`}${theme === 'dark' ? '-dark' : ''}`)
await mkdir(shots, { recursive: true })
const ctx = await type.launchPersistentContext(profile, { ...options, colorScheme: theme, viewport: { width: W, height: H } })
const page = await ctx.newPage()
page.setDefaultTimeout(120_000)
const errors = []
page.on('pageerror', (e) => errors.push(String(e.message ?? e).slice(0, 300)))
const shot = (name) => page.screenshot({ path: `${shots}/${name}.png`, animations: 'disabled' })
const pinia = `(() => { const h = document.querySelector('#trpg-assistant-root'); return [...h.shadowRoot.children].map((c) => c.__vue_app__).find(Boolean).config.globalProperties.$pinia })()`
const saved = () => page.evaluate(async (P) => {
  const ps = eval(P)
  const be = ps._s.get('app').svc().backend
  const record = await be.kernelSave.read(ps._s.get('campaign').owner.ownerKey)
  return record.actors.map((actor) => ({ id: actor.id, name: actor.name, base: record.bases[actor.id] }))
}, pinia)

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
  if (variant === 'brew') {
    await frame.locator('label.imp-wiz__row').filter({ has: frame.locator('.ve-source-category-homebrew--local') }).click({ modifiers: ['ControlOrMeta'] })
  }
  await frame.getByRole('button', { name: label('Confirm'), exact: true }).click()
  await frame.getByRole('navigation', { name: '建卡步骤' }).waitFor({ timeout: 35_000 })
  page.setDefaultTimeout(18_000)
  return frame
}

async function buildOne(name, capture) {
  const frame = await startFromMenu(name)
  const step = (text) => frame.getByRole('navigation', { name: '建卡步骤' }).getByRole('button').filter({ has: frame.getByText(text, { exact: true }) }).click()
  const pick = async (category, value, source = 'PHB') => {
    await frame.getByRole('searchbox', { name: `搜索${category}`, exact: true }).fill(value)
    const row = frame.locator(`button.p6-picker-row[data-source="${source}"]`).filter({ hasText: new RegExp(`^${value}\\s*${source}$`) })
    await row.click()
    if (capture && category === '种族') {
      check('左栏点选只预览，正式选择前没有打勾', await row.getAttribute('aria-pressed') === 'false')
      await frame.getByRole('button', { name: '看资料卡', exact: true }).click()
      await page.getByRole('button', { name: '返回：分步建卡', exact: true }).click()
      await page.locator('.trpg-page-leave-active').waitFor({ state: 'detached' })
      check('看库资料卡再返回仍保留未确认预览', await row.isVisible() && await row.getAttribute('aria-pressed') === 'false')
    }
    await frame.getByRole('button', { name: '选它', exact: true }).click()
    await frame.getByRole('button', { name: '取消选它', exact: true }).waitFor()
  }
  const level = frame.getByLabel('目标等级', { exact: true })
  const chooseLevel = () => level.selectOption('3')
  const finish = async () => {
    await frame.getByRole('button', { name: /^创建「/ }).click()
    await frame.getByText(label('OK'), { exact: true }).click()
    await frame.getByText('Build complete.', { exact: true }).waitFor({ state: 'visible', timeout: 90_000 })
    await frame.locator('[data-action="close"]:visible').last().click()
    await page.getByTestId('build-page').waitFor({ state: 'detached', timeout: 30_000 })
  }
  const assign = async () => {
    await step('属性值')
    const mode = (value) => frame.getByRole('group', { name: '怎么定属性' }).getByRole('button', { name: value, exact: true })
    await mode(label('Point Buy')).click()
    check('点购点显示作者购点界面', await mode(label('Point Buy')).getAttribute('aria-pressed') === 'true')
    await frame.getByRole('button', { name: label('Standard Array'), exact: true }).click()
    for (const [index, value] of ['14', '12', '13', '10', '15', '8'].entries()) {
      await frame.locator('select:visible').nth(index).selectOption({ label: value })
    }
  }
  const takeEquipment = async (name, position) => {
    const controls = frame.getByTitle(label('Choose an Item'), { exact: true })
    await controls[position]().click()
    await frame.getByRole('searchbox', { name: '搜索装备', exact: true }).fill(name)
    if (capture) await shot('04a-equipment-picker')
    await frame.locator(`.p6-equip-picker-list [data-uid^="${name}|" i]`).first().click()
  }
  if (variant === 'brew') {
    await pick('种族', '月影猫人', 'TestRunPack')
    await step('背景')
    await pick('背景', '侍僧')
    await step('职业')
    await pick('职业', '战士')
    await chooseLevel()
    await step('子职')
    await pick('子职业', '月影斥候', 'TestRunPack')
    await shot('02-class')
    await assign()
    await step('装备')
    await takeEquipment('Longsword', 'first')
    await step('完成')
    await shot('06-review')
    await finish()
    return
  }
  await pick('种族', '人类')
  await frame.locator('.p6-builder-step:visible input[type=checkbox]').nth(2).check()
  if (capture) await shot('01-species')
  await step('背景')
  await pick('背景', '侍僧')
  await frame.locator('.p6-builder-step:visible input[type=checkbox]').nth(3).check()
  await frame.locator('.p6-builder-step:visible input[type=checkbox]').nth(4).check()
  await step('职业')
  await pick('职业', '牧师')
  await chooseLevel()
  await step('子职')
  await pick('子职业', '生命领域')
  await step('职业')
  await frame.locator('.p6-builder-step:visible input[type=checkbox]').nth(0).check()
  await frame.locator('.p6-builder-step:visible input[type=checkbox]').nth(2).check()
  if (capture) await shot('02-class')
  await step('专长')
  check('专长步有作者自己的可用选项', await frame.locator('.p6-builder-step:visible .p6-native-body button:visible:not([disabled])').count() > 0)
  await step('完成')
  await frame.getByRole('button', { name: /^创建「/ }).click()
  check('待填属性会阻止创建并回到属性页', await frame.locator('.p6-builder-feedback').textContent() === '待选属性分配方式')
  await assign()
  if (capture) await shot('03-abilities')
  await step('装备')
  await takeEquipment('Amulet', 'last')
  if (capture) await shot('04-equipment')
  await step('法术')
  for (const spell of ['guidance', 'light', 'sacred%20flame']) {
    await frame.locator(`[data-p6-spell="${spell}_phb"]`).first().getByRole('button', { name: '学习', exact: true }).click()
  }
  for (const spell of ['command', 'detect%20magic', 'guiding%20bolt', 'healing%20word', 'aid', 'hold%20person']) {
    await frame.locator(`[data-p6-spell="${spell}_phb"]`).first().getByRole('button', { name: '准备', exact: true }).click()
  }
  if (capture) await shot('05-spells')
  await step('完成')
  check('完成页显示职业和已选等级', await frame.locator('.p6-builder-summary').getByText('牧师 · 3 级', { exact: true }).isVisible())
  await step('职业')
  check('回头查看仍选中本来的职业', await frame.locator('.p6-picker-row:visible[data-source=PHB]').filter({ hasText: '牧师' }).getAttribute('aria-pressed') === 'true')
  await step('完成')
  if (capture) await shot('06-review')
  await finish()
}

try {
  await page.goto(url)
  await page.waitForFunction(`!!(${pinia})._s.get('app')?.booted`)
  await page.locator('.trpg-ball').click(); await settle(page, 500)
  const brew = variant === 'brew' ? await readFile(join(root, 'work/p58-fixtures/试跑者; 试跑包.json'), 'utf8') : null
  await page.evaluate(async ({ P, dataSet, brew }) => {
    const h = await import('/work/e2e-lib/harness.js')
    for (const id of ['cn-official', 'en-official']) { const a = await h.offlineAudit(id); if (a.set?.status !== 'installed' || a.ok !== a.planFiles) await h.install(id) }
    const ps = eval(P); const camp = ps._s.get('campaign')
    const be = ps._s.get('app').svc().backend
    if (brew) {
      await be.library.bilingual.importFiles([{ name: '试跑者; 试跑包.json', text: brew }])
      await be.library.brewQueue.settled()
    }
    await camp.startWith((s) => s.backend.starter.startCampaign({ ...camp.owner, ruleId: 'dnd5e2014', name: '新建人物测试', codeSet: dataSet }))
    if (brew) {
      const owner = camp.owner.ownerKey
      const lib = await be.kernelSave.libraryOf(owner)
      await be.kernelSave.setLibrary(owner, { ...lib, include: [...lib.include, 'src:testrunpack'] })
    }
  }, { P: pinia, dataSet, brew })
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

  await buildOne('界面建卡人', true)
  if (variant === 'brew') {
    const records = await saved()
    const actor = records.find((row) => row.name === '界面建卡人')?.base
    check('正式入口建成并写入所选规则资料', records.length === before.length + 1
      && actor?.items.some((row) => row.type === 'class' && row.system.levels === 3 && row.flags.plutonium?.source === 'PHB')
      && actor?.items.some((row) => row.type === 'subclass' && row.name === '月影斥候' && row.flags.plutonium?.source === 'TestRunPack'))
    check('自制种族与手选武器进入人物', actor?.items.some((row) => row.type === 'race' && row.name === '月影猫人')
      && actor?.items.some((row) => row.type === 'weapon' && row.name === 'Longsword'))
    await writeFile(join(shots, 'actor.json'), JSON.stringify(actor, null, 2))
    await page.reload()
    await page.waitForFunction(`!!(${pinia})._s.get('app')?.booted`)
    check('刷新后完整人物数据一致', JSON.stringify(await saved()) === JSON.stringify(records))
  } else {
    await buildOne('第二个人', false)
    const afterBuild = await saved()
    check('同战役连续创建两人且编号不同', afterBuild.length === before.length + 2 && new Set(afterBuild.map((row) => row.id)).size === afterBuild.length)
    const actor = afterBuild.find((row) => row.name === '界面建卡人')?.base
    const itemsOf = (type) => actor.items.filter((row) => row.type === type)
    const points = Object.values(actor.system.abilities).map(({ value }) => value)
    check('属性和真实 3 级子职业已写入', JSON.stringify(points) === '[15,13,14,11,16,9]' && itemsOf('class').some((row) => row.system.levels === 3) && itemsOf('subclass').some((row) => row.name === 'Life Domain'), JSON.stringify(points))
    const names = actor.items.map((row) => row.name)
    check('特性与装备已写入', ['Shelter of the Faithful', 'Spellcasting', 'Channel Divinity', 'Scale Mail', 'Amulet'].every((item) => names.includes(item)))
    check('手选法术与自动法术已写入', itemsOf('spell').some((row) => row.name === 'Aid' && row.system.prepared === 1)
      && itemsOf('spell').some((row) => row.name === 'Bless' && row.system.prepared === 2))
    await writeFile(join(shots, 'actor.json'), JSON.stringify(actor, null, 2))
    check('人物列表里出现这个人', await page.locator('.pp-row .pp-name', { hasText: '界面建卡人' }).count() === 1)
    await shot('07-roster')

    // ③ 再开一次：开始后直接关弹窗 = 不建了
    await startFromMenu('不建的人')
    await page.locator('.trpg-modal__close').click()
    await page.getByTestId('build-page').waitFor({ state: 'detached' })
    await settle(page, 1500)
    check('关弹窗 = 不建了：存档不变', JSON.stringify(await saved()) === JSON.stringify(afterBuild))
    check('建卡小窗关掉了（只剩日常结算小窗）', await page.evaluate(() => [...document.querySelector('#trpg-assistant-root').shadowRoot.querySelectorAll('iframe[data-trpg-author-frame="foundry"]')].length) === 0)
    await page.reload()
    await page.waitForFunction(`!!(${pinia})._s.get('app')?.booted`)
    check('整页刷新后两人的完整存档一致', JSON.stringify(await saved()) === JSON.stringify(afterBuild))
  }
} catch (e) {
  check('测试流程没中断', false, String(e?.stack ?? e).slice(0, 900))
  for (const frame of page.frames().filter((item) => item.url().includes('/vendor/foundry/frame.html'))) {
    const info = await frame.evaluate(() => {
      const tab = document.querySelector('.p6-builder-step:not(.p6-builder-inactive)')
      return {
        width: innerWidth, title: document.querySelector('.p6-builder-tab[aria-current]')?.textContent,
        layout: tab && [getComputedStyle(tab).display, getComputedStyle(tab).gridTemplateColumns],
        lists: [...tab?.querySelectorAll('.p6-picker') ?? []].map((x) => [x.querySelector('h3')?.textContent, x.textContent?.trim().slice(0, 480)]),
        selects: [...tab?.querySelectorAll('select') ?? []].filter((el) => el.getClientRects().length).map((el) => [el.getAttribute('aria-label'), el.value]),
      }
    }).catch(() => null)
    if (info?.title) console.log(JSON.stringify(info))
  }
  await shot('zz-failure').catch(() => {})
} finally {
  const known = (e) => /gendata-nav-adventure-book-index|status of 404|homebrew|unearthed-arcana/.test(e)
    || variant === 'brew' && /Could not find object of type "list".*"老练斥候".*"TestRunPack"/.test(e)
  const unexplained = errors.filter((e) => !known(e))
  check('没有未解释的页面报错', unexplained.length === 0, unexplained.join(' | ').slice(0, 500))
  clearTimeout(killer)
  await ctx.close()
  await new Promise((r) => server.close(r))
  console.log(failures.length ? `失败 ${failures.length} 项：${failures.join("；")}` : "全部通过", `截图 ${shots}`)
  process.exit(failures.length ? 1 : 0)
}
