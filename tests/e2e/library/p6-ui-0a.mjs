// P6 单元 0a 人物列表（真实插件界面 + 真实结算小窗）：真实战役建两个人 → 进「人物」页 → 分类 / 搜索 / 排序 → 删除再撤销 → 回收站 → 彻底删除再撤销 → 多选 → 复制 → 窄屏。
// 截图 work/p6-ui/shots-0a/；界面验收只由驾驶员给。用法：ENGINE=chrome|webkit node tests/e2e/library/p6-ui-0a.mjs
import { rm, mkdir } from 'node:fs/promises'
import { startStatic } from './static.mjs'
import { buildAll, E2E_PORT, engines, freshFromBase } from './chain-common.mjs'
import { check, failures, settle } from '../helpers.mjs'

if (!process.env.SKIP_BUILD) await buildAll()
const engineName = process.env.ENGINE === 'webkit' ? 'webkit' : 'chrome'
const [, type, options] = engines.find((e) => e[0] === engineName)
const { server, url } = await startStatic({ port: E2E_PORT })
const profile = freshFromBase(engineName, 'p6-ui-0a') // 克隆干净底座（npm run e2e:base 造），跑完自动删（KEEP_PROFILE=1 保留）
const shots = `${process.cwd()}/work/p6-ui/shots-0a-${engineName}`
await rm(shots, { recursive: true, force: true }); await mkdir(shots, { recursive: true })
const killer = setTimeout(() => { console.error('超时 9 分钟'); process.exit(2) }, 9 * 60_000)
const ctx = await type.launchPersistentContext(profile, { ...options, viewport: { width: 1280, height: 800 } })
const page = await ctx.newPage()
page.setDefaultTimeout(90_000)
const errors = []
page.on('pageerror', (e) => errors.push(String(e.message ?? e).slice(0, 300)))
page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text().slice(0, 300)}`) })
const shot = (name) => page.screenshot({ path: `${shots}/${name}.png` })
const pinia = `(() => { const h = document.querySelector('#trpg-assistant-root'); return [...h.shadowRoot.children].map((c) => c.__vue_app__).find(Boolean).config.globalProperties.$pinia })()`
const rowNames = () => page.locator('.pp-row .pp-name b').allTextContents()
const tab = (id) => page.getByTestId(`pp-tab-${id}`)
const toastUndo = async () => { await page.locator('.trpg-toast').getByRole('button', { name: /撤销/ }).first().click(); await settle(page, 1200) }
const menu = async (name, item) => {
  await page.locator('.pp-row', { hasText: name }).first().getByRole('button', { name: /的更多操作/ }).click()
  await page.getByRole('menuitem', { name: item }).click()
}
try {
  await page.goto(url)
  await page.waitForFunction(`!!(${pinia})._s.get('app')?.booted`)
  await page.locator('.trpg-ball').click(); await settle(page, 500)
  // ---- 造数据：真实战役（走开局向导的后端入口）+ 真实建卡两人 ----
  const made = await page.evaluate(async (P) => {
    const h = await import('/work/e2e-lib/harness.js')
    for (const id of ['cn-official', 'en-official']) { const a = await h.offlineAudit(id); if (a.set?.status !== 'installed' || a.ok !== a.planFiles) await h.install(id) }
    const ps = eval(P); const camp = ps._s.get('campaign'); const app = ps._s.get('app')
    await camp.startWith((s) => s.backend.starter.startCampaign({ ...camp.owner, ruleId: 'dnd5e2014', name: '人物列表测试', codeSet: 'cn' }))
    const be = app.svc().backend; const owner = camp.owner.ownerKey
    const { plan } = await h.pickChainEntries(await be.kernelSave.libraryOf(owner), 'barbarian')
    const items = ['race', 'background', 'class'].map((k) => plan[k].ref)
    await be.kernel.enter(owner)
    // 经存档层写，和真实界面一致（直接调后端会让存档层内存里的当前数据过期，之后的写入用旧数据盖掉新加的人）
    const a = await camp.backendWrite((k) => be.people.build(k, { name: '盖尔', items }, { category: 'party', tags: ['学者'] }))
    const b = await camp.backendWrite((k) => be.people.build(k, { name: '地精 1', items }, { category: 'enemy' }))
    return { a: a.built.status, b: b.built.status, n: b.kernel?.actors.length }
  }, pinia)
  check('真实建卡两个人', made.a === 'complete' && made.b === 'complete' && made.n === 2, JSON.stringify(made))

  // ---- 侧栏出现「人物」，进页 ----
  await page.locator('.trpg-window nav').getByRole('button', { name: '人物', exact: true }).click()
  await page.waitForSelector('.pp-row .pp-name')
  await settle(page, 800)
  await shot('01-party')
  check('默认「队伍」只看到盖尔', (await rowNames()).join() === '盖尔', (await rowNames()).join())
  const counts = await page.locator('.pp-tabs button').allTextContents()
  check('分类标签带人数：队伍 1 / NPC 0 / 敌人 1 / 全部 2', counts.join('|') === '队伍1|NPC0|敌人1|全部2', counts.join('|'))
  const rowText = await page.locator('.pp-row').first().innerText()
  check('行上有官方算好的 AC、被动察觉、生命', /AC \d+/.test(rowText) && /被动察觉 \d+/.test(rowText) && /\d+\s*\/\s*\d+/.test(rowText), rowText.replace(/\s+/g, ' '))
  check('没有「—」（人物已装进结算小窗）', !(await page.locator('.pp-hp__none').count()))
  check('职业等级写成「X N 级」', /\S+ \d+ 级/.test(rowText), rowText.replace(/\s+/g, ' '))

  // ---- 分类 / 搜索 ----
  await tab('enemy').click(); check('敌人标签里只有地精 1', (await rowNames()).join() === '地精 1')
  await tab('all').click(); check('全部里 2 人', (await rowNames()).length === 2)
  await page.getByTestId('pp-search').fill('地精')
  check('搜「地精」只剩一人', (await rowNames()).join() === '地精 1')
  await tab('party').click(); await settle(page, 200)
  check('队伍里搜不到，提示在「敌人」里有', /在「敌人」里有 1 个/.test(await page.locator('.pp-empty').innerText()))
  await shot('02-search-elsewhere')
  await page.getByRole('button', { name: '去看' }).click()
  check('点「去看」切到敌人标签', (await rowNames()).join() === '地精 1')
  await page.getByTestId('pp-search').fill('不存在的人')
  check('全无结果有说明', /没有找到/.test(await page.locator('.pp-empty').innerText()))
  await page.getByTestId('pp-search').fill('')
  await tab('all').click()

  // ---- 置顶 / 排序 ----
  await menu('地精 1', '置顶'); await settle(page, 800)
  check('置顶后排最前', (await rowNames())[0] === '地精 1', (await rowNames()).join())
  await toastUndo()
  check('撤销后恢复原序', (await rowNames()).join() === '盖尔,地精 1', (await rowNames()).join())

  // ---- 删除 → 回收站 → 撤销 ----
  await menu('地精 1', '删除'); await settle(page, 800)
  check('删除后列表里没有地精 1', (await rowNames()).join() === '盖尔')
  await shot('03-after-delete-toast')
  await toastUndo()
  check('撤销后地精 1 回来', (await rowNames()).length === 2)
  await menu('地精 1', '删除'); await settle(page, 800)
  await page.locator('.pp-tools .trpg-more').click(); await page.getByRole('menuitem', { name: /回收站（1）/ }).click()
  check('回收站里是地精 1，有 [恢复] [彻底删除]', (await rowNames()).join() === '地精 1' && (await page.getByRole('button', { name: '恢复' }).count()) === 1)
  await shot('04-trash')
  await page.getByRole('button', { name: '彻底删除' }).first().click()
  await page.getByTestId('confirm-page').waitFor()
  await page.getByTestId('confirm-page').getByRole('button', { name: '彻底删除' }).click(); await settle(page, 1200)
  check('彻底删除后回收站空', /回收站是空的/.test(await page.locator('.pp-empty').innerText()))
  await toastUndo()
  check('撤销彻底删除后地精 1 回到回收站', (await rowNames()).join() === '地精 1')
  await page.getByRole('button', { name: '恢复' }).first().click(); await settle(page, 800)
  await page.locator('.pp-title button').click(); await tab('all').click()
  check('恢复后回到列表', (await rowNames()).length === 2, (await rowNames()).join())

  // ---- 多选 ----
  await page.getByTestId('pp-select').click()
  await page.locator('.pp-row').first().click()
  check('选择模式：点行即勾选，底栏显示已选 1 个', /已选 1 个/.test(await page.locator('.pp-selbar').innerText()))
  await page.getByRole('button', { name: /^全选/ }).click()
  check('全选后已选 2 个', /已选 2 个/.test(await page.locator('.pp-selbar').innerText()))
  await settle(page, 500)
  check('全选后两个勾选框都真的勾上了', (await page.locator('.pp-row input[type=checkbox]:checked').count()) === 2)
  await shot('05-select')
  await page.locator('.pp-selbar').getByRole('button', { name: '移到' }).click(); await page.getByRole('menuitem', { name: 'NPC' }).click(); await settle(page, 800)
  check('批量移到 NPC：NPC 2 人', (await page.getByTestId('pp-tab-npc').innerText()).replace(/\s/g, '') === 'NPC2')
  await toastUndo()
  check('撤销批量移动：队伍 1 / 敌人 1', (await page.getByTestId('pp-tab-party').innerText()).replace(/\s/g, '') === '队伍1')
  await page.getByTestId('pp-select').click()

  // ---- 复制 ----
  await menu('盖尔', '复制一份'); await page.waitForFunction(() => [...document.querySelector('#trpg-assistant-root').shadowRoot.querySelectorAll('.pp-name b')].some((b) => b.textContent === '盖尔 2'))
  await settle(page, 500)
  check('复制出「盖尔 2」，队伍 2 人', (await rowNames()).includes('盖尔 2') && (await page.getByTestId('pp-tab-party').innerText()).replace(/\s/g, '') === '队伍2')
  await toastUndo()
  check('撤销复制后「盖尔 2」没了，只剩盖尔和地精 1', (await rowNames()).join() === '盖尔,地精 1', (await rowNames()).join())

  // ---- 重进页面不丢；窄屏 ----
  await page.locator('.trpg-nav', { hasText: '首页' }).click(); await page.locator('.trpg-window nav').getByRole('button', { name: '人物', exact: true }).click(); await settle(page, 800)
  check('离开再回来列表还在', (await rowNames()).length >= 1)
  await page.setViewportSize({ width: 390, height: 780 }); await settle(page, 600)
  await page.locator('.trpg-tabs').getByRole('button', { name: '人物' }).click(); await settle(page, 600)
  await shot('06-narrow')
  check('窄屏：人物在底部标签里，列表可见', (await page.locator('.pp-row').count()) >= 1)
  check('窄屏没有横向滚动', await page.evaluate(() => { const c = document.querySelector('#trpg-assistant-root').shadowRoot.querySelector('.trpg-content'); return c.scrollWidth <= c.clientWidth + 1 }))
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
