import { z } from 'zod'
import { entryIdSchema } from '../../../../schemas/common'
import { abilityKeySchema, damagePartSchema, diceSchema, usesSchema } from '../common'
import { textBlockSchema } from '../blocks'
import { requiresSchema } from '../requires'
import { advancementSchema } from '../advancement'
import { entryCommonFields } from './base'

const classTableSchema = z.object({
  cols: z.array(z.string()),
  rows: z.array(z.object({ level: z.number().int().min(1).max(20), values: z.array(z.string()) })),
})

const proficienciesSchema = z.looseObject({
  armor: z.array(z.string()).default([]),
  weapons: z.array(z.string()).default([]),
  tools: z.array(z.string()).default([]),
  skills: z.object({ choose: z.number().int().nonnegative(), from: z.array(z.string()) }).optional(),
})

const spellcastingSchema = z.looseObject({
  ability: abilityKeySchema,
  progression: z.enum(['full', 'half', 'third', 'pact']),
  preparation: z.enum(['prepared', 'known']).optional(),
})

const multiclassSchema = z.object({
  requires: requiresSchema,
  proficiencies: proficienciesSchema.optional(),
})

export const classDataSchema = z.looseObject({
  ...entryCommonFields,
  hitDie: z.number().int().min(4).max(12),
  primaryAbility: z.array(abilityKeySchema).min(1),
  saves: z.array(abilityKeySchema).default([]),
  proficiencies: proficienciesSchema,
  startingEquipment: z.array(z.union([z.string(), z.array(z.string())])).default([]),
  spellcasting: spellcastingSchema.optional(),
  table: classTableSchema.optional(),
  subclassLevel: z.number().int().min(1).max(20),
  subclassTitle: z.string().max(40),
  multiclass: multiclassSchema.optional(),
  advancement: z.array(advancementSchema).default([]),
})
export type ClassData = z.infer<typeof classDataSchema>

export const subclassDataSchema = z.looseObject({
  ...entryCommonFields,
  classId: entryIdSchema,
  spellcasting: spellcastingSchema.optional(),
  expandedSpells: z.array(z.object({ level: z.number().int().min(0).max(20), spells: z.array(entryIdSchema) })).optional(),
  advancement: z.array(advancementSchema).default([]),
})
export type SubclassData = z.infer<typeof subclassDataSchema>

export const featureDataSchema = z.looseObject({
  ...entryCommonFields,
  owner: z.object({ type: z.enum(['class', 'subclass', 'race', 'feat', 'background', 'optional']), id: z.string().min(1) }),
  level: z.number().int().min(0).max(20).optional(),
  featureType: z.string().max(60).optional(),
  uses: usesSchema.optional(),
  choices: z.array(z.object({ name: z.string().min(1), count: z.number().int().positive(), pool: z.array(z.string()).default([]) })).optional(),
  optional: z.boolean().optional(),
})
export type FeatureData = z.infer<typeof featureDataSchema>

const abilityBonusSchema = z
  .object({
    fixed: z.record(z.string(), z.number().int()).optional(),
    choose: z.object({ count: z.number().int().positive(), amount: z.number().int().positive(), from: z.array(abilityKeySchema) }).optional(),
  })
  .refine((v) => v.fixed !== undefined || v.choose !== undefined, { message: '属性加值至少要有固定值或自选之一' })

const raceTraitsSchema = z.array(z.union([z.string(), z.object({ name: z.string(), text: z.array(textBlockSchema).default([]) })]))

export const raceDataSchema = z.looseObject({
  ...entryCommonFields,
  parentRace: entryIdSchema.optional(),
  size: z.array(z.enum(['T', 'S', 'M', 'L', 'H', 'G'])).default(['M']),
  speed: z.record(z.string(), z.number()).default({ walk: 30 }),
  abilityBonus: abilityBonusSchema.optional(),
  flexibleAbility: z.object({ count: z.number().int().positive(), amount: z.number().int().positive() }).optional(),
  darkvision: z.number().int().nonnegative().optional(),
  languages: z.array(z.string()).default([]),
  proficiencies: z.array(z.string()).default([]),
  traits: raceTraitsSchema.default([]),
  advancement: z.array(advancementSchema).default([]),
})
export type RaceData = z.infer<typeof raceDataSchema>

export const subraceDataSchema = raceDataSchema.extend({ parentRace: entryIdSchema })
export type SubraceData = z.infer<typeof subraceDataSchema>

export const backgroundDataSchema = z.looseObject({
  ...entryCommonFields,
  proficiencies: z.object({ skills: z.array(z.string()).default([]), tools: z.array(z.string()).default([]), languages: z.array(z.string()).default([]) }),
  equipment: z.array(z.union([z.string(), z.array(z.string())])).default([]),
  feature: z.string().max(120).optional(),
  characteristics: z.array(z.object({ table: z.string().min(1), label: z.string().max(80) })).default([]),
})
export type BackgroundData = z.infer<typeof backgroundDataSchema>

export const featDataSchema = z.looseObject({
  ...entryCommonFields,
  abilityIncrease: z.array(z.object({ ability: abilityKeySchema, amount: z.number().int().positive().optional(), choose: z.number().int().positive().optional() })).optional(),
  advancement: z.array(advancementSchema).default([]),
  prerequisite: z.array(z.string()).optional(),
})
export type FeatData = z.infer<typeof featDataSchema>

export const conditionDataSchema = z.looseObject({
  ...entryCommonFields,
  effects: z.array(z.string()).default([]),
  kind: z.enum(['condition', 'disease', 'status']).optional(),
})
export type ConditionData = z.infer<typeof conditionDataSchema>

export const ruleDataSchema = z.looseObject({
  ...entryCommonFields,
  category: z.enum(['variant', 'action', 'sense', 'skill']).default('variant'),
  implemented: z.boolean().optional(),
  optionId: z.string().max(60).optional(),
  activation: z.object({ type: z.string().max(20), cost: z.number().positive().optional() }).optional(),
  damage: z.array(damagePartSchema).optional(),
  dice: diceSchema.optional(),
})
export type RuleData = z.infer<typeof ruleDataSchema>
