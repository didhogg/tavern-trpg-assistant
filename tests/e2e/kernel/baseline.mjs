// 演示站官方原件的标准答案：352 个现成角色/怪物启动后的数据。失败时保存证据并返回非零。
import assert from 'node:assert/strict'
import { chromium, webkit } from 'playwright-core'
import { assets, digest, save } from './assets.mjs'
import { bootOfficial, loadOfficial } from './official.mjs'
import { scenarioList } from './scenarios.mjs'

const input = await assets()
await save('input.json', { system: input.manifest.version, bundle: digest(input.compiled.outputFiles[0].text),
  actors: input.actors.length, actorsDigest: digest(JSON.stringify(input.actors)) })
for (const [name, engine, launch] of [
  ['chrome', chromium, { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true }],
  ['webkit', webkit, { headless: true }],
]) {
  if (process.env.ENGINE && process.env.ENGINE !== name) continue
  const browser = await engine.launch(launch)
  const page = await (await browser.newContext({ bypassCSP: true, viewport: { width: 1440, height: 900 } })).newPage()
  let diagnostics; const result = { engine: name, method: process.env.TIME_METHOD ?? 'sync', upstreams: process.env.WITH_UPSTREAMS === '1', fullHost: process.env.FULL_HOST === '1', headlessFull: process.env.HEADLESS_FULL === '1' }
  try {
    diagnostics = await loadOfficial(page, input.moduleRoots)
    let timeout
    try {
      result.boot = await Promise.race([bootOfficial(page, input, { timeMethod: result.method, upstreams: result.upstreams, fullHost: result.fullHost, headlessFull: result.headlessFull }),
        new Promise((_, reject) => { timeout = setTimeout(() => reject(Error('Official boot exceeded 30 seconds')), 30_000) })])
    } finally { clearTimeout(timeout) }
    if (result.upstreams && (result.fullHost || result.headlessFull)) {
      await page.waitForFunction(() => typeof game.modules.get('plutonium')?.api === 'object', null, { timeout: 15_000 })
      result.boot.plutoniumApi = await page.evaluate(() => typeof game.modules.get('plutonium')?.api)
    }
    result.actors = await page.evaluate(() => game.actors.contents.map(a => ({ source: a.toObject(),
      system: a.system.toObject(false), name: a.name, validation: a.validationFailures })))
    result.errors = diagnostics.errors
    // Plutonium 明确允许未安装独立后端；保留诊断原文，仅单列该可选端点的 HTTP/浏览器报错。
    result.optionalBackend = result.errors.filter(e => (e.kind === 'http' && e.message === '404: https://demo.foundryvtt.com/api/plutonium')
      || (e.kind === 'console' && e.location?.url === 'https://demo.foundryvtt.com/api/plutonium' && e.message.includes('404')))
    result.unexpectedErrors = result.errors.filter(e => !result.optionalBackend.includes(e))
    assert.equal(result.boot.actors, input.actors.length)
    assert.equal(result.boot.invalid.length, 0)
    assert.equal(result.boot.worldTime, 0)
    assert.equal(result.boot.rules, 'legacy')
    assert.equal(result.unexpectedErrors.length, 0, 'Official baseline has unexpected errors')
    if (result.headlessFull && result.upstreams) {
      // 结算场景：同一份命令代码（commands.ts），结果交给 candidate.mjs 逐项比较。
      result.scenarios = await page.evaluate(async list => {
        const out = []
        for (const [fn, ...args] of list) out.push(await KernelCommandsModule.KERNEL_COMMANDS[fn](...args))
        return out
      }, scenarioList(input.actors))
    }
    result.status = result.headlessFull || result.fullHost ? 'headless-ready' : 'prepared-only'
  } catch (error) {
    result.status = 'failed'
    result.failure = error.stack ?? String(error)
    result.errors = diagnostics?.errors ?? []
    let timer
    try {
      result.progress = await Promise.race([page.evaluate(() => ({ trace: globalThis.__kernelOracleProgress,
        dialogs: [...document.querySelectorAll('dialog, [role="dialog"]')].map(e => e.textContent?.slice(0, 300)) })),
        new Promise((_, reject) => { timer = setTimeout(() => reject(Error('Trace unavailable: browser remained busy')), 1000) })])
    } catch (traceError) { result.traceFailure = String(traceError) }
    finally { clearTimeout(timer) }
    process.exitCode = 1
  } finally {
    await save(`baseline-${name}-${result.method}${result.upstreams ? '-combined' : ''}${result.fullHost ? '-full' : ''}${result.headlessFull ? '-headless-full' : ''}.json`, result)
    console.log(JSON.stringify({ engine: name, status: result.status, actors: result.boot?.actors, rules: result.boot?.rules,
      worldTime: result.boot?.worldTime, errors: result.errors?.map(e => e.message.split('\n')[0]),
      failure: result.failure?.slice(0, 400) }))
    await browser.close()
  }
}
