import { uuid } from '../../core/ids'
import { TrpgError } from '../../core/errors'
import type { Entry } from '../../schemas/pack'
import { monsterDataSchema, type MonsterData } from '../../rules/dnd5e2014/data/entries/spell-monster'
import type { PeopleCategoryId, Person, PersonSourceRef } from '../../schemas/people'
import { hpFromEntry } from './hp'

export interface PersonFromEntryOptions {
  name: string
  categoryId: PeopleCategoryId
  now: number
  serial?: number
  sourceRef?: PersonSourceRef
  id?: string
}

/** 新建人物的最小合法属性块；和怪物共用同一个结构。 */
export function emptyBlock(): MonsterData {
  return monsterDataSchema.parse({
    src: { book: '自制', page: 0 },
    credit: { by: '本项目', license: 'CC-BY-NC-SA-4.0' },
    size: ['M'],
    creatureType: { type: 'humanoid', tags: [] },
    ac: [{ value: 10 }],
    hp: { average: 0 },
    speed: { walk: 30 },
    abilities: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    senses: [],
    languages: [],
    resist: [],
    immune: [],
    vulnerable: [],
    conditionImmune: [],
    traits: [],
    actions: [],
    bonusActions: [],
    reactions: [],
    spellcasting: [],
  }) as MonsterData
}

export function emptyPerson(input: { name: string; categoryId: PeopleCategoryId; now: number; id?: string }): Person {
  return {
    id: input.id ?? `p-${uuid()}`,
    name: input.name.trim(),
    categoryId: input.categoryId,
    tags: [],
    pinned: false,
    hp: { current: null, temp: 0, deathSaves: { success: 0, fail: 0 } },
    effects: [],
    block: emptyBlock(),
    giveAi: 'auto',
    createdAt: input.now,
    touchedAt: input.now,
  }
}

/** 从模板条目生成人物；block 必须已经解析好（具名 NPC 由调用方取它引用的怪物）。 */
export function personFromEntry(entry: Entry, block: MonsterData, options: PersonFromEntryOptions): Person {
  const hp = hpFromEntry(block)
  return {
    id: options.id ?? `p-${uuid()}`,
    name: options.name.trim() || entry.name,
    categoryId: options.categoryId,
    tags: [],
    pinned: false,
    ...(options.sourceRef ? { sourceRef: options.sourceRef } : {}),
    ...(options.serial ? { serial: options.serial } : {}),
    hp: { current: hp.current, temp: 0, deathSaves: { success: 0, fail: 0 } },
    effects: [],
    block: structuredClone(block),
    giveAi: 'auto',
    createdAt: options.now,
    touchedAt: options.now,
  }
}

/** 存进我的库时只保留属性块，去掉当场状态；产物必须是合法的 monster 条目数据。 */
export function toLibraryEntry(person: Person, options: { name: string }): Entry {
  const name = options.name.trim()
  if (!name) throw new TrpgError('E_BAD_NAME', '名字需要 1–40 个字')
  const data = structuredClone(person.block)
  const parsed = monsterDataSchema.safeParse(data)
  if (!parsed.success) throw new TrpgError('E_BAD_ENTRY', `人物属性块不合法：${parsed.error.issues[0]?.message ?? ''}`)
  return {
    id: person.id,
    type: 'monster',
    name,
    keywords: [],
    unique: false,
    summary: '',
    data: parsed.data as Record<string, unknown>,
  }
}
