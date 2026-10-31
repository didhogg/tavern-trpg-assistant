import { z } from 'zod'
import { textBlockSchema } from '../blocks'
import { entryCommonFields } from './base'

export const monsterPartDataSchema = z.strictObject({
  ...entryCommonFields,
  partKind: z.enum(['action', 'trait', 'feature']),
  example: z.string().optional(),
  effect: z.string().optional(),
  hasNumberParam: z.boolean().optional(),
  dpr: z.string().optional(),
  ac: z.string().optional(),
  hp: z.string().optional(),
  attackBonus: z.string().optional(),
})

const recipeLine = z.strictObject({
  text: z.string(),
  template: z.string().optional(),
  amounts: z.array(z.number()).max(5).optional(),
})

const recipeGroup = z.strictObject({ group: z.string(), items: z.array(recipeLine) })

export const recipeDataSchema = z.strictObject({
  ...entryCommonFields,
  recipeType: z.string().max(60).optional(),
  diet: z.enum(['C', 'V', 'X']),
  dishTypes: z.array(z.string()).default([]),
  allergenGroups: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  alias: z.array(z.string()).optional(),
  makes: z.union([z.string(), z.number()]).optional(),
  serves: z.strictObject({ exact: z.number().optional(), min: z.number().optional(), max: z.number().optional(), note: z.string().optional() }).optional(),
  ingredients: z.array(z.union([recipeLine, recipeGroup])).default([]),
  equipment: z.array(recipeLine).default([]),
  instructions: z.array(textBlockSchema).default([]),
})

export const charOptionDataSchema = z.strictObject({
  ...entryCommonFields,
  optionType: z.array(z.string()).min(1),
})

export type MonsterPartData = z.infer<typeof monsterPartDataSchema>
export type RecipeData = z.infer<typeof recipeDataSchema>
export type CharOptionData = z.infer<typeof charOptionDataSchema>
