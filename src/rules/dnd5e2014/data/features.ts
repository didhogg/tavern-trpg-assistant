import { z } from 'zod'
import { idSchema } from '../../../schemas/common'

/** 本版本认识的功能种类；其余种类原样保留并标记「需要更新扩展」。 */
export const KNOWN_FEATURE_KINDS = ['entries', 'variants', 'adventures', 'table', 'ruleOptions', 'aiNotes'] as const
export const RESERVED_FEATURE_KINDS = ['charGen', 'activities', 'trackers'] as const

export const featureKindSchema = z.string().min(1).max(40)

export const ruleOptionDataSchema = z.looseObject({
  id: idSchema,
  name: z.string().min(1).max(80),
  summary: z.string().max(200).default(''),
  text: z.string().default(''),
  implemented: z.boolean().default(false),
  source: z.string().max(20).optional(),
})
export type RuleOptionData = z.infer<typeof ruleOptionDataSchema>

export const aiNoteDataSchema = z.looseObject({
  text: z.string().min(1),
  appliesTo: z.array(z.string()).default([]),
  tone: z.string().max(80).optional(),
})
export type AiNoteData = z.infer<typeof aiNoteDataSchema>

export const featureSchema = z.looseObject({
  id: z.string().min(1).max(160),
  kind: featureKindSchema,
  name: z.string().min(1).max(120),
  description: z.string().max(2000).default(''),
  defaultEnabled: z.boolean().default(false),
  stateVersion: z.number().int().positive().optional(),
  data: z.record(z.string(), z.unknown()).default({}),
})
export type PackFeature = z.infer<typeof featureSchema>

/** 本版本能否运行这个功能。 */
export function featureSupport(kind: string): 'supported' | 'reserved' | 'unknown' {
  if ((KNOWN_FEATURE_KINDS as readonly string[]).includes(kind)) return 'supported'
  if ((RESERVED_FEATURE_KINDS as readonly string[]).includes(kind)) return 'reserved'
  return 'unknown'
}

export const ruleOptionsFileSchema = z.array(ruleOptionDataSchema)
export const aiNotesFileSchema = z.array(aiNoteDataSchema)
