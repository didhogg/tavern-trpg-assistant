import { join } from 'node:path'
import { readJson } from '../lib/io'
import { DATA_5ETOOLS } from './load'
import { BOOK_SOURCES } from '../config/books'
import { resolveCopies, type Raw } from './load'

export interface R11Data {
  languages: Raw[]
  languageScripts: Raw[]
  skills: Raw[]
  senses: Raw[]
  itemProperties: Raw[]
  itemTypes: Raw[]
  itemTypeExtras: Raw[]
  deities: Raw[]
  rewards: Raw[]
  cults: Raw[]
  traps: Raw[]
  hazards: Raw[]
  objects: Raw[]
  vehicles: Raw[]
  monsterFeatures: Raw[]
  makebrewActions: Raw[]
  makebrewTraits: Raw[]
  quickrefs: Raw[]
  recipes: Raw[]
  charOptions: Raw[]
}

function isObj(value: unknown): value is Raw {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function core(list: unknown[]): Raw[] {
  return list.filter(isObj).filter((item) => BOOK_SOURCES.has(String(item.source)))
}

async function array(file: string, key: string): Promise<Raw[]> {
  const raw = await readJson<Record<string, unknown>>(join(DATA_5ETOOLS, file))
  const list = raw[key]
  if (!Array.isArray(list)) throw new Error(`${file} 缺少数组 ${key}`)
  return list.filter(isObj)
}

function collectSections(value: unknown, out: Raw[]): void {
  if (Array.isArray(value)) {
    for (const item of value) collectSections(item, out)
    return
  }
  if (!isObj(value)) return
  if (value.type === 'section') out.push(value)
  collectSections(value.entries, out)
}

async function quickrefs(): Promise<Raw[]> {
  const quick = await readJson<Record<string, unknown>>(join(DATA_5ETOOLS, 'generated', 'bookref-quick.json'))
  const screen = await readJson<Record<string, unknown>>(join(DATA_5ETOOLS, 'generated', 'bookref-dmscreen.json'))
  const sections: Raw[] = []
  collectSections((quick.data as Record<string, unknown>)?.['bookref-quick'], sections)
  collectSections((screen.data as Record<string, unknown>)?.['bookref-dmscreen'], sections)
  const seen = new Set<string>()
  return sections.filter((section) => {
    if (typeof section.source !== 'string' || typeof section.page !== 'number' || !BOOK_SOURCES.has(section.source)) return false
    const key = `${String(section.ENG_name)}|${section.source}|${section.page}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function mergeRewardOverlay(rewards: Raw[], overlayList: Raw[]): Raw[] {
  return rewards.map((reward) => {
    const overlay = overlayList.find((x) => x.source === reward.source && x.name === reward.name && Array.isArray(x.effects))
    if (!overlay) return reward
    return { ...reward, effects: overlay.effects }
  }).filter((reward) => reward.type !== undefined)
}

export async function loadR11Data(): Promise<R11Data> {
  const [languages, scripts, skills, senses, base, deities, rewardsRaw, cultsRaw, traps, hazards, objects, vehicles, features, makebrew, quick, recipes, charOptions, foundryRewards] = await Promise.all([
    array('languages.json', 'language'),
    array('languages.json', 'languageScript'),
    array('skills.json', 'skill'),
    array('senses.json', 'sense'),
    array('items-base.json', 'itemProperty'),
    array('deities.json', 'deity'),
    array('rewards.json', 'reward'),
    array('cultsboons.json', 'cult'),
    array('trapshazards.json', 'trap'),
    array('trapshazards.json', 'hazard'),
    array('objects.json', 'object'),
    array('vehicles.json', 'vehicle'),
    array('monsterfeatures.json', 'monsterfeatures'),
    array('makebrew-creature.json', 'makebrewCreatureAction'),
    quickrefs(),
    array('recipes.json', 'recipe'),
    array('charcreationoptions.json', 'charoption'),
    array('foundry-rewards.json', 'reward'),
  ])
  const itemTypes = await array('items-base.json', 'itemType')
  const itemTypeExtras = await array('items-base.json', 'itemTypeAdditionalEntries')
  const boons = core(await array('cultsboons.json', 'boon')).map((boon) => ({ ...boon, _rewardKind: 'demonicBoon' }))
  const rewardList = mergeRewardOverlay(core(resolveCopies(rewardsRaw)), foundryRewards).map((reward) => ({ ...reward, _rewardKind: 'reward' }))
  const traits = core(await array('makebrew-creature.json', 'makebrewCreatureTrait'))
  const actions = core(makebrew)
  return {
    languages: core(languages),
    languageScripts: core(scripts),
    skills: core(skills),
    senses: core(senses),
    itemProperties: core(base),
    itemTypes: core(itemTypes),
    itemTypeExtras: core(itemTypeExtras),
    deities: core(resolveCopies(deities)),
    rewards: [...rewardList, ...boons],
    cults: core(resolveCopies(cultsRaw)),
    traps: core(traps),
    hazards: core(hazards),
    objects: core(objects),
    vehicles: core(vehicles),
    monsterFeatures: features.map((item) => ({ ...item, source: 'DMG', page: 280 })),
    makebrewActions: actions,
    makebrewTraits: traits,
    quickrefs: quick,
    recipes,
    charOptions,
  }
}
