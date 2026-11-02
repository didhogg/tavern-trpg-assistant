import type { Entry } from '../../schemas/pack'
import type { MonsterData } from '../../rules/dnd5e2014/data/entries/spell-monster'
import { crValue } from './list'

export type TemplateType = 'all' | 'monster' | 'npc'
export type TemplateSort = 'name' | 'cr'

export interface TemplateRow {
  packId: string
  packName: string
  entry: Entry
  block: MonsterData | null
  /** 具名 NPC 引用的属性块所在包没装。 */
  missingBlock?: boolean
}

export interface TemplateQuery {
  type?: TemplateType
  search?: string
  sourcePacks?: string[]
  crMin?: number
  crMax?: number
  creatureTypes?: string[]
  sizes?: string[]
  sort?: TemplateSort
}

/** 模板查询：只处理已经解析好 block 的怪物/具名 NPC；筛选、搜索与排序是纯函数。 */
export function queryTemplates(rows: TemplateRow[], query: TemplateQuery = {}): TemplateRow[] {
  const type = query.type ?? 'all'
  const q = (query.search ?? '').trim().toLowerCase()
  const source = new Set(query.sourcePacks ?? [])
  const types = new Set(query.creatureTypes ?? [])
  const sizes = new Set(query.sizes ?? [])
  const out = rows.filter((row) => {
    if (type !== 'all' && row.entry.type !== type) return false
    if (source.size && !source.has(row.packId)) return false
    if (!row.block) return false
    const cr = crValue(row.block.cr)
    if (query.crMin !== undefined && (cr === undefined || cr < query.crMin)) return false
    if (query.crMax !== undefined && (cr === undefined || cr > query.crMax)) return false
    if (types.size && !types.has(row.block.creatureType.type)) return false
    if (sizes.size && !(row.block.size ?? []).some((s) => sizes.has(s))) return false
    if (q) {
      const text = [row.entry.name, row.entry.nameEn ?? '', row.packName, row.block.creatureType.type].join(' ').toLowerCase()
      if (!text.includes(q)) return false
    }
    return true
  })
  return out.sort((a, b) => {
    if (query.sort === 'cr') {
      const av = crValue(a.block?.cr) ?? -1
      const bv = crValue(b.block?.cr) ?? -1
      if (av !== bv) return bv - av
    }
    return a.entry.name.localeCompare(b.entry.name, 'zh')
  })
}
