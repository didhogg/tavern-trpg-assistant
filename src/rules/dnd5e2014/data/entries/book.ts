import { z } from 'zod'
import { entryCommonFields } from './base'

const anchor = z.string().regex(/^(phb|scag|mm|vgm|mtf|dmg|xge|tce|mpmm|bmt)-[0-9a-f]{3}$/)

export const bookOrdinalSchema = z.strictObject({
  type: z.enum(['chapter', 'appendix']),
  identifier: z.union([z.number().int().positive(), z.string().min(1).max(8)]).optional(),
})

export const bookOutlineItemSchema = z.strictObject({
  anchor,
  parent: anchor.optional(),
  level: z.number().int().min(0).max(5),
  kind: z.enum(['section', 'entries', 'inset']),
  title: z.string().min(1).max(300),
  titleEn: z.string().min(1).max(300).optional(),
  page: z.number().int().positive().optional(),
})

export const bookDataSchema = z.strictObject({
  ...entryCommonFields,
  book: z.string().min(1).max(20),
  order: z.number().int().nonnegative(),
  ordinal: bookOrdinalSchema.optional(),
  anchor,
  outline: z.array(bookOutlineItemSchema).min(1),
})
