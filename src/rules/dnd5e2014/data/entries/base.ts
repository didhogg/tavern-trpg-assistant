import { z } from 'zod'
import { creditSchema, srcSchema } from '../common'
import { textBlockSchema } from '../blocks'
import { requiresSchema } from '../requires'
import { activitySchema } from '../activities'

/** 条目时长（U5R §12）：形状与法术相同；特性、物品、专长、疾病、环境按来源有就写，没有就没有。 */
export const entryDurationSchema = z.object({
  type: z.enum(['timed', 'permanent', 'instant', 'special']),
  amount: z.number().positive().optional(),
  unit: z.enum(['round', 'minute', 'hour', 'day']).optional(),
  concentration: z.boolean().default(false),
})

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
  duration: entryDurationSchema.optional(),
  /** 分类标签（来源的 senseTags、miscTags 等），值保持来源代码；给筛选与搜索用，不显示 */
  facets: z.record(z.string(), z.array(z.string())).optional(),
  /** 来源里的其他展示字段，按来源字段名原样保存（R15） */
  extra: z.record(z.string(), z.unknown()).optional(),
}
