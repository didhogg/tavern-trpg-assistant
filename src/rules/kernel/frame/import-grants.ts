// 作者导入职业等级时「这一次加了哪些东西」的记录（驾驶员 11-25 评测：首级重选与降级回收共用作者实际授予的记录）。
//   作者导入的起始装备、戏法、准备施法者的整环法术……不在 dnd5e 的成长记录里，官方降级 / 删职业收不回，重新导入又加一份。
//   每次按等级导入职业（class-import.ts 定好 levels 的那几种）完成时，在人物自己身上记一行：哪个职业、哪几级、加了哪些物品编号。
//   记在人物的插件标记里（flags['tavern-trpg'].grants），跟着人物的完整数据走：不另开存档字段，撤销 / 读档自然一致。
//   降级：被降掉的那几级（一行的等级全部高于新等级才算）记下的物品，官方退完成长后还在的一并收回；手加的、别的来源的不动。
/* eslint-disable @typescript-eslint/no-explicit-any -- 官方文档对象没有类型声明。 */
import { plutoniumBuild } from './plutonium-build'

const FLAG = 'tavern-trpg'
export interface GrantRow { cls: string; levels: number[]; items: string[] }

/** 职业的标识（作者 UtilDocumentItem.getNameAsIdentifier，和作者写进职业物品 system.identifier 的同一个算法）。 */
export const classKey = (englishName: string): string => plutoniumBuild!.UtilDocumentItem.getNameAsIdentifier(englishName)

export const grantsOf = (a: any): GrantRow[] => (a.flags?.[FLAG]?.grants ?? []) as GrantRow[] // 插件标记不是注册过的模块，不能用 getFlag

/** 这次导入加的物品记一行（职业 / 子职业物品本身不记：它们由官方成长和等级管）。 */
export async function recordGrants(a: any, cls: string, levels: number[], itemIds: string[]): Promise<void> {
  const items = itemIds.filter((id) => { const t = a.items.get(id)?.type; return t && t !== 'class' && t !== 'subclass' })
  if (!items.length || !levels.length) return
  await a.update({ [`flags.${FLAG}.grants`]: [...grantsOf(a), { cls, levels: [...levels].sort((x, y) => x - y), items }] })
}

/**
 * 这个职业降到 keep 级（0 = 整个职业拿掉）：记录里全部等级都高于 keep 的那几行，物品还在的收回，记录删掉。交回收回的物品编号。
 * upTo = 只收回最高等级不超过它的行（重新选中间某一级：更高的几级等会儿按原选择升回，作者当时加的东西留着）。
 */
export async function revokeGrants(a: any, cls: string, keep: number, dryRun = false, upTo = Infinity): Promise<string[]> {
  const rows = grantsOf(a)
  const gone = rows.filter((r) => r.cls === cls && Math.min(...r.levels) > keep && Math.max(...r.levels) <= upTo)
  if (!gone.length) return []
  const ids = [...new Set(gone.flatMap((r) => r.items))].filter((id) => a.items.get(id))
  if (dryRun) return ids
  if (ids.length) await a.deleteEmbeddedDocuments('Item', ids)
  await a.update({ [`flags.${FLAG}.grants`]: rows.filter((r) => !gone.includes(r)) })
  return ids
}
