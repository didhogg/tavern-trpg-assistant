// P3-3b / P3-4 完整链路共用（Node 侧）：构建、结算小窗输入、浏览器列表、逐项比对、怪物受击、已单列报错。
import { mkdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { build } from 'vite'
import { chromium, webkit } from 'playwright-core'
import { root } from './static.mjs'

export const work = `${root}work/e2e-lib`

export async function buildAll() {
  await mkdir(work, { recursive: true })
  await build({ configFile: `${root}vite.config.ts`, root, logLevel: 'error' })
  await build({ configFile: false, root, logLevel: 'error', build: {
    lib: { entry: `${root}tests/e2e/library/harness.ts`, formats: ['es'], fileName: () => 'harness.js' },
    outDir: work, emptyOutDir: false,
  } })
}

export async function kernelInputFor(id, title) {
  const vendor = join(root, 'vendor/foundry')
  const readJson = async path => JSON.parse(await readFile(join(vendor, path), 'utf8'))
  const manifest = await readJson('manifest.json')
  const system = await readJson('systems/dnd5e/system.json')
  const modules = [await readJson('modules/lib-wrapper/module.json'), await readJson('modules/plutonium/module.json')]
  return {
    system, modules, release: manifest.release,
    world: { id, title },
    userId: 'kernelGM00000000', worldTime: 0, language: 'en.core',
    settings: { 'dnd5e.rulesVersion': 'legacy', 'dnd5e.firstRun': false },
    documents: { actors: [] },
  }
}

export const engines = [
  ['chrome', chromium, { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true }],
  ['webkit', webkit, { headless: true }],
]

export function differences(a, b, path = '', out = []) {
  if (out.length > 40) return out
  if (a === b) return out
  const ta = a === null ? 'null' : Array.isArray(a) ? 'array' : typeof a
  const tb = b === null ? 'null' : Array.isArray(b) ? 'array' : typeof b
  if (ta !== tb) { out.push({ path, expected: a, actual: b }); return out }
  if (ta === 'object') {
    for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) differences(a[key], b[key], path ? `${path}.${key}` : key, out)
    return out
  }
  if (ta === 'array') {
    if (a.length !== b.length) { out.push({ path: `${path}.length`, expected: a.length, actual: b.length }); return out }
    for (let i = 0; i < a.length; i++) differences(a[i], b[i], `${path}[${i}]`, out)
    return out
  }
  out.push({ path, expected: a, actual: b })
  return out
}

export const kernelFrame = page => page.frames().filter(f => f.url().includes('/vendor/foundry/frame.html')).at(-1)

/** 只放过交接文档已单列的报错，其余一律算 unexplained。 */
export const knownError = e => e.includes('gendata-nav-adventure-book-index.json')
  || e.includes('/vendor/foundry/api/plutonium')
  || e.includes('status of 404')
  || e.includes('requires usable window dimensions')
  || e.includes('KERNEL_NEEDS_INPUT')
  || e.includes('Failed to place measured template')

/** 英雄要玩家选的特性（如“技能选 2 个”）建卡后必须真选上，否则“选择能读回”没被测到。 */
export function choiceSteps(actor) {
  const level = actor.system?.details?.level ?? 1
  return actor.items.flatMap(item => Object.values(item.system?.advancement ?? {})
    .filter(a => a.type === 'Trait' && (a.configuration?.choices ?? []).length && (a.level ?? 0) <= level)
    .map(a => ({ item: item.name, title: a.title ?? a.name ?? a._id, chosen: a.value?.chosen ?? [] })))
}

/** 真实【库】怪物：Plutonium 导入 → 英雄用武器攻击 → 真实伤害落到怪物。返回怪物前后数据。 */
export async function fightMonster(page, entry, heroId) {
  const monster = await page.evaluate(async entry => {
    const k = globalThis.__k
    const result = await k.call('importMonsterActor', entry)
    const data = await globalThis.__h.actorData(k, result.result?.id)
    return { status: result.status, id: result.result?.id, data }
  }, entry)
  if (monster.status !== 'complete' || !monster.id) throw new Error(`monster import failed: ${JSON.stringify(monster).slice(0, 600)}`)
  const prepared = id => page.evaluate(async id => globalThis.__h.actorPrepared(globalThis.__k, id), id)
  const basePrepared = await prepared(monster.id)
  const play = await page.evaluate(async ([heroId, monsterId]) => {
    const k = globalThis.__k
    const a = await globalThis.__h.actorData(k, heroId)
    const weapon = a.items.find(i => i.type === 'weapon')
    const attack = await k.call('attack', heroId, weapon._id, [20, 4, 4, 4, 4, 4, 4, 4])
    const total = attack.result?.damage?.[0]?.total ?? null
    if (!total) throw new Error('attack produced no damage')
    const damage = await k.call('damage', monsterId, [{ value: total, type: weapon.system?.damage?.base?.types?.[0] ?? 'slashing' }], [], {})
    return { attack: attack.status, damage: damage.status, total }
  }, [heroId, monster.id])
  const current = await page.evaluate(async id => globalThis.__h.actorData(globalThis.__k, id), monster.id)
  return { id: monster.id, base: monster.data, basePrepared, play, current, currentPrepared: await prepared(monster.id) }
}
