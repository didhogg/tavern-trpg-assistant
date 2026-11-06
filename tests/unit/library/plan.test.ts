import { describe, expect, it } from 'vitest'
import { adventurePlan, isAdventure, isPrecache, precachePlan } from '../../../src/library/plan'

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
