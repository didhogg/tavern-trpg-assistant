import { DRAFT_WRITE_KEYS } from '../../../schemas/peopleWrites'
import type { Person } from '../../../schemas/people'
import type { DraftPatch, LivePatch } from '../../../stores/people'

export interface UndoAction {
  kind: 'live' | 'draft'
  before: Person
  after: Person
  /** 草稿动作同时写入了当场状态时，撤销要把当场状态也写回。 */
  liveBefore?: LivePatch
}

export const UNDO_MAX = 50

const same = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b)

/** 未保存 N：草稿里改过的顶层字段个数（同一字段改多次只算一个）。 */
export function dirtyFields(draft: Person, baseline: Person): string[] {
  return DRAFT_WRITE_KEYS.filter((key) => !same(draft[key], baseline[key]))
}

export function pushUndo(stack: UndoAction[], action: UndoAction): UndoAction[] {
  return [...stack, action].slice(-UNDO_MAX)
}

export function livePatchOf(person: Person): LivePatch {
  return {
    hp: person.hp,
    inspiration: person.inspiration,
    exhaustion: person.exhaustion,
    hitDiceUsed: person.hitDiceUsed,
    slotsUsed: person.slotsUsed,
    resourcesUsed: person.resourcesUsed,
    effects: person.effects,
  }
}

export function draftPatchOf(draft: Person, fields: string[]): DraftPatch {
  const patch: DraftPatch = {}
  for (const key of fields) {
    if (key === 'name') patch.name = draft.name
    else if (key === 'nameEn') patch.nameEn = draft.nameEn
    else if (key === 'avatar') patch.avatar = draft.avatar
    else if (key === 'avatarSource') patch.avatarSource = draft.avatarSource
    else if (key === 'block') patch.block = draft.block
    else if (key === 'hpAdj') patch.hpAdj = draft.hpAdj
    else if (key === 'hitDiceOverride') patch.hitDiceOverride = draft.hitDiceOverride
    else if (key === 'hpRolls') patch.hpRolls = draft.hpRolls
    else if (key === 'asiLog') patch.asiLog = draft.asiLog
  }
  return patch
}

export function clonePerson(person: Person): Person {
  return JSON.parse(JSON.stringify(person)) as Person
}
