// 参考实录 + 自动对比（P6 单元 0，驾驶员 11-25 批准的做法）。只是开发工具，不进插件包。
//
//   perl -e 'alarm 480; exec @ARGV' node tools/p6-ref/run.mjs <场景名>      （场景在 tools/p6-ref/scenarios/<场景名>.mjs）
//
// 流程：模拟酒馆 + 真实库（e2e 底座克隆，跑完自动删）
//   ① 场景的 start：在我们插件里建好起点人物
//   ② 把这个人的完整数据原样放进参考小窗（dnd5e + 作者 Plutonium + Tidy5e，同一版库），先比一次：起点应当一样
//   ③ 场景的 ours：在我们插件里做这串操作，每步截图        ④ 场景的 ref：在参考小窗里做同一串操作，每步截图
//   ⑤ 两边导出完整人物，逐项比，写 work/p6-ref/<场景名>/report.md（差异表 + 两边每一步的截图）和 diff.json
// 需要：e2e 底座（npm run e2e:base）、Tidy5e 构建（node tools/tidy-preview/prepare.mjs）、dist 已打包。
import { build } from 'esbuild'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { root } from '../../tests/e2e/library/static.mjs'
import { E2E_PORT, engines, freshFromBase } from '../../tests/e2e/library/chain-common.mjs'
import { settle } from '../../tests/e2e/helpers.mjs'
import { startRefServer } from './server.mjs'
import { compareActors, diffReport } from './compare.mjs'

const name = process.argv[2]
if (!name) { console.error('用法：node tools/p6-ref/run.mjs <场景名>'); process.exit(1) }
const scenario = await import(`./scenarios/${name}.mjs`)
const out = join(root, 'work/p6-ref', name)
await rm(out, { recursive: true, force: true }); await mkdir(join(out, 'ours'), { recursive: true }); await mkdir(join(out, 'ref'), { recursive: true })
await build({ entryPoints: [join(root, 'tools/p6-ref/ref-entry.ts')], bundle: true, format: 'esm', outfile: join(root, 'work/p6-ref/ref-entry.js'), logLevel: 'error' })

const [, type, options] = engines[0]
const { server, standIns, url } = await startRefServer(E2E_PORT)
const ctx0 = await type.launchPersistentContext(freshFromBase('chrome', 'p6-ref'), { ...options, viewport: { width: 1400, height: 900 } })
const page = await ctx0.newPage(); page.setDefaultTimeout(90_000)
const errors = []
page.on('pageerror', (e) => errors.push(String(e.message).slice(0, 200)))
const pinia = `(() => { const h = document.querySelector('#trpg-assistant-root'); return [...h.shadowRoot.children].map((c) => c.__vue_app__).find(Boolean).config.globalProperties.$pinia })()`

/** 每一步记录：哪边、第几步、做了什么、截图文件、用时。 */
const steps = { ours: [], ref: [] }
let clock = Date.now()
const ctx = {
  page, pinia, settle: (ms) => settle(page, ms),
  /** 截一步。side = 'ours' | 'ref'。 */
  async shot(side, what) {
    const n = String(steps[side].length + 1).padStart(2, '0')
    const file = `${side}/${n}.png`
    await page.screenshot({ path: join(out, file) })
    steps[side].push({ n, what, file, ms: Date.now() - clock }); clock = Date.now()
  },
  /** 参考小窗里的元素（作者 / Tidy5e 的界面都在这个小窗里）。 */
  ref: () => page.frameLocator('#p6-ref-slot iframe'),
  /** 在参考小窗里执行（fn 收到小窗的 window）。 */
  refEval: (fn, arg) => page.evaluate(([src, a]) => { const f = eval(src); return f(window.__p6ref.win, a) }, [String(fn), arg]),
  /** 参考小窗现在开着的窗口名（作者窗口 + 官方窗口）。 */
  refWindows: () => page.evaluate(() => window.__p6refMod.windowsOf(window.__p6ref.win)),
  /** 轮到哪边就只显示哪边：参考小窗和插件界面互相挡点击。 */
  showRef: (on) => page.evaluate((v) => {
    const s = document.getElementById('p6-ref-slot'); if (s) s.style.display = v ? '' : 'none'
    const p = document.getElementById('trpg-assistant-root'); if (p) p.style.display = v ? 'none' : ''
  }, on),
}
/** 我们这边：战役结算小窗里这个人的完整数据。 */
const exportOurs = (id) => page.evaluate(async ([P, id]) => {
  const ps = eval(P); const be = ps._s.get('app').svc().backend; const owner = ps._s.get('campaign').owner.ownerKey
  const { session } = await be.people.deps.runtime.session(owner)
  return (await session.call('preparedActors')).find((a) => a.source._id === id) ?? null
}, [pinia, id])
/** 参考那边：参考小窗里这个人的完整数据（同一个命令）。 */
const exportRef = (id) => page.evaluate(async (id) => (await window.__p6ref.session.call('preparedActors')).find((a) => a.source._id === id) ?? null, id)

