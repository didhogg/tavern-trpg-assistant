// P3-1 验证（D2-P3 整体设计 §2、§5）：真实作者程序 + 真实中文官方数据，走一遍"按战役看【库】"：
//  书目（范围归属、在不在本战役、原因）· 导入预览 → 确认 · 同编号挂备选（原件照常生效）· 房规（本战役生效 / 复原）·
//  版本选择三层 · 取条目（缺失原因）· 搜索（2014 显示旧版）· 文字转条目（旧版风格）· 写新条目 · 模板 · 导出 · 冒险按本下载 · 取消下载 · 体检
// Chrome 与 WebKit 各跑一遍（ENGINE=chrome 只跑一种）。固定端口 + 固定浏览器资料夹（与 ⓪ 探路共用，中文官方只装一次）。
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { build } from 'vite'
import { chromium, webkit } from 'playwright-core'
import { root, startStatic } from './static.mjs'

const work = `${root}work/e2e-lib`
await mkdir(work, { recursive: true })
await build({ configFile: `${root}vite.config.ts`, root, logLevel: 'error' })
await build({ configFile: false, root, logLevel: 'error', build: {
  lib: { entry: `${root}tests/e2e/library/harness.ts`, formats: ['es'], fileName: () => 'harness.js' },
  outDir: work, emptyOutDir: false,
} })
const { server, url } = await startStatic({ port: 47319 })
const engines = [
  ['chrome', chromium, { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true }],
  ['webkit', webkit, { headless: true }],
]

// 测试夹具（作者自制格式）
const meta = (json, extra = {}) => ({ sources: [{ json, abbreviation: json, full: `测试 ${json}`, authors: ['test'], version: '1' }], dateAdded: 0, dateLastModified: 0, ...extra })
const spell = (name, source, level, text) => ({ name, source, page: 0, level, school: 'V', time: [{ number: 1, unit: 'action' }], range: { type: 'point', distance: { type: 'self' } }, components: { v: true }, duration: [{ type: 'instant' }], entries: [text] })
const FILES = [
  { name: 'p31-a.json', text: JSON.stringify({ _meta: meta('P31A'), spell: [spell('测试飞弹', 'P31A', 1, '甲包版本')] }) },
  { name: 'p31-b.json', text: JSON.stringify({ _meta: meta('P31B'), spell: [spell('测试飞弹', 'P31A', 2, '乙包版本'), spell('火球术', 'PHB', 3, '补丁版火球术')] }) },
  { name: 'p31-c.json', text: JSON.stringify({ _meta: meta('P31C', { dependencies: { spell: ['PHB'] } }), spell: [{ name: '冰球术', source: 'P31C', _copy: { name: '火球术', source: 'PHB', _mod: { entries: { mode: 'appendArr', items: '冰球版' } } } }] }) },
  { name: 'p31-d.json', text: JSON.stringify({ _meta: meta('P31D', { edition: 'one' }), spell: [spell('丁包法术', 'P31D', 1, '丁')] }) },
]
const CONVERT = ['测试冰锥', '1环 塑能', '施法时间：1 动作', '施法距离：60 尺', '成分：V、S', '持续时间：立即', '一道冰锥射向目标，造成 {@damage 3d6} 点寒冷伤害。'].join('\n')

