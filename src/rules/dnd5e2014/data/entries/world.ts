import { z } from 'zod'
import { textBlockSchema } from '../blocks'
import { effectListSchema, spellGrantSchema } from '../effects'
import { entryCommonFields } from './base'

const sizeCode = z.enum(['T', 'S', 'M', 'L', 'H', 'G', 'V'])

export const languageDataSchema = z.strictObject({
  ...entryCommonFields,
  code: z.string().min(1).max(40),
  type: z.enum(['standard', 'exotic', 'secret']).optional(),
  script: z.string().max(40).optional(),
  scriptRule: z.string().optional(),
  typicalSpeakers: z.array(z.string().max(120)).default([]),
  dialects: z.array(z.string().max(60)).optional(),
})

export const deityDataSchema = z.strictObject({
  ...entryCommonFields,
  pantheon: z.string().min(1).max(40),
  alignment: z.array(z.string().max(4)).optional(),
  category: z.string().max(40).optional(),
  domains: z.array(z.string().max(40)).default([]),
  province: z.string().max(80).optional(),
  symbol: z.string().max(120).optional(),
  title: z.string().max(80).optional(),
  altNames: z.array(z.string().max(60)).optional(),
  piety: z.boolean().optional(),
  reprintAlias: z.string().max(60).optional(),
  customExtensionOf: z.string().max(80).optional(),
})

export const rewardDataSchema = z.strictObject({
  ...entryCommonFields,
  rewardKind: z.enum(['blessing', 'boon', 'charm', 'pietyTrait', 'draconicGift', 'curse', 'other', 'demonicBoon']),
  type: z.string().max(40).optional(),
  rarity: z.string().max(20).optional(),
  effects: effectListSchema.optional(),
  spellGrants: z.array(spellGrantSchema).optional(),
  abilityEntry: z.string().optional(),
  signatureSpells: z.string().optional(),
})

export const cultDataSchema = z.strictObject({
  ...entryCommonFields,
  type: z.enum(['Diabolical', 'Demonic', 'Elder Evil']),
  goal: z.string().optional(),
  typicalMembers: z.string().optional(),
  signatureSpells: z.string().optional(),
})

const hazardRating = z.strictObject({
  tier: z.number().int().min(1).max(4),
  threat: z.enum(['setback', 'moderate', 'dangerous', 'deadly']),
})

export const hazardDataSchema = z.strictObject({
  ...entryCommonFields,
  hazardKind: z.enum(['trap', 'hazard']),
  kind: z.enum(['MECH', 'SMPL', 'MAG', 'CMPX', 'HAUNT', 'WLD', 'WTH', 'EST', 'ENV', 'GEN']).optional(),
  rating: z.array(hazardRating).optional(),
  trigger: z.array(textBlockSchema).optional(),
  effect: z.array(textBlockSchema).optional(),
  countermeasures: z.array(textBlockSchema).optional(),
  initiative: z.number().int().optional(),
  initiativeNote: z.string().optional(),
  hauntBonus: z.string().optional(),
  eActive: z.array(textBlockSchema).optional(),
  eDynamic: z.array(textBlockSchema).optional(),
  eConstant: z.array(textBlockSchema).optional(),
})

const objectHp = z.union([z.number().int(), z.strictObject({ special: z.string() })])
const objectSpeed = z.union([z.number(), z.record(z.string(), z.number())])

export const objectDataSchema = z.strictObject({
  ...entryCommonFields,
  objectType: z.enum(['SW', 'U', 'GEN']).optional(),
  size: z.array(sizeCode).min(1),
  ac: z.union([z.number().int(), z.strictObject({ special: z.string() })]),
  hp: objectHp,
  immune: z.array(z.string()).default([]),
  conditionImmune: z.array(z.string()).optional(),
  speed: objectSpeed.optional(),
  str: z.number().int().optional(),
  dex: z.number().int().optional(),
  con: z.number().int().optional(),
  int: z.number().int().optional(),
  wis: z.number().int().optional(),
  cha: z.number().int().optional(),
  actions: z.array(textBlockSchema).optional(),
})

