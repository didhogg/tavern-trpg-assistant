// 人物写入经存档层（campaign.backendWrite）回归（驾驶员 2026-11-22：加人后点保存人消失、显示“已是最新”）。
// 真实插件 + 真实库 + 真实结算小窗：建战役并保存 → 从模板加入（人物列表同一入口）→ 存档层看到改动 → 保存后人还在 → 撤销后保存人没了。
// 用法：ENGINE=chrome|webkit node tests/e2e/library/p6-people-save.mjs（SKIP_BUILD=1 跳过打包）
import { startStatic } from './static.mjs'
import { buildAll, E2E_PORT, engines, freshFromBase } from './chain-common.mjs'
import { check, failures } from '../helpers.mjs'

if (!process.env.SKIP_BUILD) await buildAll()
const engineName = process.env.ENGINE === 'webkit' ? 'webkit' : 'chrome'
const [, type, options] = engines.find((e) => e[0] === engineName)
const { server, url } = await startStatic({ port: E2E_PORT })
const killer = setTimeout(() => { console.error('超时 7 分钟'); process.exit(2) }, 7 * 60_000)
const ctx = await type.launchPersistentContext(freshFromBase(engineName, 'p6-people-save'), { ...options, viewport: { width: 1280, height: 800 } })
const page = await ctx.newPage()
page.setDefaultTimeout(5 * 60_000)
const pinia = `(() => { const h = document.querySelector('#trpg-assistant-root'); return [...h.shadowRoot.children].map((c) => c.__vue_app__).find(Boolean).config.globalProperties.$pinia })()`
try {
  await page.goto(url)
  await page.waitForFunction(`!!(${pinia})._s.get('app')?.booted`)
  await page.locator('.trpg-ball').click()
  await page.evaluate(async (P) => {
    const h = await import('/work/e2e-lib/harness.js')
    for (const id of ['cn-official', 'en-official']) { const a = await h.offlineAudit(id); if (a.set?.status !== 'installed' || a.ok !== a.planFiles) await h.install(id) }
    const camp = eval(P)._s.get('campaign')
    await camp.startWith((s) => s.backend.starter.startCampaign({ ...camp.owner, ruleId: 'dnd5e2014', name: '人物保存', codeSet: 'cn' }))
    await camp.save()
  }, pinia)
  await page.locator('.trpg-window nav').getByRole('button', { name: '人物', exact: true }).click()
  await page.waitForSelector('[data-testid=people-view]')
  const r = await page.evaluate(async (P) => {
    const h = await import('/work/e2e-lib/harness.js')
    const ps = eval(P); const camp = ps._s.get('campaign'); const people = ps._s.get('people')
    const be = ps._s.get('app').svc().backend; const owner = camp.owner.ownerKey
    const inSave = async () => (await be.kernelSave.read(owner)).actors.length
    const mem = () => camp.workspace.data.kernel?.actors?.length ?? null
    const { monster } = await h.pickChainEntries(await be.kernelSave.libraryOf(owner), 'barbarian')
    const out = { dirtyBefore: camp.dirty }
    out.added = await people.addFromTemplate(monster.ref, '怪', 1, 'enemy')
    out.afterAdd = { saved: await inSave(), mem: mem(), dirty: camp.dirty }
    out.save1 = await camp.save()
    out.afterSave = { saved: await inSave(), mem: mem(), dirty: camp.dirty }
    await people.undoAdded()
    out.afterUndo = { saved: await inSave(), mem: mem(), dirty: camp.dirty }
    out.save2 = await camp.save()
    out.afterSave2 = { saved: await inSave(), mem: mem() }
    return out
  }, pinia)
  check('加入后存档层内存里有这个人、标为有改动', r.added && r.afterAdd.saved === 1 && r.afterAdd.mem === 1 && r.afterAdd.dirty, JSON.stringify(r.afterAdd))
  check('点保存：真的保存了，人还在', r.save1 === true && r.afterSave.saved === 1 && r.afterSave.mem === 1 && !r.afterSave.dirty, JSON.stringify({ save1: r.save1, ...r.afterSave }))
  check('撤销后存档层也跟着少一人、标为有改动', r.afterUndo.saved === 0 && r.afterUndo.mem === 0 && r.afterUndo.dirty, JSON.stringify(r.afterUndo))
  check('撤销后保存：保存成 0 人', r.save2 === true && r.afterSave2.saved === 0 && r.afterSave2.mem === 0, JSON.stringify({ save2: r.save2, ...r.afterSave2 }))
} catch (e) {
  check('测试流程没中断', false, String(e?.stack ?? e).slice(0, 900))
} finally {
  clearTimeout(killer); await ctx.close(); server.close()
  console.log(failures.length ? `FAILED ${failures.length}` : 'ALL PASS')
  process.exit(failures.length ? 1 : 0)
}
