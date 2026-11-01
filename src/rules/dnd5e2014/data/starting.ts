import { z } from 'zod'
import { entryIdSchema, idSchema } from '../../../schemas/common'
import { diceSchema } from './common'

export const startingItemSchema = z.object({
  item: z.string().min(1),
  /** 物品条目 id；对不上物品库的（书上本来是描述性文字的物品）不写。 */
  id: entryIdSchema.optional(),
  qty: z.number().int().positive().default(1),
})

export const startingCategorySchema = z.object({
  category: z.string().min(1),
  label: z.string().max(120).optional(),
  qty: z.number().int().positive().optional(),
})

export const startingChoiceSchema = z.object({
  choice: z.array(z.array(z.union([startingItemSchema, startingCategorySchema]))).min(1),
})

export const startingGoldSchema = z.object({
  dice: diceSchema,
  multiplier: z.number().int().positive().default(1),
})

export const startingEquipmentSchema = z.array(
  z.object({
    fixed: z.array(startingItemSchema).optional(),
    choice: z.array(z.array(z.union([startingItemSchema, startingCategorySchema]))).optional(),
    gold: startingGoldSchema.optional(),
  }),
)
export type StartingEquipment = z.infer<typeof startingEquipmentSchema>

export const itemIdOrName = z.union([z.string().min(1), z.object({ $ref: z.literal('pack'), packId: idSchema, entryId: z.string().min(1) })])
