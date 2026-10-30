import { z } from 'zod'
import { entryIdSchema } from '../../../../schemas/common'
import { activationSchema, rangeSchema, damagePartSchema } from '../common'
import { textBlockSchema } from '../blocks'
import { activitySchema } from '../activities'
import { scaleDiceSchema } from '../advancement'
import { entryCommonFields } from './base'

const common = entryCommonFields

const castTimeSchema = z.object({ n: z.number().positive(), unit: z.enum(['action', 'bonus', 'reaction', 'minute', 'hour']), condition: z.string().max(120).optional() })
const rangeBlockSchema = z.object({ type: z.string().max(30), amount: z.number().nonnegative().optional(), unit: z.string().max(20).optional() })
const componentsSchema = z.object({
  v: z.boolean().default(false),
  s: z.boolean().default(false),
  m: z.object({ text: z.string().max(400), cost: z.number().nonnegative().optional(), consumed: z.boolean().optional() }).optional(),
})
const durationSchema = z.object({ type: z.string().max(30), amount: z.number().nonnegative().optional(), unit: z.string().max(20).optional(), concentration: z.boolean().default(false) })

export const spellDataSchema = z.looseObject({
  ...common,
  level: z.number().int().min(0).max(9),
  school: z.enum(['abjuration', 'conjuration', 'divination', 'enchantment', 'evocation', 'illusion', 'necromancy', 'transmutation']),
  castTime: z.array(castTimeSchema).min(1),
  range: rangeBlockSchema,
  components: componentsSchema,
  duration: z.array(durationSchema).min(1),
  ritual: z.boolean().default(false),
  classes: z.array(entryIdSchema).default([]),
  subclasses: z.array(entryIdSchema).default([]),
  higherLevel: z.string().max(2000).optional(),
  cantripScaling: z.union([scaleDiceSchema, z.array(scaleDiceSchema)]).optional(),
  attack: z.enum(['mw', 'rw', 'ms', 'rs']).optional(),
  save: z.array(z.enum(['str', 'dex', 'con', 'int', 'wis', 'cha'])).optional(),
  activation: activationSchema.optional(),
  spellRange: rangeSchema.optional(),
  damage: z.array(damagePartSchema).optional(),
  damageInflict: z.array(z.string()).optional(),
  conditionInflict: z.array(z.string()).optional(),
  conditionImmune: z.array(z.string()).optional(),
  damageResist: z.array(z.string()).optional(),
  damageImmune: z.array(z.string()).optional(),
  damageVulnerable: z.array(z.string()).optional(),
  affectsCreatureType: z.array(z.string()).optional(),
})
export type SpellData = z.infer<typeof spellDataSchema>

const namedAction = z.looseObject({
  name: z.string().min(1).max(200),
  text: z.array(textBlockSchema).default([]),
  activities: z.array(activitySchema).optional(),
})

const spellcastingSchema = z.looseObject({
  ability: z.enum(['str', 'dex', 'con', 'int', 'wis', 'cha']),
  dc: z.number().int().optional(),
  attack: z.number().int().optional(),
  atWill: z.array(z.string()).default([]),
  perDay: z.record(z.string(), z.array(z.string())).default({}),
  slots: z.record(z.string(), z.number().int()).default({}),
  /** 按环阶列出的法术：{ "1": { slots: 4, spells: [...] } }；戏法没有 slots。 */
  spells: z.record(z.string(), z.object({ slots: z.number().int().optional(), spells: z.array(z.string()) })).optional(),
  /** 其他使用频率：充能、短休/长休、传奇动作、法术充能、仪式。键是次数或充能值，值是法术文字。 */
  recharge: z.record(z.string(), z.array(z.string())).optional(),
  rest: z.record(z.string(), z.array(z.string())).optional(),
  restLong: z.record(z.string(), z.array(z.string())).optional(),
  legendary: z.record(z.string(), z.array(z.string())).optional(),
  charges: z.record(z.string(), z.array(z.string())).optional(),
  ritual: z.array(z.string()).optional(),
})

export const monsterVariantSchema = z.looseObject({
  name: z.string().min(1).max(200),
  nameEn: z.string().max(240).optional(),
  kind: z.enum(['variant', 'inset']),
  text: z.array(textBlockSchema).default([]),
  src: z.object({ book: z.string().min(1), page: z.number().int().nonnegative().optional() }).optional(),
  version: z.object({ name: z.string().min(1), addAs: z.string().max(80).optional(), addHeadersAs: z.string().max(80).optional() }).optional(),
})

export type MonsterVariant = z.infer<typeof monsterVariantSchema>

export const monsterDataSchema = z.looseObject({
  ...common,
  size: z.array(z.enum(['T', 'S', 'M', 'L', 'H', 'G'])).min(1),
  creatureType: z.object({ type: z.string().min(1).max(40), tags: z.array(z.string()).default([]), swarm: z.boolean().optional() }),
  alignment: z.string().max(80).optional(),
  ac: z.array(z.object({ value: z.number().int(), from: z.string().max(200).optional(), condition: z.string().max(120).optional(), braces: z.boolean().optional() })).min(1),
  hp: z.object({ average: z.number().int().nonnegative(), formula: z.string().max(40).optional(), special: z.string().max(300).optional() }),
  speed: z.record(z.string(), z.union([z.number(), z.boolean()])),
  abilities: z.record(z.enum(['str', 'dex', 'con', 'int', 'wis', 'cha']), z.number().int()),
  saves: z.record(z.string(), z.number().int()).optional(),
  skills: z.record(z.string(), z.number().int()).optional(),
  senses: z.array(z.string().max(80)).default([]),
  passive: z.number().int().nonnegative().optional(),
  languages: z.array(z.string().max(120)).default([]),
  cr: z.union([z.number(), z.object({ value: z.number(), lair: z.number().optional(), coven: z.number().optional() })]),
  xp: z.number().int().nonnegative().optional(),
  resist: z.array(z.string()).default([]),
  immune: z.array(z.string()).default([]),
  vulnerable: z.array(z.string()).default([]),
  conditionImmune: z.array(z.string()).default([]),
  traits: z.array(namedAction).default([]),
  actions: z.array(namedAction).default([]),
  bonusActions: z.array(namedAction).default([]),
  reactions: z.array(namedAction).default([]),
  legendary: z.object({ count: z.number().int().nonnegative(), actions: z.array(namedAction) }).optional(),
  mythic: z.array(namedAction).optional(),
  spellcasting: z.array(spellcastingSchema).default([]),
  variants: z.array(monsterVariantSchema).optional(),
})
export type MonsterData = z.infer<typeof monsterDataSchema>
