import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { loadRawData, expandItemEntries } from '../extract/load'
import { expandMagicVariants, mergeItemLists } from '../convert/items'
import { planAll } from '../convert/plan'
import { planR11 } from '../convert/planR11'
import { loadR11Data } from '../extract/r11'
import { buildCandidates } from '../convert/r9Candidates'
import { planR9 } from '../convert/planR9'
import { normRaw, parseLabel, rangeOf, refRows, cellText } from '../convert/r9lib'
import { addRef, type RefIndex } from '../markup/inline'
import { PACK_BY_SOURCE, SRD_PACK_ID } from '../config/books'
import { DATA_5ETOOLS } from '../extract/load'
import { writeText } from '../lib/io'

const SOURCES = ['PHB', 'SCAG', 'MM', 'VGM', 'MTF', 'DMG', 'XGE', 'TCE', 'MPMM', 'BMT']
const SKIP = new Set(['table', 'tableGroup', 'image', 'gallery', 'statblock', 'list'])
const TAGTYPE: Record<string, string> = { creature: 'monster', spell: 'spell', item: 'item', race: 'race', subclass: 'subclass', optfeature: 'feature', reward: 'reward', feat: 'feat', condition: 'condition', trap: 'hazard', hazard: 'hazard', background: 'background', class: 'class', action: 'rule:action', variantrule: 'rule:variant', object: 'object', deity: 'deity', disease: 'disease' }
type Obj = Record<string, unknown>
const obj = (v: unknown): v is Obj => !!v && typeof v === 'object' && !Array.isArray(v)
const arr = (v: unknown): unknown[] => Array.isArray(v) ? v : []
const str = (v: unknown): string => typeof v === 'string' ? v : ''

function outlineCount(ch: Obj): number {
  let n = 1
  const walk = (value: unknown, level: number): void => {
    if (Array.isArray(value)) { for (const item of value) walk(item, level); return }
    if (!obj(value)) return
    if (SKIP.has(str(value.type))) return
    let next = level
    if (['section', 'entries', 'inset'].includes(str(value.type)) && str(value.name)) { n += 1; next = level + 1 }
    for (const item of Object.values(value)) if (item && typeof item === 'object') walk(item, next)
  }
  walk(ch.entries, 0)
  return n
}

function hk(rows: Array<{ min?: number; max?: number; cells: string[] }>, expr?: string): string {
  return JSON.stringify([expr ?? null, rows.map((r) => [r.min ?? null, r.max ?? null, r.cells.map(normRaw).join('|')])])
}

function tableKey(node: Obj): string | undefined {
  const parsed = parseLabel(Array.isArray(node.colLabels) ? node.colLabels[0] : undefined)
  const rowsRaw = arr(node.rows).map((r) => Array.isArray(r) ? r : obj(r) && Array.isArray(r.row) ? r.row : [])
  if (parsed) {
    const rows: Array<{ min: number; max: number; cells: string[] }> = []
    for (const r of rowsRaw) { const rg = rangeOf(r[0], parsed.hi); if (!rg) return undefined; rows.push({ ...rg, cells: r.slice(1).map(cellText) }) }
    return hk(rows, parsed.expr)
  }
  try { return hk(refRows(node.rows)) } catch { return undefined }
}

