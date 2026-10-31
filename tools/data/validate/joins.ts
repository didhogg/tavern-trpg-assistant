import type { ConvertedPack } from '../convert'
import { checkJoins } from '../../../src/rules/dnd5e2014/data/joins'

/** 构建时检查全部条目的 joins（语义规则，见 src/rules/dnd5e2014/data/joins.ts）；返回问题列表。 */
export function validateJoins(packs: ConvertedPack[]): string[] {
  const all = new Map(packs.flatMap((p) => p.entries).map((e) => [e.id, e]))
  const lookup = (id: string): { type: string; data: Record<string, unknown> } | undefined => { const e = all.get(id); return e ? { type: e.type, data: e.data as Record<string, unknown> } : undefined }
  return [...all.values()].flatMap((e) => checkJoins({ id: e.id, type: e.type, data: e.data as Record<string, unknown> }, lookup))
}
