import type { Person } from '../../../schemas/people'
import { grantsOf, sourceTag, type Grant, type GrantKind } from '../../../rules/dnd5e2014/derive'
import type { CardData } from './cardData'

export interface ExpectedGrant { grant: Grant; from: string }

/** 当前种族 / 亚种族 / 职业 / 背景「应分配」的固定项（补选项只有已经写入的才算；「可恢复」= 这些 − 已有）。 */
export function expectedGrants(person: Person, data: CardData): ExpectedGrant[] {
  const out: ExpectedGrant[] = []
  const add = (kind: GrantKind, id: string | undefined, entry: Parameters<typeof grantsOf>[1]): void => {
    if (!id || !entry) return
    const from = sourceTag(kind, id)
    for (const grant of grantsOf(kind, entry)) out.push({ grant, from })
  }
  add('race', person.block.race, data.raceOf(person.block.race))
  add('subrace', person.block.subrace, data.raceOf(person.block.subrace))
  for (const row of person.block.classes ?? []) add('class', row.class, data.classOf(row.class))
  add('background', person.block.background, data.backgroundOf(person.block.background))
  return out
}
