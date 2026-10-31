import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Raw } from '../extract/load'
import { DATA_5ETOOLS } from '../extract/load'
import { BOOK_SOURCES } from '../config/books'
import type { PlanResult, PlannedEntry } from './plan'
import { nestedOfRows } from './r9Nested'
import { cellText, isObj, normRaw, parseLabel, rangeOf, refCell, refRows, slug, str, zero } from './r9lib'
import type { R9Candidate, R9Row } from './r9Types'

const CORE = new Set([...BOOK_SOURCES])
const BODY_TYPES = new Set(['spell', 'monster', 'item', 'class', 'subclass', 'feature', 'race', 'subrace', 'background', 'feat', 'condition', 'rule', 'lore', 'object', 'hazard', 'vehicle'])
// R11 新增类型里的表多是对书本章节表的转抄：与书本表重复时让书本表当幸存者，保住它们已有的编号
const RACE_PARENT: Record<string, string> = { 龙裔: 'dragonborn', 矮人: 'dwarf', 精灵: 'elf', 侏儒: 'gnome', 半兽人: 'half-orc', 半身人: 'halfling', 人类: 'human', 提夫林: 'tiefling' }

function json(file: string): Raw {
  return JSON.parse(readFileSync(join(DATA_5ETOOLS, file), 'utf8')) as Raw
}

function tableSeedOf(table: PlannedEntry): { source: string; id: string; name: string; page: number; srd: boolean; seed: Raw } {
  return { source: table.source, id: table.id, name: table.name, page: table.page, srd: table.srd, seed: table.raw.__seed as Raw }
}

function oldSeeds(plan: PlanResult): Map<string, { id: string; name: string; source: string; page: number; srd: boolean; seed: Raw }> {
  const out = new Map<string, { id: string; name: string; source: string; page: number; srd: boolean; seed: Raw }>()
  for (const table of plan.tables) {
    const t = tableSeedOf(table)
    const seed = t.seed
    const rows = Array.isArray(seed.rows) ? seed.rows as Raw[] : []
    const sig = JSON.stringify([t.source, str(seed.parentKey) || t.id, rows.map((r) => [r.min, r.max, r.cells])])
    out.set(sig, t)
  }
  return out
}

function plainLead(cell: string): string {
  return cell.replace(/\{@\w+ ([^}|]*)[^}]*\}/g, '$1').trim()
}