async function run(page) {
  return page.evaluate(async ({ FILES, CONVERT }) => {
    const h = await import('/work/e2e-lib/harness.js')
    const out = {}
    const set = await h.offlineAudit('cn-official')
    if (set.set?.status !== 'installed' || set.ok !== set.planFiles) await h.install('cn-official')
    h.service.reset()
    // 收拾上次留下的（测试包、可编辑自制）
    const old = (await h.service.brewInstalled('cn-brew')).filter((b) => b.head.filename?.startsWith('p31-') || b.head.isEditable)
    if (old.length) await h.service.brewDelete('cn-brew', old.map((b) => b.head.docIdLocal))
    for (const l of await h.scoped.manage.houseRules()) await h.scoped.manage.unlinkHouseRule(l.house)
    for (const lv of ['global', 'rule:dnd5e2014']) for (const k of Object.keys(await h.scoped.manage.choices(lv))) await h.scoped.manage.setChoice(lv, k, null)
    for (const u of (await h.scoped.manage.assignments()).keys()) await h.scoped.manage.setAssignment(u, null)
    h.scoped.reset()

    let c = h.defaultCampaignLibrary('dnd5e2014', 'cn')
    const spellRef = async (name, source) => {
      const p = await h.service.parsed('cn-official', 'spell')
      const i = p.items.findIndex((it, j) => it.name === name && p.sources[j] === source)
      return { set: 'cn-official', prop: 'spell', hash: p.hashes[i] }
    }
    const fireball = await spellRef('火球术', 'PHB')
    const fireballX = await spellRef('火球术', 'XPHB')

    // ① 导入预览 → 确认
    out.preview = await h.custom.previewImport('cn', FILES)
    out.kvAfterPreview = (await h.kvDump()).filter((r) => r.scope.includes(':preview:')).length
    out.import = await h.service.brewImport('cn-brew', FILES)
    h.scoped.reset()

    // ② 书目
    const cat = await h.scoped.catalog(c)
    const row = (src) => cat.find((r) => r.kind === 'book' && r.source.toLowerCase() === src.toLowerCase())
    out.catalog = Object.fromEntries(['PHB', 'XPHB', 'DMG', 'P31A', 'P31D'].map((s) => [s, row(s) && { view: row(s).view, basis: row(s).membership.basis, scopes: row(s).membership.assignment?.scopes, count: row(s).count, alternatives: row(s).alternatives, name: row(s).name }]))
    out.adventureRows = cat.filter((r) => r.kind === 'adventure').length

    // ③ 改归类：P31D（新版）设为全局通用；排除 DMG
    out.assignPreview = await h.scoped.previewAssignment('cn', 'src:p31d', { scopes: [], global: true })
    await h.scoped.setAssignment('src:p31d', { scopes: [], global: true })
    c = { ...c, exclude: ['src:dmg'] }
    const cat2 = await h.scoped.catalog(c)
    out.afterAssign = { P31D: cat2.find((r) => r.source === 'P31D')?.view, DMG: cat2.find((r) => r.source === 'DMG')?.view }

    // ④ 同编号挂备选：火球术 PHB 原件照常生效
    const q = await h.scoped.query(c, 'spell', { source: 'PHB' })
    const fbRow = q.find((r) => r.ref.hash === fireball.hash)
    out.fireballQuery = { text: JSON.stringify(fbRow?.item?.entries).slice(0, 30), version: fbRow?.version }
    const fbDetail = await h.scoped.detail(c, fireball)
    out.fireballDetail = { base: JSON.stringify(fbDetail.base.entries).slice(0, 20), alts: fbDetail.alternatives.map((a) => ({ altId: a.altId.slice(0, 4), filename: a.filename, text: JSON.stringify(a.item.entries) })), english: fbDetail.english?.status }
    const probeQ = await h.scoped.query(c, 'spell', { source: 'P31A' })
    out.probeMissile = probeQ.map((r) => ({ level: r.item.level, version: r.version }))
    const ice = (await h.scoped.query(c, 'spell', { source: 'P31C' }))[0]
    out.iceBall = { has: JSON.stringify(ice?.item?.entries ?? '').includes('冰球版'), copy: !!ice?.item?._copy }

    // ⑤ 房规：本战役立即生效；别的战役不受影响；复原
    const house = await h.custom.createHouseRule(c, fireball, { mod: { entries: { mode: 'appendArr', items: '房规：伤害改为 10d6' } } })
    c = house.campaign
    const other = h.defaultCampaignLibrary('dnd5e2014', 'cn')
    const hd = await h.scoped.detail(c, fireball)
    out.houseRule = {
      altId: house.altId.slice(0, 6),
      here: { has10d6: JSON.stringify(hd.item.entries).includes('10d6'), version: hd.version, alts: hd.alternatives.map((a) => a.kind) },
      other: (await h.scoped.fetch(other, [fireball]))[0].version,
      houseHiddenInList: !(await h.scoped.query(c, 'spell', { source: 'TRPGHOUSE' })).length,
    }
    // 规则层选补丁包 → 没选过的战役用补丁；本战役仍是房规（本战役优先）
    const patchAlt = fbDetail.alternatives.find((a) => a.kind === 'collision').altId
    await h.scoped.choose(other, fireball, patchAlt, 'rule:dnd5e2014')
    out.ruleLevel = { other: (await h.scoped.fetch(other, [fireball]))[0].version, here: (await h.scoped.fetch(c, [fireball]))[0].version }
    c = await h.scoped.choose(c, fireball, 'base')
    out.restored = (await h.scoped.fetch(c, [fireball]))[0]
    out.restored = { version: out.restored.version, text: JSON.stringify(out.restored.item.entries).slice(0, 20) }
    await h.scoped.choose(other, fireball, null, 'rule:dnd5e2014')

    // ⑥ 取条目：缺失原因
    const fetched = await h.scoped.fetch(c, [fireball, fireballX, { set: 'cn-official', prop: 'spell', hash: 'nope_phb' }, { set: 'en-official', prop: 'spell', hash: 'x' }])
    out.fetch = fetched.map((f) => (f.ok ? 'ok' : f.reason))

    // ⑦ 搜索：2014 战役显示旧版，只留本战役的
    const hits = await h.scoped.search(c, '火球术')
    out.search = { phb: hits.some((x) => x.ref.hash === fireball.hash), xphb: hits.some((x) => x.ref.hash === fireballX.hash), n: hits.length }

    // ⑧ 文字转条目（旧版风格）→ 存成新条目 → 查得到；模板；导出
    const conv = await h.custom.convert(c, 'spell', 'text', CONVERT)
    out.convert = { name: conv.outputs[0]?.name, tags: JSON.stringify(conv.outputs[0]?.entries), warnings: conv.warnings }
    await h.custom.saveEntry('cn', 'spell', conv.outputs[0])
    h.scoped.reset()
    out.savedVisible = (await h.scoped.query(c, 'spell', { source: 'TRPGMINE' })).map((r) => r.item.name)
    out.template = (await h.custom.template('cn', 'spell'))?.name
    out.templateNone = await h.custom.template('cn', 'feat')
    out.converters = await h.custom.converters('cn')
    const editable = (await h.service.brewInstalled('cn-brew')).find((b) => b.head.isEditable)
    const exported = await h.custom.exportBrew('cn', editable.head.docIdLocal)
    out.export = { props: Object.keys(exported.body), sources: exported.body._meta.sources.map((s) => s.json), deps: exported.body._meta.dependencies }
    out.scopesExport = await h.custom.exportScopes()

    // ⑨ 删房规 → 选过它的回到原件并标出
    c = await h.scoped.choose(c, fireball, house.altId)
    await h.custom.deleteHouseRule('cn', house.house, house.uniqueId)
    out.houseDeleted = (await h.scoped.fetch(c, [fireball]))[0].version

    // ⑩ 下载任务：冒险按本下载；官方安装可取消
    const adv = (await h.scoped.adventures({ id: 'cn-official', codeSet: 'cn', kind: 'official' }))[0]
    const t1 = h.tasks.startAdventure('cn-official', adv.id)
    out.adventure = { id: adv.id, task: await h.tasks.wait(t1) }
    out.adventure.task = { status: out.adventure.task.status, error: out.adventure.task.error, result: out.adventure.task.result }
    out.adventure.downloadedAfter = (await h.scoped.adventures({ id: 'cn-official', codeSet: 'cn', kind: 'official' })).find((a) => a.id === adv.id)?.downloaded
    out.adventure.corpus = !!(await h.service.corpus('cn-official', 'adventure', adv.id).catch(() => null))
    const t2 = h.tasks.startOfficial('en-official')
    h.tasks.cancel(t2)
    const r2 = await h.tasks.wait(t2)
    out.cancel = { status: r2.status, cancelled: r2.result?.cancelled ?? null, set: (await h.offlineAudit('en-official')).set?.status }

    // ⑪ 体检
    h.service.reset()
    out.health = (await h.service.health()).items.filter((i) => i.check.startsWith('brew-alternatives') && i.source === 'cn-brew').map((i) => ({ check: i.check, level: i.level, count: i.count }))

    // 收拾
    const mine = (await h.service.brewInstalled('cn-brew')).filter((b) => b.head.filename?.startsWith('p31-') || b.head.isEditable)
    await h.service.brewDelete('cn-brew', mine.map((b) => b.head.docIdLocal))
    await h.scoped.setAssignment('src:p31d', null)
    out.frameFailures = h.failures()
    return out
  }, { FILES, CONVERT })
}

