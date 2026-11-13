// P5.5 B8 + U2/U3 的本机局部验证：真实构建的插件 + 已装中英官方数据的旧测试资料夹副本，断网。
// 复制成我的（整本两份）→ 自己的包 / 复制件里连着改 → 保存耗时、后台解析次数、「更新中」→ 解析后内容 → 撤销、整包选用、导出。
// 用法：SKIP_BUILD=1 node tests/e2e/library/p55-c-b8.mjs。结果写进 work/e2e-lib/p55-c-b8-chrome.json。约 4–6 分钟。
import { cp, rm, writeFile } from 'node:fs/promises'
import { startStatic } from './static.mjs'
import { buildAll, engines, work } from './chain-common.mjs'
import { check, failures } from '../helpers.mjs'

if (!process.env.SKIP_BUILD) await buildAll()
const [, type, options] = engines[0]
const { server, url } = await startStatic({ port: 47318 })
const profile = `${work}/profile-p55c-b8-chrome`
await rm(profile, { recursive: true, force: true })
await cp(`${work}/profile-b2-8a-chrome`, profile, { recursive: true })
const ctx = await type.launchPersistentContext(profile, { ...options, viewport: { width: 1280, height: 800 } })
const page = await ctx.newPage()
page.setDefaultTimeout(480000)
const pageErrors = []
page.on('pageerror', (e) => pageErrors.push(String(e.message ?? e).slice(0, 200)))
await page.route((u) => !u.href.startsWith(url), (route) => route.abort())
await page.goto(url)
await page.waitForFunction(() => { const h = document.querySelector('#trpg-assistant-root'); const app = [...(h?.shadowRoot?.children ?? [])].map((c) => c.__vue_app__).find(Boolean); return app?.config.globalProperties.$pinia._s.get('app')?.booted })

const r = await page.evaluate(async () => {
  const host = document.querySelector('#trpg-assistant-root')
  const app = [...host.shadowRoot.children].map((c) => c.__vue_app__).find(Boolean)
  const lib = app.config.globalProperties.$pinia._s.get('app').svc().backend.library
  const c = { rule: 'dnd5e2014', codeSet: 'cn', scopes: ['5e2014'], include: [], exclude: [], choices: {} }
  const T = () => Math.round(performance.now())
  const reparses = async () => (await lib.db.ops.toArray()).filter((o) => o.kind === 'brew-reparse' && ['done', 'partial'].includes(o.status)).length
  const out = {}
  // 复制成我的：玩家手册两份
  let t = T(); const copy1 = await lib.custom.saveToMine('cn', { kind: 'source', source: 'PHB' }); out.copy1Ms = T() - t
  const copy2 = await lib.custom.saveToMine('cn', { kind: 'source', source: 'PHB' })
  // P5.5 C1 抄全：《失落矿坑》毒牙 = 《怪物图鉴》年轻绿龙 + 换名字；复制件里应是完整的一条
  { const c = await lib.custom.saveToMine('cn', { kind: 'source', source: 'LMoP' }); const b = (await lib.custom.exportPack('cn', c.id)).body; const v = (b.monster ?? []).find((m) => /venomfang/i.test(m.ENG_name ?? m.name)); out.lmop = { flattened: c.flattened, failed: c.flattenFailed.length, crossCopies: (b.monster ?? []).filter((m) => m._copy && String(m._copy.source).toLowerCase() !== 'lmop').length, deps: b._meta.dependencies ?? null, veno: v ? { name: v.name, hasCopy: !!v._copy, hp: v.hp, ac: !!v.ac, action: (v.action ?? []).length } : null } }
  out.copies = [copy1.id, copy2.id]
  await lib.custom.createPack('cn', { json: 'P55OWN', full: '我的测试包', abbreviation: 'OWN' }, { rule: 'dnd5e2014' })
  out.packs = (await lib.custom.packs('cn')).map((p) => ({ id: p.id, own: p.own.full, n: p.entryCount, scopes: p.scopes }))
  await lib.brewQueue.settled('cn')
  const before = await reparses()
  // 自己的包里连存 5 条
  const sp = (n, lv = 1) => ({ name: `P55连存术${n}`, level: lv, school: 'V', time: [{ number: 1, unit: 'action' }], range: { type: 'point', distance: { type: 'self' } }, components: { v: true }, duration: [{ type: 'instant' }], entries: ['x'] })
  out.ownSaves = []
  let last
  for (let i = 1; i <= 5; i++) { t = T(); last = await lib.custom.saveEntry('cn', 'spell', sp(i), { pack: 'p55own', rule: 'dnd5e2014' }); out.ownSaves.push(T() - t) }
  out.lastPending = last.pending
  out.pendingNow = await lib.custom.pending('cn')
  // 复制件里连改 5 次（同一条火球术）
  const row = (await lib.service.query('cn-official', 'spell', {})).find((x) => x.item?.name === '火球术')
  const ref = { set: 'cn-official', prop: 'spell', hash: row.hash }
  const got = await lib.custom.packEntry('cn', copy2.id, 'spell', { hash: row.hash })
  out.copySaves = []
  let uid = got.entity.uniqueId
  for (let lv = 5; lv <= 9; lv++) {
    t = T()
    const s = await lib.custom.saveEntry('cn', 'spell', { ...got.entity, uniqueId: uid, level: lv }, { pack: copy2.id, ...(lv === 5 && !got.hadId ? { replaceHash: got.hash } : {}) })
    uid = s.uniqueId
    out.copySaves.push(T() - t)
  }
  // 整包选用副本 2，解析前详情带「更新中」
  const c2 = await lib.custom.choosePack(c, copy2.id)
  const d0 = await lib.scoped.detail(c2, ref)
  out.beforeParse = { pending: !!d0?.pending }
  t = T(); await lib.brewQueue.settled('cn'); out.bgWait = T() - t
  out.reparses = (await reparses()) - before
  out.opKinds = Object.entries((await lib.db.ops.toArray()).reduce((m, o) => { const k = `${o.kind}:${o.status}`; m[k] = (m[k] ?? 0) + 1; return m }, {}))
  const d1 = await lib.scoped.detail(c2, ref)
  out.afterParse = { pending: !!d1?.pending, level: d1?.item?.level, by: d1?.version?.altId }
  out.pendingAfter = await lib.custom.pending('cn')
  // 自己包里的 5 条都在
  lib.scoped.reset()
  out.ownRows = (await lib.service.query('cn-brew', 'spell', {})).filter((x) => /^P55连存术/.test(x.item?.name ?? '')).length
  // 撤销一次（回到 8 环），再解析后看到
  await lib.custom.undo('cn', 'spell', uid)
  await lib.brewQueue.settled('cn')
  out.afterUndo = (await lib.scoped.detail(c2, ref))?.item?.level
  // 取消整包选用：回到官方
  const c3 = await lib.custom.choosePack(c2, copy2.id, { on: false })
  out.afterUnpick = (await lib.scoped.detail(c3, ref))?.item?.level
  // 导出副本 2：包头两行来源、没有运行时字段
  const ex = await lib.custom.exportPack('cn', copy2.id)
  out.export = { sources: ex.body._meta.sources.map((s) => s.json), hasUniqueId: (ex.body.spell ?? []).some((e) => 'uniqueId' in e), fireball: (ex.body.spell ?? []).find((e) => e.name === '火球术')?.level }
  return out
})

