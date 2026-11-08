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
    const template = actors.find(a => a.name.startsWith('Akra')).source
    const monster = actors.find(a => a.name === 'Goblin').source
    const kindItems = template.items.filter(i => ['race', 'background', 'class'].includes(i.type))
    const weaponTemplate = template.items.find(i => i.type === 'weapon' && Object.values(i.system?.activities ?? {}).some(a => a.type === 'attack'))
    const spell = template.items.find(i => i.type === 'spell' && i.system.level > 0
      && Object.values(i.system.activities ?? {}).some(a => !a.target?.template?.type))
    const activity = spell && Object.values(spell.system.activities).find(a => !a.target?.template?.type)
    const before = { monsterHp: monster.system.attributes.hp.value, level: template.system.details.level }

    // 建卡：空白人物 → 种族/背景/职业 → 起始武器；全部走官方 AdvancementManager。
    const build = await globalThis.__kernel.call('buildCharacter', 'P3-4 新角色', kindItems, weaponTemplate ? [weaponTemplate] : [])
    const built = build.result ?? {}
    const heroId = built.id
    const weapon = (built.weapons ?? []).find(w => w.activities.some(a => a.type === 'attack'))
    if (!heroId || !weapon) throw new Error(`buildCharacter did not produce an armed actor: ${JSON.stringify(build).slice(0, 500)}`)

    // 开战：掷先攻；若怪物先动，推进到英雄回合。
    const combat = await globalThis.__kernel.call('combatStart', [heroId, monster._id], [20, 1])
    let turn = combat
    for (let i = 0; i < 4 && turn.result?.current !== heroId && turn.status === 'complete'; i++) {
      turn = await globalThis.__kernel.call('combatNext', [3])
    }

    // 英雄攻击怪物：攻击检定 → 伤害总点数 → 对怪物 applyDamage（不再写死 5 点）。
    const attack = await globalThis.__kernel.call('attack', heroId, weapon.id, [20, 4, 4, 4, 4, 4, 4, 4])
    const damageTotal = attack.result?.damage?.[0]?.total ?? 0
    const damageType = weapon.damageType ?? 'slashing'
    const fight = damageTotal > 0
      ? await globalThis.__kernel.call('damage', monster._id, [{ value: damageTotal, type: damageType }], [], {})
      : { status: 'error', error: 'attack produced no damage', changes: [] }
    const afterTurn = await globalThis.__kernel.call('combatNext', [3])

    // 施法：用模板角色的无范围模板法术，验证法术位/专注（不影响建卡角色）。
    const cast = spell ? await globalThis.__kernel.call('cast', template._id, spell._id, activity._id, points, { create: { measuredTemplate: false } }) : null
    const unsupported = await globalThis.__kernel.call('unsupported')
    const unsupportedRows = Array.isArray(unsupported) ? unsupported : (unsupported.result ?? [])
    return {
      ids: { hero: heroId, monster: monster._id, weapon: weapon.id, spell: spell?._id ?? null },
      names: { hero: built.name ?? 'P3-4 新角色', monster: monster.name, weapon: weapon.name, spell: spell?.name ?? null },
      before,
      build: { status: build.status, result: built, changes: build.changes, sources: build.sources },
      combat: { status: combat.status, result: combat.result, changes: combat.changes },
      turn: { status: turn.status, result: turn.result, changes: turn.changes },
      attack: { status: attack.status, result: attack.result, changes: attack.changes },
      fight: { status: fight.status, result: fight.result, changes: fight.changes },
      afterTurn: { status: afterTurn.status, result: afterTurn.result, changes: afterTurn.changes },
      cast: cast ? { status: cast.status, result: cast.result, changes: cast.changes, sources: cast.sources } : null,
      unsupported: { count: unsupportedRows.length, sample: unsupportedRows.slice(0, 5) },
      provenance: {
        build: { level: built.level ?? null, hp: built.hp?.value ?? null },
        attack: { total: attack.result?.attack?.[0]?.total ?? null, damage: damageTotal, type: damageType },
        fight: { before: before.monsterHp, after: fight.result?.hp?.value ?? null },
        turn: { round: afterTurn.result?.round ?? null, current: afterTurn.result?.current ?? null },
        cast: { before: template.system.spells?.spell1?.value ?? null, after: cast?.result?.slots?.spell1?.value ?? null },
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
    const keys = ['build', 'combat', 'turn', 'attack', 'fight', 'afterTurn', 'cast']
    result.replayDiffs = keys.flatMap(key => result.first[key] && result.replay[key]
      ? differences(normalize(result.first[key]), normalize(result.replay[key]), key).map(d => ({ key, ...d })) : [])
    result.passed = result.first.build.status === 'complete'
      && result.first.combat.status === 'complete'
      && result.first.turn.status === 'complete'
      && result.first.fight.status === 'complete'
      && result.first.provenance.fight.after < result.first.provenance.fight.before
      && result.replayDiffs.length === 0
  } catch (error) {
    result.failure = error.stack ?? String(error)
    process.exitCode = 1
  } finally {
    if (!result.passed) process.exitCode = 1
    await save(`p3-4-kernel-${name}.json`, result)
    console.log(JSON.stringify({ engine: name, passed: result.passed, ids: result.first?.ids,
      build: result.first?.build?.status, combat: result.first?.combat?.status, turn: result.first?.turn?.status,
      attack: result.first?.attack?.status, fight: result.first?.fight?.status, cast: result.first?.cast?.status,
      provenance: result.first?.provenance, replayDiffs: result.replayDiffs?.length,
      unsupported: result.first?.unsupported?.count, failure: result.failure?.slice(0, 400) }, null, 1))
    await browser.close()
  }
}