const report = [`# 参考实录 + 自动对比：${scenario.title}`, '', `跑于 ${new Date().toISOString()}（模拟酒馆 + 真实库，Chrome）。参考 = 官方 dnd5e + 作者 Plutonium + Tidy5e 新版角色卡，和我们插件同一版库。`, '']
try {
  await page.goto(url); await page.waitForFunction(`!!(${pinia})._s.get('app')?.booted`)
  await page.locator('.trpg-ball').click(); await settle(page, 500)
  await page.evaluate(async (P) => {
    const ps = eval(P); const camp = ps._s.get('campaign')
    await camp.startWith((s) => s.backend.starter.startCampaign({ ...camp.owner, ruleId: 'dnd5e2014', name: '参考对比', codeSet: 'cn' }))
  }, pinia)
  await page.locator('.trpg-window nav').getByRole('button', { name: '人物', exact: true }).click(); await settle(page, 600)

  // ① 起点人物（我们这边建）
  const id = await scenario.start(ctx)
  const startOurs = await exportOurs(id)
  if (!startOurs) throw new Error(`我们这边找不到起点人物 ${id}`)
  // ② 原样放进参考小窗，先比一次起点
  await page.evaluate(async ([P, source]) => {
    const ps = eval(P); const be = ps._s.get('app').svc().backend; const owner = ps._s.get('campaign').owner.ownerKey
    const m = await import('/work/p6-ref/ref-entry.js')
    window.__p6refMod = m
    window.__p6ref = await m.openReference(be.people.deps.native.deps, owner)
    await m.loadAndOpen(window.__p6ref.win, source)
  }, [pinia, startOurs.source])
  await ctx.showRef(false); await settle(page, 1500)
  const startDiff = compareActors(await exportRef(id), startOurs)
  // ③ 我们这边
  clock = Date.now()
  await scenario.ours(ctx, id)
  const endOurs = await exportOurs(id)
  // ④ 参考那边
  await ctx.showRef(true); await settle(page, 1500); clock = Date.now()
  await scenario.ref(ctx, id)
  const endRef = await exportRef(id)
  // ⑤ 比
  const endDiff = compareActors(endRef, endOurs)
  await writeFile(join(out, 'diff.json'), JSON.stringify({ start: startDiff, end: endDiff }, null, 1))
  const stepTable = (side) => ['| 步 | 做了什么 | 用时 | 截图 |', '|---|---|---|---|', ...steps[side].map((s) => `| ${s.n} | ${s.what} | ${s.ms} 毫秒 | [${s.file}](${s.file}) |`)]
  report.push('## 两边每一步', '', '### 我们这边', ...stepTable('ours'), '', '### 参考那边', ...stepTable('ref'), '')
  report.push('## 起点核对（把我们的起点人物原样放进参考小窗后立刻比；应当一样，不一样说明比法有问题）', '', diffReport(startDiff, { limit: 10 }), '')
  report.push('## 做完以后：差异表', '', diffReport(endDiff), '')
} catch (e) {
  report.push('## 没跑完', '', '```', String(e?.stack ?? e).slice(0, 1500), '```')
  await page.screenshot({ path: join(out, 'fail.png') }).catch(() => undefined)
  console.error(e)
} finally {
  report.push('## 运行说明', '', `- 用空模板代替的 Foundry 核心模板（没公开）：${[...standIns].join('、') || '无'}`, `- 页面报错：${errors.length ? errors.slice(0, 10).join(' / ') : '无'}`)
  await writeFile(join(out, 'report.md'), report.join('\n'))
  console.log(`报告：${join(out, 'report.md')}`)
  await ctx0.close(); server.close()
}
