// 骰子题组（蓝图 §4 a 验收 ②；⓪ 探路报告 §10.5）。同一浏览器里三个页面：
//   演示站官方原件（Foundry + dnd5e）= 标准答案；插件结算小窗；插件骰盘用的作者小窗（5etools 骰子程序）。
// 题目不手写：作者条目里的真实骰式（⓪ 探路由作者标签解析得到，work/e2e-lib/p3-2-probe-chrome.json），
// 加 dnd5e 原代码按选项枚举生成的 d20 规则组合与暴击伤害组合。
// 每题每轮：官方页缺哪颗骰就按种子补一颗直到掷完，得到标准答案和这串骰点；同一串骰点交给结算小窗（须完全相同）
// 和作者骰子程序（比总数与用掉的骰数）。作者读不了的写法（dnd5e 专用修饰符等）自动单列，不手工翻译。
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { chromium, webkit } from 'playwright-core'
import { assets, root, save } from './assets.mjs'
import { bootOfficial, loadOfficial } from './official.mjs'
import { openKernel, unexpectedErrors } from './kernel-page.mjs'
import { openAuthor } from './author-page.mjs'

const TRIALS = Number(process.env.TRIALS ?? 5)
const CHUNK = 40
const input = await assets()
const probe = JSON.parse(await readFile(join(root, 'work/e2e-lib/p3-2-probe-chrome.json'), 'utf8'))
const real = []
for (const row of probe.numericCorpus.rows) {
  if (row.parsed) real.push(row.expression)
  else for (const b of row.choiceBranches ?? []) if (b.parsed) real.push(b.expression.trim())
}

/** 题目：全部由 dnd5e 原代码构造（构造失败 = Foundry 读不了，单列）。 */
const CASES = real => {
  const { D20Roll, DamageRoll, BasicRoll } = CONFIG.Dice
  const list = []
  const add = (group, label, kind, formula, options, Cls) => {
    try { list.push({ group, label, build: { kind, ...(options ? { options } : {}) }, input: formula, formula: new Cls(formula, {}, options ? structuredClone(options) : undefined).formula }) }
    catch (e) { list.push({ group, label, foundryCannotParse: String(e.message).slice(0, 200) }) }
  }
  for (const f of real) add('real', f, 'basic', f, null, BasicRoll)
  for (const advantageMode of [-1, 0, 1]) for (const elvenAccuracy of [false, true]) for (const halflingLucky of [false, true])
    for (const minimum of [undefined, 10]) for (const criticalSuccess of [20, 19]) {
      const options = { advantageMode, elvenAccuracy, halflingLucky, ...(minimum ? { minimum } : {}), criticalSuccess }
      add('d20', JSON.stringify(options), 'd20', '1d20 + 5', options, D20Roll)
    }
  for (const f of real) {
    if (!/\dd\d|^d\d|[^a-z]d\d/i.test(f)) continue
    for (const multiplyNumeric of [false, true]) for (const powerfulCritical of [false, true]) for (const bonusDice of [0, 1]) {
      const options = { isCritical: true, critical: { multiplyNumeric, powerfulCritical, bonusDice } }
      add('crit', `${f} ${JSON.stringify(options.critical)}`, 'damage', f, options, DamageRoll)
    }
  }
  return list
}

/** 标准答案：官方页按种子补骰直到掷完（结算命令同一段代码，缺骰时报“还要几面骰”）。 */
const ANSWER = async ({ cases, trials }) => {
  const out = []
  for (const c of cases) {
    const rows = []
    for (let t = 0; t < trials; t++) {
      let s = (1000 + t) >>> 0
      const rand = () => { s = (s + 0x6D2B79F5) >>> 0; let x = s; x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296 }
      const points = []
      let r
      for (let k = 0; k < 500; k++) {
        r = await KernelCommandsModule.KERNEL_COMMANDS.roll(c.input, {}, points, c.build)
        if (r.status !== 'missing') break
        points.push(1 + Math.floor(rand() * r.missing.dice.faces))
      }
      rows.push({ points, result: { status: r.status, result: r.result, diceUsed: r.diceUsed, error: r.error ?? null } })
    }
    out.push(rows)
  }
  return out
}

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)

