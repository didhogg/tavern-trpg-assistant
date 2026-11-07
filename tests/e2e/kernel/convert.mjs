// Plutonium 全量转换对答案（蓝图 §4 a 验收 ③）：作者加载器展开的 2014 全量条目（⓪探路存下的同一份输入），
// 同一浏览器里演示站官方原件页与插件结算小窗各转一遍（照 ⓪ 探路调用作者转换器），每批当场逐项比较，只记差异。
// 条目文件：work/p3-2-measurement/corpus-chrome.json（探路时由作者 DataLoader 生成，不手改）。
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { chromium, webkit } from 'playwright-core'
import { assets, root, save } from './assets.mjs'
import { bootOfficial, loadOfficial } from './official.mjs'
import { moduleFilesRead, openKernel } from './kernel-page.mjs'

const BATCH = Number(process.env.BATCH ?? 50)
const LIMIT = process.env.LIMIT ? Number(process.env.LIMIT) : Infinity
const input = await assets()
const corpus = JSON.parse(await readFile(join(root, 'work/p3-2-measurement/corpus-chrome.json'), 'utf8'))
const PROPS = Object.keys(corpus).filter(k => Array.isArray(corpus[k]) && (!process.env.PROPS || process.env.PROPS.split(',').includes(k)))

// 作者转换器把“站点地址”写进文中链接：两边页面地址不同（演示站 / 插件小窗），比较前统一成同一个占位，不改其他内容。
const SITE = /https:\/\/demo\.foundryvtt\.com\/|http:\/\/kernel\.test\/vendor\/foundry\//g
const site = v => typeof v === 'string' ? v.replace(SITE, '{SITE}/') : v
const normalize = v => typeof v === 'string' ? site(v) : Array.isArray(v) ? v.map(normalize) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map(k => [k, normalize(v[k])])) : v
function differences(a, b, path = '', out = []) {
  if (out.length > 20 || JSON.stringify(a) === JSON.stringify(b)) return out
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
  const result = { engine: name, props: {}, differences: [] }
  try {
    const oracle = await (await browser.newContext({ bypassCSP: true })).newPage()
    console.error('stage: oracle load'); await loadOfficial(oracle, input.moduleRoots)
    console.error('stage: oracle boot')
    // 照探路：只启用 libWrapper，Plutonium 由转换命令按探路方式从原包源码执行一次取出作者转换器。
    await bootOfficial(oracle, input, { upstreams: true, headlessFull: true, moduleIds: ['lib-wrapper'] })
    const errors = []
    const kernel = await (await browser.newContext()).newPage()
    console.error('stage: kernel open'); await openKernel(kernel, input, errors, { moduleIds: ['lib-wrapper'] })
    console.error('stage: convert')
    const started = Date.now()
    for (const prop of PROPS) {
      const entries = corpus[prop].slice(0, LIMIT)
      const tally = (result.props[prop] = { entries: entries.length, status: {}, same: 0, different: 0 })
      for (let i = 0; i < entries.length; i += BATCH) {
        const batch = entries.slice(i, i + BATCH)
        const [expected, actual] = await Promise.all([
          oracle.evaluate(([p, b, c]) => KernelCommandsModule.KERNEL_COMMANDS.convert(p, b, { class: c }), [prop, batch, corpus.class]),
          kernel.evaluate(([p, b, c]) => globalThis.__kernel.call('convert', p, b, { class: c }), [prop, batch, corpus.class]),
        ])
        batch.forEach((entry, j) => {
          const s = actual[j]?.error ? 'error' : actual[j]?.notAttempted ? 'boundary' : 'converted'
          tally.status[s] = (tally.status[s] ?? 0) + 1
          const diff = differences(normalize(expected[j]), normalize(actual[j]))
          if (diff.length) { tally.different++; result.differences.push({ prop, name: entry.name, source: entry.source, diff: diff.slice(0, 8) }) }
          else tally.same++
        })
        process.stdout.write(`\r${name} ${prop} ${Math.min(i + BATCH, entries.length)}/${entries.length}   `)
      }
      console.log(`\n${name} ${prop}`, JSON.stringify(tally))
    }
    result.ms = Date.now() - started
    result.errors = errors
  } catch (error) {
    result.failure = error.stack ?? String(error)
    process.exitCode = 1
  } finally {
    if (result.differences.length) process.exitCode = 1
    await save(`convert-${name}.json`, result)
    await save(`module-files-convert-${name}.json`, [...moduleFilesRead].sort())
    console.log(JSON.stringify({ engine: name, ms: result.ms, differences: result.differences.length, sample: result.differences.slice(0, 2), failure: result.failure?.slice(0, 500) }, null, 1))
    await browser.close()
  }
}
