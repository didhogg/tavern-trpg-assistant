// P5.5 阶段 A（数据格式登记 / 版本标签 / 导入认格式）的本机局部验证：真实构建的插件 + 已装中英官方数据的旧测试资料夹副本，断网。
// 用法：SKIP_BUILD=1 node tests/e2e/library/p55-a-format.mjs（不设 SKIP_BUILD 会先构建）。结果写进 work/e2e-lib/p55-a-format-chrome.json。
import { cp, rm, writeFile } from 'node:fs/promises'
import { startStatic } from './static.mjs'
import { buildAll, engines, work } from './chain-common.mjs'
import { check, failures } from '../helpers.mjs'

if (!process.env.SKIP_BUILD) await buildAll()
const [, type, options] = engines[0]
const { server, url } = await startStatic({ port: 47318 })
const profile = `${work}/profile-p55a-chrome`
await rm(profile, { recursive: true, force: true })
await cp(`${work}/profile-b2-8a-chrome`, profile, { recursive: true })
const ctx = await type.launchPersistentContext(profile, { ...options, viewport: { width: 1280, height: 800 } })
const page = await ctx.newPage()
page.setDefaultTimeout(300000)
const pageErrors = []
page.on('pageerror', (e) => pageErrors.push(String(e.message ?? e).slice(0, 200)))
await page.route((u) => !u.href.startsWith(url), (route) => route.abort())
await page.goto(url)
await page.waitForFunction(() => { const h = document.querySelector('#trpg-assistant-root'); const app = [...(h?.shadowRoot?.children ?? [])].map((c) => c.__vue_app__).find(Boolean); return app?.config.globalProperties.$pinia._s.get('app')?.booted })

const r = await page.evaluate(async () => {
  const host = document.querySelector('#trpg-assistant-root')
  const app = [...host.shadowRoot.children].map((c) => c.__vue_app__).find(Boolean)
  const lib = app.config.globalProperties.$pinia._s.get('app').svc().backend.library
  const spell = (name, source) => ({ name, source, level: 1, school: 'V', time: [{ number: 1, unit: 'action' }], range: { type: 'point', distance: { type: 'self' } }, components: { v: true }, duration: [{ type: 'instant' }], entries: ['x'] })
  const meta = (json, edition) => ({ sources: [{ json, abbreviation: json, full: json, authors: ['t'], convertedBy: ['t'], version: '1.0.0' }], dateAdded: 1, dateLastModified: 1, ...(edition ? { edition } : {}) })
  const noEd = { name: 'p55-noed.json', text: JSON.stringify({ _meta: meta('P55NOED'), spell: [spell('无版本术', 'P55NOED')] }) }
  const one = { name: 'p55-one.json', text: JSON.stringify({ _meta: meta('P55ONE', 'one'), spell: [spell('新版术', 'P55ONE')] }) }
  const foundry = { name: 'foundry-item.json', text: JSON.stringify({ name: '火球术', type: 'spell', system: {}, _stats: { systemId: 'dnd5e', systemVersion: '6.1.0' } }) }
  const out = {}
  // A1：按资料集取校验器
  out.validateOk = (await lib.custom.validate('cn', JSON.parse(one.text))).ok
  out.validateEntryIssues = (await lib.custom.validateEntry('cn', 'spell', { name: 'x', level: 'bad' })).map((i) => i.path)
  // A3：预览和导入都先认格式
  const pre = await lib.custom.previewImport('cn', [noEd, foundry])
  out.preview = { files: pre.files.map((f) => f.filename), rejected: pre.rejected }
  try { await lib.service.brewImport('cn-brew', [foundry]); out.onlyForeign = 'no-throw' } catch (e) { out.onlyForeign = String(e.message ?? e) }
  const imp = await lib.service.brewImport('cn-brew', [noEd, one, foundry])
  out.importLog = (await lib.logs.list({ kind: 'brew-import-author-errors' })).length
  out.import = { ok: imp.ok, added: imp.value.added.length, rejected: imp.rejected, errors: imp.errors }
  // A2：我的库里没写版本的 → 未归类；写了 one 的 → 新版
  lib.scoped.reset()
  out.editions = await lib.scoped.editions('cn', ['P55NOED', 'P55ONE'])
  // A2：新写的条目跟规则走（2024 → 5.5e 的默认范围）
  const saved = await lib.custom.saveEntry('cn', 'spell', spell('跟版本术', 'TRPGMINE'), { rule: 'dnd5e2024' })
  const assigns = await lib.scoped.manage.assignments()
  out.saved = { hash: saved.hash, assignment: assigns.get(`ent:cn-brew:spell:${saved.hash}`) ?? null }
  lib.scoped.reset()
  out.mineEdition = (await lib.scoped.editions('cn', ['TRPGMINE'])).TRPGMINE
  // 小修③：改名时指向它的房规跟着改指，链接搬到新编号
  const c = { rule: 'dnd5e2014', codeSet: 'cn', scopes: ['5e2014'], include: [], exclude: [], choices: {} }
  const base = await lib.custom.saveEntry('cn', 'spell', spell('改名前术', 'TRPGMINE'), { rule: 'dnd5e2014' })
  const target = { set: 'cn-brew', prop: 'spell', hash: base.hash }
  const hr = await lib.custom.createHouseRule(c, target, { mod: { entries: { mode: 'appendArr', items: '房规加一句' } } }, { activate: false })
  const re = await lib.custom.saveEntry('cn', 'spell', { ...spell('改名后术', 'TRPGMINE'), uniqueId: base.uniqueId })
  const doc = await (await lib.service.frameOf('cn')).call('editableDoc')
  const houseEnt = (doc.body.spell ?? []).find((e) => e.uniqueId === hr.uniqueId)
  const link = (await lib.scoped.manage.houseRules()).find((l) => l.house.hash === hr.house.hash)
  // P5.5 U2 起编辑只写原文、后台解析：读作者合并结果前先等后台
  await lib.brewQueue.settled('cn')
  const merged = await lib.service.storedItem('cn-brew', 'spell', hr.house.hash)
  out.rename = { renamed: re.renamed, houseCopy: houseEnt?._copy ?? null, linkTarget: link?.target.hash ?? null, mergedLevel: merged?.item?.level ?? null, mergedEntries: merged?.item?.entries ?? null }
  return out
})

