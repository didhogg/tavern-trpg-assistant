import { z } from 'zod'
import { creditSchema, srcSchema } from '../common'
import { textBlockSchema } from '../blocks'
import { requiresSchema } from '../requires'
import { activitySchema } from '../activities'

/** 所有条目共有的字段（D1 §4.1）。 */
export const entryCommonFields = {
  src: srcSchema,
  credit: creditSchema,
  text: z.array(textBlockSchema).default([]),
  lore: z.array(textBlockSchema).optional(),
  supersededBy: z.string().optional(),
  versionGroup: z.string().optional(),
  playable: z.boolean().optional(),
  fromVariantRule: z.string().optional(),
  nameSuffix: z.string().max(40).optional(),
  requires: requiresSchema.optional(),
  activities: z.array(activitySchema).optional(),
}
