// 插件结算小窗（vendor/foundry/frame.html + dist/kernel-frame.js）对答案：
// 本地假站点里由插件真实的小窗宿主代码打开小窗，喂与标准答案相同的世界，比 352 个角色/怪物准备后的数据。
// 标准答案来自 baseline.mjs（演示站官方原件）；先跑它。只比数据，不手写期望值。
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { chromium, webkit } from 'playwright-core'
import { assets, output, save } from './assets.mjs'
import { scenarioList } from './scenarios.mjs'
import { moduleFilesRead, openKernel, unexpectedErrors } from './kernel-page.mjs'

const input = await assets()

function normalize(value) {
  if (Array.isArray(value)) return value.map(normalize)
  // stack 是出错时的排查用堆栈（各浏览器格式不同、含页面地址），不比
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).filter(k => k !== 'stack').sort().map(k => [k, normalize(value[k])]))
  return value
}
function differences(a, b, path = '', out = []) {
  if (out.length > 200) return out
  if (JSON.stringify(a) === JSON.stringify(b)) return out
  if (a && b && typeof a === 'object' && typeof b === 'object' && Array.isArray(a) === Array.isArray(b)) {
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) differences(a[k], b[k], path ? `${path}.${k}` : k, out)
  } else out.push({ path, expected: a, actual: b })
  return out
}

for (const [name, engine, launch] of [
  ['chrome', chromium, { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true }],
  ['webkit', webkit, { headless: true }],
]) {
  if (process.env.ENGINE && process.env.ENGINE !== name) continue
  const browser = await engine.launch(launch)
  const context = await browser.newContext()
  const page = await context.newPage()
  const errors = []
  const result = { engine: name }
  try {
    const started = Date.now()
    result.boot = await openKernel(page, input, errors)
    result.bootMs = Date.now() - started
    const actors = await page.evaluate(() => globalThis.__kernel.call('preparedActors'))
    const oracle = JSON.parse(await readFile(join(output, `baseline-${name}-sync-combined-headless-full.json`), 'utf8'))
    assert.equal(oracle.status, 'headless-ready', 'Oracle baseline must be current and successful')
    const expected = new Map(oracle.actors.map(a => [a.source._id, normalize(a)]))
    result.actors = actors.length
    result.differences = []
    for (const actor of actors) {
      const diff = differences(expected.get(actor.source._id), normalize(actor))
      if (diff.length) result.differences.push({ id: actor.source._id, name: actor.name, diff: diff.slice(0, 20) })
    }
    // 结算场景：同一串操作和骰点，逐项比结果（状态、数值、来源、变更计划、缺什么、未支持）。
    const scenarios = await page.evaluate(async list => {
      const out = []
      for (const [fn, ...args] of list) out.push(await globalThis.__kernel.call(fn, ...args))
      return out
    }, scenarioList(input.actors))
    result.scenarioCount = scenarios.length
    result.scenarioStatus = scenarios.reduce((m, r) => { const k = r?.status ?? (Array.isArray(r) ? 'list' : 'other'); m[k] = (m[k] ?? 0) + 1; return m }, {})
    result.scenarioDifferences = []
    scenarioList(input.actors).forEach((sc, i) => {
      const diff = differences(normalize(oracle.scenarios?.[i]), normalize(scenarios[i]))
      if (diff.length) result.scenarioDifferences.push({ scenario: sc.slice(0, 3), diff: diff.slice(0, 10) })
    })
    result.errors = errors
    // 已查明的两类：Plutonium 明确可缺的独立后端（同标准答案）；隐藏小窗 0×0 时官方的窗口尺寸提示（不影响计算）。其余报错都算失败。
    result.unexpectedErrors = unexpectedErrors(errors)
    result.status = result.differences.length || actors.length !== expected.size || result.unexpectedErrors.length || result.scenarioDifferences.length ? 'different' : 'same'
    if (result.status !== 'same') process.exitCode = 1
  } catch (error) {
    result.status = 'failed'; result.failure = error.stack ?? String(error); result.errors = errors
    process.exitCode = 1
  } finally {
    await save(`candidate-${name}.json`, result)
    await save(`module-files-candidate-${name}.json`, [...moduleFilesRead].sort())
    console.log(JSON.stringify({ engine: name, status: result.status, bootMs: result.bootMs, actors: result.actors, boot: result.boot?.status,
      differing: result.differences?.length, scenarios: result.scenarioCount, scenarioStatus: result.scenarioStatus, scenarioDiffs: result.scenarioDifferences?.length, scenarioSample: result.scenarioDifferences?.slice(0, 2), sample: result.differences?.[0]?.diff?.slice(0, 3), failure: result.failure?.slice(0, 600), errors: errors.slice(0, 8) }, null, 1))
    await browser.close()
  }
}
