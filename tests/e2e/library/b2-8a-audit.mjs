// B2-8a 审计第 3、4 层（D2-P2 B1 设计 §11）：中英官方数据各出一份"四个桶 + 可疑清单"报告。
// B2-8 体检：审计报告存进库后，体检把安装报告、中英覆盖率、第 3、4 层、自制（导入一个正常包、一个空包、一个没有来源的包）汇成一份。
// 作者结构定义从 5etools-utils 读（SCHEMA_DIR 可改）。Chrome 与 WebKit 各跑一遍（ENGINE=chrome 只跑一种）。
// 用固定端口和固定浏览器资料夹：装过一次以后再跑不重新下载（端口一变，网页的存储就是另一份）。KEEP=0 时清掉重装。
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { build } from 'vite'
import { chromium, webkit } from 'playwright-core'
import { root, startStatic } from './static.mjs'
import { schemaInfo } from '../../../tools/audit/schema-info.mjs'

const SCHEMA_DIR = process.env.SCHEMA_DIR ?? '/Users/xxx/tavern-trpg-data-next/_sources/5etools-utils/schema/site'
const schema = await schemaInfo(SCHEMA_DIR)
const work = `${root}work/e2e-lib`
await mkdir(work, { recursive: true })
await build({ configFile: `${root}vite.config.ts`, root, logLevel: 'error' })
await build({ configFile: false, root, logLevel: 'error', build: {
  lib: { entry: `${root}tests/e2e/library/harness.ts`, formats: ['es'], fileName: () => 'harness.js' },
  outDir: work, emptyOutDir: false,
} })
const { server, url } = await startStatic({ port: 47318 })
const engines = [
  ['chrome', chromium, { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true }],
  ['webkit', webkit, { headless: true }],
]

// 体检用的自制测试文件（只是测试夹具）：正常包、有来源但没内容的包、没有来源的包
const meta = (json) => ({ sources: [{ json, abbreviation: json, full: `TRPG ${json}`, authors: ['test'], version: '1' }], dateAdded: 0, dateLastModified: 0 })
const BREW_FILES = [
  { name: 'trpg-good.json', text: JSON.stringify({ _meta: meta('TRPGGOOD'), spell: [{ name: '体检测试法术', source: 'TRPGGOOD', page: 0, level: 1, school: 'V', time: [{ number: 1, unit: 'action' }], range: { type: 'point', distance: { type: 'self' } }, components: { v: true }, duration: [{ type: 'instant' }], entries: ['测试'] }] }) },
  { name: 'trpg-empty.json', text: JSON.stringify({ _meta: meta('TRPGEMPTY') }) },
  { name: 'trpg-no-sources.json', text: JSON.stringify({ spell: [{ name: 'x', source: 'NOPE' }] }) },
]

