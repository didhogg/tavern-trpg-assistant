// 关着的条目只是「选不到」（驾驶员 2026-11-17）：选东西的入口 = 全局数据库搜索同一份结果；点详情能看；已进结算内核的照常结算。
// 真实插件 + 真实库 + 真实结算小窗。开着建一个用刺剑的人 → 关掉：单条（刺剑、半兽人、箭术）、整本书（MM）、一个提供火球术同编号版本的自制包
// → 全局搜索 / 建卡列表 / 额外候选 / 从模板加入都看不到；详情能看；读档后刺剑攻击结果和关之前一样 → 再开回来都出现。
// 用法：ENGINE=chrome|webkit node tests/e2e/library/p6-closed-pickers.mjs（SKIP_BUILD=1 跳过构建）；9 分钟强制结束。
import { writeFile } from 'node:fs/promises'
import { startStatic } from './static.mjs'
import { buildAll, E2E_PORT, engines, freshFromBase, work } from './chain-common.mjs'
import { check, failures, settle } from '../helpers.mjs'

const killer = setTimeout(() => { console.error('超时 9 分钟'); process.exit(2) }, 9 * 60_000)
if (!process.env.SKIP_BUILD) await buildAll()
const engine = process.env.ENGINE === 'webkit' ? 'webkit' : 'chrome'
const [, type, options] = engines.find((e) => e[0] === engine)
const { server, url } = await startStatic({ port: E2E_PORT })
const profile = freshFromBase(engine, 'p6-closed') // 克隆干净底座，跑完自动删（KEEP_PROFILE=1 保留）
const ctx = await type.launchPersistentContext(profile, { ...options, viewport: { width: 1280, height: 800 } })
const page = await ctx.newPage(); page.setDefaultTimeout(150_000)
const errors = []
page.on('pageerror', (e) => errors.push(String(e.message ?? e).slice(0, 300)))
const pinia = `(() => { const h = document.querySelector('#trpg-assistant-root'); return [...h.shadowRoot.children].map((c) => c.__vue_app__).find(Boolean).config.globalProperties.$pinia })()`
const out = {}
const ev = (body, arg) => page.evaluate(`(async (arg) => { const ps = (${pinia}); const app = ps._s.get('app'); const be = app.svc().backend; const camp = ps._s.get('campaign'); const owner = camp.owner.ownerKey\n${body} })(${JSON.stringify(arg ?? null)})`)

// 选东西的各入口现在看到什么（全局搜索 / 建卡列表 / 额外候选）+ 详情；refs 是上一步找出的编号
const PROBE = `
  const lib = await be.kernelSave.libraryOf(owner)
  const has = (rows, ref) => rows.some((r) => r.ref?.set === ref.set && r.ref?.prop === ref.prop && r.ref?.hash === ref.hash)
  const r = arg.refs
  const search = await be.library.scoped.search(lib, '刺剑')
  const fire = await be.library.scoped.search(lib, '火球术', { expand: true })
  const fireByType = await be.library.scoped.query(lib, 'spell', { source: 'PHB', expand: true })
  const races = await be.library.scoped.query(lib, 'race') // 选种族的列表（和全局搜索同一份结果）
  const opts = await be.people.buildOptions(owner, { items: [r.human, r.acolyte, r.fighter], blank: true })
  const cands = (opts.items ?? []).flatMap((it) => (it.extras ?? []).flatMap((x) => x.candidates ?? []))
  const detail = await be.library.scoped.detail(lib, r.rapier, { browse: true }) // 和详情页同一个调用（EntryPage.vue）
  return {
    searchRapier: has(search, r.rapier),
    fireballPackVariant: fire.some((h) => h.variant?.docIdLocal === r.packDoc),
    fireballPackVariantByType: fireByType.some((h) => h.variant?.docIdLocal === r.packDoc),
    raceHalfOrc: has(races, r.halfOrc),
    extrasArchery: has(cands, r.archery),
    extrasCount: cands.length,
    detailRapier: detail && !('hidden' in detail) ? { closed: !!detail.closed } : detail,
  }`

