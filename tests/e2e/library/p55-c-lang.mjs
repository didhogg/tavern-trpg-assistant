// P5.5 C2–C10 双语自制与下拉中文选项的本机局部验证：真实构建的插件 + 已装中英官方数据的旧测试资料夹副本，断网。
// 用法：SKIP_BUILD=1 node tests/e2e/library/p55-c-lang.mjs（不设 SKIP_BUILD 会先构建）。结果写进 work/e2e-lib/p55-c-lang-chrome.json。
import { cp, rm, writeFile } from 'node:fs/promises'
import { startStatic } from './static.mjs'
import { buildAll, engines, work } from './chain-common.mjs'
import { check, failures } from '../helpers.mjs'

if (!process.env.SKIP_BUILD) await buildAll()
const [, type, options] = engines[0]
const { server, url } = await startStatic({ port: 47318 })
const profile = `${work}/profile-p55lang-chrome`
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
  const b = lib.bilingual
  const out = {}
  out.step = 'start'
  try {
  out.step = '// C10'
  // C10：下拉 / 建议值的显示名（中文小窗 → 作者中文对照表）
  const unitOf = async (cs) => { const t = await lib.custom.fields(cs, 'spell'); const d = (s) => (s && s.ref ? t.defs[s.ref] : s); const time = d(t.fields.find((x) => x.name === 'time').shape); return d(time.of).props.find((p) => p.name === 'unit').shape }
  const zhUnit = await unitOf('cn')
  out.labels = { suggest: zhUnit.suggest, zh: zhUnit.labels ?? null, en: (await unitOf('en')).labels ?? null }
  // 学派：作者结构定义给了代号建议值（A / V …），中文小窗给作者中文名、英文小窗给英文名
  const schoolOf = async (cs) => { const t = await lib.custom.fields(cs, 'spell'); const s = t.fields.find((x) => x.name === 'school').shape; return s.ref ? t.defs[s.ref] : s }
  const zs = await schoolOf('cn')
  out.school = { c: zs.c, suggest: zs.suggest, zh: zs.labels ?? null, en: (await schoolOf('en')).labels ?? null }
  out.step = '// C2 / C3'
  // C2 / C3：中文建包 → 加英文版 → 列成一行
  await lib.custom.createPack('cn', { json: 'P55LANG', full: '双语测试包', abbreviation: 'L' })
  out.add = await b.addLanguage('cn', 'p55lang')
  const row = (await b.packs()).find((p) => p.id === 'p55lang')
  out.row = row ? { zh: !!row.zh, en: !!row.en } : null
  out.step = '// 中文存一条'
  // 中文存一条；C7 英文存一条（英文那边的包已在）
  const base = { level: 1, school: 'V', time: [{ number: 1, unit: 'action' }], range: { type: 'point', distance: { type: 'feet', amount: 150 } }, components: { v: true }, duration: [{ type: 'instant' }] }
  const zh = await lib.custom.saveEntry('cn', 'spell', { name: '火焰鹦鹉', ENG_name: 'Fire Parrot', ...base, entries: ['一团燃烧的羽毛从你指尖飞出。'] }, { pack: 'p55lang' })
  await b.saveInLanguage('en', 'p55lang', 'spell', { name: 'Fire Parrot', ...base, level: 2, entries: ['A burst of burning feathers.'] })
  out.step = '// C7 另一边'
  // C7 另一边还没有包：中文建的 SOLO 包，直接存英文 → 自动建英文包
  await lib.custom.createPack('cn', { json: 'P55SOLO', full: '单语测试包', abbreviation: 'S' })
  await b.saveInLanguage('en', 'p55solo', 'spell', { name: 'Solo Spell', ...base, entries: ['x'] })
  out.soloRow = (await b.packs()).find((p) => p.id === 'p55solo') ? { zh: !!(await b.packs()).find((p) => p.id === 'p55solo').zh, en: !!(await b.packs()).find((p) => p.id === 'p55solo').en } : null
  await lib.brewQueue.settled()
  out.step = '// C6'
  // C6：中文这一条在英文里的原文
  const other = await b.otherEntry('cn', 'p55lang', 'spell', { uniqueId: zh.uniqueId })
  out.other = { state: other.state, name: other.entity?.name ?? null, reason: other.reason }
  out.step = '// C9 / C8'
  // C9 / C8
  const mine = (await lib.custom.packEntry('cn', 'p55lang', 'spell', { uniqueId: zh.uniqueId })).entity
  out.mismatch = other.entity ? await b.mismatches('cn', 'spell', mine, other.entity) : null
  const plan = other.entity ? b.fillPlan('cn', { name: '火焰鹦鹉' }, other.entity) : null
  out.plan = plan ? { onlyEmpty: plan.onlyEmpty.map((c) => c.field), filled: b.fill('cn', { name: '火焰鹦鹉' }, other.entity, 'onlyEmpty').ENG_name } : null
  out.step = '// C4'
  // C4：导入按语言分开
  const files = [{ name: 'zh.json', text: JSON.stringify({ _meta: { sources: [{ json: 'P55IMP', full: '导入', abbreviation: 'I', authors: [], version: '1' }], dateAdded: 0, dateLastModified: 0 }, spell: [{ name: '甲', ENG_name: 'A', source: 'P55IMP', ...base, entries: ['甲'] }] }) }, { name: 'en.json', text: JSON.stringify({ _meta: { sources: [{ json: 'P55IMP', full: 'Imp', abbreviation: 'I', authors: [], version: '1' }], dateAdded: 0, dateLastModified: 0 }, spell: [{ name: 'A', source: 'P55IMP', ...base, entries: ['a'] }] }) }]
  out.preview = (await b.previewImport(files)).map((x) => [x.lang, x.codeSet, x.preview.newEntries])
  await b.importFiles(files)
  const imp = (await b.packs()).find((p) => p.id === 'p55imp')
  out.importRow = imp ? { zh: !!imp.zh, en: !!imp.en } : null
  out.step = '// C5'
  // C5：导出两个文件
  out.export = (await b.exportBoth('p55lang')).map((x) => ({ lang: x.lang, names: (x.body.spell ?? []).map((s) => s.name) }))
  } catch (e) { out.error = String(e?.stack ?? e).slice(0, 1500) }
  return out
})

