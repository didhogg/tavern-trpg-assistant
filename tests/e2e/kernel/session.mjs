// 结算小窗的两个前提（上位设计 §3.1“同输入同结果”；蓝图 §3.2“一个战役一个世界”）：
//   重放：同一份世界输入 + 同一串操作与骰点，两个全新启动的小窗结果逐项相同（取消预览 = 用存档原样重开，靠的就是这一条）。
//   隔离：同一页面里同时开两个小窗，各启动一个战役（A 只有英雄、B 只有怪物）；各自只看得到自己的角色，对 A 的写入不出现在 B。
// 接线同测试页（KERNEL_FILES：plugin = 插件真实接线 src/rules/kernel/host.ts；reference = 直接读参考原件）。
import { chromium, webkit } from 'playwright-core'
import { assets, save } from './assets.mjs'
import { kernelInputFor, openKernel, unexpectedErrors } from './kernel-page.mjs'
import { scenarioList } from './scenarios.mjs'

const input = await assets()
const LIMIT = Number(process.env.LIMIT ?? 300)

const runScenarios = (page, list) => page.evaluate(async list => {
  const out = []
  for (const [fn, ...args] of list) out.push(await globalThis.__kernel.call(fn, ...args))
  return out
}, list)

for (const [name, engine, launch] of [
  ['chrome', chromium, { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true }],
  ['webkit', webkit, { headless: true }],
]) {
  if (process.env.ENGINE && process.env.ENGINE !== name) continue
  const browser = await engine.launch(launch)
  const result = { engine: name }
  const errors = []
  try {
    // 重放
    const list = scenarioList(input.actors).slice(0, LIMIT)
    const first = await (await browser.newContext()).newPage()
    await openKernel(first, input, errors)
    const second = await (await browser.newContext()).newPage()
    await openKernel(second, input, errors)
    const [a, b] = await Promise.all([runScenarios(first, list), runScenarios(second, list)])
    const replayDiff = list.map((sc, i) => (JSON.stringify(a[i]) === JSON.stringify(b[i]) ? null : { scenario: sc.slice(0, 3), first: a[i], second: b[i] })).filter(Boolean)
    result.replay = { scenarios: list.length, statuses: a.reduce((m, r) => { m[r?.status ?? 'other'] = (m[r?.status ?? 'other'] ?? 0) + 1; return m }, {}), differences: replayDiff.slice(0, 5), differenceCount: replayDiff.length }

    // 隔离：同一页面两个小窗
    const page = await (await browser.newContext()).newPage()
    const heroesOnly = { ...input, actors: input.heroes }
    await openKernel(page, heroesOnly, errors)
    const monstersInput = await kernelInputFor({ ...input, actors: input.monsters })
    monstersInput.world = { id: 'kernel-isolation-b', title: 'Kernel isolation B' }
    const hero = input.heroes[0]
    result.isolation = await page.evaluate(async ([inputB, heroId]) => {
      const pluginRoot = new URL('/', location.href)
      const B = await KernelHost.startAuthorFrame({ codeSet: 'foundry', pluginRoot, container: document.body, timeoutMs: 120_000,
        handlers: globalThis.__kernelHandlers() })
      await B.call('boot', inputB)
      const A = globalThis.__kernel
      const ids = async frame => (await frame.call('preparedActors')).map(x => x.source._id)
      const before = { a: await ids(A), b: await ids(B) }
      const damage = await A.call('damage', heroId, [{ value: 3, type: 'slashing' }], [])
      const hpA = (await A.call('preparedActors')).find(x => x.source._id === heroId)?.system?.attributes?.hp?.value ?? null
      const after = { b: await ids(B) }
      return { framesDistinct: A.frame !== B.frame, a: before.a.length, b: before.b.length, overlap: before.a.filter(id => before.b.includes(id)).length,
        heroInB: before.b.includes(heroId) || after.b.includes(heroId), damageStatus: damage.status, hpAAfter: hpA, bUnchanged: JSON.stringify(before.b) === JSON.stringify(after.b) }
    }, [monstersInput, hero._id])
    result.isolation.expected = { a: input.heroes.length, b: input.monsters.length }
  } catch (error) {
    result.failure = error.stack ?? String(error)
  } finally {
    result.unexpectedErrors = unexpectedErrors(errors)
    const iso = result.isolation
    const ok = !result.failure && result.replay?.differenceCount === 0 && iso && iso.a === iso.expected.a && iso.b === iso.expected.b && iso.overlap === 0 && !iso.heroInB && iso.bUnchanged && iso.damageStatus === 'complete' && !result.unexpectedErrors.length
    result.passed = ok
    if (!ok) process.exitCode = 1
    await save(`session-${name}.json`, result)
    console.log(name, JSON.stringify({ passed: ok, replay: { scenarios: result.replay?.scenarios, differences: result.replay?.differenceCount }, isolation: iso, unexpectedErrors: result.unexpectedErrors.slice(0, 3), failure: result.failure?.slice(0, 400) }))
    await browser.close()
  }
}
