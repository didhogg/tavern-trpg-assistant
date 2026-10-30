import { describe, expect, it } from 'vitest'
import type { Entry } from '../../src/schemas/pack'
import { FIELD_COVERAGE } from '../../tools/data/config/fieldCoverage'
import { validateCoverageEntry } from '../../tools/data/config/fieldCoverage/validate'
import { sourceTypeOf } from '../../tools/data/config/sourceTypes'
import { scanSourceRecords } from '../../tools/data/report/fieldPaths'
import { checkDelivered } from '../../tools/data/validate/delivered'

const entry = (data: Record<string, unknown>): Entry => ({ id: 'feature.test.phb', type: 'feature', name: 'Test', nameEn: 'Test', summary: '', keywords: [], unique: false, data } as unknown as Entry)

describe('R0 返工验收', () => {
  it('拒绝批量标签和错误 wp', () => {
    expect(() => validateCoverageEntry('feat.entries', { how: 'mapped', to: 'R14: 汇总转换', wp: 'R5' })).toThrow()
    expect(() => validateCoverageEntry('feat.entries', { how: 'text', to: 'data.text' })).toThrow()
  })

  it('拒绝把 uses.recovery 标成 dropped', () => {
    expect(() => validateCoverageEntry('feat.uses.recovery[].period', { how: 'dropped', kind: 'internal-meta', why: 'x' })).toThrow()
    expect(() => validateCoverageEntry('item.activities[].uses.recovery', { how: 'dropped', kind: 'internal-meta', why: 'x' })).toThrow()
  })

  it('RW9 拒绝 data.system，RW10 拒绝错位 i18n wp', () => {
    expect(() => validateCoverageEntry('feat.system.uses.max', { how: 'mapped', to: 'data.system.uses.max', wp: 'R5' })).toThrow()
    expect(() => validateCoverageEntry('feat.ENG_name', { how: 'mapped', to: 'i18n.en.name', wp: 'R8' })).toThrow()
  })

  it('扫描到无来源记录和 inherits.source', async () => {
    const scan = await scanSourceRecords()
    const count = (file: string, key: string): number => scan.records.filter((x) => x.file === file && x.key === key).length
    expect(count('life.json', 'lifeTrinket')).toBe(100)
    expect(count('msbcr.json', 'cr')).toBe(34)
    expect(count('monsterfeatures.json', 'monsterfeatures')).toBe(25)
    expect(count('loot.json', 'dragonMundaneItems')).toBe(25)
    const mv = scan.records.filter((x) => x.type === 'magic-variant')
    expect(mv.length).toBeGreaterThan(100)
    expect(mv.some((x) => x.sourceKind === 'inherits')).toBe(true)
    expect(mv.every((x) => x.sourceKind === 'inherits' || x.sourceKind === 'source')).toBe(true)
    expect(scan.totalRecords).toBe(scan.coreRecords + scan.d1b2Records + scan.skippedRecords)
  })

  it('未映射的来源键使扫描失败', () => {
    expect(() => sourceTypeOf('clas')).toThrow()
    expect(sourceTypeOf('class')).toBe('class')
  })

  it('兑现检查能发现目标字段被改名', () => {
    const coverage = { 'feat.entries': { how: 'mapped' as const, to: 'data.text', wp: 'R5' } }
    const entries = [entry({ text: [{ p: '正文' }] })]
    expect(checkDelivered(entries, coverage, ['R5'], {})).toEqual([])
    const broken = { 'feat.entries': { how: 'mapped' as const, to: 'data.renamed', wp: 'R5' } }
    expect(checkDelivered(entries, broken, ['R5'], {})).toContain('feat.entries')
  })

  it('登记表里没有批量标签，且 uses.recovery 已映射', () => {
    for (const value of Object.values(FIELD_COVERAGE)) {
      if (value.how !== 'dropped' && value.how !== 'lost') expect(value.to).not.toMatch(/汇总转换|统一处理|R\d/)
    }
    const recovery = Object.entries(FIELD_COVERAGE).filter(([p]) => p.includes('uses.recovery') && !p.startsWith('item.activities'))
    expect(recovery.length).toBeGreaterThan(0)
    expect(recovery.every(([, v]) => v.how === 'mapped')).toBe(true)
  })
})