for (const [name, engine, launch] of [
  ['chrome', chromium, { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true }],
  ['webkit', webkit, { headless: true }],
]) {
  if (process.env.ENGINE && process.env.ENGINE !== name) continue
  const browser = await engine.launch(launch)
  const result = { engine: name, trials: TRIALS, tally: {}, kernelDifferences: [], author: { cannotRead: [], different: [], dnd5eSyntax: [] }, foundryCannotParse: [], officialNotComplete: [] }
  try {
    const oracle = await (await browser.newContext({ bypassCSP: true })).newPage()
    console.error('stage: oracle'); await loadOfficial(oracle, input.moduleRoots)
    await bootOfficial(oracle, input, { upstreams: true, headlessFull: true, moduleIds: ['lib-wrapper'] })
    const errors = []
    const kernel = await (await browser.newContext()).newPage()
    console.error('stage: kernel'); await openKernel(kernel, input, errors, { moduleIds: ['lib-wrapper'] })
    const author = await (await browser.newContext()).newPage()
    console.error('stage: author'); const authorBoot = await openAuthor(author, errors)
    result.authorFailures = authorBoot.failures
    const cases = await oracle.evaluate(CASES, real)
    for (let i = 0; i < cases.length; i += CHUNK) {
      const chunk = cases.slice(i, i + CHUNK)
      const live = chunk.filter(c => c.build)
      const answers = await oracle.evaluate(ANSWER, { cases: live, trials: TRIALS })
      const jobs = live.flatMap((c, k) => answers[k].map(a => ({ c, a })))
      const [mine, theirs] = await Promise.all([
        kernel.evaluate(async jobs => {
          const out = []
          for (const { c, a } of jobs) {
            const r = await globalThis.__kernel.call('roll', c.input, {}, a.points, c.build)
            out.push({ status: r.status, result: r.result, diceUsed: r.diceUsed, error: r.error ?? null })
          }
          return out
        }, jobs),
        author.evaluate(async jobs => {
          const out = []
          for (const { c, a } of jobs) out.push(await globalThis.__author.call('diceRoll', c.formula, a.points))
          return out
        }, jobs),
      ])
      for (const c of chunk) {
        const t = (result.tally[c.group] ??= { cases: 0, foundryCannotParse: 0, kernelSame: 0, kernelDifferent: 0, officialNotComplete: 0, authorSame: 0, authorCannotRead: 0, authorDnd5eSyntax: 0, authorDifferent: 0 })
        t.cases++
        if (!c.build) { t.foundryCannotParse++; result.foundryCannotParse.push({ group: c.group, label: c.label, error: c.foundryCannotParse }); continue }
      }
      jobs.forEach(({ c, a }, j) => {
        const t = result.tally[c.group]
        if (same(a.result, mine[j])) t.kernelSame++
        else { t.kernelDifferent++; result.kernelDifferences.push({ group: c.group, label: c.label, points: a.points, expected: a.result, actual: mine[j] }) }
        const au = theirs[j]
        if (a.result.status !== 'complete') {
          t.officialNotComplete++
          if (!result.officialNotComplete.some(x => x.label === c.label)) result.officialNotComplete.push({ group: c.group, label: c.label, status: a.result.status, error: a.result.error })
          return
        }
        const ok = au.status === 'complete' && au.total === a.result.result.total && au.used.length === a.points.length
        // d20 规则组合是 dnd5e 专用写法（adv、min10、r1=1…），作者骰子程序没有这些写法：读法不同的单列，不计为差异，不手工翻译
        if (c.group === 'd20' && au.status !== 'unsupported' && !ok) { t.authorDnd5eSyntax++; if (!result.author.dnd5eSyntax.some(x => x.formula === c.formula)) result.author.dnd5eSyntax.push({ formula: c.formula, example: { points: a.points, official: a.result.result.total, author: au.total } }); return }
        if (au.status === 'unsupported') { t.authorCannotRead++; if (!result.author.cannotRead.some(x => x.formula === c.formula)) result.author.cannotRead.push({ group: c.group, formula: c.formula }) }
        else if (ok) t.authorSame++
        else { t.authorDifferent++; result.author.different.push({ group: c.group, label: c.label, formula: c.formula, points: a.points, official: a.result.result.total, author: au }) }
      })
      process.stdout.write(`\r${name} ${Math.min(i + CHUNK, cases.length)}/${cases.length}   `)
    }
    result.errors = errors
    result.unexpectedErrors = unexpectedErrors(errors)
  } catch (error) {
    result.failure = error.stack ?? String(error)
  } finally {
    if (result.failure || result.kernelDifferences.length || result.author.different.length || result.unexpectedErrors?.length) process.exitCode = 1
    await save(`dice-${name}.json`, result)
    console.log(`\n${name}`, JSON.stringify({ tally: result.tally, kernelDifferences: result.kernelDifferences.length, authorDifferent: result.author.different.length, authorCannotRead: result.author.cannotRead.length, authorDnd5eSyntax: result.author.dnd5eSyntax.length, officialNotComplete: result.officialNotComplete.slice(0, 5), unexpectedErrors: result.unexpectedErrors, failure: result.failure?.slice(0, 500) }, null, 1))
    await browser.close()
  }
}
