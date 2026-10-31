import type { TrpgDatabase } from '../../core/db'
import type { StoredEntry } from '../../schemas/pack'

type Obj = Record<string, unknown>

export interface MemberInfo { id: string; name: string; baseItem?: string; category?: string }
export interface MemberLink { id: string; text: string }
export interface MemberRow { label: string; links: MemberLink[] }
export interface MemberSection { title: string; rows: MemberRow[] }

const TIER = /\s([+-]\d+)$/
const CATEGORY_TITLE: Record<string, string> = { weapon: '武器', armor: '护甲', shield: '盾牌', ammunition: '弹药' }

/**
 * 家族成员整理成表：按类别分组；同一个基础物品的不同加值档排成一行（「匕首  +1 +2 +3」）。
 * 成员没有加值档（龙鳞甲各颜色、乐器…）时，每个成员一行一个链接，列成紧凑的一组。
 * baseNames：基础物品编号 → 名字；缺名字时用成员名去掉加值档当作行名。
 */
export function groupMembers(members: MemberInfo[], baseNames: Record<string, string>): MemberSection[] {
  const bySection = new Map<string, Map<string, MemberRow>>()
  for (const m of members) {
    const tier = TIER.exec(m.name)?.[1] ?? ''
    const title = (m.category && CATEGORY_TITLE[m.category]) || '其他'
    const label = (m.baseItem && baseNames[m.baseItem]) || m.name.replace(TIER, '').replace(/^.*·/, '')
    const rows = bySection.get(title) ?? new Map<string, MemberRow>()
    const row = rows.get(label) ?? { label, links: [] }
    row.links.push({ id: m.id, text: tier || m.name })
    rows.set(label, row)
    bySection.set(title, rows)
  }
  const sections: MemberSection[] = []
  for (const [title, rows] of bySection) {
    const list = [...rows.values()].sort((a, b) => a.label.localeCompare(b.label, 'zh'))
    for (const row of list) row.links.sort((a, b) => a.text.localeCompare(b.text, 'zh', { numeric: true }))
    // 没有任何加值档：一行列完（每个成员的名字就是它的链接文字）
    const flat = list.every((row) => row.links.length === 1 && !TIER.test(members.find((m) => m.id === row.links[0].id)?.name ?? ''))
    sections.push({ title, rows: flat ? [{ label: '', links: list.flatMap((row) => row.links.map((l) => ({ id: l.id, text: members.find((m) => m.id === l.id)?.name ?? l.text }))) }] : list })
  }
  const order = ['武器', '护甲', '盾牌', '弹药', '其他']
  return sections.sort((a, b) => order.indexOf(a.title) - order.indexOf(b.title))
}

/** 已装的包里，哪些家族条目把它列为成员：{ 家族编号, 家族所在包, 名字 }。按已装包的组合缓存，装、卸包后自动失效。 */
export interface FamilyRef { id: string; packId: string; name: string }
let seriesCache: { key: string; map: Map<string, FamilyRef[]> } | undefined

export async function familiesOf(db: TrpgDatabase, ruleId: string, signature: string, memberId: string): Promise<FamilyRef[]> {
  if (!seriesCache || seriesCache.key !== signature) {
    const map = new Map<string, FamilyRef[]>()
    const items = await db.entries.where('[ruleId+type]').equals([ruleId, 'item']).filter((e) => (e.data as Obj).category === 'family').toArray()
    for (const f of items) for (const id of ((f.data as Obj).members as string[] | undefined) ?? []) map.set(id, [...(map.get(id) ?? []), { id: f.entryId, packId: f.packId, name: f.name.replace(/（系列）$/, '') }])
    seriesCache = { key: signature, map }
  }
  return seriesCache.map.get(memberId) ?? []
}

/** 背景描述：条目自带的 `data.lore`，加上别的包里指向它的补丁（类型 lore，`data.target`）。补丁带来源包，界面注明出处。 */
export interface LoreSource { packId?: string; blocks: unknown[] }
let loreCache: { key: string; map: Map<string, LoreSource[]> } | undefined

export async function loreOf(db: TrpgDatabase, ruleId: string, signature: string, entry: Pick<StoredEntry, 'entryId' | 'data'>): Promise<LoreSource[]> {
  if (!loreCache || loreCache.key !== signature) {
    const map = new Map<string, LoreSource[]>()
    for (const p of await db.entries.where('[ruleId+type]').equals([ruleId, 'lore']).toArray()) {
      const d = p.data as Obj
      if (typeof d.target === 'string' && Array.isArray(d.lore)) map.set(d.target, [...(map.get(d.target) ?? []), { packId: p.packId, blocks: d.lore }])
    }
    loreCache = { key: signature, map }
  }
  const own = Array.isArray((entry.data as Obj).lore) ? [{ blocks: (entry.data as Obj).lore as unknown[] }] : []
  return [...own, ...(loreCache.map.get(entry.entryId) ?? [])].filter((s) => s.blocks.length > 0)
}
