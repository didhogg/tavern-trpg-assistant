// P6-R 驾驶员真机坏掉的三条路原样走一遍（11-23：建不了空白人物、改个数值编辑窗口把东西删光、撤销后整张卡读不出来消失），
// 再走编辑窗口、效果、状态、日志、背景、休息、加法术。真实插件界面 + 真实库 + 真实结算小窗；每步看界面上的数，不只看后端。
import { rm, mkdir } from 'node:fs/promises'
import { startStatic } from './static.mjs'
import { buildAll, E2E_PORT, engines, freshFromBase } from './chain-common.mjs'
import { check, failures, settle } from '../helpers.mjs'

if (!process.env.SKIP_BUILD) await buildAll()
const engineName = process.env.ENGINE === 'webkit' ? 'webkit' : 'chrome'
const [, type, options] = engines.find((e) => e[0] === engineName)
const { server, url } = await startStatic({ port: E2E_PORT })
const shots = `${process.cwd()}/work/p6-ui/shots-flow-${engineName}`
await rm(shots, { recursive: true, force: true }); await mkdir(shots, { recursive: true })
const killer = setTimeout(() => { console.error('超时 9 分钟'); process.exit(2) }, 9 * 60_000)
const ctx = await type.launchPersistentContext(freshFromBase(engineName, 'p6-r-flow'), { ...options, viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
page.setDefaultTimeout(90_000)
const errors = []
page.on('pageerror', (e) => errors.push(String(e.message ?? e).slice(0, 300)))
page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text().slice(0, 300)}`) })
const shot = (name) => page.screenshot({ path: `${shots}/${name}.png` })
const pinia = `(() => { const h = document.querySelector('#trpg-assistant-root'); return [...h.shadowRoot.children].map((c) => c.__vue_app__).find(Boolean).config.globalProperties.$pinia })()`
const str = () => page.getByTestId('ps-ability-str').locator('span').innerText()
const saveEditor = async () => { await page.getByTestId('pf-save').click(); await page.getByTestId('field-editor').waitFor({ state: 'detached' }); await settle(page, 1200) }
const undo = async () => { await page.getByTestId('ps-undo').click(); await settle(page, 1500) }
try {
  await page.goto(url)
  await page.waitForFunction(`!!(${pinia})._s.get('app')?.booted`)
  await page.locator('.trpg-ball').click(); await settle(page, 500)
  await page.evaluate(async (P) => {
    const h = await import('/work/e2e-lib/harness.js')
    for (const id of ['cn-official', 'en-official']) { const a = await h.offlineAudit(id); if (a.set?.status !== 'installed' || a.ok !== a.planFiles) await h.install(id) }
    const ps = eval(P); const camp = ps._s.get('campaign')
    await camp.startWith((s) => s.backend.starter.startCampaign({ ...camp.owner, ruleId: 'dnd5e2014', name: '真用户流程', codeSet: 'cn' }))
    await ps._s.get('app').svc().backend.kernel.enter(camp.owner.ownerKey)
  }, pinia)
  await page.locator('.trpg-window nav').getByRole('button', { name: '人物', exact: true }).click(); await settle(page, 800)

  // ① 空白人物
  await page.getByRole('button', { name: '新建' }).click(); await page.getByRole('menuitem', { name: '空白人物' }).click()
  await page.getByTestId('ps-head').waitFor(); await settle(page, 1200)
  check('① 空白人物：建好、进了详情', /新人物/.test(await page.locator('.ps-name-line').innerText()))
  const str0 = await str()

  // ② 编辑窗口改一个数（力量底值），保存：数变了，别的都在
  await page.getByTestId('ps-ability-str').click(); await page.getByTestId('field-editor').waitFor(); await settle(page, 800)
  await shot('01-editor-str')
  const input = page.locator('[data-path="system.abilities.str.value"] input')
  await input.fill('15')
  await saveEditor()
  check('② 编辑窗口改力量 → 15，页头跟着变', (await str()) === '15', `${str0} → ${await str()}`)
  check('② 改完人物还在（名字、属性、生命都在）', /新人物/.test(await page.locator('.ps-name-line').innerText()) && (await page.locator('.ps-ability').count()) === 6 && (await page.getByTestId('ps-hp').count()) === 1)

  // ③ 撤销：数回去，卡还读得出来；再撤销到加人之前，人从列表里消失（这是对的），再点回来是正常的人
  await undo()
  check('③ 撤销：力量回到原值、卡照常显示', (await str()) === str0 && (await page.getByTestId('ps-head').count()) === 1, await str())
  await page.getByTestId('ps-ability-str').click(); await page.getByTestId('field-editor').waitFor(); await settle(page, 800)
  await page.locator('[data-path="system.abilities.str.value"] input').fill('14'); await saveEditor()
  await page.getByTestId('ps-back').click(); await settle(page, 800)
  await page.getByTestId('pp-row').filter({ hasText: '新人物' }).first().click(); await page.getByTestId('ps-head').waitFor(); await settle(page, 1200)
  check('③ 回列表再点进来：力量还是 14（存进去了）', (await str()) === '14')

  // ④ 来源条目：AC 添加条目 +2（手动效果）→ AC +2；撤销回去
  const ac0 = Number(await page.getByTestId('ps-ac').locator('b').innerText())
  await page.getByTestId('ps-ac').click(); await page.getByTestId('field-editor').waitFor(); await settle(page, 800)
  await page.getByTestId('pf-add').click(); await page.getByTestId('pf-add-value').fill('2'); await page.getByTestId('pf-add-value').press('Enter')
  await shot('02-editor-ac-add'); await saveEditor()
  check('④ AC 添加条目 +2 → AC 多 2', Number(await page.getByTestId('ps-ac').locator('b').innerText()) === ac0 + 2, `${ac0} → ${await page.getByTestId('ps-ac').locator('b').innerText()}`)
  await page.getByTestId('ps-ac').click(); await page.getByTestId('field-editor').waitFor(); await settle(page, 800)
  check('④ 再打开 AC：条目里有「手动 +2」', /手动[\s\S]*\+2|\+2[\s\S]*手动/.test(await page.getByTestId('pf-effects').innerText()))
  await shot('03-editor-ac-entries')
  await page.locator('.trpg-modal__close').click(); await settle(page, 500)

  // ⑤ 效果页：状态开关、添加效果（改力量 +1）、停用
  await page.getByTestId('ps-tab-effect').click(); await page.getByTestId('ps-effects').waitFor(); await settle(page, 500)
  await page.getByTestId('ps-cond-poisoned').click(); await settle(page, 1500)
  check('⑤ 点「中毒」→ 状态开着', (await page.getByTestId('ps-cond-poisoned').getAttribute('aria-pressed')) === 'true')
  await page.getByTestId('ps-effects-add').click(); await page.getByTestId('add-effect').waitFor(); await settle(page, 1500)
  await page.getByTestId('ae-name').fill('巨力腰带（测试）')
  await page.getByTestId('add-effect').getByRole('combobox').first().click(); await page.keyboard.type('力量'); await settle(page, 600)
  await page.getByRole('option').filter({ hasText: /属性值/ }).first().click()
  await page.getByTestId('ae-value').fill('1'); await page.getByTestId('ae-save').click(); await page.getByTestId('add-effect').waitFor({ state: 'detached' }); await settle(page, 1500)
  await shot('04-effects')
  check('⑤ 添加效果：效果页出现「巨力腰带（测试）」', /巨力腰带（测试）/.test(await page.getByTestId('ps-effects').innerText()))

  // ⑥ 日志：新建一页、写正文
  await page.getByTestId('ps-tab-note').click(); await page.getByTestId('ps-notes').waitFor()
  await page.getByTestId('ps-notes-add').click(); await settle(page, 1500)
  await page.getByTestId('ps-note-body').getByRole('button', { name: '改正文' }).click()
  await page.getByTestId('ps-note-body').locator('textarea').fill('在矿坑入口遇到地精伏击。'); await page.getByTestId('ps-note-body').getByRole('button', { name: '保存' }).click(); await settle(page, 1500)
  check('⑥ 日志写进去了', /地精伏击/.test(await page.getByTestId('ps-notes').innerText()))
  await shot('05-notes')

  // ⑦ 背景：写外貌
  await page.getByTestId('ps-tab-bio').click(); await page.getByTestId('ps-bio').waitFor()
  await page.getByTestId('ps-bio-add-appearance').click(); await settle(page, 400)
  await page.getByTestId('ps-bio-appearance').locator('textarea').fill('高个子，深色头发。'); await page.getByTestId('ps-bio-appearance').getByRole('button', { name: '保存' }).click(); await settle(page, 1500)
  check('⑦ 外貌写进去了', /深色头发/.test(await page.getByTestId('ps-bio').innerText()))

  // ⑧ 长休、短休不报错；撤销还是正常的人
  await page.getByTestId('ps-long-rest').click(); await settle(page, 1500)
  await page.getByTestId('ps-short-rest').click(); await settle(page, 1500)
  await undo(); await undo()
  check('⑧ 休息后连撤两步：卡照常', (await page.getByTestId('ps-head').count()) === 1 && /新人物/.test(await page.locator('.ps-name-line').innerText()))

  // ⑨ 加法术（从库里选）
  await page.getByTestId('ps-tab-spell').click(); await page.getByTestId('ps-spells').waitFor()
  await page.getByTestId('ps-spells-add').click(); await page.getByTestId('item-pick').waitFor()
  await page.getByTestId('ip-search').fill('火焰箭'); await settle(page, 800)
  await page.getByTestId('ip-row').first().click(); await settle(page, 800); await page.getByTestId('ip-add').click()
  await page.getByTestId('item-pick').waitFor({ state: 'detached', timeout: 120_000 }); await settle(page, 1500)
  check('⑨ 加法术：法术页出现火焰箭', /火焰箭/.test(await page.getByTestId('ps-spells').innerText()))
  await shot('06-spells')

  // ⑪ 身份抽屉：空白人物选种族、背景、职业 → 等级管理升一级 → 换种族
  const pick = async (testid, query) => {
    await page.getByTestId('ps-ident-edit').click(); await page.getByTestId('ps-drawer-identity').waitFor(); await settle(page, 500)
    await page.getByTestId(testid).click(); await page.getByTestId('item-pick').waitFor()
    await page.getByTestId('ip-search').fill(query); await settle(page, 800)
    await page.getByTestId('ip-row').first().click(); await settle(page, 600); await page.getByTestId('ip-add').click()
    await page.getByTestId('item-pick').waitFor({ state: 'detached', timeout: 120_000 }); await settle(page, 1500)
  }
  await pick('ps-id-race', '精灵')
  check('⑪ 选种族：名字行 / 事实表出现「精灵」', /精灵/.test(await page.getByTestId('ps-head').innerText()))
  await pick('ps-id-bg', '侍僧')
  check('⑪ 选背景：出现「侍僧」', /侍僧/.test(await page.getByTestId('ps-facts').innerText()))
  await pick('ps-id-class', '战士')
  check('⑪ 选职业：名字行「战士 1」', /战士 1/.test(await page.getByTestId('ps-sub').innerText()), await page.getByTestId('ps-sub').innerText())
  await shot('07-identity-built')
  await page.getByTestId('ps-level').getByRole('button', { name: '等级管理' }).click(); await page.getByRole('menuitem', { name: /升一级/ }).click(); await settle(page, 2500)
  check('⑪ 等级管理升一级：战士 2', /战士 2/.test(await page.getByTestId('ps-sub').innerText()), await page.getByTestId('ps-sub').innerText())
  await pick('ps-id-race', '矮人')
  const facts = await page.getByTestId('ps-facts').innerText()
  check('⑪ 换种族：矮人进来、精灵没了', /矮人/.test(facts) && !/精灵/.test(facts), facts.replace(/\s+/g, ' '))
  await shot('08-race-changed')

  // ⑩ 连续撤销到底（把加人也撤掉）：列表里没有这个人，界面不报错；不留读不出来的卡
  const steps = await page.evaluate(async (P) => (await eval(P)._s.get('app').svc().backend.kernelSave.read(eval(P)._s.get('campaign').owner.ownerKey)).undo.length, pinia)
  for (let i = 0; i < steps; i++) { if (!(await page.getByTestId('ps-undo').count())) break; await undo() }
  await settle(page, 1000)
  const listShown = (await page.getByTestId('people-view').count()) === 1
  check('⑩ 撤到加人之前：回到列表、没有读不出来的卡', listShown && (await page.getByText('读取人物失败').count()) === 0)
} catch (e) {
  check('测试流程没中断', false, String(e?.stack ?? e).slice(0, 900))
  await shot('99-crash').catch(() => undefined)
} finally {
  const bad = errors.filter((e) => !/gendata-nav-adventure-book-index|plutonium|net::ERR|Failed to load resource|requires usable window dimensions/.test(e))
  check('没有未解释的页面报错', bad.length === 0, bad.join(' | ').slice(0, 600))
  clearTimeout(killer); await ctx.close(); server.close()
  console.log(failures.length ? `FAILED ${failures.length}` : 'ALL PASS')
  process.exit(failures.length ? 1 : 0)
}
