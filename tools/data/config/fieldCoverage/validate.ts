import type { CoverageEntry } from './types'
import { IMAGE_PATH } from './image'
import { entryDataByType } from '../../../../src/rules/dnd5e2014/data/entries'
import { PLANNED_FIELDS } from '../plannedFields'
import { TAG_TARGET_EXCEPTIONS } from '../tagTargets'
import { outputTypeOf } from '../outputTypes'
import { isTextContainer, isProsePath } from '../textContainers'

const TO = /^(data\.[A-Za-z0-9_$[\]\.]+|entry\.[A-Za-z0-9_$]+|i18n\.en\.[A-Za-z0-9_$[\]\.]+)$/
const WP = /^R(?:[1-9]|1[0-5])$/
const KINDS = new Set(['image', 'audio', 'fonts', 'token', 'layout', '2024-only', 'out-of-scope', 'internal-meta', 'derived'])
const META_SOURCE_TYPES = new Set(['magic-variant', 'monster-template', 'legendary-group', 'legendary-group-template', 'item-entry'])
const PROTECTED = /(?:^|\.)(uses|activities|effects|entries|name|level|damage|save|range|duration|components|prerequisite|requires|recovery|charges)(?:\.|\[|$)/i

function hasOutputField(outputType: string, first: string): boolean {
  if (first === 'system') return false
  const schema = entryDataByType[outputType as keyof typeof entryDataByType]
  const shape = schema && typeof schema === 'object' && 'shape' in schema ? (schema as { shape: Record<string, unknown> }).shape : undefined
  return !!shape?.[first] || !!PLANNED_FIELDS[`${outputType}.${first}`]
}

export function expectedWp(sourceType: string, path: string, to: string): string {
  if (to.startsWith('i18n.en.')) return 'R13'
  if (/^(data\.(supersededBy|versionGroup|playable|nameSuffix)|entry\.nameSuffix)$/.test(to)) return 'R10'
  if (to === 'data.lore') return 'R8'
  if (sourceType === 'book' || sourceType === 'location' || outputTypeOf(sourceType) === 'book') return 'R12'
  if (['table', 'table-group', 'individual', 'hoard', 'gems', 'art-object', 'magic-item', 'dragon', 'dragon-mundane-item', 'encounter', 'cr', 'name', 'deck', 'card', 'life-class', 'life-background', 'life-trinket'].includes(sourceType)) return 'R9'
  if (['language', 'deity', 'reward', 'boon', 'cult', 'hazard', 'trap', 'object', 'vehicle', 'skill', 'sense', 'item-property', 'item-type', 'item-type-additional-entries', 'language-script', 'monster-feature', 'makebrew-creature-trait', 'makebrew-creature-action', 'variant-rule', 'recipe', 'charoption', 'charoption-fluff', 'recipe-fluff', 'language-fluff', 'reward-fluff', 'vehicle-fluff', 'object-fluff', 'trap-fluff', 'hazard-fluff'].includes(sourceType)) return 'R11'
  if (sourceType === 'spell' || sourceType === 'spell-fluff') {
    if (/abilityCheck|conditionImmune/i.test(path)) return 'R7'
    return /(?:tags|scalingLevelDice|damageInflict|conditionInflict|damageResist|damageImmune|damageVulnerable|affectsCreatureType)/i.test(path) ? 'R7' : 'R14'
  }
  if (sourceType === 'action' && path === 'action.fromVariant') return 'R10'
  if (sourceType === 'subclass' && path === 'subclass.subclassTableGroups') return 'R14'
  if (sourceType === 'optional-feature') return 'R2'
  if (sourceType === 'class-feature' || sourceType === 'subclass-feature' || sourceType === 'race-feature') {
    if (/(?:uses|effects|activities|charges)/i.test(path)) return 'R5'
    if ((sourceType === 'class-feature' || sourceType === 'subclass-feature') && path === `${sourceType}.isClassFeatureVariant`) return 'R3'
    return 'R1'
  }
  if (sourceType === 'class' || sourceType === 'subclass') return /advancement|explain|feature/i.test(path) ? 'R1' : 'R1'
  if (['race', 'subrace', 'background', 'feat'].includes(sourceType)) return 'R5'
  if (sourceType === 'item' || sourceType === 'base-item' || sourceType === 'item-group' || sourceType === 'item-entry' || sourceType === 'magic-variant') return 'R6'
  if (sourceType === 'monster' || sourceType === 'monster-template' || sourceType === 'legendary-group' || sourceType === 'legendary-group-template') return 'R7'
  if (['action', 'condition', 'condition-fluff', 'disease', 'status'].includes(sourceType)) return 'R8'
  return 'R14'
}

export function validateCoverageEntry(path: string, entry: CoverageEntry): void {
  if (!['mapped', 'text', 'dropped', 'lost'].includes(entry.how)) throw new Error(`登记方式非法：${path}`)
  if (entry.how === 'lost') {
    if (!entry.why || entry.why.trim().length < 12) throw new Error(`lost 缺少至少 12 字的理由：${path}`)
    if (!Number.isInteger(entry.affected) || (entry.affected ?? -1) < 0) throw new Error(`lost 的 affected 必须是 ≥0 的整数：${path}`)
    if (entry.to || entry.wp || entry.kind) throw new Error(`lost 不得带 to/wp/kind：${path}`)
    return
  }
  const sourceType = path.split('.', 1)[0]
  if (entry.how === 'dropped') {
    if (!entry.kind || !KINDS.has(entry.kind)) throw new Error(`dropped 缺少 kind：${path}`)
    if (!entry.why?.trim()) throw new Error(`dropped 缺少理由：${path}`)
    if (entry.kind === 'image' && !IMAGE_PATH.test(path)) throw new Error(`image 路径不符合规则：${path}`)
    // R15：纯排版（layout）、核心无样本（out-of-scope）与「展开/模板用的元数据类型」不受保护字段规则限制
    const exempt = entry.kind === 'layout' || entry.kind === 'out-of-scope' || META_SOURCE_TYPES.has(path.split('.', 1)[0])
    if (!path.startsWith('book.') && PROTECTED.test(path) && !exempt && !/\.token\.name$/.test(path)) throw new Error(`受保护字段不允许 dropped：${path}`)
    if (/uses.*recovery/i.test(path)) throw new Error(`uses.recovery 不允许 dropped：${path}`)
    return
  }
  if (!entry.to || !TO.test(entry.to)) throw new Error(`to 不是具体输出位置：${path} → ${entry.to ?? '（空）'}`)
  if (/R\d|汇总转换|统一处理|批量|TODO/i.test(entry.to)) throw new Error(`to 仍是批量标签：${path} → ${entry.to}`)
  if (!entry.wp || !WP.test(entry.wp)) throw new Error(`wp 缺失或非法：${path}`)
  if (entry.how === 'mapped' && isTextContainer(entry.to)) throw new Error(`mapped 不能指向自由正文容器：${path} → ${entry.to}`)
  if (entry.how === 'text' && !isProsePath(path)) throw new Error(`text 只能用于散文路径：${path}`)
  if (entry.to.startsWith('data.')) {
    const first = entry.to.slice(5).split(/[.\[]/, 1)[0]
    if (first === 'system') throw new Error(`data.system 一律拒绝：${path}`)
    if (!hasOutputField(outputTypeOf(sourceType), first)) throw new Error(`目标字段不在输出结构：${path} → ${entry.to}`)
  }
  if (entry.to === 'data.tags') {
    const last = path.split('.').pop()?.replace(/\[\]$/, '') ?? ''
    if (!(/tags$/i.test(last) || last === 'environment' || TAG_TARGET_EXCEPTIONS[path])) throw new Error(`data.tags 只用于标签字段：${path}`)
  }
  const want = expectedWp(sourceType, path, entry.to)
  if (entry.wp !== want) throw new Error(`wp 与规则不一致：${path} → ${entry.to}，应为 ${want}，实际 ${entry.wp}`)
}
