import type { Entry } from '../../../src/schemas/pack'
import type { RawData } from '../extract/load'
import type { ConversionResult } from '../convert'
import { BOOK_SOURCES } from '../config/books'
import { LATIN_ALLOW } from '../config/latinAllow'
import { NAME_OVERRIDES } from '../config/nameOverrides'

export interface HealthMetric {
  id: string
  label: string
  definition: string
  status: 'measured' | 'pending' | 'informational'
  count?: number
}

function allEntries(result: ConversionResult): Entry[] {
  return result.packs.flatMap((p) => p.entries)
}

function strings(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') out.push(value)
  else if (Array.isArray(value)) for (const item of value) strings(item, out)
  else if (value && typeof value === 'object') for (const item of Object.values(value)) strings(item, out)
  return out
}

function walk(v: unknown, visit: (block: Record<string, unknown>) => void): void {
  if (Array.isArray(v)) { for (const item of v) walk(item, visit); return }
  if (!v || typeof v !== 'object') return
  const rec = v as Record<string, unknown>
  visit(rec)
  for (const item of Object.values(rec)) walk(item, visit)
}

function groupCount(entries: Entry[], type: string | null): number {
  const groups = new Map<string, number>()
  for (const e of entries) {
    if (type && e.type !== type) continue
    if (!type && e.type === 'feature') continue
    const book = (e.data.src as { book?: string } | undefined)?.book ?? ''
    const key = `${e.type}|${book}|${e.name}`
    groups.set(key, (groups.get(key) ?? 0) + 1)
  }
  return [...groups.values()].filter((n) => n > 1).length
}

