import { z } from 'zod'
import { idSchema } from '../../../schemas/common'
import { textBlockSchema } from './blocks'

/** 条目数据的版本；扩展包的 `dataVersion` 不得超过这个值。 */
export const DND5E2014_DATA_VERSION = 1


/** 阅读顺序中的原书与页码；页码未知时记 0，并写入构建报告。 */
export const srcSchema = z.object({
  book: z.string().min(1).max(20),
  page: z.number().int().nonnegative(),
})
export type Src = z.infer<typeof srcSchema>

export const creditBySchema = z.enum(['不全书', '共库', '共库机翻', 'dnd-data', '本项目'])
export const creditLicenseSchema = z.enum(['GPL-3.0', 'CC-BY-NC-SA-4.0', 'CC-BY-4.0', 'MIT'])

const LICENSE_BY_CREDIT: Record<z.infer<typeof creditBySchema>, z.infer<typeof creditLicenseSchema>> = {
  不全书: 'GPL-3.0',
  共库: 'CC-BY-NC-SA-4.0',
  共库机翻: 'CC-BY-NC-SA-4.0',
  'dnd-data': 'MIT',
  本项目: 'CC-BY-NC-SA-4.0',
}

export const creditSchema = z
  .object({
    by: creditBySchema,
    license: creditLicenseSchema,
    machine: z.boolean().default(false),
    missing: z.array(z.string()).default([]),
    /** SRD 5.1 署名（CC BY 4.0，Wizards of the Coast）。 */
    srd: z.boolean().default(false),
  })
  .superRefine((value, ctx) => {
    if (LICENSE_BY_CREDIT[value.by] !== value.license) {
      ctx.addIssue({ code: 'custom', path: ['license'], message: `credit.by 为 ${value.by} 时许可必须是 ${LICENSE_BY_CREDIT[value.by]}` })
    }
    if (value.by !== '共库机翻' && value.machine) {
      ctx.addIssue({ code: 'custom', path: ['machine'], message: '只有「共库机翻」可以标记为机翻' })
    }
  })
export type Credit = z.infer<typeof creditSchema>

/** 能力值键。 */
export const abilityKeySchema = z.enum(['str', 'dex', 'con', 'int', 'wis', 'cha'])
export type AbilityKey = z.infer<typeof abilityKeySchema>

export const diceSchema = z.string().regex(/^(?:\d+|\d{0,2}d\d{1,3}(?:\s*[+-]\s*\d+)?)$/i, '骰式必须是 1d6、2d8+3 或固定数值')
export type Dice = z.infer<typeof diceSchema>

export const damagePartSchema = z.object({ dice: diceSchema, type: z.string().min(1).max(30) })
export type DamagePart = z.infer<typeof damagePartSchema>

export const effectTagSchema = z.string().min(1).max(60)

export const usesSchema = z.object({
  max: z.union([z.number().int().positive(), z.string().min(1)]).optional(),
  recharge: z.string().max(80).optional(),
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