function bodyCandidate(entry: PlannedEntry, block: Raw, where: 'entries' | '_lore', blockIndex: number, oldBySig: Map<string, { id: string; name: string; source: string; page: number; srd: boolean; seed: Raw }>, weak = false): R9Candidate | undefined {
  const labels = Array.isArray(block.colLabels) ? block.colLabels.map(refCell) : []
  const caption = typeof block.caption === 'string' ? block.caption : undefined
  const label = labels[0] ?? ''
  const parsed = parseLabel(block.colLabels && Array.isArray(block.colLabels) ? block.colLabels[0] : undefined)
  const rowsRaw = Array.isArray(block.rows) ? block.rows as unknown[] : []
  if (!parsed) {
    const rows = refRows(rowsRaw)
    // 没有列头的单列小块（如“属性值摘要”六块并排）靠第一格文字区分名字
    const lead = !labels.length && rows.length > 1 && rows.every((r) => r.cells.length === 1) ? plainLead(rows[0].cells[0]) : ''
    // 没有标题的多列块（如“交涉·DC”冷漠/敌对两张）：R11 类型里靠末列列头区分，避免被同名的另一张误合并
    const tail = weak && !caption && labels.length > 1 && labels[labels.length - 1] !== labels[0] ? labels[labels.length - 1] : ''
    const name = normRaw(caption ?? label) === normRaw(entry.name) ? entry.name : `${entry.name}·${caption ?? labels[0] ?? '对照表'}${lead ? `·${lead}` : ''}${tail ? `·${tail}` : ''}`
    return { origin: 'B', source: entry.source, page: entry.page, srd: entry.raw.srd === true, name, nameEn: `${entry.nameEn} ${caption ?? labels[0] ?? 'table'}`, cap: normRaw(caption ?? (tail || label)), kind: 'ref', ref: true, cols: labels.length ? labels : Array.from({ length: Math.max(1, ...rows.map((r) => r.cells.length)) }, (_, k) => `第${k + 1}列`), rows, parentId: entry.id, block, where, blockIndex, extra: { footnotes: Array.isArray(block.footnotes) ? block.footnotes.map(str) : undefined, parentKey: `${entry.source}|${entry.name}` } }
  }
  const rows: R9Row[] = []
  for (const r of rowsRaw) {
    if (!Array.isArray(r)) return undefined
    const rg = rangeOf(r[0], parsed.hi)
    if (!rg) return undefined
    rows.push({ ...rg, cells: r.slice(1).map(cellText) })
  }
  if (!rows.length) return undefined
  const sig = JSON.stringify([entry.source, `${entry.source}|${entry.name}`, rows.map((r) => [r.min, r.max, r.cells])])
  const old = oldBySig.get(sig)
  const fallback = labels.slice(1)[0] ?? '随机表'
  const name = old?.name ?? (normRaw(caption ?? '') === normRaw(entry.name) ? entry.name : `${entry.name}·${caption ?? fallback}`)
  return { origin: 'B', source: entry.source, page: entry.page, srd: entry.raw.srd === true, name, nameEn: `${entry.nameEn} ${caption ?? labels[0] ?? 'table'}`, cap: normRaw(caption ?? label), kind: parsed.deck ? 'deck' : 'roll', deck: parsed.deck, expr: parsed.expr, modifierPrompt: parsed.modifierPrompt, cols: labels.slice(1), rows, parentId: entry.id, oldId: old?.id, block, where, blockIndex, extra: { footnotes: Array.isArray(block.footnotes) ? block.footnotes.map(str) : undefined, parentKey: `${entry.source}|${entry.name}` } }
}

// 与 monster.ts 查传奇组的方式保持一致：先按名称+来源，再按名称/英文名
export function findLegendaryGroup(raw: Raw, groups: Raw[]): Raw | undefined {
  const ref = raw.legendaryGroup as Raw | undefined
  if (!isObj(ref)) return undefined
  return groups.find((g) => String(g.name) === String(ref.name) && String(g.source) === String(ref.source)) ?? groups.find((g) => String(g.name) === String(ref.name) || String(g.ENG_name) === String(ref.ENG_name))
}

