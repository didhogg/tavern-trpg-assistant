// P5 读档清单页（P4 侧拉存档窗里的「读取确认」）真实数据验证：
// 真实装好的中文官方资料里取一条真条目做引用，造出三种情形，再走真实界面（存档抽屉 → 读取）看清单：
//   ① 缺的包（引用了没装的自制包 cn-brew）→ 「缺的资料」块，默认勾上；
//   ② 包在但本战役关着（把玩家手册关掉）→ 「本战役关着」块，默认不勾；勾上再读取 → 战役里把它开启；
//   ③ 资料版本变了 → 只一行提示。
// 引用只改存档里的引用清单，条目内容与检查逻辑（checkSave）都是真的。用法：SKIP_BUILD=1 ENGINE=chrome|webkit node tests/e2e/library/p5-load-confirm.mjs
import { cp, rm } from 'node:fs/promises'
import { startStatic } from './static.mjs'
import { buildAll, engines, work } from './chain-common.mjs'
import { check, failures, settle } from '../helpers.mjs'

if (!process.env.SKIP_BUILD) await buildAll()
const engineName = process.env.ENGINE === 'webkit' ? 'webkit' : 'chrome'
const [, type, options] = engines.find((e) => e[0] === engineName)
const { server, url } = await startStatic({ port: 47318 })
const profile = `${work}/profile-p5lc-${engineName}`
await rm(profile, { recursive: true, force: true })
await cp(`${work}/profile-b2-8a-${engineName}`, profile, { recursive: true })
const shotDir = `${work}/p5-lc-shots-${engineName}`
await rm(shotDir, { recursive: true, force: true })
const ctx = await type.launchPersistentContext(profile, { ...options, viewport: { width: 1280, height: 800 } })
const page = await ctx.newPage()
page.setDefaultTimeout(120000)
const pageErrors = []
page.on('pageerror', (e) => pageErrors.push(String(e.message ?? e).slice(0, 200)))
await page.route((u) => !u.href.startsWith(url), (route) => route.abort())
await page.goto(url)
const pinia = `(() => { const h = document.querySelector('#trpg-assistant-root'); return [...h.shadowRoot.children].map((c) => c.__vue_app__).find(Boolean).config.globalProperties.$pinia })()`
await page.waitForFunction(`(${pinia}).then ? false : !!(${pinia})._s.get('app')?.booted`)
await page.locator('.trpg-ball').click()
await settle(page, 600)

await page.locator('.trpg-window nav').getByRole('button', { name: '库' }).click()
await page.waitForSelector('[data-testid="shelf-tab"] .trpg-shelf__row', { timeout: 120000 })
await settle(page, 600)
await page.locator('.trpg-nav', { hasText: '首页' }).click()
await settle(page, 400)
// ---- 造数据：开战役 → 加一个带真引用的人物 → 关掉玩家手册 → 存一个存档 ----
const made = await page.evaluate(async (P) => {
  const ps = eval(P)
  const camp = ps._s.get('campaign')
  const app = ps._s.get('app')
  await camp.startWith((s) => s.backend.starter.startCampaign({ ...camp.owner, ruleId: 'dnd5e2014', name: '读档清单测试', codeSet: 'cn' }))
  const be = app.svc().backend
  const ks = be.kernelSave
  const owner = camp.owner.ownerKey
  const cats = await be.library.service.categories('cn-official')
  const lvs = ps._s.get('library'); await lvs.load(app.svc(), owner)
  const rows = await be.library.scoped.query(await ks.libraryOf(owner), 'spell', { source: 'PHB', expand: true })
  const real = rows.find((r) => r.ref)?.ref
  if (!real) return { debug: JSON.stringify({ cats: Object.keys(cats).slice(0, 8), spell: cats.spell, n: rows.length, first: rows[0], lib: await ks.libraryOf(owner) }).slice(0, 600) }
  const hash = real.hash
  const realSet = real.set
  const kernel = await ks.read(owner)
  const next = {
    ...kernel,
    dataVersion: { ...kernel.dataVersion, official: 'old-version-for-e2e' },
    actors: [{ id: 'lc1', name: '清单测试人物', seed: 's', refs: [
      { kind: 'spell', set: realSet, prop: 'spell', hash, label: '真法术' },
      { kind: 'spell', set: 'en-official', prop: 'spell', hash: 'nothere', label: '缺包法术' },
    ] }],
  }
  await be.library.uninstallOfficial('en-official') // 本机副本里卸掉英文官方资料，造出"缺的包"
  await ks.bind(owner, next)
  return { owner, hash }
}, pinia)
if (made.debug) { console.log(made.debug); process.exit(2) }
check('造出了真引用', !!made.hash, made.hash)
// 把本战役里所有官方书都关掉（真引用所在的书也在里面 → 变成"包在但本战役关着"），再存档
const checkNow = await page.evaluate(async (P) => {
  const ps = eval(P)
  const camp = ps._s.get('campaign'); const app = ps._s.get('app'); const lv = ps._s.get('library')
  const owner = camp.owner.ownerKey
  await lv.load(app.svc(), owner)
  const changes = {}
  for (const g of lv.shelf.groups) for (const b of g.books) changes[b.source] = false
  await lv.applySources(app.svc(), owner, changes)
  const ks = app.svc().backend.kernelSave
  const saved = await ks.save(owner)
  const id = saved.workspace.currentSaveId
  // 让这份存档是"用旧版资料存的"：只改存档里记的资料版本号，其余都是真的
  const db = app.svc().db
  const row = await db.saves.get(id)
  row.snapshot.kernel.dataVersion = { ...row.snapshot.kernel.dataVersion, official: 'old-version-for-e2e' }
  await db.saves.put(row)
  await camp.refreshCurrentSave?.()
  const r = await ks.checkSave(id)
  await camp.branch('读档清单B') // 让「读档清单测试」那份不再是当前存档，才有「读取」按钮
  return { id, plan: r.plan }
}, pinia)
check('后端检查：缺的包有 en-official（官方）', checkNow.plan.download.some((d) => d.set === 'en-official' && d.kind === 'official'), JSON.stringify(checkNow.plan))
check('后端检查：真引用所在的关着的书出现在 closed', checkNow.plan.closed.length >= 1, JSON.stringify(checkNow.plan.closed))
check('后端检查：资料版本变了', checkNow.plan.versionChanged === true)

