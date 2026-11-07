// P3-2 ⓪ 探路（D2-P3 整体设计 §3、§9）：在真实作者小窗（中文程序 + 中文官方数据）里验证结算内核要调用的作者入口能否脱离作者界面使用。
//  1. 骰子：作者骰式语言（Renderer.dice.lang）解析、平均/最小/最大值；把随机数换成给定点数后同点数同结果
//  2. 条目标签 → 骰式（Renderer.utils.getTagEntry、Renderer.parseScaleDice）：用真实火球术、地精
//  3. 表格：哪些列能掷（RollerUtil.getColRollType）、每行的点数范围（Renderer.getRollableRow）
//  4. 2014 遭遇难度（encounterbuilder 的 classic 规则部分，不建界面）
//  5. 点数购买 / 标准数组（statgen 的默认规则，不建界面）
//  6. preparedSpells 公式（<$level$> 等写法）代入数值后，用作者骰式语言能否算出
// 只读作者行为，不改插件代码。沿用 P3-1 的浏览器资料夹（已装中文官方）。
import { mkdir, writeFile, readFile } from 'node:fs/promises'
import { build } from 'vite'
import { chromium, webkit } from 'playwright-core'
import { root, startStatic } from './static.mjs'
import { probeNumericCorpus } from './p3-2-numeric-browser.mjs'
import assert from 'node:assert/strict'

const work = `${root}work/e2e-lib`
await mkdir(work, { recursive: true })
await build({ configFile: `${root}vite.config.ts`, root, logLevel: 'error' })
await build({ configFile: false, root, logLevel: 'error', build: {
  lib: { entry: `${root}tests/e2e/library/harness.ts`, formats: ['es'], fileName: () => 'harness.js' },
  outDir: work, emptyOutDir: false,
} })
const { server, url } = await startStatic({ port: 47319 })
const engines = [
  ['chrome', chromium, { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true }],
  ['webkit', webkit, { headless: true }],
]