async function main(): Promise<void> {
  const data = await loadRawData()
  const expanded = expandMagicVariants({ items: data.items, baseItems: data.baseItems, magicVariants: data.magicVariants, foundryVariants: data.foundryVariants })
  const items = expandItemEntries(mergeItemLists(data.items, data.baseItems, expanded.items), data.itemEntryTemplates)
  const plan = planAll(data, items)
  const r11 = planR11(await loadR11Data(), plan.entries)
  plan.entries.push(...r11.entries)
  const r11ids = new Set(r11.entries.map((e) => e.id))
  const pool = buildCandidates(plan, data.legendaryGroups, r11ids)
  const r9 = planR9(plan, { includeRef: true, replace: false }, data.legendaryGroups, r11ids)
  const surv = (c: (typeof pool)[number]) => r9.survivorByCandidate.get(c.i!) ?? c
  const byHk = new Map<string, typeof pool>()
  for (const c of pool) { const k = hk(c.rows, c.ref ? undefined : c.expr); byHk.set(k, [...(byHk.get(k) ?? []), c]) }
  const index: RefIndex = { byTypeName: new Map(), byTypeNameSource: new Map() }
  for (const e of [...plan.entries, ...r9.tables] as Array<{ id: string; type: string; name: string; nameEn: string; packId: string; source: string; context: { ruleCategory?: string } }>) {
    addRef(index, { id: e.id, type: e.type, name: e.name, packId: e.packId, category: e.context?.ruleCategory }, e.source)
    if (e.nameEn && e.nameEn !== e.name) addRef(index, { id: e.id, type: e.type, name: e.nameEn, packId: e.packId, category: e.context?.ruleCategory }, e.source)
  }
  const resolve = (type: string, name: string, enName: string, src: string | undefined, book: string): string | undefined => {
    for (const nm of [name, enName]) {
      const k = type + '|' + nm
      const t = (src ? index.byTypeNameSource.get(k + '|' + src.toUpperCase()) : undefined) ?? index.byTypeNameSource.get(k + '|' + book) ?? index.byTypeName.get(k)?.[0] ?? (type.startsWith('rule:') ? index.byTypeName.get('rule|' + nm)?.[0] : undefined)
      if (t) return t.id
    }
    return undefined
  }
  const booksJson = JSON.parse(readFileSync(join(DATA_5ETOOLS, 'books.json'), 'utf8')) as { book: Obj[] }
  const bookInfo = new Map(booksJson.book.map((b) => [str(b.source), b]))
  const perBook: Record<string, { chapters: number; outline: number; tables: number; refs: number; inline: number; statblocks: number; statblockRefs: number; fluff: number }> = {}
  let chapters = 0, outline = 0, tables = 0, refs = 0, inline = 0, statblocks = 0, statblockRefs = 0, fluffEmbeds = 0, pruned = 0, missingPage = 0
  let image = 0, internal = 0, gallery = 0, square = 0, none = 0, metadata = 0, quoteFrom = 0, abilityGeneric = 0
  const fluffRecords = data.fluff ?? []
  for (const source of SOURCES) {
    const book = JSON.parse(readFileSync(join(DATA_5ETOOLS, 'book', `book-${source.toLowerCase()}.json`), 'utf8')) as { bookData: Array<{ data: Obj[] }> }
    const info = bookInfo.get(source)
    if (!info) throw new Error(`books.json 缺少 ${source}`)
    const contents = arr(info.contents)
    const list = book.bookData[0].data
    if (contents.length !== list.length) throw new Error(`${source} contents 长度 ${contents.length} != chapters ${list.length}`)
    const pb = perBook[source] = { chapters: 0, outline: 0, tables: 0, refs: 0, inline: 0, statblocks: 0, statblockRefs: 0, fluff: 0 }
    for (const ch of list) {
      chapters += 1; pb.chapters += 1
      const count = outlineCount(ch); outline += count; pb.outline += count
      if (typeof ch.page !== 'number') missingPage += 1
      const walk = (value: unknown, fromFluff = false): void => {
        if (Array.isArray(value)) { for (const item of value) walk(item, fromFluff); return }
        if (!obj(value)) return
        const type = str(value.type)
        if (type === 'table') {
          tables += 1; pb.tables += 1
          const key = tableKey(value)
          const ids = key ? [...new Set((byHk.get(key) ?? []).filter((c) => c.source === source).map((c) => surv(c).id!))] : []
          if (ids.length === 1) { refs += 1; pb.refs += 1 } else { inline += 1; pb.inline += 1 }
          for (const r of arr(value.rows)) for (const cell of arr(r)) if (obj(cell) && cell.type === 'table') walk(cell)
          return
        }
        if (type === 'statblock') {
          statblocks += 1; pb.statblocks += 1
          const tag = str(value.tag), fluff = value.prop === 'monsterFluff'
          if (tag) {
            statblockRefs += 1; pb.statblockRefs += 1
            let target = resolve(TAGTYPE[tag], str(value.name), str(value.ENG_name), str(value.source) || undefined, source)
            if (!target && tag === 'race') {
              const m = /^(.*?) \((.*)\)$/.exec(str(value.ENG_name))
              if (m) target = resolve('subrace', `${m[2]} ${m[1]}`, `${m[2]} ${m[1]}`, str(value.source) || undefined, source)
            }
            if (!target) throw new Error(`statblock 未解析 ${source} ${str(value.ENG_name)}`)
            const pack = r9.tables.find((t) => t.id === target)?.packId ?? plan.entries.find((e) => e.id === target)?.packId
            if (pack !== PACK_BY_SOURCE.get(source) && pack !== SRD_PACK_ID) pruned += 1
          }
          if (fluff) {
            fluffEmbeds += 1; pb.fluff += 1
            const rec = fluffRecords.find((f) => f.kind === 'monster' && f.raw.source === value.source && (f.raw.ENG_name === value.ENG_name || f.raw.name === value.name))
            if (!rec) throw new Error(`fluff 未找到 ${source} ${str(value.ENG_name)}`)
            walk(rec.raw.entries, true)
          }
          return
        }
        if (type === 'image') image += 1
        else if (type === 'internal') internal += 1
        else if (type === 'gallery') gallery += 1
        else if (type === 'square') square += 1
        else if (type === 'none') none += 1
        else if (!type && !value.name && !value.entries) metadata += 1
        if (type === 'quote' && value.from && !fromFluff) quoteFrom += 1
        if (type === 'abilityGeneric') abilityGeneric += 1
        for (const item of Object.values(value)) if (item && typeof item === 'object') walk(item, fromFluff)
      }
      walk(ch.entries)
    }
  }
  const lines = [
    '# D1.2a R12 阶段 0 盘点', '',
    '脚本：`tools/data/report/r12Inventory.ts`。范围：十本核心书的 `bookData[0].data`，含怪物族谱背景文字。', '',
    '| 书 | 章 | 小节目录 | 表块 | 引用表 | 行内表 | statblock | statblock 引用 | 背景文字 |', '|---|---:|---:|---:|---:|---:|---:|---:|---:|',
    ...SOURCES.map((s) => { const p = perBook[s]; return `| ${s} | ${p.chapters} | ${p.outline} | ${p.tables} | ${p.refs} | ${p.inline} | ${p.statblocks} | ${p.statblockRefs} | ${p.fluff} |` }),
    `| **合计** | **${chapters}** | **${outline}** | **${tables}** | **${refs}** | **${inline}** | **${statblocks}** | **${statblockRefs}** | **${fluffEmbeds}** |`, '',
    `- 降级 statblock：${pruned}；缺页章：${missingPage}。`,
    `- 不导入块：image ${image}、internal ${internal}、gallery ${gallery}、square ${square}、none ${none}；元数据对象 ${metadata}。`,
    `- quote.from：${quoteFrom}；abilityGeneric：${abilityGeneric}。`,
    `- 候选表：${pool.length}；最终表：${r9.tables.length}。`,
    '', '## 与第 4 节对照', '',
    '96 章、4,501 项目录、677 表块（672 + 5）、2,289 statblock（1,939 + 350）、471 背景文字、12 降级、14 缺页章。',
  ]
  await writeText(join(process.cwd(), 'docs', 'probes', 'D1.2a_R12_盘点.md'), `${lines.join('\n')}\n`)
  console.log(JSON.stringify({ chapters, outline, tables, refs, inline, statblocks, statblockRefs, fluffEmbeds, pruned, missingPage, image, internal, gallery, square, none, metadata, quoteFrom, abilityGeneric, perBook }))
}
main().catch((error) => { console.error(error instanceof Error ? error.stack ?? error.message : error); process.exitCode = 1 })