await writeFile(`${work}/p55-c-lang-chrome.json`, JSON.stringify({ r, pageErrors }, null, 1))
const o = r
if (o.error) { console.log('STEP', o.step, o.error); process.exit(1) }
check('C10 下拉 / 建议值显示名：施法时间单位的建议值，中文小窗给作者中文名（action = 动作）', o.labels.suggest?.includes('action') && o.labels.zh?.action === '动作', JSON.stringify(o.labels))
check('学派：9 个代号可选，中文 V = 塑能、英文 V = Evocation', o.school?.suggest?.length === 9 && o.school.zh?.V === '塑能' && o.school.en?.V === 'Evocation', JSON.stringify(o.school))
check('C3 加英文版 → 英文那套出现同编号的包；C2 列成一行（中 / En 都有）', o.add.codeSet === 'en' && o.row?.zh && o.row?.en, JSON.stringify({ add: o.add, row: o.row }))
check('C7 英文那边还没有包：存英文时自动建同编号的包', o.soloRow?.zh && o.soloRow?.en, JSON.stringify(o.soloRow))
check('C6 中文这一条在英文里的原文：对上 Fire Parrot', o.other.state === 'found' && o.other.name === 'Fire Parrot', JSON.stringify(o.other))
check('C9 不用翻译的字段对不上：环节（中 1 / 英 2）', Array.isArray(o.mismatch) && o.mismatch.includes('level') && !o.mismatch.includes('entries'), JSON.stringify(o.mismatch))
check('C8 从英文填入（只填空着的）：英文 name 进中文的英文名，中文名不动', o.plan?.filled === 'Fire Parrot' && o.plan.onlyEmpty.includes('level'), JSON.stringify(o.plan))
check('C4 导入按语言分开：中文文件进中文那套、英文进英文那套，导入后配成一对', JSON.stringify(o.preview.map((x) => x.slice(0, 2))) === JSON.stringify([['zh', 'cn'], ['en', 'en']]) && o.importRow?.zh && o.importRow?.en, JSON.stringify({ p: o.preview, row: o.importRow }))
check('C5 导出双语包：两个文件，各是各的语言', o.export.length === 2 && o.export[0].names[0] === '火焰鹦鹉' && o.export[1].names[0] === 'Fire Parrot', JSON.stringify(o.export))
const realErrors = pageErrors.filter((m) => !/网络错误|Network error|gendata-nav-adventure-book-index/.test(m))
check('页面没有未处理的错误（断网预期的除外）', realErrors.length === 0, realErrors.slice(0, 2).join(' | '))
await ctx.close()
server.close()
console.log(failures.length ? `FAIL ${failures.length}` : 'ALL PASS')
process.exit(failures.length ? 1 : 0)
