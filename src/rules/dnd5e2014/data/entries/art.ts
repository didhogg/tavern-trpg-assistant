import { z } from 'zod'
import { assetRefSchema } from '../../../../schemas/text'

const unit = z.number().min(0).max(1)

/**
 * 图片来源：网络地址（http/https），或本地上传进图片仓库的图片（{ $asset }，和条目 image 字段同一种写法）。
 * 官方包（D1.2b 从 5etools 生成）只会用网络地址；玩家在我的库、自制包里编辑怪物时可以换成自己上传的图。
 * 人物自己的头像、地图底图与参考图不走这里，它们各有自己的字段（U5 / U8），同样支持本地上传。
 */
const imageSourceSchema = z.union([z.string().url().regex(/^https?:\/\//i, '只接受 http/https 地址或本地上传的图片'), assetRefSchema])

/**
 * 怪物的默认头像与 token（D1.2b，规格见 docs/handoff/D1.2b_怪物与NPC导入_执行文档.md §5.1）。
 * 只存图片地址与头像裁切焦点，图片本身不进包。portrait 与 token 至少有一个；都没有就整个 art 不写。
 */
export const monsterArtSchema = z
  .object({
    portrait: z
      .object({
        url: imageSourceSchema,
        /** 正方形裁切：中心 (x, y) 相对原图宽、高；边长 size 相对 min(宽, 高)；都在 0–1。 */
        focus: z.object({ x: unit, y: unit, size: z.number().gt(0).max(1) }),
        method: z.enum(['token-match', 'smartcrop']),
        /** 只有 token-match 有：匹配得分 0–1。 */
        score: unit.optional(),
      })
      .refine((p) => (p.method === 'token-match') === (p.score !== undefined), { message: 'token-match 必须带 score，smartcrop 不带' })
      .optional(),
    token: z.object({ url: imageSourceSchema }).optional(),
  })
  .refine((a) => Boolean(a.portrait || a.token), { message: 'art 至少要有 portrait 或 token 之一' })
export type MonsterArt = z.infer<typeof monsterArtSchema>
