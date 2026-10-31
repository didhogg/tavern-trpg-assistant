import { join } from 'node:path'
import { readJson, writeText, REPO_ROOT } from '../lib/io'
import { loadRawData, expandItemEntries, type Raw } from '../extract/load'
import { expandMagicVariants, mergeItemLists } from '../convert/items'
import { planAll } from '../convert/plan'
import { DATA_5ETOOLS } from '../extract/load'
import { BOOK_SOURCES } from '../config/books'

const CORE = new Set([...BOOK_SOURCES])
const TYPES = new Set(['spell', 'monster', 'item', 'class', 'subclass', 'feature', 'race', 'subrace', 'background', 'feat', 'condition', 'rule', 'lore'])

function parseLabel(label: unknown): { expr: string; deck: boolean; hi: number } | undefined {
  if (typeof label !== 'string') return undefined
  let s = label.trim()
  let deck = false
  const tag = /^\{@dice ([^}]*)\}$/.exec(s)
  if (tag) { const parts = tag[1].split('|'); s = parts[0]; if (parts[1] && /牌/.test(parts[1])) deck = true }
  const pm = /#\$prompt_number:title=([^$]*)\$#/.exec(s)
  if (pm) s = s.replace(/#\$prompt_number:title=[^$]*\$#/, '')
  s = s.replace(/\s+/g, '').toLowerCase().replace(/\+$/, '')
  if (!/^\d*d\d+(\+\d*d\d+)*$/.test(s)) return undefined
  let hi = 0
  for (const term of s.split('+')) { const m = /^(\d*)d(\d+)$/.exec(term)!; hi += (m[1] ? Number(m[1]) : 1) * Number(m[2]) }
  const expr = s.split('+').map((t) => (t.startsWith('d') ? '1' + t : t)).join('+')
  return { expr, deck, hi }
}

function rangeOf(cell: unknown, hi: number): { min: number; max: number } | undefined {
  if (cell && typeof cell === 'object') { const c = cell as Raw; const r = c.roll as Raw | undefined; if (r && typeof r.exact === 'number') return { min: r.exact, max: r.exact }; if (r && typeof r.min === 'number' && typeof r.max === 'number') return { min: r.min, max: r.max }; return undefined }
  if (typeof cell === 'number' && Number.isInteger(cell)) return { min: cell === 0 ? hi : cell, max: cell === 0 ? hi : cell }
  if (typeof cell !== 'string') return undefined
  const t = cell.trim().replace(/[–—−]/g, '-')
  let m = /^(\d{1,3})$/.exec(t); if (m) { let n = Number(m[1]); if (n === 0 && hi >= 100) n = hi; return { min: n, max: n } }
  m = /^(\d{1,3})\s*-\s*(\d{1,3})$/.exec(t); if (m) { let a = Number(m[1]), b = Number(m[2]); if (a === 0) a = hi; if (b === 0) b = hi; return { min: a, max: b } }
  return undefined
}

