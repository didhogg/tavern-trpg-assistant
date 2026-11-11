import { describe, expect, it } from 'vitest'
import { adventurePlan, isAdventure, isPrecache, officialPlan, precachePlan, type PlanOwner } from '../../../src/library/plan'

// 规则来自作者 node/build-sw.mjs："data/*.json"、"data/**/!(adventure)/*.json"、"search/*.json"；按需 "data/adventure/**/*.json"
describe('作者离线规则', () => {
  it('预载：data 根下、data 子目录（上级不叫 adventure）、search 根下的 json', () => {
    expect(isPrecache('data/books.json')).toBe(true)
    expect(isPrecache('data/spells/spells-xphb.json')).toBe(true)
    expect(isPrecache('data/generated/gendata-tables.json')).toBe(true)
    expect(isPrecache('search/index.json')).toBe(true)
  })

  it('不预载：冒险正文、非 json、data 以外、search 子目录、data-bak', () => {
    expect(isPrecache('data/adventure/adventure-lmop.json')).toBe(false)
    expect(isPrecache('data/spells/readme.md')).toBe(false)
    expect(isPrecache('js/utils.json')).toBe(false)
    expect(isPrecache('search/x/index.json')).toBe(false)
    expect(isPrecache('data-bak/books.json')).toBe(false)
  })

  it('冒险按需：data/adventure/ 下的 json', () => {
    expect(isAdventure('data/adventure/adventure-lmop.json')).toBe(true)
    expect(isAdventure('data/book/book-phb.json')).toBe(false)
  })

  it('计划只按规则分组，大小来自清单', () => {
    const list = {
      'data/books.json': { sha: 'a', size: 10 },
      'data/adventure/adventure-lmop.json': { sha: 'b', size: 100 },
      'search/index.json': { sha: 'c', size: 5 },
      'js/utils.js': { sha: 'd', size: 1 },
    }
    expect(precachePlan(list)).toEqual({ files: ['data/books.json', 'search/index.json'], bytes: 15 })
    expect(adventurePlan(list, 'adventure-lmop.json')).toEqual({ files: ['data/adventure/adventure-lmop.json'], bytes: 100 })
  })
})

describe('按书计划（P5 T2）', () => {
  const list = {
    'data/books.json': { sha: 'a', size: 10 },
    'data/book/book-phb.json': { sha: 'b', size: 100 },
    'data/spells/spells-phb.json': { sha: 'c', size: 20 },
    'data/spells/spells-xphb.json': { sha: 'd', size: 30 },
    'data/class/class-wizard.json': { sha: 'e', size: 40 },
    'data/items.json': { sha: 'f', size: 50 },
    'search/index.json': { sha: 'g', size: 5 },
    'data/adventure/adventure-lmop.json': { sha: 'h', size: 200 },
  }
  const owners: Record<string, PlanOwner> = {
    'data/book/book-phb.json': { kind: 'book', id: 'PHB', source: 'PHB' },
    'data/spells/spells-phb.json': { kind: 'source', sources: ['PHB'] },
    'data/spells/spells-xphb.json': { kind: 'source', sources: ['XPHB'] },
    'data/class/class-wizard.json': { kind: 'class' },
    'data/adventure/adventure-lmop.json': { kind: 'adventure', id: 'LMoP', source: 'LMoP' },
  }
  it('只下选中的来源 / 书正文 + 共用 + 职业文件；冒险按需；索引按选中来源过滤', () => {
    const plan = officialPlan(list, owners, { sources: ['PHB'], books: ['PHB'] }, { indexSources: { 'data/spells/index.json': ['PHB', 'XPHB'] } })
    expect(plan.files.sort()).toEqual(['data/book/book-phb.json', 'data/books.json', 'data/class/class-wizard.json', 'data/items.json', 'data/spells/spells-phb.json', 'search/index.json'])
    expect(plan.byBook).toMatchObject({ files: ['data/book/book-phb.json'], bytes: 100 })
    expect(plan.bySource).toMatchObject({ files: ['data/spells/spells-phb.json'], bytes: 20 })
    expect(plan.byClass).toMatchObject({ bytes: 40 })
    expect(plan.shared).toMatchObject({ bytes: 65 })
    expect(plan.sourceIndexes).toEqual({ 'data/spells/index.json': ['PHB'] })
    expect(plan.byAdventure.files).toEqual([])
    expect(plan.missing).toEqual({ sources: [], books: [] })
  })
  it('选了但作者目录里没有：列进 missing，不假装已装', () => {
    const plan = officialPlan(list, owners, { sources: ['NOPE'], books: ['NOPE'] })
    expect(plan.missing).toEqual({ sources: ['NOPE'], books: ['NOPE'] })
    expect(plan.bySource.files).toEqual([])
    expect(plan.byBook.files).toEqual([])
  })
  it('已装冒险正文按需加进计划；全装时不筛来源', () => {
    const plan = officialPlan(list, owners, { adventures: ['LMoP'] })
    expect(plan.byAdventure.files).toEqual(['data/adventure/adventure-lmop.json'])
    expect(plan.files).toContain('data/spells/spells-xphb.json')
  })
})
