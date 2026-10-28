import { z } from 'zod'

/** 阅读顺序中的原书与页码；页码未知时记 0，并写入构建报告。 */
export const srcSchema = z.object({
  book: z.string().min(1).max(20),
  page: z.number().int().nonnegative(),
})
export type Src = z.infer<typeof srcSchema>

export const creditBySchema = z.enum(['不全书', '共库', '共库机翻', 'dnd-data', '本项目'])
export const creditLicenseSchema = z.enum(['GPL-3.0', 'CC-BY-NC-SA-4.0', 'CC-BY-4.0', 'MIT'])

const LICENSE_BY_CREDIT: Record<z.infer<typeof creditBySchema>, z.infer<typeof creditLicenseSchema>> = {
  不全书: 'GPL-3.0',
  共库: 'CC-BY-NC-SA-4.0',
  共库机翻: 'CC-BY-NC-SA-4.0',
  'dnd-data': 'MIT',
  本项目: 'CC-BY-NC-SA-4.0',
}

export const creditSchema = z
  .object({
    by: creditBySchema,
    license: creditLicenseSchema,
    machine: z.boolean().default(false),
    missing: z.array(z.string()).default([]),
    /** SRD 5.1 署名（CC BY 4.0，Wizards of the Coast）。 */
    srd: z.boolean().default(false),
  })
  .superRefine((value, ctx) => {
    if (LICENSE_BY_CREDIT[value.by] !== value.license) {
      ctx.addIssue({ code: 'custom', path: ['license'], message: `credit.by 为 ${value.by} 时许可必须是 ${LICENSE_BY_CREDIT[value.by]}` })
    }
    if (value.by !== '共库机翻' && value.machine) {
      ctx.addIssue({ code: 'custom', path: ['machine'], message: '只有「共库机翻」可以标记为机翻' })
    }
  })
export type Credit = z.infer<typeof creditSchema>