const vehicleSize = z.enum(['T', 'S', 'M', 'L', 'H', 'G'])
const speedVal = z.union([z.number(), z.strictObject({ number: z.number(), condition: z.string().optional() })])
const paceVal = z.union([z.number(), z.string()])
const namedText = z.strictObject({ name: z.string(), text: z.array(textBlockSchema) })

export const vehicleDataSchema = z.strictObject({
  ...entryCommonFields,
  vehicleType: z.enum(['SHIP', 'SPELLJAMMER', 'OBJECT']),
  size: z.array(vehicleSize).min(1).optional(),
  dimensions: z.array(z.string()).optional(),
  terrain: z.array(z.string()).optional(),
  capCrew: z.number().int().optional(),
  capCrewNote: z.string().optional(),
  capPassenger: z.number().int().optional(),
  capCargo: z.union([z.number(), z.string()]).optional(),
  cost: z.number().optional(),
  pace: z.union([z.number(), z.strictObject({ walk: paceVal.optional(), fly: paceVal.optional(), swim: paceVal.optional() })]).optional(),
  speed: z.union([z.number(), z.strictObject({ walk: speedVal.optional(), swim: speedVal.optional(), fly: speedVal.optional(), canHover: z.boolean().optional() })]).optional(),
  ac: z.union([z.number().int(), z.array(z.strictObject({ ac: z.number().int(), from: z.array(z.string()).optional() }))]).optional(),
  hp: z.union([
    z.number().int(),
    z.strictObject({ hp: z.number().int(), dt: z.number().int().optional(), mt: z.number().int().optional() }),
    z.strictObject({ average: z.number().int(), formula: z.string() }),
  ]).optional(),
  hull: z.strictObject({ ac: z.number().int(), acFrom: z.array(z.string()).optional(), dt: z.number().int().optional(), hp: z.number().int().optional() }).optional(),
  immune: z.array(z.string()).optional(),
  conditionImmune: z.array(z.string()).optional(),
  str: z.number().int().optional(),
  dex: z.number().int().optional(),
  con: z.number().int().optional(),
  int: z.number().int().optional(),
  wis: z.number().int().optional(),
  cha: z.number().int().optional(),
  control: z.array(z.strictObject({ name: z.string(), ac: z.number().int().optional(), hp: z.number().int().optional(), text: z.array(textBlockSchema).default([]) })).optional(),
  movement: z.array(z.strictObject({
    name: z.string(),
    ac: z.number().int().optional(),
    hp: z.number().int().optional(),
    hpNote: z.string().optional(),
    isControl: z.boolean().optional(),
    speed: z.array(z.strictObject({ mode: z.string(), entries: z.array(z.string()) })).optional(),
  })).optional(),
  weapon: z.array(z.strictObject({
    name: z.string(),
    ac: z.number().int().optional(),
    hp: z.number().int().optional(),
    dt: z.number().int().optional(),
    count: z.number().int().optional(),
    crew: z.number().int().optional(),
    size: z.array(vehicleSize).optional(),
    costs: z.array(z.strictObject({ cost: z.number().optional(), note: z.string().optional() })).optional(),
    text: z.array(textBlockSchema).default([]),
    actions: z.array(namedText).optional(),
  })).optional(),
  actionThresholds: z.record(z.string(), z.number().int()).optional(),
  actions: z.array(textBlockSchema).optional(),
})

export type LanguageData = z.infer<typeof languageDataSchema>
export type DeityData = z.infer<typeof deityDataSchema>
export type RewardData = z.infer<typeof rewardDataSchema>
export type CultData = z.infer<typeof cultDataSchema>
export type HazardData = z.infer<typeof hazardDataSchema>
export type ObjectData = z.infer<typeof objectDataSchema>
export type VehicleData = z.infer<typeof vehicleDataSchema>
