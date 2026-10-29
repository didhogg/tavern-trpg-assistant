import { z } from 'zod'
import { entryIdSchema } from '../../../../schemas/common'
import { abilityKeySchema, damagePartSchema, diceSchema, usesSchema } from '../common'
import { textBlockSchema } from '../blocks'
import { requiresSchema } from '../requires'
import { advancementSchema } from '../advancement'
import { effectListSchema, legacyEffectListSchema, spellGrantSchema } from '../effects'
import { startingEquipmentSchema } from '../starting'
import { abilityKeySchema as abilityEnum, languageSchema } from '../enums'
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

const slotRowSchema = z.union([
  z.object({ level: z.number().int().min(1).max(20), slots: z.array(z.number().int().nonnegative()).length(9) }),
  z.object({ level: z.number().int().min(1).max(20), pact: z.object({ count: z.number().int().nonnegative(), level: z.number().int().min(0).max(9) }) }),
])

const spellcastingSchema = z.looseObject({
  ability: abilityKeySchema,
  progression: z.enum(['full', 'half', 'third', 'pact']),
  preparation: z
    .union([
      z.enum(['prepared', 'known']),
      z.object({
        mode: z.enum(['prepared', 'known', 'spellbook']),
        formula: z.object({ ability: abilityEnum, level: z.enum(['full', 'half', 'none']), min: z.number().int().nonnegative() }).optional(),
      }),
    ])
    .optional(),
  cantripsKnown: z.array(z.number().int().nonnegative()).length(20).optional(),
  spellsKnown: z.array(z.number().int().nonnegative()).length(20).optional(),
  slotsByLevel: z.array(slotRowSchema).length(20).optional(),
  ritual: z.enum(['book', 'known', 'prepared', 'none']).optional(),
  spellbook: z.object({ start: z.number().int().nonnegative(), perLevel: z.number().int().nonnegative() }).optional(),
  focus: z.string().max(120).optional(),
  invocationsKnown: z.array(z.number().int().nonnegative()).length(20).optional(),
  infusionsKnown: z.array(z.number().int().nonnegative()).length(20).optional(),
  infusionsActive: z.array(z.number().int().nonnegative()).length(20).optional(),
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
  startingEquipment: z.union([z.array(z.string()), startingEquipmentSchema]).default([]),
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
  effects: effectListSchema.optional(),
  spellGrants: z.array(spellGrantSchema).optional(),
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

const languageListSchema = z.union([
  z.array(z.string()),
  z.object({ fixed: z.array(languageSchema).default([]), choose: z.number().int().nonnegative().optional() }),
])
const proficiencyGroupSchema = z.union([
  z.array(z.string()),
  z.object({
    fixed: z.array(z.string()).default([]),
    choose: z.object({ count: z.number().int().positive(), from: z.array(z.string()).optional() }).optional(),
  }),
])
const raceProficiencySchema = z.union([
  z.array(z.string()),
  z.object({
    skills: proficiencyGroupSchema.default([]),
    tools: proficiencyGroupSchema.default([]),
    weapons: proficiencyGroupSchema.default([]),
    armor: proficiencyGroupSchema.default([]),
  }),
])

export const raceDataSchema = z.looseObject({
  ...entryCommonFields,
  parentRace: entryIdSchema.optional(),
  size: z.array(z.enum(['T', 'S', 'M', 'L', 'H', 'G'])).default(['M']),
  speed: z.record(z.string(), z.number()).default({ walk: 30 }),
  abilityBonus: abilityBonusSchema.optional(),
  flexibleAbility: z
    .union([
      z.object({ count: z.number().int().positive(), amount: z.number().int().positive() }),
      z.object({
        modes: z.array(z.object({ count: z.number().int().positive(), amount: z.number().int().positive() })).min(1),
        alternative: z.object({ count: z.number().int().positive(), amount: z.number().int().positive() }).optional(),
      }),
    ])
    .optional(),
  darkvision: z.number().int().nonnegative().optional(),
  senses: z.array(z.object({ type: z.enum(['darkvision', 'blindsight', 'tremorsense', 'truesight']), range: z.number().int().nonnegative() })).optional(),
  languages: languageListSchema.default([]),
  proficiencies: raceProficiencySchema.default([]),
  resist: z.array(z.string()).optional(),
  immune: z.array(z.string()).optional(),
  conditionImmune: z.array(z.string()).optional(),
  spellGrants: z.array(spellGrantSchema).optional(),
  effects: effectListSchema.optional(),
  traits: raceTraitsSchema.default([]),
  advancement: z.array(advancementSchema).default([]),
})
export type RaceData = z.infer<typeof raceDataSchema>

export const subraceDataSchema = raceDataSchema.extend({ parentRace: entryIdSchema })
export type SubraceData = z.infer<typeof subraceDataSchema>

const backgroundProficiencySchema = proficiencyGroupSchema

export const backgroundDataSchema = z.looseObject({
  ...entryCommonFields,
  proficiencies: z.object({
    skills: backgroundProficiencySchema.default([]),
    tools: backgroundProficiencySchema.default([]),
    languages: backgroundProficiencySchema.default([]),
  }),
  equipment: z.union([z.array(z.string()), startingEquipmentSchema]).default([]),
  gold: z.object({ dice: diceSchema, multiplier: z.number().int().positive().default(1) }).optional(),
  feature: z.string().max(120).optional(),
  characteristics: z.array(z.object({ table: z.string().min(1), label: z.string().max(80) })).default([]),
})
export type BackgroundData = z.infer<typeof backgroundDataSchema>

export const featDataSchema = z.looseObject({
  ...entryCommonFields,
  abilityIncrease: z.array(
    z.object({
      ability: abilityKeySchema.optional(),
      amount: z.number().int().positive().optional(),
      choose: z.number().int().positive().optional(),
      from: z.array(abilityKeySchema).optional(),
    }).refine((v) => v.ability !== undefined || v.choose !== undefined, { message: 'abilityIncrease 必须有 ability 或 choose' }),
  ).optional(),
  advancement: z.array(advancementSchema).default([]),
  prerequisite: z.array(z.string()).optional(),
  effects: effectListSchema.optional(),
  spellGrants: z.array(spellGrantSchema).optional(),
  uses: usesSchema.optional(),
})
export type FeatData = z.infer<typeof featDataSchema>

export const conditionDataSchema = z.looseObject({
  ...entryCommonFields,
  effects: legacyEffectListSchema,
  kind: z.enum(['condition', 'disease', 'status']).optional(),
  exhaustion: z.array(z.object({ level: z.number().int().min(1).max(6), effects: effectListSchema })).length(6).optional(),
})
export type ConditionData = z.infer<typeof conditionDataSchema>

export const ruleDataSchema = z.looseObject({
  ...entryCommonFields,
  category: z.enum(['variant', 'action', 'sense', 'skill']).default('variant'),
  engine: z.string().max(60).optional(),
  group: z.string().max(40).optional(),
  optionId: z.string().max(60).optional(),
  activation: z.object({ type: z.string().max(20), cost: z.number().positive().optional() }).optional(),
  damage: z.array(damagePartSchema).optional(),
  dice: diceSchema.optional(),
})
export type RuleData = z.infer<typeof ruleDataSchema>