// ---- 走真实界面：存档抽屉 → 读取 ----
await page.locator('[data-testid="save-chip"]').click().catch(async () => { await page.locator('.trpg-nav', { hasText: '首页' }).click() })
await page.waitForSelector('[data-testid="save-drawer"]', { timeout: 30000 })
await settle(page, 500)
await page.locator('[data-testid="save-drawer"] button', { hasText: '读取' }).first().click()
await page.waitForSelector('[data-testid="load-confirm"] [data-testid="load-lead"]', { timeout: 30000 })
await page.waitForFunction(() => !document.querySelector('[data-testid="load-go"]')?.disabled, null, { timeout: 30000 })
await settle(page, 400)
const root = page.locator('[data-testid="load-confirm"]')
await page.screenshot({ path: `${shotDir}/load-confirm.png` })
check('有「缺的资料」块', (await root.locator('[data-testid="load-download"]').count()) === 1)
check('缺的资料：默认勾上', (await root.locator('[data-testid="load-download"] [role="checkbox"], [data-testid="load-download"] input[type="checkbox"]').first().evaluate((e) => e.getAttribute('aria-checked') === 'true' || e.checked)) === true)
check('有「本战役关着」块', (await root.locator('[data-testid="load-closed"]').count()) === 1)
const closedBox = root.locator('[data-testid="load-closed"] [role="checkbox"], [data-testid="load-closed"] input[type="checkbox"]').first()
check('本战役关着：默认不勾', (await closedBox.evaluate((e) => e.getAttribute('aria-checked') === 'true' || e.checked)) === false)
check('资料版本变了：只一行提示', (await root.locator('[data-testid="load-changed"]').count()) === 1 && /版本变了/.test(await root.locator('[data-testid="load-changed"]').innerText()))
check('读取按钮可点', (await root.locator('[data-testid="load-go"]').isEnabled()) === true)
// 取消勾选「缺的资料」，免得真去联网下载
await root.locator('[data-testid="load-download"] [role="checkbox"], [data-testid="load-download"] input[type="checkbox"]').first().click()

// 勾上「关着的」再读取 → 战役里这本书被开启
await closedBox.click()
await settle(page, 200)
await root.locator('[data-testid="load-go"]').click()
await page.waitForFunction(() => !document.querySelector('[data-testid="load-confirm"]'), null, { timeout: 60000 })
await settle(page, 1500)
const after = await page.evaluate(async (P) => {
  const ps = eval(P)
  const camp = ps._s.get('campaign'); const app = ps._s.get('app'); const lv = ps._s.get('library')
  await lv.load(app.svc(), camp.owner.ownerKey)
  return { lib: lv.campaignLib }
}, pinia)
check('读取后：勾的那本书（PHB）在战役里开启了', after.lib.include.includes('src:phb') && !after.lib.exclude.includes('src:phb'), JSON.stringify({ include: after.lib.include }))
check('没有页面报错', pageErrors.length === 0, pageErrors.join(' | '))
console.log(failures.length ? `FAIL ${failures.length}` : 'ALL PASS', `截图：${shotDir}/load-confirm.png`)
await ctx.close(); server.close()
process.exit(failures.length ? 1 : 0)