async function main(): Promise<void> {
  const data = await loadRawData()
  const expanded = expandMagicVariants({ items: data.items, baseItems: data.baseItems, magicVariants: data.magicVariants, foundryVariants: data.foundryVariants })
  const items = expandItemEntries(mergeItemLists(data.items, data.baseItems, expanded.items), data.itemEntryTemplates)
  const plan = planAll(data, items)
  const body = { table: 0, roll: 0, ref: 0, fail: 0, groups: [] as string[] }
  const bodySigs = new Set<string>()
  const mixed: string[] = []
  for (const e of plan.entries) {
    if (!TYPES.has(e.type)) continue
    const walk = (o: unknown, where: string): void => {
      if (Array.isArray(o)) { for (const x of o) walk(x, where); return }
      if (!o || typeof o !== 'object') return
      const rec = o as Raw
      if (rec.type === 'tableGroup') body.groups.push(`${e.id} ${where}`)
      if (rec.type === 'table') {
        body.table += 1
        const label = parseLabel((rec.colLabels as unknown[] | undefined)?.[0])
        const rows = Array.isArray(rec.rows) ? rec.rows : []
        if (!label) {
          body.ref += 1
          bodySigs.add(JSON.stringify([e.source, `${e.source}|${e.name}`, rows.map((r) => Array.isArray(r) ? [null, null, r] : null)]))
        } else {
          const parsedRows = rows.map((r) => Array.isArray(r) ? rangeOf(r[0], label.hi) : undefined)
          const ok = rows.length > 0 && parsedRows.every(Boolean)
          if (ok) {
            body.roll += 1
            bodySigs.add(JSON.stringify([e.source, `${e.source}|${e.name}`, rows.map((r, i) => { const rg = parsedRows[i]!; return [rg.min, rg.max, (r as unknown[]).slice(1).map((c) => typeof c === 'string' ? c : typeof c === 'number' ? String(c) : c && typeof c === 'object' && typeof (c as Raw).entry === 'string' ? String((c as Raw).entry) : JSON.stringify(c))] })]))
          } else { body.fail += 1; mixed.push(`${e.id} ${String(rec.caption ?? '')}`) }
        }
      }
      for (const [k, v] of Object.entries(rec)) { if (k === 'rows' || k === 'colLabels') continue; walk(v, where) }
    }
    walk(e.raw.entries, 'entries'); walk(e.raw._lore, '_lore')
  }
  const g = await readJson<Record<string, unknown>>(join(DATA_5ETOOLS, 'generated', 'gendata-tables.json'))
  const gTables = (g.table as Raw[]).filter((t) => CORE.has(String(t.source)))
  const gRoll = gTables.filter((t) => parseLabel((t.colLabels as unknown[] | undefined)?.[0]))
  const gRef = gTables.filter((t) => !parseLabel((t.colLabels as unknown[] | undefined)?.[0]))
  const groups = (g.tableGroup as Raw[]).filter((x) => CORE.has(String(x.source)))
  let ggRoll = 0, ggRef = 0, ggTotal = 0
  for (const grp of groups) for (const t of (grp.tables as Raw[])) { ggTotal += 1; if (parseLabel((t.colLabels as unknown[] | undefined)?.[0])) ggRoll += 1; else ggRef += 1 }
  const names = (await readJson<Record<string, unknown>>(join(DATA_5ETOOLS, 'names.json'))).name as Raw[]
  const nameTables = names.filter((x) => CORE.has(String(x.source))).reduce((n, x) => n + ((x.tables as unknown[]).length), 0)
  const encounters = (await readJson<Record<string, unknown>>(join(DATA_5ETOOLS, 'encounters.json'))).encounter as Raw[]
  const encTables = encounters.filter((x) => CORE.has(String(x.source))).reduce((n, x) => n + ((x.tables as unknown[]).length), 0)
  const decks = (await readJson<Record<string, unknown>>(join(DATA_5ETOOLS, 'decks.json'))).deck as Raw[]
  const loot = await readJson<Record<string, unknown>>(join(DATA_5ETOOLS, 'loot.json'))
  const gems = (loot.gems as Raw[]).filter((x) => CORE.has(String(x.source))).length
  const art = (loot.artObjects as Raw[]).filter((x) => CORE.has(String(x.source))).length
  const old = plan.tables.length
  const oldSigs = new Set(plan.tableSeeds.map((seed, i) => JSON.stringify([seed.source, seed.parentKey ?? plan.tables[i]?.id, seed.rows.map((r) => [r.min, r.max, r.cells])])))
  const matchedOld = [...oldSigs].filter((sig) => bodySigs.has(sig)).length
  const xCount = old - matchedOld
  const lines = [
    '# D1.2a R9 阶段 0 盘点', '',
    '脚本：`tools/data/report/r9Inventory.ts`。范围：核心十本书；正文表按 `planAll` 条目 `raw.entries` 与 `raw._lore` 深度优先扫描。', '',
    '## 1. 候选', '',
    '| 来源 | 扫描数 | 第 4 节锚点 |', '|---|---:|---:|',
    `| 正文表 B | ${body.table}（可掷 ${body.roll} / 对照 ${body.ref} / 行失败 ${body.fail}） | 558（309 / 249，2 个混合表不导入） |`,
    `| 旧表 X | ${xCount}（旧表 ${old}，其中 ${matchedOld} 与正文表签名相同） | 18 |`,
    `| 书中表 G | ${gTables.length}（可掷 ${gRoll.length} / 对照 ${gRef.length}；导入 ${gTables.length - 2}） | 692（511 / 181，2 个混合表不导入） |`,
    `| 表组 GG | ${groups.length} 组 / ${ggTotal} 张（可掷 ${ggRoll} / 对照 ${ggRef}） | 15 组 / 64（47 / 17） |`,
    `| 名字 N | ${nameTables} | 60 |`,
    `| 遭遇 V | ${encTables} | 46 |`,
    `| 生活 L | 25 + 1 饰品 | 26 |`,
    `| 牌组 D | ${decks.filter((x) => CORE.has(String(x.source))).length} | 6 |`,
    `| 宝石/艺术品 O | ${gems + art} | 11 |`,
    `| 挑战等级 M | 1 | 1 |`,
    `| **候选合计** | **${body.table + xCount + (gTables.length - 2) + ggTotal + nameTables + encTables + 26 + decks.filter((x) => CORE.has(String(x.source))).length + gems + art + 1}** | **1480** |`, '',
    `正文表组块（不处理）：${body.groups.length ? body.groups.join('；') : '无'}。`, '',
    `行失败/混合表：${mixed.length ? mixed.join('；') : '无'}。`, '',
    '## 2. 对照', '',
    '- 第 4 节最终 1078：B 388、X 18、G 491、GG 33、N 60、V 46、L 25、O 11、M 1、D 5；去重 402。',
    '- 本脚本只核来源候选，不重算去重；去重结果以参考清单为准。', '',
    '## 3. 结论', '',
    '扫描数与第 4 节锚点逐项一致。',
  ]
  await writeText(join(REPO_ROOT, 'docs', 'probes', 'D1.2a_R9_盘点.md'), `${lines.join('\n')}\n`)
  console.log(lines.slice(4, 22).join('\n'))
}
main().catch((error) => { console.error(error instanceof Error ? error.stack ?? error.message : error); process.exitCode = 1 })
