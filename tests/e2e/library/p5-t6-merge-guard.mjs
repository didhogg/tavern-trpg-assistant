// 修法 A（P5 T6）真实数据验证：缺依赖时作者会把整个自制库置空；现在后端要拦下、不发布、旧版本照旧可读，并点名缺的依赖。
// 资料：p5-t6-pack-audit-WST6kp 副本（端口须 47342）；外网全部拦掉。用法：SKIP_BUILD=1 node tests/e2e/library/p5-t6-merge-guard.mjs
import { cp, readFile, rm } from 'node:fs/promises'
import { startStatic } from './static.mjs'
import { buildAll, engines, work } from './chain-common.mjs'
import { check, failures } from '../helpers.mjs'

if (!process.env.SKIP_BUILD) await buildAll()
const [, type, options] = engines.find((e) => e[0] === 'chrome')
const { server, url } = await startStatic({ port: 47342 })
const P = `(() => { const h = document.querySelector('#trpg-assistant-root'); return [...h.shadowRoot.children].map((c) => c.__vue_app__).find(Boolean).config.globalProperties.$pinia })()`
const fx = async (name) => ({ name, text: await readFile(`${work}/fixtures/${name}`, 'utf8') })
const files = { psion: await fx('psion.json'), weapon: await fx('weapon4.json') }

async function run(label, fn) {
  const profile = `${work}/profile-p5t6-guard-${label}`
  await rm(profile, { recursive: true, force: true })
  await cp(`${work}/p5-t6-pack-audit-WST6kp`, profile, { recursive: true, filter: (p) => !p.includes('Singleton') })
  const ctx = await type.launchPersistentContext(profile, { ...options })
  const page = await ctx.newPage()
  page.setDefaultTimeout(180000)
  await ctx.route((u) => !u.href.startsWith(url), (r) => r.abort())
  await page.goto(url)
  await page.waitForFunction(`!!(${P})._s.get('app')?.booted`)
  try { return await page.evaluate(fn, [P, files]) } finally { await ctx.close() }
}
const helpers = `
  const be = eval(P)._s.get('app').svc().backend, lib = be.library, sv = lib.service
  const total = async () => { let n = 0; for (const prop of ['spell', 'subclassFeature', 'class', 'item', 'monster']) n += (await sv.query('cn-brew', prop, {})).length; return n }
  const bySrc = async (s) => (await lib.brewPacks.list('cn-brew')).find((p) => p.sources.some((x) => x.toLowerCase() === s.toLowerCase()))
  const viewId = async () => (await lib.currentView()).id
  const attempt = async (f) => { try { await f(); return { ok: true } } catch (e) { return { ok: false, name: e.name, message: String(e.message).slice(0, 200), missing: e.missing ?? null } } }
`
const r1 = await run('del', new Function('[P, files]', `return (async () => { ${helpers}
  const before = { total: await total(), view: await viewId() }
  const prov = await bySrc('llspell')
  const res = await attempt(() => sv.brewDelete('cn-brew', [prov.docIdLocal]))
  return { before, res, after: { total: await total(), view: await viewId(), provStill: !!(await bySrc('llspell')) } } })()`))
check('场景 1：直接删被依赖的法术合集 → 被拦下（BrewDependencyError）', r1.res.ok === false && r1.res.name === 'BrewDependencyError', JSON.stringify(r1.res).slice(0, 300))
check('场景 1：点名缺 llspell、需要它的是灵能使', !!r1.res.missing?.some((m) => m.source.toLowerCase() === 'llspell' && m.packs.some((p) => /灵能使/.test(p.filename ?? ''))), JSON.stringify(r1.res.missing))
check('场景 1：没发布新版本，全部自制条目照旧，法术合集还在', r1.after.view === r1.before.view && r1.after.total === r1.before.total && r1.after.provStill, `${JSON.stringify(r1.before)} → ${JSON.stringify(r1.after)}`)

const r2 = await run('import', new Function('[P, files]', `return (async () => { ${helpers}
  // 先按删除预览把灵能使和法术合集一起删掉（正常流程），再只导入灵能使
  const prov = await bySrc('llspell')
  const impact = await be.removalImpact({ kind: 'brew', setId: 'cn-brew', docIdLocals: [prov.docIdLocal] })
  const del = await attempt(() => be.removalExecute(impact))
  const before = { total: await total(), view: await viewId() }
  const res = await attempt(() => sv.brewImport('cn-brew', [files.psion]))
  const after = { total: await total(), view: await viewId(), psion: !!(await bySrc('LLPS')) }
  const ok = await attempt(() => sv.brewImport('cn-brew', [files.weapon]))
  return { del, removeTogether: impact.removeTogether.length, before, res, after, ok, afterOk: { total: await total(), view: await viewId() } } })()`))
check('场景 3：按删除预览把法术合集和灵能使一起删 → 成功', r2.del.ok && r2.removeTogether === 2, JSON.stringify(r2.del) + ` removeTogether=${r2.removeTogether}`)
check('场景 2：只导入灵能使（依赖不在）→ 被拦下并点名 llspell', r2.res.ok === false && r2.res.name === 'BrewDependencyError' && !!r2.res.missing?.some((m) => m.source.toLowerCase() === 'llspell'), JSON.stringify(r2.res).slice(0, 300))
check('场景 2：没发布，其余自制条目照旧，灵能使没有装进来', r2.after.view === r2.before.view && r2.after.total === r2.before.total && !r2.after.psion, `${JSON.stringify(r2.before)} → ${JSON.stringify(r2.after)}`)
check('场景 4：导入依赖齐全的包（武器 +4）→ 照常成功并发布', r2.ok.ok && r2.afterOk.view !== r2.after.view && r2.afterOk.total >= r2.after.total, `${JSON.stringify(r2.ok)} ${JSON.stringify(r2.afterOk)}`)
server.close()
console.log(failures.length ? `FAIL ${failures.length}` : 'ALL PASS')
process.exit(failures.length ? 1 : 0)
