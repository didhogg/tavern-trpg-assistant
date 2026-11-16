// 结算小窗的界面语言（rules/kernel/lang-packs.ts + tools/build-kernel-lang.mjs 生成的中文语言包）真实小窗验证。
// 用法：ENGINE=chrome|webkit node tests/e2e/library/p6-kernel-lang.mjs（SKIP_BUILD=1 跳过构建）；复制一份浏览器资料，不动共用的那份。
//   ① 中文战役的小窗语言是 zh、技能名 / 进阶标题是中文，缺的键回退英文（不报错）；② 英文战役仍是 en；
//   ③ 语言包声明读不到（404）时中文战役退回英文，不是错误；
//   ④ 旧存档：英文小窗建的人，存进存档，关窗后在中文小窗按存档重建——所有数字、内部编号和英文时一模一样，只有文字标签变中文。
import { writeFile } from 'node:fs/promises'
import { startStatic } from './static.mjs'
import { buildAll, engines, freshProfile, work } from './chain-common.mjs'
import { check, failures } from '../helpers.mjs'

if (!process.env.SKIP_BUILD) await buildAll()
const engineName = process.env.ENGINE === 'webkit' ? 'webkit' : 'chrome'
const [, type, options] = engines.find((e) => e[0] === engineName)
const { server, url } = await startStatic({ port: 47373 })
const profile = `${work}/profile-p6-kernellang-${engineName}`
freshProfile(`${work}/profile-p3-1-${engineName}`, profile) // 克隆底座，跑完自动删（KEEP_PROFILE=1 保留）
const killer = setTimeout(() => { console.error('超时 8 分钟'); process.exit(2) }, 8 * 60_000)
const ctx = await type.launchPersistentContext(profile, { ...options, viewport: { width: 1280, height: 800 } })
const page = await ctx.newPage(); page.setDefaultTimeout(8 * 60_000)
const errors = []
page.on('pageerror', (e) => errors.push(e.stack ?? String(e)))
page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`) })
const out = {}

/** 现在开着的结算小窗里官方客户端的真实语言状态。 */
async function windowLang() {
  const got = []
  for (const f of page.frames()) {
    const v = await f.evaluate(() => (typeof game !== 'undefined' && game.i18n ? { lang: game.i18n.lang, skill: game.i18n.localize('DND5E.SkillHis'), hit: game.i18n.localize('DND5E.ADVANCEMENT.HitPoints.Title'), missing: game.i18n.localize('DND5E.NoSuchKeyForTest') } : null)).catch(() => null)
    if (v) got.push(v)
  }
  return got
}
const flat = (x, p = '', o = {}) => {
  if (x && typeof x === 'object') for (const [k, v] of Object.entries(x)) flat(v, `${p}.${k}`, o)
  else o[p] = x
  return o
}

try {
  await page.goto(url)
  await page.evaluate(async () => {
    const h = await import('/work/e2e-lib/harness.js')
    for (const id of ['cn-official', 'en-official']) {
      const audit = await h.offlineAudit(id)
      if (audit.set?.status !== 'installed' || audit.ok !== audit.planFiles) await h.install(id)
    }
    globalThis.__h = h
  })
  // 页面里的运行时：和 p6-people 同样的接线；library 的资料集决定小窗语言
  const setup = `
    const h = globalThis.__h
    const mk = (set, owner) => {
      const library = h.defaultCampaignLibrary('dnd5e2014', set)
      return new h.KernelRuntime({ revisions: h.revisions, pluginRoot: new URL('/', location.href), files: h.files, scoped: h.scoped, service: h.service, container: () => document.body,
        cache: { db: h.libraryDb, dataVersion: h.dataVersion }, campaignOf: async () => ({ rule: 'dnd5e2014', library, title: owner }) })
    }
    // 同一时刻只留一个小窗：新一步开始前先关掉上一步留下的
    const release = async () => { const k = globalThis.__keep; globalThis.__keep = null; if (k) await k.rt.close(k.owner) }
    const keep = (rt, owner) => { globalThis.__keep = { rt, owner } }
    const peopleOf = (rt) => {
      const saves = new h.kernelSave.constructor({ ...h.kernelSave.deps, compactActors: (k, ids) => rt.compact(k, ids), mapRef: (k) => rt.mapRef(k) })
      return { saves, people: new h.KernelPeople({ runtime: rt, saves }) }
    }`
  const run = (body, arg) => page.evaluate(`(async (arg) => { ${setup}\n${body} })(${JSON.stringify(arg ?? null)})`)

  // ③ 语言包声明读不到：中文战役退回英文
  await page.route(/\/vendor\/foundry\/lang-packs\.json(\?.*)?$/, (route) => route.fulfill({ status: 404, body: '' }))
  const owner = 'char:p6kernellang.png'
  await run(`
    await h.userDb.workspaces.clear(); await h.userDb.saves.clear()
    await h.campaign.startNewCampaign({ ownerKey: arg.owner, ownerLabel: 'P6 语言', ruleId: 'dnd5e2014', name: 'P6 语言' })
    await h.kernelSave.bind(arg.owner, { rule: 'dnd5e2014', kernelVersion: 1, library: h.defaultCampaignLibrary('dnd5e2014', 'cn'), dataVersion: await h.dataVersion(), overrides: [], actors: [], revision: 0, undo: [] })
    await release()
    const rt = mk('cn', 'P6 语言')
    await rt.session(arg.owner); keep(rt, arg.owner)
    return 'ok'`, { owner })
  out.noPack = await windowLang()
  check('③ 语言包声明读不到：中文战役退回英文小窗（不是错误）', out.noPack.length === 1 && out.noPack[0].lang === 'en' && out.noPack[0].skill === 'History', JSON.stringify(out.noPack))
  // ④ 英文小窗建人并存档，然后关窗
  const built = await run(`
    await release()
    const rt = mk('cn', 'P6 语言'); const { people } = peopleOf(rt)
    const { plan } = await h.pickChainEntries(h.defaultCampaignLibrary('dnd5e2014', 'cn'), 'barbarian')
    const b = await people.build(arg.owner, { name: 'P6 语言人', items: ['race', 'background', 'class'].map((k) => plan[k].ref), equipment: ['weapon'].map((k) => plan[k].ref) }, { category: 'party' })
    const sheet = await people.sheet(arg.owner, b.built.id)
    if (sheet.status !== 'complete') throw new Error('读人物页失败：' + sheet.error)
    const id = b.built.id
    await rt.close(arg.owner)
    return { id, system: sheet.result.system, breakdown: sheet.result.breakdown }`, { owner })
  await page.unroute(/\/vendor\/foundry\/lang-packs\.json(\?.*)?$/)
  // ① 中文战役：真实声明在，小窗 zh；按存档重建同一个人（④）
  const rebuilt = await run(`
    await release()
    const rt = mk('cn', 'P6 语言'); const { people } = peopleOf(rt)
    const loaded = await people.load(arg.owner); keep(rt, arg.owner)
    const sheet = await people.sheet(arg.owner, arg.id)
    if (sheet.status !== 'complete') throw new Error('读人物页失败：' + sheet.error)
    return { statuses: loaded.map((x) => x.status), system: sheet.result.system, breakdown: sheet.result.breakdown }`, { owner, id: built.id })
  out.zh = await windowLang()
  check('① 中文战役：小窗官方语言是 zh，技能名 / 进阶标题是中文，缺的键回退（不报错）', out.zh.length === 1 && out.zh[0].lang === 'zh' && out.zh[0].skill === '历史' && out.zh[0].hit === '生命值' && out.zh[0].missing === 'DND5E.NoSuchKeyForTest', JSON.stringify(out.zh))
  check('④ 按存档重建：每个人都成功', rebuilt.statuses.length > 0 && rebuilt.statuses.every((s) => s === 'complete'), JSON.stringify(rebuilt.statuses))
  const a = flat({ s: built.system, b: built.breakdown }); const b = flat({ s: rebuilt.system, b: rebuilt.breakdown })
  const diffs = [...new Set([...Object.keys(a), ...Object.keys(b)])].filter((k) => a[k] !== b[k]).map((k) => ({ k, en: a[k], zh: b[k] }))
  const nonText = diffs.filter((d) => typeof d.en !== 'string' || typeof d.zh !== 'string')
  out.compare = { paths: Object.keys(a).length, diffs: diffs.length, nonText, textSample: diffs.filter((d) => typeof d.en === 'string' && typeof d.zh === 'string').slice(0, 12) }
  check('④ 英文窗口建的人在中文窗口重建：所有数字和内部编号不变', nonText.length === 0 && a['.s.details.originalClass'] === b['.s.details.originalClass'], JSON.stringify(nonText.slice(0, 5)))
  check('④ 差别只在文字标签，并且确实变成了中文', diffs.length > 0 && diffs.every((d) => typeof d.zh === 'string') && diffs.some((d) => /[一-鿿]/.test(String(d.zh))), JSON.stringify(out.compare.textSample.slice(0, 4)))
  // ② 英文战役仍是 en
  await run(`await release(); const en = mk('en', 'P6 英文'); await en.session(arg.owner + '-en'); keep(en, arg.owner + '-en'); return 'ok'`, { owner }).catch((e) => { out.enOpenError = String(e).slice(0, 300) })
  out.en = await windowLang()
  check('② 英文战役：小窗仍是 en，技能名是英文', !out.enOpenError && out.en.length === 1 && out.en[0].lang === 'en' && out.en[0].skill === 'History', JSON.stringify(out.en) + (out.enOpenError ?? ''))
} catch (e) {
  check('测试流程没中断', false, String(e?.stack ?? e).slice(0, 900))
} finally {
  const known = (e) => /gendata-nav-adventure-book-index|requires usable window dimensions|status of 404|api\/plutonium|plutonium|net::ERR|Failed to load resource|when merging ability scores|KERNEL_NEEDS_INPUT|homebrew|unearthed-arcana/.test(e)
  out.errors = errors.filter((e) => !known(e)).slice(0, 10)
  check('没有未解释的页面报错', out.errors.length === 0, out.errors.join(' | ').slice(0, 500))
  await writeFile(`${work}/p6-kernel-lang-${engineName}.json`, JSON.stringify(out, null, 1))
  clearTimeout(killer); await ctx.close(); server.close()
  console.log(failures.length ? `FAILED ${failures.length}` : 'ALL PASS')
  process.exit(failures.length ? 1 : 0)
}
