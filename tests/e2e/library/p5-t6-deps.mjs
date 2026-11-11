// P5 T6 依赖（按作者程序）真实数据点击验证（Chrome）：管理页【依赖包】、删除预览列出一起删的包、
// 下载前依赖预览（含「不再提示」）、缺依赖条目说明需要的依赖包并可重试拉取。
// 资料：p5-t6-pack-audit-WST6kp 副本（端口须 47342）；外网全部拦掉，自制包文件从本地 fixtures 网址取。
// 用法：SKIP_BUILD=1 node tests/e2e/library/p5-t6-deps.mjs
import { cp, mkdir, rm } from 'node:fs/promises'
import { startStatic } from './static.mjs'
import { buildAll, engines, work } from './chain-common.mjs'
import { check, failures, settle } from '../helpers.mjs'

if (!process.env.SKIP_BUILD) await buildAll()
const [, type, options] = engines.find((e) => e[0] === 'chrome')
const { server, url } = await startStatic({ port: 47342 })
const shots = `${work}/p5-t6-shots/deps`
await mkdir(shots, { recursive: true })
const P = `(() => { const h = document.querySelector('#trpg-assistant-root'); return [...h.shadowRoot.children].map((c) => c.__vue_app__).find(Boolean).config.globalProperties.$pinia })()`
const profile = `${work}/profile-p5t6-deps`
await rm(profile, { recursive: true, force: true })
await cp(`${work}/p5-t6-pack-audit-WST6kp`, profile, { recursive: true, filter: (p) => !p.includes('Singleton') })
const ctx = await type.launchPersistentContext(profile, { ...options, viewport: { width: 1280, height: 800 } })
const page = await ctx.newPage()
page.setDefaultTimeout(120000)
const errors = []
page.on('pageerror', (e) => errors.push(String(e.message ?? e).slice(0, 160)))
// 自制包文件走「外部网址」（作者小窗会把同源请求当成库内文件），由测试拦截后返回本地真实文件；其余外网全部拦掉
const FIX = 'https://fixtures.example.test/'
await ctx.route((u) => !u.href.startsWith(url), (r) => {
  const u = r.request().url()
  if (u.startsWith(FIX)) return r.fulfill({ path: `${work}/fixtures/${u.slice(FIX.length).split('?')[0]}`, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' } })
  return r.abort()
})
await page.goto(url)
await page.waitForFunction(`!!(${P})._s.get('app')?.booted`)
await page.locator('.trpg-ball').click()
await settle(page, 600)
await page.locator('.trpg-window').getByRole('button', { name: '库', exact: true }).first().click()
await page.waitForSelector('[data-testid="shelf-tab"]')
const tab = (name) => page.locator('.trpg-seg button', { hasText: name }).first().click()

// S1 管理页【依赖包】：灵能使依赖法术合集，显示已装
await tab('我的库')
await page.locator('[data-testid="mylib-open"]', { hasText: '灵能使' }).first().click()
await page.waitForSelector('[data-testid="pack-page"]')
await page.locator('.trpg-modal__head .trpg-more').click()
await page.locator('.trpg-dropdown__item', { hasText: '管理' }).click()
await page.waitForSelector('[data-testid="manage-page"]')
await page.locator('[data-testid="manage-page"] .trpg-seg button', { hasText: '依赖包' }).click()
await page.waitForSelector('[data-testid="manage-deps"]')
await settle(page, 800)
const depText = await page.locator('[data-testid="manage-deps"]').innerText()
await page.screenshot({ path: `${shots}/s1-manage-deps.png` })
check('管理页【依赖包】列出灵能使依赖的法术合集且显示已装', /法术合集/.test(depText) && /已装/.test(depText), depText.replace(/\n/g, ' | '))
await page.keyboard.press('Escape'); await settle(page, 300); await page.keyboard.press('Escape'); await settle(page, 300)
const closeAll = () => page.evaluate((P) => { const m = eval(P)._s.get('modal'); (m.close ?? m.clear)?.(true) }, P)
await closeAll(); await settle(page, 300)

// S2 删除预览：删法术合集 → 列出会一起删除的灵能使；取消不删
const before = await page.evaluate(async (P) => (await eval(P)._s.get('app').svc().backend.library.brewPacks.list('cn-brew')).length, P)
const row = page.locator('[data-testid="mylib-tab"] .trpg-row', { hasText: '法术合集' }).first()
await row.locator('.trpg-more').click()
await page.locator('.trpg-dropdown__item', { hasText: '删除' }).click()
await page.waitForSelector('[data-testid="confirm-page"]')
await settle(page, 800)
const conf = await page.locator('[data-testid="confirm-page"]').innerText()
await page.screenshot({ path: `${shots}/s2-remove-preview.png` })
check('删除法术合集：预览列出会一起删除的灵能使', /会一起删除/.test(conf) && /灵能使/.test(conf), conf.replace(/\n/g, ' | ').slice(0, 300))
await page.locator('.trpg-confirm__actions .trpg-btn', { hasText: '取消' }).click()
await settle(page, 400)
const afterCancel = await page.evaluate(async (P) => (await eval(P)._s.get('app').svc().backend.library.brewPacks.list('cn-brew')).length, P)
check('删除预览点取消：一个包都没少', afterCancel === before, `${before} → ${afterCancel}`)

// S3 下载前依赖预览：目录换成本地两个真实包（外网拦掉）
await tab('下载')
await page.waitForSelector('[data-testid="brew-catalog"]')
await settle(page, 1500)
await page.evaluate(([P, base]) => {
  const cat = eval(P)._s.get('brewcatalog')
  const f = (path, name) => ({ urlDownload: `${base}${path}`, path: `x/${path}`, name, sources: [] })
  cat.rows = [{ zh: f('dull-wizard.json', 'Sample - Giddy; 《乏味巫师指南》.json'), en: null, status: 'zh-only' }, { zh: f('psion.json', 'LaserLlama; 灵能使（测试副本）.json'), en: null, status: 'zh-only' }]
}, [P, FIX])
await settle(page, 300)
await page.locator('[data-testid="brew-list"] .trpg-row', { hasText: '乏味巫师指南' }).getByRole('button', { name: '下载' }).click()
await page.waitForSelector('[data-testid="dependency-preview"]', { timeout: 20000 }).catch(async (e) => {
  await page.screenshot({ path: `${shots}/s3-debug.png` })
  console.log('DEBUG', JSON.stringify(await page.evaluate((P) => ({ brew: eval(P)._s.get('downloads').items.map((i) => [i.label, i.status, i.error]), stack: eval(P)._s.get('modal').stack?.map((x) => x.key) }), P)), errors.slice(-5))
  throw e
})
const prev = await page.locator('[data-testid="dependency-preview"]').innerText()
await page.screenshot({ path: `${shots}/s3-download-preview.png` })
check('下载前预览：《乏味巫师指南》依赖的官方书（玩家手册）列为已装', /已经装好的依赖/.test(prev) && /玩家手册/.test(prev), prev.replace(/\n/g, ' | ').slice(0, 300))
await page.locator('[data-testid="dependency-preview"] .trpg-btn', { hasText: '取消' }).click()
await settle(page, 500)
const afterPrevCancel = await page.evaluate(async (P) => (await eval(P)._s.get('app').svc().backend.library.brewPacks.list('cn-brew')).length, P)
check('下载预览点取消：什么都没装', afterPrevCancel === before, `${before} → ${afterPrevCancel}`)
await page.locator('[data-testid="brew-list"] .trpg-row', { hasText: '灵能使（测试副本）' }).getByRole('button', { name: '下载' }).click()
await page.waitForSelector('[data-testid="dependency-preview"]')
await settle(page, 800)
const prev2 = await page.locator('[data-testid="dependency-preview"]').innerText()
await page.screenshot({ path: `${shots}/s3-download-preview-psion.png` })
check('下载前预览：灵能使的依赖 llspell 列出（拦外网时自制索引取不到，归为找不到的依赖）', /llspell/.test(prev2), prev2.replace(/\n/g, ' | ').slice(0, 300))
await page.locator('[data-testid="dependency-dont-ask"]').click()
await page.locator('[data-testid="dependency-preview"] .trpg-btn', { hasText: '取消' }).click()
await settle(page, 300)
const skipAfterCancel = await page.evaluate((P) => eval(P)._s.get('app').settings.library.skipDependencyPrompt, P)
check('勾了「不再提示」但点取消：设置不改', skipAfterCancel === false, String(skipAfterCancel))

// S4 缺依赖的条目：强制删掉法术合集（模拟缺依赖），打开灵能使的职业 → 说明需要的依赖包 + 重试拉取
const ref = await page.evaluate(async (P) => {
  const lib = eval(P)._s.get('app').svc().backend.library
  const cls = (await lib.service.query('cn-brew', 'class', {})).find((x) => String(x.source).toLowerCase() === 'llps')
  const prov = (await lib.brewPacks.list('cn-brew')).find((p) => p.sources.includes('llspell'))
  await lib.service.brewDelete('cn-brew', [prov.docIdLocal])
  return { set: 'cn-brew', prop: 'class', hash: cls.hash }
}, P)
await closeAll(); await settle(page, 300)
await tab('书架')
// 走真实入口：书架打开一本官方书 → 点第一条 → 栈顶是真正的详情页；再用同一个详情页组件打开灵能使那条
await page.locator('[data-testid="shelf-tab"] .trpg-shelf__row .lib-name').first().click()
await page.waitForSelector('[data-testid="pack-page"] [data-off]')
await page.locator('[data-testid="pack-page"] [data-off]').first().click()
await page.waitForFunction((P) => String(eval(P)._s.get('modal').top?.key ?? '').startsWith('entry:'), P)
await page.evaluate(([P, ref]) => {
  const m = eval(P)._s.get('modal')
  const top = m.top
  if (!top) { window.__noOpen = true; return }
  m.push({ ...top, key: `entry:${ref.set}:${ref.prop}:${ref.hash}`, title: '灵能使', props: { entryRef: ref } })
}, [P, ref])
check('能打开缺依赖条目的详情（测试入口）', !(await page.evaluate(() => window.__noOpen)), '')
await page.waitForSelector('[data-testid="entry-missing"]', { timeout: 60000 }).catch(() => null)
await page.waitForSelector('[data-testid="entry-dep-failed"]', { timeout: 60000 }).catch(() => null)
const miss = await page.locator('[data-testid="entry-missing"]').innerText().catch(() => '')
console.log('S4 后台状态：', JSON.stringify(await page.evaluate(async (P) => { const lib = eval(P)._s.get('app').svc().backend.library; return { tasks: lib.tasks.list().map((t) => [t.kind, t.set, t.status, t.progress?.stage]), queue: lib.precomputeQueue?.status?.() ?? null, ops: await lib.operations.list?.().catch?.(() => null) ?? null } }, P)))
await page.screenshot({ path: `${shots}/s4-missing-entry.png` })
check('缺依赖条目：说明需要的依赖包 llspell 和所在包，拉取失败时有【重试拉取】', /llspell/.test(miss) && /灵能使/.test(miss) && /重试拉取/.test(miss), miss.replace(/\n/g, ' | '))

// 调查：缺依赖状态下重读书架要多久（作者会对缺的来源反复报错）
const refreshMs = await page.evaluate(async (P) => { const ps = eval(P); const t = performance.now(); await ps._s.get('library').refresh(ps._s.get('app').svc()); return Math.round(performance.now() - t) }, P)
console.log('缺依赖状态下重读书架耗时（毫秒）：', refreshMs)
const real = errors.filter((e) => !/gendata-nav-adventure-book-index|网络错误|Network error|找不到物品(类型|属性)|Could not find prerelease\/brew URL/.test(e))
check('没有界面自己的页面错误（作者联网失败、已知导航索引、作者物品类型提示单列）', real.length === 0, real.join(' | '))
console.log('作者 / 网络类页面错误（单列，不算界面错误）：', errors.length - real.length)
await ctx.close(); server.close()
console.log(failures.length ? `FAIL ${failures.length}` : 'ALL PASS')
process.exit(failures.length ? 1 : 0)
