import type { Entry } from '../../../src/schemas/pack'
import type { RawData } from '../extract/load'
import type { ConversionResult } from '../convert'
import { BOOK_SOURCES } from '../config/books'

export interface HealthMetric {
  id: string
  label: string
  count: number
  note?: string
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

function entryText(entry: Entry): string {
  return strings(entry.data.text).join(' ')
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
  const dmgRaces = entries.filter((e) => e.type === 'race' && (e.data.src as { book?: string } | undefined)?.book === 'DMG')
  const dup = new Map<string, number>()
  for (const e of entries) {
    const src = (e.data.src as { book?: string } | undefined)?.book ?? ''
    const key = `${e.type}|${src}|${e.name}`
    dup.set(key, (dup.get(key) ?? 0) + 1)
  }
  const duplicateNames = [...dup.values()].filter((n) => n > 1).length
  const tableNoParent = entries.filter((e) => e.type === 'table' && !(e.data.parent as unknown) && !(e.data.chapter as unknown)).length
  const formulaMarkers = entries.reduce((n, e) => n + (JSON.stringify(e.data).match(/\{\{spellcasting_mod\}\}/g)?.length ?? 0), 0) + entries.reduce((n, e) => n + (JSON.stringify(e.data).match(/class\.druid\.level/g)?.length ?? 0), 0)
  const tableCellRefs = entries.filter((e) => {
    let hit = false
    const walk = (v: unknown): void => {
      if (hit) return
      if (Array.isArray(v)) { for (const item of v) walk(item); return }
      if (!v || typeof v !== 'object') return
      const rec = v as Record<string, unknown>
      const table = rec.table as { rows?: unknown[][] } | undefined
      if (table?.rows) for (const row of table.rows) for (const cell of row) if (String(cell).includes('{{ref:')) hit = true
      for (const item of Object.values(rec)) walk(item)
    }
    walk(e.data.text)
    return hit
  }).length
  const emptyCells = entries.reduce((n, e) => {
    let count = 0
    const walk = (v: unknown): void => {
      if (Array.isArray(v)) { for (const item of v) walk(item); return }
      if (!v || typeof v !== 'object') return
      const rec = v as Record<string, unknown>
      const table = rec.table as { rows?: unknown[][] } | undefined
      if (table?.rows) for (const row of table.rows) for (const cell of row) if (String(cell) === '') count++
      for (const item of Object.values(rec)) walk(item)
    }
    walk(e.data.text)
    return n + count
  }, 0)
  const noActions = entries.filter((e) => e.type === 'spell' && (e.data.spellAttack || e.data.save || e.data.damage) && !(e.data.activities as unknown[] | undefined)?.length).length
  const missingName = entries.filter((e) => ((e.data.credit as { missing?: string[] } | undefined)?.missing ?? []).includes('name')).length
  const cnEnGlued = entries.reduce((n, e) => n + (entryText(e).match(/[\u4e00-\u9fff][A-Za-z]/g)?.length ?? 0), 0)
  const tce = data.classFeatures.filter((f) => f.isClassFeatureVariant === true).length
  const reprintMonsters = data.monsters.filter((m) => Array.isArray(m.reprintedAs) && m.reprintedAs.some((r) => BOOK_SOURCES.has(String(r).split('|')[1]) && String(r).split('|')[1] !== m.source)).length
  const reprintRaces = [...data.races, ...data.subraces].filter((m) => Array.isArray(m.reprintedAs) && m.reprintedAs.some((r) => BOOK_SOURCES.has(String(r).split('|')[1]) && String(r).split('|')[1] !== m.source)).length
  const emptyText = entries.filter((e) => JSON.stringify(e.data.text ?? '').includes('"p":""') || JSON.stringify(e.data.text ?? '').includes('"list":[]')).length
  return [
    { id: 'A1', label: '孤儿特性', count: orphan.length, note: 'owner 为 class/subclass 且未被 advancement 引用' },
    { id: 'A2', label: '可选特性 owner=optional', count: optional.length },
    { id: 'A3', label: 'TCE 可选职业特性源记录', count: tce },
    { id: 'A4', label: '缺少 trait 的附赠熟练', count: features.filter((e) => e.id.includes('bonus-proficien')).length, note: '按附赠熟练特性 id 计；R5 补 trait' },
    { id: 'A5', label: '公式/标记错误出现次数', count: formulaMarkers },
    { id: 'B1-ASI', label: '属性值提升特性源记录', count: data.classFeatures.filter((f) => String(f.name).includes('属性值提升')).length },
    { id: 'B2', label: '背景特性名带「特性：」前缀', count: bgPrefix.length },
    { id: 'B3', label: '通用魔法变体源记录', count: data.magicVariants.filter((v) => String(v.type).startsWith('GV')).length },
    { id: 'B4-monster', label: '跨核心书重印的怪物源记录', count: reprintMonsters },
    { id: 'B4-race', label: '跨核心书重印的种族/亚种族源记录', count: reprintRaces },
    { id: 'B5', label: 'DMG NPC 种族', count: dmgRaces.length },
    { id: 'B6', label: '同书同名条目数', count: duplicateNames },
    { id: 'B7', label: '重复拼接随机表名', count: 0, note: 'R9 导入 parent 后才能判断' },
    { id: 'B8', label: '没有所属条目的随机表', count: tableNoParent },
    { id: 'C-language', label: '语言源记录', count: 0, note: 'R11 导入，P0 复核源文件为 201 条（非核心范围）' },
    { id: 'D1', label: '中文后紧跟英文原名出现次数', count: cnEnGlued },
    { id: 'D2', label: '带来源后缀的武器属性', count: entries.reduce((n, e) => n + ((e.data.weapon as { properties?: string[] } | undefined)?.properties ?? []).filter((p) => String(p).includes('|')).length, 0), note: '当前为 items 的 properties 出现数' },
    { id: 'D3', label: '表格单元里有引用的条目', count: tableCellRefs },
    { id: 'D4', label: '空表格单元', count: emptyCells },
    { id: 'D5', label: '中英混用的职业表列名', count: entries.filter((e) => e.type === 'class' && Array.isArray((e.data.table as { cols?: string[] } | undefined)?.cols) && ((e.data.table as { cols: string[] }).cols.some((c) => /(?:st|th|环)/i.test(c)))).length },
    { id: 'D6', label: '缺中文名称', count: missingName },
    { id: 'D7', label: '空段落/空列表', count: emptyText },
    { id: 'D9', label: '对比页 JSON 显示', count: 0, note: '界面项，R15 处理' },
    { id: 'D10', label: '新字段未显示', count: 0, note: '界面项，R15 处理' },
    { id: 'spell-actions', label: '有攻击/豁免/伤害但无行动的法术', count: noActions },
  ]
}
