import { z } from 'zod'
import { assetRefSchema } from './text'
import { idSchema, timestampSchema } from './common'
import { effectSchema } from '../rules/dnd5e2014/data/effects'
import { monsterDataSchema } from '../rules/dnd5e2014/data/entries/spell-monster'

/** 固定三类；分类本身不存表，也不允许改名、删除或自建。 */
export const PEOPLE_CATEGORY_IDS = ['party', 'npc', 'enemy'] as const
export const peopleCategorySchema = z.enum(PEOPLE_CATEGORY_IDS)
export type PeopleCategoryId = z.infer<typeof peopleCategorySchema>
export const PEOPLE_CATEGORY_LABELS: Record<PeopleCategoryId, string> = { party: '队伍', npc: 'NPC', enemy: '敌人' }

export const PERSON_NAME_MAX = 40
export const TAG_NAME_MAX = 24
export const PARTY_NAME_MAX = 40

export const personHpSchema = z.object({
  current: z.number().int().nonnegative().nullable(),
  temp: z.number().int().nonnegative().default(0),
  deathSaves: z.object({
    success: z.number().int().min(0).max(3).default(0),
    fail: z.number().int().min(0).max(3).default(0),
  }).default({ success: 0, fail: 0 }),
})
export type PersonHp = z.infer<typeof personHpSchema>

export const EFFECT_CATEGORIES = ['condition', 'status', 'disease', 'spell', 'other'] as const
export const effectCategorySchema = z.enum(EFFECT_CATEGORIES)
export type PersonEffectCategory = z.infer<typeof effectCategorySchema>

/** U5R §12.4：人物效果 = 类别 + 时长 + 是否专注 + 加入时的结构化 effects 快照。 */
export const personEffectSchema = z.object({
  id: z.string().min(1).max(80),
  ref: z.string().min(1).max(200).optional(),
  category: effectCategorySchema.default('other'),
  name: z.string().min(1).max(80),
  nameEn: z.string().max(80).optional(),
  duration: z.object({
    type: z.string().max(30),
    amount: z.number().nonnegative().optional(),
    unit: z.string().max(20).optional(),
    concentration: z.boolean().default(false),
  }).optional(),
  concentration: z.boolean().default(false),
  effects: z.array(effectSchema).optional(),
  note: z.string().max(400).optional(),
  addedAt: timestampSchema.default(0),
})
export type PersonEffect = z.infer<typeof personEffectSchema>

export const avatarCropSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  w: z.number().positive().max(1),
  h: z.number().positive().max(1),
}).refine((crop) => crop.x + crop.w <= 1 && crop.y + crop.h <= 1, { message: '截取框必须在原图内' })
export type AvatarCrop = z.infer<typeof avatarCropSchema>

export const avatarSourceSchema = z.object({ asset: assetRefSchema, crop: avatarCropSchema })
export type AvatarSource = z.infer<typeof avatarSourceSchema>

export const personSourceRefSchema = z.object({ packId: idSchema, version: z.string().min(1).max(20), entryId: z.string().min(1).max(200) })
export type PersonSourceRef = z.infer<typeof personSourceRefSchema>

export const personLibraryRefSchema = z.object({ packId: idSchema, entryId: z.string().min(1).max(200) })
export type PersonLibraryRef = z.infer<typeof personLibraryRefSchema>

export const personSchema = z.object({
  id: z.string().min(1).max(80),
  name: z.string().min(1).max(PERSON_NAME_MAX),
  nameEn: z.string().max(80).optional(),
  avatar: z.union([z.string(), assetRefSchema]).optional(),
  /** 原图与 4:5 截取框；只用于身份抽屉里的重新截取。 */
  avatarSource: avatarSourceSchema.optional(),
  categoryId: peopleCategorySchema,
  tags: z.array(z.string().min(1)).default([]),
  pinned: z.boolean().default(false),
  sourceRef: personSourceRefSchema.optional(),
  /** 同一 sourceRef 下的编号；第一个不写。 */
  serial: z.number().int().min(2).optional(),
  hp: personHpSchema,
  effects: z.array(personEffectSchema).default([]),
  /** 当场状态；旧数据未写 = 没有灵感。 */
  inspiration: z.boolean().optional(),
  /** 生命上限的来源修正（U5R §4）。 */
  hpAdj: z.array(z.object({ label: z.string().min(1).max(40), flat: z.number().int().optional(), perLevel: z.number().int().optional(), source: z.string().max(60).optional() })).optional(),
  /** 生命骰数量覆盖：骰面 → 颗数。 */
  hitDiceOverride: z.record(z.string(), z.number().int().nonnegative()).optional(),
  /** 升级掷骰记录：总等级（从 2 起）→ 该级掷出的骰面点数；生命增量 = max(1, 点数 + 体质调整值)。 */
  hpRolls: z.record(z.string(), z.number().int().min(1)).optional(),
  /** 升级时选过的属性值提升：级数 → 两个属性（相同 = +2，不同 = 各 +1）；降级时据此还原 abilityGrowth。 */
  asiLog: z.record(z.string(), z.array(z.enum(['str', 'dex', 'con', 'int', 'wis', 'cha'])).length(2)).optional(),
  /** 当场状态；0–6 级。 */
  exhaustion: z.number().int().min(0).max(6).optional(),
  /** 当场状态：每个骰型已用颗数。 */
  hitDiceUsed: z.record(z.string(), z.number().int().nonnegative()).optional(),
  /** 当场状态：1–9 环与契约位已用数。 */
  slotsUsed: z.record(z.string(), z.number().int().nonnegative()).optional(),
  /** 当场状态：资源条目编号 → 已用数。 */
  resourcesUsed: z.record(z.string(), z.number().int().nonnegative()).optional(),
  block: monsterDataSchema,
  libraryRef: personLibraryRefSchema.optional(),
  giveAi: z.enum(['auto', 'nameOnly', 'full', 'none']).default('auto'),
  trashedAt: timestampSchema.optional(),
  trashedFrom: peopleCategorySchema.optional(),
  createdAt: timestampSchema,
  touchedAt: timestampSchema,
})
export type Person = z.infer<typeof personSchema>

export const tagSchema = z.object({ id: z.string().min(1).max(80), name: z.string().min(1).max(TAG_NAME_MAX) })
export type Tag = z.infer<typeof tagSchema>

export const partySchema = z.object({ name: z.string().max(PARTY_NAME_MAX).default('') })
export type Party = z.infer<typeof partySchema>

export const peopleDataSchema = z.object({
  people: z.array(personSchema).optional(),
  tags: z.array(tagSchema).optional(),
  party: partySchema.optional(),
})
export type PeopleData = z.infer<typeof peopleDataSchema>
