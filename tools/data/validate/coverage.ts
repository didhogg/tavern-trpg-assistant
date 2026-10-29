import { FIELD_COVERAGE } from '../config/fieldCoverage'
import { collectPaths, scanSourceRecords } from '../report/fieldPaths'

export interface CoverageSummary {
  paths: number
  mapped: number
  text: number
  dropped: number
  unregistered: string[]
}

export async function checkFieldCoverage(): Promise<CoverageSummary> {
  const paths = collectPaths(await scanSourceRecords())
  const unregistered = [...paths.keys()].filter((path) => !FIELD_COVERAGE[path]).sort()
  const values = Object.values(FIELD_COVERAGE)
  return {
    paths: paths.size,
    mapped: values.filter((v) => v.how === 'mapped').length,
    text: values.filter((v) => v.how === 'text').length,
    dropped: values.filter((v) => v.how === 'dropped').length,
    unregistered,
  }
}

export async function assertFieldCoverage(): Promise<void> {
  const summary = await checkFieldCoverage()
  if (summary.unregistered.length) throw new Error(`字段覆盖矩阵缺少 ${summary.unregistered.length} 个路径：\n${summary.unregistered.slice(0, 20).join('\n')}`)
}