export function healthMetrics(result: ConversionResult, data: RawData): HealthMetric[] {
  const entries = allEntries(result)
  const features = entries.filter((e) => e.type === 'feature')
  const referenced = new Set<string>()
  for (const entry of entries) for (const item of (entry.data.advancement as Array<{ items?: string[]; pool?: string[] }> | undefined) ?? []) {
    for (const id of item.items ?? []) referenced.add(id)
    for (const id of item.pool ?? []) referenced.add(id)
  }
  const orphan = features.filter((e) => ['class', 'subclass'].includes(String((e.data.owner as { type?: string } | undefined)?.type)) && !referenced.has(e.id))
  const optional = features.filter((e) => (e.data.owner as { type?: string } | undefined)?.type === 'optional')
  const bgPrefix = features.filter((e) => e.name.startsWith('特性：'))
  const bgNameMismatch = entries.filter((e) => NAME_OVERRIDES[e.id] && e.name !== NAME_OVERRIDES[e.id].name)
  const dmgRaces = entries.filter((e) => e.type === 'race' && (e.data.src as { book?: string } | undefined)?.book === 'DMG')
  const tableNoParent = entries.filter((e) => e.type === 'table' && !(e.data.parent as unknown) && !(e.data.chapter as unknown)).length
  const formulaMarkers = entries.reduce((n, e) => n + (JSON.stringify(e.data).match(/\{\{spellcasting_mod\}\}/g)?.length ?? 0) + (JSON.stringify(e.data).match(/class\.druid\.level/g)?.length ?? 0), 0)
  let tableCellRefs = 0
  let emptyCells = 0
  for (const e of entries) walk(e.data.text, (block) => {
    const table = block.table as { rows?: unknown[][] } | undefined
    if (!table?.rows) return
    if (table.rows.some((row) => row.some((cell) => String(cell).includes('{{ref:')))) tableCellRefs += 1
    for (const row of table.rows) for (const cell of row) if (String(cell) === '') emptyCells += 1
  })
  const d2 = entries.filter((e) => e.type === 'item' && ((e.data.properties as string[] | undefined) ?? ((e.data.weapon as { properties?: string[] } | undefined)?.properties ?? [])).some((p) => String(p).includes('|'))).length
  const noActions = entries.filter((e) => e.type === 'spell' && (e.data.spellAttack || e.data.save || e.data.damage) && !(e.data.activities as unknown[] | undefined)?.length).length
  const missingName = entries.filter((e) => ((e.data.credit as { missing?: string[] } | undefined)?.missing ?? []).includes('name')).length
  const d1 = entries.reduce((n, e) => {
    for (let text of strings(e.data.text) as string[]) {
      text = text.replace(/\{\{[^{}]*\}\}/g, '')
      for (const match of text.matchAll(/[\u4e00-\u9fff]([A-Za-z]{3,})/g)) if (!LATIN_ALLOW.has(match[1])) n += 1
    }
    return n
  }, 0)
  const d7 = entries.reduce((n, e) => {
    let count = 0
    walk(e.data.text, (block) => {
      if (block.p === '') count += 1
      if (Array.isArray(block.list)) {
        if (block.list.length === 0) count += 1
        for (const item of block.list) if (item === '') count += 1
      }
    })
    return n + count
  }, 0)
  const tce = data.classFeatures.filter((f) => f.isClassFeatureVariant === true).length
  const reprintMonsters = data.monsters.filter((m) => Array.isArray(m.reprintedAs) && m.reprintedAs.some((r) => BOOK_SOURCES.has(String(r).split('|')[1]) && String(r).split('|')[1] !== m.source)).length
  const reprintRaces = [...data.races, ...data.subraces].filter((m) => Array.isArray(m.reprintedAs) && m.reprintedAs.some((r) => BOOK_SOURCES.has(String(r).split('|')[1]) && String(r).split('|')[1] !== m.source)).length
  return [
    { id: 'A1', label: '孤儿特性', status: 'measured', count: orphan.length, definition: 'owner 为 class/subclass 且未被任何 advancement 授予或列入选择的特性' },
    { id: 'A2', label: '可选特性 owner=optional', status: 'measured', count: optional.length, definition: 'owner.type 为 optional 的可选特性' },
    { id: 'A3', label: 'TCE 可选职业特性源记录', status: 'measured', count: tce, definition: 'classFeatures 中 isClassFeatureVariant=true 的记录' },
    { id: 'A4', label: '有附赠熟练但没有 trait 升级操作的特性', status: 'measured', count: features.filter((e) => e.id.includes('bonus-proficien')).length, definition: 'id 含 bonus-proficien 的附赠熟练特性' },
    { id: 'A5', label: '公式/标记错误出现次数', status: 'measured', count: formulaMarkers, definition: '{{spellcasting_mod}} 与 class.druid.level 错公式出现次数' },
    { id: 'B1-ASI', label: '属性值提升特性源记录', status: 'measured', count: data.classFeatures.filter((f) => String(f.name).includes('属性值提升')).length, definition: 'classFeatures 名称含「属性值提升」的记录' },
    { id: 'B2', label: 'feature 名称带「特性：」前缀', status: 'measured', count: bgPrefix.length, definition: 'feature 类型名称以「特性：」开头的条目' },
    { id: 'B2b', label: '变体背景名称与英文名不对应', status: 'measured', count: bgNameMismatch.length, definition: 'nameOverrides 中登记、当前中文名仍与英文名不对应的变体背景' },
    { id: 'B3', label: '通用魔法变体源记录', status: 'measured', count: data.magicVariants.filter((v) => String(v.type).startsWith('GV')).length, definition: '核心范围 magicvariant 中 type 以 GV| 开头的模板记录' },
    { id: 'B4-monster', label: '跨核心书重印怪物源记录', status: 'measured', count: reprintMonsters, definition: 'reprintedAs 指向核心书且目标书不同的怪物' },
    { id: 'B4-race', label: '跨核心书重印种族/亚种族源记录', status: 'measured', count: reprintRaces, definition: 'reprintedAs 指向核心书且目标书不同的种族与亚种族' },
    { id: 'B5', label: 'DMG NPC 种族', status: 'measured', count: dmgRaces.length, definition: 'src.book=DMG 的 race 条目' },
    { id: 'B6a', label: 'feature 以外同书同名组', status: 'measured', count: groupCount(entries, null), definition: '非 feature 条目按 type+书+名称分组的重复组数' },
    { id: 'B6b', label: 'feature 同书同名组', status: 'measured', count: groupCount(entries, 'feature'), definition: 'feature 按书+名称分组的重复组数，只报数不改名' },
    { id: 'B7', label: '重复拼接随机表名', status: 'pending', definition: 'R9 后才能判断表名与所属条目名重复拼接' },
    { id: 'B8', label: '没有所属条目的随机表', status: 'measured', count: tableNoParent, definition: 'table 条目没有 parent/chapter 的数量；R9 后目标 0' },
    { id: 'C-language', label: '语言源记录', status: 'pending', definition: 'R11 导入语言后才能报数与核对' },
    { id: 'D1', label: '汉字紧挨拉丁词', status: 'measured', count: d1, definition: '正文中一个汉字后紧接 3 个以上拉丁字母，排除 {{…}} 与 latinAllow 白名单' },
    { id: 'D2', label: '物品属性带来源代码', status: 'measured', count: d2, definition: 'properties 顶层（缺失时用 weapon.properties）至少含一个带 | 的属性代码的物品条目数（同一物品只算一次）' },
    { id: 'D3', label: '表格单元引用条目', status: 'informational', count: tableCellRefs, definition: '正文表格单元含 {{ref:…}} 的条目数，仅作参考' },
    { id: 'D4', label: '空表格单元', status: 'measured', count: emptyCells, definition: '表格 rows 中为空字符串的单元数' },
    { id: 'D5', label: '中英混用的职业表列名', status: 'measured', count: entries.filter((e) => e.type === 'class' && Array.isArray((e.data.table as { cols?: string[] } | undefined)?.cols) && (e.data.table as { cols: string[] }).cols.some((c) => /(?:st|th|环)/i.test(c))).length, definition: 'class.table.cols 含 st/th/环 的条目数' },
    { id: 'D6', label: '缺中文名称', status: 'measured', count: missingName, definition: 'credit.missing 含 name 的条目' },
    { id: 'D7', label: '空段落/空列表项', status: 'measured', count: d7, definition: '正文块中 p 为空字符串或 list 项为空字符串的出现次数' },
    { id: 'spell-actions', label: '有攻击/豁免/伤害但无行动的法术', status: 'measured', count: noActions, definition: 'spell 有攻击/豁免/伤害但 activities 为空' },
  ]
}
