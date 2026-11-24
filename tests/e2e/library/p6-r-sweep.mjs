// P6-R 全库扫：库里每个职业 / 种族 / 背景 / 专长在空白人物上走一遍作者「导入到人物」（问答桥一问一答，全按默认 / 第一个能选的答），
// 查两件事：① 没有作者导入失败；② 没有问答桥没登记的题型（界面答不了）。慢（全库约 20 分钟），阶段收尾时跑。
//   PROPS=class,race,background,feat（默认全部）  LEVEL=职业导入到几级（默认 1）  ENGINE=webkit 换内核
import { mkdir } from 'node:fs/promises'
import { startStatic } from './static.mjs'
import { buildAll, E2E_PORT, engines, freshFromBase } from './chain-common.mjs'
import { check, failures, settle } from '../helpers.mjs'

const engineName = process.env.ENGINE === 'webkit' ? 'webkit' : 'chrome'
const PROPS = (process.env.PROPS ?? 'class,race,background,feat').split(',')
const LEVEL = Number(process.env.LEVEL ?? 1)
if (!process.env.SKIP_BUILD) await buildAll()
const [, type, options] = engines.find((e) => e[0] === engineName)
const { server, url } = await startStatic({ port: E2E_PORT })
await mkdir(`${process.cwd()}/work/p6-ui`, { recursive: true })
const killer = setTimeout(() => { console.error('超时 45 分钟'); process.exit(2) }, 45 * 60_000)
const ctx = await type.launchPersistentContext(freshFromBase(engineName, 'p6-r-sweep'), { ...options, viewport: { width: 1280, height: 860 } })
const page = await ctx.newPage()
page.setDefaultTimeout(0)
const pinia = `(() => { const h = document.querySelector('#trpg-assistant-root'); return [...h.shadowRoot.children].map((c) => c.__vue_app__).find(Boolean).config.globalProperties.$pinia })()`
try {
  await page.goto(url)
  await page.waitForFunction(`!!(${pinia})._s.get('app')?.booted`)
  await page.locator('.trpg-ball').click(); await settle(page, 500)
  await page.evaluate(async (P) => {
    const h = await import('/work/e2e-lib/harness.js')
    for (const id of ['cn-official', 'en-official']) { const a = await h.offlineAudit(id); if (a.set?.status !== 'installed' || a.ok !== a.planFiles) await h.install(id) }
    const ps = eval(P); const camp = ps._s.get('campaign')
    await camp.startWith((s) => s.backend.starter.startCampaign({ ...camp.owner, ruleId: 'dnd5e2014', name: '全库扫', codeSet: 'cn' }))
  }, pinia)
  for (const prop of PROPS) {
    const t0 = Date.now()
    const out = await page.evaluate(async ({ P, prop, LEVEL }) => {
      const ps = eval(P); const camp = ps._s.get('campaign'); const be = ps._s.get('app').svc().backend; const owner = camp.owner.ownerKey
      const h = await import('/work/e2e-lib/harness.js')
      await be.kernel.enter(owner)
      const library = await be.kernelSave.libraryOf(owner)
      const made = await camp.backendWrite((k) => be.people.build(k, { name: '扫', items: [] }, { category: 'party' })); const who = made.built.id
      // 一道题的「默认答法」：等级到 LEVEL、勾选题从上往下勾满、起始装备选第一套、是否答是、属性提升力量 +2……
      const ans = (f) => f.type === 'parts' ? { parts: f.parts.map((p) => ans(p.form)) }
        : f.type === 'levels' ? { value: f.radio ? Math.min(LEVEL, f.levels.length) - 1 : Array.from({ length: Math.min(LEVEL, f.levels.length) }, (_, i) => i) }
        : f.type === 'choose' ? { set: 0, picks: f.sets[0].groups.map((g) => g.options.map((o, i) => [o, i]).filter(([o]) => !o.disabled).slice(0, g.count).map(([, i]) => i)) }
        : f.type === 'equipment' ? { choice: f.groups.map(() => 0), slots: Object.fromEntries(f.groups.flatMap((g, gi) => (g.choices[0]?.entries ?? []).filter((e) => e.kind === 'category').flatMap((e) => Array.from({ length: e.quantity }, (_, k) => [`${gi}.0.${k}`, e.candidates[0]?.uid])))) }
        : f.type === 'texts' ? { picks: f.groups.map(() => []), texts: f.groups.map((g) => g.options.slice(0, g.count).map((o) => String(o.label)).concat(Array(Math.max(0, g.count - g.options.length)).fill('自定义'))) }
        : f.type === 'boolean' ? { value: true } : f.type === 'enum' ? { value: Math.max(0, f.selected ?? 0) }
        : f.type === 'asi' ? { bonus: { [f.abilities[0].key]: Math.min(f.points, f.max) } } : { default: true }
      const unknown = []; const errors = []; const kinds = {}
      const pool = await h.scoped.query(library, prop)
      for (const row of pool) {
        const answers = []
        try {
          for (let i = 0; i < 40; i++) {
            const r = await be.importFlow.step(owner, who, row.ref, answers)
            if (r.status === 'error') { errors.push(`${row.item.name}(${row.source})：${r.error.slice(0, 120)}`); break }
            if (r.status === 'ready') break
            const q = r.question; kinds[q.kind] = (kinds[q.kind] ?? 0) + 1
            for (const u of q.form.type === 'unknown' ? [q] : q.form.type === 'parts' ? q.form.parts.filter((p) => p.form.type === 'unknown') : []) unknown.push(`${row.item.name}(${row.source})「${u.title ?? u.kind}」`)
            answers.push(q.form.type === 'unknown' && q.skippable ? { skip: true } : ans(q.form))
          }
        } catch (e) { errors.push(`${row.item.name}(${row.source})：${String(e).slice(0, 120)}`) }
        await be.importFlow.cancel(owner, who)
      }
      return { n: pool.length, unknown, errors, kinds }
    }, { P: pinia, prop, LEVEL })
    console.log(`${prop}：${out.n} 条，${Math.round((Date.now() - t0) / 1000)} 秒；题型 ${JSON.stringify(out.kinds)}`)
    check(`${prop}：作者导入全部走通（${out.n} 条）`, out.n > 0 && !out.errors.length, out.errors.slice(0, 8).join(' | '))
    check(`${prop}：没有问答桥没登记的题型`, !out.unknown.length, out.unknown.slice(0, 8).join(' | '))
  }
} catch (e) { check('扫库没中断', false, String(e?.stack ?? e).slice(0, 600)) }
finally { clearTimeout(killer); await ctx.close(); server.close() }
console.log(failures.length ? `FAILED ${failures.length}` : 'ALL PASS'); process.exit(failures.length ? 1 : 0)