const verdict = (o) => ({
  previewListsAlternatives: o.preview?.alternatives?.length === 2 && o.preview.files.length === 4 && o.kvAfterPreview === 0,
  catalog: o.catalog.PHB?.view.visible && o.catalog.PHB.basis === 'author' && o.catalog.XPHB?.view.reason === 'out-of-scope' && o.catalog.P31A?.view.visible && o.catalog.P31D?.view.reason === 'out-of-scope' && o.catalog.PHB.alternatives >= 1,
  assign: o.afterAssign.P31D?.reason === 'global' && o.afterAssign.DMG?.reason === 'excluded',
  baseStaysOfficial: !o.fireballQuery.text.includes('补丁版') && o.fireballQuery.version.altId === 'base' && o.fireballQuery.version.count === 1,
  alternativeHasPatch: o.fireballDetail.alts.some((a) => a.text.includes('补丁版火球术')) && o.fireballDetail.english !== undefined,
  brewVsBrewEarlierWins: o.probeMissile.length === 1 && o.probeMissile[0].level === 1 && o.probeMissile[0].version.count === 1,
  copyOfOriginal: o.iceBall.has && !o.iceBall.copy,
  houseRule: o.houseRule.here.has10d6 && o.houseRule.here.version.by === 'campaign' && o.houseRule.other.altId === 'base' && o.houseRule.houseHiddenInList,
  ruleLevel: o.ruleLevel.other.by === 'rule' && o.ruleLevel.other.altId.startsWith('pack:') && o.ruleLevel.here.by === 'campaign',
  restore: o.restored.version.altId === 'base' && !o.restored.text.includes('补丁版'),
  fetchReasons: JSON.stringify(o.fetch) === JSON.stringify(['ok', 'ok', 'not-found', 'not-installed']), // B-32/B-34：范围外的已下载默认也能取
  search: o.search.phb && o.search.xphb, // B-32：范围外的已下载默认也能搜到
  convertClassic: o.convert.name === '测试冰锥' && !o.convert.tags.includes('|XPHB'),
  savedEntry: o.savedVisible.includes('测试冰锥'),
  template: o.template === '新法术' && o.templateNone === null,
  export: o.export.props.includes('spell') && o.export.sources.includes('TRPGMINE'),
  houseDeletedFallsBack: o.houseDeleted.altId === 'base' && !!o.houseDeleted.missing,
  adventure: o.adventure.task.status === 'done' && o.adventure.downloadedAfter && o.adventure.corpus,
  cancel: o.cancel.status === 'cancelled' && o.cancel.set === 'cancelled',
  health: o.health.some((i) => i.check === 'brew-alternatives' && i.count >= 2) && !o.health.some((i) => i.check === 'brew-alternatives-errors'),
})