const results = []
for (const [name, type, options] of engines) {
  if (process.env.ENGINE && process.env.ENGINE !== name) continue
  const profile = `${work}/profile-b2-8a-${name}`
  if (process.env.KEEP === '0') await rm(profile, { recursive: true, force: true })
  const ctx = await type.launchPersistentContext(profile, options)
  const page = await ctx.newPage()
  page.setDefaultTimeout(3600000)
  const errors = []
  page.on('pageerror', (e) => errors.push(e.stack.split('\n').slice(0, 2).join(' | ')))
  page.on('console', (m) => { if (m.text().startsWith('[progress]') && !/ download /.test(m.text())) console.log(m.text()) })
  const r = { engine: name }
  try {
    await page.goto(url)
    r.reports = await page.evaluate(async (schema) => {
      const h = await import('/work/e2e-lib/harness.js')
      const out = {}
      for (const id of ['cn-official', 'en-official']) {
        const set = await h.offlineAudit(id)
        // 没装过或装得不全就装（只有第一次联网下载）
        if (set.set?.status !== 'installed' || set.ok !== set.planFiles) await h.install(id)
        out[id] = await h.auditLayers34(id, schema)
      }
      return out
    }, schema)
    r.health = await page.evaluate(async (files) => {
      const h = await import('/work/e2e-lib/harness.js')
      h.service.reset()
      await h.service.englishCoverage('cn-official')
      const imported = await h.service.brewImport('cn-brew', files)
      const health = await h.service.health()
      // 收拾：删掉这次导入的（没有来源的包作者不列出，删不到，见体检 brew-hidden）
      await h.service.brewDelete('cn-brew', imported.value.added.map((e) => e.head.docIdLocal))
      return { imported: { added: imported.value.added.map((e) => e.head.filename), errors: imported.errors }, health }
    }, BREW_FILES)
  } catch (e) { r.fatal = e.stack } finally { r.errors = errors; await ctx.close() }
  for (const [id, rep] of Object.entries(r.reports ?? {})) await writeFile(`${work}/audit34-${name}-${id}.json`, JSON.stringify(rep, null, 2))
  const items = r.health?.health.items ?? []
  const it = (source, check) => items.find((i) => i.source === source && i.check === check)
  r.verdict = {
    officialClean: ['cn-official', 'en-official'].every((id) => ['download', 'mirror', 'parse'].every((c) => it(id, c)?.level === 'ok')),
    englishIn: it('cn-official', 'english')?.count > 0 && it('cn-official', 'english-name')?.level === 'warn',
    layers34In: ['cn-official', 'en-official'].every((id) => it(id, 'layer3')?.layer === 3 && it(id, 'layer3')?.title.includes('不漏') && it(id, 'layer4')),
    imported: ['trpg-good.json', 'trpg-empty.json'].every((f) => r.health?.imported.added.includes(f)),
    hidden: it('cn-brew', 'brew-hidden')?.details.some((h) => h.head?.filename === 'trpg-no-sources.json'),
    empty: it('cn-brew', 'brew-empty')?.details.some((h) => h.filename === 'trpg-empty.json') && !it('cn-brew', 'brew-empty')?.details.some((h) => h.filename === 'trpg-good.json'),
    enBrew: !!it('en-brew', 'brew-hidden'),
  }
  r.passed = !r.fatal && !errors.length && Object.keys(r.reports ?? {}).length === 2 && Object.values(r.verdict).every(Boolean)
  results.push(r)
  const brief = (rep) => rep && {
    totals: rep.totals,
    notCategory: Object.fromEntries(Object.entries(rep.notCategory).map(([k, v]) => [k, v.length === 1 ? v[0] : `${v.length} 个文件`])),
    noSchemaFile: rep.noSchemaFile,
    notLoaded: rep.notLoaded,
    notChecked: rep.notChecked,
    dByProp: Object.fromEntries(Object.entries(rep.layer3).filter(([, t]) => t.d.rawOnly + t.d.parsedOnly + t.d.rawNoHash).map(([p, t]) => [p, `原始有解析无 ${t.d.rawOnly}，解析有原始无 ${t.d.parsedOnly}，无编号 ${t.d.rawNoHash}`])),
    suspiciousByProp: Object.fromEntries(Object.entries(rep.layer4).filter(([, t]) => Object.keys(t.suspicious).length).map(([p, t]) => [p, Object.fromEntries(Object.entries(t.suspicious).map(([k, v]) => [k, v.count]))])),
  }
  if (r.health) await writeFile(`${work}/health-${name}.json`, JSON.stringify(r.health, null, 2))
  console.log(JSON.stringify({ engine: name, verdict: r.verdict, health: r.health && { summary: r.health.health.summary, imported: r.health.imported, items: items.map((i) => `${i.level.padEnd(5)} ${i.source} ${i.check} ${i.count}${i.stale ? ' (旧)' : ''}`) } }, null, 1))
  console.log(JSON.stringify({ engine: name, passed: r.passed, fatal: r.fatal?.split('\n').slice(0, 3), errors, cn: brief(r.reports?.['cn-official']), en: brief(r.reports?.['en-official']) }, null, 1))
}
server.close()
// 审计程序只出报告："跑通、两份报告都出来、体检收得到"即通过；桶里有什么交给驾驶员看（设计 §11：可疑清单按类别查根因）
if (!results.length || results.some((r) => !r.passed)) process.exitCode = 1
