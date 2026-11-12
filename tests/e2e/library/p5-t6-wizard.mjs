// P5-5 §13：开局向导改版（Chrome，真实中文资料副本，断网）。四步 规则 / 版本 / 资料 / 命名；5.5e 灰掉不能选但资料能勾；
// 书和冒险一个列表、标签默认筛到所选版本；没下载的默认不勾、已下载的灰勾；分组框全选 / 取消；开局按勾选的书配到中英两套。
// 用法：npm run build 后 node tests/e2e/library/p5-t6-wizard.mjs
import { cp, mkdtemp, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { startStatic } from './static.mjs'
import { engines, work } from './chain-common.mjs'
setTimeout(() => process.exit(124), 300000)
const profile = await mkdtemp(join(work, 'p5-t6-wizard-'))
await cp(join(work, 'p5-t6-pack-audit-WST6kp'), profile, { recursive: true, filter: (p) => !p.includes('Singleton') })
const { server, url } = await startStatic({ port: 47342 })
const [, chrome, options] = engines[0]
const ctx = await chrome.launchPersistentContext(profile, { ...options, viewport: { width: 1280, height: 850 } })
const result = { checks: {}, info: {}, pageErrors: [] }
const ok = (k, v, info) => { result.checks[k] = !!v; if (info !== undefined) result.info[k] = info; console.log(`${v ? 'PASS' : 'FAIL'}  ${k}${info !== undefined ? ' — ' + JSON.stringify(info) : ''}`) }
const P = `(() => { const h = document.querySelector('#trpg-assistant-root'); return [...h.shadowRoot.children].map((c) => c.__vue_app__).find(Boolean).config.globalProperties.$pinia })()`
try {
  await ctx.route((u) => !u.href.startsWith(url), (r) => r.abort())
  const page = await ctx.newPage()
  page.setDefaultTimeout(30000)
  page.on('pageerror', (e) => { if (!result.pageErrors.includes(e.message)) result.pageErrors.push(e.message) })
  await page.goto(url)
  await page.waitForFunction(`!!(${P})._s.get('app')?.booted`)
  // 记下开局时传给后端的东西
  await page.evaluate((P) => {
    const st = eval(P)._s.get('app').svc().backend.starter
    const orig = st.startCampaign.bind(st)
    st.startCampaign = async (input) => { window.__startInput = JSON.parse(JSON.stringify(input)); const r = await orig(input); window.__downloads = r.downloads; return r }
  }, P)
  await page.locator('.trpg-ball').click()
  if (await page.getByTestId('start-banner').count()) await page.getByTestId('start-banner').click()
  else { await page.getByTestId('save-chip').click(); await page.getByTestId('drawer-new').click() }
  await page.getByTestId('wizard').waitFor()
  const steps = await page.locator('.trpg-steps li').allInnerTexts()
  ok('四步：规则、版本、资料、命名', steps.length === 4 && ['规则', '版本', '资料', '命名'].every((s, i) => steps[i].includes(s)), steps)
  const fam = page.getByTestId('rule-card')
  ok('①：一个体系「D&D 5e」，自动选中，写明版本 5e / 5.5e', (await fam.count()) === 1 && (await fam.getAttribute('aria-checked')) === 'true' && /5e \/ 5\.5e/.test(await fam.innerText()), await fam.innerText())
  await page.getByTestId('wizard-next').click()
  const cards = page.getByTestId('version-card')
  await cards.first().waitFor()
  const v14 = cards.filter({ hasText: '2014' }), v24 = cards.filter({ hasText: '2024' })
  ok('②：两个版本；5e（2014）已预选', (await cards.count()) === 2 && (await v14.getAttribute('aria-checked')) === 'true')
  ok('②：5.5e 灰掉，写「结算规则还没接入」，并说明资料可以在下一步下载', (await v24.getAttribute('aria-disabled')) === 'true' && /结算规则还没接入/.test(await v24.innerText()) && /资料可以/.test(await v24.innerText()))
  await v24.click({ force: true })
  ok('②：点 5.5e 选不上，仍是 5e', (await v24.getAttribute('aria-checked')) === 'false' && (await v14.getAttribute('aria-checked')) === 'true')
  await page.screenshot({ path: join(profile, 'step2-version.png') })
  await page.getByTestId('wizard-next').click()
  await page.getByTestId('wizard-shelf').waitFor({ timeout: 60000 })
  const pressed = await page.locator('[data-testid=wizard-filter] button[aria-pressed=true]').innerText()
  ok('③：标签 全部 / 5e / 5.5e / 未归类，默认筛到 5e', pressed.trim() === '5e', pressed)
  const rows = page.getByTestId('wizard-row')
  const stats = await rows.evaluateAll((els) => els.map((e) => ({ kind: e.dataset.kind, on: e.querySelector('.trpg-check')?.dataset.on === 'true', dl: !!e.querySelector('.trpg-check')?.dataset.dl, dis: e.querySelector('.trpg-check')?.dataset.disabled === 'true', title: e.title })))
  result.info.rows = { total: stats.length, dl: stats.filter((s) => s.dl).length, adv: stats.filter((s) => s.kind === 'adventure').length }
  ok('③：书和冒险在同一个列表里', stats.some((s) => s.kind === 'book') && stats.some((s) => s.kind === 'adventure'), result.info.rows)
  ok('③：没下载的默认一本不勾', stats.filter((s) => !s.dl).every((s) => !s.on))
  ok('③：已下载的是灰勾、不能取消，悬停写「已下载」', stats.filter((s) => s.dl).length > 0 && stats.filter((s) => s.dl).every((s) => s.on && s.dis && /已下载/.test(s.title)))
  ok('③：底部写「已选 0 项 · 不下载新资料」', /已选 0 项 · 不下载新资料/.test(await page.getByTestId('wizard-picked').innerText()), await page.getByTestId('wizard-picked').innerText())
  // 分组框：找一个有没下载的行的分组（测试副本里 5e 的书都装了，可勾的是冒险），[ ] 全选 → [−] 取消
  const grp = page.locator('[data-testid=wizard-shelf] .trpg-shelf__group').filter({ has: page.locator('[data-testid=wizard-row] .trpg-check:not([data-dl])') }).first()
  const gbox = grp.locator('[data-testid=group-check]')
  const pickedIs = (re) => page.waitForFunction((src) => new RegExp(src).test(document.getElementById('trpg-assistant-root').shadowRoot.querySelector('[data-testid=wizard-picked]')?.textContent ?? ''), re.source, { timeout: 10000 }).catch(() => {})
  await gbox.click()
  await pickedIs(/已选 [1-9]\d* 项/) // 分组框要先问后端的勾选检查，冒险才勾上
  const all = await page.getByTestId('wizard-picked').innerText()
  await gbox.click()
  await pickedIs(/已选 0 项/)
  const none = await page.getByTestId('wizard-picked').innerText()
  ok('③：分组框 [ ] 全选这一组、[−] 再点取消', /已选 [1-9]\d* 项/.test(all) && /已选 0 项/.test(none), { all, none })
  // 切到 5.5e：2024 规则的书照样列出（这份副本官方书全装了，都是灰勾）；勾一本 5.5e 标签下的冒险，真走一遍开局。
  // 「勾书 → 中英各按这几本下载」由单元测试 start-campaign.test.ts 锁住（这份副本没有没装的书可勾）。
  await page.locator('[data-testid=wizard-filter] button', { hasText: '5.5e' }).click()
  await page.waitForTimeout(300)
  const books55 = await page.locator('[data-testid=wizard-row][data-kind=book] small').allTextContents() // 书架行屏幕外不画（content-visibility），innerText 会是空的
  ok('③：切到 5.5e 后列出 2024 规则的书，行上标「书 · 5.5e（· 年份，作者书目没写出版日期的不写）」', books55.length > 0 && books55.every((t) => /^书 · 5\.5e( · \d{4})?$/.test(t.trim())), books55.slice(0, 3))
  const adv55 = page.locator('[data-testid=wizard-row][data-kind=adventure]').filter({ has: page.locator('.trpg-check:not([data-dl])') }).first()
  const advGroup = page.locator('[data-testid=wizard-shelf] .trpg-shelf__group').filter({ has: adv55 }).first()
  if ((await advGroup.getAttribute('open')) === null) await advGroup.locator('summary').click()
  const advName = (await adv55.locator('.trpg-term').textContent()).trim()
  ok('③：冒险行写「冒险 · 等级 x–y」', /^冒险( · 等级 \d+–\d+)?$/.test((await adv55.locator('small').textContent()).trim()), await adv55.locator('small').textContent())
  await adv55.locator('.trpg-check').click()
  ok('③：勾一本冒险：底部「已选 1 项」', /已选 1 项/.test(await page.getByTestId('wizard-picked').innerText()), await page.getByTestId('wizard-picked').innerText())
  await page.waitForTimeout(800)
  await page.screenshot({ path: join(profile, 'step3-data.png') })
  await page.getByTestId('wizard-next').click()
  const summary = await page.getByTestId('wizard-summary').innerText()
  ok('④：摘要写体系 · 版本、资料这次不下载新的书、冒险选中 1 本', /D&D 5e · 版本 5e/.test(summary) && /这次不下载新的书/.test(summary) && /冒险：选中 1 本/.test(summary), summary.replace(/\n/g, ' | '))
  await page.screenshot({ path: join(profile, 'step4-name.png') })
  await page.getByTestId('wizard-name').fill('向导改版测试')
  await page.getByTestId('wizard-next').click()
  await page.waitForFunction(() => !!window.__downloads, null, { timeout: 30000 })
  const input = await page.evaluate(() => window.__startInput)
  const downloads = await page.evaluate(() => window.__downloads)
  result.info.start = { advName, picks: input.picks, adventures: input.adventures, downloads }
  ok('开局：后端收到规则 dnd5e2014、勾了空的书、一本冒险，没有加入 / 排除', input.ruleId === 'dnd5e2014' && input.picks.length === 0 && input.adventures.length === 1 && !input.library, result.info.start)
  ok('开局：没勾书就不下载官方资料，只开了这本冒险', downloads.length === 1 && downloads[0].kind === 'adventure', downloads)
  await page.getByTestId('banner-title').waitFor()
  ok('开局：弹窗关闭回首页，战役名正确', (await page.getByTestId('banner-title').innerText()) === '向导改版测试')
  // 5.5e 直接调后端也建不成
  const refused = await page.evaluate(async (P) => { const be = eval(P)._s.get('app').svc().backend; const c = eval(P)._s.get('campaign'); try { await be.starter.startCampaign({ ...c.owner, ruleId: 'dnd5e2024', name: 'x', codeSet: 'cn', picks: [] }); return 'built' } catch (e) { return e.code } }, P)
  ok('5.5e：后端拒绝建战役（E_RULE_UNSUPPORTED）', refused === 'E_RULE_UNSUPPORTED', refused)
  const real = result.pageErrors.filter((e) => !/gendata-nav-adventure-book-index|网络错误|Network error|无法加载 \d+ 个条目的引用/.test(e))
  ok('没有界面自己的页面错误', real.length === 0, real)
} catch (e) {
  result.error = String(e?.stack ?? e)
  console.log('ERROR', result.error)
} finally {
  await writeFile(join(profile, 'result.json'), JSON.stringify(result, null, 1))
  console.log(profile)
  const fails = Object.values(result.checks).filter((v) => !v).length + (result.error ? 1 : 0)
  console.log(fails ? `FAIL ${fails}` : 'ALL PASS')
  await ctx.close(); server.close()
  process.exit(fails ? 1 : 0)
}
