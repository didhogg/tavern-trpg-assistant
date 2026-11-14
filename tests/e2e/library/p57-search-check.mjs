// 性能支线第 6 步：装完书后连续搜索，搜索索引缓存会不会每次都被判过期、重建重写。
// 用 p57-install-convert.mjs 留下的测试档案（已装《玩家手册》《怪物图鉴》），先跑那个。
// 用法：node tests/e2e/library/p57-search-check.mjs [标签]（结果 work/e2e-lib/p57-search-<标签>-chrome.json）
import { writeFile } from 'node:fs/promises'
import { startStatic } from './static.mjs'
import { buildAll, engines, knownError, work } from './chain-common.mjs'

if (!process.env.SKIP_BUILD) await buildAll()
const label = process.argv[2] ?? 'run'
const [, type, options] = engines[0]
const { server, url } = await startStatic({ port: 47339 })
const ctx = await type.launchPersistentContext(`${work}/profile-p57-chrome`, { ...options, viewport: { width: 1280, height: 800 } })
const errors = []
const checks = []
const check = (name, ok, detail = '') => { checks.push({ name, ok: !!ok, detail }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`) }
try {
  const run = async () => {
    const page = await ctx.newPage()
    page.setDefaultTimeout(300_000)
    page.on('pageerror', (e) => errors.push(String(e.stack ?? e).slice(0, 300)))
    await page.goto(url)
    await page.waitForFunction(() => { const h = document.querySelector('#trpg-assistant-root'); const app = [...(h?.shadowRoot?.children ?? [])].map((c) => c.__vue_app__).find(Boolean); return app?.config.globalProperties.$pinia._s.get('app')?.booted })
    const out = await page.evaluate(async () => {
      const host = document.querySelector('#trpg-assistant-root')
      const app = [...host.shadowRoot.children].map((c) => c.__vue_app__).find(Boolean)
      const lib = app.config.globalProperties.$pinia._s.get('app').svc().backend.library
      // 搜索索引缓存那一条（cache.ts preKey：pre:<源>:search，按当前发布版本存）什么时候写的
      const savedAt = async () => (await (await lib.revisions.published()).derivedGet('pre:cn-official:search'))?.savedAt ?? null
      const rows = []
      for (const term of ['火球术', '巨魔', '长剑']) {
        const before = await savedAt()
        const t = performance.now()
        const hits = await lib.scoped.search({ rule: 'dnd5e2014', codeSet: 'cn', scopes: ['5e2014'], include: [], exclude: [], choices: {} }, term)
        rows.push({ term, ms: Math.round(performance.now() - t), hits: hits.length, rewritten: (await savedAt()) !== before })
      }
      return rows
    })
    await page.close()
    return out
  }
  const first = await run()
  const afterReload = await run()
  console.log('搜三次', JSON.stringify(first))
  console.log('刷新后再搜三次', JSON.stringify(afterReload))
  await writeFile(`${work}/p57-search-${label}-chrome.json`, JSON.stringify({ first, afterReload, errors: errors.filter((e) => !knownError(e)) }, null, 2))
  const all = [...first, ...afterReload]
  check('每次都搜得到', all.every((r) => r.hits > 0))
  check('搜索索引缓存没有被反复重写（第一次之后都不重写）', all.slice(1).every((r) => !r.rewritten), JSON.stringify(all.map((r) => [r.term, r.ms, r.rewritten])))
} finally {
  await ctx.close()
  server.close()
}
const bad = checks.filter((c) => !c.ok).length
console.log(bad ? `FAIL ${bad}` : 'ALL PASS')
process.exit(bad ? 1 : 0)
