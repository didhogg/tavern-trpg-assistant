import { join } from 'node:path'
import { readJson, writeText, REPO_ROOT } from '../lib/io'
import { DATA_5ETOOLS } from '../extract/load'
import { collectPaths, scanSourceRecords, type SourceRecord } from './fieldPaths'
import { FIELD_COVERAGE } from '../config/fieldCoverage'
import { TAGS } from '../markup/tags'

const R11_TYPES = new Set([
  'language', 'language-script', 'skill', 'sense', 'item-property', 'item-type',
  'item-type-additional-entries', 'deity', 'reward', 'boon', 'cult', 'trap', 'hazard',
  'object', 'vehicle', 'makebrew-creature-action', 'makebrew-creature-trait',
  'monster-feature', 'recipe', 'charoption',
])

const TYPE_LABEL: Record<string, string> = {
  language: 'language',
  'language-script': 'rule/script',
  skill: 'rule/skill',
  sense: 'rule/sense',
  'item-property': 'rule/itemProperty',
  'item-type': 'rule/itemType',
  'item-type-additional-entries': 'rule/itemTypeExtra',
  deity: 'deity',
  reward: 'reward',
  boon: 'reward(boon)',
  cult: 'cult',
  trap: 'hazard(trap)',
  hazard: 'hazard(hazard)',
  object: 'object',
  vehicle: 'vehicle',
  'makebrew-creature-action': 'monsterPart(action)',
  'makebrew-creature-trait': 'monsterPart(trait)',
  'monster-feature': 'monsterPart(feature)',
  recipe: 'recipe',
  charoption: 'charoption',
}

interface Count { core: number; d1b2: number }
interface BlockCount { type: string; count: number; example: string }

function isObj(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object' && !Array.isArray(v)
}

function walkBlocks(value: unknown, out: Map<string, BlockCount>, example: string): void {
  if (Array.isArray(value)) {
    for (const item of value) walkBlocks(item, out, example)
    return
  }
  if (!isObj(value)) return
  if (typeof value.type === 'string') {
    const type = value.type
    const current = out.get(type) ?? { type, count: 0, example }
    current.count += 1
    out.set(type, current)
  }
  for (const item of Object.values(value)) if (Array.isArray(item) || isObj(item)) walkBlocks(item, out, example)
}

