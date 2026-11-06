// B2-7 验证：自制书目、按网址装（含依赖）、导入本地文件（含坏文件）、更新、删除、中英各一个；
// 装好的自制能被查询、详情、搜索找到；断网重开后已装列表、解析结果、作者同步存储（搜索设置）都还在。
// Chrome 与 WebKit 各跑一遍（ENGINE=chrome 只跑一种）。测试服务器每次换端口，所以每次都重新下载官方数据。
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
// 测试样本（中文自制仓库里的真实文件；不是数量）
const CFG = {
  SMALL: 'spell/Sample - Giddy; 《乏味巫师指南》.json',
  WITH_DEP: 'class/DXHHH101, Sinder, Superxavman; 重振术士.json',
  DEP: 'subclass/Rain-Junkie, DXHHH101; 果园起源术士（重绽）.json',
  IMPORT: 'reward/Sample - Giddy; 活力恩惠.json',
  EN_PREFIX: 'spell/Sample - Giddy;',
}

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
    if (!/ download /.test(text) || /\s(\d+)\//.exec(text)?.[1] % 200 === 0) console.log(`${((Date.now() - t0) / 1000).toFixed(0).padStart(5)}s ${text}`)
  })
  page.on('request', (r) => { if (!r.url().startsWith(url)) external.push(r.url()) })
  page.on('requestfailed', (r) => { if (!online) external.push(`failed ${r.url()}`) })
  if (!online) await page.route((u) => !u.href.startsWith(url), (route) => route.abort())
  await page.goto(url)
  await page.waitForFunction(() => {
    const host = document.querySelector('#trpg-assistant-root')
    const app = [...(host?.shadowRoot?.children ?? [])].map((c) => c.__vue_app__).find(Boolean)
    return app?.config.globalProperties.$pinia._s.get('app')?.booted
  })
  return { ctx, page, errors, external, hostStorage: async () => page.evaluate(() => Object.keys(localStorage)) }
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