const results = []
for (const [name, type, options] of engines) {
  if (process.env.ENGINE && process.env.ENGINE !== name) continue
  const profile = `${work}/profile-p3-1-${name}`
  if (process.env.KEEP === '0') await rm(profile, { recursive: true, force: true })
  const ctx = await type.launchPersistentContext(profile, options)
  const page = await ctx.newPage()
  page.setDefaultTimeout(3600000)
  const errors = []
  page.on('pageerror', (e) => errors.push(e.stack.split('\n').slice(0, 2).join(' | ')))
  page.on('console', (m) => { if (m.text().startsWith('[progress]') && !/ download /.test(m.text())) console.log(m.text()) })
  const r = { engine: name }
  try {
    await page.goto(url)
    r.out = await run(page)
    r.verdict = verdict(r.out)
    r.passed = Object.values(r.verdict).every(Boolean)
  } catch (e) { r.fatal = e.stack; r.passed = false } finally { r.errors = errors; await ctx.close() }
  results.push(r)
  await writeFile(`${work}/p3-1-${name}.json`, JSON.stringify(r, null, 2))
  console.log(name, r.passed ? 'PASS' : 'FAIL', JSON.stringify(r.verdict ?? r.fatal))
}
server.close()
process.exit(results.every((r) => r.passed) ? 0 : 1)
