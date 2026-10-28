import { z } from 'zod'
import { activationSchema, rangeSchema, targetSchema, usesSchema, damagePartSchema, abilityKeySchema, effectTagSchema } from './common'

const activityBase = {
  id: z.string().min(1).max(120),
  name: z.string().min(1).max(200),
  activation: activationSchema,
  range: rangeSchema.optional(),
  target: targetSchema.optional(),
  uses: usesSchema.optional(),
}

const attackActivity = z.looseObject({
  ...activityBase,
  kind: z.literal('attack'),
  attackKind: z.enum(['mw', 'rw', 'ms', 'rs']),
  bonus: z.number().int().optional(),
  ability: abilityKeySchema.optional(),
  damage: z.array(damagePartSchema).default([]),
})

const saveActivity = z.looseObject({
  ...activityBase,
  kind: z.literal('save'),
  ability: abilityKeySchema,
  dc: z.union([z.number().int().positive(), z.literal('spell')]),
  onSave: z.union([z.enum(['half', 'none']), z.string().min(1).max(200)]),
  damage: z.array(damagePartSchema).optional(),
  condition: z.string().max(60).optional(),
})

const damageActivity = z.looseObject({
  ...activityBase,
  kind: z.literal('damage'),
  parts: z.array(damagePartSchema),
})

const healActivity = z.looseObject({ ...activityBase, kind: z.literal('heal'), formula: z.string().min(1).max(80) })

const checkActivity = z.looseObject({
  ...activityBase,
  kind: z.literal('check'),
  ability: abilityKeySchema,
  skill: z.string().max(40).optional(),
  dc: z.number().int().positive().optional(),
})

const castActivity = z.looseObject({
  ...activityBase,
  kind: z.literal('cast'),
  spell: z.string().min(1),
  level: z.number().int().min(0).max(9).optional(),
})

const utilityActivity = z.looseObject({ ...activityBase, kind: z.literal('utility'), text: z.string().min(1) })

export const activitySchema = z.discriminatedUnion('kind', [
  attackActivity,
  saveActivity,
  damageActivity,
  healActivity,
  checkActivity,
  castActivity,
  utilityActivity,
])
export type Activity = z.infer<typeof activitySchema>

/** 供 R1 使用的简单效果标签（如 attack-disadvantage）。 */
export const effectsSchema = z.array(effectTagSchema).default([])
