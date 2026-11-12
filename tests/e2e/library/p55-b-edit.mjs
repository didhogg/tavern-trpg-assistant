// P5.5 阶段 B（字段说明表 / 房规只记改动 / 撤销 / 自己的包）的本机局部验证：真实构建的插件 + 已装中英官方数据的旧测试资料夹副本，断网。
// 用法：SKIP_BUILD=1 node tests/e2e/library/p55-b-edit.mjs（不设 SKIP_BUILD 会先构建）。结果写进 work/e2e-lib/p55-b-edit-chrome.json。
import { cp, rm, writeFile } from 'node:fs/promises'
import { startStatic } from './static.mjs'
import { buildAll, engines, work } from './chain-common.mjs'
import { check, failures } from '../helpers.mjs'

if (!process.env.SKIP_BUILD) await buildAll()
const [, type, options] = engines[0]
const { server, url } = await startStatic({ port: 47318 })
const profile = `${work}/profile-p55b-chrome`
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
  const backend = app.config.globalProperties.$pinia._s.get('app').svc().backend
  const lib = backend.library
  const c = { rule: 'dnd5e2014', codeSet: 'cn', scopes: ['5e2014'], include: [], exclude: [], choices: {} }
  const editable = async () => (await (await lib.service.frameOf('cn')).call('editableDoc')).body
  const out = {}
  // B4：字段说明表在真实插件里按网址加载
  const sf = await lib.custom.fields('cn', 'spell')
  out.fields = { spell: sf?.fields.length ?? 0, level: sf?.fields.find((f) => f.name === 'level') ?? null, bgEdition: (await lib.custom.fields('cn', 'background'))?.edition ?? null }
  // B1：改一条官方法术，只存改的那项
  const rows = await lib.service.query('cn-official', 'spell', {})
  const row = rows.find((x) => typeof x.item?.level === 'number' && x.item.level > 0 && Array.isArray(x.item.entries))
  const target = { set: 'cn-official', prop: 'spell', hash: row.hash }
  const base = (await lib.service.storedItem('cn-official', 'spell', row.hash)).item
  const hr = await lib.custom.createHouseRule(c, target, { edited: { ...structuredClone(base), level: base.level + 1 } }, { activate: false })
  const houseRaw = (await editable()).spell.find((e) => e.uniqueId === hr.uniqueId)
  const merged = (await lib.service.storedItem('cn-brew', 'spell', hr.house.hash))?.item
  out.house = { changed: hr.changed, rawKeys: Object.keys(houseRaw).sort(), mergedLevel: merged?.level, baseLevel: base.level, sameEntries: JSON.stringify(merged?.entries) === JSON.stringify(base.entries) }
  try { await lib.custom.createHouseRule(c, target, { edited: structuredClone(base) }, { activate: false }); out.noChange = 'no-throw' } catch (e) { out.noChange = String(e.message ?? e) }
  // B1：新背景按 2024 规则写上 edition
  const bg = await lib.custom.saveEntry('cn', 'background', { name: 'P55新背景', entries: ['x'] }, { rule: 'dnd5e2024' })
  out.bgEdition = (await editable()).background.find((e) => e.uniqueId === bg.uniqueId)?.edition ?? null
  // B2：存 3 次 → 撤销 3 次
  const sp = (lvl) => ({ name: 'P55撤销术', level: lvl, school: 'V', time: [{ number: 1, unit: 'action' }], range: { type: 'point', distance: { type: 'self' } }, components: { v: true }, duration: [{ type: 'instant' }], entries: ['x'] })
  const s1 = await lib.custom.saveEntry('cn', 'spell', sp(1))
  await lib.custom.saveEntry('cn', 'spell', { ...sp(2), uniqueId: s1.uniqueId })
  await lib.custom.saveEntry('cn', 'spell', { ...sp(3), uniqueId: s1.uniqueId })
  const levelNow = async () => (await editable()).spell.find((e) => e.uniqueId === s1.uniqueId)?.level ?? null
  const seq = [await levelNow()]
  await lib.custom.undo('cn', 'spell', s1.uniqueId); seq.push(await levelNow())
  await lib.custom.undo('cn', 'spell', s1.uniqueId); seq.push(await levelNow())
  await lib.custom.undo('cn', 'spell', s1.uniqueId); seq.push(await levelNow())
  out.undo = { seq, left: await lib.custom.undoSteps('cn', 'spell', s1.uniqueId) }
  // B2：删掉再撤销
  const s2 = await lib.custom.saveEntry('cn', 'spell', sp(1))
  await lib.custom.deleteEntries('cn', 'spell', [s2.uniqueId])
  const goneAfterDelete = !(await editable()).spell.some((e) => e.uniqueId === s2.uniqueId)
  await lib.custom.undo('cn', 'spell', s2.uniqueId)
  out.undoDelete = { goneAfterDelete, back: (await editable()).spell.some((e) => e.uniqueId === s2.uniqueId) }
  // B3：建包 → 先看影响 → 挪条目（房规跟着改指）→ 按包导出
  const pack = await lib.custom.createPack('cn', { json: 'P55PACK', full: 'P55 测试包', abbreviation: 'P55' }, { rule: 'dnd5e2024' })
  const hr2 = await lib.custom.createHouseRule(c, { set: 'cn-brew', prop: 'spell', hash: s2.hash }, { edited: { ...sp(1), source: 'TRPGMINE', level: 9 } }, { activate: false })
  out.impact = await backend.entryChangeImpact('cn-brew', [{ prop: 'spell', hash: s2.hash }]).then((x) => ({ houseRules: x.houseRules.length, choices: x.choices.length, saves: x.saves.length }))
  const moved = await lib.custom.moveEntries('cn', 'spell', [s2.uniqueId], 'P55PACK')
  const doc = await editable()
  out.move = { renamed: moved[0]?.renamed ?? null, source: doc.spell.find((e) => e.uniqueId === s2.uniqueId)?.source, houseCopy: doc.spell.find((e) => e.uniqueId === hr2.uniqueId)?._copy ?? null }
  const packs = await lib.custom.packs('cn')
  out.packs = packs.find((p) => p.json === 'P55PACK') ?? null
  const ex = await lib.custom.exportPack('cn', 'P55PACK')
  out.export = { filename: ex.filename, meta: ex.body._meta, spells: (ex.body.spell ?? []).length, hasUniqueId: (ex.body.spell ?? []).some((e) => 'uniqueId' in e) }
  out.exportValid = (await lib.custom.validate('cn', ex.body)).ok
  try { await lib.custom.createPack('cn', { json: 'PHB', full: 'x', abbreviation: 'x' }); out.taken = 'no-throw' } catch (e) { out.taken = String(e.message ?? e) }
  return { out, pack }
})

