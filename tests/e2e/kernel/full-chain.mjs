// P3-4 结算内核半边：真实小窗里建卡升级、打怪、施法，取真实变更计划；再重开一次做断网重放。
import { chromium, webkit } from 'playwright-core'
import { assets, save } from './assets.mjs'
import { openKernel } from './kernel-page.mjs'

const input = await assets()
const points = [3, 1, 4, 1, 2, 4, 2, 3, 4, 4, 1, 2]
const normalize = value => Array.isArray(value) ? value.map(normalize)
  : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map(k => [k, normalize(value[k])])) : value
function differences(a, b, path = '', out = []) {
  if (out.length > 20 || JSON.stringify(a) === JSON.stringify(b)) return out
  if (a && b && typeof a === 'object' && typeof b === 'object' && Array.isArray(a) === Array.isArray(b)) {
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) differences(a[k], b[k], path ? `${path}.${k}` : k, out)
  } else out.push({ path, expected: a, actual: b })
  return out
}

async function run(page) {
  const errors = []
  await openKernel(page, input, errors)
  const out = await page.evaluate(async points => {
    const actors = await globalThis.__kernel.call('preparedActors')
    const hero = actors.find(a => a.name.startsWith('Akra')).source
    const monster = actors.find(a => a.name === 'Goblin').source
    const cls = hero.items.find(i => i.type === 'class')
    const equipped = hero.items.find(i => i.type === 'equipment' && i.system?.type?.value === 'medium')
    const spell = hero.items.find(i => i.type === 'spell' && i.system.level > 0 && i.name === 'Detect Poison and Disease')
    const activity = spell && Object.values(spell.system.activities ?? {})[0]
    const before = { heroHp: hero.system.attributes.hp.value, monsterHp: monster.system.attributes.hp.value,
      level: hero.system.details.level, spellSlot: hero.system.spells?.spell1?.value ?? null }
    const levelUp = await globalThis.__kernel.call('levelUpApply', hero._id, cls._id, 1)
    const equipOff = equipped ? await globalThis.__kernel.call('equip', hero._id, equipped._id, false) : null
    const equipOn = equipped ? await globalThis.__kernel.call('equip', hero._id, equipped._id, true) : null
    const equip = equipOff ? { status: equipOff.status, result: equipOn?.result ?? equipOff.result,
      changes: [...(equipOff.changes ?? []), ...(equipOn?.changes ?? [])], sources: { ...(equipOff.sources ?? {}), ...(equipOn?.sources ?? {}) } } : null
    const cast = spell ? await globalThis.__kernel.call('cast', hero._id, spell._id, activity._id, points) : null
    const damage = await globalThis.__kernel.call('damage', monster._id, [{ value: 5, type: 'slashing' }], [], {})
    const unsupported = await globalThis.__kernel.call('unsupported')
    const unsupportedRows = Array.isArray(unsupported) ? unsupported : (unsupported.result ?? [])
    return {
      ids: { hero: hero._id, monster: monster._id, class: cls._id, equip: equipped?._id ?? null, spell: spell?._id ?? null },
      names: { hero: hero.name, monster: monster.name, spell: spell?.name ?? null },
      before,
      levelUp: { status: levelUp.status, result: levelUp.result, changes: levelUp.changes, sources: levelUp.sources },
      equip: equip ? { status: equip.status, result: equip.result, changes: equip.changes, sources: equip.sources } : null,
      cast: cast ? { status: cast.status, result: cast.result, changes: cast.changes, sources: cast.sources } : null,
      damage: { status: damage.status, result: damage.result, changes: damage.changes, sources: damage.sources },
      unsupported: { count: unsupportedRows.length, sample: unsupportedRows.slice(0, 3) },
      provenance: {
        levelUp: { before: before.level, after: levelUp.result?.level ?? null },
        equip: { item: equipped?.name ?? null, after: equipOn?.result?.item?.equipped ?? null },
        cast: { before: before.spellSlot, after: cast?.result?.slots?.spell1?.value ?? null },
        damage: { before: before.monsterHp, after: damage.result?.hp?.value ?? null, amount: 5, type: 'slashing' },
      },
    }
  }, points)
  return { ...out, errors }
}

for (const [name, engine, launch] of [
  ['chrome', chromium, { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true }],
  ['webkit', webkit, { headless: true }],
]) {
  if (process.env.ENGINE && process.env.ENGINE !== name) continue
  const browser = await engine.launch(launch)
  const result = { engine: name }
  try {
    const page = await (await browser.newContext()).newPage()
    result.first = await run(page)
    await page.close()
    const replay = await (await browser.newContext()).newPage()
    result.replay = await run(replay)
    await replay.close()
    const keys = ['levelUp', 'equip', 'cast', 'damage']
    result.replayDiffs = keys.flatMap(key => result.first[key] && result.replay[key]
      ? differences(normalize(result.first[key]), normalize(result.replay[key]), key).map(d => ({ key, ...d })) : [])
    result.passed = result.first.levelUp.status === 'complete'
      && result.first.damage.status === 'complete'
      && result.replayDiffs.length === 0
  } catch (error) {
    result.failure = error.stack ?? String(error)
    process.exitCode = 1
  } finally {
    if (!result.passed) process.exitCode = 1
    await save(`p3-4-kernel-${name}.json`, result)
    console.log(JSON.stringify({ engine: name, passed: result.passed, ids: result.first?.ids, levelUp: result.first?.levelUp?.status,
      cast: result.first?.cast?.status, damage: result.first?.damage?.status, replayDiffs: result.replayDiffs?.length,
      unsupported: result.first?.unsupported?.count, failure: result.failure?.slice(0, 400) }, null, 1))
    await browser.close()
  }
}
