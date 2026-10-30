import { FIELD_COVERAGE, coverageOf } from '../config/fieldCoverage'
import type { CoverageEntry } from '../config/fieldCoverage'
import { validateCoverageEntry } from '../config/fieldCoverage/validate'
import { collectPaths, scanSourceRecords } from '../report/fieldPaths'

export interface CoverageSummary {
  paths: number
  mapped: number
  text: number
  dropped: number
  lost: number
  lostAffected: number
  imageHits: number
  droppedByKind: Record<string, number>
  byType: Record<string, { mapped: number; text: number; dropped: number; lost: number }>
  unregistered: string[]
}

export function validateRegistry(): void {
  for (const [path, entry] of Object.entries(FIELD_COVERAGE)) validateCoverageEntry(path, entry)
}

export async function checkFieldCoverage(): Promise<CoverageSummary> {
  validateRegistry()
  const scan = await scanSourceRecords()
  const paths = collectPaths(scan.records)
  const counts = { mapped: 0, text: 0, dropped: 0, lost: 0, lostAffected: 0, imageHits: 0 }
  const droppedByKind: Record<string, number> = {}
  const byType: Record<string, { mapped: number; text: number; dropped: number; lost: number }> = {}
  const unregistered: string[] = []
  for (const path of paths.keys()) {
    const entry: CoverageEntry | undefined = coverageOf(path)
    if (!entry) { unregistered.push(path); continue }
    const type = path.split('.', 1)[0]
    const bucket = byType[type] ?? { mapped: 0, text: 0, dropped: 0, lost: 0 }
    byType[type] = bucket
    if (entry.how === 'lost') {
      bucket.lost += 1
      counts.lost += 1
      counts.lostAffected += entry.affected ?? 0
    } else if (entry.how === 'dropped') {
      bucket.dropped += 1
      counts.dropped += 1
      const kind = entry.kind ?? 'unknown'
      droppedByKind[kind] = (droppedByKind[kind] ?? 0) + 1
      if (kind === 'image' || kind === 'audio') counts.imageHits += 1
    } else {
      counts[entry.how] += 1
      bucket[entry.how] += 1
    }
  }
  return { paths: paths.size, ...counts, droppedByKind, byType, unregistered: unregistered.sort() }
}

export async function assertFieldCoverage(): Promise<void> {
  const summary = await checkFieldCoverage()
  if (summary.unregistered.length) throw new Error(`字段覆盖矩阵缺少 ${summary.unregistered.length} 个路径：\n${summary.unregistered.slice(0, 20).join('\n')}`)
  if (summary.paths !== summary.mapped + summary.text + summary.dropped + summary.lost) throw new Error('字段路径总数与登记数不一致')
  console.log(`矩阵：${summary.paths} 路径，mapped ${summary.mapped}，text ${summary.text}，dropped ${summary.dropped}，lost ${summary.lost} 条路径，涉及 ${summary.lostAffected} 条记录次`)
}
