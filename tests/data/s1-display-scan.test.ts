import { describe, expect, it } from 'vitest'
import { allEntries } from './r9-pack-helpers'
import { entryFacts, type Fact } from '../../src/ui/library/facts'
import { parseInline } from '../../src/ui/library/inline'
import { humanizeTokens } from '../../src/ui/library/tokens'

type Rec = Record<string, unknown>
const TYPES = 'feature|spell|item|monster|class|subclass|race|subrace|background|feat|rule|table|condition|disease|status|deity|language|reward|cult|hazard|object|vehicle|book|lore|monsterpart'
const RAW_ID = new RegExp(`\\b(?:${TYPES})\\.[a-z0-9][a-z0-9-]*\\.[a-z0-9]+(?:-\\d+)?\\b`)
const isObj = (v: unknown): v is Rec => !!v && typeof v === 'object' && !Array.isArray(v)

/**
 * S1 全库扫描（数据层）：按「界面显示的每段文字都经过 parseInline」的约定，把每个条目详情页要显示的文字过一遍。
 * 找：①残留的标记（{{ }}、<$ $>）；②裸编号；③指向不存在条目的引用；④没有显示名、目标又不在已装包里的结构化引用。
 */
describe('S1 详情页文字扫描（数据层）', () => {
  const entries = allEntries()
  const ids = new Set(entries.map((e) => e.id))
  const problems: string[] = []
  const add = (id: string, where: string, text: string): void => { problems.push(`${id} ${where}: ${text.slice(0, 80)}`) }

  const checkText = (id: string, where: string, raw: unknown): void => {
    if (typeof raw !== 'string') return
    let shown = ''
    for (const seg of parseInline(raw)) {
      shown += seg.text
      if (seg.kind === 'ref' && !ids.has(seg.id)) add(id, `${where}（引用目标不存在）`, seg.id)
    }
    shown = humanizeTokens(shown)
    if (/\{\{|\}\}|<\$|\$>/.test(shown)) add(id, `${where}（残留标记）`, shown)
    else if (RAW_ID.test(shown)) add(id, `${where}（裸编号）`, shown)
  }
  const walkBlocks = (id: string, where: string, blocks: unknown): void => {
    if (!Array.isArray(blocks)) return
    blocks.forEach((b, i) => {
      if (!isObj(b)) return
      const w = `${where}[${i}]`
      for (const key of ['p', 'h', 'quote', 'by']) checkText(id, `${w}.${key}`, b[key])
      if (Array.isArray(b.list)) b.list.forEach((x, j) => checkText(id, `${w}.list[${j}]`, x))
      if (isObj(b.table)) {
        checkText(id, `${w}.table.caption`, b.table.caption)
        for (const c of (b.table.cols as unknown[]) ?? []) checkText(id, `${w}.table.cols`, c)
        for (const row of (b.table.rows as unknown[][]) ?? []) for (const cell of row) checkText(id, `${w}.table.cell`, cell)
      }
      if (isObj(b.tableRef)) checkText(id, `${w}.tableRef.label`, b.tableRef.label)
      for (const key of ['body', 'items']) if (Array.isArray(b[key])) walkBlocks(id, `${w}.${key}`, b[key])
    })
  }
  const walkFacts = (id: string, facts: Fact[]): void => {
    for (const f of facts) {
      for (const p of f.parts ?? []) {
        if (typeof p === 'string') checkText(id, `事实「${f.label}」`, p)
        else if (!ids.has(p.ref) && !p.label) add(id, `事实「${f.label}」（引用目标不在包里、也没有显示名）`, p.ref)
        else if (p.label) checkText(id, `事实「${f.label}」显示名`, p.label)
      }
      for (const row of f.table?.rows ?? []) for (const cell of row) checkText(id, `事实「${f.label}」表格`, cell)
      for (const s of f.sections ?? []) walkBlocks(id, `事实「${f.label}」分节「${s.name}」`, s.text)
    }
  }

  for (const e of entries) {
    checkText(e.id, '名称', e.name)
    checkText(e.id, '摘要', e.summary)
    walkBlocks(e.id, '正文', (e.data as Rec).text)
    walkFacts(e.id, entryFacts(e))
  }

  it('全库没有残留标记、裸编号、悬空引用', () => {
    expect(problems.length, problems.slice(0, 20).join('\n')).toBe(0)
  }, 120_000)
})
