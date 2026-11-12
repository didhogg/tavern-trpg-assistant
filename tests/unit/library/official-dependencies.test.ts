import { describe, expect, it } from 'vitest'
import { officialDependencies } from '../../../src/library/official-dependencies'

describe('官方来源文件依赖', () => {
  it('追实际声明与跨来源复制，回边不会重复读取，职业键不当作来源', async () => {
    const indexPath = 'data/bestiary/index.json'
    const monster = { bySource: true, dir: 'bestiary', indexPath, index: { A: 'a.json', B: 'b.json', C: 'c.json', D: 'd.json', E: 'e.json' } }
    const maps = { monster, class: { bySource: false, dir: 'class', indexPath: 'data/class/index.json', index: { fighter: 'fighter.json' } } }
    const raw: Record<string, unknown> = {
      'data/bestiary/a.json': { _meta: { dependencies: { monster: ['B'], class: ['fighter'] }, includes: { monster: ['C'] } }, monster: [] },
      'data/bestiary/b.json': { _meta: { otherSources: { monster: { D: 'B' } } }, monster: [{ _copy: { source: 'E' } }] },
      'data/bestiary/e.json': { monster: [{ _copy: { source: 'A' } }] },
    }
    const reads: string[] = []
    const result = await officialDependencies(['data/bestiary/a.json'], maps, async (path) => {
      reads.push(path)
      return JSON.stringify(raw[path] ?? {})
    })
    expect(result.files).toEqual(['b', 'c', 'd', 'e'].map((name) => `data/bestiary/${name}.json`))
    expect(result.indexes.get(indexPath)).toEqual(new Set(['A', 'B', 'C', 'D', 'E']))
    expect(new Set(reads).size).toBe(reads.length)
  })
})
