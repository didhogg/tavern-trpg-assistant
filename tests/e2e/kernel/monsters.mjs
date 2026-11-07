// d 段对答案：全量 2014 怪物用 Plutonium 完整导入器导入（临时 Actor），官方页 vs 插件小窗逐条比；
// 再抽真实怪物做 AC/攻击/传奇动作/施法场景。条数不写死，全部来自作者语料。
import fs from 'node:fs'
import { join } from 'node:path'
import { chromium, webkit } from 'playwright-core'
import { assets, root, save } from './assets.mjs'
import { bootOfficial, loadOfficial } from './official.mjs'
import { openKernel } from './kernel-page.mjs'

const BATCH = Number(process.env.BATCH ?? 25)
const LIMIT = process.env.LIMIT ? Number(process.env.LIMIT) : process.env.FULL ? Infinity : 50
const corpus = JSON.parse(fs.readFileSync(join(root, 'work/p3-2-measurement/corpus-chrome.json'), 'utf8'))
const monsters = corpus.monster.slice(0, LIMIT)
const input = await assets()

const normalize = value => Array.isArray(value) ? value.map(normalize)
  : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map(k => [k, normalize(value[k])])) : value
function differences(a, b, path = '', out = []) {
  if (out.length > 20 || JSON.stringify(a) === JSON.stringify(b)) return out
  if (a && b && typeof a === 'object' && typeof b === 'object' && Array.isArray(a) === Array.isArray(b)) {
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) differences(a[k], b[k], path ? `${path}.${k}` : k, out)
  } else out.push({ path, expected: a, actual: b })
  return out
}

const number = value => {
  if (typeof value === 'number') return value
  const n = Number(String(value ?? '').replace(/\s+/g, ''))
  return Number.isFinite(n) ? n : null
}
const acOf = entry => Array.isArray(entry.ac) ? (entry.ac.find(a => Number.isFinite(a.ac))?.ac ?? null) : number(entry.ac)
const SKILL_KEYS = { acrobatics: 'acr', 'animal handling': 'ani', arcana: 'arc', athletics: 'ath', deception: 'dec', history: 'his',
  insight: 'ins', intimidation: 'itm', investigation: 'inv', medicine: 'med', nature: 'nat', perception: 'prc', performance: 'prf',
  persuasion: 'per', religion: 'rel', 'sleight of hand': 'sle', stealth: 'ste', survival: 'sur' }
const skillKey = name => SKILL_KEYS[String(name).toLowerCase()] ?? name

/** 5etools 写好的数值 vs 导入后的 dnd5e 准备值；只记录，不修数据。 */
function fieldMismatches(entry, row) {
  const out = []
  const hp = number(entry.hp?.average)
  if (hp !== null && row.hp?.max !== null && hp !== row.hp.max) out.push({ field: 'hp', expected: hp, actual: row.hp.max })
  if (number(entry.passive) !== null && row.skills?.prc?.passive !== null && number(entry.passive) !== row.skills.prc.passive) {
    out.push({ field: 'passive', expected: number(entry.passive), actual: row.skills.prc.passive })
  }
  for (const [key, value] of Object.entries(entry.save ?? {})) {
    const expected = number(value)
    const actual = row.abilities?.[key]?.save ?? null
    if (expected !== null && actual !== null && expected !== actual) out.push({ field: `save.${key}`, expected, actual })
  }
  for (const [key, value] of Object.entries(entry.skill ?? {})) {
    const expected = number(value)
    const actual = row.skills?.[skillKey(key)]?.total ?? null
    if (expected !== null && actual !== null && expected !== actual) out.push({ field: `skill.${key}`, expected, actual })
  }
  return out
}

