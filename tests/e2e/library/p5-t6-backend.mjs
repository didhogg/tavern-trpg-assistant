// P5 T6 前置后端（G3 关联表、G5 按书估算、G6 另一语言书名）真实数据探针。
// 用法：SKIP_BUILD=1 node tests/e2e/library/p5-t6-backend.mjs（Chrome；资料用 p5-t6-pack-audit-WST6kp（停点 B 修后真实库）的副本，不联网）
import { cp, rm, writeFile } from 'node:fs/promises'
import { startStatic } from './static.mjs'
import { buildAll, engines, work } from './chain-common.mjs'
import { check, failures, settle } from '../helpers.mjs'

if (!process.env.SKIP_BUILD) await buildAll()
const [, type, options] = engines.find((e) => e[0] === 'chrome')
const { server, url } = await startStatic({ port: 47342 }) // 与建这个测试库的脚本同一端口，否则浏览器数据库按来源隔离读不到
const profile = `${work}/profile-p5t6be-chrome`
await rm(profile, { recursive: true, force: true })
await cp(`${work}/p5-t6-pack-audit-WST6kp`, profile, { recursive: true, filter: (p) => !p.includes("Singleton") })
const ctx = await type.launchPersistentContext(profile, { ...options, viewport: { width: 1280, height: 800 } })
const page = await ctx.newPage()
page.setDefaultTimeout(180000)
await page.route((u) => !u.href.startsWith(url), (route) => route.abort())
await page.goto(url)
const pinia = `(() => { const h = document.querySelector('#trpg-assistant-root'); return [...h.shadowRoot.children].map((c) => c.__vue_app__).find(Boolean).config.globalProperties.$pinia })()`
await page.waitForFunction(`!!(${pinia})._s.get('app')?.booted`)
await page.locator('.trpg-ball').click()
await settle(page, 600)
await page.locator('.trpg-window nav').getByRole('button', { name: '库' }).click()
await page.waitForSelector('[data-testid="shelf-tab"] .trpg-shelf__row', { timeout: 30000 }).catch(async (e) => { await page.screenshot({ path: `${work}/p5-t6-backend-fail.png` }); throw e })
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
  const fr0 = await sv.frameOf('cn')
  const t0 = performance.now()
  const spells = await be.library.scoped.query(c, 'spell', { source: 'PHB' })
  const fb = spells.find((x) => /火球/.test(x.item.name)) ?? spells[0]
  const rel = await sv.relatedTables(fb.ref.set, 'spell', fb.ref.hash)
  out.fireball = { name: fb.item.name, own: rel.own.length, links: rel.links.map((x) => x.name), referencedBy: rel.referencedBy.length, sample: rel.referencedBy.slice(0, 5).map((x) => `${x.prop}:${x.name}`), ms: Math.round(performance.now() - t0) }
  // 按真实数据自动取样：从作者表里找一张确实链接了条目的表，再反查那个条目，看反向索引能不能把这张表找回来
  const tables = await sv.parsed('cn-official', 'table')
  const refs = await fr0.call('tagRefs', tables.items.slice(0, 400))
  const i = refs.findIndex((t) => t.some((k) => !k.startsWith('table|')))
  if (i >= 0) {
    const [tp, th] = refs[i].find((k) => !k.startsWith('table|')).split('|')
    const back = await sv.relatedTables('cn-official', tp, th)
    out.reverse = { table: tables.items[i].name, target: `${tp}|${th}`, found: back.referencedBy.some((x) => x.hash === tables.hashes[i]), referencedBy: back.referencedBy.length }
  } else out.reverse = null
  const t1 = performance.now()
  await sv.relatedTables(fb.ref.set, 'spell', fb.ref.hash)
  out.secondMs = Math.round(performance.now() - t1)
  const shelf = await be.library.scoped.shelf(c)
  const rows = shelf.groups.flatMap((g) => [...g.books, ...g.adventures])
  out.shelfRows = rows.length
  out.altNamed = rows.filter((x) => x.altName).length
  out.altSample = rows.filter((x) => x.altName).slice(0, 3).map((x) => `${x.name} / ${x.altName}`)
  const est = await be.library.estimate({ sets: ['cn-official'], books: { 'cn-official': ['PHB'] } }, { network: false })
  out.estimate = est ? { bytes: est.data.sets[0].bytes, total: est.data.sets[0].totalBytes, computing: est.computing, errors: est.errors } : 'no entry'
  return out
}, pinia)
console.log(JSON.stringify(r, null, 2))
await writeFile(`${work}/p5-t6-backend.json`, JSON.stringify(r, null, 2))
check('反向关联：作者表链接到的条目，反查能找回这张表', !!r.reverse?.found, JSON.stringify(r.reverse))
check('反向索引第二次读走缓存（<1 秒）', r.secondMs < 1000, `${r.secondMs}ms`)
check('书架行带另一语言名字', r.altNamed > 0, JSON.stringify(r.altSample))
await ctx.close(); server.close()
console.log(failures.length ? `FAIL ${failures.length}` : 'ALL PASS')
process.exit(failures.length ? 1 : 0)
