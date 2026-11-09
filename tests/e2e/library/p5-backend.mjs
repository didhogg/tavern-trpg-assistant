// P5 后端（B-01…B-14）的本机局部验证：用已装好中英官方数据的旧测试资料夹的副本（不联网、不改原资料夹），
// 在真实构建的插件里，通过 app store 拿到 backend，逐项核对。结果写进 work/e2e-lib/p5-backend-chrome.json。
// 资料夹来源：work/e2e-lib/profile-b2-8a-chrome（原来用端口 47318，浏览器存储按端口分，所以这里也用 47318）。
import { cp, rm, writeFile } from 'node:fs/promises'
import { startStatic } from './static.mjs'
import { buildAll, engines, work } from './chain-common.mjs'

if (!process.env.SKIP_BUILD) await buildAll()
const [, type, options] = engines[0]
const { server, url } = await startStatic({ port: 47318 })
const profile = `${work}/profile-p5-chrome`
await rm(profile, { recursive: true, force: true })
await cp(`${work}/profile-b2-8a-chrome`, profile, { recursive: true })
const ctx = await type.launchPersistentContext(profile, { ...options, viewport: { width: 1280, height: 800 } })
const page = await ctx.newPage()
page.setDefaultTimeout(900000)
const pageErrors = []
page.on('pageerror', (e) => pageErrors.push(String(e.message ?? e).slice(0, 200)))
await page.route((u) => !u.href.startsWith(url), (route) => route.abort())
await page.goto(url)
await page.waitForFunction(() => { const h = document.querySelector('#trpg-assistant-root'); const app = [...(h?.shadowRoot?.children ?? [])].map((c) => c.__vue_app__).find(Boolean); return app?.config.globalProperties.$pinia._s.get('app')?.booted })

const result = await page.evaluate(async () => {
  const host = document.querySelector('#trpg-assistant-root')
  const app = [...host.shadowRoot.children].map((c) => c.__vue_app__).find(Boolean)
  const backend = app.config.globalProperties.$pinia._s.get('app').svc().backend
  const lib = backend.library
  const c = { rule: 'dnd5e2014', codeSet: 'cn', scopes: ['5e2014'], include: [], exclude: [], choices: {} }
  const r = {}
  // ---- B-01 / B-02 / B-05 ----
  const books = await lib.scoped.search(c, '玩家手册')
  r.b01_books = books.map((x) => ({ set: x.ref.set, prop: x.ref.prop, kind: x.target.kind, id: x.target.id ?? null }))
  const bookHit = books.find((x) => x.target.kind === 'corpus')
  r.b01_bookCorpus = bookHit ? (await lib.service.corpus(bookHit.ref.set, bookHit.target.prop, bookHit.target.id)).bookData?.data?.length ?? -1 : null
  const quick = await lib.scoped.search(c, 'source:phb 跳跃')
  r.b01_quick = quick.map((x) => ({ set: x.ref.set, prop: x.ref.prop, kind: x.target.kind, id: x.target.id ?? null, chapter: x.target.chapter ?? null, header: x.target.header ?? null }))
  r.b01_noNullProp = (await lib.scoped.search(c, 'source:phb')).every((x) => x.target.kind !== 'entry' || !!x.prop)
  r.b02_ids = await lib.links.documentIds('cn')
  const src = { id: 'cn-official', kind: 'official', lang: 'zh', codeSet: 'cn', mirrors: [] }
  const q = await lib.documents.get(src, 'bookref-quick')
  r.b02_quick = { name: q.head.name, chapters: q.data.length, contents: q.head.contents.length }
  const loc = async (prop, hash) => { const x = await lib.scoped.locate(c, prop, hash); return x && { kind: x.kind, set: x.set, id: x.id, visible: x.visible } }
  r.b05_locate = {
    entry: await loc('spell', '%e7%81%ab%e7%90%83%e6%9c%af_phb'),
    book: await loc('book', 'phb'),
    doc: await loc('document', 'bookref-quick,4,%e8%b7%b3%e8%b7%83'),
    none: await loc('spell', 'no_such_entry'),
  }
  // ---- B-04 ----
  const tag = async (name, text) => { const x = await lib.scoped.resolveTag(c, name, text); return x && { name: x.name, displayText: x.displayText, source: x.source, located: x.located && { kind: x.located.kind, set: x.located.set, prop: x.located.prop }, view: x.view } }
  r.b04 = {
    spell: await tag('@spell', '火球术|PHB'),
    creature: await tag('@creature', '地精|MM'),
    condition: await tag('@condition', '倒地'),
    table: await tag('@table', '魔法物品表A'),
    book: await tag('@book', '玩家手册|PHB|2'),
    adventure: await tag('@adventure', '失落矿坑|LMoP'),
    classFeature: await tag('@classFeature', '施法|法师|PHB|1'),
    subclass: await tag('@subclass', '炼金师|奇械师|TCE|TCE'),
    quickref: await tag('@quickref', '跳跃|PHB|4'),
    dice: await tag('@dice', '1d6'),
    missing: await tag('@spell', '没有这个法术|PHB'),
  }
  return r
})
await writeFile(`${work}/p5-backend-chrome.json`, JSON.stringify({ result, pageErrors }, null, 1))
console.log(JSON.stringify(result, null, 1).slice(0, 3000)); console.log('pageErrors', pageErrors)
await ctx.close(); server.close()
