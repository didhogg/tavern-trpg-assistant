import type { Person } from '../../../schemas/people'
import type { MonsterData } from '../../../rules/dnd5e2014/data/entries/spell-monster'
import type { PersonDerived } from '../../../rules/dnd5e2014/derive'
import type { LivePatch } from '../../../stores/people'
import type { CardData } from './cardData'

/** 弹窗拿到的上下文：person 是 PersonCard 里的响应式草稿；写入一律走这些函数（进撤销栈）。 */
export interface CardCtx {
  person: Person
  data: CardData
  readOnly: boolean
  derived: () => PersonDerived
  commitDraft: (patch: Partial<Person>, fields: string[]) => void
  commitBlock: (block: MonsterData) => void
  commitLive: (patch: LivePatch) => void
  /** 一次确认写入 = 一步撤销：把对 person 与 block 的修改合成一次。 */
  commitMany: (patch: Partial<Person>, fields: string[], live?: LivePatch) => void
  toast: { success: (text: string) => void; error: (text: string) => void; info: (text: string) => void }
}

export function cloneBlock(block: MonsterData): MonsterData { return JSON.parse(JSON.stringify(block)) as MonsterData }
