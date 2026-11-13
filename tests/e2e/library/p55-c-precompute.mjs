// P5.5 查慢后的后台补换算（只看自制和带备选的条目、全都换过就不开内核、失败不重试、停手再跑、连着改合并）的本机局部验证。
// 真实构建的插件 + 已装中英官方数据的旧测试资料夹副本，断网。只走后台补换算这条路，不做全库换算。
// 用法：SKIP_BUILD=1 node tests/e2e/library/p55-c-precompute.mjs。结果写进 work/e2e-lib/p55-c-precompute-chrome.json。
import { cp, rm, writeFile } from 'node:fs/promises'
import { startStatic } from './static.mjs'
import { buildAll, engines, work } from './chain-common.mjs'
import { check, failures } from '../helpers.mjs'

if (!process.env.SKIP_BUILD) await buildAll()
const [, type, options] = engines[0]
const { server, url } = await startStatic({ port: 47318 })
const profile = `${work}/profile-p55c-pre-chrome`
await rm(profile, { recursive: true, force: true })
await cp(`${work}/profile-b2-8a-chrome`, profile, { recursive: true })
const ctx = await type.launchPersistentContext(profile, { ...options, viewport: { width: 1280, height: 800 } })
const page = await ctx.newPage()
page.setDefaultTimeout(400000)
const pageErrors = []
page.on('pageerror', (e) => pageErrors.push(String(e.message ?? e).slice(0, 200)))
await page.route((u) => !u.href.startsWith(url), (route) => route.abort())
await page.goto(url)
await page.waitForFunction(() => { const h = document.querySelector('#trpg-assistant-root'); const app = [...(h?.shadowRoot?.children ?? [])].map((c) => c.__vue_app__).find(Boolean); return app?.config.globalProperties.$pinia._s.get('app')?.booted })

const r = await page.evaluate(async () => {
  const host = document.querySelector('#trpg-assistant-root')
  const app = [...host.shadowRoot.children].map((c) => c.__vue_app__).find(Boolean)
  const lib = app.config.globalProperties.$pinia._s.get('app').svc().backend.library
  const T = () => Math.round(performance.now())
  const pick = (x) => x && { mode: x.mode, total: x.total, converted: x.converted, cached: x.cached, failed: x.failed?.length, knownFailed: x.knownFailed, kernelOpened: x.kernelOpened, ms: x.ms, error: x.error }
  const out = {}
  await lib.precomputeQueue.settled()
  let t = T(); out.first = pick(await lib.precompute.run({ codeSet: 'cn', mode: 'changed' })); out.first.wall = T() - t
  t = T(); out.again = pick(await lib.precompute.run({ codeSet: 'cn', mode: 'changed' })); out.again.wall = T() - t
  const sp = (n) => ({ name: `P55换算术${n}`, level: 1, school: 'V', time: [{ number: 1, unit: 'action' }], range: { type: 'point', distance: { type: 'self' } }, components: { v: true }, duration: [{ type: 'instant' }], entries: ['一道光。'] })
  out.saves = []
  for (const n of [1, 2, 3]) { t = T(); await lib.custom.saveEntry('cn', 'spell', sp(n)); out.saves.push(T() - t) }
  t = T(); await lib.precomputeQueue.settled(); out.queueWait = T() - t
  out.queued = pick(lib.precomputeQueue.last)
  t = T(); await lib.custom.saveEntry('cn', 'spell', sp(4)); out.saveIdle = T() - t
  await lib.precomputeQueue.settled()
  out.queued2 = pick(lib.precomputeQueue.last)
  // 故意写坏的一条（环阶写成文字、缺施法时间）：第一次换算失败，再跑跳过它
  await lib.custom.saveEntry('cn', 'spell', { name: 'P55坏法术', level: '不是数字', school: 'V', entries: [{ type: 'notAType' }] })
  await lib.precomputeQueue.settled()
  out.bad1 = pick(lib.precomputeQueue.last)
  out.bad2 = pick(await lib.precompute.run({ codeSet: 'cn', mode: 'changed' }))
  return out
})

await writeFile(`${work}/p55-c-precompute-chrome.json`, JSON.stringify({ r, pageErrors }, null, 1))
const o = r
check('后台补换算只看自制和带备选的条目（不是全库两万条）', o.first.mode === 'changed' && o.first.total < 5000, JSON.stringify(o.first))
check('什么都没改再跑：全都换过 → 不开结算内核、一条不换', o.again.kernelOpened === false && o.again.converted === 0 && o.again.total === o.first.total, JSON.stringify(o.again))
check('连着存三条：后台只跑一次，三条一起换好', o.queued?.mode === 'changed' && o.queued.converted === 3, JSON.stringify(o.queued))
check('存一条本身几秒内（不被后台撞上）', Math.max(...o.saves, o.saveIdle) < 8000, JSON.stringify({ saves: o.saves, saveIdle: o.saveIdle }))
check('再存一条：后台只换这一条', o.queued2?.converted === 1, JSON.stringify(o.queued2))
if (o.bad1?.failed >= 1) check('换算失败的一条：再跑不重试（记成已知失败）、不开结算内核', o.bad2.failed === 0 && o.bad2.knownFailed >= 1 && o.bad2.kernelOpened === false, JSON.stringify({ bad1: o.bad1, bad2: o.bad2 }))
else console.log('注意：写坏的那条结算内核也换算成功了，失败不重试这一项没测到', JSON.stringify(o.bad1))
const realErrors = pageErrors.filter((m) => !/网络错误|Network error|gendata-nav-adventure-book-index/.test(m))
check('页面没有未处理的错误（断网预期的除外）', realErrors.length === 0, realErrors.slice(0, 2).join(' | '))
await ctx.close()
server.close()
console.log(failures.length ? `FAIL ${failures.length}` : 'ALL PASS')
process.exit(failures.length ? 1 : 0)
