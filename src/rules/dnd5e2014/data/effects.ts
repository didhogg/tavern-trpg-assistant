import { z } from 'zod'
import { abilityKeySchema, usesSchema } from './common'
import { requiresSchema } from './requires'
import { formulaSchema } from './formula'
import { conditionKeySchema, damageTypeSchema, languageSchema, skillSchema, toolSchema } from './enums'

const formulaOrNumber = z.union([z.number(), formulaSchema])
const duration = z.looseObject({
  type: z.string().max(30).optional(),
  amount: z.number().nonnegative().optional(),
  unit: z.string().max(20).optional(),
  concentration: z.boolean().optional(),
})
const base = {
  condition: z.string().max(300).optional(),
  when: requiresSchema.optional(),
  duration: duration.optional(),
  transfer: z.boolean().optional(),
}

const effect = <T extends z.ZodRawShape>(shape: T) => z.looseObject({ ...base, ...shape })

const abilityBonus = effect({ kind: z.literal('abilityBonus'), ability: abilityKeySchema, amount: formulaOrNumber, max: z.number().int().positive().optional() })
const abilitySet = effect({ kind: z.literal('abilitySet'), ability: abilityKeySchema, value: z.number().int().min(1).max(30) })
const skill = effect({ kind: z.literal('skill'), skill: skillSchema, level: z.enum(['half', 'proficient', 'expertise', 'advantage', 'bonus']), amount: z.number().optional() })
const save = effect({
  kind: z.literal('save'),
  ability: abilityKeySchema.optional(),
  all: z.boolean().optional(),
  death: z.boolean().optional(),
  level: z.enum(['proficient', 'advantage', 'disadvantage', 'bonus']),
  amount: z.number().optional(),
})
const proficiency = effect({
  kind: z.literal('proficiency'),
  category: z.enum(['armor', 'weapon', 'tool', 'language']),
  value: z.string().min(1).max(60),
  choose: z.object({ count: z.number().int().positive(), from: z.array(z.string()).optional() }).optional(),
})
const ac = effect({ kind: z.literal('ac'), mode: z.enum(['base', 'bonus', 'floor']), formula: formulaSchema.optional(), amount: z.number().optional() })
const hpMax = effect({ kind: z.literal('hpMax'), perLevel: formulaOrNumber.optional(), flat: formulaOrNumber.optional() })
const speed = effect({
  kind: z.literal('speed'),
  mode: z.enum(['walk', 'fly', 'swim', 'climb', 'burrow']),
  amount: z.number().optional(),
  equalsWalk: z.boolean().optional(),
  bonus: z.number().optional(),
  multiplier: z.number().positive().optional(),
})
const sense = effect({ kind: z.literal('sense'), sense: z.enum(['darkvision', 'blindsight', 'tremorsense', 'truesight']), range: z.number().int().nonnegative() })
const damageList = effect({ kind: z.enum(['resistance', 'immunity', 'vulnerability']), damage: z.array(damageTypeSchema).min(1) })
const conditionImmunity = effect({ kind: z.literal('conditionImmunity'), conditions: z.array(conditionKeySchema).min(1) })
const initiative = effect({ kind: z.literal('initiative'), bonus: formulaOrNumber.optional(), advantage: z.boolean().optional(), halfProficiency: z.boolean().optional() })
const passive = effect({ kind: z.literal('passive'), skill: skillSchema, bonus: z.number() })
const attackBonus = effect({ kind: z.enum(['attackBonus', 'damageBonus', 'saveDcBonus', 'spellAttackBonus']), amount: formulaOrNumber, scope: z.enum(['melee', 'ranged', 'spell', 'weapon', 'all']) })
const advantage = effect({ kind: z.enum(['advantage', 'disadvantage']), on: z.enum(['attack', 'check', 'save', 'initiative']), scope: z.string().max(60).optional() })
const extraAttack = effect({ kind: z.literal('extraAttack'), count: z.number().int().positive() })
const spellGrant = effect({
  kind: z.literal('spellGrant'),
  spells: z.array(z.string().min(1)).min(1),
  mode: z.enum(['known', 'prepared', 'alwaysPrepared', 'innate']),
  ability: abilityKeySchema.optional(),
  uses: usesSchema.optional(),
})
const carry = effect({ kind: z.literal('carry'), multiplier: z.number().positive() })
const size = effect({ kind: z.literal('size'), value: z.enum(['T', 'S', 'M', 'L', 'H', 'G']) })
const note = effect({ kind: z.literal('note'), text: z.string().min(1) })

export const effectSchema = z.discriminatedUnion('kind', [
  abilityBonus, abilitySet, skill, save, proficiency, ac, hpMax, speed, sense, damageList, conditionImmunity,
  initiative, passive, attackBonus, advantage, extraAttack, spellGrant, carry, size, note,
])
export type Effect = z.infer<typeof effectSchema>
export const effectListSchema = z.array(effectSchema).default([])

/** 旧包 condition.effects 是 string[]，空数组按无效果读取。 */
export const legacyEffectListSchema = z.union([effectListSchema, z.array(z.string()).transform(() => [])])

export const effectCategorySchema = z.enum(['condition', 'disease', 'status'])
export const exhaustionSchema = z.object({
  levels: z.array(z.object({ level: z.number().int().min(1).max(6), effects: effectListSchema })).length(6),
})

export const spellGrantSchema = z.object({
  spell: z.string().min(1),
  mode: z.enum(['known', 'prepared', 'alwaysPrepared', 'innate']).default('known'),
  ability: abilityKeySchema.optional(),
  uses: usesSchema.optional(),
})
export type SpellGrant = z.infer<typeof spellGrantSchema>

export { toolSchema, languageSchema }
