import type { Catalog, InstalledPack, PackCategory } from '../../schemas/pack'

export type RowSource = 'builtin' | 'download' | 'import' | 'user' | 'catalog'

/** 库里一个包的统一描述：已安装的包与数据仓库目录里尚未安装的包。 */
export interface PackRow {
  id: string
  name: string
  nameEn?: string
  category: PackCategory
  ruleId: string
  version: string
  installed: boolean
  source: RowSource
  recommended: boolean
  /** 数据仓库的分组名，如「官方扩展 · 一档」。 */
  group?: string
  description: string
  byteSize: number
  entryCount: number
  contributes: Record<string, number>
  typeCounts: Record<string, number>
  requires: string[]
  recommends: string[]
  conflicts: Array<{ id: string; reason: string }>
  series?: { id: string; name: string; order: number }
  /** 目录里有比已安装更高的版本。 */
  updateVersion?: string
}

export const CATEGORY_LABEL: Record<PackCategory, string> = { rules: '资料与规则', adventure: '冒险', setting: '设定', toolkit: '工具' }
export const CATEGORY_ORDER: PackCategory[] = ['rules', 'adventure', 'setting', 'toolkit']

function fromInstalled(p: InstalledPack, catalog: Catalog | null): PackRow {
  const c = catalog?.packs.find((x) => x.id === p.id)
  return {
    id: p.id,
    name: p.name,
    nameEn: p.nameEn,
    category: p.category,
    ruleId: p.ruleId,
    version: p.version,
    installed: true,
    source: p.source,
    recommended: c?.recommended ?? false,
    group: c?.group,
    description: p.description,
    byteSize: p.byteSize,
    entryCount: p.entryCount,
    contributes: p.contributes,
    typeCounts: p.typeCounts,
    requires: p.relationships.requires.map((d) => d.id),
    recommends: p.relationships.recommends.map((d) => d.id),
    conflicts: p.relationships.conflicts,
    series: p.series,
    ...(c && c.version !== p.version && p.source !== 'builtin' && c.version.localeCompare(p.version, undefined, { numeric: true }) > 0 ? { updateVersion: c.version } : {}),
  }
}

export function buildPackRows(installed: InstalledPack[], catalog: Catalog | null, ruleId: string): PackRow[] {
  const rows = installed.filter((p) => p.ruleId === ruleId).map((p) => fromInstalled(p, catalog))
  const have = new Set(rows.map((r) => r.id))
  for (const c of catalog?.packs ?? []) {
    if (c.ruleId !== ruleId || have.has(c.id)) continue
    rows.push({
      id: c.id,
      name: c.name,
      nameEn: c.nameEn,
      category: c.category,
      ruleId: c.ruleId,
      version: c.version,
      installed: false,
      source: 'catalog',
      recommended: c.recommended,
      group: c.group,
      description: c.description,
      byteSize: c.byteSize,
      entryCount: c.contributes.entries ?? Object.values(c.typeCounts).reduce((a, b) => a + b, 0),
      contributes: c.contributes,
      typeCounts: c.typeCounts,
      requires: c.relationships.requires.map((d) => d.id),
      recommends: c.relationships.recommends.map((d) => d.id),
      conflicts: c.relationships.conflicts,
      series: c.series,
    })
  }
  return rows
}

/** 内容标签：资料 N · 修改版 N · 冒险 N · 随机表 N · 规则选项 N（数量为 0 的不显示；L1 §4.1）。 */
export function contributesLabel(row: Pick<PackRow, 'contributes' | 'entryCount'>): string {
  const c = row.contributes
  const tables = c.tables ?? 0
  const entries = Math.max(0, (c.entries ?? row.entryCount) - tables)
  const parts: Array<[string, number]> = [['资料', entries], ['修改版', c.variants ?? 0], ['冒险', c.adventures ?? 0], ['随机表', tables], ['规则选项', c.ruleOptions ?? 0]]
  return parts.filter(([, n]) => n > 0).map(([label, n]) => `${label} ${n.toLocaleString('zh-CN')}`).join(' · ')
}

export const SOURCE_LABEL: Record<RowSource, string> = { builtin: '内置', download: '官方', import: '导入', user: '我的', catalog: '' }

/** 按 id 找一个包（先看已安装的，再看目录）。 */
export function findRow(id: string, installed: InstalledPack[], catalog: Catalog | null): PackRow | undefined {
  const ruleId = installed.find((p) => p.id === id)?.ruleId ?? catalog?.packs.find((c) => c.id === id)?.ruleId
  return ruleId ? buildPackRows(installed, catalog, ruleId).find((r) => r.id === id) : undefined
}
