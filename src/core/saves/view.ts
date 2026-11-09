// 战役视图（P4 补后端）：设计里“战役”= 一棵存档树（沿 branchedFrom 向上到根），没有独立的战役记录，所以只读推导，不改存档结构。
// 规则：
//   · 只看手动存档，已删除的不在树里；自动存档不进树，只数个数
//   · 父存档不在了（被删、最近删除里）→ 这一份当根（孤儿提升为根）；恢复父存档后下次推导自然接回
//   · 战役名 = 根存档名（用户改根存档名，战役名跟着变）
import type { SaveSlot, SaveSummary } from '../../schemas/campaign'
import { byRecent } from './helpers'

export interface CampaignNode {
  id: string
  name: string
  note: string
  ownerKey: string
  ownerLabel: string
  ruleId: string
  parentId: string | null
  updatedAt: number
  summary: SaveSummary
}

export interface OtherCampaign {
  root: CampaignNode
  saves: number
  updatedAt: number
  /** 是不是当前这张角色卡自己的另一个战役。 */
  sameCard: boolean
}

export interface CampaignCounts {
  /** 当前战役这棵树里的手动存档。 */
  tree: number
  /** 当前卡、当前规则的手动存档。 */
  thisCard: number
  /** 全部卡、当前规则的手动存档（首页“读取已有存档（N）”用这个）。 */
  allCards: number
  auto: number
  deleted: number
  /** 其他规则的手动存档。 */
  otherRules: number
}

export interface CampaignView {
  name: string | null
  root: CampaignNode | null
  current: CampaignNode | null
  /** 当前战役树里除根以外的存档，每个带 parentId；最近更新在前。 */
  branches: CampaignNode[]
  otherCampaigns: OtherCampaign[]
  counts: CampaignCounts
}

const nodeOf = (s: SaveSlot, parentId: string | null): CampaignNode => ({
  id: s.id, name: s.name, note: s.note, ownerKey: s.ownerKey, ownerLabel: s.ownerLabel, ruleId: s.ruleId,
  parentId, updatedAt: s.updatedAt, summary: s.summary,
})

export function campaignViewOf(rows: SaveSlot[], at: { ownerKey: string; ruleId: string; currentSaveId: string | null }): CampaignView {
  const manual = rows.filter((s) => s.kind === 'manual' && s.deletedAt === undefined)
  const byId = new Map(manual.map((s) => [s.id, s]))
  const parentOf = (s: SaveSlot): string | null => (s.branchedFrom && s.branchedFrom !== s.id && byId.has(s.branchedFrom) ? s.branchedFrom : null)
  const rootOf = (s: SaveSlot): SaveSlot => {
    const seen = new Set<string>([s.id])
    let cur = s
    for (let p = parentOf(cur); p; p = parentOf(cur)) {
      if (seen.has(p)) break // 链成环：在环上就地当根，不死循环
      seen.add(p)
      cur = byId.get(p) as SaveSlot
    }
    return cur
  }

  const trees = new Map<string, SaveSlot[]>()
  for (const s of manual) {
    const rootId = rootOf(s).id
    trees.set(rootId, [...(trees.get(rootId) ?? []), s])
  }

  const currentSave = at.currentSaveId ? byId.get(at.currentSaveId) ?? null : null
  const rootSave = currentSave ? rootOf(currentSave) : null
  const members = rootSave ? trees.get(rootSave.id) ?? [] : []

  const others: OtherCampaign[] = []
  for (const [rootId, list] of trees) {
    if (rootId === rootSave?.id) continue
    const root = byId.get(rootId) as SaveSlot
    if (root.ruleId !== at.ruleId) continue
    others.push({ root: nodeOf(root, null), saves: list.length, updatedAt: Math.max(...list.map((s) => s.updatedAt)), sameCard: root.ownerKey === at.ownerKey })
  }
  others.sort((a, b) => b.updatedAt - a.updatedAt)

  const sameRule = manual.filter((s) => s.ruleId === at.ruleId)
  return {
    name: rootSave?.name ?? null,
    root: rootSave ? nodeOf(rootSave, null) : null,
    current: currentSave ? nodeOf(currentSave, parentOf(currentSave)) : null,
    branches: members.filter((s) => s.id !== rootSave?.id).sort(byRecent).map((s) => nodeOf(s, parentOf(s))),
    otherCampaigns: others,
    counts: {
      tree: members.length,
      thisCard: sameRule.filter((s) => s.ownerKey === at.ownerKey).length,
      allCards: sameRule.length,
      auto: rows.filter((s) => s.kind === 'auto' && s.deletedAt === undefined && s.ownerKey === at.ownerKey && s.ruleId === at.ruleId).length,
      deleted: rows.filter((s) => s.deletedAt !== undefined && s.ruleId === at.ruleId).length,
      otherRules: manual.length - sameRule.length,
    },
  }
}
