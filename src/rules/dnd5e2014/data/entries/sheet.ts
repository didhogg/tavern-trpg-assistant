import { z } from 'zod'
import { abilityKeySchema, armorCategorySchema, skillSchema } from '../enums'

/**
 * 人物卡概览带与 UNIT3 共用的人物属性块扩展字段（U5 基本规格 §5.1）。
 * 全部可选：旧人物与怪物不需要任何转换。
 */
export const proficiencySourceSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('manual') }),
  z.object({ kind: z.literal('auto'), from: z.string().min(1).max(200) }),
  z.object({ kind: z.literal('template') }),
])
export type ProficiencySource = z.infer<typeof proficiencySourceSchema>

const sources = z.array(proficiencySourceSchema).default([])
const abilityRecord = z.record(abilityKeySchema, z.number().int())
const passiveKeySchema = z.enum(['perception', 'investigation', 'insight'])
const speedKeySchema = z.enum(['walk', 'fly', 'swim', 'climb', 'burrow'])

export const proficienciesSchema = z.object({
  skills: z.array(z.object({ skill: skillSchema, level: z.enum(['half', 'proficient', 'expertise']), sources })).optional(),
  saves: z.array(z.object({ ability: abilityKeySchema, sources })).optional(),
  languages: z.array(z.object({ id: z.string().min(1).max(120), sources })).optional(),
  weapons: z.array(z.object({ ref: z.string().min(1).max(200).optional(), category: z.enum(['simple', 'martial']).optional(), name: z.string().min(1).max(80).optional(), sources })).optional(),
  armor: z.array(z.object({ category: armorCategorySchema, sources })).optional(),
  tools: z.array(z.object({ ref: z.string().min(1).max(200).optional(), name: z.string().min(1).max(80).optional(), level: z.enum(['proficient', 'expertise']), sources })).optional(),
})
export type Proficiencies = z.infer<typeof proficienciesSchema>

export const overridesSchema = z.object({
  abilities: abilityRecord.optional(),
  skills: z.record(skillSchema, z.number().int()).optional(),
  saves: abilityRecord.optional(),
  ac: z.number().int().optional(),
  initiative: z.number().int().optional(),
  proficiency: z.number().int().optional(),
  passive: z.partialRecord(passiveKeySchema, z.number().int()).optional(),
  speed: z.partialRecord(speedKeySchema, z.number().int()).optional(),
  hpMax: z.number().int().optional(),
})
export type SheetOverrides = z.infer<typeof overridesSchema>

export const adjustSchema = z.object({
  ac: z.number().int().optional(),
  initiative: z.number().int().optional(),
  proficiency: z.number().int().optional(),
  passive: z.partialRecord(passiveKeySchema, z.number().int()).optional(),
  speed: z.partialRecord(speedKeySchema, z.number().int()).optional(),
})
export type SheetAdjust = z.infer<typeof adjustSchema>
