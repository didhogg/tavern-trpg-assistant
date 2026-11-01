import { z } from 'zod'

const unit = z.number().min(0).max(1)

/**
 * 怪物的默认头像与 token（D1.2b，规格见 docs/handoff/D1.2b_怪物与NPC导入_执行文档.md §5.1）。
 * 只存图片地址与头像裁切焦点，图片本身不进包。portrait 与 token 至少有一个；都没有就整个 art 不写。
 */
export const monsterArtSchema = z
  .object({
    portrait: z
      .object({
        url: z.string().url().startsWith('https://'),
        /** 正方形裁切：中心 (x, y) 相对原图宽、高；边长 size 相对 min(宽, 高)；都在 0–1。 */
        focus: z.object({ x: unit, y: unit, size: z.number().gt(0).max(1) }),
        method: z.enum(['token-match', 'smartcrop']),
        /** 只有 token-match 有：匹配得分 0–1。 */
        score: unit.optional(),
      })
      .refine((p) => (p.method === 'token-match') === (p.score !== undefined), { message: 'token-match 必须带 score，smartcrop 不带' })
      .optional(),
    token: z.object({ url: z.string().url().startsWith('https://') }).optional(),
  })
  .refine((a) => Boolean(a.portrait || a.token), { message: 'art 至少要有 portrait 或 token 之一' })
export type MonsterArt = z.infer<typeof monsterArtSchema>