export function buildCandidates(plan: PlanResult, legendaryGroups: Raw[] = [], r11Ids: ReadonlySet<string> = new Set()): R9Candidate[] {
  const pool: R9Candidate[] = []
  const old = oldSeeds(plan)
  const seenGroups = new Set<Raw>()
  for (const entry of plan.entries) {
    if (!BODY_TYPES.has(entry.type)) continue
    let blockIndex = 0
    const walk = (value: unknown, where: R9Candidate['where'], host?: unknown): void => {
      if (Array.isArray(value)) { for (const item of value) walk(item, where, host); return }
      if (!isObj(value)) return
      if (value.type === 'table') {
        const candidate = bodyCandidate(entry, value, where as 'entries' | '_lore', blockIndex++, old, r11Ids.has(entry.id))
        if (candidate) { candidate.where = where; if (r11Ids.has(entry.id)) candidate.weak = true; if (host !== undefined) candidate.host = host; pool.push(candidate) }
      }
      for (const [key, child] of Object.entries(value)) { if (key === 'rows' || key === 'colLabels') continue; walk(child, where, host) }
    }
    walk(entry.raw.entries, 'entries')
    walk(entry.raw._lore, '_lore')
    if (entry.raw._variants !== undefined) walk(entry.raw._variants, 'variants', entry.raw._variants)
    const group = entry.type === 'monster' ? findLegendaryGroup(entry.raw, legendaryGroups) : undefined
    if (group && !seenGroups.has(group)) {
      seenGroups.add(group)
      walk(group.lairActions, 'legendaryGroup', group)
      walk(group.regionalEffects, 'legendaryGroup', group)
    }
  }
  const bodyOldIds = new Set(pool.map((c) => c.oldId).filter((x): x is string => !!x))
  for (const table of plan.tables) {
    if (bodyOldIds.has(table.id)) continue
    const t = tableSeedOf(table)
    const seed = t.seed
    const dice = str(seed.dice)
    const name = table.name
    const cap = normRaw(name.includes('·') ? name.slice(name.lastIndexOf('·') + 1) : name)
    pool.push({ origin: 'X', source: t.source, page: t.page, srd: t.srd, name, cap, expr: `1${dice}`, kind: seed.group ? 'loot' : 'roll', cols: Array.isArray(seed.cols) ? seed.cols.map(str) : [], rows: (Array.isArray(seed.rows) ? seed.rows as Raw[] : []).map((r) => ({ min: Number(r.min), max: Number(r.max), cells: Array.isArray(r.cells) ? r.cells.map(str) : [] })), oldId: table.id, extra: { group: isObj(seed.group) ? { id: str(seed.group.id), name: ({ 'loot-individual': '宝藏表·个人宝藏', 'loot-hoard': '宝藏表·宝藏堆', 'loot-magicItems': '宝藏表·魔法物品表' } as Record<string, string>)[str(seed.group.id)] ?? str(seed.group.name) } : undefined, parentKey: str(seed.parentKey), caption: str(seed.caption) || undefined } })
  }
  const g = json('generated/gendata-tables.json')
  const gCount = new Map<string, number>()
  const gRefCount = new Map<string, number>()
  const addG = (t: Raw, heading: string, grp?: Raw): void => {
    const src = str(t.source ?? grp?.source)
    if (!CORE.has(src)) return
    const parsed = parseLabel(Array.isArray(t.colLabels) ? t.colLabels[0] : undefined)
    if (!parsed) return
    const rows: R9Row[] = []
    for (const r of Array.isArray(t.rows) ? t.rows : []) { if (!Array.isArray(r)) return; const rg = rangeOf(r[0], parsed.hi); if (!rg) return; rows.push({ ...rg, cells: r.slice(1).map(cellText) }) }
    const page = typeof t.page === 'number' ? t.page : typeof grp?.page === 'number' ? grp.page : undefined
    const key = `${src}|${page ?? 0}`
    const n = (gCount.get(key) ?? 0) + 1
    gCount.set(key, n)
    const tail = heading.split('; ').pop() ?? heading
    pool.push({ origin: grp ? 'GG' : 'G', source: src, page, srd: (t.srd ?? grp?.srd) === true, name: heading, cap: normRaw(typeof t.caption === 'string' ? t.caption : tail), expr: parsed.expr, modifierPrompt: parsed.modifierPrompt, deck: parsed.deck, kind: parsed.deck ? 'deck' : 'roll', cols: Array.isArray(t.colLabels) ? t.colLabels.slice(1).map(cellText) : [], rows, chapter: isObj(t.chapter) ? str(t.chapter.name) : isObj(grp?.chapter) ? str(grp.chapter.name) : undefined, parentHint: isObj(t.parentEntity) ? t.parentEntity as never : isObj(grp?.parentEntity) ? grp.parentEntity as never : undefined, extra: { gid: `table.${src.toLowerCase()}-p${page ?? 0}-${n}`, footnotes: Array.isArray(t.footnotes) ? t.footnotes.map(str) : undefined, reprintedAs: t.reprintedAs, ...(nestedOfRows(t.rows, parsed.hi).length ? { nested: nestedOfRows(t.rows, parsed.hi) } : {}), lastCol: Array.isArray(t.colLabels) && t.colLabels.length ? refCell(t.colLabels[t.colLabels.length - 1]) : '' } })
  }
  for (const t of Array.isArray(g.table) ? g.table as Raw[] : []) addG(t, str(t.name).replace(/; /g, '·'))
  for (const grp of Array.isArray(g.tableGroup) ? g.tableGroup as Raw[] : []) for (const t of Array.isArray(grp.tables) ? grp.tables as Raw[] : []) addG({ ...t, source: grp.source }, `${str(grp.name).replace(/; /g, '·')}${typeof t.caption === 'string' && !str(grp.name).endsWith(t.caption) ? `·${t.caption}` : ''}`, grp)
  const addGRef = (t: Raw, heading: string, grp?: Raw): void => {
    const src = str(t.source ?? grp?.source)
    if (!CORE.has(src)) return
    const page = typeof t.page === 'number' ? t.page : typeof grp?.page === 'number' ? grp.page : undefined
    const key = `${src}|${page ?? 0}`
    const n = (gRefCount.get(key) ?? 0) + 1
    gRefCount.set(key, n)
    const tail = heading.split('·').pop() ?? heading
    const cols = Array.isArray(t.colLabels) ? t.colLabels.map(refCell) : []
    const rows = refRows(t.rows)
    const width = Math.max(...rows.map((r) => r.cells.length))
    while (cols.length < width) cols.push(`第${cols.length + 1}列`)
    pool.push({ origin: grp ? 'GG' : 'G', source: src, page, srd: (t.srd ?? grp?.srd) === true, name: heading, cap: normRaw(typeof t.caption === 'string' ? t.caption : tail), kind: 'ref', ref: true, cols, rows, chapter: isObj(t.chapter) ? str(t.chapter.name) : isObj(grp?.chapter) ? str(grp.chapter.name) : undefined, parentHint: isObj(t.parentEntity) ? t.parentEntity as never : isObj(grp?.parentEntity) ? grp.parentEntity as never : undefined, extra: { gid: `table.${src.toLowerCase()}-p${page ?? 0}-r${n}`, footnotes: Array.isArray(t.footnotes) ? t.footnotes.map(str) : undefined } })
  }
  for (const t of Array.isArray(g.table) ? g.table as Raw[] : []) if (CORE.has(str(t.source)) && !parseLabel(Array.isArray(t.colLabels) ? t.colLabels[0] : undefined)) addGRef(t, str(t.name).replace(/; /g, '·'))
  for (const grp of Array.isArray(g.tableGroup) ? g.tableGroup as Raw[] : []) {
    if (!CORE.has(str(grp.source))) continue
    const gname = str(grp.name).replace(/; /g, '·')
    const members = (Array.isArray(grp.tables) ? grp.tables as Raw[] : []).filter((t) => !parseLabel(Array.isArray(t.colLabels) ? t.colLabels[0] : undefined))
    const used = new Set<string>()
    members.forEach((t, k) => {
      let nm = gname
      if (typeof t.caption === 'string') nm = gname.endsWith(t.caption) ? gname : `${gname}·${t.caption}`
      else {
        const cands = [refCell(Array.isArray(t.colLabels) ? t.colLabels[0] ?? '' : ''), refCell(Array.isArray(t.colLabels) ? t.colLabels[t.colLabels.length - 1] ?? '' : ''), `第${k + 1}张`].filter(Boolean)
        for (const c of cands) { const trial = `${gname}·${c}`; if (!used.has(trial) && trial !== gname) { nm = trial; break } }
      }
      used.add(nm)
      addGRef({ ...t, source: grp.source }, nm, grp)
    })
  }
  const names = json('names.json')
  for (const rec of Array.isArray(names.name) ? names.name as Raw[] : []) {
    if (!CORE.has(str(rec.source))) continue
    const tables = Array.isArray(rec.tables) ? rec.tables as Raw[] : []
    tables.forEach((t, i) => {
      const parsed = parseLabel(t.diceExpression)
      if (!parsed) return
      const list = Array.isArray(t.table) ? t.table as Raw[] : []
      pool.push({ origin: 'N', source: str(rec.source), page: Number(rec.page) || 0, name: `${str(rec.name)}名字·${str(t.option)}`, nameEn: str(rec.ENG_name), srd: false, cap: normRaw(`${str(rec.name)}${str(t.option)}`), expr: parsed.expr, kind: 'names', cols: ['名字'], rows: list.map((r) => ({ min: zero(Number(r.min), str(t.diceExpression)), max: zero(Number(r.max), str(t.diceExpression)), cells: [str(r.result)] })), parentHint: { race: str(rec.name), raceEn: RACE_PARENT[str(rec.name)] }, extra: { gid: `table.names-${slug(str(rec.ENG_name))}-${i + 1}.${str(rec.source).toLowerCase()}` } })
    })
  }
  const encounters = json('encounters.json')
  for (const rec of Array.isArray(encounters.encounter) ? encounters.encounter as Raw[] : []) {
    if (!CORE.has(str(rec.source))) continue
    for (const t of Array.isArray(rec.tables) ? rec.tables as Raw[] : []) {
      const parsed = parseLabel(t.diceExpression)
      if (!parsed) continue
      const band = typeof t.minlvl === 'number' ? `（等级 ${t.minlvl}—${t.maxlvl}）` : ''
      const list = Array.isArray(t.table) ? t.table as Raw[] : []
      pool.push({ origin: 'V', source: str(rec.source), page: Number(rec.page) || 0, name: `${str(rec.name)}遭遇${band}`, srd: false, cap: normRaw(`${str(rec.name)}${band}`), expr: parsed.expr, kind: 'encounter', cols: ['遭遇'], rows: list.map((r) => ({ min: zero(Number(r.min), str(t.diceExpression)), max: zero(Number(r.max), str(t.diceExpression)), cells: [str(r.result)] })), extra: { gid: `table.encounter-${slug(str(rec.ENG_name))}${typeof t.minlvl === 'number' ? `-${t.minlvl}-${t.maxlvl}` : ''}.${str(rec.source).toLowerCase()}` } })
    }
  }
  const life = json('life.json')
  for (const c of Array.isArray(life.lifeClass) ? life.lifeClass as Raw[] : []) {
    const reasons = Array.isArray(c.reasons) ? c.reasons.map(str) : []
    pool.push({ origin: 'L', source: 'XGE', srd: false, name: `${str(c.name)}·成为${str(c.name)}的原因`, cap: normRaw(str(c.name)), expr: `1d${reasons.length}`, kind: 'life', cols: ['原因'], rows: reasons.map((s, i) => ({ min: i + 1, max: i + 1, cells: [s] })), parentHint: { cls: str(c.name), clsEn: str(c.ENG_name) }, extra: { gid: `table.life-class-${slug(str(c.ENG_name))}-reasons.xge` } })
  }
  for (const b of Array.isArray(life.lifeBackground) ? life.lifeBackground as Raw[] : []) {
    const reasons = Array.isArray(b.reasons) ? b.reasons.map(str) : []
    pool.push({ origin: 'L', source: 'XGE', srd: false, name: `${str(b.name)}·成为${str(b.name)}的原因`, cap: normRaw(str(b.name).replace(/[（(][^）)]*[）)]$/, '')), expr: `1d${reasons.length}`, kind: 'life', cols: ['原因'], rows: reasons.map((s, i) => ({ min: i + 1, max: i + 1, cells: [s] })), parentHint: { bg: str(b.name), bgEn: str(b.ENG_name) }, extra: { gid: `table.life-background-${slug(str(b.ENG_name))}-reasons.xge` } })
  }
  const trinkets = Array.isArray(life.lifeTrinket) ? life.lifeTrinket.map(str) : []
  pool.push({ origin: 'L', source: 'PHB', page: 160, srd: false, name: '饰品', cap: normRaw('饰品'), expr: '1d100', kind: 'roll', cols: ['饰品'], rows: trinkets.map((s, i) => ({ min: i + 1, max: i + 1, cells: [s] })), extra: { gid: 'table.trinkets.phb' } })
  const loot = json('loot.json')
  for (const [key, label] of [['gems', '宝石'], ['artObjects', '艺术品']] as const) for (const r of Array.isArray(loot[key]) ? loot[key] as Raw[] : []) {
    if (!CORE.has(str(r.source))) continue
    const table = Array.isArray(r.table) ? r.table.map(str) : []
    pool.push({ origin: 'O', source: str(r.source), page: Number(r.page) || 0, srd: r.srd === true, name: str(r.name), cap: normRaw(str(r.name)), expr: `1d${table.length}`, kind: 'loot', cols: [label], rows: table.map((s, i) => ({ min: i + 1, max: i + 1, cells: [s] })), extra: { gid: `table.${slug(str(r.ENG_name))}.${str(r.source).toLowerCase()}` } })
  }
  const cr = Array.isArray(json('msbcr.json').cr) ? json('msbcr.json').cr as Raw[] : []
  pool.push({ origin: 'M', source: 'DMG', page: 274, srd: false, name: '按挑战等级的怪物数值', cap: normRaw('按挑战等级的怪物数值'), kind: 'ref', ref: true, cols: ['挑战等级', '熟练加值', '护甲等级', '生命值', '攻击加值', '伤害（每轮）', '豁免DC'], rows: cr.map((r) => ({ cells: [str(r._cr), `+${r.pb}`, str(r.ac), `${r.hpMin}—${r.hpMax}`, `+${r.attackBonus}`, `${r.dprMin}—${r.dprMax}`, str(r.saveDc)] })), extra: { gid: 'table.monster-statistics-by-challenge-rating.dmg', crRaw: cr } })
  const decks = json('decks.json')
  const cardsBy = new Map<string, Raw>()
  for (const c of Array.isArray(decks.card) ? decks.card as Raw[] : []) {
    cardsBy.set(`${str(c.name)}|${str(c.set)}`, c)
    for (const a of Array.isArray(c.alias) ? c.alias.map(str) : []) cardsBy.set(`${a}|${str(c.set)}`, c)
  }
  const uidOf = (u: unknown): string => typeof u === 'string' ? u : isObj(u) ? str(u.uid) : ''
  for (const d of Array.isArray(decks.deck) ? decks.deck as Raw[] : []) {
    if (!CORE.has(str(d.source))) continue
    const cards = (Array.isArray(d.cards) ? d.cards : []).map(uidOf)
    pool.push({ origin: 'D', source: str(d.source), page: Number(d.page) || 0, srd: d.srd === true, name: `${str(d.name)}·牌组内容`, nameEn: str(d.ENG_name), cap: normRaw(str(d.name)), expr: `1d${cards.length}`, kind: 'deck', cols: ['牌', '效果'], rows: cards.map((u, i) => { const key = u.split('|').slice(0, 2).join('|'); const card = cardsBy.get(key); const entries = card && Array.isArray(card.entries) ? card.entries.map((x) => typeof x === 'string' ? x : JSON.stringify(x)).join(' ') : ''; return { min: i + 1, max: i + 1, cells: [u.split('|')[0], entries] } }), parentHint: { deckName: str(d.name) }, extra: { gid: `table.cards-${slug(str(d.ENG_name))}${d._copy ? '-13' : ''}.${str(d.source).toLowerCase()}`, reprintedAs: d.reprintedAs } })
  }
  return pool
}
