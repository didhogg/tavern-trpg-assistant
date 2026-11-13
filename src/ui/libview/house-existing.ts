// P5.5 §16.7 第 5 条：再次编辑官方条目时，它现在生效的是不是已有的房规；是的话这条房规用在哪些地方。
// 数据都走后端：custom.edits（这一条在各层选了什么）、entryChangeImpact（谁选了这条房规）。界面只排版。
import type { Services } from '../../core/services'
import type { CampaignLibrary, EntryRef } from '../../library/scopes'
import { getSource } from '../../library/sources'

export interface ExistingHouse {
  /** 中文 / 英文各自现在生效的那条房规（没有就不给）。 */
  zh?: EntryRef
  en?: EntryRef
  /** 生效的那条房规在哪一层（另一种语言还没有房规、要新建时放到同一层）。 */
  level: string
  /** 用到这条房规的地方（全局、规则、战役），给人看的。 */
  where: string[]
}

const ORDER = (l: string): number => (l === 'campaign' ? 0 : l.startsWith('rule:') ? 1 : 2)

/** 一条条目现在生效的那一份是房规 → 给那条房规的编号。 */
async function effectiveHouse(s: Services, c: CampaignLibrary | null, ref: EntryRef, brewSetId: (cs: string) => string | null): Promise<{ ref: EntryRef; level: string } | undefined> {
  const rows = (await s.backend.library.custom.edits({ refs: [ref] }, c)).filter((r) => r.ref.set === ref.set && r.ref.hash === ref.hash && r.kind !== 'base')
  const top = rows.sort((a, b) => ORDER(a.level) - ORDER(b.level))[0]
  const set = brewSetId(getSource(ref.set).codeSet)
  return top?.kind === 'house' && set ? { ref: { set, prop: ref.prop, hash: top.altId.slice('house:'.length) }, level: top.level } : undefined
}

export async function existingHouse(s: Services, c: CampaignLibrary | null, refs: { zh?: EntryRef; en?: EntryRef }, brewSetId: (cs: string) => string | null): Promise<ExistingHouse | null> {
  const [zh, en] = await Promise.all([refs.zh ? effectiveHouse(s, c, refs.zh, brewSetId) : undefined, refs.en ? effectiveHouse(s, c, refs.en, brewSetId) : undefined])
  const found = zh ?? en
  if (!found) return null
  const one = found.ref
  const r = await s.backend.entryChangeImpact(one.set, [{ prop: one.prop, hash: one.hash }])
  const levelName = (l: string): string => (l === 'global' ? '全局（所有战役）' : l.startsWith('rule:') ? `规则「${s.rules.get(l.slice(5))?.name ?? l.slice(5)}」` : l)
  const where = [...new Set([...r.choices.map((x) => levelName(x.level)), ...r.saves.map((x) => `战役「${x.ownerLabel}」`)])]
  return { ...(zh ? { zh: zh.ref } : {}), ...(en ? { en: en.ref } : {}), level: found.level, where }
}