await writeFile(`${work}/p55-c-b8-chrome.json`, JSON.stringify({ r, pageErrors }, null, 1))
const o = r
check('复制成我的：玩家手册两份是两个包，版本标签照原书', o.copies[0] !== o.copies[1] && o.packs.filter((p) => /玩家手册（副本/.test(p.own)).length === 2 && o.packs.every((p) => p.scopes.length), JSON.stringify(o.packs))
check('复制时抄全（C1）：失落矿坑里指向别的书的条目都拼成完整的（毒牙有生命值、护甲、动作，没有 _copy），不再声明依赖', o.lmop.flattened >= 1 && o.lmop.failed === 0 && o.lmop.crossCopies === 0 && o.lmop.veno && !o.lmop.veno.hasCopy && o.lmop.veno.hp && o.lmop.veno.ac && o.lmop.veno.action > 0, JSON.stringify(o.lmop))
check('自己的包里连存 5 条：每次几秒内，不当场解析', o.ownSaves.every((ms) => ms < 6000) && o.lastPending === true, JSON.stringify(o.ownSaves))
check('复制件里连改 5 次：每次几秒内（不再每次整份重解析）', o.copySaves.every((ms) => ms < 8000), JSON.stringify(o.copySaves))
check('后台解析前：条目带「更新中」，脏的包列得出', o.beforeParse.pending && o.pendingNow.packs.includes('p55own'), JSON.stringify({ b: o.beforeParse, p: o.pendingNow }))
check('连着改 10 次，后台只解析了很少几次（停手后批量）', o.reparses >= 1 && o.reparses <= 3, String(o.reparses))
check('后台解析后：整包选用副本 2，火球术是改后的 9 环，不再「更新中」', o.afterParse.level === 9 && !o.afterParse.pending && /phb_copy2/.test(o.afterParse.by ?? '') && o.pendingAfter.packs.length === 0, JSON.stringify(o.afterParse))
check('自己包里存的 5 条都在', o.ownRows === 5, String(o.ownRows))
check('撤销一次：回到 8 环', o.afterUndo === 8, String(o.afterUndo))
check('取消整包选用：回到官方 3 环', o.afterUnpick === 3, String(o.afterUnpick))
check('导出副本 2：包头 = 原来源 + 复制件自己的一行；没有运行时字段；带着改过的内容', JSON.stringify(o.export.sources) === JSON.stringify(['PHB', 'PHB_COPY2']) && !o.export.hasUniqueId && o.export.fireball === 8, JSON.stringify(o.export))
// 断网时作者程序联网取目录 / 冒险书索引失败的报错是预期的；取文件清单的小窗里作者报的 3 条物品类型（见执行方案 §13）
const realErrors = pageErrors.filter((m) => !/网络错误|Network error|gendata-nav-adventure-book-index|找不到物品类型|找不到物品属性/.test(m))
check('页面没有未处理的错误（断网预期的除外）', realErrors.length === 0, realErrors.slice(0, 2).join(' | '))
await page.waitForTimeout(3000)
await ctx.close()
server.close()
console.log(failures.length ? `FAIL ${failures.length}` : 'ALL PASS')
process.exit(failures.length ? 1 : 0)
