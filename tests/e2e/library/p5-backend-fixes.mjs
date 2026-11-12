// P5-1 B-37～B-42 真实数据验证（驾驶员真机报的问题）：
//   B-39 物品属性有显示名；B-40 作者渲染文字（{@atk mw}、{@dc 18}、abilityDc 块）、内嵌怪物块指向、传奇组正文；
//   B-41 同一类重复查询不再每次开新小窗；B-37 真的卸载官方资料后书架 / 自制清单 / 体检（日志页）都读得出来。
// 用法：SKIP_BUILD=1 ENGINE=chrome|webkit node tests/e2e/library/p5-backend-fixes.mjs
import { cp, rm } from 'node:fs/promises'
import { startStatic } from './static.mjs'
import { buildAll, engines, work } from './chain-common.mjs'
import { check, failures, settle } from '../helpers.mjs'

if (!process.env.SKIP_BUILD) await buildAll()
const engineName = process.env.ENGINE === 'webkit' ? 'webkit' : 'chrome'
const [, type, options] = engines.find((e) => e[0] === engineName)
const { server, url } = await startStatic({ port: 47318 })
const profile = `${work}/profile-p5bf-${engineName}`
await rm(profile, { recursive: true, force: true })
await cp(`${work}/profile-b2-8a-${engineName}`, profile, { recursive: true })
const ctx = await type.launchPersistentContext(profile, { ...options, viewport: { width: 1280, height: 800 } })
const page = await ctx.newPage()
page.setDefaultTimeout(120000)
const pageErrors = []
page.on('pageerror', (e) => pageErrors.push(String(e.message ?? e).slice(0, 200)))
await page.route((u) => !u.href.startsWith(url), (route) => route.abort())
await page.addInitScript(() => {
  const orig = Document.prototype.createElement
  window.__frames = 0
  Document.prototype.createElement = function (tag, o) { if (String(tag).toLowerCase() === 'iframe') window.__frames++; return orig.call(this, tag, o) }
})
await page.goto(url)
const pinia = `(() => { const h = document.querySelector('#trpg-assistant-root'); return [...h.shadowRoot.children].map((c) => c.__vue_app__).find(Boolean).config.globalProperties.$pinia })()`
await page.waitForFunction(`!!(${pinia})._s.get('app')?.booted`)
await page.locator('.trpg-ball').click()
await settle(page, 600)
await page.locator('.trpg-window nav').getByRole('button', { name: '库' }).click()
await page.waitForSelector('[data-testid="shelf-tab"] .trpg-shelf__row', { timeout: 120000 })
await settle(page, 1000)

const r = await page.evaluate(async (P) => {
  const ps = eval(P)
  const app = ps._s.get('app')
  const lvs = ps._s.get('library')
  const be = app.svc().backend
  const sv = be.library.service
  await lvs.load(app.svc(), null)
  const c = lvs.campaignLib
  const out = {}
  const fr = await sv.frameOf('cn')
  // B-39
  const props = await be.library.scoped.query(c, 'itemProperty', {})
  const names = await Promise.all(props.map((x) => fr.call('displayName', 'itemProperty', x.item)))
  out.itemPropertyNames = { total: names.length, named: names.filter((n) => n && n !== '未知').length, sample: names.slice(0, 3) }
  // B-40
  out.atk = await fr.call('renderText', '{@atk mw}')
  out.dc = await fr.call('renderText', '{@dc 18}')
  out.h = await fr.call('renderText', '{@h}')
  out.abilityDc = await fr.call('renderText', { type: 'abilityDc', name: '法术', attributes: ['cha'] })
  out.statblock = await fr.call('statblockMeta', { type: 'statblock', prop: 'monsterFluff', source: 'MM', name: 'Giants' })
  const lg = await be.library.scoped.query(c, 'legendaryGroup', {})
  out.legendary = { total: lg.length, summary: lg.length ? !!(await fr.call('renderEntity', 'legendaryGroup', lg[0].item)) : null }
  // B-41：同一批类别查两遍，第二遍不应再开新小窗
  const q = () => Promise.all(['spell', 'monster', 'item'].map((p) => be.library.scoped.query(c, p, { source: 'PHB', expand: true })))
  await q()
  const b = window.__frames
  await q()
  out.framesSecondRound = window.__frames - b
  return out
}, pinia)
console.log(JSON.stringify(r))
check('物品属性都有显示名', r.itemPropertyNames.total > 0 && r.itemPropertyNames.named === r.itemPropertyNames.total, JSON.stringify(r.itemPropertyNames))
check('{@atk mw} 由作者渲染器显示成中文（不是原文 mw）', /近战/.test(r.atk), r.atk)
check('{@dc 18} 显示成 DC 18', /DC\s*18/.test(r.dc), r.dc)
check('{@h} 不再是空白', !!r.h, r.h)
check('abilityDc 块显示豁免 DC 文字', /豁免/.test(r.abilityDc), r.abilityDc)
check('内嵌怪物块（背景描述）指向主条目 monster 并给出编号', r.statblock.target === 'monster' && !!r.statblock.hash, JSON.stringify(r.statblock))
check('传奇组有作者拼出的正文', r.legendary.total === 0 || r.legendary.summary === true, JSON.stringify(r.legendary))
check('同一批类别第二遍查询不再开新小窗', r.framesSecondRound === 0, String(r.framesSecondRound))

// B-37：真的卸载官方资料（中英）后
const u = await page.evaluate(async (P) => {
  const ps = eval(P)
  const app = ps._s.get('app')
  const lvs = ps._s.get('library')
  const be = app.svc().backend
  const out = {}
  for (const id of ['cn-official', 'en-official']) await be.library.uninstallOfficial(id)
  await lvs.load(app.svc(), null)
  out.error = lvs.error
  out.books = lvs.shelf?.groups?.reduce((n, g) => n + g.books.length + g.adventures.length, 0) ?? 0
  out.officialMissing = lvs.officialMissing
  try { out.packs = (await be.library.brewPacks.list('cn-brew')).length } catch (e) { out.packsError = String(e?.message ?? e) }
  try { await be.library.service.health(); out.health = 'ok' } catch (e) { out.health = String(e?.message ?? e) }
  return out
}, pinia)
console.log(JSON.stringify(u))
check('卸载后书架读得出来', !u.error, u.error ?? '')
check('卸载后仍列出书目', u.books > 0, String(u.books))
check('卸载后标明官方资料没装', u.officialMissing === true, '')
check('卸载后自制清单仍能从作者原文列出且不报错', !u.packsError && u.packs > 0, u.packsError ?? String(u.packs))
check('卸载后体检（日志页）读得出来', u.health === 'ok', u.health)
await page.locator('.trpg-window nav').getByRole('button', { name: '首页' }).click().catch(() => undefined)
await settle(page, 300)
check('页面没有未处理的错误', pageErrors.length === 0, pageErrors.slice(0, 2).join(' | '))
await ctx.close()
server.close()
console.log(failures.length ? `FAIL ${failures.length}` : 'ALL PASS')
process.exit(failures.length ? 1 : 0)
