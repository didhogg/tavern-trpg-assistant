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
  // ---- B-06 表格掷骰后端 ----
  const frame = await lib.service.frameOf('cn')
  const tables = (await lib.service.query('cn-official', 'table', {})).map((x) => x.item)
  const group = (await lib.service.query('cn-official', 'tableGroup', {})).flatMap((x) => x.item.tables ?? [])
  const stat = { rollable: 0, notRollable: 0, complete: 0, needsInput: 0, choose: 0, error: [], missing: 0, noRow: 0, nameGen: 0, nameGenCols: [], inlineRolled: 0, variable: [] }
  const doOne = async (t) => {
    const res = await frame.call('tableRoll', t, { points: Array(40).fill(1) })
    if (res.status === 'not-rollable') { stat.notRollable++; return }
    stat.rollable++
    if (res.status === 'needs-input') { stat.needsInput++; stat.variable.push(t.name); return }
    if (res.status === 'choose') { stat.choose++; stat.variable.push(t.name); return }
    if (res.status === 'complete') {
      stat.complete++
      if (res.rolls.some((x) => x.rowIndex === null)) stat.noRow++
      if (res.nameGenerator) { stat.nameGen++; stat.nameGenCols.push(res.rolls.length) }
      if (res.inline.length) stat.inlineRolled++
      return
    }
    if (res.status === 'missing') { stat.missing++; return }
    stat.error.push(`${t.name}: ${JSON.stringify(res).slice(0, 120)}`)
  }
  for (const t of [...tables, ...group]) await doOne(t)
  r.b06_stat = { ...stat, error: stat.error.slice(0, 5), nErrors: stat.error.length, nameGenCols: [...new Set(stat.nameGenCols)] }
  const find = (name, source) => tables.find((x) => x.name === name && x.source === source)
  const kid = find('补充表格; 童年居所', 'XGE')
  r.b06_kid = {
    ask: await frame.call('tableRoll', kid, {}),
    low: await frame.call('tableRoll', kid, { promptValues: [0], points: [1] }),
    high: await frame.call('tableRoll', kid, { promptValues: [1000], points: [50] }),
    bad: await frame.call('tableRoll', kid, { promptValues: [], points: [1] }),
    row: await frame.call('tableRow', kid, 5000),
  }
  const siege = find('围攻之中; 丧尸围攻遭遇', 'VRGR')
  r.b06_siege = { choose: (await frame.call('tableRoll', siege, {})).status, pick: await frame.call('tableRoll', siege, { formulaIndex: 1 }).then((x) => ({ status: x.status, max: x.prompts?.[0]?.max })), done: await frame.call('tableRoll', siege, { formulaIndex: 0, promptValues: [2], points: [6] }).then((x) => ({ status: x.status, total: x.rolls?.[0]?.total, row: x.rolls?.[0]?.rowIndex })) }
  // ---- B-03 图片 ----
  const monsterCn = (await lib.service.query('cn-official', 'monster', { source: 'MM' }))[0].item
  const monsterEn = (await lib.service.query('en-official', 'monster', { source: 'MM' })).find((x) => x.item.name === 'Aarakocra')?.item
  r.b03 = {
    urls: lib.images.urls('cn-official', { type: 'internal', path: 'bestiary/MM/Aarakocra.webp' }),
    tokenCn: await lib.images.token('cn', 'monster', monsterCn),
    tokenEn: monsterEn ? await lib.images.token('en', 'monster', monsterEn) : 'no en monster',
    tokenNoToken: await lib.images.token('cn', 'spell', { name: 'x' }),
    cnName: monsterCn.name, cnEng: monsterCn.ENG_name,
  }
  // ---- B-10 中英对应 ----
  const cnSpell = (await lib.service.query('cn-official', 'spell', { source: 'PHB' })).find((x) => x.item.ENG_name === 'Fireball')
  const cp = async (set, prop, hash) => { const x = await lib.counterparts.counterpart({ set, prop, hash }); return { status: x.status, n: x.refs.length, reason: x.reason, sharedBy: x.sharedBy, first: x.refs[0]?.hash ?? null } }
  const enFire = await lib.counterparts.counterpart({ set: 'cn-official', prop: 'spell', hash: cnSpell.hash })
  r.b10 = {
    cn2en: await cp('cn-official', 'spell', cnSpell.hash),
    en2cn: await cp('en-official', 'spell', enFire.refs[0].hash),
    ambiguous: await cp('en-official', 'subclass', 'artificer_tce,state:sub_alchemist_tce=b1'),
    shared: await cp('cn-official', 'subclass', '%e5%a5%87%e6%a2%b0%e5%b8%88_efa,state:sub_%e7%82%bc%e9%87%91%e5%b8%88_tce=b1'),
    none: await cp('cn-official', 'spell', 'not_exist'),
  }
  // 全量：中文每一条都问一遍，数各种状态（不写死数字，只看分布）
  const dist = {}
  for (const prop of ['spell', 'monster', 'subclass', 'classFeature', 'item']) {
    const rows = await lib.service.query('cn-official', prop, {})
    for (const x of rows) { const y = await lib.counterparts.counterpart({ set: 'cn-official', prop, hash: x.hash }); const k = `${prop}:${y.status}${y.sharedBy ? '+shared' : ''}`; dist[k] = (dist[k] || 0) + 1 }
  }
  r.b10_dist = dist
  // ---- B-11 / B-14 ----
  r.b11_before = (await lib.brewPacks.list('cn-brew')).length
  const brewText = JSON.stringify({ _meta: { sources: [{ json: 'P5Test', abbreviation: 'P5', full: 'P5 测试包', authors: ['测试者'], convertedBy: ['测试者'], version: '1.0.0', dateReleased: '2024-05-06' }], dateAdded: 1, dateLastModified: 1 }, spell: [{ name: '测试术', source: 'P5Test', level: 1, school: 'V', time: [{ number: 1, unit: 'action' }], range: { type: 'point', distance: { type: 'self' } }, components: { v: true }, duration: [{ type: 'instant' }], entries: ['x'] }] })
  const imp = await lib.service.brewImport('cn-brew', [{ name: 'p5-test.json', text: brewText }])
  lib.scoped.reset()
  const packs = await lib.brewPacks.list('cn-brew')
  const mine = packs.find((p) => p.sources.includes('P5Test'))
  r.b11_pack = mine && { origin: mine.origin, sources: mine.sources, props: mine.props, entryCount: mine.entryCount, author: mine.sourceInfo[0]?.authors, date: mine.sourceInfo[0]?.dateReleased }
  const rows = await lib.scoped.catalog(c)
  const brewRow = rows.find((x) => x.set === 'cn-brew' && x.source === 'P5Test')
  r.b11_row = brewRow && { name: brewRow.name, count: brewRow.count, shelf: brewRow.shelf && { group: brewRow.shelf.group, author: brewRow.shelf.author, published: brewRow.shelf.published } }
  r.b11_importErrors = imp.errors
  const dir1 = await lib.directory.get('cn')
  const dir2 = await lib.directory.refresh('cn')
  r.b14 = { before: dir1.books.length, after: dir2.books.length, errors: dir2.errors, adv: dir2.adventures.length }
  return r
})
await writeFile(`${work}/p5-backend-chrome.json`, JSON.stringify({ result, pageErrors }, null, 1))
console.log(JSON.stringify(result, null, 1).slice(0, 3000)); console.log('pageErrors', pageErrors)
await ctx.close(); server.close()
