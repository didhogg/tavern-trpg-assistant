// B2-3 验证：中英官方数据按作者离线规则下载 → 镜像核对 → 全量解析 → 搜索索引对账 → 按书开关；
// 断网重开后镜像、解析结果、开关状态都还在。Chrome 与 WebKit 各跑一遍（ENGINE=chrome 只跑一种）。
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
const BOOK = 'XPHB'

async function open(type, options, profile, online) {
  const ctx = await type.launchPersistentContext(profile, options)
  const page = await ctx.newPage()
  page.setDefaultTimeout(1800000)
  const errors = []
  const external = []
  page.on('pageerror', (e) => errors.push(e.stack.split('\n').slice(0, 2).join(' | ')))
  // 进度：下载每 50 个文件、解析每一步打一行；3 分钟没有新进度就判失败，并报出最后停在哪
  const t0 = Date.now()
  page.on('console', (m) => {
    const text = m.text()
    if (!text.startsWith('[progress]')) return
    lastProgress = { at: Date.now(), text }
    if (!/ download /.test(text) || /\s(\d+)\//.exec(text)?.[1] % 50 === 0) console.log(`${((Date.now() - t0) / 1000).toFixed(0).padStart(5)}s ${text}`)
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

let lastProgress = { at: Date.now(), text: '(开始)' }
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
  const profile = `${work}/profile-b2-3-${name}`
  await rm(profile, { recursive: true, force: true })
  const r = { engine: name }
  // 第一轮：联网安装
  let s = await open(type, options, profile, true)
  try {
    lastProgress = { at: Date.now(), text: '(安装开始)' }
    r.install = await watched(s.page.evaluate(async () => {
      const h = await import('/work/e2e-lib/harness.js')
      return { cn: await h.install('cn-official'), en: await h.install('en-official') }
    }))
    r.toggle = await s.page.evaluate(async (book) => {
      const h = await import('/work/e2e-lib/harness.js')
      return { cnOff: await h.toggleBook('cn', 'cn-official', book, true), enUnchanged: await h.bookState('en', 'en-official', book) }
    }, BOOK)
  } catch (e) { r.fatal1 = e.stack } finally { r.errors1 = s.errors; await s.ctx.close() }
  // 第二轮：断网重开
  s = await open(type, options, profile, false)
  try {
    r.offline = await s.page.evaluate(async (book) => {
      const h = await import('/work/e2e-lib/harness.js')
      const out = { cn: await h.offlineAudit('cn-official'), en: await h.offlineAudit('en-official'), cnBookStillOff: await h.bookState('cn', 'cn-official', book) }
      out.cnOn = await h.toggleBook('cn', 'cn-official', book, false)
      return out
    }, BOOK)
    r.offlineExternal = s.external.length
  } catch (e) { r.fatal2 = e.stack } finally { r.errors2 = s.errors; await s.ctx.close() }
  const inst = r.install ? Object.values(r.install) : []
  const installOk = inst.length === 2 && inst.every((x) => !x.download.failed.length && !x.mirror.missing.length && !x.mirror.mismatched.length && !x.parse.errors.length && Object.values(x.parse.corpora).every((c) => !c.failed.length))
  const offlineOk = r.offline && ['cn', 'en'].every((k) => r.offline[k].ok === r.offline[k].planFiles && r.offline[k].set?.status === 'installed') && r.offline.cnBookStillOff === true && r.offline.cnOn.inBook === false && r.offlineExternal === 0
  const toggleOk = r.toggle?.cnOff.inBook === true && r.toggle?.cnOff.otherBook === false && r.toggle?.enUnchanged === false
  r.passed = !r.fatal1 && !r.fatal2 && installOk && toggleOk && offlineOk && !r.errors1.length && !r.errors2.length
  results.push(r)
  await writeFile(`${work}/b2-3-${name}.json`, JSON.stringify(r, null, 2))
  const brief = (x) => x && { plan: x.plan, download: { ...x.download, failed: x.download.failed.length }, mirror: { checked: x.mirror.checked, missing: x.mirror.missing.length, mismatched: x.mirror.mismatched.length }, props: Object.keys(x.parse.props).length, corpora: Object.fromEntries(Object.entries(x.parse.corpora).map(([k, v]) => [k, `${v.count} 本，失败 ${v.failed.length}`])), errors: x.parse.errors, notRun: x.parse.notRun.map((n) => n.props.join('/')), ms: x.ms }
  console.log(JSON.stringify({ engine: name, passed: r.passed, fatal: [r.fatal1, r.fatal2].filter(Boolean).map((f) => f.split('\n').slice(0, 3)), cn: brief(r.install?.cn), en: brief(r.install?.en), toggle: r.toggle, offline: r.offline && { cn: { ...r.offline.cn, set: r.offline.cn.set?.status }, en: { ...r.offline.en, set: r.offline.en.set?.status }, cnBookStillOff: r.offline.cnBookStillOff, cnOn: r.offline.cnOn }, offlineExternal: r.offlineExternal, errors: [...(r.errors1 ?? []), ...(r.errors2 ?? [])] }, null, 1))
}
server.close()
if (!results.length || results.some((r) => !r.passed)) process.exitCode = 1
