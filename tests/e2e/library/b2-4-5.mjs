// B2-4 / B2-5 验证：查询、详情（背景描述、英文对象）、搜索（作者搜索器）、按书开关对查询和搜索的影响、
// 英文配对覆盖率；断网重开后同样能用。Chrome 与 WebKit 各跑一遍（ENGINE=chrome 只跑一种）。
// 注意：本地测试服务器每次换端口，浏览器当成新网站，所以每次都会重新下载（约 1 分钟）。
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { build } from 'vite'
import { chromium, webkit } from 'playwright-core'
import { root, startStatic } from './static.mjs'

const work = `${root}work/e2e-lib`
await mkdir(work, { recursive: true })
await build({ configFile: `${root}vite.config.ts`, root, logLevel: 'error' })
await build({ configFile: false, root, logLevel: 'error', build: {
  lib: { entry: `${root}tests/e2e/library/harness.ts`, formats: ['es'], fileName: () => 'harness.js' },
  outDir: work, emptyOutDir: false,
} })
const { server, url } = await startStatic()
const engines = [
  ['chrome', chromium, { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true }],
  ['webkit', webkit, { headless: true }],
]
// 测试用的例子（不是数量）：一本书、一个关键词
const BOOK = 'XPHB'
const TERM_CN = '火球'
const TERM_EN = 'fireball'