const results = []
for (const [name, type, options] of engines) {
  if (process.env.ENGINE && process.env.ENGINE !== name) continue
  const profile = `${work}/profile-b2-7-${name}`
  await rm(profile, { recursive: true, force: true })
  const r = { engine: name }
  let s = await open(type, options, profile, true)
  const hostBefore = await s.hostStorage()
  try {
    lastProgress = { at: Date.now(), text: '(安装官方)' }
    r.official = await watched(s.page.evaluate(async () => {
      const h = await import('/work/e2e-lib/harness.js')
      const brief = (x) => ({ ms: x.ms, failed: x.download.failed.length, errors: x.parse.errors.length })
      const out = { cn: brief(await h.install('cn-official')), en: brief(await h.install('en-official')) }
      h.service.reset()
      return out
    }))
    r.online = await watched(s.page.evaluate(async (CFG) => {
      const h = await import('/work/e2e-lib/harness.js')
      const s = h.service
      const step = (t) => console.log(`[progress] brew ${t} 0/0`)
      const short = (e) => ({ filename: e.head.filename, url: e.head.url, isLocal: e.head.isLocal, sources: (e.meta?.sources ?? []).map((x) => x.json) })
      const out = {}
      try {
      step('catalog cn')
      const cat = await s.brewCatalog('cn-brew')
      const byPath = (p) => cat.value?.find((x) => x.path === p)
      out.catalogCn = { count: cat.value?.length ?? null, errors: cat.errors, sample: cat.value?.[0] && Object.keys(cat.value[0]) }
      step('install small')
      const a = await s.brewAddUrl('cn-brew', byPath(CFG.SMALL).urlDownload)
      out.installSmall = { added: a.value.map(short), errors: a.errors, props: a.parse.parse.props, parseErrors: a.parse.parse.errors }
      step('install with dependency')
      const b = await s.brewAddUrl('cn-brew', byPath(CFG.WITH_DEP).urlDownload)
      out.installWithDep = { added: b.value.map(short), errors: b.errors, depInstalled: b.value.some((e) => decodeURIComponent(e.head.url ?? '').endsWith(CFG.DEP)), props: b.parse.parse.props, parseErrors: b.parse.parse.errors, authorErrors: b.parse.parse.authorErrors }
      step('query/detail/search')
      const spells = await s.query('cn-brew', 'spell')
      const sm = spells.find((x) => x.source === out.installSmall.added[0].sources[0])
      const d = sm && await s.detail('cn-brew', 'spell', sm.hash, sm.source)
      const hits = sm ? await s.search('cn-brew', sm.item.name) : []
      out.use = { spellRows: spells.length, sampleHash: sm?.hash, detail: !!d?.item, english: d?.english ?? null, searchFound: hits.some((x) => x.doc.u === sm?.hash) }
      const subclasses = await s.query('cn-brew', 'subclass')
      out.use.subclassRows = subclasses.length
      step('import files')
      const importText = await (await fetch(byPath(CFG.IMPORT).urlDownload)).text()
      const imp = await s.brewImport('cn-brew', [
        { name: 'good.json', text: importText },
        { name: 'broken.json', text: '{ 这不是 JSON' },
        { name: 'no-sources.json', text: '{"spell":[{"name":"x","source":"NOPE"}]}' },
      ])
      out.import = { added: imp.value.added.map(short), notJson: imp.value.notJson, errors: imp.errors }
      step('installed list')
      out.installed = (await s.brewInstalled('cn-brew')).map(short)
      step('pull')
      const pull = await s.brewPull('cn-brew')
      out.pull = { updated: pull.value.map(short), errors: pull.errors, reparsed: !!pull.parse }
      step('delete small')
      const smallEntry = (await s.brewInstalled('cn-brew')).find((e) => decodeURIComponent(e.head.url ?? '').endsWith(CFG.SMALL))
      const del = await s.brewDelete('cn-brew', [smallEntry.head.docIdLocal])
      out.delete = { deleted: del.value, errors: del.errors, smallStillQueried: (await s.query('cn-brew', 'spell')).some((x) => x.source === out.installSmall.added[0].sources[0]), installedAfter: (await s.brewInstalled('cn-brew')).length }
      step('english brew')
      const catEn = await s.brewCatalog('en-brew')
      const enPick = catEn.value?.find((x) => x.path.startsWith(CFG.EN_PREFIX))
      const en = enPick ? await s.brewAddUrl('en-brew', enPick.urlDownload) : null
      out.english = { catalog: catEn.value?.length ?? null, catalogErrors: catEn.errors, picked: enPick?.path, added: en?.value.map(short), errors: en?.errors, props: en?.parse.parse.props }
      step('search setting on')
      out.settingOn = (await s.searchSettings('cn-official', { isShowLegacy: true })).isShowLegacy
      } catch (e) { out.error = String(e.stack ?? e) }
      return out
    }, CFG))
  } catch (e) { r.fatal1 = e.stack } finally { r.errors1 = s.errors; r.hostStorageBefore = hostBefore; r.hostStorageAfter = await s.hostStorage().catch(() => null); await s.ctx.close() }

  s = await open(type, options, profile, false)
  try {
    lastProgress = { at: Date.now(), text: '(断网复查)' }
    r.offline = await watched(s.page.evaluate(async (installSource) => {
      const h = await import('/work/e2e-lib/harness.js')
      const s = h.service
      const installed = await s.brewInstalled('cn-brew')
      const subclasses = await s.query('cn-brew', 'subclass')
      const d = subclasses[0] && await s.detail('cn-brew', 'subclass', subclasses[0].hash, subclasses[0].source)
      const hits = subclasses[0] ? await s.search('cn-brew', subclasses[0].item.name) : []
      return {
        installed: installed.length,
        enInstalled: (await s.brewInstalled('en-brew')).length,
        subclassRows: subclasses.length,
        detail: !!d?.item,
        searchFound: hits.some((x) => x.doc.u === subclasses[0]?.hash),
        settingStillOn: (await s.searchSettings('cn-official')).isShowLegacy,
        installSource,
      }
    }, null))
    r.offlineExternal = s.external.length
    r.offlineExternalUrls = s.external.slice(0, 20)
  } catch (e) { r.fatal2 = e.stack } finally { r.errors2 = s.errors; await s.ctx.close() }

  const o = r.online
  const f = r.offline
  // 作者加载器取自制条目前，会先查"这个来源是不是没装的试玩稿（UA）"，要读一次试玩稿仓库的来源目录
  // （utils-dataloader-dataloader.js _PrereleaseBrewPreloader）。断网时这一个请求失败、作者抛一条网络错误，条目照常取到。
  // 只允许这一个，别的对外请求都算失败。
  const isUaIndexLookup = (u) => /ua\.kiwee\.top\/_generated\/index-sources\.json$/.test(u)
  r.offlineUnexpected = (r.offlineExternalUrls ?? []).filter((u) => !isUaIndexLookup(u.replace(/^failed /, '')))
  const knownOfflineErrors = (r.offlineExternalUrls ?? []).length > 0 && !r.offlineUnexpected.length ? ['请求 JSON 时发生网络错误'] : []
  r.verdict = {}
  try {
  r.verdict = {
    official: !!r.official && !r.official.cn.failed && !r.official.cn.errors && !r.official.en.failed && !r.official.en.errors,
    catalog: !!o && o?.catalogCn?.count > 0 && o?.english?.catalog > 0,
    installSmall: !!o && o?.installSmall?.added.length === 1 && !o?.installSmall?.errors.length,
    dependency: !!o && o?.installWithDep?.depInstalled && !o?.installWithDep?.errors.length && !o?.installWithDep?.parseErrors.length,
    use: !!o && o?.use?.spellRows > 0 && o?.use?.detail && o?.use?.searchFound && o?.use?.subclassRows > 0,
    importBroken: !!o && o?.import?.notJson.length === 1 && o?.import?.notJson[0].name === 'broken.json',
    importGood: !!o && o?.import?.added.some((e) => e.filename === 'good.json'),
    delete: !!o && o?.delete?.deleted === 1 && !o?.delete?.smallStillQueried,
    english: !!o && (o?.english?.added?.length ?? 0) > 0 && !o?.english?.errors?.length,
    offline: !!f && f?.installed === o?.delete.installedAfter && f?.enInstalled > 0 && f?.subclassRows === o?.use.subclassRows && f?.detail && f?.searchFound && r.offlineUnexpected.length === 0,
    syncStorageKept: !!f && o?.settingOn === true && f?.settingStillOn === true,
    hostUntouched: JSON.stringify(r.hostStorageBefore) === JSON.stringify(r.hostStorageAfter),
    // 页面上的错误都应是作者自己报、且已收进解析报告（authorErrors）的；别的都算失败
    noUnreportedErrors: (r.errors1 ?? []).every((e) => (o?.installWithDep?.authorErrors ?? []).some((a) => a.includes(e.split(' | ')[0].replace(/^Error: /, ''))))
      && (r.errors2 ?? []).every((e) => knownOfflineErrors.some((k) => e.includes(k)) || (o?.installWithDep?.authorErrors ?? []).some((a) => a.includes(e.split(' | ')[0].replace(/^Error: /, '')))),
  }
  } catch (e) { r.verdictError = String(e) }
  r.passed = !r.fatal1 && !r.fatal2 && !o?.error && Object.values(r.verdict).every(Boolean)
  results.push(r)
  await writeFile(`${work}/b2-7-${name}.json`, JSON.stringify(r, null, 2))
  console.log(JSON.stringify({ engine: name, passed: r.passed, verdict: r.verdict, fatal: [r.fatal1, r.fatal2].filter(Boolean).map((x) => x.split('\n').slice(0, 4)), online: o, offline: f, offlineExternal: r.offlineExternal, errors: [...(r.errors1 ?? []), ...(r.errors2 ?? [])] }, null, 1))
}
server.close()
if (!results.length || results.some((r) => !r.passed)) process.exitCode = 1
