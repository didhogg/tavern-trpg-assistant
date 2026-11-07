// e 段对答案：12 个现成角色逐级升级（官方页 vs 插件小窗）；全量 2014 职业/种族/背景用作者转出的
// 条目调官方 forNewItem 列建卡步骤。期望值不手写，全部由 dnd5e 管理器产生。
import fs from 'node:fs'
import { join } from 'node:path'
import { chromium, webkit } from 'playwright-core'
import { assets, root, save } from './assets.mjs'
import { bootOfficial, loadOfficial } from './official.mjs'
import { openKernel } from './kernel-page.mjs'

const effects = JSON.parse(fs.readFileSync(join(root, 'work/p3-2-measurement/effects-chrome.json'), 'utf8'))
const builds = Object.fromEntries(['class', 'race', 'background'].map(kind => [kind,
  effects.rows.filter(row => row.kind === kind && row.system && !row.error && !row.notAttempted)
    .map(row => ({ name: row.name, type: row.type, system: row.system, effects: row.effects ?? [] }))]))
const LIMIT = process.env.LIMIT ? Number(process.env.LIMIT) : Infinity
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

for (const [name, engine, launch] of [
  ['chrome', chromium, { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true }],
  ['webkit', webkit, { headless: true }],
]) {
  if (process.env.ENGINE && process.env.ENGINE !== name) continue
  const browser = await engine.launch(launch)
  const result = { engine: name, levelUps: { count: 0, stepsSame: 0, applySame: 0, stepDiffs: [], applyDiffs: [] }, build: {}, errors: [] }
  try {
    const oracle = await (await browser.newContext({ bypassCSP: true })).newPage()
    await loadOfficial(oracle, input.moduleRoots)
    await bootOfficial(oracle, input, { upstreams: true, headlessFull: true })
    const errors = []
    const kernel = await (await browser.newContext()).newPage()
    await openKernel(kernel, input, errors)

    const characters = await kernel.evaluate(async () => {
      const actors = await globalThis.__kernel.call('preparedActors')
      return actors.filter(a => a.source.type === 'character').map(a => ({
        id: a.source._id, name: a.name,
        classId: (a.source.items ?? []).find(i => i.type === 'class')?._id ?? null,
      })).filter(a => a.classId)
    })
    for (const character of characters.slice(0, LIMIT)) {
      const [stepsO, stepsK] = await Promise.all([
        oracle.evaluate(([id, classId]) => KernelCommandsModule.KERNEL_COMMANDS.levelUpSteps(id, classId, 1), [character.id, character.classId]),
        kernel.evaluate(([id, classId]) => globalThis.__kernel.call('levelUpSteps', id, classId, 1), [character.id, character.classId]),
      ])
      const stepDiff = differences(normalize(stepsO.result), normalize(stepsK.result))
      if (stepDiff.length) result.levelUps.stepDiffs.push({ name: character.name, diff: stepDiff.slice(0, 10) })
      else result.levelUps.stepsSame++
      const [applyO, applyK] = await Promise.all([
        oracle.evaluate(([id, classId]) => KernelCommandsModule.KERNEL_COMMANDS.levelUpApply(id, classId, 1), [character.id, character.classId]),
        kernel.evaluate(([id, classId]) => globalThis.__kernel.call('levelUpApply', id, classId, 1), [character.id, character.classId]),
      ])
      const applyDiff = differences(normalize(applyO.result), normalize(applyK.result))
      if (applyDiff.length) result.levelUps.applyDiffs.push({ name: character.name, diff: applyDiff.slice(0, 10) })
      else result.levelUps.applySame++
      result.levelUps.count++
    }

    for (const [kind, items] of Object.entries(builds)) {
      const tally = { count: 0, same: 0, empty: 0, errors: 0, diffs: [] }
      for (const item of items.slice(0, LIMIT)) {
        const [a, b] = await Promise.all([
          oracle.evaluate(item => KernelCommandsModule.KERNEL_COMMANDS.buildSteps(item), item),
          kernel.evaluate(item => globalThis.__kernel.call('buildSteps', item), item),
        ])
        tally.count++
        if (a.status === 'error' || b.status === 'error') { tally.errors++; if (tally.errors <= 5) tally.diffs.push({ name: item.name, expected: a.error ?? null, actual: b.error ?? null }) ; continue }
        if (!a.result?.steps?.length) tally.empty++
        const diff = differences(normalize(a.result), normalize(b.result))
        if (diff.length) { if (tally.diffs.length < 5) tally.diffs.push({ name: item.name, diff: diff.slice(0, 8) }) } else tally.same++
      }
      result.build[kind] = tally
      console.log(name, kind, JSON.stringify({ ...tally, diffs: tally.diffs.length }))
    }
    result.kernelErrors = errors
  } catch (error) {
    result.failure = error.stack ?? String(error)
    process.exitCode = 1
  } finally {
    const bad = result.levelUps.stepDiffs.length || result.levelUps.applyDiffs.length
      || Object.values(result.build).some(t => t.errors || t.diffs.length)
    if (bad) process.exitCode = 1
    await save(`build-${name}.json`, result)
    console.log(JSON.stringify({ engine: name, levelUps: { ...result.levelUps, stepDiffs: result.levelUps.stepDiffs.length, applyDiffs: result.levelUps.applyDiffs.length },
      build: Object.fromEntries(Object.entries(result.build).map(([k, v]) => [k, { ...v, diffs: v.diffs.length }])), failure: result.failure?.slice(0, 400) }, null, 1))
    await browser.close()
  }
}
