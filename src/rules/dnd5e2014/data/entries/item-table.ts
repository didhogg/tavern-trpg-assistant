import { z } from 'zod'
import { damagePartSchema, usesSchema, diceSchema } from '../common'
import { entryCommonFields } from './base'
import { effectListSchema } from '../effects'

export const ITEM_CATEGORIES = ['weapon', 'armor', 'shield', 'gear', 'tool', 'consumable', 'wondrous', 'ammunition', 'mount', 'vehicle', 'treasure'] as const

const weaponSchema = z.looseObject({
  category: z.enum(['simple', 'martial']).optional(),
  damage: z.array(damagePartSchema).default([]),
  versatile: z.string().max(40).optional(),
  properties: z.array(z.string().max(40)).default([]),
  range: z.object({ normal: z.number().int().positive(), long: z.number().int().positive().optional() }).optional(),
})

const armorSchema = z.looseObject({
  category: z.enum(['light', 'medium', 'heavy', 'shield']),
  ac: z.number().int().positive(),
  dexCap: z.number().int().nonnegative().optional(),
  strReq: z.number().int().positive().optional(),
  stealthDisadvantage: z.boolean().default(false),
})

const chargesSchema = z.object({
  max: z.number().int().positive(),
  recharge: z.string().max(80).optional(),
  rechargeAmount: z.string().max(40).optional(),
})

const bonusesSchema = z.object({
  ac: z.string().max(20).optional(),
  attack: z.string().max(20).optional(),
  damage: z.string().max(20).optional(),
  save: z.string().max(20).optional(),
  spellAttack: z.string().max(20).optional(),
  spellDc: z.string().max(20).optional(),
})

export const itemDataSchema = z.looseObject({
  ...entryCommonFields,
  category: z.enum(ITEM_CATEGORIES),
  baseItem: z.string().max(80).optional(),
  rarity: z.enum(['none', 'common', 'uncommon', 'rare', 'very rare', 'legendary', 'artifact', 'varies']).default('none'),
  attunement: z.object({ required: z.boolean(), by: z.string().max(160).optional() }).default({ required: false }),
  weight: z.number().nonnegative().optional(),
  value: z.number().int().nonnegative().optional(),
  weapon: weaponSchema.optional(),
  armor: armorSchema.optional(),
  charges: chargesSchema.optional(),
  bonuses: bonusesSchema.optional(),
  effects: effectListSchema.optional(),
  consumable: z.boolean().optional(),
  properties: z.array(z.string().max(40)).default([]),
  lootTables: z.array(z.string().max(80)).default([]),
})
export type ItemData = z.infer<typeof itemDataSchema>

export const tableRowSchema = z.looseObject({
  min: z.number().int().nonnegative(),
  max: z.number().int().nonnegative(),
  cells: z.array(z.string()).default([]),
  refs: z.array(z.string()).default([]),
  then: z.object({ table: z.string().min(1), times: z.number().int().positive().optional() }).optional(),
  qty: z.string().max(40).optional(),
})
export type TableRow = z.infer<typeof tableRowSchema>

export const tableDataSchema = z.looseObject({
  ...entryCommonFields,
  dice: diceSchema,
  cols: z.array(z.string()).min(1),
  rows: z.array(tableRowSchema).min(1),
  group: z.object({ id: z.string().min(1), name: z.string().min(1) }).optional(),
  caption: z.string().max(200).optional(),
})
export type TableData = z.infer<typeof tableDataSchema>

export const chargesUsesSchema = usesSchema