async function probeInFrame() {
  const W = window
  const out = {}
  const tryIt = async (k, fn) => { try { out[k] = await fn() } catch (e) { out[k] = { error: String(e?.stack ?? e).split('\n').slice(0, 3).join(' | ') } } }
  const imp = (p) => import(new URL(`js/${p}`, location.href).href)

  // 用给定点数代替随机数（作者 Dice._facesToValue 的 evl 只调 RollerUtil.randomise）
  const withRolls = (rolls, fn) => {
    const orig = W.RollerUtil.randomise
    const asked = []
    let i = 0
    W.RollerUtil.randomise = (max, _min = 1) => { asked.push(max); if (i >= rolls.length) throw new Error(`给定点数不够（第 ${i + 1} 颗 d${max}）`); return rolls[i++] }
    try { return { value: fn(), asked, used: i } } finally { W.RollerUtil.randomise = orig }
  }
  const evalWith = (str, rolls, meta = {}) => {
    const wrp = W.Renderer.dice.lang.getTree3(str)
    if (!wrp) return { str, parsed: false }
    const m = { ...meta }
    const r = withRolls(rolls, () => wrp.tree.evl(m))
    return { str, value: r.value, asked: r.asked, used: r.used, text: m.text ?? null }
  }

  await tryIt('diceParse', () => {
    const exprs = ['8d6', '2d6+3', '1d20+5', '4d6kh3', '2d20kl1', '4d6dl1', '(1d8+1d6)/2', '1d20+PB', 'max(1, floor(5 + 3/2))', '3d6;4d6', '1d6+#$prompt_number:title=几环$#', '看不懂']
    return exprs.map((s) => {
      const wrp = W.Renderer.dice.lang.getTree3(s)
      if (!wrp) return { s, parsed: false }
      const f = (k) => { try { return wrp.tree[k]({ pb: 2 }) } catch (e) { return `ERR ${e.message}` } }
      return { s, parsed: true, avg: f('avg'), min: f('min'), max: f('max') }
    })
  })

  await tryIt('diceGivenRolls', () => {
    const a = evalWith('4d6kh3', [6, 1, 4, 3])
    const b = evalWith('4d6kh3', [6, 1, 4, 3])
    return {
      kh3: a, same: a.value === b.value,
      plus: evalWith('2d6+3', [5, 2]),
      pb: evalWith('1d20+PB', [12], { pb: 3 }),
      notEnough: (() => { try { return evalWith('8d6', [1, 2]) } catch (e) { return String(e.message) } })(),
      prepared: evalWith('max(1, floor(5 + 3/2))', []),
    }
  })

  // 真实条目里的骰子标签
  await tryIt('tags', async () => {
    const fb = (await W.DataLoader.pCacheAndGetAllSite('spell')).find((s) => s.source === 'PHB' && s.ENG_name === 'Fireball')
    const gob = (await W.DataLoader.pCacheAndGetAllSite('monster')).find((m) => m.source === 'MM' && (m.ENG_name === 'Goblin' || m.name === '地精'))
    const tagsOf = (ent) => [...JSON.stringify(ent).matchAll(/\{@(dice|damage|hit|dc|scaledamage|scaledice|recharge|chance|d20|autodice) ([^}]*)\}/g)].map((m) => [m[1], m[2]])
    const conv = ([tag, text]) => {
      try {
        if (tag === 'scaledamage' || tag === 'scaledice') { const e = W.Renderer.parseScaleDice(`@${tag}`, text); return { tag, text, toRoll: e.toRoll, options: e.prompt?.options } }
        if (tag === 'dc') return { tag, text, note: 'DC 不是骰式' }
        const e = W.Renderer.utils.getTagEntry(`@${tag}`, text)
        return { tag, text, toRoll: e.toRoll, subType: e.subType ?? null, damageType: e.damageType ?? null }
      } catch (e) { return { tag, text, error: e.message } }
    }
    return {
      fireball: fb ? { name: fb.name, ENG_name: fb.ENG_name, source: fb.source, tags: tagsOf(fb).map(conv), higher: JSON.stringify(fb.entriesHigherLevel ?? null).slice(0, 160) } : null,
      goblin: gob ? { name: gob.name, ENG_name: gob.ENG_name, cr: gob.cr, hp: gob.hp, ac: gob.ac, tags: tagsOf(gob).map(conv) } : null,
    }
  })

  await tryIt('table', async () => {
    const tables = (await W.DataLoader.pCacheAndGetAllSite('table')) ?? []
    const t = tables.find((x) => x.colLabels?.[0] && W.RollerUtil.getColRollType(x.colLabels[0]))
    if (!t) return { tables: tables.length, rollable: null }
    const rows = t.rows.slice(0, 4).map((r) => { const rr = W.MiscUtil.copyFast(r); const res = W.Renderer.getRollableRow(rr, { cbErr: () => {} }); return JSON.stringify(res[0]).slice(0, 80) })
    return { tables: tables.length, name: t.name, source: t.source, col0: t.colLabels[0], rollType: W.RollerUtil.getColRollType(t.colLabels[0]), rows }
  })

  await tryIt('encounter', async () => {
    const { EncounterPartyMetaClassic } = await imp('encounterbuilder/partymeta/encounter-partymeta-classic.js')
    const { EncounterBuilderCreatureGroupEntityCreature } = await imp('encounterbuilder/encounterbuilder-models-creaturegroup.js')
    const gob = (await W.DataLoader.pCacheAndGetAllSite('monster')).find((m) => m.source === 'MM' && (m.ENG_name === 'Goblin' || m.name === '地精'))
    const party = new EncounterPartyMetaClassic([{ level: 3, count: 4 }])
    const grp = new EncounterBuilderCreatureGroupEntityCreature({ id: 'g', creature: gob, count: 4 })
    const spend = party.getEncounterSpendInfo([grp])
    return {
      thresholds: party._thresholds, daily: party._dailyBudget,
      spend: { base: spend._baseSpend, adjusted: spend._adjustedSpend, mult: spend._playerAdjustedSpendMult, count: spend._count },
      tier: party.getEncounterTier(spend),
    }
  })

  await tryIt('statgen', async () => {
    const { StatGenUi } = await imp('statgen/statgen-ui.js')
    const st = StatGenUi.prototype._getDefaultState.call(Object.create(StatGenUi.prototype))
    return { standardArray: StatGenUi._STANDARD_ARRAY, budget: st.pb_budget, rules: st.pb_rules.map((r) => [r.entity.score, r.entity.cost]) }
  })

  await tryIt('preparedSpells', async () => {
    const classes = (await W.DataUtil.class.loadJSON()).class ?? []
    const withPrep = classes.filter((c) => c.preparedSpells).map((c) => ({ name: c.name, source: c.source, preparedSpells: c.preparedSpells }))
    const sample = withPrep[0]
    const expr = sample && `max(1, floor(${sample.preparedSpells.replace(/<\$level\$>/g, '5').replace(/<\$(str|dex|con|int|wis|cha)_mod\$>/g, '3')}))`
    return { count: withPrep.length, forms: [...new Set(withPrep.map((c) => c.preparedSpells))], sample, expr, value: expr ? evalWith(expr, []).value : null }
  })

  out.frameErrors = [...(W.__trpgFrameErrors ?? [])]
  return out
}

