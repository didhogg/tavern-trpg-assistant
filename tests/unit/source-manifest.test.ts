import { describe, expect, it } from 'vitest'
import { scanJson } from '../../tools/db/source/scanJson'
import { editionFromDate, editionFromHomebrew, pairCoverage } from '../../tools/db/source/catalog'

describe('T3 源清单扫描', () => {
  it('把 _meta 来源、内容记录和结构记录分开；单来源文件可回填 source', () => {
    const scan = scanJson({
      _meta: { sources: [{ json: 'BrewA', full: 'Brew A', edition: 'classic' }], edition: 'classic' },
      spell: [
        { name: '测试法术', entries: ['...'] },
        { name: '有来源', source: 'PHB', entries: ['...'] },
      ],
      _test: [{ name: '测试夹具' }],
    }, 'zh')
    expect(scan.metaSources.map((s) => s.id)).toEqual(['BrewA'])
    expect(scan.contentRecords).toBe(2)
    expect(scan.metaRecords).toBe(2)
    expect(scan.records[0]).toMatchObject({ category: 'spell', source: 'BrewA', shape: 'named', edition: 'classic' })
    expect(scan.records[1]).toMatchObject({ category: 'spell', source: 'PHB', shape: 'named' })
  })

  it('_copy、容器、data 段、缩写记录不当作“缺名字”', () => {
    const scan = scanJson({
      _meta: { sources: [{ json: 'BrewB' }] },
      subclass: [{ source: 'BrewB', _copy: { name: '复制来的' } }],
      bookData: [{ id: 'B1', source: 'BrewB', data: [{ name: '章节' }] }],
      data: [{ name: '一章', entries: ['...'] }],
      itemProperty: [{ source: 'BrewB', abbreviation: '2H' }],
    }, 'en')
    expect(scan.records.map((r) => r.shape)).toEqual(['copy', 'container', 'section', 'abbreviation'])
    expect(scan.missingSourceRecords).toBe(0)
    expect(scan.missingNameRecords).toBe(0)
  })

  it('具名但没有 source 的记录只计数，不猜来源', () => {
    const scan = scanJson({ magicvariant: [{ name: '+1 武器' }] }, 'zh')
    expect(scan.records[0]).toMatchObject({ source: null, shape: 'named' })
    expect(scan.missingSourceRecords).toBe(1)
  })
})

describe('T3 版本与配对', () => {
  it('官方来源按出版日期分 2014/2024，缺日期不猜', () => {
    expect(editionFromDate('2014-08-19')).toBe('2014')
    expect(editionFromDate('2024-09-17')).toBe('2024')
    expect(editionFromDate('2024-09-16')).toBe('2014')
    expect(editionFromDate(null)).toBe('unknown')
  })

  it('自制来源按上游 edition 值分 2014/2024，未知值不猜', () => {
    expect(editionFromHomebrew('classic')).toBe('2014')
    expect(editionFromHomebrew('one')).toBe('2024')
    expect(editionFromHomebrew('future')).toBe('unknown')
  })

  it('按来源 ID 算中英覆盖，不按文件名', () => {
    const c = pairCoverage('en', new Set(['A', 'B', 'C']), 'zh', new Set(['B', 'C', 'D']))
    expect(c).toMatchObject({ primaryIds: 3, secondaryIds: 3, paired: 2 })
    expect(c.onlyPrimary).toEqual(['A'])
    expect(c.onlySecondary).toEqual(['D'])
  })
})
