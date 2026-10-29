import { z } from 'zod'
import { entryIdSchema } from '../../../schemas/common'

const itemGrant = z.looseObject({
  kind: z.literal('itemGrant'),
  level: z.number().int().min(1).max(20),
  items: z.array(entryIdSchema),
  optional: z.union([z.boolean(), z.string().max(30)]).default(false),
  replaces: z.string().max(200).optional(),
})

const itemChoice = z.looseObject({
  kind: z.literal('itemChoice'),
  level: z.number().int().min(1).max(20),
  count: z.number().int().positive(),
  pool: z.array(entryIdSchema).optional(),
  featureType: z.string().max(60).optional(),
  optionKind: z.array(z.string().max(20)).optional(),
})

const scaleValue = z.looseObject({
  kind: z.literal('scaleValue'),
  id: z.string().min(1).max(80),
  type: z.enum(['number', 'dice', 'distance', 'text']),
  scale: z.record(z.string().regex(/^\d+$/), z.union([z.number(), z.string()])),
  label: z.string().max(80).optional(),
})

const traitAdvancement = z.looseObject({
  kind: z.literal('trait'),
  level: z.number().int().min(1).max(20),
  grants: z.array(z.string().max(80)).default([]),
  choices: z.array(z.looseObject({ count: z.number().int().positive(), pool: z.array(z.string()) })).default([]),
})

const abilityScoreImprovement = z.looseObject({
  kind: z.literal('abilityScoreImprovement'),
  level: z.number().int().min(1).max(20),
  points: z.number().int().nonnegative(),
  fixed: z.record(z.string(), z.number().int()).optional(),
  max: z.number().int().positive().optional(),
})

const subclassAdvancement = z.looseObject({ kind: z.literal('subclass'), level: z.number().int().min(1).max(20) })

const sizeAdvancement = z.looseObject({ kind: z.literal('size'), sizes: z.array(z.string().max(30)) })

const expertiseAdvancement = z.looseObject({
  kind: z.literal('expertise'),
  level: z.number().int().min(1).max(20),
  count: z.number().int().positive(),
  from: z.union([z.literal('proficient'), z.array(z.string().min(1))]),
})

export const advancementSchema = z.discriminatedUnion('kind', [
  itemGrant,
  itemChoice,
  scaleValue,
  traitAdvancement,
  abilityScoreImprovement,
  subclassAdvancement,
  sizeAdvancement,
  expertiseAdvancement,
])
export type Advancement = z.infer<typeof advancementSchema>

/** 骰子成长（如偷袭 1d6 → 10d6），保留成可直接用于摘要的写法。 */
export const scaleDiceSchema = z.object({ label: z.string().max(80).optional(), scaling: z.record(z.string(), z.string()) })