const o = r.out
await writeFile(`${work}/p55-b-edit-chrome.json`, JSON.stringify({ r, pageErrors }, null, 1))
check('B4 字段说明表在插件里能读到：法术环阶必填整数，背景能自带版本', o.fields.spell > 0 && o.fields.level?.required === true && o.fields.level?.types?.[0] === 'integer' && o.fields.bgEdition === true, JSON.stringify(o.fields))
check('B1 房规只存改的那项（环阶）+ _copy', JSON.stringify(o.house.changed) === '["level"]' && JSON.stringify(o.house.rawKeys) === JSON.stringify(['_copy', 'level', 'name', 'source', 'uniqueId']), JSON.stringify(o.house))
check('B1 作者合并后：环阶是新的，正文还是原件的', o.house.mergedLevel === o.house.baseLevel + 1 && o.house.sameEntries, JSON.stringify(o.house))
check('B1 和原件一样：拒绝', /没有改动/.test(o.noChange), o.noChange)
check('B1 新背景按 2024 规则写上 edition: one', o.bgEdition === 'one', String(o.bgEdition))
check('B2 存 3 次再撤销 3 次：3 → 2 → 1 → 没有这一条', JSON.stringify(o.undo.seq) === JSON.stringify([3, 2, 1, null]) && o.undo.left === 0, JSON.stringify(o.undo))
check('B2 删掉的撤销：加回来', o.undoDelete.goneAfterDelete && o.undoDelete.back, JSON.stringify(o.undoDelete))
check('B3 影响清单：列出指向它的房规', o.impact.houseRules === 1, JSON.stringify(o.impact))
check('B3 换包：来源变成新包，编号变了，房规的 _copy 改指新包', o.move.source === 'P55PACK' && o.move.renamed?.retargeted === 1 && o.move.houseCopy?.source === 'P55PACK', JSON.stringify(o.move))
check('B3 列包：新包里 1 条法术', o.packs?.counts?.spell === 1, JSON.stringify(o.packs))
check('B3 按包导出：作者格式、版本 one、没有运行时字段、能通过结构校验', o.export.meta?.sources?.[0]?.json === 'P55PACK' && o.export.meta?.edition === 'one' && o.export.spells === 1 && !o.export.hasUniqueId && o.exportValid, JSON.stringify(o.export) + ' valid ' + o.exportValid)
check('B3 编号撞已有的书：拒绝', /已经有书或包在用/.test(o.taken), o.taken)
// 断网时作者程序联网取目录 / 冒险书索引失败的报错是预期的（同 p5-download-ui.mjs），不算
const realErrors = pageErrors.filter((m) => !/网络错误|Network error|gendata-nav-adventure-book-index/.test(m))
check('页面没有未处理的错误（断网预期的除外）', realErrors.length === 0, realErrors.slice(0, 2).join(' | '))
await ctx.close()
server.close()
console.log(failures.length ? `FAIL ${failures.length}` : 'ALL PASS')
process.exit(failures.length ? 1 : 0)
