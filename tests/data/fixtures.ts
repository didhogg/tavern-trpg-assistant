import { sha256Hex } from '../../src/core/hash'
import { buildPackFile } from '../../src/core/packs/file'
import type { Entry, PackFeature } from '../../src/schemas/pack'
import type { TextBlock } from '../../src/schemas/text'
import { PNG } from '../helpers/fixtures'

const CREDIT = { by: '本项目' as const, license: 'CC-BY-NC-SA-4.0' as const, machine: false, missing: [], srd: false }
const SRC = { book: 'TEST', page: 1 }
const text: TextBlock[] = [{ p: '测试正文。' }]

function base(id: string, type: string, name: string, data: Record<string, unknown> = {}, extra: Partial<Entry> = {}): Entry {
  return { id, type, name, nameEn: name, keywords: [name], unique: false, summary: `${name}｜测试`, data: { src: { ...SRC }, credit: structuredClone(CREDIT), text: structuredClone(text), ...data }, ...extra }
}

export function fixtureEntries(): Entry[] {
  return [
    base('spell.fireball.test', 'spell', '火球术', { level: 3, school: 'evocation', castTime: [{ n: 1, unit: 'action' }], range: { type: 'point', amount: 150, unit: 'feet' }, components: { v: true, s: true }, duration: [{ type: 'instant', concentration: false }], ritual: false, classes: [], subclasses: [], damage: [{ dice: '8d6', type: 'fire' }] }),
    base('monster.goblin.test', 'monster', '地精', { size: ['S'], creatureType: { type: 'humanoid', tags: ['goblinoid'] }, ac: [{ value: 15 }], hp: { average: 7, formula: '2d6' }, speed: { walk: 30 }, abilities: { str: 8, dex: 14, con: 10, int: 10, wis: 8, cha: 8 }, senses: [], languages: ['通用语'], cr: 0.25, resist: [], immune: [], vulnerable: [], conditionImmune: [], traits: [], actions: [], bonusActions: [], reactions: [], spellcasting: [] }),
    base('item.longsword.test', 'item', '长剑', { category: 'weapon', rarity: 'none', attunement: { required: false }, weapon: { category: 'martial', damage: [{ dice: '1d8', type: 'slashing' }], properties: ['V'] }, properties: [], lootTables: [] }),
    base('class.fighter.test', 'class', '战士', { hitDie: 10, primaryAbility: ['str'], saves: ['str', 'con'], proficiencies: { armor: ['heavy'], weapons: ['martial'], tools: [] }, startingEquipment: [], subclassLevel: 3, subclassTitle: '武术范型', advancement: [] }),
    base('subclass.fighter-champion.test', 'subclass', '冠军勇士', { classId: 'class.fighter.test', advancement: [] }),
    base('feature.fighter-second-wind.test', 'feature', '恢复活力', { owner: { type: 'class', id: 'class.fighter.test' }, level: 1 }),
    base('race.human.test', 'race', '人类', { size: ['M'], speed: { walk: 30 }, abilityBonus: { fixed: { str: 1 } }, languages: ['通用语'], proficiencies: [], traits: [], advancement: [] }),
    base('subrace.human-variant.test', 'subrace', '人类变体', { parentRace: 'race.human.test', size: ['M'], speed: { walk: 30 }, languages: ['通用语'], proficiencies: [], traits: [], advancement: [] }),
    base('background.acolyte.test', 'background', '侍僧', { proficiencies: { skills: ['insight'], tools: [], languages: [] }, equipment: [], characteristics: [] }),
    base('feat.alert.test', 'feat', '警觉', { advancement: [] }),
    base('condition.poisoned.test', 'condition', '中毒', { effects: [] }),
    base('disease.sewer-plague.test', 'disease', '下水道瘟疫', { effects: [] }),
    base('status.concentration.test', 'status', '专注', { effects: [] }),
    base('rule.encumbrance.test', 'rule', '负重', { category: 'variant' }),
    base('table.loot-a.test', 'table', '战利品 A', { kind: 'roll', dice: 'd6', cols: ['结果'], rows: [{ min: 1, max: 3, cells: ['金币'], refs: [] }, { min: 4, max: 6, cells: ['再掷一次'], refs: [], then: { table: 'table.loot-b.test' } }] }),
    base('table.loot-b.test', 'table', '战利品 B', { kind: 'roll', dice: 'd4', cols: ['结果'], rows: [{ min: 1, max: 4, cells: ['宝石'], refs: [] }] }),
    base('table.ref-test.test', 'table', '测试对照表', { kind: 'ref', cols: ['等级', '说明'], rows: [{ cells: ['1', '一'], refs: [] }, { cells: ['2', '二'], refs: [], indent: true }], chapter: { book: 'TEST', name: '测试章' } }),
    base('table.deck-test.test', 'table', '测试牌组', { kind: 'deck', dice: 'd2', cols: ['牌', '效果'], rows: [{ min: 1, max: 1, cells: ['A', '第一张'], refs: [] }, { min: 2, max: 2, cells: ['B', '第二张'], refs: [] }] }),
    base('table.modifier-test.test', 'table', '测试修正表', { kind: 'roll', dice: 'd6', modifier: { prompt: '童年居所' }, cols: ['结果'], rows: [{ min: 1, max: 6, cells: ['结果'], refs: [] }] }),
    base('table.parent-test.test', 'table', '测试所属表', { kind: 'roll', dice: 'd4', parent: { id: 'spell.fireball.test' }, cols: ['结果'], rows: [{ min: 1, max: 4, cells: ['结果'], refs: [] }] }),
    base('table.key-test.test', 'table', '测试关键表', { kind: 'ref', purpose: 'test.keyTable', cols: ['等级', '数值'], columns: [{ key: 'level', type: 'level' }, { key: 'value', type: 'int' }], rows: [{ cells: ['1', '10'], refs: [], values: { level: 1, value: 10 } }, { cells: ['2', '20'], refs: [], values: { level: 2, value: 20 } }], chapter: { book: 'TEST', name: '测试章' } }),
    base('language.test.test', 'language', '测试语', { code: 'test', typicalSpeakers: [] }),
    base('deity.test-god.test', 'deity', '测试神', { pantheon: '测试神系', domains: [] }),
    base('reward.test-charm.test', 'reward', '测试护符', { rewardKind: 'charm' }),
    base('cult.test-cult.test', 'cult', '测试教团', { type: 'Diabolical' }),
    base('hazard.trap-test.test', 'hazard', '测试陷阱', { hazardKind: 'trap' }),
    base('object.test-object.test', 'object', '测试物件', { size: ['M'], ac: 10, hp: 10, immune: [] }),
    base('vehicle.test-ship.test', 'vehicle', '测试载具', { vehicleType: 'SHIP' }),
    base('monsterpart.feature-test.test', 'monsterPart', '测试部件', { partKind: 'feature' }),
    base('recipe.test-recipe.test', 'recipe', '测试配方', { diet: 'C', dishTypes: [], allergenGroups: [], tags: [], ingredients: [], equipment: [], instructions: [] }),
    base('charoption.test-option.test', 'charoption', '测试选项', { optionType: ['SG'] }),
    base('lore.spell.fireball.test', 'lore', '火球术描述', { target: 'spell.fireball.test', lore: [{ p: '测试描述。' }] }),
  ]
}

