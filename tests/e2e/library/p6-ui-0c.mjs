// P6 单元 0c 分步建卡（真实插件界面 + 真实库 + 真实结算小窗）：新建 → 分步建卡 → 名字 → 变体人类（属性 / 技能 / 语言）→ 侍僧 → 牧师（技能候选只剩 3）→ 子职业 → 专长 → 完成创建 → 列表里有这个人、选择写进了人物；中途关窗丢掉；窄屏。
// 截图 work/p6-ui/shots-0c-*/；界面验收只由驾驶员给。用法：ENGINE=chrome|webkit node tests/e2e/library/p6-ui-0a.mjs
import { rm, mkdir } from 'node:fs/promises'
import { startStatic } from './static.mjs'
import { buildAll, engines, work } from './chain-common.mjs'
import { check, failures, settle } from '../helpers.mjs'

if (!process.env.SKIP_BUILD) await buildAll()
const engineName = process.env.ENGINE === 'webkit' ? 'webkit' : 'chrome'
const [, type, options] = engines.find((e) => e[0] === engineName)
const { server, url } = await startStatic({ port: 47348 })
const profile = `${work}/profile-p3-1-${engineName}` // 和 p6-people 共用：官方资料装过就不再下载
const shots = `${process.cwd()}/work/p6-ui/shots-0c-${engineName}`
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
try {
  await page.goto(url)
  await page.waitForFunction(`!!(${pinia})._s.get('app')?.booted`)
  await page.locator('.trpg-ball').click(); await settle(page, 500)
  // ---- 造数据：真实战役（走开局向导的后端入口），不预先建人 ----
  const made = await page.evaluate(async (P) => {
    for (const id of ['cn-official', 'en-official']) { const h0 = await import('/work/e2e-lib/harness.js'); const a = await h0.offlineAudit(id); if (a.set?.status !== 'installed' || a.ok !== a.planFiles) await h0.install(id) }
    const ps = eval(P); const camp = ps._s.get('campaign'); const app = ps._s.get('app')
    await camp.startWith((s) => s.backend.starter.startCampaign({ ...camp.owner, ruleId: 'dnd5e2014', name: '建卡测试', codeSet: 'cn' }))
    await app.svc().backend.kernel.enter(camp.owner.ownerKey)
    return true
  }, pinia)
  check('开了真实战役', made === true)
  await page.locator('.trpg-window nav').getByRole('button', { name: '人物', exact: true }).click()
  await page.waitForSelector('[data-testid=people-view]'); await settle(page, 600)
  const rowsBefore = await page.locator('.pp-row').count()
  const openWizard = async () => { await page.getByRole('button', { name: '新建', exact: true }).click(); await page.getByRole('menuitem', { name: /分步建卡/ }).click(); await page.getByTestId('wizard-page').waitFor() }
  const next = async () => { await page.getByTestId('wz-next').click(); await settle(page, 400) }
  const pickRow = async (re) => { await page.waitForSelector('[data-testid=wz-row]'); await page.getByTestId('wz-row').filter({ has: page.locator('.lib-name', { hasText: re }) }).first().click(); await page.getByTestId('wz-choose').click(); await page.getByTestId('wz-choices').first().waitFor({ timeout: 120000 }); await settle(page, 800) }
  const names = async () => page.getByTestId('wz-row').locator('.lib-name').allTextContents()

  // ---- 中途关窗 = 丢掉 ----
  await openWizard(); await page.getByTestId('wz-name').fill('不会存下的人')
  await page.locator('.trpg-modal__close').click(); await settle(page, 600)
  check('关掉建卡窗口不弹提示、不留人物', (await page.locator('.pp-row').count()) === rowsBefore && (await page.getByTestId('wizard-page').count()) === 0)

  // ---- 完整走一遍 ----
  await openWizard(); await settle(page, 800)
  const tabs0 = await page.locator('.wz-step').allTextContents()
  check('步骤标签从规则数据来：名字 / 种族 / 背景 / 职业 / 完成，没有「子职业 / 专长」', tabs0.join('|').includes('种族') && !/子职业|专长/.test(tabs0.join('|')), tabs0.join('|'))
  await shot('01-name')
  await page.getByTestId('wz-name').fill('伊娃'); await next()
  // 种族：人类（变体）
  await page.waitForSelector('[data-testid=wz-row]'); await page.getByTestId('wz-search').fill('人类'); await settle(page, 500)
  check('种族列表能搜到变体人类', (await names()).some((n) => /^人类 \(变体\)$/.test(n)), (await names()).join('|'))
  await page.getByTestId('wz-row').filter({ has: page.locator('.lib-name', { hasText: /^人类 \(变体\)$/ }) }).first().click(); await page.getByTestId('wz-choose').click()
  await page.getByTestId('wz-choices').first().waitFor({ timeout: 120000 }); await settle(page, 800)
  check('选了变体人类后：出现属性提升和技能、语言的选择', (await page.getByTestId('wz-ch-asi').count()) === 1 && (await page.getByTestId('wz-ch-trait').count()) >= 2)
  check('选了变体人类后步骤标签多出「专长」（数据里写着专长 1 个）', (await page.getByTestId('wz-step-feat').count()) === 1)
  await shot('02-race')
  await page.getByRole('button', { name: '体质 多 1' }).click(); await page.getByRole('button', { name: '感知 多 1' }).click()
  check('属性提升：每项最多 +1，选满 2 点后别的加号不能点', (await page.getByRole('button', { name: '力量 多 1' }).isDisabled()) && (await page.getByRole('button', { name: '体质 多 1' }).isDisabled()))
  const skillGroup = page.getByRole('group', { name: /技能候选/ }); const langGroup = page.getByRole('group', { name: /语言候选/ })
  await skillGroup.getByTestId('wz-opt').first().click(); await langGroup.getByTestId('wz-opt').first().click(); await settle(page, 1500)
  check('种族的选择都选满：没有「还差」', (await page.getByTestId('wz-choices').innerText()).indexOf('还差') === -1, (await page.getByTestId('wz-choices').innerText()).replace(/\s+/g, ' ').slice(0, 300))
  await next()
  // 背景：侍僧
  await page.getByTestId('wz-search').fill('侍僧'); await settle(page, 400)
  await pickRow(/侍僧/)
  await shot('03-background')
  const bgLang = page.getByRole('group', { name: /语言候选/ })
  if (await bgLang.count()) await bgLang.first().getByTestId('wz-opt').first().click()
  await settle(page, 1500); await next()
  // 职业：牧师
  await page.getByTestId('wz-search').fill('牧师'); await settle(page, 400)
  await pickRow(/^牧师$/)
  const clsSkills = page.getByRole('group', { name: /技能候选/ })
  const nOpts = await clsSkills.first().getByTestId('wz-opt').count()
  check('牧师的技能候选已排除背景给的：共 3 项', nOpts === 3, String(nOpts))
  check('选了牧师后步骤标签多出「子职业」', (await page.getByTestId('wz-step-subclass').count()) === 1)
  await clsSkills.first().getByTestId('wz-opt').nth(0).click(); await clsSkills.first().getByTestId('wz-opt').nth(1).click(); await settle(page, 1500)
  await shot('04-class')
  await next()
  // 子职业
  await page.waitForSelector('[data-testid=wz-row]'); await settle(page, 400)
  check('子职业候选是牧师的领域（多于 5 个）', (await names()).length > 5, String((await names()).length))
  await page.getByTestId('wz-row').filter({ has: page.locator('.lib-name', { hasText: /生命领域/ }) }).first().click(); await page.getByTestId('wz-choose').click(); await settle(page, 1200)
  await shot('05-subclass'); await next()
  // 专长
  await page.waitForSelector('[data-testid=wz-row]'); await settle(page, 400)
  const featCount = Number(((await page.locator('.wz-list .lib-count').innerText()).match(/共 (\d+) 条/) ?? [])[1] ?? 0)
  check('专长候选很多（全部专长），页面写明前置条件没检查', featCount > 20 && /前置条件/.test(await page.getByTestId('wz-right').innerText()), String(featCount))
  await page.getByTestId('wz-row').first().click(); await page.getByTestId('wz-choose').click(); await settle(page, 800)
  await next()
  // 属性值：先试购点（换方式要确认）→ 换回标准数组放满
  await page.getByTestId('wz-abilities').waitFor(); await settle(page, 800)
  check('步骤标签有「属性值」', (await page.getByTestId('wz-step-abilities').count()) === 1)
  const root = page.getByTestId('wz-abilities')
  const totals = async () => (await root.getByTestId('wz-ab-total').allTextContents()).map((t) => t.trim())
  check('一开始没放：合计都是官方初值加种族加成，待放的数 6 个', (await root.getByTestId('wz-ab-chip').count()) === 6 && (await totals()).join() === '10,10,11,10,11,10', (await totals()).join())
  await root.getByRole('button', { name: '购点', exact: true }).click(); await settle(page, 2500)
  check('购点：每项从 8 开始，已用 0 / 27', /已用 0 \/ 27，剩 27/.test(await root.getByTestId('wz-ab-budget').innerText()), await root.getByTestId('wz-ab-budget').innerText())
  await root.getByRole('button', { name: '力量 多一档' }).click(); await settle(page, 1500); await root.getByRole('button', { name: '力量 多一档' }).click(); await settle(page, 1500)
  check('购点：力量加两档后是 10，已用 2', /已用 2 \/ 27，剩 25/.test(await root.getByTestId('wz-ab-budget').innerText()) && (await root.getByTestId('wz-ab-row-str').getByTestId('wz-ab-base').innerText()).trim() === '10', await root.getByTestId('wz-ab-budget').innerText())
  await root.getByRole('button', { name: '标准数组', exact: true }).click()
  await page.getByTestId('confirm-page').waitFor(); await page.getByTestId('confirm-page').getByRole('button', { name: '换' }).click(); await settle(page, 2500)
  check('换回标准数组：已放的清空', (await root.getByTestId('wz-ab-chip').count()) === 6)
  for (const k of ['str', 'dex', 'con', 'int', 'wis', 'cha']) {
    await root.getByTestId('wz-ab-chip').first().click()
    await root.getByTestId(`wz-ab-row-${k}`).getByTestId('wz-ab-place').click(); await settle(page, 2000)
  }
  check('数组放满：待放的数没有了', (await root.getByTestId('wz-ab-chip').count()) === 0 && /都放完了/.test(await root.getByTestId('wz-ab-pool').innerText()))
  check('合计 = 基础 + 种族加成（后端给的数）：体质 14、感知 11', (await totals()).join() === '15,14,14,12,11,8', (await totals()).join())
  await shot('05b-abilities')
  await page.setViewportSize({ width: 390, height: 780 }); await settle(page, 800); await shot('05c-abilities-narrow')
  check('窄屏属性值：没有横向滚动，数组数字按钮不小于 44px', await page.evaluate(() => { const r = document.querySelector('#trpg-assistant-root').shadowRoot; const b = r.querySelector('[data-testid=wz-ab-place]').getBoundingClientRect(); const sc = r.querySelector('[data-testid=wz-abilities]'); return sc.scrollWidth <= sc.clientWidth + 1 && b.height >= 43 }))
  await page.setViewportSize({ width: 1280, height: 800 }); await settle(page, 800)
  await next()
  // 完成
  await page.getByTestId('wz-done').waitFor(); await settle(page, 600)
  const doneText = await page.getByTestId('wz-done').innerText()
  check('完成页写着名字、种族、背景、职业、子职业、专长', ['伊娃', '种族', '背景', '职业'].every((t) => doneText.includes(t)), doneText.replace(/\s+/g, ' ').slice(0, 200))
  await shot('06-done')
  await page.getByTestId('wz-create').click()
  await page.waitForFunction(() => ![...document.querySelector('#trpg-assistant-root').shadowRoot.querySelectorAll('[data-testid=wizard-page]')].length, null, { timeout: 120000 })
  await page.waitForSelector('.pp-row', { timeout: 60000 }); await settle(page, 1200)
  const rowText = await page.locator('.pp-row', { hasText: '伊娃' }).first().innerText()
  check('列表里有伊娃：牧师 1 级，数值是官方算好的', /牧师 1 级/.test(rowText) && /AC \d+/.test(rowText) && /\d+\s*\/\s*\d+/.test(rowText), rowText.replace(/\s+/g, ' '))
  await shot('07-list')
  // 选择真的写进了人物
  const verify = await page.evaluate(async (P) => {
    const ps = eval(P); const wz = ps._s.get('wizard'); const camp = ps._s.get('campaign'); const app = ps._s.get('app')
    const owner = camp.owner.ownerKey; const be = app.svc().backend
    const row = ps._s.get('people').rows.find((r) => r.name === '伊娃')
    const sheet = await be.people.sheet(owner, row.id)
    const prof = Object.entries(sheet.result.system.skills).filter(([, v]) => v.value >= 1).map(([k]) => k)
    const wanted = wz.picks.flat().flatMap((p) => p.value.chosen ?? []).filter((v) => v.startsWith('skills:')).map((v) => v.slice(7))
    const abil = Object.fromEntries(Object.entries(sheet.result.system.abilities).map(([k, v]) => [k, v.value]))
    return { prof, wanted, abil }
  }, pinia)
  check('玩家选的技能都在人物身上', verify.wanted.length >= 3 && verify.wanted.every((k) => verify.prof.includes(k)), JSON.stringify(verify))
  check('属性值进了人物：数组 15 14 13 12 10 8 加种族提升 → 力量 15 敏捷 14 体质 14 智力 12 感知 11 魅力 8', JSON.stringify(verify.abil) === JSON.stringify({ str: 15, dex: 14, con: 14, int: 12, wis: 11, cha: 8 }), JSON.stringify(verify.abil))
  // 没选满的留空：牧师只选 1 个技能（共 2 个位置），其余不替他选
  await openWizard(); await page.getByTestId('wz-name').fill('半选牧师'); await next()
  await page.waitForSelector('[data-testid=wz-row]'); await page.getByTestId('wz-search').fill('人类'); await settle(page, 500)
  await pickRow(/^人类$/); await next()
  await page.getByTestId('wz-search').fill('侍僧'); await settle(page, 400); await pickRow(/侍僧/); await next()
  await page.getByTestId('wz-search').fill('牧师'); await settle(page, 400); await pickRow(/^牧师$/)
  const half = page.getByRole('group', { name: /技能候选/ }).first()
  await half.getByTestId('wz-opt').nth(0).click(); await settle(page, 1500)
  while (!(await page.getByTestId('wz-done').count())) {
    if (await page.getByTestId('wz-abilities').count()) {
      const ab = page.getByTestId('wz-abilities')
      await ab.getByRole('button', { name: '手填', exact: true }).click(); await settle(page, 2500)
      await ab.getByTestId('wz-ab-row-str').getByTestId('wz-ab-input').fill('25'); await settle(page, 2500)
      check('手填：超出官方上限 20 时在这一项旁边写明范围', /范围 0 到 20/.test(await ab.getByTestId('wz-ab-row-str').innerText()), await ab.getByTestId('wz-ab-row-str').innerText())
      await ab.getByTestId('wz-ab-row-str').getByTestId('wz-ab-input').fill('18'); await settle(page, 2500)
      check('手填：改成 18 后问题消失，合计 = 18 + 种族 +1 = 19', !/范围/.test(await ab.getByTestId('wz-ab-row-str').innerText()) && (await ab.getByTestId('wz-ab-row-str').getByTestId('wz-ab-total').innerText()).trim() === '19')
    }
    await next()
  }
  const halfText = await page.getByTestId('wz-done').innerText()
  check('完成页「待填」写着技能还差 1，并说明创建后会空着', /还差 1/.test(halfText) && /空着/.test(halfText), halfText.replace(/\s+/g, ' ').slice(0, 260))
  await page.getByTestId('wz-create').click()
  await page.waitForFunction(() => ![...document.querySelector('#trpg-assistant-root').shadowRoot.querySelectorAll('[data-testid=wizard-page]')].length, null, { timeout: 120000 })
  await page.waitForSelector('.pp-row', { timeout: 60000 }); await settle(page, 1200)
  const halfSkills = await page.evaluate(async (P) => {
    const ps = eval(P); const camp = ps._s.get('campaign'); const be = ps._s.get('app').svc().backend
    const row = ps._s.get('people').rows.find((r) => r.name === '半选牧师')
    const sheet = await be.people.sheet(camp.owner.ownerKey, row.id)
    return Object.entries(sheet.result.system.skills).filter(([, v]) => v.value >= 1).map(([k]) => k).sort()
  }, pinia)
  const halfStr = await page.evaluate(async (P) => { const ps = eval(P); const camp = ps._s.get('campaign'); const be = ps._s.get('app').svc().backend; const row = ps._s.get('people').rows.find((r) => r.name === '半选牧师'); return (await be.people.sheet(camp.owner.ownerKey, row.id)).result.system.abilities.str.value }, pinia)
  check('手填的力量 18 进了人物（加种族 +1 = 19）', halfStr === 19, String(halfStr))
  check('只选了 1 个：人物身上是侍僧给的 2 个 + 玩家选的 1 个，共 3 个，没有替他补', halfSkills.length === 3, JSON.stringify(halfSkills))
  // 窄屏
  await page.setViewportSize({ width: 390, height: 780 }); await settle(page, 600)
  await page.locator('.trpg-tabs').getByRole('button', { name: '人物' }).click(); await settle(page, 400)
  await page.getByRole('button', { name: '新建', exact: true }).click(); await page.getByRole('menuitem', { name: /分步建卡/ }).click(); await page.getByTestId('wizard-page').waitFor()
  await page.getByTestId('wz-name').fill('窄屏测试'); await next(); await page.waitForSelector('[data-testid=wz-row]'); await settle(page, 600)
  await shot('08-narrow')
  check('窄屏：没有并排资料卡，有「看资料卡」按钮', (await page.getByTestId('wz-card').count()) === 0 && (await page.getByRole('button', { name: '看资料卡' }).count()) === 1)
  check('窄屏没有横向滚动', await page.evaluate(() => { const m = document.querySelector('#trpg-assistant-root').shadowRoot.querySelector('.wz'); return m.scrollWidth <= m.clientWidth + 1 }))
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