for (const [name, engine, launch] of [
  ['chrome', chromium, { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true }],
  ['webkit', webkit, { headless: true }],
]) {
  if (process.env.ENGINE && process.env.ENGINE !== name) continue
  const browser = await engine.launch(launch)
  const result = { engine: name, total: monsters.length, imported: 0, errors: [], differences: [], fields: {}, samples: {} }
  try {
    const oracle = await (await browser.newContext({ bypassCSP: true })).newPage()
    await loadOfficial(oracle, input.moduleRoots)
    await bootOfficial(oracle, input, { upstreams: true, headlessFull: true })
    await oracle.waitForFunction(() => typeof game.modules.get('plutonium')?.api === 'object', null, { timeout: 15_000 })
    const errors = []
    const kernel = await (await browser.newContext()).newPage()
    await openKernel(kernel, input, errors)

    for (let i = 0; i < monsters.length; i += BATCH) {
      const batch = monsters.slice(i, i + BATCH)
      const [expected, actual] = await Promise.all([
        oracle.evaluate(batch => KernelCommandsModule.KERNEL_COMMANDS.importMonsters(batch), batch),
        kernel.evaluate(batch => globalThis.__kernel.call('importMonsters', batch), batch),
      ])
      const expectedRows = expected.result ?? []
      const actualRows = actual.result ?? []
      batch.forEach((entry, j) => {
        const e = expectedRows[j]
        const a = actualRows[j]
        const row = a ?? e
        if (!row || row.status !== 'taskExitComplete' || row.error) {
          result.errors.push({ name: entry.name, source: entry.source, status: row?.status ?? null, error: row?.error ?? null })
          return
        }
        result.imported++
        const diff = differences(normalize(e), normalize(a))
        if (diff.length) result.differences.push({ name: entry.name, source: entry.source, diff: diff.slice(0, 10) })
        const fields = fieldMismatches(entry, row)
        for (const field of fields) {
          const bucket = result.fields[field.field.split('.')[0]] ??= { count: 0, samples: [] }
          bucket.count++
          if (bucket.samples.length < 10) bucket.samples.push({ name: entry.name, source: entry.source, ...field })
        }
      })
      process.stdout.write(`\r${name} import ${Math.min(i + BATCH, monsters.length)}/${monsters.length}   `)
    }
    console.log(`\n${name} import`, JSON.stringify({ total: result.total, imported: result.imported, errors: result.errors.length,
      differences: result.differences.length, fields: Object.fromEntries(Object.entries(result.fields).map(([k, v]) => [k, v.count])) }))

    // 抽样：真实 Actor 的 AC、攻击；传奇动作/抗性；施法。
    const actionEntries = monsters.filter(m => (m.action ?? []).length).slice(0, 10)
    const legendaryEntries = monsters.filter(m => (m.legendary ?? []).length).slice(0, 3)
    const spellEntries = monsters.filter(m => m.spellcasting).slice(0, 3)
    const sampleEntries = [...new Set([...actionEntries, ...legendaryEntries, ...spellEntries].map(m => `${m.name}|${m.source}`))]
      .map(key => monsters.find(m => `${m.name}|${m.source}` === key))
    result.samples = { action: 0, attackSame: 0, legendary: 0, spell: 0, spellSame: 0, differences: [] }
    for (const entry of sampleEntries) {
      const [oracleActor, kernelActor] = await Promise.all([
        oracle.evaluate(entry => KernelCommandsModule.KERNEL_COMMANDS.importMonsterActor(entry), entry),
        kernel.evaluate(entry => globalThis.__kernel.call('importMonsterActor', entry), entry),
      ])
      const oa = oracleActor.result
      const ka = kernelActor.result
      if (!oa || !ka) { result.samples.differences.push({ name: entry.name, diff: [{ path: 'actor', expected: oa, actual: ka }] }); continue }
      const actorDiff = differences(normalize(oa), normalize(ka))
      if (actorDiff.length) result.samples.differences.push({ name: entry.name, source: entry.source, diff: actorDiff.slice(0, 8) })
      const expectedAc = acOf(entry)
      if (expectedAc !== null && oa.ac !== null && expectedAc !== oa.ac) {
        const bucket = result.fields.ac ??= { count: 0, samples: [] }
        bucket.count++
        if (bucket.samples.length < 10) bucket.samples.push({ name: entry.name, source: entry.source, field: 'ac', expected: expectedAc, actual: oa.ac })
      }
      if ((entry.action ?? []).length) result.samples.action++
      if ((entry.legendary ?? []).length) {
        result.samples.legendary++
        const legExpected = { actions: oa.legendary?.actions, resistances: oa.legendary?.resistances }
        const legActual = { actions: ka.legendary?.actions, resistances: ka.legendary?.resistances }
        const legDiff = differences(normalize(legExpected), normalize(legActual))
        if (legDiff.length) result.samples.differences.push({ name: entry.name, field: 'legendary', diff: legDiff })
      }
      const weapon = (oa.items ?? []).find(item => item.type === 'weapon' && item.activities.some(a => a.type === 'attack'))
      if (weapon) {
        const points = [3, 1, 4, 1, 2, 4, 2, 3, 4, 4, 1, 2]
        const [o, k] = await Promise.all([
          oracle.evaluate(([actorId, itemId, points]) => KernelCommandsModule.KERNEL_COMMANDS.attack(actorId, itemId, points), [oa.id, weapon.id, points]),
          kernel.evaluate(([actorId, itemId, points]) => globalThis.__kernel.call('attack', actorId, itemId, points), [ka.id, weapon.id, points]),
        ])
        const diff = differences(normalize(o.result), normalize(k.result))
        if (diff.length) result.samples.differences.push({ name: entry.name, field: 'attack', diff: diff.slice(0, 8) })
        else result.samples.attackSame++
      }
      const spell = (oa.items ?? []).find(item => item.type === 'spell' && item.activities.length)
      if (spell) {
        const activity = spell.activities[0]
        const points = [3, 1, 4, 1, 2, 4, 2, 3, 4, 4, 1, 2]
        const [o, k] = await Promise.all([
          oracle.evaluate(([actorId, itemId, activityId, points]) => KernelCommandsModule.KERNEL_COMMANDS.cast(actorId, itemId, activityId, points), [oa.id, spell.id, activity.id, points]),
          kernel.evaluate(([actorId, itemId, activityId, points]) => globalThis.__kernel.call('cast', actorId, itemId, activityId, points), [ka.id, spell.id, activity.id, points]),
        ])
        const diff = differences(normalize(o.result), normalize(k.result))
        if (diff.length) result.samples.differences.push({ name: entry.name, field: 'cast', diff: diff.slice(0, 8) })
        else result.samples.spellSame++
        result.samples.spell++
      }
    }
    result.kernelErrors = errors
  } catch (error) {
    result.failure = error.stack ?? String(error)
    process.exitCode = 1
  } finally {
    if (result.errors.length || result.differences.length || result.samples?.differences?.length) process.exitCode = 1
    await save(`monsters-${name}.json`, result)
    console.log(JSON.stringify({ engine: name, total: result.total, imported: result.imported, errors: result.errors.length,
      differences: result.differences.length, fields: result.fields, samples: result.samples ? { ...result.samples, differences: result.samples.differences.length } : null,
      failure: result.failure?.slice(0, 400) }, null, 1))
    await browser.close()
  }
}
