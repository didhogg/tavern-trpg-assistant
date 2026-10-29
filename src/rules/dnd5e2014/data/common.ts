import { z } from 'zod'
import { idSchema } from '../../../schemas/common'
import { textBlockSchema } from './blocks'
import { damageTypeSchema, rechargeSchema } from './enums'
import { formulaSchema } from './formula'

/** 条目数据的版本；扩展包的 `dataVersion` 不得超过这个值。 */
export const DND5E2014_DATA_VERSION = 2

export { creditBySchema, creditLicenseSchema, creditSchema, srcSchema, type Credit, type Src } from '../../../schemas/credit'
export { abilityKeySchema, abilityKeySchema as abilityKey, type AbilityKey, damageTypeSchema, rechargeSchema, skillSchema, toolSchema } from './enums'

export const diceSchema = z.string().regex(/^(?:\d+|\d{0,2}d\d{1,3}(?:\s*[+-]\s*\d+)?)$/i, '骰式必须是 1d6、2d8+3 或固定数值')
export type Dice = z.infer<typeof diceSchema>

export const damagePartSchema = z.object({ dice: diceSchema, type: damageTypeSchema })
export type DamagePart = z.infer<typeof damagePartSchema>

export const effectTagSchema = z.string().min(1).max(60)

export const usesSchema = z.object({
  max: z.union([z.number().int().positive(), formulaSchema]),
  recharge: rechargeSchema,
  per: z.string().max(40).optional(),
})
export type Uses = z.infer<typeof usesSchema>

export const activationSchema = z.object({
  type: z.enum(['action', 'bonus', 'reaction', 'minute', 'hour', 'special']),
  cost: z.number().positive().optional(),
})
export type Activation = z.infer<typeof activationSchema>

export const rangeSchema = z.looseObject({
  type: z.string().min(1).max(30),
  amount: z.number().nonnegative().optional(),
  unit: z.string().max(20).optional(),
})

export const targetSchema = z.looseObject({
  area: z
    .looseObject({
      shape: z.string().max(30).optional(),
      size: z.number().nonnegative().optional(),
    })
    .optional(),
})

export const namedTextSchema = z.looseObject({
  name: z.string().min(1).max(200),
  text: z.array(textBlockSchema).default([]),
  activities: z.array(z.any()).optional(),
})

export const sourceRefSchema = z.looseObject({
  packId: idSchema,
  entryId: z.string().min(1),
  version: z.string().optional(),
})
