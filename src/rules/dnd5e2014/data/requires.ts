import { z } from 'zod'
import { entryIdSchema } from '../../../schemas/common'
import { abilityKeySchema } from './common'

const abilityMinimum = z
  .record(z.string(), z.number().int().min(1).max(30))
  .refine((value) => Object.keys(value).every((key) => (abilityKeySchema.options as readonly string[]).includes(key)), '能力值键必须是 str/dex/con/int/wis/cha')

/** 单项限制。未知写法用 `{ text }` 原样保留，只显示不判定。 */
export const requirementSchema = z
  .looseObject({
    ability: abilityMinimum.optional(),
    level: z.number().int().min(1).max(20).optional(),
    race: z.array(entryIdSchema).optional(),
    class: z.array(entryIdSchema).optional(),
    proficiency: z
      .looseObject({
        armor: z.string().max(30).optional(),
        weapon: z.string().max(30).optional(),
        tool: z.string().max(40).optional(),
      })
      .optional(),
    spellcasting: z.literal(true).optional(),
    spell: z.array(entryIdSchema).optional(),
    pact: z.enum(['blade', 'chain', 'tome', 'talisman']).optional(),
    patron: z.array(entryIdSchema).optional(),
    feature: entryIdSchema.optional(),
    /** 状态条件（效果的 when 用）：当前合法取值 rage（狂暴中）。 */
    status: z.enum(['rage']).optional(),
    /** 护甲条件：none = 没穿护甲（可以持盾）。 */
    armor: z.enum(['none']).optional(),
    /** 盾牌条件：none = 没持盾。 */
    shield: z.enum(['none']).optional(),
    text: z.string().min(1).max(400).optional(),
  })
  .refine(
    (value) =>
      value.ability !== undefined ||
      value.level !== undefined ||
      value.race !== undefined ||
      value.class !== undefined ||
      value.proficiency !== undefined ||
      value.spellcasting !== undefined ||
      value.spell !== undefined ||
      value.pact !== undefined ||
      value.patron !== undefined ||
      value.feature !== undefined ||
      value.status !== undefined ||
      value.armor !== undefined ||
      value.shield !== undefined ||
      value.text !== undefined,
    '限制至少要有一个条件',
  )
export type Requirement = z.infer<typeof requirementSchema>

export const requiresSchema = z
  .looseObject({
    all: z.array(requirementSchema).optional(),
    any: z.array(requirementSchema).optional(),
  })
  .refine((value) => (value.all?.length ?? 0) + (value.any?.length ?? 0) > 0, 'requires 至少要有一个条件')
export type Requires = z.infer<typeof requiresSchema>
