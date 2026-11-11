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
let dropHits = 0
await ctx.route((u) => !u.href.startsWith(url), (r) => {
  const u = r.request().url()
  // drop.json：第一次（预览）正常给文件，之后（正式安装）断网，模拟下载到一半网断了
  if (u.startsWith(`${FIX}drop.json`)) return dropHits++ === 0 ? r.fulfill({ path: `${work}/fixtures/weapon4.json`, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' } }) : r.abort('internetdisconnected')
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
  cat.rows = [{ zh: f('dull-wizard.json', 'Sample - Giddy; 《乏味巫师指南》.json'), en: null, status: 'zh-only' }, { zh: f('drop.json', 'Sample - Giddy; 断网测试包.json'), en: null, status: 'zh-only' }, { zh: f('psion.json', 'LaserLlama; 灵能使（测试副本）.json'), en: null, status: 'zh-only' }]
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

// S4 读不到的条目（所在的包没装）：按删除预览把法术合集和灵能使一起删掉，再打开灵能使的旧条目
const ref = await page.evaluate(async (P) => {
  const be = eval(P)._s.get('app').svc().backend, lib = be.library
  const cls = (await lib.service.query('cn-brew', 'class', {})).find((x) => String(x.source).toLowerCase() === 'llps')
  const prov = (await lib.brewPacks.list('cn-brew')).find((p) => p.sources.includes('llspell'))
  await be.removalExecute(await be.removalImpact({ kind: 'brew', setId: 'cn-brew', docIdLocals: [prov.docIdLocal] }))
  return { set: 'cn-brew', prop: 'class', hash: cls.hash }
}, P)
await closeAll(); await settle(page, 300)
await tab('书架')
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
check('能打开读不到的条目（用详情页同一组件）', !(await page.evaluate(() => window.__noOpen)), '')
await page.waitForSelector('[data-testid="entry-missing"] button', { timeout: 60000 })
await settle(page, 600)
const miss = await page.locator('[data-testid="entry-missing"]').innerText()
await page.screenshot({ path: `${shots}/s4-missing-entry.png` })
check('读不到的条目：说明来自没装的自制包（来源 llps）并给【下载这个包】', /没装的自制包/.test(miss) && /llps/i.test(miss) && /下载这个包/.test(miss), miss.replace(/\n/g, ' | '))
await page.locator('[data-testid="entry-missing"] button', { hasText: '下载这个包' }).click()
await page.waitForFunction(() => /重试下载/.test(document.querySelector('#trpg-assistant-root').shadowRoot.querySelector('[data-testid="entry-missing"]')?.textContent ?? ''), null, { timeout: 60000 }).catch(() => null)
const miss2 = await page.locator('[data-testid="entry-missing"]').innerText()
check('断网时点下载：说明原因并变成【重试下载】，不会一直转圈', /重试下载/.test(miss2), miss2.replace(/\n/g, ' | '))
await closeAll(); await settle(page, 300)

// S5 下载到一半断网：主文件取到了，依赖索引取不到 → 这次准备版本作废，书架不多东西；横幅带【重试】，按钮回到「下载」
await page.evaluate((P) => { const n = eval(P)._s.get('libnotice'); for (const x of [...n.notices]) n.dismiss(x.key); const d = eval(P)._s.get('downloads'); for (const i of d.failedAll) d.dismiss(i.key) }, P)
const packsBefore = await page.evaluate(async (P) => (await eval(P)._s.get('app').svc().backend.library.brewPacks.list('cn-brew')).length, P)
await tab('下载')
await page.waitForSelector('[data-testid="brew-list"]')
await page.locator('[data-testid="brew-list"] .trpg-row', { hasText: '灵能使（测试副本）' }).getByRole('button', { name: '下载' }).click()
await page.waitForSelector('[data-testid="dependency-preview"]')
await page.locator('[data-testid="dependency-preview"] .trpg-btn--primary', { hasText: '下载' }).click()
// 等这一行的按钮回到「下载」（下载结束），最多 2 分钟；结束后再按包名找它自己的横幅
await page.waitForFunction(() => [...document.querySelector('#trpg-assistant-root').shadowRoot.querySelectorAll('[data-testid="brew-list"] .trpg-row')].find((r) => r.textContent.includes('灵能使（测试副本）'))?.querySelector('button')?.textContent.trim() === '下载', null, { timeout: 120000 }).catch(() => null)
await settle(page, 600)
const banner = (await page.locator('[data-testid="download-banners"] [role="alert"]', { hasText: '灵能使（测试副本）' }).allInnerTexts()).join(' / ')
const btn = await page.locator('[data-testid="brew-list"] .trpg-row', { hasText: '灵能使（测试副本）' }).getByRole('button').innerText()
const packsAfter = await page.evaluate(async (P) => (await eval(P)._s.get('app').svc().backend.library.brewPacks.list('cn-brew')).length, P)
await page.screenshot({ path: `${shots}/s5-download-interrupted.png` })
check('下载到一半断网（主文件取到、依赖取不到）：顶部横幅按包名说明没下完，带【重试】', /没有/.test(banner) && /重试/.test(banner), banner.replace(/\n/g, ' | ').slice(0, 300))
check('下载到一半断网：下了一半的包没有进本机（包数不变）', packsAfter === packsBefore, `${packsBefore} → ${packsAfter}`)
check('下载到一半断网：按钮回到「下载」，不会停在「下载中…」', btn.trim() === '下载', btn)

// S5b 预览时有网、正式下载主文件时断网：什么都不装，下载失败横幅带【重试】，【库】图标亮警告
await page.locator('[data-testid="brew-list"] .trpg-row', { hasText: '断网测试包' }).getByRole('button', { name: '下载' }).click()
await page.waitForSelector('[data-testid="dependency-preview"]')
await page.locator('[data-testid="dependency-preview"] .trpg-btn--primary', { hasText: '下载' }).click()
await page.waitForFunction(() => [...document.querySelector('#trpg-assistant-root').shadowRoot.querySelectorAll('[data-testid="brew-list"] .trpg-row')].find((r) => r.textContent.includes('断网测试包'))?.querySelector('button')?.textContent.trim() === '下载', null, { timeout: 120000 }).catch(() => null)
await settle(page, 600)
const dropBanner = (await page.locator('[data-testid="download-banners"] [role="alert"]', { hasText: '断网测试包' }).allInnerTexts()).join(' / ')
const ring = await page.evaluate((P) => eval(P)._s.get('downloads').ring, P)
const packsAfterDrop = await page.evaluate(async (P) => (await eval(P)._s.get('app').svc().backend.library.brewPacks.list('cn-brew')).length, P)
await page.screenshot({ path: `${shots}/s5b-main-file-dropped.png` })
check('正式下载时断网：横幅说明没下完并带【重试】', /没有/.test(dropBanner) && /重试/.test(dropBanner), dropBanner.replace(/\n/g, ' | ').slice(0, 300))
check('正式下载时断网：什么都没装（包数不变）、【库】图标亮警告', packsAfterDrop === packsAfter && ring === 'warn', `${packsAfter} → ${packsAfterDrop}，ring=${ring}`)

// S6 导入一个依赖缺失的文件（法术合集已删）：被拦下，横幅点名缺的依赖并给【下载依赖包】【重试】
await tab('我的库')
await page.waitForSelector('[data-testid="mylib-file"]', { state: 'attached' })
await page.locator('[data-testid="mylib-file"]').setInputFiles(`${work}/fixtures/psion.json`)
await page.waitForSelector('[data-testid="confirm-page"]')
await page.locator('.trpg-confirm__actions .trpg-btn--primary').click()
await page.waitForSelector('[data-testid="lib-notice"]:has-text("导入文件")', { timeout: 120000 })
await settle(page, 600)
const notice = await page.locator('[data-testid="lib-notice"]', { hasText: '导入文件' }).innerText()
const packsAfterImport = await page.evaluate(async (P) => (await eval(P)._s.get('app').svc().backend.library.brewPacks.list('cn-brew')).length, P)
await page.screenshot({ path: `${shots}/s6-import-missing-dep.png` })
check('导入缺依赖的文件：横幅点名 llspell，给【下载依赖包】【重试】', /llspell/.test(notice) && /下载依赖包/.test(notice) && /重试/.test(notice), notice.replace(/\n/g, ' | '))
check('导入缺依赖的文件：没有装进来（包数不变）', packsAfterImport === packsAfter, `${packsAfter} → ${packsAfterImport}`)

// 调查：缺依赖状态下重读书架要多久（作者会对缺的来源反复报错）
const refreshMs = await page.evaluate(async (P) => { const ps = eval(P); const t = performance.now(); await ps._s.get('library').refresh(ps._s.get('app').svc()); return Math.round(performance.now() - t) }, P)
console.log('缺依赖状态下重读书架耗时（毫秒）：', refreshMs)
const real = errors.filter((e) => !/gendata-nav-adventure-book-index|网络错误|Network error|找不到物品(类型|属性)|Could not find prerelease\/brew URL|无法加载 \d+ 个条目的引用/.test(e))
check('没有界面自己的页面错误（作者联网失败、已知导航索引、作者物品类型提示单列）', real.length === 0, real.join(' | '))
console.log('作者 / 网络类页面错误（单列，不算界面错误）：', errors.length - real.length)
await ctx.close(); server.close()
console.log(failures.length ? `FAIL ${failures.length}` : 'ALL PASS')
process.exit(failures.length ? 1 : 0)
