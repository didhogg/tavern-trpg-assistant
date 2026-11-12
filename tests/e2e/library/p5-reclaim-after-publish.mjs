// 回收空间（2026-11-12）：每发布一个新版本后，等下载队列空了自动回收一次——被盖住的旧解析副本、旧官方数据版本的结算内核换算缓存清掉。
// Chrome，真实中文资料副本，断网。用法：npm run build 后 node tests/e2e/library/p5-reclaim-after-publish.mjs
import { cp, mkdtemp, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { startStatic } from './static.mjs'
import { engines, work } from './chain-common.mjs'
setTimeout(() => process.exit(124), 300000)
const profile = await mkdtemp(join(work, 'p5-reclaim-'))
await cp(join(work, 'p5-t6-pack-audit-WST6kp'), profile, { recursive: true, filter: (p) => !p.includes('Singleton') })
const { server, url } = await startStatic({ port: 47342 })
const ctx = await engines[0][1].launchPersistentContext(profile, { ...engines[0][2] })
const result = { checks: {}, info: {}, pageErrors: [] }
const ok = (k, v, info) => { result.checks[k] = !!v; if (info !== undefined) result.info[k] = info; console.log(`${v ? 'PASS' : 'FAIL'}  ${k}${info !== undefined ? ' — ' + JSON.stringify(info) : ''}`) }
const P = `(() => { const h = document.querySelector('#trpg-assistant-root'); return [...h.shadowRoot.children].map((c) => c.__vue_app__).find(Boolean).config.globalProperties.$pinia })()`
try {
  await ctx.route((u) => !u.href.startsWith(url), (r) => r.abort())
  const page = await ctx.newPage()
  page.on('pageerror', (e) => { if (!result.pageErrors.includes(e.message)) result.pageErrors.push(e.message) })
  await page.goto(url)
  await page.waitForFunction(`!!(${P})._s.get('app')?.booted`)
  const stats = () => page.evaluate(async (P) => {
    const lib = eval(P)._s.get('app').svc().backend.library
    const keys = await lib.db.derived.toCollection().primaryKeys()
    const logical = new Map()
    for (const k of keys) { const m = /^rev:[^:]+:(.*)$/.exec(k); const l = m ? m[1] : k; logical.set(l, (logical.get(l) ?? 0) + 1) }
    const official = (await lib.dataVersion()).official
    let kcStale = 0
    await lib.db.derived.where('key').startsWith('kc:').each((r) => { if (r.value?.scope?.official !== official) kcStale++ })
    return { derived: keys.length, duplicated: [...logical.values()].filter((n) => n > 1).length, kcStale }
  }, P)
  // 造一份旧副本 + 一行旧版本的换算缓存，再发布一个新版本（等同一次下载完成）
  await page.evaluate(async (P) => {
    const lib = eval(P)._s.get('app').svc().backend.library
    const h = await lib.operations.begin({ kind: 'official', set: 'cn-official', codeSet: 'cn' })
    const cur = await (await lib.currentView()).derivedGet('parsed:cn-official:spell')
    await h.target.derivedPut('parsed:cn-official:spell', cur?.fingerprint ?? 'x', cur?.value ?? {})
    await lib.db.derived.put({ key: 'kc:e2e-old', fingerprint: 'x', value: { scope: { rule: 'dnd5e2014', base: 'b', official: 'old-version' } }, savedAt: 0 })
    await lib.operations.publish(h, {})
  }, P)
  const before = await stats()
  ok('发布后、回收前：有被盖住的旧副本和旧换算缓存', before.duplicated > 0 && before.kcStale > 0, before)
  // 等自动回收（发布后约 3 秒，下载队列空着才跑）：在页面里每半秒看一次那行旧缓存还在不在，最多 60 秒
  const waited = await page.evaluate(async (P) => { const db = eval(P)._s.get('app').svc().backend.library.db; const t0 = Date.now(); while (Date.now() - t0 < 60000) { if (!(await db.derived.get('kc:e2e-old'))) return Date.now() - t0; await new Promise((ok) => setTimeout(ok, 500)) } return -1 }, P)
  result.info.waitedMs = waited
  const after = await stats()
  ok('发布后几秒自动回收：被盖住的旧副本清空、旧换算缓存清空', after.duplicated === 0 && after.kcStale === 0 && after.derived < before.derived, after)
  const readable = await page.evaluate(async (P) => !!(await (await eval(P)._s.get('app').svc().backend.library.currentView()).derivedGet('parsed:cn-official:spell')), P)
  ok('回收后当前版本照常读得到', readable)
  ok('没有界面自己的页面错误', result.pageErrors.filter((e) => !/gendata-nav-adventure-book-index|网络错误|Network error|无法加载 \d+ 个条目的引用/.test(e)).length === 0, result.pageErrors)
} catch (e) {
  result.error = String(e?.stack ?? e)
  console.log('ERROR', result.error)
} finally {
  await writeFile(join(profile, 'result.json'), JSON.stringify(result, null, 1))
  const fails = Object.values(result.checks).filter((v) => !v).length + (result.error ? 1 : 0)
  console.log(fails ? `FAIL ${fails}` : 'ALL PASS')
  await ctx.close(); server.close()
  process.exit(fails ? 1 : 0)
}
