// ⓪ 完整效果测量。只写 work/p3-2-measurement；不把 Foundry 原件带入产品。
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import { createServer } from 'node:http'
import { join, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'
import { chromium, webkit } from 'playwright-core'
import { probeSourceCandidates } from './p3-2-sources-browser.mjs'
import { probeEffects } from './p3-2-effects-browser.mjs'

const root = fileURLToPath(new URL('../../../', import.meta.url))
const ref = process.env.TRPG_REFERENCE ?? '/Users/xxx/DND- reference（DO NO DELETE！）'
const work = join(root, 'work/p3-2-measurement')
const cache = join(work, 'official')
await mkdir(cache, { recursive: true })
const sha = value => createHash('sha256').update(value).digest('hex')
const provenance = []
const YAML = createRequire(join(root, 'work/ddb/ddb-importer/package.json'))('js-yaml')
const official = await build({
  stdin: { contents: 'export * as utils from "https://demo.foundryvtt.com/common/utils/_module.mjs"; export * as constants from "https://demo.foundryvtt.com/common/constants.mjs"; export * as validators from "https://demo.foundryvtt.com/common/data/validators.mjs";', loader: 'js' },
  bundle: true, write: false, format: 'iife', globalName: 'OfficialFoundry',
  plugins: [{ name: 'official-originals', setup(b) {
    b.onResolve({ filter: /^https:\/\// }, a => ({ path: a.path, namespace: 'official' }))
    b.onResolve({ filter: /^\./, namespace: 'official' }, a => ({ path: new URL(a.path, a.importer).href, namespace: 'official' }))
    b.onLoad({ filter: /.*/, namespace: 'official' }, async a => {
      if (new URL(a.path).origin !== 'https://demo.foundryvtt.com') throw Error('Unexpected official origin')
      const path = join(cache, new URL(a.path).pathname.replaceAll('/', '_'))
      let contents
      try { contents = await readFile(path, 'utf8') } catch (e) {
        if (e.code !== 'ENOENT') throw e
        const response = await fetch(a.path)
        if (!response.ok) throw new Error(`${response.status}: ${a.path}`, { cause: e })
        contents = await response.text()
        await writeFile(path, contents)
      }
      provenance.push({ url: a.path, sha256: sha(contents), bytes: Buffer.byteLength(contents) })
      return { contents, loader: 'js' }
    })
  } }],
})
const EXPORTS = ['Config', 'ConfigConsts', 'VetoolsLinks', 'Vetools', 'UtilActiveEffects', 'SideDataInterfaces', 'Dnd5eUtil', 'UtilDamageTypes', 'UtilRenderer', 'ImplementationRegistryImportList', 'DataConverterClassSubclassFeature', 'DataConverterFeat', 'DataConverterOptionalfeature', 'DataConverterRaceFeature', 'DataConverterSpell', 'DataConverterItem', 'DataConverterRace', 'DataConverterBackground', 'DataConverterCreature', 'DataConverterCreatureFeature', 'DataConverterClass', 'SideDataSourceBase', 'CompendiumCacheUtil', 'CompendiumCacheKeyProviderGeneric', 'CompendiumCacheKeyProviderItem', 'UtilEntityClassSubclassFeature', 'UtilEntityOptionalfeature', 'UtilEntityRace', 'UtilEntityRaceFeature', 'UtilEntityBackground', 'UtilEntityCreatureFeature']
const shim = await build({ entryPoints: [join(root, 'work/ddb/ddb-importer/tests/_setup/foundryMocks.ts')], bundle: true, write: false, format: 'iife', banner: { js: 'globalThis.afterEach = () => {};' } })
const dnd5e = await build({ stdin: { contents: `import DND5E from './module/config.mjs'; import { applyLegacyRules } from './module/settings.mjs'; globalThis.__DND5E = DND5E; globalThis.__APPLY_LEGACY = applyLegacyRules;`, resolveDir: join(ref, 'dnd5e-6.1.x'), loader: 'js' }, bundle: true, write: false, format: 'iife' })
const systemManifest = JSON.parse(await readFile(join(ref, 'dnd5e-6.1.x/system.json'), 'utf8'))
const moduleManifest = JSON.parse(await readFile(join(ref, 'plutonium-next-master/plutonium/module.json'), 'utf8'))
const bundleSource = await readFile(join(ref, 'plutonium-next-master/plutonium/js/Bundle.js'), 'utf8')
async function jsonFiles(dir) {
  const out = []
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, item.name)
    if (item.isDirectory()) out.push(...await jsonFiles(path))
    else if (/\.(json|ya?ml)$/.test(path)) { const text = await readFile(path, 'utf8'); out.push({ path, json: path.endsWith('.json') ? JSON.parse(text) : YAML.load(text) }) }
  }
  return out
}
const packs = []
for (const pack of systemManifest.packs.filter(pack => pack.flags?.dnd5e?.rulesVersion === 'legacy')) {
  const entries = await jsonFiles(join(ref, 'dnd5e-6.1.x/packs/_source', pack.name))
  if (!entries.some(x => x.json?.type)) throw Error(`No documents decoded from ${pack.name}`)
  packs.push({ ...pack, collection: `${systemManifest.id}.${pack.name}`, docs: entries.map(x => x.json).filter(doc => doc.type) })
}
const paa = await jsonFiles(join(ref, 'plutonium-addon-automation-master/module/data'))
// CPR（Chris's Premades）2014 资料包：只读作者 packData；CPR 自己的查找在 CAT 模块里（参考目录没有），这里用 Plutonium 同一查找器只算候选。
const cprRoot = join(ref, 'chris-premades-main/packData')
const cpr = []
for (const name of ['cpr-features-2014', 'cpr-equipment-2014', 'cpr-misc-2014', 'cpr-spells-2014', 'cpr-monster-features-2014']) {
  const docs = (await jsonFiles(join(cprRoot, name))).map(x => x.json).filter(doc => doc?.type && !String(doc._key ?? '').startsWith('!folders!'))
  if (!docs.length) throw Error(`No documents decoded from ${name}`)
  cpr.push({ collection: `chris-premades.${name}`, docs })
}
const dataRoot = join(ref, '5etools-src-main/data')
const fingerprints = {}
for (const [name, dir] of Object.entries({ fiveTools: dataRoot, dnd5e: join(ref, 'dnd5e-6.1.x/packs/_source'), paa: join(ref, 'plutonium-addon-automation-master/module/data'), cpr: cprRoot })) {
  const files = []
  for (const path of await readdir(dir, { recursive: true })) {
    if (!/\.(json|ya?ml)$/.test(path)) continue
    const content = await readFile(join(dir, path))
    files.push({ path, bytes: content.length, sha256: sha(content) })
  }
  files.sort((a, b) => a.path.localeCompare(b.path))
  fingerprints[name] = { files, digest: sha(JSON.stringify(files)) }
}
await writeFile(join(work, 'input-fingerprints.json'), JSON.stringify(fingerprints, null, 1))
const requests = []; const failures = []
const server = createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
  requests.push(path)
  try {
    if (path === '/favicon.ico') return res.writeHead(204).end()
    if (path === '/') return res.writeHead(200, { 'content-type': 'text/html' }).end('<!doctype html><body></body>')
    if (path === '/official.js') return res.writeHead(200, { 'content-type': 'text/javascript' }).end(official.outputFiles[0].text)
    if (path === '/bundle.js') return res.writeHead(200, { 'content-type': 'text/javascript' }).end(bundleSource)
    let file
    if (path === '/shim.js') return res.writeHead(200, { 'content-type': 'text/javascript' }).end(shim.outputFiles[0].text)
    if (path === '/dnd5e.js') return res.writeHead(200, { 'content-type': 'text/javascript' }).end(dnd5e.outputFiles[0].text)
    if (path.startsWith('/modules/plutonium/')) file = join(ref, 'plutonium-next-master/plutonium', path.slice('/modules/plutonium/'.length))
    else if (path.startsWith('/data/')) file = join(dataRoot, path.slice('/data/'.length))
    else throw Error('Unserved probe route')
    const content = await readFile(file)
    res.writeHead(200, { 'content-type': extname(file) === '.json' ? 'application/json' : 'text/javascript' }).end(content)
  } catch (e) { if (path !== '/favicon.ico') failures.push({ path, error: String(e.message) }); res.writeHead(404).end() }
})
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const url = `http://127.0.0.1:${server.address().port}/`
try {
  for (const [name, type, options] of [['chrome', chromium, { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true }], ['webkit', webkit, { headless: true }]]) {
    if (process.env.ENGINE && name !== process.env.ENGINE) continue
    const browser = await type.launch(options)
    const logs = []; const networkFailures = []
    const page = await browser.newPage()
    page.on('console', m => { if (m.text().startsWith('[probe-progress]')) console.log(name, m.text()); if (m.type() === 'error' || m.type() === 'warning') logs.push({ type: m.type(), text: m.text().slice(0, 1000) }) })
    page.on('pageerror', e => logs.push({ type: 'pageerror', text: String(e.stack) }))
    page.on('requestfailed', r => networkFailures.push({ url: r.url(), error: r.failure()?.errorText }))
    const started = Date.now()
    try {
      await page.goto(url)
      const result = await page.evaluate(probeEffects, { EXPORTS, system: { id: systemManifest.id, version: systemManifest.version, title: systemManifest.title }, debug: process.env.DEBUG ?? null })
      if (result.corpus && !process.env.DEBUG) {
        const candidates = await page.evaluate(probeSourceCandidates, { packs, paa, cpr })
        await writeFile(join(work, `source-candidates-${name}.json`), JSON.stringify(candidates, null, 1))
      }
      const corpus = result.corpus
      delete result.corpus
      const output = { engine: name, elapsedMs: Date.now() - started, versions: { plutonium: moduleManifest.version, bundleSha256: sha(bundleSource), dnd5e: systemManifest.version, dnd5eMinimum: systemManifest.compatibility.minimum, officialDemo: '14.365' }, provenance, ...result, logs, networkFailures, failures }
      await writeFile(join(work, `effects-${name}${process.env.DEBUG ? '-debug' : ''}.json`), JSON.stringify(output, null, 1))
      if (corpus && !process.env.DEBUG) await writeFile(join(work, `corpus-${name}.json`), JSON.stringify(corpus))
      console.log(JSON.stringify({ engine: name, stage: result.stage, census: result.census, rows: result.rows?.length, errors: result.rows?.filter(r => r.error).length, loadErrors: result.loadErrors, regression: result.regression, logs, failures, networkFailures }))
      if (result.stage !== 'batch' || result.dnd5eErr || result.rows?.some(row => row.error) || Object.keys(result.loadErrors ?? {}).length || !result.regression?.officialRoundTrip) process.exitCode = 1
    } finally { await browser.close() }
  }
} finally { await new Promise(resolve => server.close(resolve)) }