await writeFile(`${work}/p55-a-format-chrome.json`, JSON.stringify({ r, pageErrors }, null, 1))
check('A1 按资料集取校验器：合格包通过', r.validateOk === true, '')
check('A1 单条校验只留这一条的错', r.validateEntryIssues.length > 0 && r.validateEntryIssues.every((p) => p.startsWith('/spell/0')), r.validateEntryIssues.join(','))
check('A3 预览：5etools 包进预览，Foundry 文件被拒并说明', r.preview.files.length === 1 && r.preview.rejected.length === 1 && /Foundry VTT（规则系统 dnd5e）/.test(r.preview.rejected[0].reason), JSON.stringify(r.preview))
check('A3 只给外来文件：报错、不导入', /没有可以导入的文件/.test(r.onlyForeign), r.onlyForeign)
check('A3 混着导：收 2 个、拒 1 个', r.import.added === 2 && r.import.rejected.length === 1, JSON.stringify(r.import))
check('小修①：断网导入成功就算成功（作者容忍的取索引失败不算失败）', r.import.ok === true, `errors ${r.import.errors.length}`)
check('小修①：作者另报的错记进日志（设置→库→日志能看到）', r.importLog >= 1, String(r.importLog))
check('A2 我的库里没写版本的自制：未归类（不猜旧版）', r.editions.P55NOED?.classic === null, JSON.stringify(r.editions.P55NOED))
check('A2 写了 edition: one 的：判为新版', r.editions.P55ONE?.classic === false, JSON.stringify(r.editions.P55ONE))
check('A2 新写条目按 2024 规则归到 5e2024', JSON.stringify(r.saved.assignment) === JSON.stringify({ scopes: ['5e2024'], global: false }), JSON.stringify(r.saved))
check('A2「我的资料」来源本身未归类（版本看单条）', r.mineEdition?.classic === null, JSON.stringify(r.mineEdition))
check('小修③：改名返回新旧编号，指向它的 1 条房规已改指', r.rename.renamed?.retargeted === 1 && r.rename.renamed?.from.hash !== r.rename.renamed?.to.hash, JSON.stringify(r.rename.renamed))
check('小修③：房规的 _copy 指向新名字', r.rename.houseCopy?.name === '改名后术', JSON.stringify(r.rename.houseCopy))
check('小修③：房规链接的目标搬到新编号', r.rename.linkTarget === r.rename.renamed?.to.hash, `${r.rename.linkTarget}`)
check('小修③：作者能合并出房规（原件的数值 + 房规加的一句）', r.rename.mergedLevel === 1 && JSON.stringify(r.rename.mergedEntries ?? []).includes('房规加一句'), JSON.stringify({ l: r.rename.mergedLevel, e: r.rename.mergedEntries }))
// 断网时作者程序联网取目录 / 冒险书索引失败的报错是预期的（同 p5-download-ui.mjs），不算
const realErrors = pageErrors.filter((m) => !/网络错误|Network error|gendata-nav-adventure-book-index/.test(m))
check('页面没有未处理的错误（断网预期的除外）', realErrors.length === 0, realErrors.slice(0, 2).join(' | '))
await ctx.close()
server.close()
console.log(failures.length ? `FAIL ${failures.length}` : 'ALL PASS')
process.exit(failures.length ? 1 : 0)
