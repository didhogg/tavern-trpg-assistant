import { z } from 'zod'
import { textBlockSchema } from '../blocks'
import { entryCommonFields } from './base'

/**
 * 具名 NPC 模板（D1.2b，规格见 docs/handoff/D1.2b_怪物与NPC导入_执行文档.md §5.3）：
 * 冒险正文里「使用某某的数据」的人物。只记名字、引用的属性块、出处与简介；属性块不复制。
 */
export const npcDataSchema = z.looseObject({
  ...entryCommonFields,
  /** 引用的 monster 条目 id；所在的包自动成为依赖。 */
  statblock: z.string().min(1).max(160),
  /** 冒险来源代号。 */
  adventure: z.string().min(1).max(40),
  at: z.object({ chapter: z.string().min(1).max(200), heading: z.string().max(200).optional() }),
  intro: z.array(textBlockSchema).optional(),
  confidence: z.enum(['high', 'medium']),
})
export type NpcData = z.infer<typeof npcDataSchema>