const results = []
for (const [name, type, options] of engines) {
  if (process.env.ENGINE && process.env.ENGINE !== name) continue
  const ctx = await type.launchPersistentContext(`${work}/profile-p3-1-${name}`, options)
  const page = await ctx.newPage()
  page.setDefaultTimeout(3600000)
  const errors = []
  page.on('pageerror', (e) => errors.push(e.stack.split('\n').slice(0, 2).join(' | ')))
  const r = { engine: name }
  try {
    await page.goto(url)
    r.setup = await page.evaluate(async () => {
      const h = await import('/work/e2e-lib/harness.js')
      const set = await h.offlineAudit('cn-official')
      if (set.set?.status !== 'installed' || set.ok !== set.planFiles) await h.install('cn-official')
      const ready = await h.startFrames(['cn'], { allowNetwork: false })
      await h.callFrame('cn', 'init')
      return ready
    })
    const frame = page.frames().filter((f) => f.url().includes('/vendor/cn/frame.html')).pop()
    r.probe = await frame.evaluate(probeInFrame)
    const corpus = JSON.parse(await readFile(`${root}work/p3-2-measurement/corpus-${name}.json`, 'utf8'))
    r.numericCorpus = await frame.evaluate(probeNumericCorpus, corpus)
    assert.equal(r.probe.diceGivenRolls.same, true)
    assert.equal(r.probe.diceGivenRolls.kh3.value, 13)
    assert.equal(r.probe.diceGivenRolls.plus.value, 10)
    assert.equal(r.probe.tags.fireball.ENG_name, 'Fireball')
    assert.equal(r.probe.encounter.tier, 'easy')
    assert.equal(r.probe.statgen.budget, 27)
    assert.equal(r.probe.frameErrors.length, 0)
    assert.equal(r.numericCorpus.preparedErrors.length, 0)
    assert(!r.numericCorpus.rows.some(row => row.sameResult === false))
    r.assertionsPassed = true
  } catch (e) { r.fatal = e.stack } finally { r.errors = errors; await ctx.close() }
  if (r.fatal || r.errors.length) process.exitCode = 1
  results.push(r)
  await writeFile(`${work}/p3-2-probe-${name}.json`, JSON.stringify(r, null, 2))
  console.log(name, JSON.stringify(r, null, 1))
}
server.close()
