import { z } from 'zod'
import { entryIdSchema } from '../common'
import { creditSchema, srcSchema } from '../credit'
import { textBlockSchema, assetRefSchema } from '../text'

/** L1 §2.3 已登记的类型；其他类型原样保留。 */
export const ADVENTURE_KINDS = ['location', 'person', 'faction', 'quest', 'encounter', 'event', 'handout'] as const
export type AdventureKind = (typeof ADVENTURE_KINDS)[number]

export const adventureItemSchema = z.looseObject({
  kind: z.string().min(1).max(40),
  id: entryIdSchema,
  name: z.string().min(1).max(200),
  description: z.array(textBlockSchema).default([]),
  dmSecret: z.array(textBlockSchema).default([]),
  keywords: z.array(z.string()).default([]),
  src: srcSchema.optional(),
  credit: creditSchema.optional(),
  data: z.record(z.string(), z.unknown()).default({}),
})
export type AdventureItem = z.infer<typeof adventureItemSchema>

export const adventureChapterSchema = z.looseObject({
  name: z.string().min(1),
  dmNotes: z.array(textBlockSchema).optional(),
  itemIds: z.array(entryIdSchema).default([]),
})

export const adventureSchema = z.looseObject({
  id: entryIdSchema,
  name: z.string().min(1).max(120),
  description: z.string().max(4000).default(''),
  dmNotes: z.array(textBlockSchema).optional(),
  levelMin: z.number().int().min(1).max(20).optional(),
  levelMax: z.number().int().min(1).max(20).optional(),
  start: z.object({ locationId: entryIdSchema.optional(), intro: z.array(textBlockSchema).optional() }),
  chapters: z.array(adventureChapterSchema).default([]),
  itemIds: z.array(entryIdSchema).default([]),
})
export type Adventure = z.infer<typeof adventureSchema>

export const adventureFileSchema = z.looseObject({
  cover: assetRefSchema.optional(),
  description: z.string().default(''),
  adventures: z.array(adventureSchema),
  shared: z.array(entryIdSchema).default([]),
})
export type AdventureFile = z.infer<typeof adventureFileSchema>

export const adventureFallbackSchema = z.object({
  items: z.array(adventureItemSchema).default([]),
})
export type AdventureFallback = z.infer<typeof adventureFallbackSchema>
