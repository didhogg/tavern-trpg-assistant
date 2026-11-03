import { z } from 'zod'
import { assetRefSchema } from './text'
import { idSchema, timestampSchema } from './common'
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

export const personEffectSchema = z.object({
  name: z.string().min(1).max(80),
  ref: z.string().min(1).max(200).optional(),
  note: z.string().max(400).optional(),
  duration: z.string().max(80).optional(),
})
export type PersonEffect = z.infer<typeof personEffectSchema>

export const personSourceRefSchema = z.object({ packId: idSchema, version: z.string().min(1).max(20), entryId: z.string().min(1).max(200) })
export type PersonSourceRef = z.infer<typeof personSourceRefSchema>

export const personLibraryRefSchema = z.object({ packId: idSchema, entryId: z.string().min(1).max(200) })
export type PersonLibraryRef = z.infer<typeof personLibraryRefSchema>

export const personSchema = z.object({
  id: z.string().min(1).max(80),
  name: z.string().min(1).max(PERSON_NAME_MAX),
  nameEn: z.string().max(80).optional(),
  avatar: z.union([z.string(), assetRefSchema]).optional(),
  categoryId: peopleCategorySchema,
  tags: z.array(z.string().min(1)).default([]),
  pinned: z.boolean().default(false),
  sourceRef: personSourceRefSchema.optional(),
  /** 同一 sourceRef 下的编号；第一个不写。 */
  serial: z.number().int().min(2).optional(),
  hp: personHpSchema,
  effects: z.array(personEffectSchema).default([]),
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