function walkTags(value: unknown, out: Map<string, number>): void {
  if (typeof value === 'string') {
    for (const match of value.matchAll(/\{@([A-Za-z0-9]+)/g)) out.set(match[1], (out.get(match[1]) ?? 0) + 1)
  } else if (Array.isArray(value)) {
    for (const item of value) walkTags(item, out)
  } else if (isObj(value)) {
    for (const item of Object.values(value)) walkTags(item, out)
  }
}


function collectSections(value: unknown, out: Record<string, unknown>[]): void {
  if (Array.isArray(value)) {
    for (const item of value) collectSections(item, out)
    return
  }
  if (!isObj(value)) return
  if (value.type === 'section') out.push(value)
  collectSections(value.entries, out)
}

async function quickrefCounts(): Promise<{ quick: number; screen: number; deferred: number; sections: Array<Record<string, unknown>> }> {
  const quick = await readJson<Record<string, unknown>>(join(DATA_5ETOOLS, 'generated', 'bookref-quick.json'))
  const screen = await readJson<Record<string, unknown>>(join(DATA_5ETOOLS, 'generated', 'bookref-dmscreen.json'))
  const quickData = quick.data as Record<string, unknown>
  const screenData = screen.data as Record<string, unknown>
  const quickSections: Record<string, unknown>[] = []
  collectSections(quickData?.['bookref-quick'], quickSections)
  const screenSections: Record<string, unknown>[] = []
  collectSections(screenData?.['bookref-dmscreen'], screenSections)
  const deferred = screenSections.filter((section) => typeof section.source !== 'string' || typeof section.page !== 'number')
  const coreScreen = screenSections.filter((section) => typeof section.source === 'string' && typeof section.page === 'number')
  return { quick: quickSections.length, screen: coreScreen.length, deferred: deferred.length, sections: [...quickSections, ...coreScreen] }
}

function countOf(records: SourceRecord[], type: string): Count {
  const list = records.filter((r) => r.type === type)
  return { core: list.filter((r) => r.scope === 'core').length, d1b2: list.filter((r) => r.scope === 'd1.2b').length }
}

function markdown(): Promise<string> {
  return (async () => {
    const scan = await scanSourceRecords()
    const records = scan.records.filter((r) => R11_TYPES.has(r.type))
    const quick = await quickrefCounts()
    const lines: string[] = []
    lines.push('# D1.2a R11 阶段 0 盘点')
    lines.push('')
    lines.push('脚本：`tools/data/report/r11Inventory.ts`。来源：`scanSourceRecords()` 的 core / d1.2b 范围；速查另读 `generated/bookref-quick.json` 与 `generated/bookref-dmscreen.json`。')
    lines.push('')
    lines.push('## 1. 条数')
    lines.push('')
    lines.push('| 来源类型 | 输出类型 | core | d1.2b |')
    lines.push('|---|---|---:|---:|')
    for (const type of R11_TYPES) {
      const count = countOf(records, type)
      lines.push(`| ${type} | ${TYPE_LABEL[type] ?? type} | ${count.core} | ${count.d1b2} |`)
    }
    lines.push(`| quickref（合并去重前） | rule/quickref | ${quick.quick} + ${quick.screen} | 0 |`)
    lines.push('')
    lines.push(`速查：bookref-quick ${quick.quick} 节；bookref-dmscreen 有 source/page ${quick.screen} 节；AL 延期 ${quick.deferred} 节。合并后核心 ${quick.quick + quick.screen} 条。`)
    lines.push('')
    lines.push('## 2. 字段路径与矩阵对照')
    lines.push('')
    lines.push('| 路径 | core 记录数 | 示例文件 | 矩阵 |')
    lines.push('|---|---:|---|---|')
    const paths = collectPaths(records)
    const missing: string[] = []
    const extra: string[] = []
    for (const [path, info] of [...paths].sort(([a], [b]) => a.localeCompare(b))) {
      const entry = FIELD_COVERAGE[path]
      if (!entry) missing.push(path)
      lines.push(`| ${path} | ${info.count} | ${info.example} | ${entry ? `${entry.how}${entry.to ? ` → ${entry.to}` : ''}` : '缺'} |`)
    }
    for (const path of Object.keys(FIELD_COVERAGE)) {
      if (path.startsWith('quickref.')) continue
      const type = path.split('.', 1)[0]
      if (R11_TYPES.has(type) && !paths.has(path)) extra.push(path)
    }
    lines.push('')
    lines.push(`来源有、矩阵没有：${missing.length} 条。矩阵有、来源没有：${extra.length} 条。`)
    if (missing.length) lines.push('', ...missing.map((p) => `- 缺：${p}`))
    if (extra.length) lines.push('', ...extra.map((p) => `- 多：${p}`))
    lines.push('')
    lines.push('## 3. 正文块类型')
    lines.push('')
    const blocks = new Map<string, BlockCount>()
    for (const record of records) walkBlocks(record.value, blocks, `${record.type}|${String(record.value.name ?? '')}`)
    lines.push('| 块类型 | 出现次数 | 示例 | 当前处理 |')
    lines.push('|---|---:|---|---|')
    for (const block of [...blocks.values()].sort((a, b) => a.type.localeCompare(b.type))) {
      const known = ['entries', 'section', 'list', 'table', 'quote', 'insetReadaloud', 'inset', 'options', 'item', 'itemSub', 'attack', 'image', 'gallery', 'hr', 'internal', 'actions', 'ingredient', 'tableGroup']
      const handling = known.includes(block.type) ? 'convertBlocks / R11 钩子' : 'R11 钩子按最小保留处理'
      lines.push(`| ${block.type} | ${block.count} | ${block.example} | ${handling} |`)
    }
    lines.push('')
    lines.push('## 4. 内联标签')
    lines.push('')
    const tags = new Map<string, number>()
    for (const record of records) walkTags(record.value, tags)
    lines.push('| 标签 | 次数 | tags.ts |')
    lines.push('|---|---:|---|')
    for (const [tag, count] of [...tags].sort(([a], [b]) => a.localeCompare(b))) lines.push(`| ${tag} | ${count} | ${TAGS[tag] ? '已登记' : '缺'} |`)
    const missingTags = [...tags.keys()].filter((tag) => !TAGS[tag])
    lines.push('')
    lines.push(`未登记标签：${missingTags.length ? missingTags.join('、') : '无'}。`)
    lines.push('')
    lines.push('## 5. 名称冲突')
    lines.push('')
    const groups = new Map<string, number>()
    for (const record of records) {
      const name = typeof record.value.name === 'string' ? record.value.name : ''
      if (!name) continue
      const key = `${record.type}|${name}|${record.source}`
      groups.set(key, (groups.get(key) ?? 0) + 1)
    }
    const conflicts = [...groups].filter(([, n]) => n > 1)
    lines.push(`同类型（名称+来源）重复：${conflicts.length} 组。`)
    for (const [key, n] of conflicts) lines.push(`- ${key} ×${n}`)
    const ruleNames = new Map<string, Set<string>>()
    for (const record of records) {
      if (!['language-script', 'skill', 'sense', 'item-property', 'item-type', 'item-type-additional-entries'].includes(record.type)) continue
      const name = typeof record.value.name === 'string' ? record.value.name : ''
      if (!name) continue
      const set = ruleNames.get(name) ?? new Set()
      set.add(record.type)
      ruleNames.set(name, set)
    }
    const sameRule = [...ruleNames].filter(([, set]) => set.size > 1)
    lines.push('')
    lines.push(`规则类中文同名组：${sameRule.length} 组。`)
    for (const [name, set] of sameRule) lines.push(`- ${name}：${[...set].join('、')}`)
    lines.push('')
    lines.push('## 6. 与预盘点对照')
    lines.push('')
    lines.push('本文件由脚本重新扫描生成；字段形状、条数、块类型与 `docs/probes/D1.2a_R11_来源形状预盘点.md` 对照结果见上表。')
    lines.push('')
    return lines.join('\n')
  })()
}

markdown().then(async (text) => {
  await writeText(join(REPO_ROOT, 'docs', 'probes', 'D1.2a_R11_盘点.md'), `${text}\n`)
  console.log('已写入 docs/probes/D1.2a_R11_盘点.md')
}).catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : error)
  process.exitCode = 1
})
