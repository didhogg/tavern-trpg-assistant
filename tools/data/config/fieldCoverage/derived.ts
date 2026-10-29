import type { CoverageEntry } from './types'

/** 5etools 展开元数据：extract 阶段已展开，结果体现在转换后的字段。 */
export const DERIVED_PATH = /(?:^|\.)(?:_copy|_mod|_preserve|_abstract|_trait)(?:\.|\[|$)/i

export function derivedCoverage(path: string): CoverageEntry | undefined {
  if (!DERIVED_PATH.test(path)) return undefined
  return { how: 'dropped', kind: 'derived', why: 'extract 阶段已展开，结果体现在转换后的字段' }
}
