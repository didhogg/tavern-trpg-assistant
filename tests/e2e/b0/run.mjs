import { createServer } from 'node:http'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { resolve, extname } from 'node:path'
import { execFileSync } from 'node:child_process'
import { build } from 'vite'
import { chromium, webkit } from 'playwright-core'

const root = resolve(import.meta.dirname, '../../..')
const work = resolve(process.env.B0_WORK ?? `${root}/work/b0`)
const upstream = resolve(process.env.B0_UPSTREAM ?? '/Users/xxx/tavern-trpg-data-next/_upstream/code/5etools-src')
const revision = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: upstream, encoding: 'utf8' }).trim()
const source = process.env.B0_SOURCE ?? 'XPHB'
const baseUrl = `https://raw.githubusercontent.com/5etools-mirror-3/5etools-src/${revision}/`
await mkdir(work, { recursive: true })
await build({ configFile: false, root, logLevel: 'warn', build: {
  lib: { entry: `${root}/tests/e2e/b0/bridge.ts`, formats: ['es'], fileName: () => 'bridge.js' },
  outDir: `${work}/bridge`, emptyOutDir: true,
} })
await build({ configFile: `${root}/vite.config.ts`, root, logLevel: 'warn', build: { outDir: `${work}/plugin`, emptyOutDir: true } })
const authorHtml = await readFile(`${upstream}/spells.html`, 'utf8')
const tags = [...authorHtml.matchAll(/<script\b[^>]*src="([^"]+)"[^>]*><\/script>/g)]
const start = tags.findIndex(m => m[1] === 'js/parser.js')
const end = tags.findIndex(m => m[1] === 'js/hist.js')
// Omnisearch is a site navigation widget: it registers a load-time render hook.
const scriptTags = tags.slice(start, end + 1).filter(m => m[1] !== 'js/omnisearch.js')
const iframeHtml = `<!doctype html><html><head><base href="/author/"></head><body>${scriptTags.map(m => m[0]).join('\n')}</body></html>`
const mock = (await readFile(`${root}/tests/e2e/mock-host.html`, 'utf8')).replace('/dist/index.js', '/plugin/index.js')
const requests = []
const server = createServer(async (req, res) => {
  const path = new URL(req.url, 'http://localhost').pathname
  requests.push(path)
  if (path === '/favicon.ico') return res.writeHead(204).end()
  if (path === '/') return res.writeHead(200, { 'content-type': 'text/html' }).end(mock)
  if (path === '/frame.html') return res.writeHead(200, { 'content-type': 'text/html' }).end(iframeHtml)
  if (path === '/read.html') return res.writeHead(200, { 'content-type': 'text/html' }).end('<!doctype html><title>B0 readback</title>')
  if (path.startsWith('/author/data/') || path.startsWith('/author/search/')) return res.writeHead(403).end('B0 prohibits local data fallback')
  const routes = [['/author/', upstream], ['/plugin/', `${work}/plugin`], ['/bridge/', `${work}/bridge`], ['/test/', `${root}/tests/e2e/b0`]]
  const route = routes.find(([prefix]) => path.startsWith(prefix))
  if (!route) return res.writeHead(404).end()
  const file = resolve(route[1], decodeURIComponent(path.slice(route[0].length)))
  if (!file.startsWith(`${route[1]}/`)) return res.writeHead(403).end()
  try {
    const body = await readFile(file)
    res.writeHead(200, { 'content-type': ({ '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json' })[extname(file)] ?? 'application/octet-stream' }).end(body)
  } catch (error) { res.writeHead(404).end(String(error.code)) }
})
await new Promise(r => server.listen(0, '127.0.0.1', r))
const url = `http://127.0.0.1:${server.address().port}`
console.log(JSON.stringify({ url, revision, source, scripts: scriptTags.map(m => m[1]) }))
const reports = []
try {
  for (const engine of ['chrome', 'webkit']) {
    if (process.env.B0_ENGINE && process.env.B0_ENGINE !== engine) continue
    const launch = engine === 'chrome'
      ? { type: chromium, options: { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true } }
      : { type: webkit, options: { headless: true } }
    const profile = `${work}/profile-${engine}-${Date.now()}`
    let context = await launch.type.launchPersistentContext(profile, launch.options)
    const report = { engine, revision, source, baseUrl, scripts: scriptTags.map(m => m[1]), errors: [], consoleErrors: [], network: [], profile }
    reports.push(report)
    try {
      const page = await context.newPage()
      page.setDefaultTimeout(180000)
      page.on('pageerror', error => report.errors.push(error.stack))
      page.on('console', message => { if (message.type() === 'error') report.consoleErrors.push(message.text()) })
      page.on('requestfailed', request => report.network.push({ url: request.url(), failed: request.failure() }))
      page.on('response', response => { if (response.url().startsWith('https:')) report.network.push({ url: response.url(), status: response.status() }) })
      await page.goto(url)
      await page.waitForFunction(() => {
        const host = document.querySelector('#trpg-assistant-root')
        const app = [...(host?.shadowRoot?.children ?? [])].map(c => c.__vue_app__).find(Boolean)
        return app?.config.globalProperties.$pinia._s.get('app')?.booted
      })
      report.pluginBooted = true
      console.log(`${engine}: plugin booted; loading author runtime`)
      const t = Date.now()
      await page.evaluate(() => {
        window.b0Before = [Object, Array, String, Number, Boolean, Function, Promise].map(c => Object.getOwnPropertyNames(c.prototype).sort())
        const frame = document.createElement('iframe'); frame.id = 'b0-frame'; frame.src = '/frame.html'; document.body.append(frame)
      })
      const frame = page.frames().find(f => f.url().endsWith('/frame.html')) ?? await new Promise(r => page.once('framenavigated', r))
      await frame.waitForFunction(() => typeof DataLoader !== 'undefined' && typeof BrewUtil2 !== 'undefined' && typeof Renderer !== 'undefined')
      const collected = await frame.evaluate(async ({ source, baseUrl }) => {
        const { collect } = await import('/test/author.mjs')
        const { digest } = await import('/bridge/bridge.js')
        window.b0Collected = await collect(source, baseUrl)
        return { coverage: window.b0Collected.coverage, errors: window.b0Collected.errors, digest: digest(window.b0Collected) }
      }, { source, baseUrl })
      report.collectionMs = Date.now() - t
      report.coverage = collected.coverage
      report.collectionErrors = collected.errors
      report.authorDigest = collected.digest
      report.saved = await page.evaluate(async () => {
        const bridge = await import('/bridge/bridge.js')
        const value = structuredClone(document.getElementById('b0-frame').contentWindow.b0Collected)
        const saved = await bridge.save(value)
        const before = window.b0Before
        const after = [Object, Array, String, Number, Boolean, Function, Promise].map(c => Object.getOwnPropertyNames(c.prototype).sort())
        return { ...saved, jsonBytes: new TextEncoder().encode(JSON.stringify(value)).length, prototypeKeysUnchanged: JSON.stringify(before) === JSON.stringify(after), counts: Object.fromEntries(Object.entries(value.groups).map(([k, v]) => [k, v.length])), corpora: Object.keys(value.corpora), bookPreview: Object.values(value.corpora).map(c => ({ name: c.book?.name, id: c.book?.id, keys: Object.keys(c), chapters: c.bookData?.data?.map(d => d.name) })) }
      })
      await context.close()
      context = await launch.type.launchPersistentContext(profile, launch.options)
      const reopened = await context.newPage()
      await reopened.route('https://**/*', route => route.abort())
      await reopened.goto(`${url}/read.html`)
      report.reopened = await reopened.evaluate(async () => {
        const bridge = await import('/bridge/bridge.js')
        const { digest, value } = await bridge.read()
        return { digest, groups: Object.fromEntries(Object.entries(value.groups).map(([k, v]) => [k, v.length])), corpora: Object.keys(value.corpora) }
      })
      report.passed = !report.errors.length && !report.collectionErrors.length && report.authorDigest === report.saved.before && report.saved.before === report.reopened.digest && report.saved.prototypeKeysUnchanged && report.network.filter(n => n.url.startsWith(baseUrl)).every(n => n.status === 200)
    } catch (error) { report.fatal = error.stack; report.passed = false }
    finally { await context.close(); await writeFile(`${work}/${engine}.json`, JSON.stringify(report, null, 2)) }
    console.log(JSON.stringify({ engine, passed: report.passed, fatal: report.fatal, errors: report.errors, collectionErrors: report.collectionErrors, saved: report.saved, reopened: report.reopened }))
  }
} finally { server.close(); await writeFile(`${work}/summary.json`, JSON.stringify({ revision, source, reports, localRequests: requests }, null, 2)) }
if (reports.some(r => !r.passed)) process.exitCode = 1