// 「从模板加入」界面：搜「地精」，列出来源为 MM 的行数
async function templateGoblinsMM() {
  await page.getByRole('button', { name: '新建', exact: true }).click()
  await page.getByRole('menuitem', { name: /从模板加入/ }).click()
  await page.getByTestId('template-page').waitFor()
  await page.getByTestId('tp-search').fill('地精'); await settle(page, 800)
  const n = await page.getByTestId('tp-row').filter({ has: page.locator('.lib-src', { hasText: /^MM$/ }) }).count()
  await page.locator('.trpg-modal__close').click(); await settle(page, 500)
  return n
}

try {
  await page.goto(url)
  await page.waitForFunction(`!!(${pinia})._s.get('app')?.booted`)
  await page.locator('.trpg-ball').click(); await settle(page, 500)
  // ---- 造数据：官方资料、一个提供火球术同编号版本的自制包、真实战役、一个用刺剑的人 ----
  out.refs = await page.evaluate(async (P) => {
    for (const id of ['cn-official', 'en-official']) { const h0 = await import('/work/e2e-lib/harness.js'); const a = await h0.offlineAudit(id); if (a.set?.status !== 'installed' || a.ok !== a.planFiles) await h0.install(id) }
    const ps = eval(P); const camp = ps._s.get('campaign'); const app = ps._s.get('app'); const be = app.svc().backend
    await camp.startWith((s) => s.backend.starter.startCampaign({ ...camp.owner, ruleId: 'dnd5e2014', name: '停用入口测试', codeSet: 'cn' }))
    await be.kernel.enter(camp.owner.ownerKey)
    const lib = await be.kernelSave.libraryOf(camp.owner.ownerKey)
    const phb = async (prop, name) => (await be.library.scoped.query(lib, prop, { source: 'PHB' })).find((x) => x.item.name === name)
    const fireball = await phb('spell', '火球术')
    const copy = structuredClone((await be.library.scoped.storedItem(fireball.ref)).item)
    copy.entries = ['测试备选包里的火球术版本。', ...(copy.entries ?? [])]
    const pack = { _meta: { sources: [{ json: 'TestAltPack', abbreviation: 'TAP', full: '测试备选包', authors: ['测试者'], version: '1.0.0' }], dateAdded: 1, dateLastModified: 1 }, spell: [copy] }
    await be.library.bilingual.importFiles([{ name: '测试者; 测试备选包.json', text: JSON.stringify(pack) }]); await be.library.brewQueue.settled()
    const variants = await be.library.scoped.search(lib, '火球术', { expand: true })
    const packDoc = variants.find((h) => h.variant?.kind === 'collision')?.variant?.docIdLocal ?? null
    const refs = { fireball: fireball.ref, packDoc, rapier: (await phb('item', '刺剑')).ref, human: (await phb('race', '人类')).ref, halfOrc: (await phb('race', '半兽人')).ref,
      acolyte: (await phb('background', '侍僧')).ref, fighter: (await phb('class', '战士')).ref, archery: (await phb('optionalfeature', '箭术')).ref }
    return refs
  }, pinia)
  check('造数据：找到全部测试条目，自制包的火球术成了同编号版本', Object.values(out.refs).every(Boolean), JSON.stringify(out.refs))
  await page.locator('.trpg-window nav').getByRole('button', { name: '人物', exact: true }).click()
  await page.waitForSelector('[data-testid=people-view]'); await settle(page, 600)

  const ATTACK = `
    const sheet = await be.people.sheet(owner, arg.id)
    const weapon = sheet.result.items.find((i) => /^(刺剑|Rapier)$/.test(i.name)) // 结算内核按英文建，人物身上的物品名是英文
    const at = await be.people.attempt(owner, arg.id, 'attack', arg.id, weapon._id ?? weapon.id, [20, 4, 4, 4, 4, 4, 4, 4])
    await be.people.cancel(owner, [arg.id])
    const totals = []; const walk = (x) => { if (x && typeof x === 'object') for (const [k, v] of Object.entries(x)) k === 'total' && typeof v === 'number' ? totals.push(v) : walk(v) }; walk(at.outcome.result)
    return { status: at.outcome.status, error: at.outcome.error ?? null, totals }`
  out.built = await ev(`
    const b = await be.people.build(owner, { name: '刺剑手', items: [arg.refs.human, arg.refs.acolyte, arg.refs.fighter], blank: true, equipment: [arg.refs.rapier] }, { category: 'party' })
    return { status: b.built.status, id: b.built.id, error: b.built.error ?? null }`, { refs: out.refs })
  check('开着时建好用刺剑的人', out.built.status === 'complete', JSON.stringify(out.built))
  out.attackBefore = await ev(ATTACK, { id: out.built.id })
  check('开着时刺剑能攻击', out.attackBefore.status === 'complete' && out.attackBefore.totals.length > 0, JSON.stringify(out.attackBefore))

  out.open1 = await ev(PROBE, { refs: out.refs })
  out.open1.template = await templateGoblinsMM()
  const shown = (p) => p.searchRapier && p.fireballPackVariant && p.fireballPackVariantByType && p.raceHalfOrc && p.extrasArchery && p.template > 0
  check('开着时：各入口都能选到（刺剑、自制火球术版本、半兽人、箭术、MM 地精）', shown(out.open1), JSON.stringify(out.open1))

  // ---- 关掉：单条三个、整本 MM、自制包（它声明的来源）----
  out.lib = await ev(`
    const lib = await be.kernelSave.libraryOf(owner)
    const unit = (ref) => 'ent:' + ref.set + ':' + ref.prop + ':' + ref.hash
    const off = { ...lib, exclude: [...lib.exclude, unit(arg.refs.rapier), unit(arg.refs.halfOrc), unit(arg.refs.archery), 'src:mm', 'src:testaltpack'] }
    await be.kernelSave.setLibrary(owner, off)
    return lib`, { refs: out.refs })
  out.closed = await ev(PROBE, { refs: out.refs })
  out.closed.template = await templateGoblinsMM()
  const c = out.closed
  check('关掉后全局搜索搜不到刺剑', !c.searchRapier, JSON.stringify(c))
  check('关掉自制包后，全局搜索和按类别列都不再列出它的火球术版本', !c.fireballPackVariant && !c.fireballPackVariantByType, JSON.stringify(c))
  check('关掉后选种族的列表里没有半兽人', !c.raceHalfOrc, JSON.stringify(c))
  check('关掉后建卡额外候选里没有箭术（其他候选照常）', !c.extrasArchery && c.extrasCount > 0, JSON.stringify(c))
  check('关掉 MM 后从模板加入搜不到 MM 的地精', c.template === 0, String(c.template))
  check('关掉后点详情照常能看（标「已关闭」）', c.detailRapier?.closed === true, JSON.stringify(c.detailRapier))
  // 已进结算内核的照常结算：重进战役（关窗重读存档）后攻击结果一样
  out.reload = await ev(`await be.kernel.close(owner); return (await be.people.load(owner)).map((x) => x.status)`)
  check('关掉后读档成功', out.reload.length > 0 && out.reload.every((s) => s === 'complete'), JSON.stringify(out.reload))
  out.attackAfter = await ev(ATTACK, { id: out.built.id })
  check('关掉刺剑后，已有人物读档后刺剑攻击结果和关之前一样', out.attackAfter.status === 'complete' && JSON.stringify(out.attackAfter.totals) === JSON.stringify(out.attackBefore.totals), JSON.stringify({ before: out.attackBefore, after: out.attackAfter }))

  // ---- 再开回来 ----
  await ev(`await be.kernelSave.setLibrary(owner, arg.lib); return true`, { lib: out.lib })
  out.open2 = await ev(PROBE, { refs: out.refs })
  out.open2.template = await templateGoblinsMM()
  check('再开回来：各入口都重新出现', shown(out.open2), JSON.stringify(out.open2))
} catch (e) {
  check('测试流程没中断', false, String(e?.stack ?? e).slice(0, 900))
} finally {
  const known = (e) => /gendata-nav-adventure-book-index|window dimensions|status of 404|api\/plutonium|KERNEL_NEEDS_INPUT|homebrew|unearthed-arcana/.test(e)
  out.errors = errors.filter((e) => !known(e)).slice(0, 10)
  check('没有未解释的页面报错', out.errors.length === 0, out.errors.join(' | ').slice(0, 500))
  await writeFile(`${work}/p6-closed-pickers-${engine}.json`, JSON.stringify(out, null, 1))
  clearTimeout(killer); await ctx.close(); server.close()
  console.log(failures.length ? `FAILED ${failures.length}` : 'ALL PASS')
  process.exit(failures.length ? 1 : 0)
}
