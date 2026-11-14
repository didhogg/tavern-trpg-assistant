// P5.6 第 2 步：卡型从规则系统的声明 + 作者导入器的换算结果读出来（不写类型清单）。
// ① 结算小窗读得到规则系统声明的人物类型；② 整个怪物类别逐条交作者导入器，换出来是哪几种类型（全类别，不抽样）；
// ③ 后端 cardTypes：dnd5e2014 = 角色 + NPC，第二次直接读存下的结果（不开结算内核）；2024 没接结算 → no-kernel。
// 用法：node tests/e2e/library/p56-card-types.mjs（ENGINE=webkit 换 WebKit；结果 work/e2e-lib/p56-card-types-<引擎>.json）
import { join } from 'node:path'
import { writeFile } from 'node:fs/promises'
import { startStatic } from './static.mjs'
import { buildAll, engines, work } from './chain-common.mjs'

await buildAll()
const PORT = 47337
const [, type, options] = engines[process.env.ENGINE === 'webkit' ? 1 : 0]
const { server, url } = await startStatic({ port: PORT })
const ctx = await type.launchPersistentContext(join(work, `profile-p3-1-${process.env.ENGINE ?? 'chrome'}`), { ...options, viewport: { width: 1280, height: 800 } })
const page = await ctx.newPage()
page.setDefaultTimeout(480_000)
const errors = []
// 和预换算测试同一个已知项：作者导航索引在小窗里不存在，不影响换算
const known = (e) => e.includes('gendata-nav-adventure-book-index.json')
page.on('pageerror', (e) => { if (!known(String(e))) errors.push(e.stack ?? String(e)) })
const checks = []
const check = (name, ok, detail = '') => { checks.push({ name, ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`) }
try {
  await page.goto(url)
  const r = await page.evaluate(async () => {
    const h = await import('/work/e2e-lib/harness.js')
    const deps = { pluginRoot: new URL('/', location.href), files: h.files, scoped: h.scoped, db: h.libraryDb, revisions: h.revisions }
    await h.libraryDb.derived.delete('kc-cardtypes:dnd5e2014')
    const kernelFrames = () => [...document.querySelectorAll('iframe')].filter((f) => (f.getAttribute('src') ?? '').includes('/vendor/foundry/frame.html')).length
    let t = performance.now()
    const first = await h.cardTypes(deps, 'dnd5e2014')
    const firstMs = performance.now() - t
    t = performance.now()
    const framesBefore = kernelFrames()
    const second = await h.cardTypes(deps, 'dnd5e2014')
    const secondMs = performance.now() - t
    const openedAgain = kernelFrames() > framesBefore
    const later = await h.cardTypes(deps, 'dnd5e2024')
    // 第 3 步：卡型的字段 = 条目编辑器里存放类别的字段表和表单安排
    const form = { types: (rule, cs) => h.cardTypes(deps, rule, cs), fields: (cs, p) => h.custom.fields(cs, p), plan: (cs, p) => h.custom.formPlan(cs, p) }
    const npc = await h.cardFields(form, 'dnd5e2014', 'npc', 'cn')
    const editor = { fields: await h.custom.fields('cn', 'monster'), plan: await h.custom.formPlan('cn', 'monster') }
    const sameAsEditor = JSON.stringify(npc.fields) === JSON.stringify(editor.fields) && JSON.stringify(npc.plan) === JSON.stringify(editor.plan)
    const npcSummary = { required: npc.plan?.required, common: npc.plan?.common?.length, more: npc.plan?.more?.length, labels: (npc.plan?.required ?? []).map((f) => [f, npc.fields?.labels?.[f] ?? npc.fields?.fields?.find((x) => x.name === f)?.label ?? null]) }

    // 全类别：库里每一只怪物都交作者导入器，数换出来的类型
    const view = await h.revisions.published()
    const library = h.defaultCampaignLibrary('dnd5e2014', 'cn')
    const { session } = await h.startKernelSession(await h.kernelInput({ pluginRoot: new URL('/', location.href), rule: 'dnd5e2014', world: { id: 'p56', title: 'p56' } }), view)
    const declared = (await session.call('actorTypes', 'monster', [])).result.declared
    const rows = (await h.scoped.query(library, 'monster', { view })).filter((row) => typeof row.item?.name === 'string')
    const tally = {}
    const failed = []
    for (const row of rows) {
      const { entry } = await h.kernelEntryOf(h.scoped, 'cn', row.ref, row.item, row.version.altId, view)
      const out = await session.call('importForBuild', 'monster', entry)
      if (out.status !== 'complete' || !out.result) { failed.push(`${row.item.name}: ${out.error ?? out.status}`); continue }
      tally[out.result.type] = (tally[out.result.type] ?? 0) + 1
    }
    session.close()
    return { sameAsEditor, npcSummary, first, firstMs, second, secondMs, openedAgain, later, declared, total: rows.length, tally, failed: failed.slice(0, 10), failedCount: failed.length }
  })
  await writeFile(`${work}/p56-card-types-${process.env.ENGINE ?? 'chrome'}.json`, JSON.stringify({ ...r, errors }, null, 2))
  check('结算小窗读得到规则系统声明的人物类型', r.declared.length > 0, r.declared.map((d) => `${d.type}=${d.label}`).join('、'))
  check('整个怪物类别交作者导入器：没有失败', r.failedCount === 0, `共 ${r.total} 只；失败 ${r.failedCount}：${r.failed.join(' | ')}`)
  check('整个怪物类别换出来的人物类型', Object.keys(r.tally).length > 0, JSON.stringify(r.tally))
  check('卡型 = 声明 ∩ 能建出来：角色（分步建卡）+ NPC（从怪物属性块）', r.first.status === 'ready' && JSON.stringify(r.first.types.map((x) => [x.type, x.build, x.store])) === JSON.stringify([['character', ['steps'], 'monster'], ['npc', ['store'], 'monster']]), JSON.stringify(r.first.types))
  check('卡型中文名来自作者大译名表：玩家角色 / 非玩家角色', JSON.stringify(r.first.types.map((x) => x.labelZh)) === JSON.stringify(['玩家角色', '非玩家角色']), JSON.stringify(r.first.types.map((x) => [x.label, x.labelZh])))
  check('换出来的类型都在卡型里（全类别结果和卡型对得上）', Object.keys(r.tally).every((k) => r.first.types.some((x) => x.type === k && x.build.includes('store'))))
  check('第二次直接读存下的结果，不开结算内核', r.second.status === 'ready' && !r.openedAgain && JSON.stringify(r.second) === JSON.stringify(r.first), `第一次 ${Math.round(r.firstMs)}ms，第二次 ${Math.round(r.secondMs)}ms`)
  check('2024 没接结算 → no-kernel', r.later.status === 'no-kernel')
  check('第 3 步：NPC 的字段 = 条目编辑器里怪物的字段表 + 表单安排（同一套）', r.sameAsEditor && r.npcSummary.required?.length > 0, JSON.stringify(r.npcSummary))
  check('页面没有未处理的错误', errors.length === 0, errors.slice(0, 2).join(' | '))
} finally {
  await ctx.close()
  server.close()
}
const bad = checks.filter((c) => !c.ok).length
console.log(bad ? `FAIL ${bad}` : 'ALL PASS')
process.exit(bad ? 1 : 0)