export function fixtureFeatures(): PackFeature[] {
  return [
    { id: 'rule-option.test', kind: 'ruleOptions', name: '测试规则选项', description: '测试用', defaultEnabled: true, data: { id: 'test-option', name: '测试规则选项', summary: '测试', text: '测试', source: 'TEST' } },
    { id: 'ai-note.test', kind: 'aiNotes', name: '测试基调', description: '测试用', defaultEnabled: false, data: { text: '这是一个测试基调。', appliesTo: [], tone: '平静' } },
    { id: 'future-feature.test', kind: 'futureKind', name: '未来功能', description: '本版本不认识', defaultEnabled: false, data: { any: ['value'] } },
  ]
}

export function fixtureBlob(): { hash: string; bytes: Uint8Array } {
  return { hash: sha256Hex(PNG), bytes: PNG }
}

export function buildFixtureDataPack(version = '1.0.0'): Uint8Array {
  const blob = fixtureBlob()
  return buildPackFile({
    manifest: {
      id: 'fixture-data',
      ruleId: 'dnd5e2014',
      category: 'rules',
      name: '测试数据包',
      version,
      lineage: 'fixture-data-lineage',
      dataVersion: 1,
      relationships: { requires: [{ id: 'fixture-base' }], recommends: [], conflicts: [] },
    },
    entries: [
      ...fixtureEntries(),
      {
        ...base('item.variant-gargoyle.test', 'item', '石像鬼（本世界）', { category: 'wondrous', rarity: 'rare', attunement: { required: true }, properties: [], lootTables: [] }),
        override: { target: { packId: 'fixture-base', entryId: 'item.base-gargoyle.test' }, mode: 'patch', note: '本世界中石像鬼不惧魔法武器' },
      } as Entry,
    ],
    features: fixtureFeatures(),
    blobs: new Map([[blob.hash, { bytes: blob.bytes, mime: 'image/png' }]]),
  })
}

export function buildFixtureBasePack(): Uint8Array {
  return buildPackFile({
    manifest: { id: 'fixture-base', ruleId: 'dnd5e2014', category: 'rules', name: '测试基础包', version: '1.0.0', lineage: 'fixture-base-lineage' },
    entries: [base('item.base-gargoyle.test', 'item', '石像鬼', { category: 'wondrous', rarity: 'rare', attunement: { required: true }, properties: [], lootTables: [] })],
  })
}

export function buildFixtureAdventurePack(): Uint8Array {
  const blob = fixtureBlob()
  const items = (kind: string) => [
    {
      kind,
      id: `${kind}-1`,
      name: `${kind} 一`,
      description: text,
      dmSecret: [{ p: '只有 DM 知道。' }],
      keywords: [kind],
      data: { note: '测试用', ...(kind === 'person' ? { home: { $ref: 'item', id: 'location-1', name: '地点一' }, stat: { $ref: 'pack', packId: 'fixture-data', entryId: 'monster.goblin.test', name: '地精' } } : {}) },
    },
  ]
  const adventure = {
    cover: { $asset: blob.hash },
    description: '测试冒险',
    adventures: [{ id: 'adv-1', name: '测试冒险', description: '不剧透的简介', start: { locationId: 'location-1' }, chapters: [{ name: '第一章', itemIds: ['person-1'] }], itemIds: ['location-1', 'person-1', 'faction-1', 'quest-1', 'encounter-1', 'event-1', 'handout-1'] }],
    shared: [],
  }
  return buildPackFile({
    manifest: { id: 'fixture-adventure', ruleId: 'dnd5e2014', category: 'adventure', name: '测试冒险包', version: '1.0.0', lineage: 'fixture-adventure-lineage', relationships: { requires: [{ id: 'fixture-data' }], recommends: [], conflicts: [] } },
    entries: [],
    blobs: new Map([[blob.hash, { bytes: blob.bytes, mime: 'image/png' }]]),
    adventure: {
      'adventure/adventure.json': adventure,
      ...Object.fromEntries(['location', 'person', 'faction', 'quest', 'encounter', 'event', 'handout'].map((kind) => [`adventure/${kind}.json`, items(kind)])),
    },
  })
}