let lastProgress = { at: Date.now(), text: '(开始)' }
async function open(type, options, profile, online) {
  const ctx = await type.launchPersistentContext(profile, options)
  const page = await ctx.newPage()
  page.setDefaultTimeout(1800000)
  const errors = []
  const external = []
  const t0 = Date.now()
  page.on('pageerror', (e) => errors.push(e.stack.split('\n').slice(0, 2).join(' | ')))
  page.on('console', (m) => {
    const text = m.text()
    if (!text.startsWith('[progress]')) return
    lastProgress = { at: Date.now(), text }
    if (!/ download /.test(text) || /\s(\d+)\//.exec(text)?.[1] % 100 === 0) console.log(`${((Date.now() - t0) / 1000).toFixed(0).padStart(5)}s ${text}`)
  })
  page.on('request', (r) => { if (!r.url().startsWith(url)) external.push(r.url()) })
  if (!online) await page.route((u) => !u.href.startsWith(url), (route) => route.abort())
  await page.goto(url)
  await page.waitForFunction(() => {
    const host = document.querySelector('#trpg-assistant-root')
    const app = [...(host?.shadowRoot?.children ?? [])].map((c) => c.__vue_app__).find(Boolean)
    return app?.config.globalProperties.$pinia._s.get('app')?.booted
  })
  return { ctx, page, errors, external }
}

async function watched(promise) {
  let timer
  const watchdog = new Promise((_, reject) => {
    timer = setInterval(() => {
      if (Date.now() - lastProgress.at > 180000) reject(new Error(`3 分钟没有新进度，最后停在：${lastProgress.text}`))
    }, 5000)
  })
  try { return await Promise.race([promise, watchdog]) } finally { clearInterval(timer) }
}

/** 在页面里跑：全部经库服务，只把小结果带回来。 */
async function checks(page, cfg, full) {
  return page.evaluate(async ({ BOOK, TERM_CN, TERM_EN, full }) => {
    const h = await import('/work/e2e-lib/harness.js')
    const s = h.service
    const step = (text) => console.log(`[progress] check ${text} 0/0`)
    const out = { ms: {} }
    const timed = async (name, fn) => { step(name); const t = performance.now(); const v = await fn(); out.ms[name] = Math.round(performance.now() - t); return v }

    const cats = await timed('categories', () => s.categories('cn-official'))
    out.categories = Object.keys(cats).length
    const all = await timed('query spell', () => s.query('cn-official', 'spell'))
    const inBook = await timed('query spell by book', () => s.query('cn-official', 'spell', { source: BOOK }))
    out.query = { all: all.length, inBook: inBook.length, allFromBook: inBook.every((r) => r.source === BOOK), consistent: inBook.length === all.filter((r) => r.source === BOOK).length, anyExcluded: all.some((r) => r.excluded) }

    const hits = await timed('search cn (first: builds index)', () => s.search('cn-official', TERM_CN))
    const fb = hits.find((x) => x.prop === 'spell' && x.doc.s === BOOK)
    out.searchCn = { count: hits.length, top: hits.slice(0, 8).map((x) => `${x.prop} ${x.doc.u} ${x.doc.cn ?? ''}/${x.doc.n} ${x.score?.toFixed?.(2)}`), found: !!fb }
    if (!fb) return out
    const d = await timed('detail spell', () => s.detail('cn-official', 'spell', fb.doc.u, fb.doc.s))
    out.detail = { hash: d?.hash, name: d?.item?.name, indexCn: fb.doc.cn, engHash: d?.english?.hash, via: d?.english?.via, english: d?.english?.status, engName: d?.english?.item?.name, indexEn: fb.doc.n, excluded: d?.excluded }
    out.searchEnInCn = (await timed('search en term in cn', () => s.search('cn-official', TERM_EN))).some((x) => x.doc.u === fb.doc.u)
    const hitsEn = await timed('search en', () => s.search('en-official', TERM_EN))
    out.searchEn = { count: hitsEn.length, hasEngHash: hitsEn.some((x) => x.doc.u === d?.english?.hash) }
    if (!full) return out

    // 背景描述：作者字段 hasFluff 为真的第一条（作者文档 §10：同名同来源自动关联）
    const withFluff = all.find((r) => r.item.hasFluff)
    const df = await timed('detail with fluff', () => s.detail('cn-official', 'spell', withFluff.hash, withFluff.source))
    out.fluff = { hash: withFluff.hash, has: !!df?.fluff, error: df?.fluffError, englishFluff: !!(df?.english?.fluff) }
    // 换几种加载器各取一条详情：怪物、物品（含变体展开）、职业、种族
    out.otherDetails = {}
    for (const prop of ['monster', 'item', 'class', 'race', 'subclass', 'classFeature']) {
      const rows = await timed(`query ${prop}`, () => s.query('cn-official', prop))
      const r = rows.find((x) => x.hash)
      const dd = r && await timed(`detail ${prop}`, () => s.detail('cn-official', prop, r.hash, r.source))
      out.otherDetails[prop] = { rows: rows.length, hash: r?.hash, got: !!dd?.item, english: dd?.english?.status ?? null, fluffError: dd?.fluffError ?? null }
    }

    // 作者搜索设置：默认不显示旧版（2014）
    out.settingsDefault = await s.searchSettings('cn-official')
    const legacyHidden = !(await s.search('cn-official', `${TERM_CN}术`)).some((x) => x.doc.s === 'PHB')
    await s.searchSettings('cn-official', { isShowLegacy: true })
    const legacyShown = (await s.search('cn-official', `${TERM_CN}术`)).some((x) => x.doc.s === 'PHB')
    await s.searchSettings('cn-official', { isShowLegacy: false })
    out.legacy = { hiddenByDefault: legacyHidden, shownWhenOn: legacyShown }

    // 按书开关
    await timed('book off', () => s.setBookExcluded('cn-official', BOOK, true))
    out.off = {
      spellInBook: (await timed('query spell (book off)', () => s.query('cn-official', 'spell', { source: BOOK }))).length,
      spellInBookFlagged: (await s.query('cn-official', 'spell', { source: BOOK, includeExcluded: true })).filter((r) => r.excluded).length,
      spellOther: (await s.query('cn-official', 'spell')).length,
      itemInBook: (await timed('query item (book off)', () => s.query('cn-official', 'item', { source: BOOK }))).length,
      searchInBook: (await s.search('cn-official', TERM_CN)).filter((x) => x.doc.s === BOOK).length,
      enUnaffected: (await s.query('en-official', 'spell', { source: BOOK })).length,
    }
    await s.setBookExcluded('cn-official', BOOK, false)
    out.on = { spellInBook: (await s.query('cn-official', 'spell', { source: BOOK })).length, searchInBook: (await s.search('cn-official', TERM_CN)).filter((x) => x.doc.s === BOOK).length }

    const pairs = await timed('english pairs (author getEnglishEntity)', () => s.englishPairs('cn-official'))
    const cov = await timed('english coverage', () => s.englishCoverage('cn-official'))
    const sum = { total: 0, paired: 0 }
    for (const p of Object.values(cov.props)) for (const [k, v] of Object.entries(p)) sum[k] = (sum[k] ?? 0) + v
    const byProp = {}
    for (const u of cov.unpaired) if ((byProp[u.prop] ??= []).length < 3) byProp[u.prop].push(u)
    const mismatchVia = {}
    for (const m of cov.nameMismatch) mismatchVia[m.via] = (mismatchVia[m.via] ?? 0) + 1
    out.coverage = { ...sum, via: cov.via, located: pairs.located, unmatchedInIndex: pairs.unmatched.length, mismatchVia, mismatchSamples: cov.nameMismatch.slice(0, 12), props: cov.props, unpairedSamples: byProp }
    return out
  }, { ...cfg, full })
}

const results = []
for (const [name, type, options] of engines) {
  if (process.env.ENGINE && process.env.ENGINE !== name) continue
  const profile = `${work}/profile-b2-4-${name}`
  await rm(profile, { recursive: true, force: true })
  const r = { engine: name }
  const cfg = { BOOK, TERM_CN, TERM_EN }
  let s = await open(type, options, profile, true)
  try {
    lastProgress = { at: Date.now(), text: '(安装开始)' }
    r.install = await watched(s.page.evaluate(async () => {
      const h = await import('/work/e2e-lib/harness.js')
      const brief = (x) => ({ ms: x.ms, fetched: x.download.fetched, reused: x.download.reused, failed: x.download.failed.length, mismatched: x.mirror.mismatched.length, missing: x.mirror.missing.length, props: Object.keys(x.parse.props).length, errors: x.parse.errors })
      const cn = brief(await h.install('cn-official'))
      const en = brief(await h.install('en-official'))
      h.service.reset()
      return { cn, en }
    }))
    r.online = await watched(checks(s.page, cfg, true))
  } catch (e) { r.fatal1 = e.stack } finally { r.errors1 = s.errors; await s.ctx.close() }
  s = await open(type, options, profile, false)
  try {
    lastProgress = { at: Date.now(), text: '(断网复查)' }
    r.offline = await watched(checks(s.page, cfg, false))
    r.offlineExternal = s.external.length
  } catch (e) { r.fatal2 = e.stack } finally { r.errors2 = s.errors; await s.ctx.close() }

  const o = r.online
  const f = r.offline
  r.verdict = {
    install: !!r.install && ['cn', 'en'].every((k) => !r.install[k].failed && !r.install[k].mismatched && !r.install[k].missing && !r.install[k].errors.length),
    query: !!o && o.query.all > 0 && o.query.inBook > 0 && o.query.allFromBook && o.query.consistent && !o.query.anyExcluded,
    search: !!o && o.searchCn.found && o.searchEnInCn && o.searchEn.hasEngHash,
    detail: !!o?.detail && o.detail.hash && o.detail.english === 'found' && o.detail.engName === o.detail.indexEn,
    fluff: !!o?.fluff?.has,
    otherDetails: !!o && Object.values(o.otherDetails).every((x) => x.got),
    bookToggle: !!o && o.off.spellInBook === 0 && o.off.spellInBookFlagged === o.query.inBook && o.off.itemInBook === 0 && o.off.searchInBook === 0 && o.off.enUnaffected > 0 && o.on.spellInBook === o.query.inBook && o.on.searchInBook > 0,
    legacySetting: !!o && o.legacy.hiddenByDefault && o.legacy.shownWhenOn,
    offline: !!f && f.query.inBook === o?.query.inBook && f.searchCn.found && f.detail?.english === 'found' && r.offlineExternal === 0,
    noPageErrors: !r.errors1?.length && !r.errors2?.length,
  }
  r.passed = !r.fatal1 && !r.fatal2 && Object.values(r.verdict).every(Boolean)
  results.push(r)
  await writeFile(`${work}/b2-4-5-${name}.json`, JSON.stringify(r, null, 2))
  console.log(JSON.stringify({ engine: name, passed: r.passed, verdict: r.verdict, fatal: [r.fatal1, r.fatal2].filter(Boolean).map((x) => x.split('\n').slice(0, 4)), install: r.install, online: o && { ...o, coverage: o.coverage && { ...o.coverage, props: undefined, unpairedSamples: undefined } }, offline: f && { query: f.query, found: f.searchCn.found, english: f.detail?.english, ms: f.ms }, offlineExternal: r.offlineExternal, errors: [...(r.errors1 ?? []), ...(r.errors2 ?? [])] }, null, 1))
}
server.close()
if (!results.length || results.some((r) => !r.passed)) process.exitCode = 1
