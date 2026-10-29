import type { CoverageEntry } from './types'
import { IMAGE_PATH } from './image'

const TO = /^(data\.[A-Za-z0-9_$[\]\.]+|entry\.[A-Za-z0-9_$]+|i18n\.en\.[A-Za-z0-9_$[\]\.]+)$/
const WP = /^R(?:[1-9]|1[0-5])$/
const KINDS = new Set(['image', 'audio', 'layout', '2024-only', 'internal-meta', 'derived'])
const PROTECTED = /(?:^|\.)(uses|activities|effects|entries|name|level|damage|save|range|duration|components|prerequisite|requires|recovery|charges)(?:\.|\[|$)/i

export function validateCoverageEntry(path: string, entry: CoverageEntry): void {
  if (!['mapped', 'text', 'dropped'].includes(entry.how)) throw new Error(`登记方式非法：${path}`)
  if (entry.how === 'dropped') {
    if (!entry.kind || !KINDS.has(entry.kind)) throw new Error(`dropped 缺少 kind：${path}`)
    if (!entry.why?.trim()) throw new Error(`dropped 缺少理由：${path}`)
    if (entry.kind === 'image' && !IMAGE_PATH.test(path)) throw new Error(`image 路径不符合规则：${path}`)
    if (PROTECTED.test(path)) throw new Error(`受保护字段不允许 dropped：${path}`)
    if (/uses.*recovery/i.test(path)) throw new Error(`uses.recovery 不允许 dropped：${path}`)
    return
  }
  if (!entry.to || !TO.test(entry.to)) throw new Error(`to 不是具体输出位置：${path} → ${entry.to ?? '（空）'}`)
  if (/R\d|汇总转换|统一处理|批量|TODO/i.test(entry.to)) throw new Error(`to 仍是批量标签：${path} → ${entry.to}`)
  if (!entry.wp || !WP.test(entry.wp)) throw new Error(`wp 缺失或非法：${path}`)
}
