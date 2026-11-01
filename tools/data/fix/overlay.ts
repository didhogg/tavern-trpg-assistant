import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { z } from 'zod'
import type { Entry } from '../../../src/schemas/pack'
import type { Fix, RowSet } from './engine'

/**
 * 补充层（G2.5 E 站起）：原始数据（5etools、Foundry 开源数据）里确实没有、只能读书补的内容，写成**数据文件**而不是代码：
 * `tools/data/overlay/*.json`，随仓库版本化，任何人都能读、改、导出，构建时在转换器之后、与旧的逐条修正表同一套引擎里应用。
 *
 * 文件格式：
 *   { "领域": "E1 角色特性", "说明": "…（可选）",
 *     "rows": [ { "id": "feature.x.phb", "path": "/data/uses", "op": "set", "before": …, "after": …, "basis": "PHB p.xx …", "source": "book" } ],
 *     "add":  [ { "pack": "dnd5e2014-phb", "entry": { … }, "basis": "…" } ] }
 * - `set`／`delete` 必须写 `before`（现状，对不上构建就失败）；**新增一个原来没有的字段**：`op: "set"` 且**不写 `before`**（意思是"现状：这个字段不存在"）。
 * - `insert` 不写 `before`；`path` 是数组下标，`after` 插在那个位置。
 * - `basis` 必填（书名＋页码，或参考文件＋字段）；`source` 可选：`book`（读原书）｜`foundry-open`｜`5etools`｜`decision`（驾驶员决定）。
 * - 文件名以 `_` 开头的不读（留给说明）。
 */
const source = z.enum(['book', 'foundry-open', '5etools', 'decision'])
const rowSchema = z.discriminatedUnion('op', [
  z.strictObject({ id: z.string().min(1), path: z.string().startsWith('/'), op: z.literal('set'), before: z.unknown().optional(), after: z.unknown(), basis: z.string().min(1), source: source.optional() }),
  z.strictObject({ id: z.string().min(1), path: z.string().startsWith('/'), op: z.literal('delete'), before: z.unknown(), basis: z.string().min(1), source: source.optional() }),
  z.strictObject({ id: z.string().min(1), path: z.string().startsWith('/'), op: z.literal('insert'), after: z.unknown(), basis: z.string().min(1), source: source.optional() }),
])
const addSchema = z.strictObject({ pack: z.string().min(1), entry: z.looseObject({ id: z.string().min(1), type: z.string().min(1) }), basis: z.string().min(1), source: source.optional() })
export const overlayFileSchema = z.strictObject({ 领域: z.string().min(1), 说明: z.string().optional(), rows: z.array(rowSchema).default([]), add: z.array(addSchema).default([]) })
export type OverlayFile = z.infer<typeof overlayFileSchema>

/** JSON 里没写 `before` ＝ 现状应为"字段不存在"（引擎里是 undefined）；写了（含 null）就按值比。 */
export function overlayToRows(file: OverlayFile, hasBefore: (rowIndex: number) => boolean): Fix[] {
  const rows: Fix[] = file.rows.map((r, i): Fix => {
    if (r.op === 'insert') return { id: r.id, path: r.path, op: 'insert', after: r.after, basis: r.basis }
    if (r.op === 'delete') return { id: r.id, path: r.path, op: 'delete', before: r.before, basis: r.basis }
    return { id: r.id, path: r.path, op: 'set', before: hasBefore(i) ? r.before : undefined, after: r.after, basis: r.basis }
  })
  const adds: Fix[] = file.add.map((a) => ({ op: 'add', pack: a.pack, entry: a.entry as unknown as Entry, basis: a.basis }))
  return [...rows, ...adds]
}

export const OVERLAY_DIR = join(process.cwd(), 'tools', 'data', 'overlay')

/** 读取补充层目录下的全部文件（按文件名排序，确定）。格式不对一律抛错，指出文件和行号。 */
export function loadOverlay(dir: string = OVERLAY_DIR): RowSet[] {
  if (!existsSync(dir)) return []
  const out: RowSet[] = []
  for (const name of readdirSync(dir).filter((f) => f.endsWith('.json') && !f.startsWith('_')).sort()) {
    const raw = JSON.parse(readFileSync(join(dir, name), 'utf8')) as { rows?: Array<Record<string, unknown>> }
    const parsed = overlayFileSchema.safeParse(raw)
    if (!parsed.success) throw new Error(`补充层 ${name} 格式不对：${parsed.error.issues.slice(0, 5).map((i) => `${i.path.join('/')}：${i.message}`).join('；')}`)
    const rawRows = Array.isArray(raw.rows) ? raw.rows : []
    out.push({ file: `overlay/${name}`, rows: overlayToRows(parsed.data, (i) => 'before' in (rawRows[i] ?? {})) })
  }
  return out
}
