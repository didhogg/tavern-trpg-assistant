import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { FIELD_COVERAGE } from '../../tools/data/config/fieldCoverage'

interface Row { path: string; bucket: string; action: string; to?: string; kind?: string; why?: string }
const file = JSON.parse(readFileSync(join(process.cwd(), 'docs/probes/D1.2a_R15_lost分诊.json'), 'utf8')) as Row[]

describe('R15 lost 分诊', () => {
  it('分诊文件 481 条，且每条都落进了覆盖矩阵', () => {
    expect(file).toHaveLength(481)
    for (const row of file) expect(FIELD_COVERAGE[row.path], row.path).toBeDefined()
  })

  it('supply 的目标与矩阵登记一致；drop 的理由各不相同且带路径；没有待复核项', () => {
    const reasons = new Set<string>()
    for (const row of file) {
      const entry = FIELD_COVERAGE[row.path] as { how: string; to?: string; kind?: string; why?: string }
      expect(row.bucket).not.toContain('REVIEW')
      if (row.action === 'supply') { expect(entry.how === 'mapped' || entry.how === 'text', row.path).toBe(true); expect(entry.to).toBe(row.to) }
      if (row.action === 'mapped-i18n') expect(entry.to).toBe('i18n.en.name')
      if (row.action === 'drop') {
        expect(entry.how).toBe('dropped')
        expect(entry.why?.includes(row.path.replace(/^[^.]+\./, '')) || entry.why?.startsWith(`「${row.path}」`), row.path).toBe(true)
        expect(reasons.has(entry.why!), row.path).toBe(false)
        reasons.add(entry.why!)
      }
    }
  })

  it('各桶的数量（独立计数）', () => {
    const count = (bucket: string): number => file.filter((r) => r.bucket === bucket).length
    expect({ N0: count('N0 核心无样本'), EN: count('EN 英文名'), TP: count('TP 模板'), TG: count('TG 分类标签') }).toEqual({ N0: 60, EN: 45, TP: 30, TG: 33 })
    expect(file.filter((r) => r.bucket.startsWith('FM')).length + file.filter((r) => r.bucket.startsWith('ST')).length).toBe(481 - 60 - 45 - 30 - 33)
  })
})
