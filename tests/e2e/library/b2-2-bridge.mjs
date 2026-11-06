// B2-2 验证（含 B2-1）：插件在模拟宿主页里正常启动；中英两套作者程序在隐藏小窗里启动；
// 作者要的数据文件经插件取到（联网时从锁定版本的云端取、核对指纹、存进库数据库）；
// 作者的异步存储写进库数据库；酒馆自己的浏览器存储没被写；宿主内置对象没被改。
// 然后关掉浏览器、断网重开：同样的文件从本地给，存储的值还在，没有任何联网请求。Chrome 与 WebKit 各跑一遍。
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
// 作者自己的读取入口，验证取数出口：一个零散文件、一整类（法术，作者加载器整类取）
const PROBE = async () => {
  const redirects = await DataUtil.loadJSON('data/generated/gendata-tag-redirects.json')
  const spells = await DataLoader.pCacheAndGetAllSite('spell')
  return { redirectsKeys: Object.keys(redirects).length, spells: spells.length }
}
const KV_KEY = 'trpg-b2-2-test'

async function session(engine, type, options, profile, { online }) {
  const ctx = await type.launchPersistentContext(profile, options)
  const s = { online, pageErrors: [], external: [] }
  try {
    const page = await ctx.newPage()
    page.setDefaultTimeout(300000)
    page.on('pageerror', (e) => s.pageErrors.push(e.stack.split('\n').slice(0, 2).join(' | ')))
    page.on('request', (r) => { if (!r.url().startsWith(url)) s.external.push(r.url()) })
    if (!online) await page.route((u) => !u.href.startsWith(url), (route) => route.abort())
    await page.goto(url)
    await page.waitForFunction(() => {
      const host = document.querySelector('#trpg-assistant-root')
      const app = [...(host?.shadowRoot?.children ?? [])].map((c) => c.__vue_app__).find(Boolean)
      return app?.config.globalProperties.$pinia._s.get('app')?.booted
    })
    s.pluginBooted = true
    const hostStorage = () => page.evaluate(async () => ({ local: Object.keys(localStorage).sort(), dbs: (await indexedDB.databases?.())?.map((d) => d.name).sort() ?? null }))
    const before = await hostStorage()
    s.frames = await page.evaluate(async ({ online }) => {
      window.__protos = JSON.stringify([Object, Array, String, Number, Boolean, Function, Promise].map((c) => Object.getOwnPropertyNames(c.prototype).sort()))
      const { startFrames } = await import('/work/e2e-lib/harness.js')
      return startFrames(['cn', 'en'], { allowNetwork: online })
    }, { online })
    s.probe = {}
    for (const codeSet of ['cn', 'en']) {
      const frame = page.frames().find((f) => f.url().includes(`/vendor/${codeSet}/frame.html`))
      const t = Date.now()
      s.probe[codeSet] = await frame.evaluate(PROBE)
      s.probe[codeSet].ms = Date.now() - t
      if (online) await frame.evaluate(({ key, codeSet }) => StorageUtil.pSet(key, { codeSet, n: 1 }), { key: KV_KEY, codeSet })
      s.probe[codeSet].kv = await frame.evaluate((key) => StorageUtil.pGet(key), KV_KEY)
    }
    await page.waitForTimeout(1000)
    const after = await hostStorage()
    s.hostStorage = { before, after }
    Object.assign(s, await page.evaluate(async () => {
      const h = await import('/work/e2e-lib/harness.js')
      const protos = JSON.stringify([Object, Array, String, Number, Boolean, Function, Promise].map((c) => Object.getOwnPropertyNames(c.prototype).sort()))
      return { failures: h.failures(), mirror: await h.mirrorCheck(), kv: await h.kvDump(), hostPrototypesUnchanged: protos === window.__protos }
    }))
  } catch (error) {
    s.fatal = error.stack
  } finally {
    await ctx.close()
  }
  const hostTouched = JSON.stringify(s.hostStorage?.before.local) !== JSON.stringify(s.hostStorage?.after.local)
    || (s.hostStorage?.after.dbs ?? []).some((n) => !(s.hostStorage?.before.dbs ?? []).includes(n) && n !== 'tavern-trpg-library')
  s.hostStorageTouched = hostTouched
  s.passed = !s.fatal && s.pluginBooted && s.hostPrototypesUnchanged && !hostTouched && !s.pageErrors.length
    && s.frames.every((f) => !f.errors.length && Object.values(f.present).every(Boolean))
    && s.failures.every((f) => !f.failures.length)
    && Object.values(s.mirror).every((m) => !m.mismatched.length && !m.notInList.length)
    && ['cn', 'en'].every((c) => s.probe[c].spells > 0 && s.probe[c].kv?.codeSet === c)
    && (online || !s.external.length)
  return s
}

const reports = []
for (const [name, type, options] of engines) {
  if (process.env.ENGINE && process.env.ENGINE !== name) continue
  const profile = `${work}/profile-b2-2-${name}`
  await rm(profile, { recursive: true, force: true })
  const online = await session(name, type, options, profile, { online: true })
  const offline = await session(name, type, options, profile, { online: false })
  reports.push({ engine: name, online, offline, passed: online.passed && offline.passed })
  for (const s of [online, offline]) {
    console.log(JSON.stringify({ engine: name, online: s.online, passed: s.passed, fatal: s.fatal?.split('\n').slice(0, 3), pageErrors: s.pageErrors, failures: s.failures?.flatMap((f) => f.failures), probe: s.probe, mirror: s.mirror, external: s.external.length, hostStorageTouched: s.hostStorageTouched, hostStorage: s.hostStorage }))
  }
}
server.close()
await writeFile(`${work}/b2-2.json`, JSON.stringify(reports, null, 2))
if (!reports.length || reports.some((r) => !r.passed)) process.exitCode = 1
