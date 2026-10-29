import type { FieldCoverageEntry } from './fieldCoverageTypes'
import { COVERAGE_1 } from './fieldCoverage.1'
import { COVERAGE_2 } from './fieldCoverage.2'
import { COVERAGE_3 } from './fieldCoverage.3'
import { COVERAGE_4 } from './fieldCoverage.4'
import { COVERAGE_5 } from './fieldCoverage.5'
import { COVERAGE_6 } from './fieldCoverage.6'
import { COVERAGE_7 } from './fieldCoverage.7'
import { COVERAGE_8 } from './fieldCoverage.8'
import { COVERAGE_9 } from './fieldCoverage.9'
import { COVERAGE_10 } from './fieldCoverage.10'
import { COVERAGE_11 } from './fieldCoverage.11'
import { COVERAGE_12 } from './fieldCoverage.12'
import { COVERAGE_13 } from './fieldCoverage.13'

export type { FieldCoverageEntry }
export type CoverageEntry = FieldCoverageEntry
export const FIELD_COVERAGE: Record<string, FieldCoverageEntry> = { ...COVERAGE_1, ...COVERAGE_2, ...COVERAGE_3, ...COVERAGE_4, ...COVERAGE_5, ...COVERAGE_6, ...COVERAGE_7, ...COVERAGE_8, ...COVERAGE_9, ...COVERAGE_10, ...COVERAGE_11, ...COVERAGE_12, ...COVERAGE_13 }
export function coverageOf(path: string): FieldCoverageEntry | undefined {
  return FIELD_COVERAGE[path]
}
