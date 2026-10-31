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
  /** 分类标签（来源的 senseTags、miscTags 等），值保持来源代码；给筛选与搜索用，不显示 */
  facets: z.record(z.string(), z.array(z.string())).optional(),
  /** 来源里的其他展示字段，按来源字段名原样保存（R15） */
  extra: z.record(z.string(), z.unknown()).optional(),
}
