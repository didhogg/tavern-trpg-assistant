import { z } from 'zod'

/** 正文块与行内标记是规则包与冒险内容共用的语法（D1 §4.4 / L1 §2.3）。 */
export type TextBlock =
  | { p: string }
  | { h: string; body: TextBlock[] }
  | { list: string[] }
  | { table: { caption?: string; cols: string[]; rows: string[][] } }
  | { quote: string; by?: string }
  | { read: TextBlock[] }
  | { tableRef: { id: string; label: string } }

export const textBlockSchema: z.ZodType<TextBlock> = z.lazy(() =>
  z.union([
    z.object({ p: z.string() }),
    z.object({ h: z.string(), body: z.array(textBlockSchema) }),
    z.object({ list: z.array(z.string()) }),
    z.object({ table: z.object({ caption: z.string().optional(), cols: z.array(z.string()), rows: z.array(z.array(z.string())) }) }),
    z.object({ quote: z.string(), by: z.string().optional() }),
    z.object({ read: z.array(textBlockSchema) }),
    z.object({ tableRef: z.object({ id: z.string().min(1), label: z.string().min(1) }) }),
  ]),
)

/** 行内标记：{{种类:参数|显示文字}}；参数里的 `|` 需转义为 `\|`。 */
export const INLINE_MARKUP = /\{\{(roll|hit|dc|ref|atk|em):([^{}|]*(?:\\\|[^{}|]*)*)(?:\|([^{}]*))?\}\}/g

export const inlineMarkupSchema = z.string().refine((value) => {
  const stripped = value.replace(INLINE_MARKUP, '')
  return !stripped.includes('{{') && !stripped.includes('}}')
}, '行内标记必须写成 {{种类:参数|显示文字}}')

/** 图片引用（L1 §2.4）。 */
export const assetRefSchema = z.object({ $asset: z.string().min(1) })
export type AssetRef = z.infer<typeof assetRefSchema>
